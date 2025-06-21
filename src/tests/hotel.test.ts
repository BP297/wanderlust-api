import request from 'supertest';
import mongoose from 'mongoose';
import app from '../index';
import { User } from '../models/user.model';
import { Hotel } from '../models/hotel.model';

describe('飯店 API 測試', () => {
  let userToken: string;
  let operatorToken: string;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/wanderlust-test');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Hotel.deleteMany({});

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
    await request(app)
      .post('/api/auth/register')
      .send(userData);

    await request(app)
      .post('/api/auth/register')
      .send(operatorData);

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
  });

  describe('GET /api/hotels', () => {
    beforeEach(async () => {
      // 創建測試飯店資料
      const hotels = [
        {
          name: '台北大飯店',
          description: '位於台北市中心的豪華飯店',
          location: '台北, 台灣',
          price: 3000,
          rating: 4.5,
          amenities: ['WiFi', '健身房', '游泳池'],
          images: ['hotel1.jpg'],
          isAvailable: true
        },
        {
          name: '高雄海景飯店',
          description: '享受高雄港美景的精品飯店',
          location: '高雄, 台灣',
          price: 2500,
          rating: 4.2,
          amenities: ['WiFi', '餐廳', '停車場'],
          images: ['hotel2.jpg'],
          isAvailable: true
        }
      ];

      await Hotel.insertMany(hotels);
    });

    it('應該獲取所有飯店列表', async () => {
      const response = await request(app)
        .get('/api/hotels')
        .expect(200);

      expect(response.body).toHaveProperty('hotels');
      expect(response.body.hotels).toHaveLength(2);
      expect(response.body.hotels[0]).toHaveProperty('name', '台北大飯店');
      expect(response.body.hotels[1]).toHaveProperty('name', '高雄海景飯店');
    });

    it('應該支援搜尋功能', async () => {
      const response = await request(app)
        .get('/api/hotels?search=台北')
        .expect(200);

      expect(response.body.hotels).toHaveLength(1);
      expect(response.body.hotels[0]).toHaveProperty('name', '台北大飯店');
    });

    it('應該支援價格篩選', async () => {
      const response = await request(app)
        .get('/api/hotels?maxPrice=2800')
        .expect(200);

      expect(response.body.hotels).toHaveLength(1);
      expect(response.body.hotels[0]).toHaveProperty('name', '高雄海景飯店');
    });

    it('應該支援地點篩選', async () => {
      const response = await request(app)
        .get('/api/hotels?location=高雄')
        .expect(200);

      expect(response.body.hotels).toHaveLength(1);
      expect(response.body.hotels[0]).toHaveProperty('location', '高雄, 台灣');
    });
  });

  describe('GET /api/hotels/:id', () => {
    let hotelId: string;

    beforeEach(async () => {
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

    it('應該獲取特定飯店詳情', async () => {
      const response = await request(app)
        .get(`/api/hotels/${hotelId}`)
        .expect(200);

      expect(response.body).toHaveProperty('name', '台北大飯店');
      expect(response.body).toHaveProperty('description');
      expect(response.body).toHaveProperty('price', 3000);
    });

    it('應該處理不存在的飯店 ID', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      
      const response = await request(app)
        .get(`/api/hotels/${fakeId}`)
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('飯店不存在');
    });
  });

  describe('POST /api/hotels', () => {
    it('員工應該能夠新增飯店', async () => {
      const hotelData = {
        name: '新飯店',
        description: '新開幕的精品飯店',
        location: '台中, 台灣',
        price: 2000,
        rating: 4.0,
        amenities: ['WiFi', '餐廳'],
        images: ['newhotel.jpg']
      };

      const response = await request(app)
        .post('/api/hotels')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send(hotelData)
        .expect(201);

      expect(response.body).toHaveProperty('name', hotelData.name);
      expect(response.body).toHaveProperty('isAvailable', true);
    });

    it('一般用戶不應該能夠新增飯店', async () => {
      const hotelData = {
        name: '新飯店',
        description: '新開幕的精品飯店',
        location: '台中, 台灣',
        price: 2000
      };

      const response = await request(app)
        .post('/api/hotels')
        .set('Authorization', `Bearer ${userToken}`)
        .send(hotelData)
        .expect(403);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('權限不足');
    });

    it('未登入用戶不應該能夠新增飯店', async () => {
      const hotelData = {
        name: '新飯店',
        description: '新開幕的精品飯店',
        location: '台中, 台灣',
        price: 2000
      };

      const response = await request(app)
        .post('/api/hotels')
        .send(hotelData)
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('需要認證');
    });
  });

  describe('PUT /api/hotels/:id', () => {
    let hotelId: string;

    beforeEach(async () => {
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

    it('員工應該能夠更新飯店資訊', async () => {
      const updateData = {
        name: '台北豪華大飯店',
        price: 3500
      };

      const response = await request(app)
        .put(`/api/hotels/${hotelId}`)
        .set('Authorization', `Bearer ${operatorToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('name', '台北豪華大飯店');
      expect(response.body).toHaveProperty('price', 3500);
    });

    it('一般用戶不應該能夠更新飯店資訊', async () => {
      const updateData = {
        name: '台北豪華大飯店',
        price: 3500
      };

      const response = await request(app)
        .put(`/api/hotels/${hotelId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('權限不足');
    });
  });

  describe('DELETE /api/hotels/:id', () => {
    let hotelId: string;

    beforeEach(async () => {
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

    it('員工應該能夠刪除飯店', async () => {
      await request(app)
        .delete(`/api/hotels/${hotelId}`)
        .set('Authorization', `Bearer ${operatorToken}`)
        .expect(200);

      // 確認飯店已被刪除
      const response = await request(app)
        .get(`/api/hotels/${hotelId}`)
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('飯店不存在');
    });

    it('一般用戶不應該能夠刪除飯店', async () => {
      const response = await request(app)
        .delete(`/api/hotels/${hotelId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('權限不足');
    });
  });
}); 