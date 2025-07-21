// src/store/slices/catalogSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import type { RootState } from '../index';
import type { Product, Category } from '../../types';

// API Base URL - .NET Backend
const API_BASE_URL = 'https://localhost:7066/api';

// Async Thunks
export const fetchCategories = createAsyncThunk(
  'catalog/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/categories`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'שגיאה בטעינת הקטגוריות');
    }
  }
);

export const fetchProductsByCategory = createAsyncThunk(
  'catalog/fetchProductsByCategory',
  async (categoryId: number, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/category/${categoryId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'שגיאה בטעינת המוצרים');
    }
  }
);

export const fetchAllProducts = createAsyncThunk(
  'catalog/fetchAllProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'שגיאה בטעינת המוצרים');
    }
  }
);

interface CatalogState {
  categories: Category[];
  products: Product[];
  selectedCategory: Category | null;
  filteredProducts: Product[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
}

const initialState: CatalogState = {
  categories: [],
  products: [],
  selectedCategory: null,
  filteredProducts: [],
  loading: false,
  error: null,
  searchTerm: '',
};

const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {
    setSelectedCategory: (state, action: PayloadAction<Category | null>) => {
      state.selectedCategory = action.payload;
      if (action.payload === null) {
        state.filteredProducts = state.products;
      } else {
        state.filteredProducts = state.products.filter(
          product => product.categoryId === action.payload.id
        );
      }
    },

    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
      const searchLower = action.payload.toLowerCase();
      
      let productsToFilter = state.selectedCategory 
        ? state.products.filter(p => p.categoryId === state.selectedCategory!.id)
        : state.products;

      if (searchLower) {
        state.filteredProducts = productsToFilter.filter(product =>
          product.name.toLowerCase().includes(searchLower) ||
          product.categoryName.toLowerCase().includes(searchLower)
        );
      } else {
        state.filteredProducts = productsToFilter;
      }
    },

    clearFilters: (state) => {
      state.selectedCategory = null;
      state.searchTerm = '';
      state.filteredProducts = state.products;
    },

    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Products by Category
      .addCase(fetchProductsByCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductsByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.filteredProducts = action.payload;
      })
      .addCase(fetchProductsByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch All Products
      .addCase(fetchAllProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
        if (!state.selectedCategory) {
          state.filteredProducts = action.payload;
        }
      })
      .addCase(fetchAllProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setSelectedCategory,
  setSearchTerm,
  clearFilters,
  clearError,
} = catalogSlice.actions;

// Typed Selectors
export const selectCategories = (state: RootState): Category[] => state.catalog.categories;
export const selectProducts = (state: RootState): Product[] => state.catalog.products;
export const selectFilteredProducts = (state: RootState): Product[] => state.catalog.filteredProducts;
export const selectSelectedCategory = (state: RootState): Category | null => state.catalog.selectedCategory;
export const selectCatalogLoading = (state: RootState): boolean => state.catalog.loading;
export const selectCatalogError = (state: RootState): string | null => state.catalog.error;
export const selectSearchTerm = (state: RootState): string => state.catalog.searchTerm;

export default catalogSlice.reducer;