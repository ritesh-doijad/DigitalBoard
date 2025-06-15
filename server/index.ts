import { createServer } from "http";
import express, { Request, Response } from "express";
import next from "next";
import { Server } from "socket.io";

import {} from "@/common/types/global";

const port = parseInt(process.env.PORT || "4000", 10);
const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const nextHandler = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
  const app = express();
  const server = createServer(app);

  const io = new Server(server);

  app.get("./health", async (_, res) => {
    res.send("healthy");
  });

  const rooms = new Map<string, Room>();

  const addMove = (roomId: string, socketId: string, move: Move) => {
    const room = rooms.get(roomId);

    if (!room?.users.has(socketId)) {
      room?.usersMoves.set(socketId, [move]);
    }

    room?.usersMoves.get(socketId)?.push(move);
  };

  const undoMove = (roomId: string, socketId: string) => {
    const room = rooms.get(roomId);

    room?.usersMoves.get(socketId)?.pop();
  };

  const leaveRoom = (roomId: string, socketId: string) => {
    const room = rooms.get(roomId);

    if (!room) return;

    const userMoves = room?.usersMoves.get(socketId);

    if (userMoves && room?.drawed) {
      room.drawed.push(...userMoves);
    }
    room?.users.delete(socketId);

    console.log(room);
  };

  io.on("connection", (socket) => {
    const getRoomId = () => {
      const joinedRoom = [...socket.rooms].find((room) => room !== socket.id);

      if (!joinedRoom) return socket.id;

      return joinedRoom;
    };
    console.log(`User connected: ${socket.id}`);

    socket.on("create_room", (username) => {
      let roomId: string;

      do {
        roomId = Math.random().toString(36).substring(2, 6);
      } while (rooms.has(roomId));
      socket.join(roomId);
      rooms.set(roomId, {
        id: roomId,
        users: new Map([[socket.id, username]]),
        drawed: [],
        usersMoves: new Map([[socket.id, []]]),
      });

      io.to(socket.id).emit("created", roomId);
    });

    socket.on("join_room", (roomId: string, username: string) => {
      const room = rooms.get(roomId);
      if (room) {
        socket.join(roomId);

        room.users.set(socket.id, username);
        room.usersMoves.set(socket.id, []);

        io.to(socket.id).emit("joined", roomId);
      } else io.to(socket.id).emit("joined", "", true);
    });

    socket.on("check_room", (roomId) => {
      if (rooms.has(roomId)) socket.emit("room_exists", true);
      else socket.emit("room_exists", false);
    });

    socket.on("joined_room", () => {
      const roomId = getRoomId();
      const room = rooms.get(roomId);
    
      if (room) {
        // Ensure socket is initialized in usersMoves
        if (!room.usersMoves.has(socket.id)) {
          room.usersMoves.set(socket.id, []);
        }
    
        // Serialize the maps for client-side parsing
        const usersMovesSerialized = JSON.stringify([...room.usersMoves]); // Map<string, Move[]>
        const usersSerialized = JSON.stringify([...room.users]); // Map<string, string>
    
        console.log("Sending joined room data:", {
          room,
          usersSerialized,
          usersMovesSerialized,
        });
    
        io.to(socket.id).emit("room", room, usersSerialized, usersMovesSerialized);
        socket.broadcast.to(roomId).emit("new_user", socket.id,room.users.get(socket.id)|| "anonymous");
      }
    });
    

    socket.on("request_room_data", () => {
      const roomId = getRoomId();
      const room = rooms.get(roomId);

      if (!room) {
        io.to(socket.id).emit("room", null);
        return;
      }

      io.to(socket.id).emit("room", room);
    });

    socket.on("leave_room", () => {
      const roomId = getRoomId();
      leaveRoom(roomId, socket.id);

      io.to(roomId).emit("user_disconnected", socket.id);
    });

    socket.on("draw", (move) => {
      console.log("drawing");
      const timestamp=Date.now()
      const roomId = getRoomId();
      addMove(roomId, socket.id, {...move,timestamp});
      io.to(socket.id).emit('your_move',{...move,timestamp})
      socket.broadcast.to(roomId).emit("user_draw", {...move,timestamp}, socket.id);
    });

    socket.on("send_msg", (msg) => {
      io.to(getRoomId()).emit("new_msg", socket.id, msg);
    });

    socket.on("undo", () => {
      const roomId = getRoomId();
      undoMove(roomId, socket.id);
      socket.broadcast.to(roomId).emit("user_undo", socket.id);
    });

    socket.on("mouse_move", (x, y) => {
      console.log("mouse_move");
      socket.broadcast.to(getRoomId()).emit("mouse_moved", x, y, socket.id);
    });

    socket.on("disconnecting", () => {
      const roomId = getRoomId();
      leaveRoom(roomId, socket.id);
      console.log("Client disconnected:", socket.id);
      io.to(roomId).emit("user_disconnected", socket.id);

      console.log("disconnected from server");
    });
  });

  // Use express-compatible types for the handler
  app.all("*", (req: Request, res: Response) => {
    return nextHandler(req, res);
  });

  server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
});
