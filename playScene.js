function playSceneMouseDragged() {
  applyRotation(
    (mouseX - pmouseX) * DRAG_SPEED, // angleY
    (mouseY - pmouseY) * -DRAG_SPEED // angleX
  );
}

function playSceneTouchEnded() {
  if (hoveredSF) {
    triangleClicked(hoveredSF);
    return;
  }
  if (resetBtn.isHovered) resetBtn.clicked();
  if (helpBtn.isHovered) helpBtn.clicked();
  if (skipBtn.isHovered) skipBtn.clicked();
}

function playScene() {
  hoveredSF = null;

  push();
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
  fill(...COLORS.GRID);
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
    fill(...COLORS.GRID, min(1 - clickEffect.ap, 1) * 255);
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

  renderLaser(...COLORS.LASER);

  // check hover
  for (let sfi = 0; sfi < allSmallFaces.length; sfi++) {
    const sf = allSmallFaces[sfi];
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
      break;
    }
  }

  updateTargetSF();
  // Draw targeting effect
  noFill();
  strokeWeight(6);
  stroke(...COLORS.GRID);
  const rv = targetingEffect.renderVertices;
  triangle(rv[0][0], rv[0][1], rv[1][0], rv[1][1], rv[2][0], rv[2][1]);

  // Draw light up transition
  if (sphereInfo.light > 0) {
    noStroke();
    fill(...COLORS.GRID, 255 * sphereInfo.light);
    for (let i = 0; i < allSmallFaces.length; i++) {
      const sf = allSmallFaces[i];
      if (!sf.isVisible) continue;
      const vs = sf.vertices;
      triangle(vs[0][0], vs[0][1], vs[1][0], vs[1][1], vs[2][0], vs[2][1]);
    }
    sphereInfo.light = max(sphereInfo.light - 0.05, 0);
  }

  // Draw solution numbers
  fill(255);
  noStroke();
  textSize(32);
  for (let sri = 0; sri < solutionReflectors.length; sri++) {
    const sf = solutionReflectors[sri];
    if (!sf.isVisible) continue;
    text(
      sri + 1,
      (sf.vertices[0][0] + sf.vertices[1][0] + sf.vertices[2][0]) / 3,
      (sf.vertices[0][1] + sf.vertices[1][1] + sf.vertices[2][1]) / 3
    );
  }
  pop();

  renderUI();
  renderWinAnimation();
}

const skipBtn = new GameButton(60, 560, 100, 40, 28, "Skip", function () {
  ////
});
const helpBtn = new GameButton(540, 560, 100, 40, 28, "Help", function () {
  ////
});
const resetBtn = new GameButton(60, 40, 100, 40, 28, "Reset", function () {
  reflectorsCountAP = 1;
  reflectors.length = 0;
  laserPaths.length = 1;
  resetChecksIsHit();
});
function renderUI() {
  yUI -= yUI * 0.1;
  translate(0, yUI); /// nKA might need pushpop
  skipBtn.render();
  helpBtn.render();
  resetBtn.render();
  reflectorsCountAP = max(reflectorsCountAP - 0.1, 0);
  fill(lerpColor(color(...COLORS.GRID), color(255), reflectorsCountAP));
  textSize(52);
  text(maxReflectorsAllowed - reflectors.length, 30, 90);
}

function renderWinAnimation() {
  if (!hasCompleted || winAP > 4) return;

  winAP += 0.02;
  textSize(100);

  // pink rects appear
  noStroke();
  if (winAP < 3) {
    fill(...COLORS.GRID);
    for (let i = 0; i < 5; i++) {
      rect(
        300 + (i - 2) * 100,
        300,
        100,
        160 * constrain(easeOutQuint(min(winAP - i * 0.12, 1)), 0, 1)
      );
    }
  }

  if (winAP < 2) {
    fill(...COLORS.BG, min(winAP, 1 / 2) * 2 * 255);
    text("LOOP", 300, 295); // nKA
  }

  // green rects appear
  if (winAP < 3) {
    fill(...COLORS.LASER);
    for (let i = 0; i < 5; i++) {
      rect(
        300 + (i - 2) * 100,
        300,
        100,
        160 * constrain(easeOutQuint(min(winAP - 1.5 - i * 0.12, 1)), 0, 1)
      );
    }
  }

  // green rects disappear
  if (winAP >= 3) {
    fill(...COLORS.LASER);
    for (let i = 0; i < 5; i++) {
      rect(
        300 + (i - 2) * 100,
        300,
        100,
        160 * constrain(1 - easeOutQuint(min(winAP - 3 - i * 0.12, 1)), 0, 1)
      );
    }
  }

  if (winAP > 1.5) {
    if (winAP < 3) {
      fill(...COLORS.BG, min(winAP - 1.8, 1 / 2) * 2 * 255);
    } else {
      fill(...COLORS.BG, (1 / 2 - min(winAP - 3, 1 / 2)) * 2 * 255);
    }
    text("COMPLETED", 300, 295); // nKA
  }
}
