import { useOptionsState } from "@/common/recoil/options/options.hooks";
import { AnimatePresence ,motion} from "framer-motion";
import { useRef, useState } from "react";
import { BsBorderWidth } from "react-icons/bs";
import { useClickAway } from "react-use";


const LineWidthPicker = () => {
  const [options, { setLineWidth }] = useOptionsState();

  const ref = useRef<HTMLDivElement>(null);
  const [opened, setOpened] = useState(false);

  useClickAway(ref, () => setOpened(false));

  return (
    <div className="relative flex items-center" ref={ref}>
      <button
        className="text-xl"
        onClick={() => setOpened(!opened)}
      >
        <BsBorderWidth/>
      </button>

      <AnimatePresence>
        {opened && (
          <motion.div
            className="absolute top-[6px] left-14 w-36"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ ease: "easeInOut", duration: 0.2 }}
          >
            <input
              type="range"
              min={1}
              max={20}
              value={options.lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value))}
              className="h-4 w-full cursor-pointer appearance-none rounded-lg bg-gray-200"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LineWidthPicker;
