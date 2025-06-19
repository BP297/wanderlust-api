import express from 'express';
import {
  sendMessage,
  replyMessage,
  getMyMessages,
  markAsRead,
  deleteMessage
} from '../controllers/messageController';
import { protect } from '../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * /api/messages:
 *   post:
 *     tags: [訊息]
 *     summary: 發送訊息
 *     description: 向其他使用者發送訊息
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - receiverId
 *               - content
 *             properties:
 *               receiverId:
 *                 type: string
 *                 description: 接收者 ID
 *               hotelId:
 *                 type: string
 *                 description: 相關飯店 ID（選填）
 *               content:
 *                 type: string
 *                 description: 訊息內容
 *     responses:
 *       201:
 *         description: 成功發送訊息
 *       401:
 *         description: 未授權的訪問
 *       404:
 *         description: 找不到接收者
 */
router.post('/', protect, sendMessage);

/**
 * @swagger
 * /api/messages/{id}/reply:
 *   post:
 *     tags: [訊息]
 *     summary: 回覆訊息
 *     description: 回覆特定訊息
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 原始訊息 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: 回覆內容
 *     responses:
 *       201:
 *         description: 成功回覆訊息
 *       401:
 *         description: 未授權的訪問
 *       404:
 *         description: 找不到原始訊息
 */
router.post('/:id/reply', protect, replyMessage);

/**
 * @swagger
 * /api/messages:
 *   get:
 *     tags: [訊息]
 *     summary: 取得我的訊息
 *     description: 取得當前使用者的所有訊息
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功取得訊息列表
 *       401:
 *         description: 未授權的訪問
 */
router.get('/', protect, getMyMessages);

/**
 * @swagger
 * /api/messages/{id}/read:
 *   patch:
 *     tags: [訊息]
 *     summary: 標記訊息為已讀
 *     description: 將特定訊息標記為已讀
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 訊息 ID
 *     responses:
 *       200:
 *         description: 成功標記訊息為已讀
 *       401:
 *         description: 未授權的訪問
 *       403:
 *         description: 無權限標記此訊息
 *       404:
 *         description: 找不到訊息
 */
router.patch('/:id/read', protect, markAsRead);

/**
 * @swagger
 * /api/messages/{id}:
 *   delete:
 *     tags: [訊息]
 *     summary: 刪除訊息
 *     description: 刪除特定訊息
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 訊息 ID
 *     responses:
 *       200:
 *         description: 成功刪除訊息
 *       401:
 *         description: 未授權的訪問
 *       403:
 *         description: 無權限刪除此訊息
 *       404:
 *         description: 找不到訊息
 */
router.delete('/:id', protect, deleteMessage);

export default router; 