
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

const rotate = (cx, cy, x, y, angle) => {
  let radians = (Math.PI / 180) * angle,
    cos = Math.cos(radians),
    sin = Math.sin(radians),
    nx = cos * (x - cx) + sin * (y - cy) + cx,
    ny = cos * (y - cy) - sin * (x - cx) + cy;
  return [nx, ny];
};

//global
let Theme = { background: 'black', draw: 'white', accents: 'red' }
drawFilledRect(0, 0, width, height, Theme.background)
let ObjArray = []
let CircleCoords = []
let animateStart = false
const msecPerFrame = 15

class Shape {
  constructor(radius, activeVelocity, x, y) {
    this.colliedLast = false;
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
      const angle = twoPointAngle({ x: this.x, y: this.y }, { x: element.x, y: element.y })
      //if (dist > 0) console.log('distance:', dist)
      if ((this.radius + element.radius >= dist) && (dist != 0)) {
        const collisionPos = {perpendicular: angle + Math.PI/2, dist: dist-element.radius, coords: {x: this.x + Math.cos(angle) * dist-element.radius, y: this.y + Math.sin(angle) * dist-element.radius }}
        collisions.push({ source: element, index: index, angle, dist, collisionPos, })
      }
      index++
    }
    const totalForce = [vector(0,0)]
    //vector(this.currVelocity.angle, (this.currVelocity.magnitude / element.source.mass - element.source.currVelocity.magnitude + this.mass )
    for (const element of collisions) {
      // change velocity and acceleration too, by some amount
      // we could also cut out the force middleman by not allowing change in density and having all of them the same
      totalForce.push(add2Vectors(
          vector(this.currVelocity.angle, this.currVelocity.magnitude * this.mass),
          vector() // get from the point of collision and the object's velocity
        ))
    }
    console.log(totalForce)
    this.force = addNumVectors(totalForce)
    return collisions
  }

  collPos(array){
    // this is heavily tested and deemed to be functional
    for (const element of array){
    const moveBase = element.dist - 2
    this.y += Math.sin(element.angle) * ((moveBase - (this.radius + element.source.radius))/2)
    this.x += Math.cos(element.angle) * ((moveBase - (this.radius + element.source.radius))/2)
    }
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
    const decForce = vector(this.force.angle, (this.force.magnitude / this.mass));
    this.currAcc = add2Vectors(this.currAcc, decForce)
    this.force = vector(0, 0)
  };

  updateVelocity() {
    this.currVelocity = add2Vectors(this.currVelocity, vector(this.currAcc.angle, this.currAcc.magnitude / (msecPerFrame/1000)))
    this.currAcc.angle = (this.currAcc.angle + this.currVelocity.angle) / 2
  }

  updatePosition() {
    const magnitude = this.currVelocity.magnitude * (msecPerFrame / 1000)
    this.x += Math.cos(this.currVelocity.angle) * magnitude;
    this.y += Math.sin(this.currVelocity.angle) * magnitude;
  };

  handleSides(){
    if ((this.x + this.radius > width) || (this.x - this.radius < 0)) {
      // this can be done with remainders but id rather not
      if (this.x + this.radius > width) this.x = width-this.radius
      else if (this.x - this.radius < 0) this.x = this.radius
      this.currVelocity.angle = -this.currVelocity.angle
      this.currVelocity = vectorMultiply(this.currVelocity, -1)
      this.currAcc.angle = -this.currAcc.angle
      this.currAcc = vectorMultiply(this.currAcc, -1)
      this.force.angle = -this.force.angle
      this.force = vectorMultiply(this.force, -1)
    } else if (((this.y + this.radius > height) || (this.y - this.radius < 0))) {
      if (this.y + this.radius > height) this.y = height-this.radius
      else if (this.y - this.radius < 0) this.y = this.radius
      this.currVelocity.angle = -this.currVelocity.angle 
      this.currAcc.angle = -this.currAcc.angle
      this.force.angle = -this.force.angle
    }
  }
};

const initDraw = (coordArray) => {
  if (coordArray.length === 3) {
    const radius = twoPointDistance(coordArray[0], coordArray[1])
    const velocity = vector(
      twoPointAngle(coordArray[0], coordArray[2]),
      twoPointDistance(coordArray[0], coordArray[2]),
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
    clear()
    drawFilledRect(0, 0, width, height, Theme.background)
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
    const collisionsSquared = []
    for (const element of ObjArray) {
      collisionsSquared.push(element.applyCollisions())
      element.applyGrav()
    }

    let index = 0
    for (const element of ObjArray){
      element.collPos(collisionsSquared[index])
      index++
    }

    for (const element of ObjArray) {
      element.handleSides();
      //element.colliedLast = sideCollison;
      //console.log('curracc:', element.currAcc, 'force:', element.force)
      element.updateAccelfromForce()
      element.updateVelocity()
      element.updatePosition()
      element.draw()   
      element.drawVector(element.force, "white", 5);
      element.drawVector(element.currAcc, "green", 2);
      element.drawVector(element.currVelocity, "blue", 1);
    }
    console.log(ObjArray)
    next += msecPerFrame
    countFrame++
  }
}

animate(nextFrame);