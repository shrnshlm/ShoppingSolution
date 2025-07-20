// src/components/ShoppingPage.tsx
import React, { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  TextField,
  InputAdornment,
  Alert,
  CircularProgress,
  Paper,
  Fab,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  ShoppingCart as ShoppingCartIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

// Redux imports
import {
  fetchCategories,
  fetchAllProducts,
  setSelectedCategory,
  setSearchTerm,
  clearFilters,
  selectCategories,
  selectFilteredProducts,
  selectSelectedCategory,
  selectCatalogLoading,
  selectCatalogError,
  selectSearchTerm,
} from '../store/slices/catalogSlice';

import {
  addToCart,
  selectCartTotalItems,
  openCart,
} from '../store/slices/cartSlice';

import type { Product, Category } from '../types';
import type { AppDispatch } from '../store';

const ShoppingPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Redux state
  const categories = useSelector(selectCategories);
  const products = useSelector(selectFilteredProducts);
  const selectedCategory = useSelector(selectSelectedCategory);
  const loading = useSelector(selectCatalogLoading);
  const error = useSelector(selectCatalogError);
  const searchTerm = useSelector(selectSearchTerm);
  const cartItemsCount = useSelector(selectCartTotalItems);

  // Local state
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});

  // Load data on component mount
  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchAllProducts());
  }, [dispatch]);

  // Handle category selection
  const handleCategorySelect = (category: Category | null) => {
    dispatch(setSelectedCategory(category));
  };

  // Handle search
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchTerm(event.target.value));
  };

  // Handle quantity change
  const handleQuantityChange = (productId: number, quantity: number) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, quantity),
    }));
  };

  // Handle add to cart
  const handleAddToCart = (product: Product) => {
    const quantity = quantities[product.id] || 1;
    dispatch(addToCart({ product, quantity }));
    
    // Reset quantity to 1
    setQuantities(prev => ({
      ...prev,
      [product.id]: 1,
    }));

    // Show success feedback (optional)
    // You could add a snackbar here
  };

  // Handle clear filters
  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  // Handle proceed to checkout
  const handleProceedToCheckout = () => {
    if (cartItemsCount > 0) {
      navigate('/order-summary');
    } else {
      dispatch(openCart());
    }
  };

  // Format price
  const formatPrice = (price: number): string => {
    return `₪${price.toFixed(2)}`;
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => {
            dispatch(fetchCategories());
            dispatch(fetchAllProducts());
          }}
        >
          נסה שוב
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          קטלוג מוצרים
        </Typography>
        <Typography variant="body1" color="text.secondary">
          בחר קטגוריה וצרור מוצרים לעגלת הקניות
        </Typography>
      </Box>

      {/* Search Bar */}
      <Paper elevation={1} sx={{ p: 2, mb: 4 }}>
        <TextField
          fullWidth
          placeholder="חפש מוצרים..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        {/* Category Filters */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ mr: 1, minWidth: 'fit-content' }}>
            קטגוריות:
          </Typography>
          
          <Chip
            icon={<CategoryIcon />}
            label="הכל"
            clickable
            color={!selectedCategory ? 'primary' : 'default'}
            onClick={() => handleCategorySelect(null)}
          />
          
          {categories.map((category: Category) => (
            <Chip
              key={category.id}
              label={category.name}
              clickable
              color={selectedCategory?.id === category.id ? 'primary' : 'default'}
              onClick={() => handleCategorySelect(category)}
            />
          ))}
          
          {(selectedCategory || searchTerm) && (
            <Button
              size="small"
              onClick={handleClearFilters}
              sx={{ ml: 1 }}
            >
              נקה מסננים
            </Button>
          )}
        </Box>
      </Paper>

      {/* Products Grid */}
      {products.length === 0 ? (
        <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            לא נמצאו מוצרים
          </Typography>
          <Typography variant="body2" color="text.secondary">
            נסה לשנות את החיפוש או לבחור קטגוריה אחרת
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {products.map((product: Product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  {/* Product Header */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" component="h3" gutterBottom fontWeight="bold">
                      {product.name}
                    </Typography>
                    <Chip 
                      label={product.categoryName} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  </Box>

                  {/* Product Description */}
                  {product.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {product.description}
                    </Typography>
                  )}

                  {/* Price */}
                  <Typography 
                    variant="h5" 
                    color="primary" 
                    fontWeight="bold" 
                    sx={{ mb: 2 }}
                  >
                    {formatPrice(product.price)}
                    <Typography 
                      component="span" 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ ml: 1 }}
                    >
                      ל{product.unit}
                    </Typography>
                  </Typography>

                  {/* Quantity Selector */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Typography variant="body2" sx={{ minWidth: 'fit-content' }}>
                      כמות:
                    </Typography>
                    <TextField
                      type="number"
                      size="small"
                      value={quantities[product.id] || 1}
                      onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value) || 1)}
                      inputProps={{ min: 1, max: 99 }}
                      sx={{ width: 80 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {product.unit}
                    </Typography>
                  </Box>

                  {/* Add to Cart Button */}
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<AddIcon />}
                    onClick={() => handleAddToCart(product)}
                    sx={{ mt: 'auto' }}
                  >
                    הוסף לעגלה
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Floating Checkout Button */}
      {cartItemsCount > 0 && (
        <Fab
          color="primary"
          size="large"
          onClick={handleProceedToCheckout}
          sx={{
            position: 'fixed',
            bottom: 24,
            left: 24,
            zIndex: 1000,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ShoppingCartIcon />
            <Typography variant="body2" fontWeight="bold">
              {cartItemsCount}
            </Typography>
          </Box>
        </Fab>
      )}
    </Container>
  );
};

export default ShoppingPage;