// src/components/OrderSummaryPage.tsx
import React, { useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  IconButton,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  ShoppingCart as ShoppingCartIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

// Redux imports
import {
  selectCartItems,
  selectCartTotalItems,
  selectCartTotalAmount,
} from '../store/slices/cartSlice';

import {
  updateCustomerInfo,
  validateForm,
  submitOrder,
  setFieldTouched,
  selectCustomerInfo,
  selectFormErrors,
  selectFormTouched,
  selectSubmitting,
  selectSubmitError,
  selectSubmitSuccess,
} from '../store/slices/orderSlice';

import type { AppDispatch } from '../store';
import type { CartItem } from '../types';

const steps = ['בחירת מוצרים', 'סיכום הזמנה', 'אישור הזמנה'];

const OrderSummaryPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Redux state
  const cartItems = useSelector(selectCartItems);
  const totalItems = useSelector(selectCartTotalItems);
  const totalAmount = useSelector(selectCartTotalAmount);
  const customerInfo = useSelector(selectCustomerInfo);
  const formErrors = useSelector(selectFormErrors);
  const formTouched = useSelector(selectFormTouched);
  const submitting = useSelector(selectSubmitting);
  const submitError = useSelector(selectSubmitError);
  const submitSuccess = useSelector(selectSubmitSuccess);

  // Check if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/');
    }
  }, [cartItems.length, navigate]);

  // Handle successful order submission
  useEffect(() => {
    if (submitSuccess) {
      navigate('/order-confirmation');
    }
  }, [submitSuccess, navigate]);

  // בתחילת הקומפוננט OrderSummaryPage, הוסף:
useEffect(() => {
  console.log('Current customer info:', customerInfo);
  console.log('Form errors:', formErrors);
  console.log('Form touched:', formTouched);
}, [customerInfo, formErrors, formTouched]);

  // Handle input changes
const handleInputChange = (field: string, value: string) => {
  console.log(`Updating ${field}:`, value); // לdebug
  dispatch(updateCustomerInfo({ [field]: value }));
  dispatch(setFieldTouched({ field, touched: true }));
};

// Handle form submission
const handleSubmitOrder = async () => {
  console.log('=== Submit Order Debug ===');
  console.log('Customer info:', customerInfo);
  
  const { firstName, lastName, email, address } = customerInfo;
  
  if (!firstName.trim() || !lastName.trim() || !email.trim() || !address.trim()) {
    alert('אנא מלא את כל השדות החובה');
    return;
  }

  if (!email.includes('@')) {
    alert('כתובת מייל לא תקינה');
    return;
  }

  // שלח הכל כולל החישובים
  const orderData = {
    customerInfo: {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      address: address.trim(),
    },
    items: cartItems.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      categoryId: item.categoryId,
      categoryName: item.categoryName,
      price: item.price,
      quantity: item.quantity,
      unit: item.unit,
      totalPrice: item.price * item.quantity, // חישוב מקומי
    })),
    orderSummary: {
      totalItems: totalItems,
      totalAmount: totalAmount,
      currency: 'ILS'
    }
  };

  console.log('✅ Sending complete order:', orderData);
  dispatch(submitOrder(orderData));
};

  // Handle back to shopping
  const handleBackToShopping = () => {
    navigate('/');
  };

  // Format price
  const formatPrice = (price: number): string => {
    return `₪${price.toFixed(2)}`;
  };

  // Get field error helper
  const getFieldError = (field: string): string => {
    return formTouched[field] && formErrors[field] ? formErrors[field] : '';
  };

  if (cartItems.length === 0) {
    return null; // Will redirect to home
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header with Stepper */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={handleBackToShopping} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1" fontWeight="bold">
            סיכום הזמנה
          </Typography>
        </Box>
        
        <Stepper activeStep={1} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <Grid container spacing={4}>
        {/* Customer Information Form */}
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon />
                פרטים אישיים
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                אנא מלא את הפרטים הבאים לצורך משלוח ההזמנה
              </Typography>

              <Grid container spacing={3}>
                {/* First Name */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="שם פרטי *"
                    value={customerInfo.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    error={!!getFieldError('firstName')}
                    helperText={getFieldError('firstName')}
                    InputProps={{
                      startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>
                {/* Last Name */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="שם משפחה *"
                    value={customerInfo.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    error={!!getFieldError('lastName')}
                    helperText={getFieldError('lastName')}
                    InputProps={{
                      startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>

                {/* Email */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="כתובת מייל *"
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    error={!!getFieldError('email')}
                    helperText={getFieldError('email')}
                    InputProps={{
                      startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>

                {/* Address */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="כתובת מלאה *"
                    multiline
                    rows={3}
                    value={customerInfo.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    error={!!getFieldError('address')}
                    helperText={getFieldError('address')}
                    placeholder="רחוב, מספר בית, עיר, מיקוד"
                    InputProps={{
                      startAdornment: <HomeIcon sx={{ mr: 1, color: 'text.secondary', alignSelf: 'flex-start', mt: 1 }} />,
                    }}
                  />
                </Grid>
              </Grid>

              {/* Submit Error */}
              {submitError && (
                <Alert severity="error" sx={{ mt: 3 }}>
                  {submitError}
                </Alert>
              )}

              {/* Required Fields Note */}
              <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                * שדות חובה
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ShoppingCartIcon />
                סיכום הזמנה
              </Typography>

              {/* Order Items */}
              {/* Order Items */}
              <List sx={{ p: 0 }}>
                {cartItems.map((item: CartItem, index: number) => (
                  <React.Fragment key={item.id}>
                    <ListItem sx={{ px: 0, py: 2 }}>
                      <Box sx={{ width: '100%' }}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {item.productName}
                        </Typography>
                        
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                          {item.categoryName}
                        </Typography>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">
                            {formatPrice(item.price)} × {item.quantity} {item.unit}
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {formatPrice(item.totalPrice)}
                          </Typography>
                        </Box>
                      </Box>
                    </ListItem>
                    {index < cartItems.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>

              <Divider sx={{ my: 2 }} />

              {/* Order Totals */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">
                    סה״כ פריטים:
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {totalItems}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">
                    סה״כ לתשלום:
                  </Typography>
                  <Typography variant="h6" color="primary" fontWeight="bold">
                    {formatPrice(totalAmount)}
                  </Typography>
                </Box>
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={handleSubmitOrder}
                  disabled={submitting}
                  startIcon={submitting ? <CircularProgress size={20} /> : <PaymentIcon />}
                  sx={{ py: 1.5 }}
                >
                  {submitting ? 'שולח הזמנה...' : 'אשר הזמנה'}
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  fullWidth
                  onClick={handleBackToShopping}
                  disabled={submitting}
                >
                  חזור לקניות
                </Button>
              </Box>

              {/* Security Note */}
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  mt: 3, 
                  bgcolor: 'action.hover',
                  textAlign: 'center' 
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  🔒 המידע שלך מוגן ומוצפן
                </Typography>
              </Paper>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default OrderSummaryPage;