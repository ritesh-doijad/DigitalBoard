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
          x.set(-miniX.get() * 7);
          y.set(-miniY.get() * 7);
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
        className="absolute right-10 top-10 z-30 rounded-lg bg-zinc-200"
        ref={containerRef}
        style={{
          width: CANVAS_SIZE.width / 7,
          height: CANVAS_SIZE.height / 7,
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
          className="absolute top-0 left-0 cursor-grab border-2 rounded-lg border-red-500"
          style={{
            width: width / 7,
            height: height / 7,
            x: miniX,
            y: miniY,
          }}
          animate={{ x: -x.get() / 7, y: -y.get() / 7 }}
          transition={{ duration: 0 }}
        />
      </div>
    );
  }
);

MiniMap.displayName = "MiniMap";

export default MiniMap;
