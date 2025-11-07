export interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  rating: number;
  thumbnail: string;
  images: string[];
}

export interface User {
  id: string; // Changed from number to string to match MongoDB _id and Mongoose virtual 'id'
  username: string;
  password: string;
  purchaseHistory: HistoryItem[];
  lastLoginDate: string | null;
  streak: number;
  refreshTokens: string | null;
}
export interface HistoryItem {
  id: number;
  title: string;
  price: number;
  thumbnail: string;
  timestamp: number;
}
