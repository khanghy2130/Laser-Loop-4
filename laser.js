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
  isLooped = true;
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
      return;
    }

    let reachingCheck = false;
    for (let ci = 0; ci < checks.length; ci++) {
      // reached a check that is not hit yet?
      if (checks[ci].sf === nextSF && !checks[ci].isHit) {
        checks[ci].isHit = true;
        reachingCheck = true;
        break;
      }
    }

    const e1i = nextSF.adjacents.indexOf(currentPath.sf);
    laserPaths.push({
      stepsLeft: reachingCheck ? MAX_STEPS : currentPath.stepsLeft - 1,
      sf: nextSF,
      e1i: e1i,
      e2i: goingClockwise ? nti(e1i - 1) : nti(e1i + 1),
    });
  }
  laserAP = 0;
}

function nti(newIndex) {
  // only fixes one cycle
  if (newIndex >= 3) return newIndex - 3;
  if (newIndex <= -1) return newIndex + 3;
  return newIndex;
}
