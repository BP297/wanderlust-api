import express from 'express';
import {
  sendMessage,
  getConversation,
  getConversations,
  markAsRead,
  deleteMessage,
} from '../controllers/message.controller';
import { protect } from '../middleware/auth';

const router = express.Router();

// 所有消息路由都需要身份驗證
router.use(protect);

/**
 * @swagger
 * /api/messages:
 *   post:
 *     tags: [Messages]
 *     summary: 發送消息
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
 *               - hotelId
 *               - content
 *             properties:
 *               receiverId:
 *                 type: string
 *                 description: 接收者ID
 *               hotelId:
 *                 type: string
 *                 description: 相關飯店ID
 *               content:
 *                 type: string
 *                 description: 消息內容
 *     responses:
 *       201:
 *         description: 成功發送消息
 *       404:
 *         description: 接收者不存在
 */
router.post('/', sendMessage);

/**
 * @swagger
 * /api/messages/conversations:
 *   get:
 *     tags: [Messages]
 *     summary: 獲取所有對話列表
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功獲取對話列表
 */
router.get('/conversations', getConversations);

/**
 * @swagger
 * /api/messages/conversation/{userId}:
 *   get:
 *     tags: [Messages]
 *     summary: 獲取與特定用戶的對話
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: 對話用戶ID
 *     responses:
 *       200:
 *         description: 成功獲取對話
 */
router.get('/conversation/:userId', getConversation);

/**
 * @swagger
 * /api/messages/{messageId}/read:
 *   patch:
 *     tags: [Messages]
 *     summary: 標記消息為已讀
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         description: 消息ID
 *     responses:
 *       200:
 *         description: 成功標記消息為已讀
 *       403:
 *         description: 沒有權限
 *       404:
 *         description: 找不到該消息
 */
router.patch('/:messageId/read', markAsRead);

/**
 * @swagger
 * /api/messages/{messageId}:
 *   delete:
 *     tags: [Messages]
 *     summary: 刪除消息
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         description: 消息ID
 *     responses:
 *       204:
 *         description: 成功刪除消息
 *       403:
 *         description: 沒有權限
 *       404:
 *         description: 找不到該消息
 */
router.delete('/:messageId', deleteMessage);

export default router; 