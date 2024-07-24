const generator = {
  DIFFICULTY_OPTIONS: [
    // easy
    {
      REFLECTORS_AMOUNT: 4,
      WALL_GROUPS_AMOUNT: 3,
      LASER_LENGTH: [20, 30],
    },
    // medium
    {
      REFLECTORS_AMOUNT: 5,
      WALL_GROUPS_AMOUNT: 4,
      LASER_LENGTH: [35, 45],
    },
    // hard
    {
      REFLECTORS_AMOUNT: 6,
      WALL_GROUPS_AMOUNT: 5,
      LASER_LENGTH: [50, 60],
    },
  ],
  diffOps: null,

  resetGame() {
    this.isDoneGenerating = false;
    clickEffect.sf = null;
    isLooped = false;
    laserPaths.length = 0;
    walls.length = 0;
    checks.length = 0;
  },

  generate: function () {
    scene = "GENERATING";
    this.diffOps = this.DIFFICULTY_OPTIONS[difficultyLevel];
    this.resetGame();
    this.generateWalls();
    this.spawnLaserSource();
    this.startGenerateLaser();
  },

  generateWalls: function () {
    const availableSFs = allSmallFaces.slice(0);
    wallGroupsLoop: for (
      let wi = 0;
      wi < this.diffOps.WALL_GROUPS_AMOUNT;
      wi++
    ) {
      // pick random starting sf as first wall
      const newWalls = [popRandomItem(availableSFs)];

      // each group is 4 walls
      while (newWalls.length < 4) {
        // make a list of sfs adjacent to all added walls
        const potentialNextWalls = [];
        newWallsLoop: for (let nwi = 0; nwi < newWalls.length; nwi++) {
          newWallsAdjacentsLoop: for (
            let nwai = 0;
            nwai < newWalls[nwi].adjacents.length;
            nwai++
          ) {
            const nwaSF = newWalls[nwi].adjacents[nwai];
            // skip if already in potentialNextWalls or newWalls
            if (potentialNextWalls.includes(nwaSF) || newWalls.includes(nwaSF))
              continue;
            if (availableSFs.indexOf(nwaSF) !== -1) {
              potentialNextWalls.push(nwaSF);
            }
          }
        }

        // if can't get enough walls then skip
        if (potentialNextWalls.length === 0) continue wallGroupsLoop;

        // pick one as a new wall
        newWalls.push(popRandomItem(potentialNextWalls));
      }

      walls.push(...newWalls);
      // remove new walls and close by sfs from availableSFs
      const sfsToRemove = this.getCloseBySFs(newWalls);
      for (let ri = 0; ri < sfsToRemove.length; ri++) {
        const removeIndex = availableSFs.indexOf(sfsToRemove[ri]);
        if (removeIndex !== -1) {
          availableSFs.splice(removeIndex, 1);
        }
      }
    }
  },

  // returns a list of given SFs plus other SFs close to them
  getCloseBySFs: function (givenSFs) {
    const returnSFs = givenSFs.slice(0);
    for (let gsfi = 0; gsfi < givenSFs.length; gsfi++) {
      // 1st adjacents
      for (let ai1 = 0; ai1 < givenSFs[gsfi].adjacents.length; ai1++) {
        const a1 = givenSFs[gsfi].adjacents[ai1];
        if (!returnSFs.includes(a1)) returnSFs.push(a1); // add 1st adjacent
        // 2nd adjacents
        for (let ai2 = 0; ai2 < a1.adjacents.length; ai2++) {
          const a2 = a1.adjacents[ai2];
          if (!returnSFs.includes(a2)) returnSFs.push(a2); // add 2nd adjacent
          // 3rd adjacents
          for (let ai3 = 0; ai3 < a2.adjacents.length; ai3++) {
            const a3 = a2.adjacents[ai3];
            if (!returnSFs.includes(a3)) returnSFs.push(a3); // add 3rd adjacent
          }
        }
      }
    }
    return returnSFs;
  },

  spawnLaserSource: function () {
    laserSourceSF = null;
    spawnSourceLoop: while (laserSourceSF === null) {
      const randomSF = getRandomItem(allSmallFaces);
      // check if is a wall
      if (walls.includes(randomSF)) continue;
      // check if is next to a wall
      for (let ai = 0; ai < randomSF.adjacents.length; ai++) {
        const asf = randomSF.adjacents[ai];
        if (walls.includes(asf)) continue spawnSourceLoop;
        for (let ai2 = 0; ai2 < asf.adjacents.length; ai2++) {
          if (walls.includes(asf.adjacents[ai2])) continue spawnSourceLoop;
        }
      }
      laserSourceSF = randomSF;
    }
  },

  /*
    generatedHistory: {
      pathsAhead
      reachedReflector (also wall)
      reachedSource
      laserSegmentLength (set after placing, used to cut visitedSFs when undo)
      nextOnePopped
      doesPlacing
    }[]
    pathsAhead: {
      sf
      e1i
      e2i
      canPlaceHere (false if sf is already visited, become false on undo)
    }[]
  */
  generatedHistory: [],
  visitedSFs: [], // sfs with laser, can't place reflector on these

  isGeneratingLaser: false,
  laserInfo: { e1i: 0, e2i: 0 },
  startGenerateLaser: function () {
    reflectors.length = 0;
    this.isGeneratingLaser = true;
    this.generatedHistory.length = 0;
    this.visitedSFs.length = 0;

    const e1i = randomInt(3);
    const goingClockwise = Math.random() > 0.5;
    const e2i = nti(goingClockwise ? e1i + 1 : e1i - 1);
    this.addNewHistory({
      sf: laserSourceSF,
      e1i: e1i,
      e2i: e2i,
      canPlaceHere: false,
      goingClockwise: goingClockwise,
    });
    this.laserInfo = { e1i: e1i, e2i: e2i };
  },

  // results in placing a reflector
  stepGenerateLaser() {
    const gHistory = this.generatedHistory[this.generatedHistory.length - 1];
    const pathsAhead = gHistory.pathsAhead;
    const placeablePathIndices = [];

    // if still allow to place more reflectors
    if (reflectors.length < this.diffOps.REFLECTORS_AMOUNT) {
      // skip first 2 as they for sure can't be placed
      for (let i = 2; i < pathsAhead.length; i++) {
        if (pathsAhead[i].canPlaceHere) {
          // add multiple copies by how far
          for (let j = 0; j < i; j++) {
            placeablePathIndices.push(i);
          }
        }
      }
    }
    // can't place more? if skipping is not possible OR already too long
    else if (
      !gHistory.reachedReflector ||
      this.diffOps.LASER_LENGTH[1] < this.visitedSFs.length
    ) {
      gHistory.nextOnePopped = true;
    }

    // if long enough & reachedSource & exact reflectors count then finish laser generation
    if (
      gHistory.reachedSource &&
      this.diffOps.LASER_LENGTH[0] <= this.visitedSFs.length &&
      this.diffOps.LASER_LENGTH[1] >= this.visitedSFs.length &&
      reflectors.length === this.diffOps.REFLECTORS_AMOUNT
    ) {
      // regenerate if not within unique perentage
      const uniqueSFs = [];
      for (let i = 0; i < this.visitedSFs.length; i++) {
        const sf = this.visitedSFs[i];
        if (!uniqueSFs.includes(sf)) uniqueSFs.push(sf);
      }
      const uniquePercentage = uniqueSFs.length / this.visitedSFs.length;
      if (
        uniquePercentage < UNIQUE_PERCENTAGES[0] ||
        uniquePercentage > UNIQUE_PERCENTAGES[1]
      ) {
        this.startGenerateLaser();
        return;
      }

      // FINALIZE LASER GENERATION
      // add the remaining to visited sfs (NOTE: the laser length could be longer than max)
      for (let i = 0; i < pathsAhead.length; i++) {
        this.visitedSFs.push(pathsAhead[i].sf);
      }
      this.isGeneratingLaser = false;
      this.generateChecks();
      return;
    }

    // if no spot to place & cannot skip placing
    if (
      placeablePathIndices.length === 0 &&
      !(gHistory.reachedReflector && !gHistory.nextOnePopped)
    ) {
      // if no previous history then restart laser generation
      if (this.generatedHistory.length - 2 < 0) {
        this.startGenerateLaser();
        return;
      }

      const prevHistory =
        this.generatedHistory[this.generatedHistory.length - 2];

      this.generatedHistory.pop(); // undo history

      // set previous history to know that this one popped
      prevHistory.nextOnePopped = true;

      if (prevHistory.doesPlacing) reflectors.pop(); // remove last reflector

      // cut the previously visited sfs
      const laserSegmentLength = prevHistory.laserSegmentLength;
      this.visitedSFs.length = this.visitedSFs.length - laserSegmentLength;
      return;
    }

    // from now it's safe to pick a slot
    let doesPlacing = true;
    let visitedAmount = pathsAhead.length; // by default add all
    let reflectedPath = pathsAhead[pathsAhead.length - 1]; // by default last one

    // if reachedReflector (& next one not popped) then chance* to skip placing
    if (gHistory.reachedReflector && !gHistory.nextOnePopped) {
      doesPlacing =
        Math.random() < SKIP_CHANCE_FACTOR * placeablePathIndices.length;
    }

    if (doesPlacing) {
      gHistory.doesPlacing = doesPlacing;
      const pickedIndex = getRandomItem(placeablePathIndices);
      const pickedPA = pathsAhead[pickedIndex];

      reflectors.push(pickedPA.sf); // add reflector
      pickedPA.canPlaceHere = false; // mark this to ignore later when undoing
      visitedAmount = pickedIndex;
      reflectedPath = pathsAhead[pickedIndex - 1];
    }

    // add to visitedSFs
    for (let i = 0; i < visitedAmount; i++) {
      this.visitedSFs.push(pathsAhead[i].sf);
    }
    gHistory.laserSegmentLength = visitedAmount; // set segment length

    // add new one to history for the new direction
    const e1i = reflectedPath.e2i;
    this.addNewHistory({
      sf: reflectedPath.sf,
      e1i: e1i,
      e2i: reflectedPath.goingClockwise ? nti(e1i + 1) : nti(e1i - 1),
      canPlaceHere: false,
      goingClockwise: reflectedPath.goingClockwise,
    });
  },

  addNewHistory: function (startingPath) {
    const pathsAhead = [startingPath];
    let reachedSource = false;
    let reachedReflector = false;
    // keep going until reaching reflector/wall/source
    for (let i = 0; i < NEXT_REFLECTOR_RANGE; i++) {
      const currentPath = pathsAhead[pathsAhead.length - 1];
      const nextSF = currentPath.sf.adjacents[currentPath.e2i];

      // reach source?
      if (nextSF === laserSourceSF) {
        reachedSource = true;
        break;
      }

      // reach reflector/wall?
      if (walls.includes(nextSF) || reflectors.includes(nextSF)) {
        reachedReflector = true;
        break;
      }

      const goingClockwise =
        (currentPath.e1i === 0 && currentPath.e2i === 1) ||
        (currentPath.e1i === 1 && currentPath.e2i === 2) ||
        (currentPath.e1i === 2 && currentPath.e2i === 0);

      // nextSF is ahead of current SF? add to pathsAhead
      const e1i = nextSF.adjacents.indexOf(currentPath.sf);
      pathsAhead.push({
        sf: nextSF,
        e1i: e1i,
        e2i: goingClockwise ? nti(e1i - 1) : nti(e1i + 1),
        // not too early & not visited = true
        canPlaceHere: i > 1 && !this.visitedSFs.includes(nextSF),
        goingClockwise: !goingClockwise,
      });
    }

    // add to generatedHistory
    this.generatedHistory.push({
      pathsAhead,
      reachedReflector,
      reachedSource,
      laserSegmentLength: null,
      nextOnePopped: false,
      doesPlacing: false,
    });
  },

  generateChecks: function () {
    let lastCheckIndex = 0;
    // filling in the checks until the end
    while (lastCheckIndex + MAX_STEPS < this.visitedSFs.length) {
      let nextCheckIndex = lastCheckIndex + MAX_STEPS;
      // if is first one then randomly be 0-2 shorter
      // goal: make the starting more varied
      if (lastCheckIndex === 0) {
        nextCheckIndex -= randomInt(3);
      }
      let countBacks = 0; // goal: prevents too short jump

      lookForEmptySF: while (true) {
        for (let ci = 0; ci < checks.length; ci++) {
          // if there is a check on this sf already or laser already got here
          const alreadyHasCheck =
            checks[ci].sf === this.visitedSFs[nextCheckIndex];
          const laserAlreadyVisited = this.visitedSFs
            .slice(0, nextCheckIndex)
            .includes(this.visitedSFs[nextCheckIndex]);
          if (alreadyHasCheck || laserAlreadyVisited) {
            nextCheckIndex--;
            countBacks++;
            // if counted back too much then restart all
            if (countBacks > 2) {
              this.generate(this.DIFFICULTY_OPTIONS.indexOf(this.diffOps));
              return;
            }
            continue lookForEmptySF;
          }
        }
        break; // no check here
      }

      lastCheckIndex = nextCheckIndex;
      checks.push({
        sf: this.visitedSFs[nextCheckIndex],
        isHit: false,
        ap: 0,
      });
    }
    this.finalizeGeneration();
  },

  finalizeGeneration: function () {
    // check for solvability
    laserPaths.length = [0];
    laserPaths.push({
      stepsLeft: MAX_STEPS,
      sf: laserSourceSF,
      e1i: this.laserInfo.e1i,
      e2i: this.laserInfo.e2i,
    });

    let isSolvable = false;
    for (let i = 0; i < 100; i++) {
      makeNewLaserPath();
      if (isLooped) {
        // check if all checks are hit
        let allChecksHit = true;
        for (let ci = 0; ci < checks.length; ci++) {
          if (!checks[ci].isHit) {
            allChecksHit = false;
            break;
          }
        }
        isSolvable = allChecksHit;
        break;
      }
    }
    if (!isSolvable) {
      this.generate(this.DIFFICULTY_OPTIONS.indexOf(this.diffOps));
      return;
    }

    // is solvable: set up gameplay
    initiateStarterLaserPath();
    resetChecksIsHit();
    laserAP = 0;
    laserParticles.length = 0;
    hasCompleted = false;
    skipBtn.t = "Skip";
    hasSkipped = false;
    winAP = 0;
    yUI = 1000;
    isBestTime = false;
    solutionReflectors = reflectors.slice(0);
    maxReflectorsAllowed = reflectors.length;
    reflectors.length = 0;
    this.isDoneGenerating = true;
  },
};
