import { CANVAS_SIZE } from "@/common/constants/canvasSize";

export const handleMove = (move: Move, ctx: CanvasRenderingContext2D) => {
  console.log("Handling move:", move);
  const { options, path } = move;
  const tempCtx = ctx;

  if (tempCtx) {
    tempCtx.lineWidth = options.lineWidth;
    tempCtx.strokeStyle = options.lineColor;

    tempCtx.beginPath();
    path.forEach(([x, y]) => {
      tempCtx.lineTo(x, y);
    });
    tempCtx.stroke();
    tempCtx.closePath();
  }
};

export const drawAllMoves = (
  ctx: CanvasRenderingContext2D,
  movesWithoutUser:Move[],
  savedMoves: Move[],
  users: { [key: string]: Move[] }
) => {
  ctx.clearRect(0, 0, CANVAS_SIZE.width, CANVAS_SIZE.height);

  movesWithoutUser.forEach((move)=>{
    handleMove(move,ctx)
  })

  Object.values(users).forEach((user) => {
    user.forEach((move) => handleMove(move, ctx));
  });

  savedMoves.forEach((move) => {
    handleMove(move,ctx);
  });
};
