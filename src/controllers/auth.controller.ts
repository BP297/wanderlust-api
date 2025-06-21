import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User, IUser } from '../models/user.model';
import { generateToken } from '../utils/jwt';
import { ApiResponse } from '../types';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, role, signupCode } = req.body;

    // 檢查是否已存在用戶
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '此電子郵件已被註冊',
      } as ApiResponse);
    }

    // 如果是員工註冊，檢查註冊碼
    if (role === 'operator') {
      const validSignupCode = process.env.SIGNUP_CODE || 'OPERATOR2024';
      if (signupCode !== validSignupCode) {
        return res.status(400).json({
          success: false,
          message: '無效的員工註冊碼',
        } as ApiResponse);
      }
    }

    // 加密密碼
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 創建用戶
    const user = new User({
      email,
      password: hashedPassword,
      name,
      role: role || 'user',
    });

    await user.save();

    // 生成 JWT token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // 移除密碼後返回用戶資料
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      data: {
        user: userResponse,
        token,
      },
      message: '註冊成功',
    } as ApiResponse);
  } catch (error) {
    console.error('註冊錯誤:', error);
    res.status(500).json({
      success: false,
      message: '註冊失敗',
    } as ApiResponse);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 查找用戶
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '無效的電子郵件或密碼',
      } as ApiResponse);
    }

    // 驗證密碼
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '無效的電子郵件或密碼',
      } as ApiResponse);
    }

    // 生成 JWT token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // 移除密碼後返回用戶資料
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      data: {
        user: userResponse,
        token,
      },
      message: '登入成功',
    } as ApiResponse);
  } catch (error) {
    console.error('登入錯誤:', error);
    res.status(500).json({
      success: false,
      message: '登入失敗',
    } as ApiResponse);
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user?.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用戶不存在',
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: user,
    } as ApiResponse);
  } catch (error) {
    console.error('獲取個人資料錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取個人資料失敗',
    } as ApiResponse);
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;
    const userId = req.user?.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用戶不存在',
      } as ApiResponse);
    }

    // 更新用戶資料
    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      data: userResponse,
      message: '個人資料更新成功',
    } as ApiResponse);
  } catch (error) {
    console.error('更新個人資料錯誤:', error);
    res.status(500).json({
      success: false,
      message: '更新個人資料失敗',
    } as ApiResponse);
  }
}; 