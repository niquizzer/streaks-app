"use client"

import { configureStore } from '@reduxjs/toolkit';
import dashboardReducer from '../dashboard/dashboardSlice';

export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
  },
});
