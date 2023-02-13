
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
const msecPerFrame = 10

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
      const distance = twoPointDistance(this, element)
      if ((this.radius + element.radius < distance) && (distance != 0)) {
        collisions.push({ source: element, index: index, angle: twoPointAngle({ x: this.x, y: this.y }, { x: element.x, y: element.y }) })
      }
      index++
    }
    const totalForce = [this.force]
    if (collisions.length > 0) console.log('collsions', collisions)
    for (const element of collisions) {
      const elementMomentum = vector(element.angle, element.source.mass* element.source.velocity)
      totalForce.push(vectorMultiply(elementMomentum, -1))
    }
    this.force = totalForce
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
    return addNumVectors(totalForce)
  }

  updateAccelfromForce() {
    const decForce = vector(this.force.angle, (this.force.magnitude / this.mass) * msecPerFrame / 1000);
    this.currAcc = add2Vectors(this.currAcc, decForce)
  };

  getDisplacement() {
    const magnitude = this.currVelocity.magnitude * msecPerFrame / 1000
    const xChange = Math.cos(this.currVelocity.angle) * magnitude;
    const yChange = Math.sin(this.currVelocity.angle) * magnitude;
    return { xChange, yChange };
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
    /*
    for (let element of ObjArray) {
      element.evalCollisions()
    }*/
    let index = 0
    for (const element of ObjArray) {
      if ((element.x + element.radius < 0 || element.x - element.radius > width) || (element.y + element.radius < 0 || element.y - element.radius > height)) {
        ObjArray.splice(index, 1)
        index++
      }
      element.applyGrav()
      console.log('curracc:', element.currAcc, 'force:', element.force)
      element.updateAccelfromForce()
      element.currVelocity = add2Vectors(element.currVelocity, vector(element.currAcc.angle, element.currAcc.magnitude / msecPerFrame / 1000))
      element.x += element.getDisplacement().xChange
      element.y += element.getDisplacement().yChange
      element.draw()
    }
    console.log(ObjArray)
    next += msecPerFrame
    countFrame++
  }
}

animate(nextFrame);