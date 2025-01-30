import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface RoomState {
  id: string;
}

const initialState: RoomState = {
  id: "",
};

const roomSlice = createSlice({
  name: "room",
  initialState,
  reducers: {
    setRoomId: (state, action: PayloadAction<string>) => {
      state.id = action.payload;
    },
  },
});

export const { setRoomId } = roomSlice.actions;
export default roomSlice.reducer;
