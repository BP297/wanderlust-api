import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user.model';
import { generateToken } from '../utils/jwt';
import { AppError } from '../middleware/error';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, name, role } = req.body;

    // 檢查是否為營運商註冊
    if (role === 'operator') {
      const signupCode = req.body.signupCode;
      if (signupCode !== process.env.OPERATOR_SIGNUP_CODE) {
        return next(new AppError('無效的營運商註冊碼', 400));
      }
    }

    // 檢查郵箱是否已存在
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('此電子郵件已被註冊', 400));
    }

    // 創建新用戶
    const user = await User.create({
      email,
      password,
      name,
      role: role || 'user',
    });

    // 生成 JWT
    const token = generateToken(user);

    // 移除密碼後返回用戶信息
    user.password = undefined;

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    // 檢查是否提供了郵箱和密碼
    if (!email || !password) {
      return next(new AppError('請提供電子郵件和密碼', 400));
    }

    // 查找用戶並選擇密碼字段
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('電子郵件或密碼錯誤', 401));
    }

    // 生成 JWT
    const token = generateToken(user);

    // 移除密碼後返回用戶信息
    user.password = undefined;

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new AppError('用戶不存在', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name },
      { new: true, runValidators: true }
    );

    if (!user) {
      return next(new AppError('用戶不存在', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
}; 