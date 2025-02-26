import { CANVAS_SIZE } from "@/common/constants/canvasSize";
import { RoomState } from "@/common/recoil/room/roomSlice";

export const handleMove = (move: Move, ctx: CanvasRenderingContext2D) => {
  console.log("Handling move:", move);
  const { options, path } = move;

  if (ctx) {
    ctx.lineWidth = options.lineWidth;
    ctx.strokeStyle = options.lineColor;

    ctx.beginPath();
    path.forEach(([x, y]) => {
      ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.closePath();
  }
};

// ✅ Update function to take `room` object instead of separate arguments
export const drawAllMoves = (ctx: CanvasRenderingContext2D, room: RoomState) => {
  ctx.clearRect(0, 0, CANVAS_SIZE.width, CANVAS_SIZE.height);

  room.movesWithoutUser.forEach((move:Move) => handleMove(move, ctx));

  // ✅ Explicitly tell TypeScript that `userMoves` is an array of `Move[]`
  Object.values(room.users).forEach((userMoves) => {
    (userMoves as Move[]).forEach((move) => handleMove(move, ctx));
  });

  room.myMoves.forEach((move:Move) => handleMove(move, ctx));
};

