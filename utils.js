// CONSTANTS
const SPHERE_SCALE = 280;
const DRAG_SPEED = 0.36;
const REPEL = 25;
const ELASTICITY = 0.15;
const CHECK_COLOR_SPEED = 0.06;
const CLICK_EFFECT_SPEED = 0.06;
const PARTICLE_SPEED = 1.2;
const LASER_SPEED = 0.2;

const NEXT_REFLECTOR_RANGE = 8;

const COLORS = {
  BG: [54, 0, 37],
  GRID: [250, 118, 186],
  LASER: [35, 255, 115],
  REFLECTOR: [204, 55, 133],
  WALL: [250, 118, 186],
  YELLOW: [255, 255, 0],
};

// DATA
// smallFace {vertices[3], adjacents[3], isVisible}
let mainFaces = [];
let allSmallFaces = [];
let uniqueEdges = []; // {v0, v1, smallFaces[2]}
let uniqueVertices = [];

let reflectors = []; // smallFace[]
let walls = []; // smallFace[]
// ap = animation progress (set 0 on laser hit)
let checks = []; // {sf, isHit, ap}[]

let laserParticles = []; // {rPos, vPos, s}[]
let laserPaths = [];
let laserSourceSF = null;
let isLooped = false;
let laserAP = 0;

// INPUTS
let hoveredSF = null;
let touchCountdown = 0;
let isDragging = false;
const touchPos = [0, 0];
const clickEffect = {
  sf: null,
  ap: 1,
};

const targetingEffect = {
  sf: null,
  renderVertices: [
    [0, 0],
    [0, 0],
    [0, 0],
  ],
};

// HELPERS
function sign(p1, p2, p3) {
  return (p1[0] - p3[0]) * (p2[1] - p3[1]) - (p2[0] - p3[0]) * (p1[1] - p3[1]);
}
function pointInTriangle(pt, v1, v2, v3) {
  const d1 = sign(pt, v1, v2);
  const d2 = sign(pt, v2, v3);
  const d3 = sign(pt, v3, v1);
  const has_neg = d1 < 0 || d2 < 0 || d3 < 0;
  const has_pos = d1 > 0 || d2 > 0 || d3 > 0;
  return !(has_neg && has_pos);
}
function getTriangleCenter(vertices) {
  return [
    (vertices[0][0] + vertices[1][0] + vertices[2][0]) / 3,
    (vertices[0][1] + vertices[1][1] + vertices[2][1]) / 3,
  ];
}

function randomInt(end) {
  return Math.floor(Math.random() * end);
}
function getRandomItem(arr) {
  return arr[randomInt(arr.length)];
}
function popRandomItem(arr) {
  return arr.splice(randomInt(arr.length), 1)[0];
}

// disable right click menu
document.addEventListener("contextmenu", (event) => {
  event.preventDefault();
});
