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
      room?.users.set(socketId, [move]);
    }

    room?.users.get(socketId)?.push(move);
  };

  const undoMove = (roomId: string, socketId: string) => {
    const room = rooms.get(roomId);

    room?.users.get(socketId)?.pop();
  };

  const leaveRoom = (roomId: string, socketId: string) => {
    const room = rooms.get(roomId);

    if(!room) return;

    const userMoves = room?.users.get(socketId);

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

    socket.on("create_room", () => {
      let roomId: string;

      do {
        roomId = Math.random().toString(36).substring(2, 6);
      } while (rooms.has(roomId));
      socket.join(roomId);
      rooms.set(roomId, { id: roomId, users: new Map(), drawed: [] });
      rooms.get(roomId)?.users.set(socket.id, []);

      io.to(socket.id).emit("created", roomId);
    });

    socket.on("join_room", (roomId: string) => {
      if (rooms.has(roomId)) {
        socket.join(roomId);

        io.to(socket.id).emit("joined", roomId);
      } else io.to(socket.id).emit("joined", "", true);
    });

    socket.on("joined_room", () => {
      const roomId = getRoomId();
      const room = rooms.get(roomId);
  
      if (room) {
          room.users.set(socket.id, []); // Add user with empty array
  
          // Serialize the users map into an object
          const roomData = JSON.stringify([...room.users]);
  
          console.log("this is data sending from the server to client", roomData);
          console.log("this is the room and roomdata that is passing to client side", room, roomData);
  
          io.to(socket.id).emit("room", room, roomData); // Send room data to the specific user
          socket.broadcast.to(roomId).emit("new_user", socket.id); // Notify others about the new user
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
      leaveRoom(roomId,socket.id)

     io.to(roomId).emit("user_disconnected",socket.id)
    });

    socket.on("draw", (move) => {
      console.log("drawing");
      const roomId = getRoomId();
      addMove(roomId, socket.id, move);
      socket.broadcast.to(roomId).emit("user_draw", move, socket.id);
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
      leaveRoom(roomId,socket.id)
      console.log("Client disconnected:", socket.id);
      io.to(roomId).emit("user_disconnected", socket.id);
      
      console.log("disconnected from server")
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
