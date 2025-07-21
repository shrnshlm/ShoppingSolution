// src/components/OrderConfirmationPage.tsx
import React, { useEffect } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
  Chip,
  Stepper,
  Step,
  StepLabel,
  Alert,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  ShoppingBag as ShoppingBagIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  Print as PrintIcon,
  Storefront as StorefrontIcon,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

// Redux imports
import {
  selectLastOrder,
  clearForm,
} from '../store/slices/orderSlice';

import {
  clearCart,
} from '../store/slices/cartSlice';

const steps = ['בחירת מוצרים', 'סיכום הזמנה', 'אישור הזמנה'];

const OrderConfirmationPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux state
  const lastOrder = useSelector(selectLastOrder);

  // Redirect if no order data
  useEffect(() => {
    if (!lastOrder) {
      navigate('/');
    }
  }, [lastOrder, navigate]);

  // Clear cart and form on mount
  useEffect(() => {
    dispatch(clearCart());
    dispatch(clearForm());
  }, [dispatch]);

  // Handle new order
  const handleNewOrder = () => {
    navigate('/');
  };

  // Handle print order
  const handlePrintOrder = () => {
    window.print();
  };

  // Format price
  const formatPrice = (price: number): string => {
    return `₪${price.toFixed(2)}`;
  };

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!lastOrder) {
    return null; // Will redirect to home
  }

  const { orderNumber, summary } = lastOrder;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Success Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <CheckCircleIcon 
          sx={{ 
            fontSize: 80, 
            color: 'success.main', 
            mb: 2,
            animation: 'pulse 2s infinite',
            '@keyframes pulse': {
              '0%': { transform: 'scale(1)' },
              '50%': { transform: 'scale(1.1)' },
              '100%': { transform: 'scale(1)' },
            },
          }} 
        />
        <Typography variant="h4" component="h1" fontWeight="bold" color="success.main" gutterBottom>
          ההזמנה הושלמה בהצלחה!
        </Typography>
        <Typography variant="h6" color="text.secondary">
          מספר הזמנה: {orderNumber}
        </Typography>
      </Box>

      {/* Stepper */}
      <Box sx={{ mb: 4 }}>
        <Stepper activeStep={2} alternativeLabel>
          {steps.map((label) => (
            <Step key={label} completed>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {/* Success Alert */}
      <Alert 
        severity="success" 
        sx={{ mb: 4, p: 3 }}
        icon={<CheckCircleIcon fontSize="large" />}
      >
        <Typography variant="h6" gutterBottom>
          תודה שבחרת בשירותי משרד הביטחון!
        </Typography>
        <Typography variant="body1">
          ההזמנה שלך התקבלה בהצלחה ותעובד בקרוב. 
          פרטי ההזמנה נשלחו לכתובת המייל שלך.
        </Typography>
      </Alert>

      {/* Order Details */}
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ShoppingBagIcon />
            פרטי ההזמנה
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <Chip 
              label={`הזמנה #${orderNumber}`}
              color="primary" 
              variant="outlined"
              size="medium"
            />
            <Chip 
              label="סטטוס: נשלחה"
              color="success" 
              variant="outlined"
              size="medium"
            />
            <Chip 
              label={formatDate(new Date().toISOString())}
              color="default" 
              variant="outlined"
              size="medium"
            />
          </Box>

          {/* Order Summary */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="body1">
              סה״כ פריטים:
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              {summary.totalItems}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6">
              סה״כ לתשלום:
            </Typography>
            <Typography variant="h6" color="primary" fontWeight="bold">
              {formatPrice(summary.totalAmount)}
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Customer Information */}
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 3 }}>
            <PersonIcon />
            פרטי הלקוח
          </Typography>

          <Box sx={{ pl: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <PersonIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
              <Typography variant="body1">
                {summary.customerName}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <EmailIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
              <Typography variant="body1">
                {lastOrder.customerInfo?.email || 'לא זמין'}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <HomeIcon sx={{ fontSize: 20, color: 'text.secondary', mt: 0.2 }} />
              <Typography variant="body1">
                {lastOrder.customerInfo?.address || 'לא זמין'}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Paper elevation={1} sx={{ p: 4, mb: 4, bgcolor: 'background.paper' }}>
        <Typography variant="h6" gutterBottom>
          📋 השלבים הבאים
        </Typography>
        
        <List sx={{ p: 0 }}>
          <ListItem sx={{ px: 0 }}>
            <ListItemText
              primary="1. אישור קבלת ההזמנה"
              secondary="תקבל אישור במייל תוך 5 דקות"
            />
          </ListItem>
          
          <ListItem sx={{ px: 0 }}>
            <ListItemText
              primary="2. עיבוד ההזמנה"
              secondary="ההזמנה תעובד במערכות משרד הביטחון"
            />
          </ListItem>
          
          <ListItem sx={{ px: 0 }}>
            <ListItemText
              primary="3. הכנה ואיסוף"
              secondary="המוצרים יוכנו לאיסוף או משלוח"
            />
          </ListItem>
          
          <ListItem sx={{ px: 0 }}>
            <ListItemText
              primary="4. עדכון סופי"
              secondary="תקבל הודעה כשההזמנה מוכנה"
            />
          </ListItem>
        </List>
      </Paper>

      {/* Action Buttons */}
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        justifyContent: 'center',
        flexWrap: 'wrap' 
      }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleNewOrder}
          startIcon={<StorefrontIcon />}
          sx={{ minWidth: 200 }}
        >
          הזמנה חדשה
        </Button>
        
        <Button
          variant="outlined"
          size="large"
          onClick={handlePrintOrder}
          startIcon={<PrintIcon />}
          sx={{ minWidth: 200 }}
        >
          הדפס אישור
        </Button>
      </Box>

      {/* Footer Note */}
      <Box sx={{ textAlign: 'center', mt: 4, p: 3, bgcolor: 'action.hover', borderRadius: 2 }}>
        <Typography variant="body2" color="text.secondary">
          💡 לשאלות ובעיות ניתן לפנות למוקד השירות של משרד הביטחון
        </Typography>
        <Typography variant="caption" color="text.secondary">
          מערכת קניות | פותח עבור משרד הביטחון | {new Date().getFullYear()}
        </Typography>
      </Box>
    </Container>
  );
};

export default OrderConfirmationPage;