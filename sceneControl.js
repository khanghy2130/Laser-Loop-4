let scene = "TITLE";

let sphereInfo = {
  rVel: [0, 0],
  pos: [-1000, 1000],
  scale: 1,
  light: 0,
};

function updateSphere(rVel, pos, scale, lightUp) {
  sphereInfo.rVel[0] += (rVel[0] - sphereInfo.rVel[0] < 0 ? -1 : 1) * 0.01;
  sphereInfo.rVel[1] += (rVel[1] - sphereInfo.rVel[1] < 0 ? -1 : 1) * 0.01;
  applyRotation(rVel[0], rVel[1]);

  sphereInfo.pos[0] += (pos[0] - sphereInfo.pos[0]) * SPHERE_TRANSITION_SPEED;
  sphereInfo.pos[1] += (pos[1] - sphereInfo.pos[1]) * SPHERE_TRANSITION_SPEED;

  const scaleChange = (scale - sphereInfo.scale) * SPHERE_TRANSITION_SPEED;
  sphereInfo.scale += scaleChange > 0.1 ? 0.1 : scaleChange;

  if (lightUp) {
    sphereInfo.light = min(sphereInfo.light + 0.012, 1);
  }
}

function renderSphere() {
  push();
  translate(sphereInfo.pos[0], sphereInfo.pos[1]);
  scale(sphereInfo.scale);

  stroke(...COLORS.GRID);
  strokeWeight(3.5);
  for (const ue of uniqueEdges) {
    if (ue.smallFaces[0].isVisible || ue.smallFaces[1].isVisible) {
      line(ue.v0[0], ue.v0[1], ue.v1[0], ue.v1[1]);
    }
  }
  if (sphereInfo.light > 0) {
    noStroke();
    fill(...COLORS.GRID, 255 * sphereInfo.light);
    for (let i = 0; i < allSmallFaces.length; i++) {
      const sf = allSmallFaces[i];
      if (!sf.isVisible) continue;
      const vs = sf.vertices;
      triangle(vs[0][0], vs[0][1], vs[1][0], vs[1][1], vs[2][0], vs[2][1]);
    }
  }
  pop();
}

const playBtn = new GameButton(500, 480, 140, 50, 36, "Play", function () {
  scene = "SELECT";
});

function titleScene() {
  updateSphere([0.2, 0.2], [90, 650], 1.2);
  playBtn.render();
  noStroke();
  textSize(120);
  fill(...COLORS.GRID);
  text("LASER", 300, 100);
  text("LOOP", 300, 220);
  fill(...COLORS.LASER);
  textSize(220);
  text("4", 500, 260);
}
function titleSceneTouchEnded() {
  if (playBtn.isHovered) playBtn.clicked();
}

const easyBtn = new GameButton(120, 150, 200, 60, 38, "Easy", function () {
  generator.generate(0);
  generateCountdown = 100;
});
const mediumBtn = new GameButton(120, 250, 200, 60, 38, "Medium", function () {
  generator.generate(1);
  generateCountdown = 100;
});
const hardBtn = new GameButton(120, 350, 200, 60, 38, "Hard", function () {
  generator.generate(2);
  generateCountdown = 100;
});

function selectScene() {
  updateSphere([0, -0.1], [300, 900], 1.5);
  easyBtn.render();
  mediumBtn.render();
  hardBtn.render();

  // meta info
  fill(255);
  textSize(28);
  text("Completed", 330, 80);
  text("Best time", 500, 80);
}
function selectSceneTouchEnded() {
  if (easyBtn.isHovered) easyBtn.clicked();
  else if (mediumBtn.isHovered) mediumBtn.clicked();
  else if (hardBtn.isHovered) hardBtn.clicked();
}

let generateCountdown = 0;
function generatingScene() {
  generateCountdown--;
  if (generateCountdown > 0 || !generator.isDoneGenerating) {
    updateSphere([8, 0], [300, 300], 0.5);
    if (!generator.isDoneGenerating) {
      // multi stepping
      if (generator.isGeneratingLaser) {
        for (let i = 0; i < 70; i++) {
          if (!generator.isGeneratingLaser) break;
          generator.stepGenerateLaser();
        }
      }
    }
  } else {
    updateSphere([(1 - sphereInfo.scale) * 15, 0], [300, 300], 1, true);
    // done fake timer & sphere normal size?
    if (1 - sphereInfo.scale < 0.001) {
      scene = "PLAY";
    }
  }
}
