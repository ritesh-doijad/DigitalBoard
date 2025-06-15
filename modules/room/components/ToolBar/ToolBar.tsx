import { useSetOptions } from "@/common/recoil/options/options.hooks";
import ColorPicker from "./ColorPicker";
import LineWidthPicker from "./LineWidthPicker";
import { BsFillChatFill, BsFillImageFill, BsThreeDots ,} from "react-icons/bs";
import { HiOutlineDownload } from "react-icons/hi";
import { RefObject } from "react";
import { Button } from "@/components/ui/button";
import { FaUndo } from "react-icons/fa";
import EraserComponent from "./Eraser";

export const ToolBar = ({ undoRef }: { undoRef: RefObject<HTMLButtonElement | null> }) => {
    return (
        <div
            className=" absolute left-10 top-[50%] z-50 flex flex-col items-center rounded-lg p-5 gap-5 bg-zinc-900 text-white"
            style={{ transform: "translateY(-50%)" }}
        >
            <Button className="text-xl" ref={undoRef}>
                <FaUndo/>
            </Button>
            <div className="h-px w-full bg-white"></div>
            <ColorPicker/>
            <LineWidthPicker/>
            <EraserComponent/>
        <button className="text-xl">
         <BsFillImageFill/>
        </button>
        <button className="text-xl">
         <BsThreeDots/>
        </button>
        <button className="text-xl">
         <HiOutlineDownload/>
        </button>
        </div>
    );
};
