//vector manipulation, stored in radians
const vector = (degrees, magnitude) => {
  return { angle: degrees * Math.PI / 180, magnitude };
};

const add2Vectors = (v1, v2) => {
  const x1 = Math.cos(v1.angle) * v1.magnitude;
  const x2 = Math.cos(v2.angle) * v2.magnitude;
  const y1 = Math.sin(v1.angle) * v1.magnitude;
  const y2 = Math.sin(v2.angle) * v2.magnitude;
  const angle = Math.atan2(y1 + y2, x1 + x2);
  const magnitude = Math.hypot((x1 - x2), (y1 - y2));
  return { angle, magnitude };
};

const vectorMultiply = (vector, n) => {
   if (n >= 0) {
    return { angle: vector.angle, magnitude: vector.magnitude * n };
   } else {
    return { angle: (vector.angle + Math.PI) % (2 * Math.PI), magnitude: vector.magnitude * -n };
  };
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

const sigma = (start, end, funct) => {
  let sum = 0;
  for (let i = start; i <= end; i++) {
    sum += funct(i);
  };
  return sum;
};

const pi = (start, end, funct) => {
  let product = 1;
  for (let i = start; i <= end; i++) {
    product *= funct(i);
  };
  return product;
};

const degToRad = (radAngle) => {
  return radAngle * Math.PI / 180;
};

const radToDeg = (degAngle) => {
  return degAngle * 180 / Math.PI;
};

const mean = (array) => {
  return array.reduce((a,e) => a+e, 0) / array.length;
};

const geoMean = (array) => {
  return pi(0, array.length - 1, i => array[i]) ** (1 / (array.length - 1));
};

//these next two take 2 objects with x and y
const twoPointAngle = (p1, p2) => {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
};

const twoPointDist = (p1, p2) => {
  return Math.hypot(Math.abs(p1.x - p2.x), Math.abs(p1.y - p2.y));
};

//time derivative(s)
const getAcceleration = (force, mass, appliedTime) => {
  return force / mass * appliedTime;
};

const getVelocity = (force, mass, appliedTime, fps) => getAcceleration(force, mass, appliedTime) * (1/fps);

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
  twoPointDist,
  getAcceleration,
  getVelocity
};

//Verlet Integration, don't worry about this for now (I gotta take Calc BC now xD)
/*
last_acceleration = acceleration
position += velocity * time_step + ( 0.5 * last_acceleration * time_step^2 )
new_acceleration = force / mass 
avg_acceleration = ( last_acceleration + new_acceleration ) / 2
velocity += avg_acceleration * time_step
*/