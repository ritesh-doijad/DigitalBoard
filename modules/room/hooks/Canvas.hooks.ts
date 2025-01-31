
import { useCallback, useEffect, useState } from "react";
import { socket } from "@/common/lib/socket";
import { useOptions } from "@/common/recoil/options/options.hooks";
import { drawAllMoves, handleMove } from "../helpers/Canvas.helpers";
import { useUsers } from "@/common/recoil/users/users.hooks";
import { useBoardPostion } from "./useBoardPostion";
import { getPos } from "@/common/lib/getPos";
import { useDispatch, useSelector } from "react-redux";
import { setUsers, undoUserMove, updateUser } from "@/common/recoil/users/usersSlice";
import { RootState } from "@/common/recoil";

const movesWithoutUser:Move[]=[]
const savedMoves: Move[] = [];
let tempMoves: [number, number][] = [];

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

      drawAllMoves(ctx,movesWithoutUser, savedMoves, users);

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

    tempMoves.push([getPos(x,movedX),getPos(y,movedY)])
  };

  const handleEndDrawing = () => {
    if (!ctx || blocked) return;
    setDrawing(false);

    ctx.closePath();
    const move:Move={
      path:tempMoves,
      options
    }
    
    savedMoves.push(move);
    tempMoves = [];
    socket.emit("draw", move);
drawAllMoves(ctx,movesWithoutUser,savedMoves,users)
    


    handleEnd();
  };

  const handleDraw = (x: number, y: number) => {
    if (!ctx || !drawing || blocked) {
      return;
    }

    ctx.lineTo(getPos(x, movedX), getPos(y, movedY));
    ctx.stroke();

    tempMoves.push([getPos(x, movedX), getPos(y, movedY)]);
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
  if(ctx)socket.emit("joined_room");
}, [ctx]);

useEffect(() => {
  console.log("useEffect running...");
  if (!ctx) {
      console.log("Waiting for ctx to be ready...");
      return;
  }
  console.log("ctx is now available, setting up socket listener...");

  const handleJoined = (room: Room, usersToParse: string) => {
    try {
        console.log("Room data:", room);
        console.log("usersToParse value:", usersToParse);

        // Ensure usersToParse is a valid string
        if (!usersToParse || usersToParse === "undefined") {
          console.error("Invalid or undefined usersToParse data.");
          return;
      }

        // Try parsing the JSON string into an object
        const users = new Map<string, Move[]>(JSON.parse(usersToParse));

        // Process moves for each user
        room.drawed.forEach((move: Move) => {
            handleMove(move, ctx);
            movesWithoutUser.push(move);
        });

        users.forEach((userMoves, userId) => {
            userMoves.forEach((move) => handleMove(move, ctx));

            // Convert Map to object and dispatch
            dispatch(setUsers(Object.fromEntries(users)));
        });

        console.log("Handling end of move processing...");
        handleEnd(); // Handle end after processing moves

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
        drawAllMoves(ctx,movesWithoutUser, savedMoves, users);
        handleEnd();
      }
    });
    return ()=>{
      socket.off("user_undo")
    }
  },[ctx,handleEnd,dispatch]);
};