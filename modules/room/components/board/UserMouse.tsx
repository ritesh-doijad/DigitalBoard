import { useEffect, useState } from "react";
import { useBoardPostion } from "../../hooks/useBoardPostion";
import { socket } from "@/common/lib/socket";
import { motion } from "framer-motion";
import { BsCursorFill } from "react-icons/bs";
import { useRoom } from "@/common/recoil/room/roomHook";

export const UserMouse = ({ userId }: { userId: string }) => {
  const { users } = useRoom();
  const [msg, setMsg] = useState("");
  const boardPos = useBoardPostion();
  const [x, setX] = useState(boardPos.x.get());
  const [y, setY] = useState(boardPos.y.get());

  const [pos, setPos] = useState({ x: -1, y: -1 });

  useEffect(() => {
    socket.on("mouse_moved", (newX, newY, socketIdMoved) => {
      if (socketIdMoved === userId) {
        setPos({ x: newX, y: newY });
      }
    });

    const handleNewMsg = (msgUserId: string, newMsg: string) => {
      if (msgUserId === userId) {
        setMsg(newMsg);

        setTimeout(() => {
          setMsg("");
        }, 3000);
      }
    };
    socket.on("new_msg", handleNewMsg);
    return () => {
      socket.off("mouse_moved");
      socket.off("new_msg", handleNewMsg);
    };
  }, [userId]);

  useEffect(() => {
    const unsubscribe = boardPos.x.on("change", setX);
    return unsubscribe;
  }, [boardPos.x]);
  useEffect(() => {
    const unsubscribe = boardPos.y.on("change", setY);
    return unsubscribe;
  }, [boardPos.y]);

  const user = users.get(userId);

  return (
    <motion.div
      className={`absolute top-0 left-0 text-blue-800 ${
        pos.x === -1 && `hidden`
      } pointer-events-none`}
      style={{ color: user?.color }}
      animate={{ x: pos.x + x, y: pos.y + y }}
      transition={{ duration: 0.2, ease: "linear" }}
    >
      <BsCursorFill className="-rotate-90" />
      {msg && (
        <p className="absolute top-full left-5 max-h-20 max-w-[15rem] overflow-hidden text-ellipsis rounded-md bg-zinc-900 p-1 px-3 text-white">
          {msg}
        </p>
      )}
      <p className="ml-2">{user?.name || "Anonymous"}</p>
    </motion.div>
  );
};
