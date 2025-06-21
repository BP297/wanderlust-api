#!/usr/bin/env node

/**
 * 測試環境設定腳本
 * 用於設定測試資料庫和環境變數
 */

const mongoose = require('mongoose');
const path = require('path');

// 由於這是 CommonJS 腳本，我們需要手動定義模型
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
  role: {
    type: String,
    enum: ['user', 'operator'],
    default: 'user',
  },
  profilePhoto: {
    type: String,
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
  }],
}, {
  timestamps: true,
});

const hotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  amenities: [{
    type: String,
  }],
  images: [{
    type: String,
  }],
  isAvailable: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
  },
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['inquiry', 'reply', 'notification'],
    default: 'inquiry',
  },
  parentMessageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
  },
  isRead: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);
const Hotel = mongoose.model('Hotel', hotelSchema);
const Message = mongoose.model('Message', messageSchema);

async function setupTestDatabase() {
  try {
    // 連接到測試資料庫
    const testDbUri = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/wanderlust-test';
    await mongoose.connect(testDbUri);
    
    console.log('Connected to test database');

    // 清理測試資料
    await User.deleteMany({});
    await Hotel.deleteMany({});
    await Message.deleteMany({});

    console.log('Test database cleaned');

    // 創建測試資料
    const testUser = await User.create({
      email: 'test@example.com',
      password: 'password123',
      name: '測試用戶',
      role: 'user'
    });

    const testOperator = await User.create({
      email: 'operator@wanderlust.com',
      password: 'password123',
      name: '測試員工',
      role: 'operator'
    });

    const testHotels = await Hotel.create([
      {
        name: '台北大飯店',
        description: '位於台北市中心的豪華飯店',
        location: '台北, 台灣',
        price: 3000,
        rating: 4.5,
        amenities: ['WiFi', '健身房', '游泳池'],
        images: ['hotel1.jpg'],
        isAvailable: true
      },
      {
        name: '高雄海景飯店',
        description: '享受高雄港美景的精品飯店',
        location: '高雄, 台灣',
        price: 2500,
        rating: 4.2,
        amenities: ['WiFi', '餐廳', '停車場'],
        images: ['hotel2.jpg'],
        isAvailable: true
      }
    ]);

    console.log('Test data created successfully');
    console.log(`Created ${testUser.email} (user)`);
    console.log(`Created ${testOperator.email} (operator)`);
    console.log(`Created ${testHotels.length} hotels`);

    await mongoose.connection.close();
    console.log('Test database setup completed');
    
  } catch (error) {
    console.error('Error setting up test database:', error);
    process.exit(1);
  }
}

// 如果直接執行此腳本
if (require.main === module) {
  setupTestDatabase();
}

module.exports = { setupTestDatabase }; 