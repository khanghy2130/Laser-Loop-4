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

  ///// reset
  clickEffect.sf = null;
  isLooped = false;
  laserParticles = [];
  laserPaths = [];
  reflectors = [];
  walls = [];
  checks = [];

  //// set below after generated a puzzle
  laserSourceSF = mainFaces[0].smallFaces[0];
  initiateStarterLaserPath(); // add first laser path

  //// wall dummy
  walls[0] = mainFaces[5].smallFaces[0];
  walls[1] = mainFaces[5].smallFaces[1];
  walls[2] = mainFaces[5].smallFaces[2];

  // checks dummy
  checks[0] = {
    sf: mainFaces[2].smallFaces[3],
    isHit: false,
    ap: 0,
  };
  checks[1] = {
    sf: mainFaces[3].smallFaces[1],
    isHit: false,
    ap: 0,
  };
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

  // Draw checks
  for (let i = 0; i < checks.length; i++) {
    const check = checks[i];
    // update ap
    if (check.isHit) check.ap += CHECK_COLOR_SPEED;
    else check.ap -= CHECK_COLOR_SPEED;
    check.ap = constrain(check.ap, 0, 1);
    if (!check.sf.isVisible) continue; // skip if not visible

    if (check.isHit) {
      fill(lerpColor(color(...COLORS.BG), color(...COLORS.LASER), check.ap));
    } else {
      fill(
        lerpColor(color(...COLORS.YELLOW), color(...COLORS.LASER), check.ap)
      );
    }
    const cvs = check.sf.vertices;
    triangle(
      (cvs[0][0] + cvs[1][0]) / 2,
      (cvs[0][1] + cvs[1][1]) / 2,
      (cvs[1][0] + cvs[2][0]) / 2,
      (cvs[1][1] + cvs[2][1]) / 2,
      (cvs[2][0] + cvs[0][0]) / 2,
      (cvs[2][1] + cvs[0][1]) / 2
    );
  }

  // Draw laserSource
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

  // Draw click effect
  if (clickEffect.sf) {
    clickEffect.ap += CLICK_EFFECT_SPEED;
    fill(...COLORS.WALL, min(1 - clickEffect.ap, 1) * 255);
    triangle(
      clickEffect.sf.vertices[0][0],
      clickEffect.sf.vertices[0][1],
      clickEffect.sf.vertices[1][0],
      clickEffect.sf.vertices[1][1],
      clickEffect.sf.vertices[2][0],
      clickEffect.sf.vertices[2][1]
    );
    if (clickEffect.ap >= 1) clickEffect.sf = null;
  }

  // Draw edges
  stroke(...COLORS.GRID);
  strokeWeight(3.5);
  for (const ue of uniqueEdges) {
    if (ue.smallFaces[0].isVisible || ue.smallFaces[1].isVisible) {
      line(ue.v0[0], ue.v0[1], ue.v1[0], ue.v1[1]);
    }
  }

  // update laser
  makeNewLaserPath(); //// not during animated movement

  // Draw laser
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

  const lastLP = laserPaths[laserPaths.length - 1];
  // add particles (if sf visible & not too frequently)
  if (lastLP.smallFace.isVisible && frameCount % 2 === 0) {
    const v0 = lastLP.smallFace.vertices[lastLP.e2i];
    const v1 = lastLP.smallFace.vertices[nti(lastLP.e2i + 1)];
    const randomDeg = random(0, 360);
    laserParticles.push({
      rPos: [(v0[0] + v1[0]) / 2, (v0[1] + v1[1]) / 2],
      vPos: [cos(randomDeg) * PARTICLE_SPEED, sin(randomDeg) * PARTICLE_SPEED],
      s: 1,
    });
  }
  // Draw laser particles
  stroke(...COLORS.LASER);
  for (let i = laserParticles.length - 1; i >= 0; i--) {
    const lp = laserParticles[i];
    // apply vPos to rPos
    lp.rPos[0] += lp.vPos[0];
    lp.rPos[1] += lp.vPos[1];
    strokeWeight(lp.s * 13); // particle size
    point(lp.rPos[0], lp.rPos[1]);
    lp.s -= 0.04;
    if (lp.s <= 0) {
      laserParticles.splice(i, 1);
    }
  }

  // check hover
  for (let i = 0; i < mainFaces.length; i++) {
    const smallFaces = mainFaces[i].smallFaces;
    for (const sf of smallFaces) {
      if (!sf.isVisible) continue;
      if (
        !hoveredSF &&
        pointInTriangle(
          [_mouseX - width / 2, _mouseY - height / 2],
          sf.vertices[0],
          sf.vertices[1],
          sf.vertices[2]
        )
      ) {
        hoveredSF = sf;
      }
    }
  }

  updateTargetSF();
  // Draw targeting effect
  noFill();
  strokeWeight(6);
  stroke(...COLORS.YELLOW);
  const rv = targetingEffect.renderVertices;
  triangle(rv[0][0], rv[0][1], rv[1][0], rv[1][1], rv[2][0], rv[2][1]);
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

  if (hoveredSF) {
    triangleClicked(hoveredSF);
    return;
  }

  //// click actions
}
