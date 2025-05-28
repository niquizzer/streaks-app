"use client"

import { configureStore } from '@reduxjs/toolkit';
import dashboardReducer from '../dashboard/dashboardSlice';
import authReducer from '../auth/authSlice';

export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    auth: authReducer,
  },
});
