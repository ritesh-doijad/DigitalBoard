import { socket } from "@/common/lib/socket";
import { useSetRoomId } from "@/common/recoil/room/roomHook";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";
import React, { FormEvent, useEffect, useState } from "react";

const NameInput = () => {
  const setRoomId = useSetRoomId();

  const [name, setName] = useState("");

  const router = useRouter();

  const roomId = (router.query.roomId || "").toString();

  useEffect(() => {
    if (!roomId) return;

    socket.emit("check_room", roomId);
    socket.on("room_exists", (exists) => {
      console.log("room_exists", exists);

      if (!exists) {
        router.push("/");
      }
    });

    return () => {
      socket.off("room_exists");
    };
  }, [roomId, router]);

  useEffect(() => {
    const handleJoined = (roomIdFromServer: string, failed?: boolean) => {
      if (failed) router.push("/");
      else setRoomId(roomIdFromServer);
    };

    socket.on("joined", handleJoined);

    return () => {
      socket.off("joined", handleJoined);
    };
  }, [router, setRoomId]);

  const handleJoinRoom = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    socket.emit("join_room", roomId, name);
  };
  return (
    <form
      className="flex flex-col items-center"
      onSubmit={handleJoinRoom}
      action=""
    >
      <h1 className="mt-24 text-extra font-extrabold leading-tight">
        DigiBoard
      </h1>
      <h3 className="text-2xl ">Real Time white Board</h3>
      <div className="mt-10 mb-3 flex flex-col gap-2">
        <label htmlFor="" className="self-start leading-tight font-bold">
          Enter Your Name
        </label>
        <input
          type="text"
          className="rounded-xl border p-5 py-1"
          id="room-id"
          placeholder="UserName..."
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <Button className="w-full">Enter Room</Button>
    </form>
  );
};

export default NameInput;
