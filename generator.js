const generator = {
  DIFFICULTY_OPTIONS: [
    // very easy
    {
      REFLECTORS_AMOUNT: 5,
      WALL_GROUPS_AMOUNT: 0,
    },
    // easy
    {
      REFLECTORS_AMOUNT: 8,
      WALL_GROUPS_AMOUNT: 2,
    },
    // hard
    {
      REFLECTORS_AMOUNT: 8,
      WALL_GROUPS_AMOUNT: 3,
    },
    // very hard
    {
      REFLECTORS_AMOUNT: 8,
      WALL_GROUPS_AMOUNT: 4,
    },
  ],
  diffOps: null,

  resetGame() {
    clickEffect.sf = null;
    isLooped = false;
    laserAP = 0;
    laserSourceSF = null;
    laserParticles = [];
    laserPaths = [];
    reflectors = [];
    walls = [];
    checks = [];
  },

  // difficultyLevel is index of DIFFICULTY_OPTIONS
  generate: function (difficultyLevel) {
    this.diffOps = this.DIFFICULTY_OPTIONS[difficultyLevel];
    this.resetGame();

    this.generateWalls();

    this.spawnLaserSource();

    this.generateLaserLoop();

    initiateStarterLaserPath();
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

  generateLaserLoop: function () {
    ////
  },
};
