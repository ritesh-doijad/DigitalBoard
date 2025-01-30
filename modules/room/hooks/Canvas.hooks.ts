
import { useCallback, useEffect, useState } from "react";
import { socket } from "@/common/lib/socket";
import { useOptions } from "@/common/recoil/options/options.hooks";
import { drawOnUndo, handleMove } from "../helpers/Canvas.helpers";
import { useUsers } from "@/common/recoil/users/users.hooks";
import { useBoardPostion } from "./useBoardPostion";
import { getPos } from "@/common/lib/getPos";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/common/recoil/users";
import { useSetRecoilState } from "recoil";
import { setUsers, undoUserMove, updateUser } from "@/common/recoil/users/usersSlice";

const savedMoves: Move[] = [];
let moves: [number, number][] = [];

export const useDraw = (
  ctx: CanvasRenderingContext2D | undefined,
  blocked: boolean,

  handleEnd: () => void
) => {
  const users = useUsers();
  const options = useOptions();
  const [drawing, setDrawing] = useState(false);

  const boardPostion = useBoardPostion();

  const movedX = boardPostion.x;
  const movedY = boardPostion.y;

  useEffect(() => {
    if (ctx) {
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.lineWidth = options.lineWidth;
      ctx.strokeStyle = options.lineColor;
    }
  });

  const handleUndo = useCallback(() => {
    if (ctx) {
      savedMoves.pop();
      socket.emit("undo");

      drawOnUndo(ctx, savedMoves, users);

      handleEnd();
    }
  }, [ctx, handleEnd, users]);

  useEffect(() => {
    const hanldeUndoKeyboard = (e: KeyboardEvent) => {
      if (e.key === "z" && e.ctrlKey) {
        handleUndo();
      }
    };
    document.addEventListener("keydown", hanldeUndoKeyboard);

    return () => {
      document.removeEventListener("keydown", hanldeUndoKeyboard);
    };
  }, [handleUndo]);

  const handleStartDrawing = (x: number, y: number) => {
    if (!ctx || blocked) return;

    setDrawing(true);

    ctx.beginPath();
    ctx.lineTo(getPos(x, movedX), getPos(y, movedY));
    ctx.stroke();
  };

  const handleEndDrawing = () => {
    if (!ctx || blocked) return;
    setDrawing(false);

    const move:Move={
      path:moves,
      options
    }
    
    ctx.closePath();
    savedMoves.push(move);
    socket.emit("draw", move);

    moves = [];
    handleEnd();
  };

  const handleDraw = (x: number, y: number) => {
    if (!ctx || !drawing || blocked) {
      return;
    }

    ctx.lineTo(getPos(x, movedX), getPos(y, movedY));
    ctx.stroke();

    moves.push([getPos(x, movedX), getPos(y, movedY)]);
  };
  return {
    handleDraw,
    handleEndDrawing,
    handleStartDrawing,
    handleUndo,
    drawing,
  };
};

export const useSocketDraw = (
  ctx: CanvasRenderingContext2D | undefined,
  drawing: boolean,
  handleEnd: () => void
) => {
  const dispatch = useDispatch();
  const users = useSelector((state: RootState) => state.users);

// Wait until ctx is ready
useEffect(() => {
  console.log("Sending 'joined_room' event to the server...");
  socket.emit("joined_room");
}, []);

useEffect(() => {
  console.log("useEffect running...");
  if (!ctx) {
      console.log("Waiting for ctx to be ready...");
      return;
  }
  console.log("ctx is now available, setting up socket listener...");

  const handleJoined = (roomJSON: string) => {
      console.log("Raw roomJSON received:", roomJSON);
      try {
          // Try parsing room data
          const room: Room = new Map(JSON.parse(roomJSON));
          console.log("Parsed room data:", room);

          // Process moves for each user
          room.forEach((userMoves, userId) => {
              console.log(`Processing moves for user: ${userId}, Total moves: ${userMoves.length}`);
              if (userMoves.length > 0) {
                  userMoves.forEach((move, index) => {
                      console.log(`Processing move ${index + 1} for user ${userId}:`, move);
                      handleMove(move, ctx);
                  });
              } else {
                  console.log(`No moves for user: ${userId}`);
              }
          });

          console.log("Handling end of move processing...");
          handleEnd(); // Handle end after processing moves

          // Dispatch updated users with the previous state
          console.log("Dispatching updated users to state...");
          room.forEach((userMoves, userId) => {
              console.log(`Updating state for user ${userId}:`, userMoves);
              dispatch(setUsers({ ...users, [userId]: userMoves }));
          });

      } catch (error) {
          console.error("Error handling joined room data:", error);
      }
  };

  // Request room data after connecting
  console.log("Emitting 'request_room_data' event to server...");
  socket.emit("request_room_data");

  // Listen for the 'room' event
  console.log("Setting up socket listener for 'room' event...");
  socket.on("room", handleJoined);

  // Cleanup socket listener on unmount
  return () => {
      console.log("Cleaning up socket listener...");
      socket.off("room", handleJoined);
  };
}, [ctx]);


  // socket.on("joined", (roomData) => {
  //   console.log("Room Data:", roomData);
  //   // Handle the room data here (e.g., display moves, etc.)
  // });
  

  useEffect(() => {
    let moveToDrawLater: Move | undefined;
    let userIdLater: string = "";
    socket.on("user_draw", (move, userId) => {
      if(!userId && !move){
        console.log('empptyyyyyyyyy')
        return ;
      }
      if (ctx && !drawing) {
        handleMove(move, ctx);

        dispatch(
         updateUser({
            id: userId,
            data: [...(users?.[userId] || []), move],
          })
        );
      } else {
        moveToDrawLater = move;
        userIdLater = userId;
      }
    });

    return () => {
      socket.off("user_draw");

      if (moveToDrawLater && userIdLater && ctx) {
        handleMove(moveToDrawLater, ctx);
        handleEnd();
        dispatch(
          updateUser({
            id: userIdLater,
            data: [...(users[userIdLater] || []), moveToDrawLater as Move],
          })
        );
      }
    };
  }, [ctx, dispatch, handleEnd, drawing]);

  useEffect(() => {
    socket.on("user_undo", (userId) => {
      // Dispatch undoUserMove action to remove the last move for the user
      dispatch(undoUserMove(userId));

      if (ctx) {
        // Assuming you have a function to handle undo drawing
        drawOnUndo(ctx, savedMoves, users);
        handleEnd();
      }
    });
    return ()=>{
      socket.off("user_undo")
    }
  },[ctx,handleEnd,dispatch]);
};
