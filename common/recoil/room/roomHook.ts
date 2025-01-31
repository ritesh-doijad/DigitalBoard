import { useSelector, useDispatch } from "react-redux";

import { setRoomId } from "../room/roomSlice";
import { AppDispatch, RootState } from "..";

// Get room ID (Replaces `useRecoilValue(roomAtom)`)
export const useRoomId = () => {
  return useSelector((state: RootState) => state.room.id);
};

// Set room ID (Replaces `useSetRecoilState(roomAtom)`)
export const useSetRoomId = () => {
  const dispatch = useDispatch<AppDispatch>();

  return (id: string) => {
    dispatch(setRoomId(id));
  };
};
