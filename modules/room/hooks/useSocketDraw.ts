import { useEffect, useRef } from "react";
import { socket } from "@/common/lib/socket";
import { useDispatch } from "react-redux";

import { drawAllMoves, handleMove } from "../helpers/Canvas.helpers";
import {
  setMovesWithoutUser,
  addUserMove,
  undoUserMove,
} from "@/common/recoil/room/roomSlice";
import { useRoom } from "@/common/recoil/room/roomHook";

export const useSocketDraw = (
  ctx: CanvasRenderingContext2D | undefined,
  drawing: boolean
) => {
  const dispatch = useDispatch();
  const { id, users, movesWithoutUser, myMoves, usersMoves } = useRoom(); // ✅ Extract full room state

  const prevUsersRef = useRef(users);
  const prevMovesRef = useRef(movesWithoutUser);

  // Emit when the component mounts & ctx is defined
  useEffect(() => {
    if (!ctx) return;
    socket.emit("joined_room");
  }, [ctx]);

  // Handle room data when a user joins
  useEffect(() => {
    const handleJoined = (
      room: Room,
      usersSerialized: string,
      usersMovesSerialized: string
    ) => {
      try {
        console.log("Received room data:", room);
        console.log("Received usersSerialized:", usersSerialized);
        console.log("Received usersMovesSerialized:", usersMovesSerialized);
    
        if (!room) {
          console.error("No room data received.");
          return;
        }
    
        if (!usersSerialized || usersSerialized === "undefined") {
          usersSerialized = "[]";
        }
    
        if (!usersMovesSerialized || usersMovesSerialized === "undefined") {
          usersMovesSerialized = "[]";
        }
    
        // Deserialize both into Map-like arrays
        const parsedUsersArray: [string, string][] = JSON.parse(usersSerialized);
        const parsedUsersMovesArray: [string, Move[]][] = JSON.parse(usersMovesSerialized);
    
        if (!Array.isArray(parsedUsersArray) || !parsedUsersArray.every(i => Array.isArray(i) && i.length === 2)) {
          console.error("Invalid usersSerialized format");
          return;
        }
    
        if (!Array.isArray(parsedUsersMovesArray) || !parsedUsersMovesArray.every(i => Array.isArray(i) && i.length === 2)) {
          console.error("Invalid usersMovesSerialized format");
          return;
        }
    
        const usersMap = new Map<string, string>(parsedUsersArray);
        const usersMoves = new Map<string, Move[]>(parsedUsersMovesArray);
    
        // ✅ Set moves made before the user joined
        dispatch(setMovesWithoutUser(room.drawed || []));
    
        // ✅ Add user moves
        usersMoves.forEach((moves, userId) => {
          moves.forEach((move) => {
            dispatch(addUserMove({ userId, move }));
          });
        });
    
        // ✅ Draw on canvas
        if (ctx) {
          drawAllMoves(ctx, {
            id: room.id,
            users:usersMap, // <- this one is for canvas (plain object)
            usersMoves: Object.fromEntries(usersMoves), // <- same
            movesWithoutUser: room.drawed || [],
            myMoves: [],
          });
        }
      } catch (error) {
        console.error("Error handling joined room data:", error);
      }
    };
    
    

    socket.emit("request_room_data");
    socket.on("room", handleJoined);

    return () => {
      socket.off("room", handleJoined);
    };
  }, [ctx, dispatch]);

  // Handle real-time drawing
  useEffect(() => {
    const handleUserDraw = (move: Move, userId: string) => {
      if (!ctx || drawing) return;

      handleMove(move, ctx);
      dispatch(addUserMove({ userId, move }));
    };

    socket.on("user_draw", handleUserDraw);
    return () => {
      socket.off("user_draw", handleUserDraw);
    };
  }, [ctx, drawing, dispatch]);

  // Handle undo
  useEffect(() => {
    const handleUserUndo = (userId: string) => {
      dispatch(undoUserMove(userId));

      // ✅ Draw using the latest state, not previous refs
      if (ctx) {
        drawAllMoves(ctx, {
          id,
          users,
          usersMoves,  // Ensure usersMoves is passed for state consistency
          movesWithoutUser,
          myMoves,
        });
      }
    };

    socket.on("user_undo", handleUserUndo);
    return () => {
      socket.off("user_undo", handleUserUndo);
    };
  }, [ctx, dispatch, id, users, movesWithoutUser, myMoves, usersMoves]);

  // Update refs to prevent stale state
  useEffect(() => {
    prevUsersRef.current = users;
    prevMovesRef.current = movesWithoutUser;
  }, [users, movesWithoutUser]);
};
