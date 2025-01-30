import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface OptionsState {
  lineColor: string;
  lineWidth: number;
}

const initialState: OptionsState = {
  lineColor: "#000",
  lineWidth: 5,
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
  },
});

export const { setLineColor, setLineWidth } = optionsSlice.actions;
export default optionsSlice.reducer;
