function applyRotation(angleY, angleX) {
  let sinY = sin(angleY);
  let cosY = cos(angleY);

  let sinX = sin(angleX);
  let cosX = cos(angleX);

  // apply rotation to all unique vertices
  for (let i = 0; i < uniqueVertices.length; i++) {
    let uv = uniqueVertices[i];
    const c = uv.slice(0); // copy
    let z = c[2] * cosY - c[0] * sinY;

    uv[0] = c[0] * cosY + c[2] * sinY;
    uv[1] = c[1] * cosX - z * sinX;
    uv[2] = z * cosX + c[1] * sinX;
  }

  // set .isVisible
  for (let sfi = 0; sfi < allSmallFaces.length; sfi++) {
    allSmallFaces[sfi].isVisible = isFacingCanvas(allSmallFaces[sfi].vertices);
  }
}

function checksIncludes(sf) {
  return checks.some((check) => check.sf === sf);
}

function triangleClicked(sf) {
  if (walls.includes(sf)) return; // clicked wall?
  if (checksIncludes(sf)) return; // clicked check?

  // set up click effect
  clickEffect.sf = sf;
  clickEffect.ap = 0;

  // clicked source?
  if (laserSourceSF === sf) {
    const firstPath = laserPaths[0];
    // going clockwise? go counterclockwise (same adjacent, different dir)
    if (nti(firstPath.e1i + 1) === firstPath.e2i) {
      firstPath.e2i = nti(firstPath.e2i + 1);
    }
    // go to next adjacent
    else {
      firstPath.e1i = nti(firstPath.e1i + 1);
      firstPath.e2i = nti(firstPath.e1i + 1);
    }
    laserPaths.length = 1; // reset laser
    resetChecksIsHit();
    return;
  }

  reflectorsCountAP = 1;
  // clicked reflector? remove reflector
  const reflectorIndex = reflectors.indexOf(sf);
  if (reflectorIndex !== -1) {
    reflectors.splice(reflectorIndex, 1); // remove reflector
    // for each adjacent sf of this sf
    for (let i = 0; i < sf.adjacents.length; i++) {
      const asf = sf.adjacents[i];
      // check all laser paths on this asf
      for (let li = 0; li < laserPaths.length; li++) {
        // skip if not on this asf
        if (laserPaths[li].sf !== asf) continue;
        // was this laser going towards the removed reflector?
        if (laserPaths[li].e2i === asf.adjacents.indexOf(sf)) {
          laserPaths.length = li + 1;
          resetChecksIsHit();
        }
      }
    }

    return;
  }

  // clicked empty? place reflector if still have more
  if (maxReflectorsAllowed > reflectors.length) {
    reflectors.push(sf);
    let laserPathIndex = getLaserPathIndexOf(sf);
    if (laserPathIndex !== -1) {
      laserPaths.length = laserPathIndex; // cut laser paths
      resetChecksIsHit();
    }
  }
}

function updateTargetSF() {
  // target changed?
  if (targetingEffect.sf !== hoveredSF) targetingEffect.sf = hoveredSF;

  let targetVertices = [];
  // follow cursor:
  // if mouse is down
  // OR if no targeted SF
  // OR if hovered on a wall
  // OR if hovered on a check
  if (
    mouseIsPressed ||
    targetingEffect.sf === null ||
    walls.includes(targetingEffect.sf) ||
    checksIncludes(targetingEffect.sf)
  ) {
    const pos = [_mouseX - width / 2, _mouseY - height / 2];
    targetVertices = [pos, pos, pos];
  }
  // follow targeted SF vertices
  else {
    cursor(HAND);
    const sfv = targetingEffect.sf.vertices;
    for (let i = 0; i < sfv.length; i++) {
      const newPos = [sfv[i][0], sfv[i][1]];
      targetVertices[i] = newPos;

      // Repel from mouse position
      let dx = _mouseX - width / 2 - newPos[0];
      let dy = _mouseY - height / 2 - newPos[1];
      let distance = Math.sqrt(dx * dx + dy * dy);
      newPos[0] += (dx / distance) * REPEL;
      newPos[1] += (dy / distance) * REPEL;
    }
  }
  // update renderVertices
  for (let i = 0; i < targetingEffect.renderVertices.length; i++) {
    const rv = targetingEffect.renderVertices[i];
    const tv = targetVertices[i];
    rv[0] += (tv[0] - rv[0]) * ELASTICITY * (0.6 + 0.15 * (i + 1));
    rv[1] += (tv[1] - rv[1]) * ELASTICITY * (0.6 + 0.15 * (i + 1));
  }
}

function checkWin() {
  if (!hasCompleted && generator.isDoneGenerating) {
    hasCompleted = true;
    for (let i = 0; i < checks.length; i++) {
      if (!checks[i].isHit) {
        hasCompleted = false;
        break;
      }
    }
  }
}
