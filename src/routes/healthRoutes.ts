import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: 健康檢查端點
 *     description: 檢查 API 服務和資料庫連接狀態
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: 服務正常運行
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ok"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   description: 服務運行時間（秒）
 *                 database:
 *                   type: string
 *                   example: "connected"
 *       503:
 *         description: 服務異常
 */
router.get('/', async (req, res) => {
  try {
    // 檢查資料庫連接
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    const healthStatus = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbStatus,
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0'
    };

    // 如果資料庫未連接，返回 503 狀態
    if (dbStatus !== 'connected') {
      return res.status(503).json({
        ...healthStatus,
        status: 'error',
        message: 'Database connection failed'
      });
    }

    res.status(200).json(healthStatus);
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 