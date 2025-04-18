import { useSelector, useDispatch } from "react-redux";
import RoomContextProvider from "../context/Room.context.";
import Canvas from "./Canvas";
import { MousePosition } from "./MousePosition";
import { MouseRenderer } from "./MouseRenderer";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { socket } from "@/common/lib/socket";
import { useRoom } from "@/common/recoil/room/roomHook";
import { setRoomId } from "@/common/recoil/room/roomSlice";
import { ToolBar } from "./ToolBar/ToolBar";


const Room = () => {
    const room = useRoom()
    const dispatch = useDispatch();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const handleJoined = (roomIdFromServer: string, failed?: boolean) => {
            if (failed) {
                router.push("/");
            } else {
                dispatch(setRoomId(roomIdFromServer));
                setIsLoading(false); // Stop loading when roomId is set
            }
        };

        socket.on("joined", handleJoined);

        return () => {
            socket.off("joined", handleJoined);
        };
    }, [router, dispatch]);

    useEffect(() => {
        if (room.id) {
            const dynamicRoomId = router.query.roomId?.toString();
            if (dynamicRoomId && room.id !== dynamicRoomId) {
                socket.emit("join_room", dynamicRoomId);
            }
            setIsLoading(false);
        }
    }, [room.id, router.query.roomId]);

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return (
        <RoomContextProvider>
            <div className="relative h-screen w-full overflow-hidden">
                <ToolBar />
                <Canvas />
                <MousePosition />
                <MouseRenderer />
            </div>
        </RoomContextProvider>
    );
};

export default Room;
