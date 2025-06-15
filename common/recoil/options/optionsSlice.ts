import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface OptionsState {
  lineColor: string;
  lineWidth: number;
  erase: boolean;
}

const initialState: OptionsState = {
  lineColor: "#000",
  lineWidth: 5,
  erase: false,
};

const optionsSlice = createSlice({
  name: "options",
  initialState,
  reducers: {
    setLineColor(state, action: PayloadAction<string>) {
      state.lineColor = action.payload;
    },
    setLineWidth(state, action: PayloadAction<number>) {
      state.lineWidth = action.payload;
    },
    toggleErase(state) {
      state.erase = !state.erase; // Action to toggle the erase state
    },
  },
});

export const { setLineColor, setLineWidth ,toggleErase} = optionsSlice.actions;
export default optionsSlice.reducer;
