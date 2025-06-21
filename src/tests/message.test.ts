import request from 'supertest';
import mongoose from 'mongoose';
import app from '../index';
import { User } from '../models/user.model';
import { Hotel } from '../models/hotel.model';
import { Message } from '../models/message.model';

describe('訊息 API 測試', () => {
  let userToken: string;
  let operatorToken: string;
  let userId: string;
  let operatorId: string;
  let hotelId: string;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/wanderlust-test');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Hotel.deleteMany({});
    await Message.deleteMany({});

    // 創建測試用戶
    const userData = {
      email: 'user@example.com',
      password: 'password123',
      name: '測試用戶',
      role: 'user'
    };

    const operatorData = {
      email: 'operator@wanderlust.com',
      password: 'password123',
      name: '員工用戶',
      role: 'operator',
      signupCode: process.env.EMPLOYEE_SIGNUP_CODE || 'WANDERLUST2024'
    };

    // 註冊用戶
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send(userData);

    const operatorResponse = await request(app)
      .post('/api/auth/register')
      .send(operatorData);

    userId = userResponse.body.user._id;
    operatorId = operatorResponse.body.user._id;

    // 登入獲取 token
    const userLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'user@example.com',
        password: 'password123'
      });

    const operatorLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'operator@wanderlust.com',
        password: 'password123'
      });

    userToken = userLogin.body.token;
    operatorToken = operatorLogin.body.token;

    // 創建測試飯店
    const hotel = await Hotel.create({
      name: '台北大飯店',
      description: '位於台北市中心的豪華飯店',
      location: '台北, 台灣',
      price: 3000,
      rating: 4.5,
      amenities: ['WiFi', '健身房', '游泳池'],
      images: ['hotel1.jpg'],
      isAvailable: true
    });

    hotelId = hotel._id.toString();
  });

  describe('POST /api/messages', () => {
    it('用戶應該能夠發送訊息給員工', async () => {
      const messageData = {
        hotelId: hotelId,
        subject: '詢問飯店詳情',
        content: '請問這個飯店有提供機場接送服務嗎？',
        type: 'inquiry'
      };

      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${userToken}`)
        .send(messageData)
        .expect(201);

      expect(response.body).toHaveProperty('subject', messageData.subject);
      expect(response.body).toHaveProperty('content', messageData.content);
      expect(response.body).toHaveProperty('sender', userId);
      expect(response.body).toHaveProperty('hotel', hotelId);
    });

    it('員工應該能夠回覆用戶訊息', async () => {
      // 先創建一個用戶訊息
      const userMessage = await Message.create({
        sender: userId,
        recipient: operatorId,
        hotel: hotelId,
        subject: '詢問飯店詳情',
        content: '請問這個飯店有提供機場接送服務嗎？',
        type: 'inquiry'
      });

      const replyData = {
        parentMessageId: userMessage._id,
        subject: '回覆：機場接送服務',
        content: '是的，我們提供機場接送服務，費用為 NT$ 500。',
        type: 'reply'
      };

      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send(replyData)
        .expect(201);

      expect(response.body).toHaveProperty('subject', replyData.subject);
      expect(response.body).toHaveProperty('sender', operatorId);
      expect(response.body).toHaveProperty('recipient', userId);
    });

    it('未登入用戶不應該能夠發送訊息', async () => {
      const messageData = {
        hotelId: hotelId,
        subject: '詢問飯店詳情',
        content: '請問這個飯店有提供機場接送服務嗎？',
        type: 'inquiry'
      };

      const response = await request(app)
        .post('/api/messages')
        .send(messageData)
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('需要認證');
    });

    it('應該驗證必要的欄位', async () => {
      const messageData = {
        subject: '詢問飯店詳情'
        // 缺少 content 和 hotelId
      };

      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${userToken}`)
        .send(messageData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/messages', () => {
    beforeEach(async () => {
      // 創建測試訊息
      await Message.create([
        {
          sender: userId,
          recipient: operatorId,
          hotel: hotelId,
          subject: '詢問飯店詳情',
          content: '請問這個飯店有提供機場接送服務嗎？',
          type: 'inquiry'
        },
        {
          sender: operatorId,
          recipient: userId,
          hotel: hotelId,
          subject: '回覆：機場接送服務',
          content: '是的，我們提供機場接送服務。',
          type: 'reply'
        }
      ]);
    });

    it('用戶應該能夠查看自己的訊息', async () => {
      const response = await request(app)
        .get('/api/messages')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('messages');
      expect(response.body.messages).toHaveLength(2);
    });

    it('員工應該能夠查看所有訊息', async () => {
      const response = await request(app)
        .get('/api/messages')
        .set('Authorization', `Bearer ${operatorToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('messages');
      expect(response.body.messages).toHaveLength(2);
    });

    it('應該支援分頁功能', async () => {
      const response = await request(app)
        .get('/api/messages?page=1&limit=1')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.messages).toHaveLength(1);
      expect(response.body).toHaveProperty('pagination');
    });

    it('應該支援訊息類型篩選', async () => {
      const response = await request(app)
        .get('/api/messages?type=inquiry')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.messages).toHaveLength(1);
      expect(response.body.messages[0]).toHaveProperty('type', 'inquiry');
    });
  });

  describe('GET /api/messages/:id', () => {
    let messageId: string;

    beforeEach(async () => {
      const message = await Message.create({
        sender: userId,
        recipient: operatorId,
        hotel: hotelId,
        subject: '詢問飯店詳情',
        content: '請問這個飯店有提供機場接送服務嗎？',
        type: 'inquiry'
      });

      messageId = message._id.toString();
    });

    it('應該獲取特定訊息詳情', async () => {
      const response = await request(app)
        .get(`/api/messages/${messageId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('subject', '詢問飯店詳情');
      expect(response.body).toHaveProperty('content');
      expect(response.body).toHaveProperty('sender');
    });

    it('應該處理不存在的訊息 ID', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      
      const response = await request(app)
        .get(`/api/messages/${fakeId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('訊息不存在');
    });

    it('用戶不應該能夠查看不屬於自己的訊息', async () => {
      // 創建另一個用戶
      const anotherUser = await User.create({
        email: 'another@example.com',
        password: 'password123',
        name: '另一個用戶',
        role: 'user'
      });

      const anotherUserLogin = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'another@example.com',
          password: 'password123'
        });

      const anotherUserToken = anotherUserLogin.body.token;

      const response = await request(app)
        .get(`/api/messages/${messageId}`)
        .set('Authorization', `Bearer ${anotherUserToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('權限不足');
    });
  });

  describe('DELETE /api/messages/:id', () => {
    let messageId: string;

    beforeEach(async () => {
      const message = await Message.create({
        sender: userId,
        recipient: operatorId,
        hotel: hotelId,
        subject: '詢問飯店詳情',
        content: '請問這個飯店有提供機場接送服務嗎？',
        type: 'inquiry'
      });

      messageId = message._id.toString();
    });

    it('員工應該能夠刪除任何訊息', async () => {
      await request(app)
        .delete(`/api/messages/${messageId}`)
        .set('Authorization', `Bearer ${operatorToken}`)
        .expect(200);

      // 確認訊息已被刪除
      const response = await request(app)
        .get(`/api/messages/${messageId}`)
        .set('Authorization', `Bearer ${operatorToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('訊息不存在');
    });

    it('用戶應該能夠刪除自己發送的訊息', async () => {
      await request(app)
        .delete(`/api/messages/${messageId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      // 確認訊息已被刪除
      const response = await request(app)
        .get(`/api/messages/${messageId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('訊息不存在');
    });

    it('用戶不應該能夠刪除不屬於自己的訊息', async () => {
      // 創建另一個用戶發送的訊息
      const anotherUser = await User.create({
        email: 'another@example.com',
        password: 'password123',
        name: '另一個用戶',
        role: 'user'
      });

      const anotherMessage = await Message.create({
        sender: anotherUser._id,
        recipient: operatorId,
        hotel: hotelId,
        subject: '另一個用戶的訊息',
        content: '這是另一個用戶的訊息',
        type: 'inquiry'
      });

      const response = await request(app)
        .delete(`/api/messages/${anotherMessage._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('權限不足');
    });
  });
}); 