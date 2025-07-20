// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './slices/cartSlice';
import catalogReducer from './slices/catalogSlice';
import orderReducer from './slices/orderSlice';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    catalog: catalogReducer,
    order: orderReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;