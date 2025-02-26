import { socket } from "@/common/lib/socket"
import { useRoom } from "@/common/recoil/room/roomHook"
import { UserMouse } from "./UserMouse"

export const MouseRenderer = () => {
  const room = useRoom()

  if (!room || !room.users) return null 

  const userMap = new Map<string, Move[]>(Object.entries(room.users));

  return (
    <>
      {[...userMap.keys()].map((userId) => {
        if (!socket.id || userId === socket.id) return null; 
        return <UserMouse userId={userId} key={userId} />;
      })}
    </>
  )
}
