import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export interface IUser extends mongoose.Document {
  email: string;
  password: string;
  name: string;
  role: 'user' | 'operator';
  profileImage?: string;
  favorites: string[];
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  refreshToken?: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateVerificationToken(): Promise<string>;
  generatePasswordResetToken(): Promise<string>;
  incrementLoginAttempts(): Promise<void>;
}

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, '請提供電子郵件'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, '請提供有效的電子郵件']
  },
  password: {
    type: String,
    required: [true, '請提供密碼'],
    minlength: [8, '密碼長度至少為8個字符'],
    select: false
  },
  name: {
    type: String,
    required: [true, '請提供名稱'],
    trim: true,
    maxlength: [50, '名稱不能超過50個字符']
  },
  role: {
    type: String,
    enum: ['user', 'operator'],
    default: 'user'
  },
  profileImage: {
    type: String
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel'
  }],
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  refreshToken: String
}, {
  timestamps: true
});

// 密碼加密
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// 密碼比對
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// 生成電子郵件驗證 Token
userSchema.methods.generateVerificationToken = async function(): Promise<string> {
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
    
  this.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 小時後過期
  
  await this.save();
  return verificationToken;
};

// 生成密碼重置 Token
userSchema.methods.generatePasswordResetToken = async function(): Promise<string> {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  this.passwordResetExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 小時後過期
  
  await this.save();
  return resetToken;
};

// 增加登入嘗試次數
userSchema.methods.incrementLoginAttempts = async function(): Promise<void> {
  // 如果帳戶已被鎖定且鎖定時間未到，直接返回
  if (this.lockUntil && this.lockUntil > new Date()) {
    return;
  }
  
  // 增加登入嘗試次數
  this.loginAttempts += 1;
  
  // 如果超過最大嘗試次數，鎖定帳戶
  if (this.loginAttempts >= Number(process.env.MAX_LOGIN_ATTEMPTS || 5)) {
    this.lockUntil = new Date(Date.now() + Number(process.env.LOGIN_WINDOW_MS || 900000));
  }
  
  await this.save();
};

// 重置登入嘗試次數
userSchema.methods.resetLoginAttempts = async function(): Promise<void> {
  this.loginAttempts = 0;
  this.lockUntil = undefined;
  await this.save();
};

export default mongoose.model<IUser>('User', userSchema);