import { CANVAS_SIZE } from "@/common/constants/canvasSize";
import { useViewPortSize } from "@/common/hooks/useViewPortSize";
import { useMotionValue, motion } from "framer-motion";
import { RefObject, useEffect, useRef, useState } from "react";
import { useKeyPressEvent } from "react-use";
import { socket } from "@/common/lib/socket";

import MiniMap from "./Minimap";
import { useBoardPostion } from "../../hooks/useBoardPostion";
import { useDraw } from "../../hooks/useDraw";
import { useSocketDraw } from "../../hooks/useSocketDraw";
import { useRoom } from "@/common/recoil/room/roomHook";
import { drawAllMoves } from "../../helpers/Canvas.helpers";
import Background from "./Background";

const Canvas = ({ undoRef }: { undoRef: RefObject<HTMLButtonElement | null> }) => {
  const room=useRoom()
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const smallCanvasRef = useRef<HTMLCanvasElement>(null);

  const [ctx, setCtx] = useState<CanvasRenderingContext2D>();
  const [dragging, setDragging] = useState(false);
  const [, setMovedMinimap] = useState(false);

  const { width, height } = useViewPortSize();

  useKeyPressEvent("Control", (e) => {
    if (e.ctrlKey && !dragging) {
      setDragging(true);
    }
  });

  // const x = useMotionValue(0);
  // const y = useMotionValue(0);

  const { x, y } = useBoardPostion();

  const copyCanvasToSmall = () => {
    if (canvasRef.current && smallCanvasRef.current) {
      const smallCtx = smallCanvasRef.current.getContext("2d");
      if (smallCtx) {
        smallCtx.clearRect(0, 0, CANVAS_SIZE.width, CANVAS_SIZE.height);

        smallCtx.drawImage(
          canvasRef.current,
          0,
          0,
          CANVAS_SIZE.width,
          CANVAS_SIZE.height
        );
      }
    }
  };
  const {
    handleDraw,
    handleEndDrawing,
    handleStartDrawing,
    drawing,
    handleUndo,
  } = useDraw(
    ctx,
    dragging,
  );

  useEffect(() => {
    const newCtx = canvasRef.current?.getContext("2d");
    if (newCtx) setCtx(newCtx);

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.ctrlKey && dragging) {
        setDragging(false);
      }
    };
    window.addEventListener("keyup", handleKeyUp);

    const undoBtn=undoRef.current

    undoBtn?.addEventListener("click",handleUndo)

    return () => {
      window.removeEventListener("keyup", handleKeyUp);
      undoBtn?.removeEventListener("click",handleUndo)
    };
  }, [dragging,handleUndo,undoRef]);

  useSocketDraw(ctx,drawing);

  useEffect(() => {
    if (!ctx) return;
    socket.emit("joined_room");
  }, [ctx]);

  useEffect(() => {
    if (!ctx) return;
    drawAllMoves(ctx, room);
    copyCanvasToSmall();
  }, [ctx,room]);

  return (
    <div className="relative h-full w-full overflow-hidden">

      <motion.canvas
        ref={canvasRef}
        width={CANVAS_SIZE.width}
        height={CANVAS_SIZE.height}
        className={`absolute top-0 z-10 ${dragging && "cursor-move"}`}
        style={{ x, y }}
        drag={dragging}
        dragConstraints={{
          left: -(CANVAS_SIZE.width - width),
          right: 0,
          top: -(CANVAS_SIZE.height - height),
          bottom: 0,
        }}
        dragElastic={0}
        dragTransition={{ power: 0, timeConstant: 0 }}
        onMouseDown={(e) => handleStartDrawing(e.clientX, e.clientY)}
        onMouseUp={handleEndDrawing}
        onMouseMove={(e) => {
          handleDraw(e.clientX, e.clientY);
        }}
        onTouchStart={(e) => {
          handleStartDrawing(
            e.changedTouches[0].clientX,
            e.changedTouches[0].clientY
          );
        }}
        onTouchEnd={handleEndDrawing}
        onTouchMove={(e) => {
          handleDraw(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
        }}
      />
      <Background/>
      <MiniMap
        ref={smallCanvasRef}
        dragging={dragging}
        setMovedMinimap={setMovedMinimap}
      />
    </div>
  );
};

export default Canvas;
