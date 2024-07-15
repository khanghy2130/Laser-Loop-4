// LaserPath {stepsLeft, smallFace, e1i, e2i}
// e1i: edge 1 index
function makeNewLaserPath() {
  // always has at least 1 path
  const currentPath = laserPaths[laserPaths.length - 1];
  // out of steps?
  if (currentPath.stepsLeft <= 0) {
    return;
  }

  const nextSF = currentPath.smallFace.adjacents[currentPath.e2i];

  const wasGoingClockwise =
    (currentPath.e1i === 0 && currentPath.e2i === 1) ||
    (currentPath.e1i === 1 && currentPath.e2i === 2) ||
    (currentPath.e1i === 2 && currentPath.e2i === 0);
  const e1i = nextSF.adjacents.indexOf(currentPath.smallFace);
  const e2i = wasGoingClockwise ? nti(e1i - 1) : nti(e1i + 1);

  laserPaths.push({
    stepsLeft: currentPath.stepsLeft - 1,
    smallFace: nextSF,
    e1i: e1i,
    e2i: e2i,
  });
}

function initiateStarterLaserPath() {
  const e1i = randomInt(0, 3);
  laserPaths.push({
    stepsLeft: 10,
    smallFace: laserSourceSF,
    e1i: e1i,
    e2i: nti(Math.random() > 0.5 ? e1i + 1 : e1i - 1),
  });
}

function nti(newIndex) {
  // only fixes one cycle
  if (newIndex >= 3) return newIndex - 3;
  if (newIndex <= -1) return newIndex + 3;
  return newIndex;
}
