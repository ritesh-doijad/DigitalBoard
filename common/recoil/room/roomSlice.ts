import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface RoomState {
  id: string;
  users: { [key: string]: Move[] }; // Users and their moves
  movesWithoutUser: Move[]; // Moves made before a user joined
  myMoves: Move[]; // Moves of the current user
}

const initialState: RoomState = {
  id: "",
  users: {},
  movesWithoutUser: [],
  myMoves: [],
};

const roomSlice = createSlice({
  name: "room",
  initialState,
  reducers: {
    setRoom: (state, action: PayloadAction<RoomState>) => {
      return action.payload; // Replace the entire room state
    },
    setRoomId: (state, action: PayloadAction<string>) => {
      state.id = action.payload;
    },
    addUser: (state, action: PayloadAction<string>) => {
      if (!state.users[action.payload]) {
        state.users[action.payload] = [];
      }
    },
    removeUser: (state, action: PayloadAction<string>) => {
      delete state.users[action.payload];
    },
    addUserMove: (state, action: PayloadAction<{ userId: string; move: Move }>) => {
      if (!state.users[action.payload.userId]) {
        state.users[action.payload.userId] = [];
      }
      state.users[action.payload.userId].push(action.payload.move);
    },
    undoUserMove: (state, action: PayloadAction<string>) => {
      if (state.users[action.payload]?.length) {
        state.users[action.payload].pop();
      }
    },
    setMovesWithoutUser: (state, action: PayloadAction<Move[]>) => {
      state.movesWithoutUser = action.payload;
    },
    addMoveWithoutUser: (state, action: PayloadAction<Move>) => {
      state.movesWithoutUser.push(action.payload);
    },
    addMyMove: (state, action: PayloadAction<Move>) => {
      state.myMoves.push(action.payload);
    },
    removeMyMove: (state) => {
      state.myMoves.pop();
    },
    clearRoom: () => initialState,
  },
});

export const {
  setRoom,
  setRoomId,
  addUser,
  removeUser,
  addUserMove,
  undoUserMove,
  setMovesWithoutUser,
  addMoveWithoutUser,
  addMyMove,
  removeMyMove,
  clearRoom,
} = roomSlice.actions;

export default roomSlice.reducer;
