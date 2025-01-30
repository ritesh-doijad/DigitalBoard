import { configureStore } from '@reduxjs/toolkit';
import usersReducer from './usersSlice';

export const store = configureStore({
  reducer: {
    users: usersReducer, // This defines `users` as a property on the Redux state
  },
});

export type RootState = ReturnType<typeof store.getState>; // Infer the type of RootState
export type AppDispatch = typeof store.dispatch;
