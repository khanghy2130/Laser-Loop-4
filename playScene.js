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
}

function playScene() {
  hoveredSF = null;

  /////// test
  noStroke();
  fill(255);
  text(
    generator.diffOps.LASER_LENGTH[0] + "-" + generator.diffOps.LASER_LENGTH[1],
    50,
    550
  );
  text(generator.visitedSFs.length, 50, 580);

  translate(width / 2, height / 2);

  // Draw reflectors
  fill(...COLORS.REFLECTOR);
  noStroke();
  for (let i = 0; i < reflectors.length; i++) {
    if (!reflectors[i].isVisible) continue;
    const vertices = reflectors[i].vertices;
    fill(...COLORS.REFLECTOR); /////r
    triangle(
      vertices[0][0],
      vertices[0][1],
      vertices[1][0],
      vertices[1][1],
      vertices[2][0],
      vertices[2][1]
    );
    fill(255); /////r
    text(
      i + 1,
      (vertices[0][0] + vertices[1][0] + vertices[2][0]) / 3,
      (vertices[0][1] + vertices[1][1] + vertices[2][1]) / 3
    ); /////r
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

  // update laser
  laserAP = min(laserAP + LASER_SPEED, 1);
  if (laserAP === 1) makeNewLaserPath();

  // Draw laser
  strokeWeight(10);
  stroke(...COLORS.LASER);
  for (let i = 0; i < laserPaths.length; i++) {
    const lp = laserPaths[i];
    if (!lp.sf.isVisible) continue;

    let midV1 = [
      (lp.sf.vertices[lp.e1i][0] + lp.sf.vertices[nti(lp.e1i + 1)][0]) / 2,
      (lp.sf.vertices[lp.e1i][1] + lp.sf.vertices[nti(lp.e1i + 1)][1]) / 2,
    ];
    let midV2 = [
      (lp.sf.vertices[lp.e2i][0] + lp.sf.vertices[nti(lp.e2i + 1)][0]) / 2,
      (lp.sf.vertices[lp.e2i][1] + lp.sf.vertices[nti(lp.e2i + 1)][1]) / 2,
    ];

    // first path? starts from inside the triangle
    if (i === 0) {
      midV1 = [(midV1[0] + midV2[0]) / 2, (midV1[1] + midV2[1]) / 2];
    }

    if (i < laserPaths.length - 1) {
      line(midV1[0], midV1[1], midV2[0], midV2[1]);
    }
    // last path is animated & add particles
    else {
      const laserTipPos = [
        midV1[0] + (midV2[0] - midV1[0]) * laserAP,
        midV1[1] + (midV2[1] - midV1[1]) * laserAP,
      ];
      line(midV1[0], midV1[1], laserTipPos[0], laserTipPos[1]);

      // add particles
      const v0 = lp.sf.vertices[lp.e2i];
      const v1 = lp.sf.vertices[nti(lp.e2i + 1)];
      const randomDeg = random(0, 360);
      laserParticles.push({
        rPos: laserTipPos,
        vPos: [
          cos(randomDeg) * PARTICLE_SPEED,
          sin(randomDeg) * PARTICLE_SPEED,
        ],
        s: 1,
      });
    }
  }

  // Draw laser particles
  stroke(...COLORS.LASER);
  for (let i = laserParticles.length - 1; i >= 0; i--) {
    const lp = laserParticles[i];
    // apply vPos to rPos
    lp.rPos[0] += lp.vPos[0];
    lp.rPos[1] += lp.vPos[1];
    strokeWeight(lp.s * 12); // particle size
    point(lp.rPos[0], lp.rPos[1]);
    lp.s -= 0.05;
    if (lp.s <= 0) {
      laserParticles.splice(i, 1);
    }
  }

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

  /// test: draw current pathsAhead
  // noStroke();
  // if (generator.isGeneratingLaser) {
  //   const pathsAhead =
  //     generator.generatedHistory[generator.generatedHistory.length - 1]
  //       .pathsAhead;
  //   for (let i = 0; i < pathsAhead.length; i++) {
  //     const pa = pathsAhead[i];
  //     if (!pa.sf.isVisible) continue;
  //     const vs = pa.sf.vertices;
  //     if (pa.canPlaceHere) fill(0, 100, 255, 200);
  //     else fill(255, 100, 0, 100);
  //     triangle(vs[0][0], vs[0][1], vs[1][0], vs[1][1], vs[2][0], vs[2][1]);
  //   }
  // }
  /// test: draw visited sfs
  noStroke();
  for (let i = 0; i < generator.visitedSFs.length; i++) {
    const sf = generator.visitedSFs[i];
    if (!sf.isVisible) continue;
    if (floor(frameCount / 10) % generator.visitedSFs.length !== i) continue;
    const vs = sf.vertices;
    fill(255, 255, 255, 100);
    triangle(vs[0][0], vs[0][1], vs[1][0], vs[1][1], vs[2][0], vs[2][1]);
  }

  // Draw ////////// flash white fade back to color on trigger
  noStroke();
  textSize(32);
  textAlign(LEFT);
  fill(...COLORS.YELLOW);
  text("0/8▲", -280, -260);
  fill(...COLORS.LASER);
  text("∞▲", -280, -220);
  textAlign(CENTER);

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
}
