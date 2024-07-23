// LaserPath {stepsLeft, sf, e1i, e2i}
// e1i: edge 1 index

function initiateStarterLaserPath() {
  const e1i = randomInt(3);
  laserPaths = [
    {
      stepsLeft: MAX_STEPS,
      sf: laserSourceSF,
      e1i: e1i,
      e2i: nti(Math.random() > 0.5 ? e1i + 1 : e1i - 1),
    },
  ];
}

function resetChecksIsHit() {
  for (let ci = 0; ci < checks.length; ci++) {
    checks[ci].isHit = getLaserPathIndexOf(checks[ci].sf) !== -1;
  }
  // reset other stuffs too
  isLooped = false;
  laserAP = 1;
}

// return -1 if not found
function getLaserPathIndexOf(sf) {
  for (let i = 0; i < laserPaths.length; i++) {
    if (laserPaths[i].sf === sf) return i;
  }
  return -1;
}

function makeNewLaserPath() {
  // always has at least 1 path
  const currentPath = laserPaths[laserPaths.length - 1];
  const nextSF = currentPath.sf.adjacents[currentPath.e2i];

  // out of steps AND not reaching source?
  if (currentPath.stepsLeft <= 0 && nextSF !== laserSourceSF) {
    return;
  }

  // currently e2i === e1i + 1?
  const goingClockwise =
    (currentPath.e1i === 0 && currentPath.e2i === 1) ||
    (currentPath.e1i === 1 && currentPath.e2i === 2) ||
    (currentPath.e1i === 2 && currentPath.e2i === 0);

  // hitting a reflector or wall?
  if (reflectors.includes(nextSF) || walls.includes(nextSF)) {
    // does nothing if only one laser path
    if (laserPaths.length === 1) {
      isLooped = true;
      return;
    }

    const e1i = currentPath.e2i;
    laserPaths.push({
      stepsLeft: currentPath.stepsLeft - 1,
      sf: currentPath.sf,
      e1i: e1i,
      e2i: goingClockwise ? nti(e1i + 1) : nti(e1i - 1),
    });
  }
  // go straight?
  else {
    // reaching source?
    if (nextSF === laserSourceSF) {
      isLooped = true;
      checkWin();
      return;
    }

    let reachingCheck = false;
    for (let ci = 0; ci < checks.length; ci++) {
      // reached a check that is not hit yet?
      if (checks[ci].sf === nextSF && !checks[ci].isHit) {
        checks[ci].isHit = true;
        reachingCheck = true;
        if (generator.isDoneGenerating) _playSound(sounds.bubble, 8);
        break;
      }
    }

    const e1i = nextSF.adjacents.indexOf(currentPath.sf);
    laserPaths.push({
      // restore steps?
      stepsLeft: reachingCheck ? MAX_STEPS : currentPath.stepsLeft - 1,
      sf: nextSF,
      e1i: e1i,
      e2i: goingClockwise ? nti(e1i - 1) : nti(e1i + 1),
    });
  }
  laserAP = 0;
}

function resetTraveler() {
  if (laserPaths.length < traveler.laserPathIndex) {
    traveler.laserPathIndex = 1;
    traveler.ap = 0;
  }
}

function renderLaser() {
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

  // Draw traveler
  traveler.ap += isLooped ? 0.2 : 0.05;
  if (traveler.ap >= 1) {
    traveler.ap = 0;
    traveler.laserPathIndex++;
    resetTraveler();
  }
  // head
  const headLP = laserPaths[traveler.laserPathIndex];
  const tailLP = laserPaths[traveler.laserPathIndex - 1];
  stroke(255);
  if (headLP && headLP.sf.isVisible) {
    let midV1 = [
      (headLP.sf.vertices[headLP.e1i][0] +
        headLP.sf.vertices[nti(headLP.e1i + 1)][0]) /
        2,
      (headLP.sf.vertices[headLP.e1i][1] +
        headLP.sf.vertices[nti(headLP.e1i + 1)][1]) /
        2,
    ];
    let midV2 = [
      (headLP.sf.vertices[headLP.e2i][0] +
        headLP.sf.vertices[nti(headLP.e2i + 1)][0]) /
        2,
      (headLP.sf.vertices[headLP.e2i][1] +
        headLP.sf.vertices[nti(headLP.e2i + 1)][1]) /
        2,
    ];
    const tipPos = [
      midV1[0] + (midV2[0] - midV1[0]) * traveler.ap,
      midV1[1] + (midV2[1] - midV1[1]) * traveler.ap,
    ];
    line(midV1[0], midV1[1], tipPos[0], tipPos[1]);
  }
  if (tailLP && tailLP.sf.isVisible && traveler.laserPathIndex > 1) {
    let midV1 = [
      (tailLP.sf.vertices[tailLP.e1i][0] +
        tailLP.sf.vertices[nti(tailLP.e1i + 1)][0]) /
        2,
      (tailLP.sf.vertices[tailLP.e1i][1] +
        tailLP.sf.vertices[nti(tailLP.e1i + 1)][1]) /
        2,
    ];
    let midV2 = [
      (tailLP.sf.vertices[tailLP.e2i][0] +
        tailLP.sf.vertices[nti(tailLP.e2i + 1)][0]) /
        2,
      (tailLP.sf.vertices[tailLP.e2i][1] +
        tailLP.sf.vertices[nti(tailLP.e2i + 1)][1]) /
        2,
    ];
    const tipPos = [
      midV1[0] + (midV2[0] - midV1[0]) * traveler.ap,
      midV1[1] + (midV2[1] - midV1[1]) * traveler.ap,
    ];
    line(tipPos[0], tipPos[1], midV2[0], midV2[1]);
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
}
