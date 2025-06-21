import request from 'supertest';
import mongoose from 'mongoose';
import app from '../index';
import { User } from '../models/user.model';

describe('認證 API 測試', () => {
  beforeAll(async () => {
    // 連接到測試資料庫
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/wanderlust-test');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // 清理測試資料
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('應該成功註冊新用戶', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: '測試用戶',
        role: 'user'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', userData.email);
      expect(response.body.user).toHaveProperty('name', userData.name);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('應該成功註冊員工用戶（使用註冊碼）', async () => {
      const employeeData = {
        email: 'employee@wanderlust.com',
        password: 'password123',
        name: '員工用戶',
        role: 'operator',
        signupCode: process.env.EMPLOYEE_SIGNUP_CODE || 'WANDERLUST2024'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(employeeData)
        .expect(201);

      expect(response.body.user).toHaveProperty('role', 'operator');
    });

    it('應該拒絕重複的電子郵件註冊', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: '測試用戶',
        role: 'user'
      };

      // 第一次註冊
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // 第二次註冊相同電子郵件
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('電子郵件已存在');
    });

    it('應該拒絕無效的員工註冊碼', async () => {
      const employeeData = {
        email: 'employee@wanderlust.com',
        password: 'password123',
        name: '員工用戶',
        role: 'operator',
        signupCode: 'INVALID_CODE'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(employeeData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('無效的註冊碼');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // 創建測試用戶
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: '測試用戶',
        role: 'user'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData);
    });

    it('應該成功登入', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', loginData.email);
    });

    it('應該拒絕錯誤的密碼', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('無效的憑證');
    });

    it('應該拒絕不存在的用戶', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('無效的憑證');
    });
  });

  describe('GET /api/auth/profile', () => {
    let token: string;

    beforeEach(async () => {
      // 創建並登入用戶
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: '測試用戶',
        role: 'user'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData);

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      token = loginResponse.body.token;
    });

    it('應該獲取用戶資料', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('email', 'test@example.com');
      expect(response.body).toHaveProperty('name', '測試用戶');
      expect(response.body).not.toHaveProperty('password');
    });

    it('應該拒絕無效的 token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('無效的 token');
    });
  });
}); 