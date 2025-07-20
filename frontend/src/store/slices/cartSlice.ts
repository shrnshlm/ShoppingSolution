import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';

export interface Product {
  id: number;
  name: string;
  price: number;
  categoryId: number;
  categoryName: string;
  unit?: string;
  description?: string;
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

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  isOpen: boolean;
}

interface AddToCartPayload {
  product: Product;
  quantity?: number;
}

interface UpdateQuantityPayload {
  productId: number;
  quantity: number;
}

const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalAmount: 0,
  isOpen: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<AddToCartPayload>) => {
      const { product, quantity = 1 } = action.payload;
      const existingItem = state.items.find(item => item.id === product.id);

      if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.totalPrice = existingItem.price * existingItem.quantity;
      } else {
        const cartItem: CartItem = {
          id: product.id,
          productId: product.id,
          productName: product.name,
          categoryId: product.categoryId,
          categoryName: product.categoryName,
          price: product.price,
          unit: product.unit || 'יח׳',
          quantity: quantity,
          totalPrice: product.price * quantity,
        };
        state.items.push(cartItem);
      }

      cartSlice.caseReducers.calculateTotals(state);
    },

    removeFromCart: (state, action: PayloadAction<number>) => {
      const productId = action.payload;
      state.items = state.items.filter(item => item.id !== productId);
      cartSlice.caseReducers.calculateTotals(state);
    },

    updateQuantity: (state, action: PayloadAction<UpdateQuantityPayload>) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find(item => item.id === productId);
      
      if (item && quantity > 0) {
        item.quantity = quantity;
        item.totalPrice = item.price * quantity;
        cartSlice.caseReducers.calculateTotals(state);
      }
    },

    clearCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.totalAmount = 0;
    },

    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    },

    openCart: (state) => {
      state.isOpen = true;
    },

    closeCart: (state) => {
      state.isOpen = false;
    },

    calculateTotals: (state) => {
      state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
      state.totalAmount = state.items.reduce((total, item) => total + item.totalPrice, 0);
      state.totalAmount = Math.round(state.totalAmount * 100) / 100;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  toggleCart,
  openCart,
  closeCart,
  calculateTotals,
} = cartSlice.actions;

// Typed Selectors
export const selectCartItems = (state: RootState): CartItem[] => state.cart.items;
export const selectCartTotalItems = (state: RootState): number => state.cart.totalItems;
export const selectCartTotalAmount = (state: RootState): number => state.cart.totalAmount;
export const selectCartIsOpen = (state: RootState): boolean => state.cart.isOpen;
export const selectCartItemById = (state: RootState, productId: number): CartItem | undefined => 
  state.cart.items.find(item => item.id === productId);

export default cartSlice.reducer;