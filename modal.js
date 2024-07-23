let modalType = null; // null | "HELP" | "SKIP"
let modalPageIndex = 0;
let bgImage;
let modalAP = 0;

const continueBtn = new GameButton(
  420,
  400,
  120,
  50,
  28,
  "Continue",
  function () {
    // 4 help pages
    if (modalType === "HELP" && modalPageIndex < 3) {
      nextModalPage();
    } else {
      modalType = null;
      this.isHovered = false;
    }
  }
);

const yesBtn = new GameButton(200, 360, 100, 50, 32, "Yes", function () {
  this.isHovered = false;
  hasCompleted = true;
  skipBtn.t = "Exit";
  hasSkipped = true;
  winAP = 100; // skip animation
  nextModalPage();
});

const noBtn = new GameButton(400, 360, 100, 50, 32, "No", function () {
  this.isHovered = false;
  modalType = null;
});

function nextModalPage() {
  modalPageIndex++;
  modalAP = 1;
}

function renderModal() {
  image(bgImage, 0, 0, width, height);
  let rectInfo = [300, 300, 400, 300];
  noStroke();
  textSize(32);
  fill(0, 0, 0, 220); // rect color
  if (modalType === "HELP") {
    rect(...rectInfo);
    fill(255);
    if (modalPageIndex === 0) {
      text(
        "Drag to move.\nClick the big green\ntriangle to turn the laser.",
        300,
        250
      );
    } else if (modalPageIndex === 1) {
      text(
        "Click an empty tile to place\na wall, click again to remove.\nYou only have a few\nof these to place.",
        300,
        250
      );
    } else if (modalPageIndex === 2) {
      text(
        "The laser only has enough\nenergy to go 5 steps.\nHit the yellow thing\nto restore energy.",
        300,
        250
      );
    } else if (modalPageIndex === 3) {
      text(
        "Hit all yellow things and return\nto the big green triangle\nto complete the loop.\nFeel free to skip if stuck.",
        300,
        250
      );
    }
    continueBtn.render();
  } else if (modalType === "SKIP") {
    if (modalPageIndex === 0) {
      rectInfo = [300, 300, 400, 220];
      rect(300, 300, 400, 220);
      fill(255);
      text("Skip this puzzle and\nreveal solution?", 300, 250);
      yesBtn.render();
      noBtn.render();
    } else if (modalPageIndex === 1) {
      rect(...rectInfo);
      fill(255);
      text(
        "To see the solution, place\nwalls on the numbers and\nmake the laser hit\neach one in that order.",
        300,
        250
      );
      continueBtn.render();
    }
  }
  // draw cover
  modalAP = max(modalAP - 0.05, 0);
  fill(255, 255, 255, modalAP * 140);
  rect(...rectInfo);
}

function openModal(mType) {
  bgImage = get(0, 0, width, height);
  modalType = mType;
  modalAP = 1;
  modalPageIndex = 0;
  yesBtn.ap = 0;
  noBtn.ap = 0;
  continueBtn.ap = 0;
}
