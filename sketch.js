// function keyPressed() {
//   if (keyCode !== 32) return;
//   winAP = 0;
//   hasCompleted = true;
// }

// nKA
let _mouseX, _mouseY;
let scaleFactor = 1;
function windowResized() {
  viewportWidth = Math.min(window.innerWidth, window.innerHeight);
  scaleFactor = viewportWidth / 600;
  canvas.elt.style.transform = "scale(" + scaleFactor + ")";
}

let mainFont;
const sounds = {};
function preload() {
  mainFont = loadFont("./AGENCYR.TTF");
  sounds.click = loadSound("./sounds/battle-swing.mp3");
  sounds.splat = loadSound("./sounds/hit-splat.mp3");
  sounds.bubble = loadSound("./sounds/water-bubble.mp3");
}

// nKA
function _playSound(sound, rate) {
  sound.currentTime = 0;
  sound.playbackRate = 1 + rate;
  sound.play();
}

function setup() {
  // nKA
  canvas = createCanvas(600, 600, document.getElementById("game-canvas"));
  windowResized();

  // nKA
  STATS[0].bestTime = localStorage.getItem("0bestTime") || null;
  STATS[0].completeCount = localStorage.getItem("0completeCount") || 0;
  STATS[1].bestTime = localStorage.getItem("1bestTime") || null;
  STATS[1].completeCount = localStorage.getItem("1completeCount") || 0;
  STATS[2].bestTime = localStorage.getItem("2bestTime") || null;
  STATS[2].completeCount = localStorage.getItem("2completeCount") || 0;

  // nKA
  sounds.click.preservesPitch = false;
  sounds.splat.preservesPitch = false;
  sounds.bubble.preservesPitch = false;

  textFont(mainFont);
  angleMode(DEGREES);
  textAlign(CENTER, CENTER);
  rectMode(CENTER);
  strokeJoin(ROUND);

  buildMainFaces();
  applyRotation(0, 0);
}

function draw() {
  _mouseX = mouseX / scaleFactor;
  _mouseY = mouseY / scaleFactor;
  touchCountdown--;
  cursor(ARROW);
  background(...COLORS.BG);

  if (scene === "PLAY") playScene();
  else {
    renderSphere();
    if (scene === "TITLE") titleScene();
    else if (scene === "SELECT") selectScene();
    else if (scene === "GENERATING") generatingScene();
  }
}

function mouseDragged() {
  isDragging = true;
  if (scene === "PLAY") playSceneMouseDragged();
}

function touchStarted() {
  touchPos[0] = mouseX;
  touchPos[1] = mouseY;
}

function touchEnded() {
  // was dragging?
  if (isDragging) {
    isDragging = false;
    // ignore short drag
    if (dist(mouseX, mouseY, touchPos[0], touchPos[1]) > 5 / scaleFactor) {
      return;
    }
  }

  if (touchCountdown > 0) {
    return;
  } else {
    touchCountdown = 5;
  }

  if (scene === "PLAY") playSceneTouchEnded();
  else if (scene === "SELECT") selectSceneTouchEnded();
  else if (scene === "TITLE") titleSceneTouchEnded();
}
