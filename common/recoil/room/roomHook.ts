import { useSelector, useDispatch, shallowEqual } from "react-redux";
import {
  addMoveWithoutUser,
  addMyMove,
  addUser,
  addUserMove,
  clearRoom,
  removeMyMove,
  removeUser,
  undoUserMove, // Renamed from removeUserMove
  RoomState,
  setRoom,
  setRoomId,
} from "../room/roomSlice";
import { AppDispatch, RootState } from "..";

export const useRoom = () => {
  return useSelector((state: RootState) => state.room, shallowEqual);
};

// Set the entire room state
export const useSetRoom = () => {
  const dispatch = useDispatch<AppDispatch>();
  return (room: RoomState) => dispatch(setRoom(room));
};

// Get room ID
export const useRoomId = () => {
  return useSelector((state: RootState) => state.room.id, shallowEqual);
};

// Set room ID
export const useSetRoomId = () => {
  const dispatch = useDispatch<AppDispatch>();
  return (id: string) => dispatch(setRoomId(id));
};

// Manage users (Add, Remove, Manage Moves)
export const useUserActions = () => {
 

  const dispatch = useDispatch<AppDispatch>();

  const addUserToRoom = (userId: string) => {
    dispatch(addUser(userId)); // Fix: Pass only userId as a string
  };

  const removeUserFromRoom = (userId: string) => {
    dispatch(removeUser(userId));
  };

  const addMoveToUser = (userId: string, move: Move) => {
    dispatch(addUserMove({ userId, move }));
  };

  const undoLastMoveForUser = (userId: string) => {
    dispatch(undoUserMove(userId)); // Updated to match roomSlice reducer
  };

  return { addUserToRoom, removeUserFromRoom, addMoveToUser, undoLastMoveForUser };
};

// Manage current user's moves
export const useMyMoves = () => {
  const dispatch = useDispatch<AppDispatch>();
  const myMoves = useSelector((state: RootState) => state.room.myMoves);

  const addMove = (move:Move) => {
    dispatch(addMyMove(move));
  };

  const removeMove = () => {
    dispatch(removeMyMove());
  };

  return { addMove, removeMove, myMoves };
};
