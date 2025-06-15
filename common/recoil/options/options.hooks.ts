import { RootState } from "@/common/recoil/index";
import { useDispatch, useSelector } from "react-redux";
import { setLineColor, setLineWidth, toggleErase } from "./optionsSlice";
 // Adjust the path to your `store.ts`

export const useOptions = () => {
  return useSelector((state: RootState) => state.options);
};

export const useSetOptions=()=>{
  const dispatch=useDispatch()

  const setOptions = {
    setLineColor: (color: string) => dispatch(setLineColor(color)),
    setLineWidth: (width: number) => dispatch(setLineWidth(width)),
    toggleErase: () => dispatch(toggleErase()),
  };
  return setOptions;
}

export const useOptionsState = () => {
  const options = useSelector((state: RootState) => state.options);
  const dispatch = useDispatch();

  return [
    options,
    {
      setLineColor: (color: string) => dispatch(setLineColor(color)),
      setLineWidth: (width: number) => dispatch(setLineWidth(width)),
      toggleErase: () => dispatch(toggleErase()),
    },
  ] as const;
};
