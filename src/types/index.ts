export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'operator';
  profileImage?: string;
  favorites: string[];
  isEmailVerified: boolean;
}

export interface AuthResponse {
  status: string;
  token: string;
  refreshToken: string;
  data: {
    user: User;
  };
}

export interface Hotel {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  price: number;
  rating: number;
  amenities: string[];
  images: string[];
  rooms: Room[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  type: string;
  price: number;
  available: number;
}

export interface Message {
  id: string;
  sender: User;
  receiver: User;
  content: string;
  hotelId?: string;
  createdAt: string;
  updatedAt: string;
} 