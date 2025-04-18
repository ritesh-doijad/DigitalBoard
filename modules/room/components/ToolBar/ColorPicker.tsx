
import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";
import { useClickAway } from "react-use";
import { HexColorPicker } from "react-colorful"; 
import { useOptionsState } from "@/common/recoil/options/options.hooks";

const ColorPicker = () => {
  const [options, { setLineColor }] = useOptionsState();

  const ref = useRef<HTMLDivElement>(null);
  const [opened, setOpened] = useState(false);

  useClickAway(ref, () => setOpened(false));

  return (
    <div className="relative flex items-center" ref={ref}>
      <button
        className="w-6 h-6 rounded-full border-2 border-white transition-all hover:scale-125 active:scale-100"
        style={{ backgroundColor: options.lineColor }}
        onClick={() => setOpened(!opened)}
      >
        <AnimatePresence>
          {opened && (
            <motion.div
              className="absolute top-0 left-14"
              initial={{ y: -30, opacity: 0 }}  // ✅ Directly using Framer Motion
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ ease: "easeInOut", duration: 0.2 }}
            >
              <HexColorPicker color={options.lineColor} onChange={setLineColor} />
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
};

export default ColorPicker;
