import { CANVAS_SIZE } from "@/common/constants/canvasSize";
import { useViewPortSize } from "@/common/hooks/useViewPortSize";
import { MotionValue, useMotionValue, motion } from "framer-motion";
import React, {
  Dispatch,
  forwardRef,
  SetStateAction,
  useEffect,
  useRef,
} from "react";
import { useBoardPostion } from "../hooks/useBoardPostion";

interface MiniMapProps {
  
  dragging: boolean;
  setMovedMinimap: Dispatch<SetStateAction<boolean>>;
}

const MiniMap = forwardRef<HTMLCanvasElement, MiniMapProps>(
  ({ dragging, setMovedMinimap }, ref) => {
    const {x,y}=useBoardPostion();
    const containerRef = useRef<HTMLDivElement>(null);
    const { width, height } = useViewPortSize();

    const miniX = useMotionValue(0);
    const miniY = useMotionValue(0);

    useEffect(() => {
      const updatePosition = () => {
        if (!dragging) {
          x.set(-miniX.get() * 10);
          y.set(-miniY.get() * 10);
        }
      };

      const unsubscribeX = miniX.on("change", updatePosition);
      const unsubscribeY = miniY.on("change", updatePosition);

      return () => {
        unsubscribeX();
        unsubscribeY();
      };
    }, [dragging, miniX, miniY, x, y]);

    return (
      <div
        className="absolute right-10 top-10 z-50 bg-zinc-400"
        ref={containerRef}
        style={{
          width: CANVAS_SIZE.width / 10,
          height: CANVAS_SIZE.height / 10,
        }}
      >
        <canvas
          ref={ref}
          width={CANVAS_SIZE.width}
          height={CANVAS_SIZE.height}
          className="h-full w-full"
        />
        <motion.div
          drag
          dragConstraints={containerRef}
          dragElastic={0}
          dragTransition={{ power: 0, timeConstant: 0 }}
          onDragStart={()=>setMovedMinimap((prev)=>!prev)}
          onDragEnd={() => setMovedMinimap((prev) => !prev)}
          className="absolute top-0 left-0 cursor-grab border-2 border-red-500"
          style={{
            width: width / 10,
            height: height / 10,
            x: miniX,
            y: miniY,
          }}
          animate={{ x: -x.get() / 10, y: -y.get() / 10 }}
          transition={{ duration: 0 }}
        />
      </div>
    );
  }
);

MiniMap.displayName = "MiniMap";

export default MiniMap;
