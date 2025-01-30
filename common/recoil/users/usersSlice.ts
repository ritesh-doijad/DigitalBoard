import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  [key: string]: Move[]; // Adjust this based on your data shape
}

const initialState: User = {};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setUsers: (state, action: PayloadAction<User>) => {
      return { ...state, ...action.payload };
    },
    updateUser: (state, action: PayloadAction<{ id: string; data: Move[] }>) => {
      const { id, data } = action.payload;
      state[id] = data;
    },
    undoUserMove: (state, action: PayloadAction<string>) => {
      const userId = action.payload;
      if (state[userId]) {
        state[userId] = state[userId].slice(0, -1); // Remove last move for the user
      }
    },
  },
});

export const { setUsers, updateUser,undoUserMove } = usersSlice.actions;
export default usersSlice.reducer; // Ensure you're exporting the reducer
