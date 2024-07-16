// LaserPath {stepsLeft, smallFace, e1i, e2i}
// e1i: edge 1 index

function initiateStarterLaserPath() {
  const e1i = randomInt(0, 3);
  laserPaths.push({
    stepsLeft: 10,
    smallFace: laserSourceSF,
    e1i: e1i,
    e2i: nti(Math.random() > 0.5 ? e1i + 1 : e1i - 1),
  });
}

function resetChecksIsHit() {
  for (let ci = 0; ci < checks.length; ci++) {
    checks[ci].isHit = getLaserPathIndexOf(checks[ci].sf) !== -1;
  }
}

// return -1 if not found
function getLaserPathIndexOf(sf) {
  for (let i = 0; i < laserPaths.length; i++) {
    if (laserPaths[i].smallFace === sf) return i;
  }
  return -1;
}

function makeNewLaserPath() {
  // always has at least 1 path
  const currentPath = laserPaths[laserPaths.length - 1];
  const nextSF = currentPath.smallFace.adjacents[currentPath.e2i];

  // out of steps AND not reaching source/check?
  if (
    currentPath.stepsLeft <= 0 &&
    nextSF !== laserSourceSF &&
    !checksIncludes(nextSF)
  ) {
    return;
  }

  // currently e2i === e1i + 1?
  const wasGoingClockwise =
    (currentPath.e1i === 0 && currentPath.e2i === 1) ||
    (currentPath.e1i === 1 && currentPath.e2i === 2) ||
    (currentPath.e1i === 2 && currentPath.e2i === 0);

  // hitting a reflector or wall?
  if (reflectors.includes(nextSF) || walls.includes(nextSF)) {
    // does nothing if only one laser path
    if (laserPaths.length === 1) return;

    const e1i = currentPath.e2i;
    laserPaths.push({
      stepsLeft: currentPath.stepsLeft - 1,
      smallFace: currentPath.smallFace,
      e1i: e1i,
      e2i: wasGoingClockwise ? nti(e1i + 1) : nti(e1i - 1),
    });
  }
  // go straight?
  else {
    const e1i = nextSF.adjacents.indexOf(currentPath.smallFace);
    laserPaths.push({
      stepsLeft: currentPath.stepsLeft - 1,
      smallFace: nextSF,
      e1i: e1i,
      e2i: wasGoingClockwise ? nti(e1i - 1) : nti(e1i + 1),
    });
  }
}

function nti(newIndex) {
  // only fixes one cycle
  if (newIndex >= 3) return newIndex - 3;
  if (newIndex <= -1) return newIndex + 3;
  return newIndex;
}
