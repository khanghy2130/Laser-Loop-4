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

  angleMode(DEGREES);
  textAlign(CENTER, CENTER);
  strokeJoin(ROUND);

  buildMainFaces();
  applyRotation(0, 0);

  //// set below after generated a puzzle
  laserSourceSF = mainFaces[0].smallFaces[0];
  initiateStarterLaserPath();
}

function draw() {
  _mouseX = mouseX / scaleFactor;
  _mouseY = mouseY / scaleFactor;
  touchCountdown--;
  hoveredSF = null;
  background(...COLORS.BG);
  translate(width / 2, height / 2);

  // Draw reflectors
  fill(...COLORS.REFLECTOR);
  noStroke();
  for (let i = 0; i < reflectors.length; i++) {
    if (!reflectors[i].isVisible) continue;
    const vertices = reflectors[i].vertices;
    triangle(
      vertices[0][0],
      vertices[0][1],
      vertices[1][0],
      vertices[1][1],
      vertices[2][0],
      vertices[2][1]
    );
  }

  // Draw walls
  fill(...COLORS.WALL);
  for (let i = 0; i < walls.length; i++) {
    if (!walls[i].isVisible) continue;
    const vertices = walls[i].vertices;
    triangle(
      vertices[0][0],
      vertices[0][1],
      vertices[1][0],
      vertices[1][1],
      vertices[2][0],
      vertices[2][1]
    );
  }

  // render laserSource
  if (laserSourceSF.isVisible) {
    fill(...COLORS.LASER);
    noStroke();
    triangle(
      laserSourceSF.vertices[0][0],
      laserSourceSF.vertices[0][1],
      laserSourceSF.vertices[1][0],
      laserSourceSF.vertices[1][1],
      laserSourceSF.vertices[2][0],
      laserSourceSF.vertices[2][1]
    );
  }

  // Render edges
  stroke(...COLORS.GRID);
  strokeWeight(3);
  for (const ue of uniqueEdges) {
    if (ue.smallFaces[0].isVisible || ue.smallFaces[1].isVisible) {
      line(ue.v0[0], ue.v0[1], ue.v1[0], ue.v1[1]);
    }
  }

  // update laser
  makeNewLaserPath(); //// not during animated movement

  // render laser
  strokeWeight(10);
  stroke(...COLORS.LASER);
  for (let i = 1; i < laserPaths.length; i++) {
    const lp = laserPaths[i];
    if (!lp.smallFace.isVisible) {
      continue;
    }

    const midV1 = [
      (lp.smallFace.vertices[lp.e1i][0] +
        lp.smallFace.vertices[nti(lp.e1i + 1)][0]) /
        2,
      (lp.smallFace.vertices[lp.e1i][1] +
        lp.smallFace.vertices[nti(lp.e1i + 1)][1]) /
        2,
    ];
    const midV2 = [
      (lp.smallFace.vertices[lp.e2i][0] +
        lp.smallFace.vertices[nti(lp.e2i + 1)][0]) /
        2,
      (lp.smallFace.vertices[lp.e2i][1] +
        lp.smallFace.vertices[nti(lp.e2i + 1)][1]) /
        2,
    ];
    line(midV1[0], midV1[1], midV2[0], midV2[1]);
  }

  // check hover
  for (let i = 0; i < mainFaces.length; i++) {
    const smallFaces = mainFaces[i].smallFaces;
    for (const sf of smallFaces) {
      if (!sf.isVisible) continue;

      const isHovered =
        !hoveredSF &&
        pointInTriangle(
          [_mouseX - width / 2, _mouseY - height / 2],
          sf.vertices[0],
          sf.vertices[1],
          sf.vertices[2]
        );
      if (isHovered) {
        noFill();
        stroke(...COLORS.YELLOW);
        hoveredSF = sf;
        triangle(
          sf.vertices[0][0],
          sf.vertices[0][1],
          sf.vertices[1][0],
          sf.vertices[1][1],
          sf.vertices[2][0],
          sf.vertices[2][1]
        );
      }
    }
  }
}

function mouseDragged() {
  isDragging = true;
  applyRotation(
    (mouseX - pmouseX) * DRAG_SPEED, // angleY
    (mouseY - pmouseY) * -DRAG_SPEED // angleX
  );
}

function touchStarted() {
  touchPos[0] = mouseX;
  touchPos[1] = mouseY;
}

function touchEnded() {
  // was dragging? additional check to ignore short drag
  if (
    isDragging &&
    dist(mouseX, mouseY, touchPos[0], touchPos[1]) > 5 / scaleFactor
  ) {
    isDragging = false;
    return;
  }

  if (touchCountdown > 0) {
    return;
  } else {
    touchCountdown = 5;
  }

  if (hoveredSF) {
    triangleClicked(hoveredSF);
    return;
  }

  //// click actions
}
