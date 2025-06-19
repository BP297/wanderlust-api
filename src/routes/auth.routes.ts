import express from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
} from '../controllers/auth.controller';
import { protect } from '../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: 用戶註冊
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, operator]
 *               signupCode:
 *                 type: string
 *     responses:
 *       201:
 *         description: 註冊成功
 *       400:
 *         description: 無效的請求
 */
router.post('/register', register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: 用戶登入
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: 登入成功
 *       401:
 *         description: 登入失敗
 */
router.post('/login', login);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     tags: [Authentication]
 *     summary: 獲取用戶資料
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功獲取用戶資料
 *       401:
 *         description: 未授權
 */
router.get('/profile', protect, getProfile);

/**
 * @swagger
 * /api/auth/profile:
 *   patch:
 *     tags: [Authentication]
 *     summary: 更新用戶資料
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: 成功更新用戶資料
 *       401:
 *         description: 未授權
 */
router.patch('/profile', protect, updateProfile);

export default router; 