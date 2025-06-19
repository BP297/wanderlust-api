import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User, { IUser } from '../models/User';
import { AppError } from '../middleware/error';
import { SignOptions } from 'jsonwebtoken';
import Email from '../utils/email';

// 產生 JWT Token
const generateToken = (id: string, secret: string, expiresIn: string): string => {
  if (!secret) {
    throw new Error('JWT secret is not defined');
  }
  
  const options: SignOptions = {
    expiresIn
  };

  return jwt.sign(
    { id },
    secret,
    options
  );
};

// 產生 Access Token 和 Refresh Token
const generateAuthTokens = (userId: string) => {
  const accessToken = generateToken(
    userId,
    process.env.JWT_SECRET!,
    process.env.JWT_EXPIRES_IN || '7d'
  );
  
  const refreshToken = generateToken(
    userId,
    process.env.JWT_REFRESH_SECRET!,
    process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  );

  return { accessToken, refreshToken };
};

// 註冊新使用者
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name, role } = req.body;

    // 檢查是否為營運商註冊
    if (role === 'operator') {
      const { operatorCode } = req.body;
      if (operatorCode !== process.env.OPERATOR_SIGNUP_CODE) {
        return next(new AppError('無效的營運商註冊碼', 400));
      }
    }

    // 檢查使用者是否已存在
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('此電子郵件已被註冊', 400));
    }

    // 建立新使用者
    const user = await User.create({
      email,
      password,
      name,
      role: role || 'user'
    }) as IUser;

    // 生成驗證 Token
    const verificationToken = await user.generateVerificationToken();
    
    // 發送驗證郵件
    await Email.sendVerificationEmail(user.email, verificationToken);

    // 產生 Token
    const { accessToken, refreshToken } = generateAuthTokens(user._id.toString());

    // 儲存 refresh token
    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      success: true,
      token: accessToken,
      refreshToken,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// 使用者登入
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // 檢查是否提供電子郵件和密碼
    if (!email || !password) {
      return next(new AppError('請提供電子郵件和密碼', 400));
    }

    // 檢查使用者是否存在
    const user = await User.findOne({ email }).select('+password') as IUser | null;
    if (!user) {
      return next(new AppError('無效的電子郵件或密碼', 401));
    }

    // 檢查帳戶是否被鎖定
    if (user.lockUntil && user.lockUntil > new Date()) {
      const waitTime = Math.ceil((user.lockUntil.getTime() - Date.now()) / 1000 / 60);
      return next(new AppError(`帳戶已被鎖定，請等待 ${waitTime} 分鐘後再試`, 401));
    }

    // 檢查密碼是否正確
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incrementLoginAttempts();
      return next(new AppError('無效的電子郵件或密碼', 401));
    }

    // 重置登入嘗試次數
    await user.resetLoginAttempts();

    // 產生新的 Token
    const { accessToken, refreshToken } = generateAuthTokens(user._id.toString());

    // 更新 refresh token
    user.refreshToken = refreshToken;
    await user.save();

    res.status(200).json({
      success: true,
      token: accessToken,
      refreshToken,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// 驗證電子郵件
export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.params;
    
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
      
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return next(new AppError('無效或已過期的驗證連結', 400));
    }
    
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: '電子郵件驗證成功'
    });
  } catch (error) {
    next(error);
  }
};

// 請求重置密碼
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError('找不到使用此電子郵件的帳戶', 404));
    }
    
    const resetToken = await user.generatePasswordResetToken();
    await Email.sendPasswordResetEmail(user.email, resetToken);
    
    res.status(200).json({
      success: true,
      message: '密碼重置郵件已發送'
    });
  } catch (error) {
    next(error);
  }
};

// 重置密碼
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
      
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return next(new AppError('無效或已過期的重置連結', 400));
    }
    
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: '密碼重置成功'
    });
  } catch (error) {
    next(error);
  }
};

// 刷新 Token
export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return next(new AppError('請提供 refresh token', 400));
    }
    
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { id: string };
    const user = await User.findById(decoded.id);
    
    if (!user || user.refreshToken !== refreshToken) {
      return next(new AppError('無效的 refresh token', 401));
    }
    
    const { accessToken, refreshToken: newRefreshToken } = generateAuthTokens(user._id.toString());
    
    user.refreshToken = newRefreshToken;
    await user.save();
    
    res.status(200).json({
      success: true,
      token: accessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    next(error);
  }
};

// 登出
export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user!.id);
    if (user) {
      user.refreshToken = undefined;
      await user.save();
    }
    
    res.status(200).json({
      success: true,
      message: '登出成功'
    });
  } catch (error) {
    next(error);
  }
};

// 取得當前使用者資料
export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) {
      return next(new AppError('找不到使用者', 404));
    }
    
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profileImage: user.profileImage,
          favorites: user.favorites,
          isEmailVerified: user.isEmailVerified
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// 更新使用者資料
export const updateMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body;
    const profileImage = req.file?.path;

    const updateData: any = { name };
    if (profileImage) {
      updateData.profileImage = profileImage;
    }

    const user = await User.findByIdAndUpdate(
      req.user!.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return next(new AppError('找不到使用者', 404));
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profileImage: user.profileImage,
          favorites: user.favorites,
          isEmailVerified: user.isEmailVerified
        }
      }
    });
  } catch (error) {
    next(error);
  }
};