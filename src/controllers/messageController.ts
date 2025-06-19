import { Request, Response, NextFunction } from 'express';
import Message from '../models/Message';
import User from '../models/User';
import { AppError } from '../middleware/error';

// 發送訊息
export const sendMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError('請先登入', 401));
    }

    const { receiverId, hotelId, content } = req.body;

    // 檢查接收者是否存在
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return next(new AppError('找不到接收者', 404));
    }

    const message = await Message.create({
      sender: req.user.id,
      receiver: receiverId,
      hotel: hotelId,
      content
    });

    res.status(201).json({
      success: true,
      data: { message }
    });
  } catch (error) {
    next(error);
  }
};

// 回覆訊息
export const replyMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError('請先登入', 401));
    }

    const { content } = req.body;
    const parentMessageId = req.params.id;

    // 檢查原始訊息是否存在
    const parentMessage = await Message.findById(parentMessageId);
    if (!parentMessage) {
      return next(new AppError('找不到原始訊息', 404));
    }

    // 檢查使用者是否為訊息的接收者
    if (parentMessage.receiver.toString() !== req.user.id) {
      return next(new AppError('無權限回覆此訊息', 403));
    }

    const message = await Message.create({
      sender: req.user.id,
      receiver: parentMessage.sender,
      hotel: parentMessage.hotel,
      content,
      parentMessage: parentMessageId
    });

    res.status(201).json({
      success: true,
      data: { message }
    });
  } catch (error) {
    next(error);
  }
};

// 取得使用者的所有訊息
export const getMyMessages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError('請先登入', 401));
    }

    const messages = await Message.find({
      $or: [
        { sender: req.user.id },
        { receiver: req.user.id }
      ]
    })
    .populate('sender', 'name')
    .populate('receiver', 'name')
    .populate('hotel', 'name')
    .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: { messages }
    });
  } catch (error) {
    next(error);
  }
};

// 標記訊息為已讀
export const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError('請先登入', 401));
    }

    const message = await Message.findById(req.params.id);
    if (!message) {
      return next(new AppError('找不到訊息', 404));
    }

    // 檢查使用者是否為訊息的接收者
    if (message.receiver.toString() !== req.user.id) {
      return next(new AppError('無權限標記此訊息', 403));
    }

    message.isRead = true;
    await message.save();

    res.status(200).json({
      success: true,
      data: { message }
    });
  } catch (error) {
    next(error);
  }
};

// 刪除訊息
export const deleteMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError('請先登入', 401));
    }

    const message = await Message.findById(req.params.id);
    if (!message) {
      return next(new AppError('找不到訊息', 404));
    }

    // 檢查使用者是否為訊息的發送者或接收者
    if (message.sender.toString() !== req.user.id && 
        message.receiver.toString() !== req.user.id) {
      return next(new AppError('無權限刪除此訊息', 403));
    }

    await message.deleteOne();

    res.status(200).json({
      success: true,
      data: null
    });
  } catch (error) {
    next(error);
  }
}; 