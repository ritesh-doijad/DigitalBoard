import { getNextColor } from "@/common/lib/getNextColor";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { enableMapSet } from 'immer';

enableMapSet();

export interface RoomState {
  id: string;
  usersMoves: { [userId: string]: Move[] }; // Parsed from Map<string, Move[]>
  users: Map<string, User>; // Using Map<string, string> for users
  movesWithoutUser: Move[];
  myMoves: Move[];
}

const initialState: RoomState = {
  id: "",
  usersMoves: {},
  users: new Map(), // Initialize as a Map
  movesWithoutUser: [],
  myMoves: [],
};

const roomSlice = createSlice({
  name: "room",
  initialState,
  reducers: {
    setRoom: (state, action: PayloadAction<RoomState>) => {
      return action.payload;
    },
    setRoomId: (state, action: PayloadAction<string>) => {
      state.id = action.payload;
    },
    addUser: (state, action: PayloadAction<{ userId: string; name: string }>) => {
      const { userId, name } = action.payload;
    
      if (!state.usersMoves[userId]) {
        state.usersMoves[userId] = [];
      }
    
      const color = getNextColor([...state.users.values()].at(-1)?.color);
    
      state.users.set(userId, { name, color });
    },

    removeUser: (state, action: PayloadAction<string>) => {
      delete state.usersMoves[action.payload]; // Correctly delete user moves
      state.users.delete(action.payload); // Use Map's delete method
    },
    addUserMove: (state, action: PayloadAction<{ userId: string; move: Move }>) => {
      if (!state.usersMoves[action.payload.userId]) {
        state.usersMoves[action.payload.userId] = [];
      }
      state.usersMoves[action.payload.userId].push(action.payload.move);
    },
    undoUserMove: (state, action: PayloadAction<string>) => {
      if (state.usersMoves[action.payload]?.length) {
        state.usersMoves[action.payload].pop();
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
    setUsersAndMoves: (state, action: PayloadAction<{
      id: string;
      usersMoves: { [userId: string]: Move[] };
      users: Map<string, User>; // Accepting Map directly
    }>) => {
      state.id = action.payload.id;
      state.usersMoves = action.payload.usersMoves;
      state.users = action.payload.users; // No need for conversion
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
  setUsersAndMoves,
  clearRoom,
} = roomSlice.actions;

export default roomSlice.reducer;
