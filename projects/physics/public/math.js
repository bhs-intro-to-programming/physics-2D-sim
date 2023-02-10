//vector manipulation, stored in radians
const shapeArea = (vertices) => {
  const verticeArray = vertices.concat(vertices[0]);
  return (
    sigma(
      0,
      verticeArray.length - 2,
      (i) => verticeArray[i].x * verticeArray[i + 1].y - verticeArray[i + 1].x * verticeArray[i].y,
    ) / 2
  );
};

const vector = (degrees, magnitude) => {
  return { angle: (degrees * Math.PI) / 180, magnitude };
};

const add2Vectors = (v1, v2) => {
  const x1 = Math.cos(v1.angle) * v1.magnitude;
  const x2 = Math.cos(v2.angle) * v2.magnitude;
  const y1 = Math.sin(v1.angle) * v1.magnitude;
  const y2 = Math.sin(v2.angle) * v2.magnitude;
  const angle = Math.atan2(y1 + y2, x1 + x2);
  const magnitude = Math.hypot(x1 - x2, y1 - y2);
  return { angle, magnitude };
};

const vectorMultiply = (vector, n) => {
  if (n >= 0) {
    return { angle: vector.angle, magnitude: vector.magnitude * n };
  } else {
    return { angle: (vector.angle + Math.PI) % (2 * Math.PI), magnitude: vector.magnitude * -n };
  }
};

const addNumVectors = (vectors) => {
  return vectors.reduce((acc, x) => add2Vectors(acc, x), vector(0, 0));
};

//general math functions
/* this part is not done, still can merge though
const overRange = (start, end, funct, startValue) => {
  for (let i = start; i <= end; i++) {
    startValue = 0;
  };
};
*/

const twoPointXYDif = (p1, p2) => {
  return { xDif: p1.x - p2.x, yDif: p1.y - p2.y };
};

const sigma = (start, end, funct) => {
  let sum = 0;
  for (let i = start; i <= end; i++) {
    sum += funct(i);
  }
  return sum;
};

const pi = (start, end, funct) => {
  let product = 1;
  for (let i = start; i <= end; i++) {
    product *= funct(i);
  }
  return product;
};

const degToRad = (radAngle) => {
  return (radAngle * Math.PI) / 180;
};

const radToDeg = (degAngle) => {
  return (degAngle * 180) / Math.PI;
};

const mean = (array) => {
  return array.reduce((a, e) => a + e, 0) / array.length;
};

const geoMean = (array) => {
  return pi(0, array.length - 1, (i) => array[i]) ** (1 / (array.length - 1));
};

//these next two take 2 objects with x and y
const twoPointAngle = (p1, p2) => {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
};

const distance = (p1, p2) => {
  return Math.hypot(Math.abs(p1.x - p2.x), Math.abs(p1.y - p2.y));
};

//general calculus stuff, only for polynomials. coefficients is an array where coefficient[i] corresponds to
//the coefficient of x raised to the i. For example, [0, 0, 1] corresponds to the function f(x) = x^2
const findDerivative = (coefficients) => {
  let largestDegree = 0
  for (let i = 0; i < coefficients.length; i++) {
    if (coefficients[i].degree > largestDegree) {
      largestDegree = coefficients[i].degree
    };
  };
  const derivativeCoefficients = [];
  for (let i = 0; i < largestDegree; i++) {
    if (coefficients[i].degree === i) {
      derivativeCoefficients.push({ constant: coefficients[i + 1].constant * (i + 1), degree: i});
    } else {
      derivativeCoefficients.push({ constant: 0, degree: i});
    };
  };
  return derivativeCoefficients;
};

//time derivative(s), should be used as methods
/*
function getAccelfromVelo() {
  const angle = this.currVelocity.angle;
  const currVeloMagnitude = this.currVelocity.magnitude;
  const lastVeloMagnitude = this.lastVelocity.magnitude;
  if (currVeloMagnitude !== lastVeloMagnitude) {
    const derivative = findDerivative([{ constant: Math.abs(lastVeloMagnitude - currVeloMagnitude), degree: 1}]);
    return { angle, magnitude: derivative * secondsPerFrame };
  } else {
    return { angle, magnitude: 0 };
};

function getAccelfromForce() {
  return (this.actingForce / this.mass) * secondsPerFrame;
};

function getDisplacement() {
  const magnitude = this.currVelocity.magnitude * secondsPerFrane
  const xChange = Math.cos(this.currVelocity.angle) * magnitude;
  const yChange = Math.sin(this.currVelocity.angle) * magnitude;
  return { xChange, yChange };
};

*/
export {
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
  findDerivative,
  vector,
  twoPointXYDif,
  shapeArea,
};