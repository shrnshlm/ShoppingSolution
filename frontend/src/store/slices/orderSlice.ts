// src/store/slices/orderSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import type { RootState } from '../index';
import type { CustomerInfo, Order } from '../../types';

// API Base URL - Node.js Backend
const API_BASE_URL = 'http://localhost:3001/api';

// Async Thunks
export const submitOrder = createAsyncThunk(
  'order/submitOrder',
  async (orderData: any, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/orders`, orderData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.details || 
        error.response?.data?.error || 
        'שגיאה בשליחת ההזמנה'
      );
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'order/fetchOrderById',
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/orders/${orderId}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || 'שגיאה בטעינת ההזמנה'
      );
    }
  }
);

interface OrderState {
  customerInfo: CustomerInfo;
  submitting: boolean;
  submitError: string | null;
  submitSuccess: boolean;
  lastOrder: any | null;
  customerOrders: Order[];
  selectedOrder: Order | null;
  loading: boolean;
  error: string | null;
  formErrors: { [key: string]: string };
  formTouched: { [key: string]: boolean };
}

const initialState: OrderState = {
  customerInfo: {
    firstName: '',
    lastName: '',
    email: '',
    address: '',
  },
  submitting: false,
  submitError: null,
  submitSuccess: false,
  lastOrder: null,
  customerOrders: [],
  selectedOrder: null,
  loading: false,
  error: null,
  formErrors: {},
  formTouched: {},
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    updateCustomerInfo: (state, action: PayloadAction<Partial<CustomerInfo>>) => {
      state.customerInfo = { ...state.customerInfo, ...action.payload };
      Object.keys(action.payload).forEach(field => {
        if (state.formErrors[field]) {
          delete state.formErrors[field];
        }
      });
    },

    setFieldTouched: (state, action: PayloadAction<{ field: string; touched?: boolean }>) => {
      const { field, touched = true } = action.payload;
      state.formTouched[field] = touched;
    },

validateForm: (state) => {
  const errors: { [key: string]: string } = {};
  const { firstName, lastName, email, address } = state.customerInfo;

  if (!firstName.trim()) {
    errors.firstName = 'שם פרטי הוא שדה חובה';
  } else if (firstName.trim().length < 2) {
    errors.firstName = 'שם פרטי חייב להכיל לפחות 2 תווים';
  }

  if (!lastName.trim()) {
    errors.lastName = 'שם משפחה הוא שדה חובה';
  } else if (lastName.trim().length < 2) {
    errors.lastName = 'שם משפחה חייב להכיל לפחות 2 תווים';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.trim()) {
    errors.email = 'כתובת מייל היא שדה חובה';
  } else if (!emailRegex.test(email)) {
    errors.email = 'כתובת מייל לא תקינה';
  }

  if (!address.trim()) {
    errors.address = 'כתובת מלאה היא שדה חובה';
  } else if (address.trim().length < 10) {
    errors.address = 'כתובת חייבת להכיל לפחות 10 תווים';
  }

  state.formErrors = errors;
  // הסר את ה-return!
},

    clearForm: (state) => {
      state.customerInfo = {
        firstName: '',
        lastName: '',
        email: '',
        address: '',
      };
      state.formErrors = {};
      state.formTouched = {};
      state.submitError = null;
      state.submitSuccess = false;
    },

    clearError: (state) => {
      state.error = null;
      state.submitError = null;
    },

    setSelectedOrder: (state, action: PayloadAction<Order | null>) => {
      state.selectedOrder = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitOrder.pending, (state) => {
        state.submitting = true;
        state.submitError = null;
        state.submitSuccess = false;
      })
      .addCase(submitOrder.fulfilled, (state, action) => {
        state.submitting = false;
        state.submitSuccess = true;
        state.lastOrder = action.payload.data;
        state.customerInfo = {
          firstName: '',
          lastName: '',
          email: '',
          address: '',
        };
        state.formErrors = {};
        state.formTouched = {};
      })
      .addCase(submitOrder.rejected, (state, action) => {
        state.submitting = false;
        state.submitError = action.payload as string;
        state.submitSuccess = false;
      })
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  updateCustomerInfo,
  setFieldTouched,
  validateForm,
  clearForm,
  clearError,
  setSelectedOrder,
} = orderSlice.actions;

// Selectors
export const selectCustomerInfo = (state: RootState): CustomerInfo => state.order.customerInfo;
export const selectFormErrors = (state: RootState): { [key: string]: string } => state.order.formErrors;
export const selectFormTouched = (state: RootState): { [key: string]: boolean } => state.order.formTouched;
export const selectSubmitting = (state: RootState): boolean => state.order.submitting;
export const selectSubmitError = (state: RootState): string | null => state.order.submitError;
export const selectSubmitSuccess = (state: RootState): boolean => state.order.submitSuccess;
export const selectLastOrder = (state: RootState): any | null => state.order.lastOrder;
export const selectOrderLoading = (state: RootState): boolean => state.order.loading;
export const selectOrderError = (state: RootState): string | null => state.order.error;

export default orderSlice.reducer;