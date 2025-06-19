import mongoose from 'mongoose';

export interface IHotel extends mongoose.Document {
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  price: number;
  rating: number;
  amenities: string[];
  images: string[];
  rooms: {
    type: string;
    price: number;
    available: number;
  }[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

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
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  country: {
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
  rooms: [{
    type: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    available: {
      type: Number,
      required: true,
      min: 0,
    },
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// 添加索引以提升搜尋效能
hotelSchema.index({ city: 1 });
hotelSchema.index({ price: 1 });
hotelSchema.index({ rating: -1 });

export const Hotel = mongoose.model<IHotel>('Hotel', hotelSchema); 