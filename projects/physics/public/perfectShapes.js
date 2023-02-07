import { Shape } from './script.js';

import { shapeArea } from './math.js';

const makeNSidedPolygon = (n, center, radius, startingVector) => {
  const vertices = [];
  const angleBetweenPoints = (2 * Math.PI) / n;
  for (let i = 0; i < n; i++) {
    vertices.push({
      x: center.x + Math.cos(angleBetweenPoints * i) * radius,
      y: center.y + Math.sin(angleBetweenPoints * i) * radius,
    });
  }
  console.log(vertices);
  return new Shape(
    startingVector,
    vertices,
    shapeArea(vertices) * document.getElementById('density').value,
  );
};

export { makeNSidedPolygon };
