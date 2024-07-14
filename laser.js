let laserPaths = [];
let laserSourceSF;
let starterLaserPath; // not real path

function laserSourceClicked(){
  //// rotate to next e2i, or next adjacent smallFace
}



// LaserPath {stepsLeft, smallFace, e1i, e2i}
// e1i: edge 1 index
function makeNewLaserPath(){
  const currentPath = laserPaths.length > 0 ? laserPaths[laserPaths.length - 1] : starterLaserPath;
  if (currentPath.stepsLeft <= 0){return;}
  
  const nextSF = currentPath.smallFace
    .adjacents[currentPath.e2i];
  
  const e1i = nextSF.adjacents.indexOf(currentPath.smallFace);
  
  const wasGoingClockwise = 
        (currentPath.e1i === 0 && currentPath.e2i === 1) ||
        (currentPath.e1i === 1 && currentPath.e2i === 2) ||
        (currentPath.e1i === 2 && currentPath.e2i === 0);
  
  const e2i = wasGoingClockwise ? nti(e1i - 1): nti(e1i + 1);
  
  laserPaths.push({
    stepsLeft: currentPath.stepsLeft - 1,
    smallFace: nextSF,
    e1i: e1i, 
    e2i: e2i
  });
}

function initiateStarterLaserPath(){
  const sf = getRandomItem(laserSourceSF.adjacents);
  const e2i = sf.adjacents.indexOf(laserSourceSF);
  starterLaserPath = {
    stepsLeft: 11,
    smallFace: sf,
    e1i: nti(Math.random() > 0.5 ? e2i + 1 : e2i - 1),
    e2i: e2i
  };
}

function nti(newIndex){
  // only fixes one cycle
  if (newIndex >= 3) return newIndex - 3;
  if (newIndex <= -1) return newIndex + 3;
  return newIndex;
}