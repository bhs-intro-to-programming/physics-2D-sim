import {
  setCanvas,
  drawFilledCircle,
  clear,
  animate,
  now,
  drawFilledRect,
  drawLine,
  drawText,
  registerOnKeyDown,
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
  distance,
  shapeArea,
  getAcceleration,
  getVelocity,
  vector,
  twoPointXYDif,
  getDisplacement,
} from './math.js';

import { Menu, shapeMenu, addShapeWindow } from './gui.js';
import { makeNSidedPolygon } from './perfectShapes.js';

const canvas = document.getElementById('screen');

const canvasProps = setCanvas(canvas);

const width = canvasProps.width;
const height = canvasProps.height;
const ctx = canvasProps.ctx;

const msPerFrame = 1; // frames per second, consider changing to ms/frame

//returns points that are 1 or less pixels away from eachother

const closePoints = (ar1, ar2) =>
  ar1.filter((e) => (ar2.find((e2) => distance(e, e2) <= 1) != undefined ? true : false));

//returns an array of objects that have a x, y point of collison and the shapes involved
const collisions = (shapes) => {
  const collisions = [];
  for (let s1 = 0; s1 < shapes.length; s1++) {
    for (let s2 = s1 + 1; s2 < shapes.length; s2++) {
      const s1Bounds = shapes[s1].getBoundOfObject();
      const s2Bounds = shapes[s2].getBoundOfObject();

      collisions.push({ points: closePoints(s1Bounds, s2Bounds), s1: shapes[s1], s2: shapes[s2] });
    }
  }
  return collisions;
};

const getBoundCenter = (arr) => {
  const findCentroid = (points) => {
    const pts = points.concat(points[0]);
    const area = shapeArea(pts);
    const x =
      sigma(
        0,
        pts.length - 2,
        (i) => (pts[i].x + pts[i + 1].x) * (pts[i].x * pts[i + 1].y - pts[i + 1].x * pts[i].y),
      ) /
      (6 * area);
    const y =
      sigma(
        0,
        pts.length - 2,
        (i) => (pts[i].y + pts[i + 1].y) * (pts[i].x * pts[i + 1].y - pts[i + 1].x * pts[i].y),
      ) /
      (6 * area);
    return { x, y };
  };
  const returner = findCentroid(arr);
  return returner;
};

//from web
const rotate = (cx, cy, x, y, angle) => {
  let radians = (Math.PI / 180) * angle,
    cos = Math.cos(radians),
    sin = Math.sin(radians),
    nx = cos * (x - cx) + sin * (y - cy) + cx,
    ny = cos * (y - cy) - sin * (x - cx) + cy;
  return [nx, ny];
};

const drawPoints = (ar, color) => {
  for (const point of ar) {
    drawLine(point.x, point.y, point.x + 1, point.y + 1, color, 1);
  }
};

class Shape {
  constructor(actingForces, vertices, density, name) {
    this.name = name;
    this.vertices = vertices;
    this.vertBase = vertices;
    this.baseDifs = []; //the pos of the verticies relitive to the center, in replacment of the "sides" athgorithm
    this.density = density;
    this.mass = Math.abs(shapeArea(vertices)) * this.density;
    this.centerBase = { x: getBoundCenter(vertices).x, y: getBoundCenter(vertices).y };
    this.center = { x: getBoundCenter(vertices).x, y: getBoundCenter(vertices).y };
    this.rotation = 0;
    this.lastRotation = 0;
    this.actingForce = [addNumVectors(actingForces)];
    this.menu

    for (const vert of this.vertices) {
      this.baseDifs.push(twoPointXYDif(vert, { x: this.centerBase.x, y: this.centerBase.y }));
    }
  }
  #getVertDifs() {
    this.vertDifs = this.baseDifs.map((e) => {
      const rotateCords = rotate(
        this.centerBase.x,
        this.centerBase.y,
        this.centerBase.x + e.xDif,
        this.centerBase.y + e.yDif,
        this.rotation,
      );
      return {
        xDif: rotateCords[0] - this.centerBase.x,
        yDif: rotateCords[1] - this.centerBase.y,
        rotation: this.rotation,
      };
    });
  }
  //should be called everytime you update this opjects varibles outside of the class
  updateProperties() {
    this.mass = Math.abs(shapeArea(this.vertBase)) * parseInt(this.density);
    //rotate vertDifs
    this.#getVertDifs();
    //calc vertices pos based on centroid
    const newVertPos = this.vertices.map((e, i) => {
      return { x: this.center.x + this.vertDifs[i].xDif, y: this.center.y + this.vertDifs[i].yDif };
    });
    this.vertices = newVertPos;
  }

  drawShape() {
    for (let i = 0; i < this.vertices.length; i++) {
      if (i + 1 === this.vertices.length) {
        drawLine(
          this.vertices[i].x,
          this.vertices[i].y,
          this.vertices[0].x,
          this.vertices[0].y,
          'black',
          1,
          ctx,
        );
      } else {
        drawLine(
          this.vertices[i].x,
          this.vertices[i].y,
          this.vertices[i + 1].x,
          this.vertices[i + 1].y,
          'black',
          1,
          ctx,
        );
      }
    }
  }
  //if detail = 2 then num points 2x
  getBoundOfObject(detail) {
    let array = [];
    for (let i = 0; i < this.vertices.length; i++) {
      let xAdd, yAdd, dist, numPoints;
      //set j to 0 for last side to go to orgin point
      const j = i + 1 === this.vertices.length ? 0 : i + 1;

      dist = distance(this.vertices[i], this.vertices[j]);
      numPoints = dist * detail;
      xAdd = (this.vertices[j].x - this.vertices[i].x) / numPoints;
      yAdd = (this.vertices[j].y - this.vertices[i].y) / numPoints;

      for (let j = 0; j < Math.floor(numPoints); j++) {
        array.push({ x: this.vertices[i].x + xAdd * j, y: this.vertices[i].y + yAdd * j });
      }
    }
    return array;
  }
  getShapeVars() {
    const array2d = Object.entries(this); //returns 2d array, [key : value] for each class var

    //converts a 2d array into array of objects
    return array2d.map(([name, value]) => Object.assign({}, { name: name, value: value })); //THANKS chatgbt
  }
}

const objArray = [];
let vertices = [];

let paused = true;

const onclick = (x, y) => {
  if (paused) {
    drawFilledCircle(x, y, 1.7, 'black', ctx);
    vertices.push({ x, y });
  }
};

registerOnKeyDown((k) => {
  if (k === 'Enter') {
    if (paused) {
      const area = Math.abs(shapeArea(vertices));
      objArray.push(new Shape([vector(0, 0)], vertices, 10, 'Shape ' + (objArray.length + 1)));
      objArray[objArray.length - 1].drawShape();
      drawFilledCircle(
        objArray[objArray.length - 1].center.x,
        objArray[objArray.length - 1].center.y,
        2.5,
        'red',
        ctx,
      );
      vertices = [];

      addShapeWindow(objArray[objArray.length - 1]);

      paused = objArray.length <= 5;



    }
  } else if (k === ' ') {
    paused = !paused;
  }
});

canvas.onclick = (e) => onclick(e.offsetX, e.offsetY);


let next = 0;
let countFrame = 0;
const drawFrame = (time) => {
  if (time > next && !paused) {
    clear(ctx, width, height);
    for (const shape of objArray) {
      const density = parseInt(document.getElementById(shape.menu.name + " density").value)
      shape.density = density === null || density === "" ? 10 : density;

      shape.menu.updateWindow(shape.getShapeVars());

      shape.rotation = countFrame;

      shape.center.x += 1;

      shape.updateProperties();

      drawFilledCircle(shape.center.x, shape.center.y, 2.5, 'red', ctx);

      shape.drawShape();

      next += msPerFrame;

      countFrame++;
    }
  }
};

animate(drawFrame);

export {canvas, Shape, };
