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

import {
  makeNSidedPolygon
} from './perfectShapes.js';

const canvas = document.getElementById('screen');
setCanvas(canvas);
const FPS = 12; // frames per second, consider changing to ms/frame
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
  constructor(actingForces, vertices, mass) {
    this.vertices = vertices;
    this.vertBase = vertices;
    this.baseDifs = [];//the pos of the verticies relitive to the center, in replacment of the "sides" athgorithm
    this.mass = Math.abs(Math.round(mass));
    this.centerBase = { x: getBoundCenter(vertices).x, y: getBoundCenter(vertices).y };
    this.center = { x: getBoundCenter(vertices).x, y: getBoundCenter(vertices).y };
    this.rotation = 0;
    this.lastRotation = 0;
    this.actingForce = [addNumVectors(actingForces)];
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
    //rotate vertDifs
    this.#getVertDifs();
    //calc vertices pos based on centroid
    const newVertPos = this.vertices.map((e, i) => {
      return { x: this.center.x + this.vertDifs[i].xDif, y: this.center.y + this.vertDifs[i].yDif };
    });
    this.vertices = newVertPos;
  }

  drawShape() {
    drawText('mass ' + this.mass, this.center.x, this.center.y, 'black', 10);
    for (let i = 0; i < this.vertices.length; i++) {
      if (i + 1 === this.vertices.length) {
        drawLine(
          this.vertices[i].x,
          this.vertices[i].y,
          this.vertices[0].x,
          this.vertices[0].y,
          'black',
          1,
        );
      } else {
        drawLine(
          this.vertices[i].x,
          this.vertices[i].y,
          this.vertices[i + 1].x,
          this.vertices[i + 1].y,
          'black',
          1,
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
}

const objArray = [];
let vertices = [];

let animateStart = false;

registerOnclick((x, y) => {
  if (!animateStart) {
    drawFilledCircle(x, y, 1.7, 'black');
    vertices.push({ x, y });
  }
});

registerOnKeyDown((k) => {
  if (k === ' ') {
    console.log(`'${k}'`);
    if (!animateStart) {
      const area =
        sigma(
          0,
          vertices.length - 2,
          (i) => vertices[i].x * vertices[i + 1].y - vertices[i + 1].x * vertices[i].y,
        ) / 2;
      objArray.push(
        new Shape(
          [vector(0, 0)],
          vertices,
          area * parseInt(document.getElementById('density').value),
        ),
      );
      objArray[objArray.length - 1].drawShape();
      drawFilledCircle(
        objArray[objArray.length - 1].center.x,
        objArray[objArray.length - 1].center.y,
        2.5,
        'red',
      );
      vertices = [];
      animateStart = objArray.length >= 5 ? true : false;
    }
  }
});

let next = 0;
let countFrame = 0;
const drawFrame = (time) => {
  if (time > next && animateStart) {
    clear();
    for (const shape of objArray) {

      const movement = getDisplacement(shape.actingForce, shape.mass, )

      shape.center.x += 0

      shape.center.y += 10

      shape.rotation = countFrame;

      shape.updateProperties();

      const shapeBounds = shape.getBoundOfObject(1);

      drawFilledCircle(shape.center.x, shape.center.y, 2.5, 'red');

      shape.drawShape();

      next += FPS;
      countFrame++;
    }
  }
};

animate(drawFrame);

export {
  canvas,
  Shape
};