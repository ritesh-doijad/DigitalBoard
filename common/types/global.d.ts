import { Interface } from "readline";

export declare global {
  interface CtxOptions {
    lineWidth: number;
    lineColor: string;
  }

 export interface Move {
    path: [number, number][];
    options: CtxOptions;
  }

  type Room = {
    id: string; // ✅ Add this line
    users: Map<string, Move[]>;
    drawed: Move[];
  };

  interface ClientRoom{
    id:string;
    users:Map<string,Move[]>;
    movesWithoutUser:Move[];
    myMoves:Move[];
  }

  interface ServerToClinetEvent {
    room:(room:Room,usersToParse:string)=>void;
    created:(room:string)=>void;
    joined: (roomId: string,failed?:boolean) => void;
    user_draw: (move: Move, userId: string) => void;
    user_undo(userId: string): void;
    mouse_moved: (x: number, y: number, userId: string) => void;
    new_user:(userId:string)=>void
    user_disconnected: (userId: string) => void;
  }

  interface ClientToServerEvent {
    request_room_data: () => void;
    draw: (move: Move) => void;
    mouse_move: (x: number, y: number) => void;
    undo: () => void;
    create_room:()=>void
    join_room:(room:string)=>void
    joined_room:()=>void;
    leave_room:()=>void
  }
}
