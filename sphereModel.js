/*
  MainFace {
    subVertices: {
      p01a, p01b, p12a, p12b, 
      p20a, p20b, pCenter
    },
    smallFaces: SmallFace[9]
  }
  SmallFace {
    vertices: [x, y, z][3],
    adjacents: SmallFace[3],
    isVisible: boolean
  }
*/



const MF_ADJ = [
  // follows mainFaces index order (first item => first MF)
  // [adjMainFaceIndex, dir][3]
  // 3 adjacent main faces (left, right, bottom)
  [[1, 1], [4, 0], [6, 1]], // 0
  [[2, 1], [0, 0], [5, 1]], // 1
  [[3, 1], [1, 0], [9, 1]], // 2
  [[4, 1], [2, 0], [8, 1]], // 3
  [[0, 1], [3, 0], [7, 1]], // 4

  [[19, 0], [1, 2], [15, 2]], // 5
  [[15, 0], [0, 2], [16, 2]], // 6
  [[16, 0], [4, 2], [17, 2]], // 7
  [[17, 0], [3, 2], [18, 2]], // 8
  [[18, 0], [2, 2], [19, 2]], // 9

  [[11, 1], [14, 0], [15, 1]], // 10
  [[12, 1], [10, 0], [16, 1]], // 11
  [[13, 1], [11, 0], [17, 1]], // 12
  [[14, 1], [12, 0], [18, 1]], // 13
  [[10, 1], [13, 0], [19, 1]], // 14

  [[6, 0], [10, 2], [5, 2]], // 15
  [[7, 0], [11, 2], [6, 2]], // 16
  [[8, 0], [12, 2], [7, 2]], // 17
  [[9, 0], [13, 2], [8, 2]], // 18
  [[5, 0], [14, 2], [9, 2]] // 19
];

function buildMainFaces() {
  const icoFaces = buildIcosahedron();
  
  // set up MFs
  mainFaces = icoFaces.map(icoFace => buildAMainFace(icoFace));
  
  // share vertices between MFs and sphericalize
  shareEdgeVerticesAndSphericalize();
  
  // set up smallFaces for each MF
  mainFaces.forEach(mf => buildSmallFaces(mf));
  
  // add adjacents to each smallFace
  addAdjacents();
}

function buildIcosahedron(){
  const GR = (1 + Math.sqrt(5))/ 2;
  const s = SPHERE_SCALE/2;
  
  const vecs = [
    [-s, GR*s, 0],
	[s, GR*s, 0],
	[-s, -GR*s, 0],
	[s, -GR*s, 0],

	[0, -s, GR*s],
	[0, s, GR*s],
	[0, -s, -GR*s],
	[0, s, -GR*s],

	[GR*s, 0, -s],
	[GR*s, 0, s],
	[-GR*s, 0, -s],
	[-GR*s, 0, s]
  ];
  
  const faces = [
    // 5 faces around point 0
    [vecs[0], vecs[11], vecs[5]],
    [vecs[0], vecs[5], vecs[1]],
    [vecs[0], vecs[1], vecs[7]],
    [vecs[0], vecs[7], vecs[10]],
    [vecs[0], vecs[10], vecs[11]],

    // 5 adjacent faces
    [vecs[1], vecs[5], vecs[9]],
    [vecs[5], vecs[11], vecs[4]],
    [vecs[11], vecs[10], vecs[2]],
    [vecs[10], vecs[7], vecs[6]],
    [vecs[7], vecs[1], vecs[8]],

    // 5 faces around point 3
    [vecs[3], vecs[9], vecs[4]],
    [vecs[3], vecs[4], vecs[2]],
    [vecs[3], vecs[2], vecs[6]],
    [vecs[3], vecs[6], vecs[8]],
    [vecs[3], vecs[8], vecs[9]],

    // 5 adjacent faces
    [vecs[4], vecs[9], vecs[5]],
    [vecs[2], vecs[4], vecs[11]],
    [vecs[6], vecs[2], vecs[10]],
    [vecs[8], vecs[6], vecs[7]],
    [vecs[9], vecs[8], vecs[1]]
  ];
  
  return faces;
}

function buildAMainFace(icoFace) {
  const [v0, v1, v2] = icoFace;
  const subVertices = {
    v0: v0,
    v1: v1,
    v2: v2,
    p01a: pv(v0, v1, 1/3),
    p01b: pv(v0, v1, 2/3),
    p12a: pv(v1, v2, 1/3),
    p12b: pv(v1, v2, 2/3),
    p20a: pv(v2, v0, 1/3),
    p20b: pv(v2, v0, 2/3)
  };
  // center vertex
  subVertices.pCenter = pv(
    subVertices.p01a, 
    subVertices.p12b, 
    1/2
  );
  return {
    subVertices: subVertices,
    smallFaces: []
  };
}

function pv(v1, v2, t) {
  return [
    v1[0] + t * (v2[0] - v1[0]),
    v1[1] + t * (v2[1] - v1[1]),
    v1[2] + t * (v2[2] - v1[2])
  ];
}

function buildSmallFaces(mainFace){
  const {
    v0, v1, v2,
    p01a, p01b, p12a, p12b, 
    p20a, p20b, pCenter
  } = mainFace.subVertices;
  
  const smallTriangles = [
    [p20b, v0, p01a], // 0
    [p20a, p20b, pCenter], // 1
    [p20b, p01a, pCenter], // 2
    [pCenter, p01a, p01b], // 3
    [v2, p20a, p12b], // 4
    [p20a, pCenter, p12b], // 5
    [p12b, pCenter, p12a], // 6
    [pCenter, p01b, p12a], // 7
    [p12a, p01b, v1] // 8
  ];
  
  mainFace.smallFaces = smallTriangles
    .map(vertices => ({
      vertices: vertices,
      adjacents: [],
      isVisible: false
    }));
}


// set up .adjacents to small faces
function addAdjacents(){
  const EDGE_DIRS = [
    // clockwise
    [4, 1, 0],
    [0, 3, 8],
    [8, 6, 4]
  ];
  for (let mfi=0; mfi < mainFaces.length; mfi++){
    const sfs = mainFaces[mfi].smallFaces;
    
    sfs[0].adjacents = [
      getAdjacentSF(mfi, 0, 0),
      getAdjacentSF(mfi, 1, 2),
      sfs[2]
    ];
    sfs[1].adjacents = [
      getAdjacentSF(mfi, 0, 1),
      sfs[2],
      sfs[5]
    ];
    sfs[2].adjacents = [
      sfs[0],
      sfs[3],
      sfs[1]
    ];
    sfs[3].adjacents = [
      sfs[2],
      getAdjacentSF(mfi, 1, 1),
      sfs[7]
    ];
    sfs[4].adjacents = [
      getAdjacentSF(mfi, 0, 2),
      sfs[5],
      getAdjacentSF(mfi, 2, 0)
    ];
    sfs[5].adjacents = [
      sfs[1],
      sfs[6],
      sfs[4]
    ];
    sfs[6].adjacents = [
      sfs[5],
      sfs[7],
      getAdjacentSF(mfi, 2, 1)
    ];
    sfs[7].adjacents = [
      sfs[3],
      sfs[8],
      sfs[6]
    ];
    sfs[8].adjacents = [
      sfs[7],
      getAdjacentSF(mfi, 1, 0),
      getAdjacentSF(mfi, 2, 2)
    ];
  }
  
  function getAdjacentSF(mfi, amfi, asfi){
    const [target_mfi, dir] = MF_ADJ[mfi][amfi];
    return mainFaces[target_mfi]
      .smallFaces[EDGE_DIRS[dir][asfi]];
  }
}

function shareEdgeVerticesAndSphericalize(){
  const SV_ORDER = [
    ["p20a", "p20b"],
    ["p01a", "p01b"],
    ["p12a", "p12b"]
  ];
  
  for (let mfi=0; mfi < mainFaces.length; mfi++){
    const sv = mainFaces[mfi].subVertices;
    
    // first adjacent MF
    const [amfi0, dir0] = MF_ADJ[mfi][0];
    sv.p20b = mainFaces[amfi0]
      .subVertices[SV_ORDER[dir0][0]];
    sv.p20a = mainFaces[amfi0]
      .subVertices[SV_ORDER[dir0][1]];
    
    // second adjacent MF
    const [amfi1, dir1] = MF_ADJ[mfi][1];
    sv.p01b = mainFaces[amfi1]
      .subVertices[SV_ORDER[dir1][0]];
    sv.p01a = mainFaces[amfi1]
      .subVertices[SV_ORDER[dir1][1]];
    
    // first adjacent MF
    const [amfi2, dir2] = MF_ADJ[mfi][2];
    sv.p12b = mainFaces[amfi2]
      .subVertices[SV_ORDER[dir2][0]];
    sv.p12a = mainFaces[amfi2]
      .subVertices[SV_ORDER[dir2][1]];
    
    // sphericalize & add to unique
    for (const svName in sv){
      projectToSphere(sv[svName]);
      addToUniqueVertices(sv[svName]);
    }
  }
  
}

function projectToSphere(v) {
  let length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  v[0] = v[0] / length * SPHERE_SCALE;
  v[1] = v[1] / length * SPHERE_SCALE;
  v[2] = v[2] / length * SPHERE_SCALE;
}

function addToUniqueVertices(v){
  if (!uniqueVertices.includes(v)){
    uniqueVertices.push(v);
  }
}
