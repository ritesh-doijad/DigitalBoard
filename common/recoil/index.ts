import { configureStore } from "@reduxjs/toolkit";
import optionsReducer from "../recoil/options/optionsSlice";
import roomReducer from "../recoil/room/roomSlice";
import usersReducer from "../recoil/users/usersSlice";
 // Replace with the correct path to your slice

const store = configureStore({
  reducer: {
    options: optionsReducer,
    room: roomReducer,
    users: usersReducer,
  },
});

// Define RootState based on the store's state
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
