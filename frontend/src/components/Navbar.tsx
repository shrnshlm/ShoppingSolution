// src/components/Navbar.tsx
import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Box,
  Button,
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  Store as StoreIcon,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { selectCartTotalItems, toggleCart } from '../store/slices/cartSlice';
import type { RootState } from '../store';

const Navbar: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const cartItemsCount = useSelector(selectCartTotalItems);

  const handleCartClick = () => {
    dispatch(toggleCart());
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  const isOrderSummaryPage = location.pathname === '/order-summary';
  const isConfirmationPage = location.pathname === '/order-confirmation';

  return (
    <AppBar position="sticky" elevation={2}>
      <Toolbar>
        {/* Logo and Title */}
        <IconButton
          edge="start"
          color="inherit"
          onClick={handleHomeClick}
          sx={{ mr: 2 }}
        >
          <StoreIcon />
        </IconButton>
        
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1, 
            cursor: 'pointer',
            fontWeight: 600,
          }}
          onClick={handleHomeClick}
        >
          מערכת קניות
        </Typography>

        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Show different buttons based on current page */}
          {!isConfirmationPage && (
            <>
              {/* Home Button */}
              <Button
                color="inherit"
                onClick={handleHomeClick}
                variant={location.pathname === '/' ? 'outlined' : 'text'}
                sx={{
                  borderColor: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                קטלוג מוצרים
              </Button>

              {/* Cart Button */}
              <IconButton
                color="inherit"
                onClick={handleCartClick}
                sx={{
                  ml: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                <Badge 
                  badgeContent={cartItemsCount} 
                  color="secondary"
                  sx={{
                    '& .MuiBadge-badge': {
                      fontWeight: 'bold',
                      fontSize: '0.75rem',
                    },
                  }}
                >
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>
            </>
          )}

          {/* Order Summary Page - Show step indicator */}
          {isOrderSummaryPage && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                שלב 2 מתוך 3: סיכום הזמנה
              </Typography>
            </Box>
          )}

          {/* Order Confirmation Page - Show completion indicator */}
          {isConfirmationPage && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                ההזמנה הושלמה בהצלחה
              </Typography>
              <Button
                color="inherit"
                variant="outlined"
                onClick={handleHomeClick}
                sx={{
                  borderColor: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                הזמנה חדשה
              </Button>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;