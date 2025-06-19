import express from "express";
import {
  register,
  login,
  getMe,
  updateMe,
  verifyEmail,
  forgotPassword,
  resetPassword,
  refreshToken,
  logout
} from "../controllers/authController";
import { protect } from "../middleware/auth";
import { upload } from "../middleware/upload";
import { validate } from "../middleware/validate";
import {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  updateProfileValidation
} from "../validations/auth.validation";

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [認證]
 *     summary: 註冊新使用者
 *     description: 註冊新的使用者帳號，可以是一般使用者或營運商
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
 *                 format: email
 *                 description: 使用者電子郵件
 *               password:
 *                 type: string
 *                 format: password
 *                 description: 使用者密碼
 *               name:
 *                 type: string
 *                 description: 使用者名稱
 *               role:
 *                 type: string
 *                 enum: [user, operator]
 *                 description: 使用者角色
 *               operatorCode:
 *                 type: string
 *                 description: 營運商註冊碼（僅營運商註冊時需要）
 *     responses:
 *       201:
 *         description: 註冊成功
 *       400:
 *         description: 無效的請求資料
 */
router.post("/register", validate(registerValidation), register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [認證]
 *     summary: 使用者登入
 *     description: 使用電子郵件和密碼登入系統
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
 *                 format: email
 *                 description: 使用者電子郵件
 *               password:
 *                 type: string
 *                 format: password
 *                 description: 使用者密碼
 *     responses:
 *       200:
 *         description: 登入成功
 *       401:
 *         description: 無效的認證資訊
 */
router.post("/login", validate(loginValidation), login);

/**
 * @swagger
 * /api/auth/verify-email/{token}:
 *   get:
 *     tags: [認證]
 *     summary: 驗證電子郵件
 *     description: 使用驗證 token 驗證使用者的電子郵件
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: 電子郵件驗證 token
 *     responses:
 *       200:
 *         description: 電子郵件驗證成功
 *       400:
 *         description: 無效或已過期的驗證連結
 */
router.get("/verify-email/:token", verifyEmail);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     tags: [認證]
 *     summary: 請求重置密碼
 *     description: 發送密碼重置郵件到使用者的電子郵件
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 使用者電子郵件
 *     responses:
 *       200:
 *         description: 密碼重置郵件已發送
 *       404:
 *         description: 找不到使用者
 */
router.post("/forgot-password", validate(forgotPasswordValidation), forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password/{token}:
 *   post:
 *     tags: [認證]
 *     summary: 重置密碼
 *     description: 使用重置 token 重置使用者密碼
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: 密碼重置 token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *                 description: 新密碼
 *     responses:
 *       200:
 *         description: 密碼重置成功
 *       400:
 *         description: 無效或已過期的重置連結
 */
router.post("/reset-password/:token", validate(resetPasswordValidation), resetPassword);

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     tags: [認證]
 *     summary: 刷新 Token
 *     description: 使用 refresh token 獲取新的 access token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token
 *     responses:
 *       200:
 *         description: Token 刷新成功
 *       401:
 *         description: 無效的 refresh token
 */
router.post("/refresh-token", refreshToken);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [認證]
 *     summary: 登出
 *     description: 使用者登出並使目前的 refresh token 失效
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 登出成功
 *       401:
 *         description: 未授權的訪問
 */
router.post("/logout", protect, logout);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags: [認證]
 *     summary: 取得當前使用者資料
 *     description: 取得已登入使用者的個人資料
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功取得使用者資料
 *       401:
 *         description: 未授權的訪問
 */
router.get("/me", protect, getMe);

/**
 * @swagger
 * /api/auth/me:
 *   patch:
 *     tags: [認證]
 *     summary: 更新使用者資料
 *     description: 更新已登入使用者的個人資料
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 新的使用者名稱
 *               profileImage:
 *                 type: string
 *                 format: binary
 *                 description: 個人頭像圖片
 *     responses:
 *       200:
 *         description: 成功更新使用者資料
 *       401:
 *         description: 未授權的訪問
 */
router.patch("/me", protect, validate(updateProfileValidation), upload.single("profileImage"), updateMe);

export default router;