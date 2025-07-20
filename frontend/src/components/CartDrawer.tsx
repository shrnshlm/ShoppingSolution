// src/components/CartDrawer.tsx
import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  Divider,
  TextField,
  Paper,
  Alert,
} from '@mui/material';
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart as ShoppingCartIcon,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  selectCartItems,
  selectCartTotalItems,
  selectCartTotalAmount,
  selectCartIsOpen,
  closeCart,
  removeFromCart,
  updateQuantity,
  clearCart,
} from '../store/slices/cartSlice';
import type { CartItem } from '../types';

const CartDrawer: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const cartItems = useSelector(selectCartItems);
  const totalItems = useSelector(selectCartTotalItems);
  const totalAmount = useSelector(selectCartTotalAmount);
  const isOpen = useSelector(selectCartIsOpen);

  const handleClose = () => {
    dispatch(closeCart());
  };

  const handleRemoveItem = (productId: number) => {
    dispatch(removeFromCart(productId));
  };

  const handleUpdateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity > 0) {
      dispatch(updateQuantity({ productId, quantity: newQuantity }));
    }
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  const handleProceedToCheckout = () => {
    dispatch(closeCart());
    navigate('/order-summary');
  };

  const formatPrice = (price: number): string => {
    return `₪${price.toFixed(2)}`;
  };

  return (
    <Drawer
      anchor="left"
      open={isOpen}
      onClose={handleClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 400,
          maxWidth: '90vw',
        },
      }}
    >
      <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ShoppingCartIcon />
            עגלת קניות
          </Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Cart Items */}
        {cartItems.length === 0 ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexGrow: 1,
            gap: 2 
          }}>
            <ShoppingCartIcon sx={{ fontSize: 64, color: 'text.secondary' }} />
            <Typography variant="body1" color="text.secondary" align="center">
              העגלה ריקה
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              הוסף מוצרים מהקטלוג כדי להתחיל
            </Typography>
          </Box>
        ) : (
          <>
            {/* Items List */}
            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
              <List sx={{ p: 0 }}>
                {cartItems.map((item: CartItem) => (
                  <ListItem
                    key={item.id}
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                      flexDirection: 'column',
                      alignItems: 'stretch',
                      p: 2,
                    }}
                  >
                    {/* Product Info */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 1 }}>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {item.productName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.categoryName}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveItem(item.id)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    {/* Quantity Controls */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                        
                        <TextField
                          size="small"
                          value={item.quantity}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 1;
                            handleUpdateQuantity(item.id, value);
                          }}
                          inputProps={{
                            min: 1,
                            style: { textAlign: 'center', width: '50px' },
                          }}
                          variant="outlined"
                        />
                        
                        <IconButton
                          size="small"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                        
                        <Typography variant="caption" sx={{ ml: 1 }}>
                          {item.unit}
                        </Typography>
                      </Box>

                      <Box sx={{ textAlign: 'left' }}>
                        <Typography variant="body2" color="text.secondary">
                          {formatPrice(item.price)} × {item.quantity}
                        </Typography>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {formatPrice(item.totalPrice)}
                        </Typography>
                      </Box>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Box>

            {/* Summary */}
            <Paper elevation={1} sx={{ p: 2, mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">
                  סה״כ פריטים:
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {totalItems}
                </Typography>
              </Box>
              
              <Divider sx={{ my: 1 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">
                  סה״כ לתשלום:
                </Typography>
                <Typography variant="h6" color="primary" fontWeight="bold">
                  {formatPrice(totalAmount)}
                </Typography>
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handleProceedToCheckout}
                  sx={{ mb: 1 }}
                >
                  המשך להזמנה
                </Button>
                
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={handleClearCart}
                  color="error"
                  size="small"
                >
                  רוקן עגלה
                </Button>
              </Box>
            </Paper>
          </>
        )}
      </Box>
    </Drawer>
  );
};

export default CartDrawer;