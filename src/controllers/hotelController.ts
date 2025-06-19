import { Request, Response, NextFunction } from 'express';
import Hotel from '../models/Hotel';
import User from '../models/User';
import { AppError } from '../middleware/error';

// 建立新飯店
export const createHotel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== 'operator') {
      return next(new AppError('只有營運商可以建立飯店', 403));
    }

    const hotel = await Hotel.create({
      ...req.body,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      data: { hotel }
    });
  } catch (error) {
    next(error);
  }
};

// 取得所有飯店
export const getAllHotels = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { city, minPrice, maxPrice, amenities } = req.query;
    const filter: any = {};

    if (city) {
      filter['location.city'] = new RegExp(city as string, 'i');
    }

    if (minPrice || maxPrice) {
      filter.pricePerNight = {};
      if (minPrice) filter.pricePerNight.$gte = Number(minPrice);
      if (maxPrice) filter.pricePerNight.$lte = Number(maxPrice);
    }

    if (amenities) {
      filter.amenities = { $all: (amenities as string).split(',') };
    }

    const hotels = await Hotel.find(filter);

    res.status(200).json({
      success: true,
      data: { hotels }
    });
  } catch (error) {
    next(error);
  }
};

// 取得單一飯店
export const getHotel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return next(new AppError('找不到該飯店', 404));
    }

    res.status(200).json({
      success: true,
      data: { hotel }
    });
  } catch (error) {
    next(error);
  }
};

// 更新飯店
export const updateHotel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== 'operator') {
      return next(new AppError('只有營運商可以更新飯店資訊', 403));
    }

    const hotel = await Hotel.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!hotel) {
      return next(new AppError('找不到該飯店或無權限更新', 404));
    }

    res.status(200).json({
      success: true,
      data: { hotel }
    });
  } catch (error) {
    next(error);
  }
};

// 刪除飯店
export const deleteHotel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== 'operator') {
      return next(new AppError('只有營運商可以刪除飯店', 403));
    }

    const hotel = await Hotel.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id
    });

    if (!hotel) {
      return next(new AppError('找不到該飯店或無權限刪除', 404));
    }

    res.status(200).json({
      success: true,
      data: null
    });
  } catch (error) {
    next(error);
  }
};

// 新增評論
export const addReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return next(new AppError('找不到該飯店', 404));
    }

    if (!req.user) {
      return next(new AppError('請先登入', 401));
    }

    const review = {
      user: req.user.id,
      rating: req.body.rating,
      comment: req.body.comment,
      date: new Date()
    };

    hotel.reviews.push(review);

    // 更新平均評分
    const totalRating = hotel.reviews.reduce((sum, item) => sum + item.rating, 0);
    hotel.rating = totalRating / hotel.reviews.length;

    await hotel.save();

    res.status(201).json({
      success: true,
      data: { hotel }
    });
  } catch (error) {
    next(error);
  }
};

// 新增到收藏
export const addToFavorites = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError('請先登入', 401));
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new AppError('找不到使用者', 404));
    }

    const hotelId = req.params.id;
    if (!user.favorites.includes(hotelId)) {
      user.favorites.push(hotelId);
      await user.save();
    }

    res.status(200).json({
      success: true,
      data: { favorites: user.favorites }
    });
  } catch (error) {
    next(error);
  }
};

// 從收藏移除
export const removeFromFavorites = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError('請先登入', 401));
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new AppError('找不到使用者', 404));
    }

    const hotelId = req.params.id;
    user.favorites = user.favorites.filter(id => id.toString() !== hotelId);
    await user.save();

    res.status(200).json({
      success: true,
      data: { favorites: user.favorites }
    });
  } catch (error) {
    next(error);
  }
}; 