import express from 'express';
import {
  createHotel,
  getAllHotels,
  getHotel,
  updateHotel,
  deleteHotel,
  searchHotels,
  getFavorites,
} from '../controllers/hotel.controller';
import {
  uploadHotelImages,
  deleteHotelImage,
} from '../controllers/upload.controller';
import { protect, restrictTo } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = express.Router();

/**
 * @swagger
 * /api/hotels:
 *   get:
 *     tags: [Hotels]
 *     summary: 獲取所有飯店
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: 頁碼
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: 每頁數量
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: 排序方式 (例如: price,-rating)
 *     responses:
 *       200:
 *         description: 成功獲取飯店列表
 */
router.get('/', getAllHotels);

/**
 * @swagger
 * /api/hotels/search:
 *   get:
 *     tags: [Hotels]
 *     summary: 搜尋飯店
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: 關鍵字搜尋
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: 城市
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
 *         description: 設施 (逗號分隔)
 *     responses:
 *       200:
 *         description: 成功獲取搜尋結果
 */
router.get('/search', searchHotels);

/**
 * @swagger
 * /api/hotels/{id}:
 *   get:
 *     tags: [Hotels]
 *     summary: 獲取單個飯店
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 飯店ID
 *     responses:
 *       200:
 *         description: 成功獲取飯店資訊
 *       404:
 *         description: 找不到該飯店
 */
router.get('/:id', getHotel);

/**
 * @swagger
 * /api/hotels:
 *   post:
 *     tags: [Hotels]
 *     summary: 創建新飯店
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
 *               - address
 *               - city
 *               - country
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               country:
 *                 type: string
 *               price:
 *                 type: number
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               rooms:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                     price:
 *                       type: number
 *                     available:
 *                       type: number
 *     responses:
 *       201:
 *         description: 成功創建飯店
 *       401:
 *         description: 未授權
 */
router.post('/', protect, restrictTo('operator'), createHotel);

/**
 * @swagger
 * /api/hotels/{id}:
 *   patch:
 *     tags: [Hotels]
 *     summary: 更新飯店
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 飯店ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: 成功更新飯店
 *       401:
 *         description: 未授權
 *       404:
 *         description: 找不到該飯店
 */
router.patch('/:id', protect, updateHotel);

/**
 * @swagger
 * /api/hotels/{id}:
 *   delete:
 *     tags: [Hotels]
 *     summary: 刪除飯店
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 飯店ID
 *     responses:
 *       204:
 *         description: 成功刪除飯店
 *       401:
 *         description: 未授權
 *       404:
 *         description: 找不到該飯店
 */
router.delete('/:id', protect, deleteHotel);

/**
 * @swagger
 * /api/hotels/{hotelId}/images:
 *   post:
 *     tags: [Hotels]
 *     summary: 上傳飯店圖片
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: hotelId
 *         required: true
 *         schema:
 *           type: string
 *         description: 飯店ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: 成功上傳圖片
 *       400:
 *         description: 無效的請求
 *       403:
 *         description: 沒有權限
 *       404:
 *         description: 找不到該飯店
 */
router.post(
  '/:hotelId/images',
  protect,
  upload.array('images', 5),
  uploadHotelImages
);

/**
 * @swagger
 * /api/hotels/{hotelId}/images/{imageUrl}:
 *   delete:
 *     tags: [Hotels]
 *     summary: 刪除飯店圖片
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: hotelId
 *         required: true
 *         schema:
 *           type: string
 *         description: 飯店ID
 *       - in: path
 *         name: imageUrl
 *         required: true
 *         schema:
 *           type: string
 *         description: 圖片URL
 *     responses:
 *       204:
 *         description: 成功刪除圖片
 *       403:
 *         description: 沒有權限
 *       404:
 *         description: 找不到該飯店或圖片
 */
router.delete('/:hotelId/images/:imageUrl', protect, deleteHotelImage);

/**
 * @swagger
 * /api/hotels/favorites:
 *   get:
 *     tags: [Hotels]
 *     summary: 獲取用戶收藏的飯店列表
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功獲取收藏列表
 *       401:
 *         description: 未授權
 */
router.get('/favorites', protect, getFavorites);

export default router; 