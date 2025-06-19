import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import { AppError } from './error';

// 配置存儲
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // 生成唯一的文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// 文件過濾器
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // 只允許圖片文件
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new AppError('請上傳圖片文件', 400));
  }
};

// 配置 multer
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 限制文件大小為 5MB
  },
});

// 處理多個文件上傳的錯誤
export const handleMulterError = (err: any, req: Request) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return new AppError('文件大小不能超過 5MB', 400);
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return new AppError('超出允許的文件數量', 400);
    }
    return new AppError('文件上傳失敗', 400);
  }
  return err;
}; 