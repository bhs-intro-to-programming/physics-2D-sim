//let onclick = (x, y) => {};
let onkeydown = (k) => {};

document.onkeydown = (e) => {
  onkeydown(e.key);
};

//const registerOnclick = (fn) => (onclick = fn);
const registerOnKeyDown = (fn) => (onkeydown = fn);

const setCanvas = (canvas) => {
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  return { ctx, width, height };
};

const drawLine = (x1, y1, x2, y2, color, width, ctx) => {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
};

const drawCircle = (x, y, r, color, lineWidth = 1, ctx) => {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.ellipse(x, y, r, r, 0, 0, 2 * Math.PI);
  ctx.stroke();
};

const drawRect = (x, y, width, height, color, lineWidth = 1, ctx) => {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.strokeRect(x, y, width, height);
};

const drawTriangle = (x1, y1, x2, y2, x3, y3, color, lineWidth = 1, ctx) => {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y3);
  ctx.lineTo(x1, y1);
  ctx.stroke();
};

const drawFilledCircle = (x, y, r, color, ctx) => {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, r, r, 0, 0, 2 * Math.PI);
  ctx.fill();
};

const drawFilledRect = (x, y, width, height, color, ctx) => {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);
};

const drawFilledTriangle = (x1, y1, x2, y2, x3, y3, color, ctx) => {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y3);
  ctx.lineTo(x1, y1);
  ctx.fill();
};

//topLeft, topRight, bottomLeft, bottomRight are all radii for circles in those corners, only positive integer values
const drawRoundedRect = (
  x,
  y,
  width,
  height,
  topLeft,
  topRight,
  bottomLeft,
  bottomRight,
  color,
) => {
  const arrOfRadii = [topLeft, topRight, bottomLeft, bottomRight];
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, arrOfRadii);
  ctx.stroke();
};

const drawFilledRoundedRect = (
  x,
  y,
  width,
  height,
  topLeft,
  topRight,
  bottomLeft,
  bottomRight,
  color,
) => {
  const arrOfRadii = [topLeft, topRight, bottomLeft, bottomRight];
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, arrOfRadii);
  ctx.stroke();
  ctx.fill();
};

const drawText = (text, x, y, color, size, ctx) => {
  //ctx.font = `${size}px Lexend`;
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
};

const clear = (ctx, width, height) => ctx.clearRect(0, 0, width, height, ctx);

/*
 * Available to script as convenience.
 */
const now = () => performance.now();

/*
 * Called from script.js to kick off the animation.
 */
const animate = (drawFrame) => {
  let running = true;

  const step = () => {
    drawFrame(performance.now());
    maybeStep();
  };

  const maybeStep = () => {
    if (running) {
      requestAnimationFrame(step);
    }
  };

  maybeStep();
};

export {
  setCanvas,
  drawLine,
  drawCircle,
  drawRect,
  drawTriangle,
  drawFilledCircle,
  drawFilledRect,
  drawFilledTriangle,
  drawRoundedRect,
  drawFilledRoundedRect,
  drawText,
  clear,
  now,
  animate,
  registerOnKeyDown,
};
