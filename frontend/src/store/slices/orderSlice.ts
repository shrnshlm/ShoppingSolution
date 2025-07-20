import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  customerInfo: {
    firstName: '',
    lastName: '',
    email: '',
    address: '',
  },
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {},
});

export default orderSlice.reducer;