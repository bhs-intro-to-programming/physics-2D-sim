
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
setCanvas(canvas);


//global
let Theme = { background: 'black', draw: 'white', accents: 'red' }
drawFilledRect(0, 0, width, height, Theme.background)
let ObjArray = []
let CircleCoords = []
let animateStart = false
const msecPerFrame = 100


const rotate = (cx, cy, x, y, angle) => {
  let radians = (Math.PI / 180) * angle,
    cos = Math.cos(radians),
    sin = Math.sin(radians),
    nx = cos * (x - cx) + sin * (y - cy) + cx,
    ny = cos * (y - cy) - sin * (x - cx) + cy;
  return [nx, ny];
};

class Shape {
  constructor(radius, activeVelocity, x, y) {
    this.area = (Math.PI * radius) ** 2
    this.mass = this.area * document.getElementById('density').value
    this.x = x
    this.y = y
    this.force = vector(0, 0)
    this.currAcc = vector(0, 0)
    this.currVelocity = activeVelocity
    this.radius = radius
  }

  draw() {
    drawCircle(this.x, this.y, this.radius, Theme.draw, 1)
    drawFilledCircle(this.x, this.y, 2, Theme.accents)
  }
  
  drawVector(vector, color, width){
    const point = rotate(this.x, this.y, (this.x+vector.magnitude), this.y, radToDeg(-vector.angle));
    drawLine(this.x, this.y, point[0], point[1], color, width);
  }

  /* // sorry sze ting i wont be using this for the time being
    getAccelfromVelo() {
      const angle = this.currVelocity.angle;
      const currVeloMagnitude = this.currVelocity.magnitude;
      const lastVeloMagnitude = this.lastVelocity.magnitude;
      if (currVeloMagnitude !== lastVeloMagnitude) {
        const derivative = findDerivative([{ constant: Math.abs(lastVeloMagnitude - currVeloMagnitude), degree: 1 }]);
        return { angle, magnitude: derivative * msecPerFrame };
      } else {
        return { angle, magnitude: 0 };
      };
    }
  */
  applyCollisions() {
    const collisions = [];
    let index = 0;
    for (const element of ObjArray) {
      const dist = twoPointDistance({ x: this.x, y: this.y }, { x: element.x, y: element.y })
      //if (dist > 0) console.log('distance:', dist)
      if ((this.radius + element.radius >= dist) && (dist != 0)) {
        collisions.push({ source: element, index: index, angle: twoPointAngle({ x: this.x, y: this.y }, { x: element.x, y: element.y }) })
      }
      index++
    }
    const totalForce = [vector(0,0)]
    if (collisions.length > 0) {
      console.log("-----------")
      for (const element of collisions) {
        const elementMomentum = vector(element.angle, element.source.mass * element.source.currVelocity.magnitude)
        console.log("elmomentum: " + JSON.stringify(elementMomentum))
        console.log("el mass " + element.source.mass + " el vel " + JSON.stringify(element.source.currVelocity.magnitude))
        totalForce.push(vectorMultiply(elementMomentum, -1))
      }
      console.log("collided: pre force;  "  + JSON.stringify(this.force))
      console.log("total force: " + JSON.stringify(totalForce))
      this.force = addNumVectors(totalForce);
      console.log("new force " + JSON.stringify(this.force))
      console.log("-----------")
    }
    this.force = addNumVectors(totalForce)
  }

  applyGrav() {
    const affecting = [];
    let index = 0;
    for (const element of ObjArray) {
      const dist = twoPointDistance({ x: this.x, y: this.y }, { x: element.x, y: element.y })
      if (dist != 0) {
        affecting.push({ source: element, index: index, dist, angle: twoPointAngle({ x: this.x, y: this.y }, { x: element.x, y: element.y }) })
      }
      index++
    }

    const totalForce = [this.force]
    for (const element of affecting) {
      totalForce.push(vector(element.angle, twoShapeGrav(this, element.source)))
    }
    this.force = addNumVectors(totalForce)
  }

  updateAccelfromForce() {
    const decForce = vector(this.force.angle, (this.force.magnitude / this.mass) * msecPerFrame / 1000);
    this.currAcc = add2Vectors(this.currAcc, decForce)
    console.log(JSON.stringify(this.currAcc) + " accel")
  };

  updatePosition() {
    const magnitude = this.currVelocity.magnitude * msecPerFrame / 1000
    this.x += Math.cos(this.currVelocity.angle) * magnitude;
    this.y += Math.sin(this.currVelocity.angle) * magnitude;
  };

};

const initDraw = (coordArray) => {
  if (coordArray.length === 3) {
    const radius = twoPointDistance(coordArray[0], coordArray[1])
    const velocity = vector(
      twoPointAngle(coordArray[0], coordArray[2]),
      twoPointDistance(coordArray[0], coordArray[2]) / 2,
    )
    console.log(velocity)
    drawCircle(coordArray[0].x, coordArray[0].y, radius, Theme.draw)
    drawLine(coordArray[0].x, coordArray[0].y, coordArray[2].x, coordArray[2].y, 1, 'Theme.draw')
    console.log(CircleCoords)
    ObjArray.push(new Shape(radius, velocity, CircleCoords[0].x, CircleCoords[0].y))
    CircleCoords = []
  }
}

registerOnclick((x, y) => {
  drawFilledCircle(x, y, 2, CircleCoords.length < 1 ? Theme.accents : Theme.draw)
  CircleCoords.push({ x, y })
  initDraw(CircleCoords)
})
registerOnKeyDown((k) => {
  console.log(k)
  if (k === 'Enter') {
    animateStart = !animateStart
  } else if (k === 'k') {
    //kill
    drawFilledRect(0, 0, width, height, Theme.background)
    clear()
    ObjArray = []
    animateStart = false
  }
})

let next = 0
let countFrame = 0
const nextFrame = (time) => {
  if (time > next && animateStart) {
    CircleCoords = []
    clear()
    drawFilledRect(0, 0, width, height, Theme.background)
    for (const element of ObjArray) {
      element.applyCollisions()
    }
    let index = 0
    for (const element of ObjArray) {
      /*if ((element.x + element.radius < 0 || element.x - element.radius > width) || (element.y + element.radius < 0 || element.y - element.radius > height)) {
        ObjArray.splice(index, 1)
      }*/
      element.applyGrav()
      //console.log('curracc:', element.currAcc, 'force:', element.force)
      element.updateAccelfromForce()
      element.currVelocity = add2Vectors(element.currVelocity, vector(element.currAcc.angle, element.currAcc.magnitude / msecPerFrame / 1000))
      element.updatePosition()
      element.draw();
      element.drawVector(element.force, "white", 5);
      element.drawVector(element.currAcc, "green", 2);
      element.drawVector(element.currVelocity, "blue", 1);
      index++
    }
    console.log(ObjArray)
    next += msecPerFrame
    countFrame++
  }
}

animate(nextFrame);