import { CANVAS_SIZE } from "@/common/constants/canvasSize";
import { RoomState } from "@/common/recoil/room/roomSlice";

export const handleMove = (move: Move, ctx: CanvasRenderingContext2D) => {
  console.log("Handling move:", move);
  const { options, path } = move;

  // Check if options is defined and has the necessary properties
  if (!options) {
    console.error("Move options are undefined");
    return; // Exit early if options are not valid
  }

  const lineWidth = options.lineWidth || 5; // Default line width
  const lineColor = options.lineColor || "#000"; // Default line color

  if (ctx) {
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = lineColor;

    if(move.eraser) ctx.globalCompositeOperation='destination-out'

    ctx.beginPath();
    path.forEach(([x, y]) => {
      ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.closePath();

    ctx.globalCompositeOperation='source-over';
  }
};

// export const drawNackground=(ctx:CanvasRenderingContext2D)=>{
//   ctx.lineWidth=1
//   ctx.strokeStyle="#ccc"

//   for(let i=0;i<CANVAS_SIZE.height;i+=25){
//     ctx.beginPath()
//     ctx.moveTo(0,i)
//     ctx.lineTo(ctx.canvas.width,i)
//     ctx.stroke()
//   }

//   for(let i=0;i<CANVAS_SIZE.width;i+=25){
//     ctx.beginPath()
//     ctx.moveTo(i,0)
//     ctx.lineTo(i,ctx.canvas.width)
//     ctx.stroke()
//   }
// }

// ✅ Update function to take `room` object instead of separate arguments
export const drawAllMoves = (ctx: CanvasRenderingContext2D, room: RoomState) => {
  ctx.clearRect(0, 0, CANVAS_SIZE.width, CANVAS_SIZE.height);

  // drawNackground(ctx)

  room.movesWithoutUser.forEach((move:Move) => handleMove(move, ctx));

  const moves=[...room.movesWithoutUser,...room.myMoves]

  // ✅ Explicitly tell TypeScript that `userMoves` is an array of `Move[]`
  Object.values(room.usersMoves).forEach((userMoves) => {
    moves.push(...userMoves)
  });

 moves.sort((a,b)=>a.timestamp - b.timestamp)

 moves.forEach((move)=>{
  handleMove(move,ctx)
 })
};


