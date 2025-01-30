import { io,Socket } from "socket.io-client";

export const socket:Socket<ServerToClinetEvent,ClientToServerEvent>=io();