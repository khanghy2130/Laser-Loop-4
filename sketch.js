function mouseDragged() {
  applyRotation(
    (mouseX - pmouseX) * DRAG_SPEED, // angleY
    (mouseY - pmouseY) * -DRAG_SPEED // angleX
  );
}

function setup() {
  createCanvas(600, 600);
  angleMode(DEGREES);
  textAlign(CENTER, CENTER);
  strokeJoin(ROUND);

  buildMainFaces();
  applyRotation(0, 0);

  //// set below after generated a puzzle
  laserSourceSF = mainFaces[0].smallFaces[0];
  initiateStarterLaserPath();
}

let hoveredSF = null;
function draw() {
  hoveredSF = null;
  background(30);
  translate(width / 2, height / 2);

  ///// Draw reflectors
  ///// Draw walls

  // check hover
  for (let i = 0; i < mainFaces.length; i++) {
    const smallFaces = mainFaces[i].smallFaces;
    for (const sf of smallFaces) {
      if (!sf.isVisible) {
        continue;
      }

      const isHovered =
        !hoveredSF &&
        pointInTriangle(
          [mouseX - width / 2, mouseY - height / 2],
          sf.vertices[0],
          sf.vertices[1],
          sf.vertices[2]
        );
      if (isHovered) {
        fill("grey");
        noStroke();
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

  // render adjacents of hovered SF ///// testing
  if (hoveredSF) {
    noStroke();
    textSize(30);
    for (let ai = 0; ai < hoveredSF.adjacents.length; ai++) {
      // adjacent small face
      const asf = hoveredSF.adjacents[ai];
      if (!asf.isVisible) {
        continue;
      }
      fill(255, 0, 100, 50);
      triangle(
        asf.vertices[0][0],
        asf.vertices[0][1],
        asf.vertices[1][0],
        asf.vertices[1][1],
        asf.vertices[2][0],
        asf.vertices[2][1]
      );
      fill("white");
      const tCenter = getTriangleCenter(asf.vertices);
      text(ai, tCenter[0], tCenter[1]);
    }
  }

  // Render edges
  stroke("orange");
  strokeWeight(2);
  for (const ue of uniqueEdges) {
    if (ue.smallFaces[0].isVisible || ue.smallFaces[1].isVisible) {
      line(ue.v0[0], ue.v0[1], ue.v1[0], ue.v1[1]);
    }
  }

  // update laser
  makeNewLaserPath(); //// not during animated movement

  // render laser
  strokeWeight(8);
  stroke("lime");
  for (let i = 0; i < laserPaths.length; i++) {
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
}
