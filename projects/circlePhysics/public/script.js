
import {
  setCanvas,
  drawFilledCircle,
  clear,
  width,
  height,
  animate,
  now,
  registerOnKeyDown,
  registerOnclick,
  drawFilledRect,
  drawLine,
  drawText,
  drawCircle,
} from './graphics.js';

import {
  add2Vectors,
  vectorMultiply,
  addNumVectors,
  sigma,
  pi,
  degToRad,
  radToDeg,
  mean,
  geoMean,
  twoPointAngle,
  twoPointDistance,
  shapeArea,
  vector,
  twoPointXYDif,
  twoShapeGrav,
  findDerivative,
} from './math.js';
const canvas = document.getElementById('screen');

//const width = 500;
//const height = 500;

setCanvas(canvas);

const rotate = (cx, cy, x, y, angle) => {
  let radians = (Math.PI / 180) * angle,
    cos = Math.cos(radians),
    sin = Math.sin(radians),
    nx = cos * (x - cx) + sin * (y - cy) + cx,
    ny = cos * (y - cy) - sin * (x - cx) + cy;
  return [nx, ny];
};

const arSims = (a1, a2) => {
  const newAr = [];
  for (let i = 0; i < a1.length; i++) {
    for (let j = 0; j < a2.length; j++) {
      if (a1[i].source === a2[j].source) newAr.push(a1[i]);
    }
  }
  return newAr;
}


//global
let Theme = { background: 'black', draw: 'white', accents: 'red' }
drawFilledRect(0, 0, width, height, Theme.background)
let ObjArray = [];
let CircleCoords = [];
let animateStart = false
let stopSpawn = true;
const msecPerFrame = 10

const grav = 2; //grav toward ground
const f = 0.5; //multiplied by vel to mimick friction

class Shape {
  constructor(radius, push, x, y, name) {

    this.area = (Math.PI * radius) ** 2;
    this.mass = this.area * document.getElementById('density').value;
    this.radius = radius;

    this.pCurr = { x, y };
    this.pOld = { x: x + push.xDif / 4, y: y + push.yDif / 4 };
  }

  draw(color) {
    drawCircle(this.pCurr.x, this.pCurr.y, this.radius, color, 1)
    drawFilledCircle(this.pCurr.x, this.pCurr.y, 1, Theme.accents)
  }

  update() {

    const vx = (this.pCurr.x - this.pOld.x);
    const vy = (this.pCurr.y - this.pOld.y);

    this.pOld.x = this.pCurr.x;
    this.pOld.y = this.pCurr.y;

    this.pCurr.x += vx;
    this.pCurr.y += vy;
    this.pCurr.y += grav;

    this.sides(vx, vy);



  }
  sides(vx, vy) {
    const mvx = vx;
    const mvy = vy;
    if (this.pCurr.x + this.radius > width) {
      this.pCurr.x = width - this.radius;
      this.pOld.x = this.pCurr.x + (mvx - f);
    }
    else if (this.pCurr.x - this.radius < 0) {
      this.pCurr.x = this.radius;
      this.pOld.x = this.pCurr.x + (mvx + f);
    }

    if (this.pCurr.y + this.radius > height) {
      this.pCurr.y = height - this.radius;
      this.pOld.y = this.pCurr.y + (mvy);
    }
    else if (this.pCurr.y - this.radius < 0) {
      this.pCurr.y = this.radius;
      this.pOld.y = this.pCurr.y + (mvy);
    }

  }

};
const collisons = () => {
  for (let k = 0; k < ObjArray.length; k++) {
    const shape1 = ObjArray[k];
    for (let i = k; i < ObjArray.length; i++) {
      const shape2 = ObjArray[i];
      const dist = twoPointDistance(shape1.pCurr, shape2.pCurr);

      if (((shape2.radius + shape1.radius) > dist) && shape1 != shape2) {
        const rSum = shape1.radius + shape2.radius;
        const angle = Math.abs(twoPointAngle(shape1.pCurr, shape2.pCurr)) !== twoPointAngle(shape1.pCurr, shape2.pCurr) ? twoPointAngle(shape1.pCurr, shape2.pCurr) + Math.PI * 2 : twoPointAngle(shape1.pCurr, shape2.pCurr);
        const overLap = (shape1.radius + shape2.radius) - dist;

        drawLine(shape1.pCurr.x, shape1.pCurr.y, shape1.pCurr.x + Math.cos(angle) * dist, shape1.pCurr.y + Math.sin(angle) * dist, "pink", 2);
        drawLine(shape1.pCurr.x, shape1.pCurr.y, shape1.pCurr.x - Math.cos(angle) * (overLap / 2 + 10), shape1.pCurr.y - Math.sin(angle) * (overLap / 2 + 10), "blue", 1)

        console.log("---")
        console.log("over: " + overLap + ', ' + overLap);
        console.log("dist: " + dist);
        console.log("sum radii:  " + (shape1.radius + shape2.radius));
        for (let i = 0; i < 1; i++) {
          const vx = shape1.pCurr.x - shape1.pOld.x;
          const vy = shape1.pCurr.y - shape1.pOld.y;
          const vx2 = shape2.pCurr.x - shape2.pOld.x;
          const vy2 = shape2.pCurr.y - shape2.pOld.y;

          const vx2A = ((2 * shape1.mass * vx) / (shape1.mass + shape2.mass) + ((shape2.mass - shape1.mass) / (shape1.mass + shape2.mass)) * vx2)*f;
          const vy2A = ((2 * shape1.mass * vy) / (shape1.mass + shape2.mass) + ((shape2.mass - shape1.mass) / (shape1.mass + shape2.mass)) * vy2)*f;

          const vxA = (vx2 + vx2A - vx)*f;
          const vyA = (vy2 + vy2A - vy)*f;

          shape2.pOld.x = shape2.pCurr.x;
          shape2.pOld.y = shape2.pCurr.y;

          shape1.pOld.x = shape1.pCurr.x;
          shape1.pOld.y = shape1.pCurr.y;
          console.log(angle)
          const cos = Math.cos(angle) * (overLap / 2 + 2);
          const sin = Math.sin(angle) * (overLap / 2 + 2);

          console.log("cos: " + cos + ", sin: " + sin);
          shape1.pCurr.y -= sin;
          shape1.pCurr.x -= cos;
          shape2.pCurr.y += sin;
          shape2.pCurr.x += cos;

          console.log("s1 y add:  " + (Math.sin(angle) * (overLap / 2)));
          console.log("s1 x add:  " + (Math.cos(angle) * (overLap / 2)));
          console.log("s2 y add:  " + (Math.sin(angle) * (overLap / 2)));
          console.log("s2 x add:  " + (Math.cos(angle) * (overLap / 2)));


          shape1.draw("red");
          shape2.draw("green");
          console.log("---");


          shape2.pOld.x = shape2.pCurr.x - vx2A;
          shape2.pOld.y = shape2.pCurr.y - vy2A;

          shape1.pOld.x = shape1.pCurr.x - vxA;
          shape1.pOld.y = shape1.pCurr.y - vyA;
        }
        //return true;
        //animateStart = false;
      }
    }
  }
}

const initDraw = (coordArray) => {
  if (coordArray.length === 3) {
    const radius = twoPointDistance(coordArray[0], coordArray[1]);
    const push = twoPointXYDif(coordArray[0], coordArray[1]);
    drawCircle(coordArray[0].x, coordArray[0].y, radius, Theme.draw)
    drawLine(coordArray[0].x, coordArray[0].y, coordArray[2].x, coordArray[2].y, 1, 'Theme.draw')
    ObjArray.push(new Shape(radius, push, CircleCoords[0].x, CircleCoords[0].y, ObjArray.length))
    CircleCoords = []
  }
}

registerOnclick((x, y) => {
  drawFilledCircle(x, y, 2, CircleCoords.length < 1 ? Theme.accents : Theme.draw)
  CircleCoords.push({ x, y })
  initDraw(CircleCoords)
})

registerOnKeyDown((k) => {
  if (k === 'Enter') {
    animateStart = !animateStart;
    stopSpawn = !stopSpawn;
  } else if (k === 'k') {
    clear();
    drawFilledRect(0, 0, width, height, Theme.background);
    ObjArray = [];
    amountOfSpawn = 0;
    animateStart = false;

  }
  else if (k === "e") {
    stopSpawn = !stopSpawn;
  }
  else if (k === "p") {
    amountOfSpawn+=10;
  }
})

let next = 0;
let nextSpawn = 100;
let spawnSpeed = 100;
let countFrame = 0;
let justcollied = false;
let amountOfSpawn = 20;

//ObjArray.push(new Shape(10, twoPointXYDif({x : 0, y : 0}, {x : 0, y : 0}), 20, height/2, "cirlce"));
//ObjArray.push(new Shape(20, twoPointXYDif({x : 0, y : 0}, {x : 0, y : 0}), 49, height/2, "cirlce"));


const nextFrame = (time) => {
  if (time > next && animateStart) {

    clear();
    drawFilledRect(0, 0, width, height, Theme.background)


    for (let i = 0; i < 7; i++) {
      collisons();
    }
    for (const element of ObjArray) {
      element.update();



      element.draw("white");
    }
    if (time > nextSpawn && animateStart && ObjArray.length < amountOfSpawn) {
      ObjArray.push(new Shape(10, twoPointXYDif({ x: width * Math.random(), y: height / 2 }, { x: width * Math.random(), y: height / 2 }), 49, height / 2, "circle"));
    }
    next += msecPerFrame;
    countFrame++;
  }
}

animate(nextFrame);