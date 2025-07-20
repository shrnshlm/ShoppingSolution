// src/App.tsx
import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import rtlPlugin from 'stylis-plugin-rtl';
import { prefixer } from 'stylis';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';

// Components
import ShoppingPage from './components/ShoppingPage';
import OrderSummaryPage from './components/OrderSummaryPage';
import OrderConfirmationPage from './components/OrderConfirmationPage';
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';

// RTL Support for Hebrew
const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

// Material-UI Theme with RTL and Hebrew support
const theme = createTheme({
  direction: 'rtl',
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
      light: '#ff5983',
      dark: '#9a0036',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      'Arial',
      'sans-serif',
      '"Segoe UI"',
      '"Helvetica Neue"',
    ].join(','),
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          direction: 'rtl',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          transition: 'box-shadow 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
        contained: {
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
});

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <CacheProvider value={cacheRtl}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <div className="App">
              <Navbar />
              <CartDrawer />
              <Routes>
                <Route path="/" element={<ShoppingPage />} />
                <Route path="/order-summary" element={<OrderSummaryPage />} />
                <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
              </Routes>
            </div>
          </Router>
        </ThemeProvider>
      </CacheProvider>
    </Provider>
  );
};

export default App;