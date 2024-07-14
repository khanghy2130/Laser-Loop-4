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
  for (let mfi = 0; mfi < mainFaces.length; mfi++) {
    const smallFaces = mainFaces[mfi].smallFaces;
    for (let sfi = 0; sfi < smallFaces.length; sfi++) {
      const sf = smallFaces[sfi];
      sf.isVisible = isFacingCanvas(sf.vertices);
    }
  }
}
