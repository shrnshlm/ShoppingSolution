// src/types/index.ts

export interface Product {
  id: number;
  name: string;
  price: number;
  categoryId: number;
  categoryName: string;
  unit?: string;
  description?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  products: Product[];
}

export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  categoryId: number;
  categoryName: string;
  price: number;
  unit: string;
  quantity: number;
  totalPrice: number;
}

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
}

export interface OrderItem {
  productId: number;
  productName: string;
  categoryId: number;
  categoryName: string;
  price: number;
  quantity: number;
  unit: string;
}

export interface OrderSummary {
  totalItems: number;
  totalAmount: number;
  currency: string;
}

export interface Order {
  _id?: string;
  customerInfo: CustomerInfo;
  items: OrderItem[];
  orderSummary: OrderSummary;
  status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  orderDate?: string;
  updatedAt?: string;
  orderNumber?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface FormErrors {
  [key: string]: string;
}

export interface FormTouched {
  [key: string]: boolean;
}