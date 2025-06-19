import mongoose from 'mongoose';

export interface IHotel extends mongoose.Document {
  name: string;
  description: string;
  location: {
    address: string;
    city: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  amenities: string[];
  images: string[];
  pricePerNight: number;
  rating: number;
  reviews: {
    user: mongoose.Types.ObjectId;
    rating: number;
    comment: string;
    date: Date;
  }[];
  availability: {
    startDate: Date;
    endDate: Date;
    rooms: number;
  }[];
  createdBy: mongoose.Types.ObjectId;
  isActive: boolean;
}

const hotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  amenities: [{
    type: String
  }],
  images: [{
    type: String
  }],
  pricePerNight: {
    type: Number,
    required: true,
    min: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  availability: [{
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    rooms: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Add index for search functionality
hotelSchema.index({ 
  name: 'text', 
  'location.city': 'text', 
  'location.country': 'text' 
});

export default mongoose.model<IHotel>('Hotel', hotelSchema);