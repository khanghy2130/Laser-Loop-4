function keyPressed() {
  if (keyCode !== 32) return;
  generator.generate(2);
}

// nKA
let _mouseX, _mouseY;
let scaleFactor = 1;
function windowResized() {
  viewportWidth = Math.min(window.innerWidth, window.innerHeight);
  scaleFactor = viewportWidth / 600;
  canvas.elt.style.transform = "scale(" + scaleFactor + ")";
}

function setup() {
  // nKA
  canvas = createCanvas(600, 600, document.getElementById("game-canvas"));
  windowResized();

  textFont("Agency FB");
  angleMode(DEGREES);
  textAlign(CENTER, CENTER);
  strokeJoin(ROUND);

  buildMainFaces();
  applyRotation(0, 0);

  generator.generate(randomInt(generator.DIFFICULTY_OPTIONS.length)); ///r
}

function draw() {
  _mouseX = mouseX / scaleFactor;
  _mouseY = mouseY / scaleFactor;
  touchCountdown--;
  background(...COLORS.BG);

  if (scene === "GENERATING") {
    generatingScene();
  } else if (scene === "PLAY") {
    playScene();
  }
}

function mouseDragged() {
  isDragging = true;
  if (scene === "PLAY") {
    playSceneMouseDragged();
  }
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

  if (scene === "PLAY") {
    playSceneTouchEnded();
  }
}
