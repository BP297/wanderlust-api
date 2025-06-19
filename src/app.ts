import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import authRoutes from './routes/authRoutes';
import hotelRoutes from './routes/hotelRoutes';
import messageRoutes from './routes/messageRoutes';
import { errorHandler } from './middleware/error';

const app = express();

// 中間件
app.use(cors());
app.use(express.json());

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/messages', messageRoutes);

// 錯誤處理中間件
app.use(errorHandler);

export default app; 