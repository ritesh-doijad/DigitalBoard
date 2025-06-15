
import { useBoardPostion } from "./useBoardPostion";

import { useCallback, useEffect, useRef, useState } from "react";
import { socket } from "@/common/lib/socket";
import { getPos } from "@/common/lib/getPos";
import { useOptions } from "@/common/recoil/options/options.hooks";
import { useMyMoves } from "@/common/recoil/room/roomHook";

export const useDraw = (
  ctx: CanvasRenderingContext2D | undefined,
  blocked: boolean
) => {
  const { addMove: handleAddMyMove, removeMove: handleRemoveMyMove } = useMyMoves();
  const options = useOptions();
  const [drawing, setDrawing] = useState(false);
  const tempMovesRef = useRef<[number, number][]>([]);

  const boardPosition = useBoardPostion();
  const movedX = boardPosition.x;
  const movedY = boardPosition.y;

  // ✅ Undo last move & notify the server
  const handleUndo = useCallback(() => {
    if (!ctx) return;
    handleRemoveMyMove();
    socket.emit("undo");
  }, [ctx, handleRemoveMyMove]);

  // ✅ Prevents Ctrl+Z from triggering inside input fields
  useEffect(() => {
    const handleUndoKeyboard = (e: KeyboardEvent) => {
      if (e.key === "z" && e.ctrlKey) {
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement.tagName !== "INPUT" && activeElement.tagName !== "TEXTAREA") {
          e.preventDefault();
          handleUndo();
        }
      }
    };

    document.addEventListener("keydown", handleUndoKeyboard);
    return () => {
      document.removeEventListener("keydown", handleUndoKeyboard);
    };
  }, [handleUndo]);

  useEffect(()=>{
    socket.on("your_move",(move)=>{
      handleAddMyMove(move)
    })

    return ()=>{
      socket.off("your_move")
    }
  })

  // ✅ Handles the start of a drawing stroke
  const handleStartDrawing = useCallback((x: number, y: number) => {
    if (!ctx || blocked) return;

    setDrawing(true);
    const startX = getPos(x, movedX);
    const startY = getPos(y, movedY);

    // Apply latest options before starting a new stroke
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.lineWidth = options.lineWidth;
    ctx.strokeStyle = options.lineColor;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX, startY);
    ctx.stroke();

    tempMovesRef.current = [[startX, startY]];
  }, [ctx, blocked, movedX, movedY, options]);

  // ✅ Ends the drawing and emits move data
  const handleEndDrawing = useCallback(() => {
    if (!ctx || blocked) return;

    setDrawing(false);
    ctx.closePath();

    if (tempMovesRef.current.length === 0) return; // Prevent empty moves

    const move: Move = {
      path: tempMovesRef.current,
      options,
      timestamp:0,
      eraser:options.erase,
    };

   
    tempMovesRef.current = [];
    ctx.globalCompositeOperation='source-over'
    socket.emit("draw", move);
  }, [ctx, blocked, handleAddMyMove, options]);

  // ✅ Handles real-time drawing
  const handleDraw = useCallback((x: number, y: number) => {
    if (!ctx || !drawing || blocked) return;

    const drawX = getPos(x, movedX);
    const drawY = getPos(y, movedY);

    ctx.lineTo(drawX, drawY);
    ctx.stroke();

    tempMovesRef.current.push([drawX, drawY]);
  }, [ctx, drawing, blocked, movedX, movedY]);

  return {
    handleDraw,
    handleEndDrawing,
    handleStartDrawing,
    handleUndo,
    drawing,
  };
};
