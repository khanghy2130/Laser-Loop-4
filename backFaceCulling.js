function crossProduct(v1, v2) {
  return [
    v1[1] * v2[2] - v1[2] * v2[1],
    v1[2] * v2[0] - v1[0] * v2[2],
    v1[0] * v2[1] - v1[1] * v2[0],
  ];
}

function dotProduct(v1, v2) {
  return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
}

function subtract(v1, v2) {
  return [v1[0] - v2[0], v1[1] - v2[1], v1[2] - v2[2]];
}

// function to determine if the triangle is facing the canvas
function isFacingCanvas(vertices) {
  const [v0, v1, v2] = vertices;
  const edge1 = subtract(v1, v0);
  const edge2 = subtract(v2, v0);
  return dotProduct(crossProduct(edge1, edge2), [0, 0, 1]) > 0;
}
