import { Request, Response, NextFunction } from 'express';
import { Hotel } from '../models/hotel.model';
import { AppError } from '../middleware/error';
import { User } from '../models/user.model';

// 創建新飯店
export const createHotel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const hotelData = {
      ...req.body,
      createdBy: req.user._id,
    };

    const hotel = await Hotel.create(hotelData);

    res.status(201).json({
      status: 'success',
      data: {
        hotel,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 獲取所有飯店
export const getAllHotels = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = { ...req.query };
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    excludeFields.forEach(el => delete query[el]);

    // 高級過濾
    let queryStr = JSON.stringify(query);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    let queryObj = Hotel.find(JSON.parse(queryStr));

    // 排序
    if (req.query.sort) {
      const sortBy = (req.query.sort as string).split(',').join(' ');
      queryObj = queryObj.sort(sortBy);
    }

    // 分頁
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    queryObj = queryObj.skip(skip).limit(limit);

    const hotels = await queryObj;
    const total = await Hotel.countDocuments(JSON.parse(queryStr));

    res.status(200).json({
      status: 'success',
      results: hotels.length,
      total,
      data: {
        hotels,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 獲取單個飯店
export const getHotel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return next(new AppError('找不到該飯店', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        hotel,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 更新飯店
export const updateHotel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return next(new AppError('找不到該飯店', 404));
    }

    // 檢查是否為飯店創建者或管理員
    if (hotel.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'operator') {
      return next(new AppError('您沒有權限更新此飯店', 403));
    }

    const updatedHotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      status: 'success',
      data: {
        hotel: updatedHotel,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 刪除飯店
export const deleteHotel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return next(new AppError('找不到該飯店', 404));
    }

    // 檢查是否為飯店創建者或管理員
    if (hotel.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'operator') {
      return next(new AppError('您沒有權限刪除此飯店', 403));
    }

    await hotel.deleteOne();

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

// 搜尋飯店
export const searchHotels = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { keyword, city, minPrice, maxPrice, amenities } = req.query;
    
    const query: any = {};

    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
      ];
    }

    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (amenities) {
      query.amenities = {
        $all: (amenities as string).split(','),
      };
    }

    const hotels = await Hotel.find(query);

    res.status(200).json({
      status: 'success',
      results: hotels.length,
      data: {
        hotels,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 獲取用戶收藏的飯店列表
export const getFavorites = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.user._id).populate('favorites');
    if (!user) {
      return next(new AppError('找不到使用者', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        hotels: user.favorites,
      },
    });
  } catch (error) {
    next(error);
  }
}; 