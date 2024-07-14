
function applyRotation(angleY, angleX){
  let sinY = sin(angleY);
  let cosY = cos(angleY);
  
  let sinX = sin(angleX);
  let cosX = cos(angleX);
  
  // apply rotation to all unique vertices
  for (let i=0; i < uniqueVertices.length; i++){
    let uv = uniqueVertices[i];
    const c = uv.slice(0); // copy
    let z = c[2] * cosY - c[0] * sinY;

    uv[0] = c[0] * cosY + c[2] * sinY;   
    uv[1] = c[1] * cosX - z * sinX;
    uv[2] = z * cosX + c[1] * sinX;
  }
  
  // set .isVisible
  for (let mfi=0; mfi < mainFaces.length; mfi++){
    const smallFaces = mainFaces[mfi].smallFaces;
    for (let sfi=0; sfi < smallFaces.length; sfi++){
      const sf = smallFaces[sfi];
      sf.isVisible = isFacingCanvas(sf.vertices);
    }
  }
}





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

  // Draw faces
  stroke("orange");
  strokeWeight(2);
  for (let i=0; i < mainFaces.length; i++){
    const smallFaces = mainFaces[i].smallFaces;
    for (const sf of smallFaces){
      if (!sf.isVisible){continue;}
      
      const isHovered = !hoveredSF && pointInTriangle(
        [mouseX - width/2, 
         mouseY - height/2], 
        sf.vertices[0], 
        sf.vertices[1], 
        sf.vertices[2]
      );
      if (isHovered){
        fill("grey");
        hoveredSF = sf;
      } else {
        fill(0,0,0,30);
      }
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
  
  
  // render adjacents of hovered SF
  if (hoveredSF){
    noStroke();
    textSize(30);
    for (let ai=0; ai < hoveredSF.adjacents.length; ai++){
      // adjacent small face
      const asf = hoveredSF.adjacents[ai];
      if (!asf.isVisible){continue;}
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
    
    // render edges order
    fill("yellow");
    for (let vi=0; vi < hoveredSF.vertices.length; vi++){
      const v0 = hoveredSF.vertices[vi];
      const v1 = hoveredSF.vertices[(vi + 1) === 3 ? 0 : vi + 1 ];
      text(vi, 
        (v0[0] + v1[0]) / 2,
        (v0[1] + v1[1]) / 2
      );
    }
  }
  
  // update laser
  makeNewLaserPath(); //// not during animated movement
  
  // render laser
  strokeWeight(8);
  stroke("lime");
  for (let i=0; i < laserPaths.length; i++){
    const lp = laserPaths[i];
    if (!lp.smallFace.isVisible){continue;}
    
    const midV1 = [
      (lp.smallFace.vertices[lp.e1i][0] + 
      lp.smallFace.vertices[nti(lp.e1i + 1)][0]) /2,
      (lp.smallFace.vertices[lp.e1i][1] + 
      lp.smallFace.vertices[nti(lp.e1i + 1)][1]) /2
    ];
    const midV2 = [
      (lp.smallFace.vertices[lp.e2i][0] + 
      lp.smallFace.vertices[nti(lp.e2i + 1)][0]) /2,
      (lp.smallFace.vertices[lp.e2i][1] + 
      lp.smallFace.vertices[nti(lp.e2i + 1)][1]) /2
    ];
    line(midV1[0], midV1[1], midV2[0], midV2[1]);
  }
    
}


