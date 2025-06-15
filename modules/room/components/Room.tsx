import { useSelector, useDispatch } from "react-redux";
import RoomContextProvider from "../context/Room.context.";
import Canvas from "./board/Canvas";
import { MousePosition } from "./board/MousePosition";
import { useRef } from "react";

import { useRoom } from "@/common/recoil/room/roomHook";
import { ToolBar } from "./ToolBar/ToolBar";
import NameInput from "./NameInput";
import UserList from "./UsersList";

import { MouseRenderer } from "./board/MouseRenderer";
import Chat from "./chat/Chat";


const Room = () => {
    const room = useRoom()
    const undoRef=useRef<HTMLButtonElement>(null)
    if (!room.id) return <NameInput />;
    return (
        <RoomContextProvider>
            <div className="relative h-screen w-full overflow-hidden">
                <UserList/>
                <ToolBar undoRef={undoRef} />
                <Canvas undoRef={undoRef} />
                <MousePosition />
                <MouseRenderer />
                <Chat/>
            </div>
        </RoomContextProvider>
    );
};

export default Room;
