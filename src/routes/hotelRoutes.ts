import express from 'express';
import {
  createHotel,
  getAllHotels,
  getHotel,
  updateHotel,
  deleteHotel,
  addReview,
  addToFavorites,
  removeFromFavorites
} from '../controllers/hotelController';
import { protect, authorize } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = express.Router();

/**
 * @swagger
 * /api/hotels:
 *   post:
 *     tags: [飯店]
 *     summary: 建立新飯店
 *     description: 營運商建立新的飯店資訊
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - location
 *               - pricePerNight
 *             properties:
 *               name:
 *                 type: string
 *                 description: 飯店名稱
 *               description:
 *                 type: string
 *                 description: 飯店描述
 *               location:
 *                 type: object
 *                 properties:
 *                   city:
 *                     type: string
 *                     description: 城市
 *                   address:
 *                     type: string
 *                     description: 詳細地址
 *               pricePerNight:
 *                 type: number
 *                 description: 每晚價格
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 設施列表
 *     responses:
 *       201:
 *         description: 成功建立飯店
 *       401:
 *         description: 未授權的訪問
 *       403:
 *         description: 無權限執行此操作
 */
router.post('/', protect, authorize('operator'), upload.array('images', 5), createHotel);

/**
 * @swagger
 * /api/hotels:
 *   get:
 *     tags: [飯店]
 *     summary: 取得所有飯店
 *     description: 取得所有飯店資訊，支援篩選
 *     parameters:
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: 依城市篩選
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: 最低價格
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: 最高價格
 *       - in: query
 *         name: amenities
 *         schema:
 *           type: string
 *         description: 設施篩選（逗號分隔）
 *     responses:
 *       200:
 *         description: 成功取得飯店列表
 */
router.get('/', getAllHotels);

/**
 * @swagger
 * /api/hotels/{id}:
 *   get:
 *     tags: [飯店]
 *     summary: 取得單一飯店
 *     description: 依據 ID 取得特定飯店的詳細資訊
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 飯店 ID
 *     responses:
 *       200:
 *         description: 成功取得飯店資訊
 *       404:
 *         description: 找不到該飯店
 */
router.get('/:id', getHotel);

/**
 * @swagger
 * /api/hotels/{id}:
 *   patch:
 *     tags: [飯店]
 *     summary: 更新飯店資訊
 *     description: 營運商更新特定飯店的資訊
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 飯店 ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               pricePerNight:
 *                 type: number
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: 成功更新飯店資訊
 *       401:
 *         description: 未授權的訪問
 *       403:
 *         description: 無權限執行此操作
 *       404:
 *         description: 找不到該飯店
 */
router.patch('/:id', protect, authorize('operator'), upload.array('images', 5), updateHotel);

/**
 * @swagger
 * /api/hotels/{id}:
 *   delete:
 *     tags: [飯店]
 *     summary: 刪除飯店
 *     description: 營運商刪除特定飯店
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 飯店 ID
 *     responses:
 *       200:
 *         description: 成功刪除飯店
 *       401:
 *         description: 未授權的訪問
 *       403:
 *         description: 無權限執行此操作
 *       404:
 *         description: 找不到該飯店
 */
router.delete('/:id', protect, authorize('operator'), deleteHotel);

/**
 * @swagger
 * /api/hotels/{id}/reviews:
 *   post:
 *     tags: [飯店]
 *     summary: 新增評論
 *     description: 使用者為飯店新增評論
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 飯店 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *               - comment
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 description: 評分（1-5）
 *               comment:
 *                 type: string
 *                 description: 評論內容
 *     responses:
 *       201:
 *         description: 成功新增評論
 *       401:
 *         description: 未授權的訪問
 *       404:
 *         description: 找不到該飯店
 */
router.post('/:id/reviews', protect, addReview);

/**
 * @swagger
 * /api/hotels/{id}/favorites:
 *   post:
 *     tags: [飯店]
 *     summary: 新增到收藏
 *     description: 將飯店加入使用者的收藏清單
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 飯店 ID
 *     responses:
 *       200:
 *         description: 成功加入收藏
 *       401:
 *         description: 未授權的訪問
 *       404:
 *         description: 找不到該飯店
 */
router.post('/:id/favorites', protect, addToFavorites);

/**
 * @swagger
 * /api/hotels/{id}/favorites:
 *   delete:
 *     tags: [飯店]
 *     summary: 從收藏移除
 *     description: 將飯店從使用者的收藏清單中移除
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 飯店 ID
 *     responses:
 *       200:
 *         description: 成功移除收藏
 *       401:
 *         description: 未授權的訪問
 *       404:
 *         description: 找不到該飯店
 */
router.delete('/:id/favorites', protect, removeFromFavorites);

export default router; 