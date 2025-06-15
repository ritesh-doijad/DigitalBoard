import { useSelector, useDispatch, shallowEqual } from "react-redux";
import {
  addMoveWithoutUser,
  addMyMove,
  addUser,
  addUserMove,
  clearRoom,
  removeMyMove,
  removeUser,
  undoUserMove,
  RoomState,
  setRoom,
  setRoomId,
  setUsersAndMoves,
} from "../room/roomSlice";
import { AppDispatch, RootState } from "..";

export const useRoom = () => {
  return useSelector((state: RootState) => state.room, shallowEqual);
};

export const useSetRoom = () => {
  const dispatch = useDispatch<AppDispatch>();
  return (room: RoomState) => dispatch(setRoom(room));
};

export const useRoomId = () => {
  return useSelector((state: RootState) => state.room.id, shallowEqual);
};

export const useSetRoomId = () => {
  const dispatch = useDispatch<AppDispatch>();
  return (id: string) => dispatch(setRoomId(id));
};

// ✅ Updated to pass both users and moves as Map
export const useSetUsersAndMoves = () => {
  const dispatch = useDispatch<AppDispatch>();
  return (data: {
    id: string;
    usersMoves: { [userId: string]: Move[] };
    users: Map<string, User>; // Directly accepting Map
  }) => {
    // Dispatch action with Map users, no conversion needed
    dispatch(setUsersAndMoves(data));
  };
};

// ✅ Updated to pass both userId and username
export const useUserActions = () => {
  const dispatch = useDispatch<AppDispatch>();

  const addUserToRoom = (userId: string, name: string) => {
    dispatch(addUser({ userId, name }));
  };

  const removeUserFromRoom = (userId: string) => {
    dispatch(removeUser(userId));
  };

  const addMoveToUser = (userId: string, move: Move) => {
    dispatch(addUserMove({ userId, move }));
  };

  const undoLastMoveForUser = (userId: string) => {
    dispatch(undoUserMove(userId));
  };

  return { addUserToRoom, removeUserFromRoom, addMoveToUser, undoLastMoveForUser };
};

// Manage current user's moves
export const useMyMoves = () => {
  const dispatch = useDispatch<AppDispatch>();
  const myMoves = useSelector((state: RootState) => state.room.myMoves);

  const addMove = (move: Move) => {
    dispatch(addMyMove(move));
  };

  const removeMove = () => {
    dispatch(removeMyMove());
  };

  return { addMove, removeMove, myMoves };
};
