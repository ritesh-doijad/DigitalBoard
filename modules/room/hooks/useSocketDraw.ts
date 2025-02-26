import { useEffect, useCallback, useRef } from "react";
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
  drawing: boolean,
) => {
  const dispatch = useDispatch();
  const { id, users, movesWithoutUser, myMoves } = useRoom(); // ✅ Extract full room state

  const prevUsersRef = useRef(users);
  const prevMovesRef = useRef(movesWithoutUser);

  // Emit when the component mounts & ctx is defined
  useEffect(() => {
    if (!ctx) return;
    socket.emit("joined_room");
  }, [ctx]);

  // Handle room data when a user joins
  useEffect(() => {
    const handleJoined = (room: Room, usersToParse: string) => {
      try {
        console.log("Received room data:", room);
        console.log("Received usersToParse:", usersToParse);

        if (!room) {
          console.error("No room data received.");
          return;
        }

        if (!usersToParse || usersToParse === "undefined") {
          usersToParse = "{}"; // Fix: Prevent parsing "undefined"
        }

        const parsedUsersArray = JSON.parse(usersToParse);

        // Ensure it's an array before passing it to Map
        if (!Array.isArray(parsedUsersArray)) {
          console.error("Invalid usersToParse format:", usersToParse);
          return;
        }

        const parsedUsers = new Map<string, Move[]>(parsedUsersArray);

        // ✅ Set moves made before the user joined
        dispatch(setMovesWithoutUser(room.drawed || []));

        // ✅ Add user moves
        parsedUsers.forEach((userMoves, userId) => {
          userMoves.forEach((move) => {
            dispatch(addUserMove({ userId, move }));
          });
        });

        // ✅ Ensure canvas is updated
        if (ctx) {
          drawAllMoves(ctx, {
            id: room.id,
            users: Object.fromEntries(parsedUsers),
            movesWithoutUser: room.drawed || [],
            myMoves: [], // No saved personal moves on join
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
          movesWithoutUser,
          myMoves,
        });
      }
    };

    socket.on("user_undo", handleUserUndo);
    return () => {
      socket.off("user_undo", handleUserUndo);
    };
  }, [ctx, dispatch, id, users, movesWithoutUser, myMoves]);

  // Update refs to prevent stale state
  useEffect(() => {
    prevUsersRef.current = users;
    prevMovesRef.current = movesWithoutUser;
  }, [users, movesWithoutUser]);
};
