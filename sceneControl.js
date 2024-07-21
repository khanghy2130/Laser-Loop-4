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

  sphereInfo.scale += (scale - sphereInfo.scale) * SPHERE_TRANSITION_SPEED;

  if (lightUp) {
    sphereInfo.light = min(sphereInfo.light + 0.02, 1);
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

const playBtn = new GameButton(500, 480, 140, 60, 36, "Play", function () {
  scene = "SELECT";
});

function titleScene() {
  updateSphere([0.1, 0.1], [0, 600], 1.5);
  playBtn.render();
}
function titleSceneTouchEnded() {
  if (playBtn.isHovered) playBtn.clicked();
}

const easyBtn = new GameButton(120, 150, 200, 70, 48, "Easy", function () {
  generator.generate(0);
  generateCountdown = 100;
});
const mediumBtn = new GameButton(120, 250, 200, 70, 48, "Medium", function () {
  generator.generate(1);
  generateCountdown = 100;
});
const hardBtn = new GameButton(120, 350, 200, 70, 48, "Hard", function () {
  generator.generate(2);
  generateCountdown = 100;
});

function selectScene() {
  updateSphere([0, -0.08], [300, 1000], 2);
  easyBtn.render();
  mediumBtn.render();
  hardBtn.render();

  // meta info
  fill(255);
  textSize(38);
  text("Solves", 330, 80);
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
    updateSphere([(1 - sphereInfo.scale) * 20, 0], [300, 300], 1, true);
    // done fake timer & sphere normal size?
    if (1 - sphereInfo.scale < 0.001) {
      scene = "PLAY";
    }
  }
}
