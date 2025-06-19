import { Request, Response, NextFunction } from 'express';
import { Hotel } from '../models/hotel.model';
import { AppError } from '../middleware/error';
import fs from 'fs';
import path from 'path';

// 上傳飯店圖片
export const uploadHotelImages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return next(new AppError('請選擇要上傳的圖片', 400));
    }

    const hotel = await Hotel.findById(req.params.hotelId);
    if (!hotel) {
      // 刪除已上傳的文件
      req.files.forEach((file: Express.Multer.File) => {
        fs.unlinkSync(file.path);
      });
      return next(new AppError('找不到該飯店', 404));
    }

    // 檢查權限
    if (hotel.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'operator') {
      // 刪除已上傳的文件
      req.files.forEach((file: Express.Multer.File) => {
        fs.unlinkSync(file.path);
      });
      return next(new AppError('您沒有權限上傳圖片', 403));
    }

    // 處理圖片路徑
    const imageUrls = req.files.map((file: Express.Multer.File) => 
      `/uploads/${path.basename(file.path)}`
    );

    // 更新飯店圖片
    hotel.images = [...hotel.images, ...imageUrls];
    await hotel.save();

    res.status(200).json({
      status: 'success',
      data: {
        images: imageUrls,
      },
    });
  } catch (error) {
    // 發生錯誤時刪除已上傳的文件
    if (req.files && Array.isArray(req.files)) {
      req.files.forEach((file: Express.Multer.File) => {
        fs.unlinkSync(file.path);
      });
    }
    next(error);
  }
};

// 刪除飯店圖片
export const deleteHotelImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { hotelId, imageUrl } = req.params;

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return next(new AppError('找不到該飯店', 404));
    }

    // 檢查權限
    if (hotel.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'operator') {
      return next(new AppError('您沒有權限刪除圖片', 403));
    }

    // 檢查圖片是否存在
    const imageIndex = hotel.images.indexOf(imageUrl);
    if (imageIndex === -1) {
      return next(new AppError('找不到該圖片', 404));
    }

    // 刪除文件
    const filePath = path.join(__dirname, '../../', imageUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // 從數組中移除圖片 URL
    hotel.images.splice(imageIndex, 1);
    await hotel.save();

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
}; 