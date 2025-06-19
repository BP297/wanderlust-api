import { Request, Response, NextFunction } from 'express';
import { Message } from '../models/message.model';
import { User } from '../models/user.model';
import { AppError } from '../middleware/error';

// 發送消息
export const sendMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { receiverId, hotelId, content } = req.body;

    // 檢查接收者是否存在
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return next(new AppError('接收者不存在', 404));
    }

    // 創建新消息
    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      hotel: hotelId,
      content,
    });

    // 填充發送者和接收者信息
    await message.populate(['sender', 'receiver', 'hotel']);

    res.status(201).json({
      status: 'success',
      data: {
        message,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 獲取與特定用戶的對話
export const getConversation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    
    // 獲取雙方之間的所有消息
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id },
      ],
    })
    .sort({ createdAt: 1 })
    .populate(['sender', 'receiver', 'hotel']);

    res.status(200).json({
      status: 'success',
      results: messages.length,
      data: {
        messages,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 獲取所有對話列表
export const getConversations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 獲取用戶參與的所有消息
    const messages = await Message.find({
      $or: [
        { sender: req.user._id },
        { receiver: req.user._id },
      ],
    })
    .sort({ createdAt: -1 })
    .populate(['sender', 'receiver', 'hotel']);

    // 整理對話列表
    const conversations = messages.reduce((acc: any[], message) => {
      const otherUser = message.sender._id.toString() === req.user._id.toString()
        ? message.receiver
        : message.sender;
      
      const existingConv = acc.find(
        conv => conv.user._id.toString() === otherUser._id.toString()
      );

      if (!existingConv) {
        acc.push({
          user: otherUser,
          lastMessage: message,
          unreadCount: message.receiver._id.toString() === req.user._id.toString() && !message.read ? 1 : 0,
        });
      } else {
        if (message.receiver._id.toString() === req.user._id.toString() && !message.read) {
          existingConv.unreadCount += 1;
        }
      }

      return acc;
    }, []);

    res.status(200).json({
      status: 'success',
      results: conversations.length,
      data: {
        conversations,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 標記消息為已讀
export const markAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return next(new AppError('找不到該消息', 404));
    }

    // 檢查是否為接收者
    if (message.receiver.toString() !== req.user._id.toString()) {
      return next(new AppError('您沒有權限執行此操作', 403));
    }

    message.read = true;
    await message.save();

    res.status(200).json({
      status: 'success',
      data: {
        message,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 刪除消息
export const deleteMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return next(new AppError('找不到該消息', 404));
    }

    // 檢查是否為發送者或接收者
    if (
      message.sender.toString() !== req.user._id.toString() &&
      message.receiver.toString() !== req.user._id.toString()
    ) {
      return next(new AppError('您沒有權限執行此操作', 403));
    }

    await message.deleteOne();

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
}; 