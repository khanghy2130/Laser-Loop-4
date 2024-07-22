// CONSTANTS
const SPHERE_SCALE = 280;
const DRAG_SPEED = 0.36;
const REPEL = 25;
const ELASTICITY = 0.15;
const CHECK_COLOR_SPEED = 0.06;
const CLICK_EFFECT_SPEED = 0.06;
const PARTICLE_SPEED = 1.2;
const LASER_SPEED = 0.2;

const MAX_STEPS = 5;
const NEXT_REFLECTOR_RANGE = 8; // max range
const SKIP_CHANCE_FACTOR = 0.15;
const UNIQUE_PERCENTAGES = [0.62, 0.79];

const SPHERE_TRANSITION_SPEED = 0.05;
const BUTTON_TRANSITION_SPEED = 0.3;

const COLORS = {
  BG: [54, 0, 37],
  GRID: [250, 118, 186],
  LASER: [20, 237, 96],
  REFLECTOR: [205, 55, 133],
  YELLOW: [255, 255, 0],
};

// GAMEPLAY DATA
// smallFace {vertices[3], adjacents[3], isVisible}
let mainFaces = [];
let allSmallFaces = [];
let uniqueEdges = []; // {v0, v1, smallFaces[2]}
let uniqueVertices = [];

let reflectors = []; // smallFace[]
let walls = []; // smallFace[]
// ap = animation progress (set 0 on laser hit)
let checks = []; // {sf, isHit, ap}[]

let maxReflectorsAllowed = 0;
let laserParticles = []; // {rPos, vPos, s}[]
let laserPaths = [];
let laserSourceSF = null;
let isLooped = false;
let laserAP = 0;
let brightLaserAP = 0;
let hasCompleted = false;
const traveler = {
  ap: 0,
  laserPathIndex: 0,
};

let yUI = 0;
let reflectorsCountAP = 0;

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

const GameButton = function (x, y, w, h, ts, t, clicked) {
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.ts = ts;
  this.t = t;
  this.clicked = clicked;
  this.isHovered = false;
  this.ap = 0; // hovered is towards 1
};
GameButton.prototype.render = function () {
  // check hover
  if (
    _mouseX > this.x - this.w / 2 &&
    _mouseX < this.x + this.w / 2 &&
    _mouseY > this.y - this.h / 2 &&
    _mouseY < this.y + this.h / 2
  ) {
    this.isHovered = true;
    cursor(HAND);
  } else {
    this.isHovered = false;
  }

  // update .ap
  if (this.isHovered) this.ap += (1 - this.ap) * BUTTON_TRANSITION_SPEED;
  else this.ap += (0 - this.ap) * BUTTON_TRANSITION_SPEED;
  this.ap = constrain(this.ap, 0, 1);

  // render
  noStroke();
  fill(...COLORS.GRID);
  rect(this.x, this.y, this.w, this.h);
  fill(...COLORS.LASER);
  rect(this.x, this.y, this.w * this.ap, this.h);
  textSize(this.ts);
  fill(...COLORS.BG);
  /// nKA y
  text(this.t, this.x, this.y - 5);
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

function nti(newIndex) {
  // only fixes one cycle
  if (newIndex >= 3) return newIndex - 3;
  if (newIndex <= -1) return newIndex + 3;
  return newIndex;
}

// disable right click menu
document.addEventListener("contextmenu", (event) => {
  event.preventDefault();
});
