import { configureStore } from "@reduxjs/toolkit";
import optionsReducer from "./optionsSlice"; // Replace with the correct path to your slice

const store = configureStore({
  reducer: {
    options: optionsReducer,
  },
});

// Define RootState based on the store's state
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
