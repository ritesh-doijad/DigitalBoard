import { RootState } from "@/common/recoil/index";
import { useDispatch, useSelector } from "react-redux";
import { setLineColor, setLineWidth } from "./optionsSlice";
 // Adjust the path to your `store.ts`

export const useOptions = () => {
  return useSelector((state: RootState) => state.options);
};

export const useSetOptions=()=>{
  const dispatch=useDispatch()

  const setOptions = {
    setLineColor: (color: string) => dispatch(setLineColor(color)),
    setLineWidth: (width: number) => dispatch(setLineWidth(width)),
  };
  return setOptions;
}

