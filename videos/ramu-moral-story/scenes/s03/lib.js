import * as THREE from "./three.module.min.js";

// ============================================================
// Palette — earthy/pastel low-poly storybook style
// ============================================================
export const COLORS = {
  skinRamu: 0xc9895c,
  skinSita: 0xd9a06e,
  skinMohan: 0xe0ac78,
  skinElder: 0xe8c9a5,
  shirtRamu: 0x7a5238,
  shirtRamuAlt: 0x8f6a44,
  pantsRamu: 0x4a5d45,
  sariSita: 0xc76b5e,
  sariSitaAlt: 0xdb8b6f,
  shirtMohan: 0x5a93b8,
  shortsMohan: 0xd9c07a,
  robeElder: 0xf1ead9,
  hairBlack: 0x2c2420,
  beardWhite: 0xf4f1e6,
  eyeWhite: 0xfbf8f2,
  eyeDark: 0x2b2430,
  groundDry: 0xb99361,
  groundCrack: 0x8a6b45,
  groundLush: 0x7fae5f,
  groundLushDeep: 0x5f9448,
  soilFurrow: 0x8a6641,
  wood: 0x8a5f3c,
  woodDark: 0x5e3f28,
  metalChest: 0x4b4a52,
  metalChestDark: 0x35343a,
  paperOld: 0xe8dcbd,
  leafGreen: 0x6fae5c,
  water: 0x6fb3c9,
};

export function flat(color, extra) {
  return new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.6, metalness: 0.02, ...extra });
}

// ============================================================
// Renderer / lighting
// ============================================================
export function setupRenderer(canvas, w, h) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(w, h, false);
  renderer.setPixelRatio(1);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  return renderer;
}

export function setupLighting(scene, mood = "warm") {
  const presets = {
    warm: { hemiSky: 0xfff3e0, hemiGround: 0xd9a066, hemiI: 1.1, keyC: 0xfff6e0, keyI: 1.6, fillC: 0xffd9c2, fillI: 0.5, rimC: 0xdfe9ff, rimI: 0.45 },
    dry: { hemiSky: 0xfff0dd, hemiGround: 0xb98a55, hemiI: 1.05, keyC: 0xfff2d8, keyI: 1.7, fillC: 0xe8c79a, fillI: 0.4, rimC: 0xffe3c2, rimI: 0.4 },
    hopeful: { hemiSky: 0xeaf6ff, hemiGround: 0xbfe0a8, hemiI: 1.15, keyC: 0xffffff, keyI: 1.55, fillC: 0xd7f0e0, fillI: 0.5, rimC: 0xcfe8ff, rimI: 0.5 },
    soft: { hemiSky: 0xf3ecff, hemiGround: 0xe6c9d9, hemiI: 1.1, keyC: 0xffffff, keyI: 1.4, fillC: 0xffe3ef, fillI: 0.5, rimC: 0xd9ecff, rimI: 0.45 },
    golden: { hemiSky: 0xfff0cf, hemiGround: 0xd9a84a, hemiI: 1.2, keyC: 0xffe9b0, keyI: 1.75, fillC: 0xffd18a, fillI: 0.55, rimC: 0xffe3b0, rimI: 0.5 },
    rain: { hemiSky: 0xdfe9ea, hemiGround: 0x7fae5f, hemiI: 1.0, keyC: 0xe9f3f2, keyI: 1.15, fillC: 0xcfe0da, fillI: 0.55, rimC: 0xc9dee0, rimI: 0.4 },
  };
  const p = presets[mood] || presets.warm;
  scene.add(new THREE.HemisphereLight(p.hemiSky, p.hemiGround, p.hemiI));
  scene.add(new THREE.AmbientLight(0xffffff, 0.25));
  const key = new THREE.DirectionalLight(p.keyC, p.keyI);
  key.position.set(4, 6, 5);
  scene.add(key);
  const fill = new THREE.DirectionalLight(p.fillC, p.fillI);
  fill.position.set(-5, 2.5, -2);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(p.rimC, p.rimI);
  rim.position.set(0, 3, -6);
  scene.add(rim);
  return { key, fill, rim };
}

// ============================================================
// Ground
// ============================================================
export function makeGround({ size = 40, color = COLORS.groundDry, y = 0, segments = 16 } = {}) {
  const geo = new THREE.CircleGeometry(size, segments);
  geo.rotateX(-Math.PI / 2);
  const mesh = new THREE.Mesh(geo, flat(color));
  mesh.position.y = y;
  return mesh;
}

export function makeSoftShadow(radius = 0.7) {
  const mesh = new THREE.Mesh(
    new THREE.CircleGeometry(radius, 20),
    new THREE.MeshBasicMaterial({ color: 0x25180d, transparent: true, opacity: 0.2 })
  );
  mesh.rotation.x = -Math.PI / 2;
  return mesh;
}

// ============================================================
// Character factory — low-poly humanoid from basic shapes
// ============================================================
export function makePerson(opts = {}) {
  const {
    skin = COLORS.skinRamu,
    shirt = COLORS.shirtRamu,
    pants = COLORS.pantsRamu,
    hair = COLORS.hairBlack,
    beard = false,
    scale = 1,
    build = "normal", // "normal" | "child" | "elder"
  } = opts;

  const group = new THREE.Group();
  const skinMat = flat(skin);
  const shirtMat = flat(shirt);
  const pantsMat = flat(pants);

  const torsoLen = build === "child" ? 0.52 : 0.66;
  const torsoR = build === "child" ? 0.26 : build === "elder" ? 0.29 : 0.31;
  const hipY = build === "child" ? 0.51 : 0.64;

  // torso (capsule if available, else cylinder w/ sphere caps)
  let torso;
  if (THREE.CapsuleGeometry) {
    torso = new THREE.Mesh(new THREE.CapsuleGeometry(torsoR, torsoLen, 2, 7), shirtMat);
  } else {
    torso = new THREE.Mesh(new THREE.CylinderGeometry(torsoR, torsoR * 0.94, torsoLen, 7), shirtMat);
  }
  torso.position.y = hipY + torsoLen / 2 + torsoR * 0.4;
  group.add(torso);
  group.userData.torso = torso;

  // head
  const headR = build === "child" ? 0.27 : 0.24;
  const head = new THREE.Mesh(new THREE.IcosahedronGeometry(headR, 1), skinMat);
  const neckY = torso.position.y + torsoLen / 2 + torsoR * 0.55;
  head.position.set(0, neckY + headR * 0.72, 0);
  group.add(head);
  group.userData.head = head;

  // hair cap
  const hairCap = new THREE.Mesh(new THREE.IcosahedronGeometry(headR * 1.04, 1), flat(hair));
  hairCap.scale.set(1, 0.62, 1);
  hairCap.position.set(0, head.position.y + headR * 0.42, -headR * 0.06);
  if (build !== "elder") group.add(hairCap);

  if (beard) {
    const beardMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(headR * 0.72, 1), flat(COLORS.beardWhite));
    beardMesh.scale.set(0.92, 1.1, 0.75);
    beardMesh.position.set(0, head.position.y - headR * 0.55, headR * 0.32);
    group.add(beardMesh);
    // elder hair tuft (sides only, simple)
    const elderHair = new THREE.Mesh(new THREE.IcosahedronGeometry(headR * 1.02, 1), flat(COLORS.beardWhite));
    elderHair.scale.set(1, 0.5, 1);
    elderHair.position.set(0, head.position.y + headR * 0.48, -headR * 0.05);
    group.add(elderHair);
  }

  // eyes
  const eyeR = headR * 0.19;
  function makeEye(x) {
    const eGroup = new THREE.Group();
    const white = new THREE.Mesh(new THREE.IcosahedronGeometry(eyeR, 1), flat(COLORS.eyeWhite, { roughness: 0.3 }));
    const pupil = new THREE.Mesh(new THREE.IcosahedronGeometry(eyeR * 0.5, 0), flat(COLORS.eyeDark, { roughness: 0.4 }));
    pupil.position.set(0, 0, eyeR * 0.75);
    eGroup.add(white, pupil);
    eGroup.position.set(x, head.position.y + headR * 0.06, headR * 0.86);
    return eGroup;
  }
  group.add(makeEye(-headR * 0.42), makeEye(headR * 0.42));

  // arms — shoulder pivots
  const armLen = build === "child" ? 0.42 : 0.52;
  const armR = build === "child" ? 0.075 : 0.09;
  const shoulderY = torso.position.y + torsoLen / 2 - torsoR * 0.1;
  const shoulderX = torsoR + armR * 0.3;

  function makeArm() {
    const pivot = new THREE.Group();
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(armR, armR * 0.82, armLen, 6), skinMat);
    arm.position.set(0, -armLen / 2, 0);
    const hand = new THREE.Mesh(new THREE.IcosahedronGeometry(armR * 1.15, 0), skinMat);
    hand.position.set(0, -armLen, 0);
    pivot.add(arm, hand);
    pivot.userData.hand = hand;
    return pivot;
  }
  const armL = makeArm();
  armL.position.set(-shoulderX, shoulderY, 0);
  armL.rotation.z = -0.18;
  const armR_ = makeArm();
  armR_.position.set(shoulderX, shoulderY, 0);
  armR_.rotation.z = 0.18;
  group.add(armL, armR_);
  group.userData.armL = armL;
  group.userData.armR = armR_;

  // legs
  const legLen = build === "child" ? 0.4 : 0.5;
  const legR = build === "child" ? 0.1 : 0.12;
  const hipX = torsoR * 0.5;
  function makeLeg() {
    const pivot = new THREE.Group();
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(legR, legR * 0.88, legLen, 6), pantsMat);
    leg.position.set(0, -legLen / 2, 0);
    const foot = new THREE.Mesh(new THREE.IcosahedronGeometry(legR * 1.1, 0), flat(COLORS.woodDark));
    foot.position.set(0, -legLen, legR * 0.5);
    pivot.add(leg, foot);
    return pivot;
  }
  const legL = makeLeg();
  legL.position.set(-hipX, hipY, 0);
  const legR_ = makeLeg();
  legR_.position.set(hipX, hipY, 0);
  group.add(legL, legR_);
  group.userData.legL = legL;
  group.userData.legR = legR_;

  // walking stick for elder
  if (build === "elder") {
    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.95, 5), flat(COLORS.wood));
    stick.position.set(shoulderX + 0.14, hipY + 0.02, 0.05);
    group.add(stick);
  }

  group.scale.setScalar(scale);
  group.add(makeSoftShadow(0.42 * scale));
  return group;
}

// ============================================================
// Idle / motion helpers (deterministic, time-driven)
// ============================================================
export function idleBreathe(group, time, { freq = 1.6, amp = 0.02, phase = 0 } = {}) {
  const s = Math.sin(time * freq + phase);
  group.scale.y = (group.userData.baseScale || 1) * (1 + s * amp);
}

export function armSwing(pivot, time, { base = 0, amp = 0.25, freq = 2.2, phase = 0 } = {}) {
  pivot.rotation.z = base + Math.sin(time * freq + phase) * amp;
}

export function walkCycle(person, time, { freq = 5.5, amp = 0.5, phase = 0 } = {}) {
  const s = Math.sin(time * freq + phase);
  person.userData.legL.rotation.x = s * amp;
  person.userData.legR.rotation.x = -s * amp;
  person.userData.armL.rotation.x = -s * amp * 0.7;
  person.userData.armR.rotation.x = s * amp * 0.7;
  person.position.y = Math.abs(Math.sin(time * freq * 2 + phase)) * 0.03;
}

export function bobGroup(group, time, { freq = 2, amp = 0.06, phase = 0, baseY = 0 } = {}) {
  group.position.y = baseY + Math.sin(time * freq + phase) * amp;
}

// ============================================================
// Props
// ============================================================
export function makeHut(position = [0, 0, 0]) {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.15, 1.3, 8), flat(0xd8c49a));
  base.position.y = 0.65;
  const roof = new THREE.Mesh(new THREE.ConeGeometry(1.5, 1.05, 8), flat(COLORS.wood));
  roof.position.y = 1.3 + 0.5;
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.85, 0.08), flat(COLORS.woodDark));
  door.position.set(0, 0.45, 1.08);
  g.add(base, roof, door);
  g.position.set(...position);
  return g;
}

export function makeWell(position = [0, 0, 0]) {
  const g = new THREE.Group();
  const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.6, 0.5, 10), flat(0x9a9186));
  rim.position.y = 0.25;
  const postL = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.0, 5), flat(COLORS.wood));
  postL.position.set(-0.45, 0.9, 0);
  const postR = postL.clone();
  postR.position.x = 0.45;
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.0, 5), flat(COLORS.wood));
  beam.rotation.z = Math.PI / 2;
  beam.position.set(0, 1.38, 0);
  const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.5, 4), flat(0xcbb583));
  rope.position.set(0, 1.1, 0);
  const bucket = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.07, 0.14, 6), flat(0x7d7469));
  bucket.position.set(0, 0.82, 0);
  g.add(rim, postL, postR, beam, rope, bucket);
  g.position.set(...position);
  return g;
}

export function makeChest(position = [0, 0, 0]) {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.42, 0.5), flat(COLORS.metalChest));
  base.position.y = 0.21;
  const lidPivot = new THREE.Group();
  lidPivot.position.set(0, 0.42, -0.25);
  const lid = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.16, 0.5), flat(COLORS.metalChestDark));
  lid.position.set(0, 0.08, 0.25);
  lidPivot.add(lid);
  const band = new THREE.Mesh(new THREE.BoxGeometry(0.89, 0.06, 0.54), flat(0x2c2b30));
  band.position.y = 0.21;
  g.add(base, lidPivot, band);
  g.position.set(...position);
  g.userData.lidPivot = lidPivot;
  return g;
}

export function makeCropRow({ position = [0, 0, 0], rows = 4, perRow = 6, spacing = 0.5, lush = false } = {}) {
  const g = new THREE.Group();
  const stemMat = flat(lush ? COLORS.leafGreen : 0x9c8352);
  const capMat = flat(lush ? COLORS.groundLushDeep : 0x8a7248);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < perRow; c++) {
      const plant = new THREE.Group();
      const h = lush ? 0.32 + (c % 3) * 0.04 : 0.14;
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, h, 5), stemMat);
      stem.position.y = h / 2;
      plant.add(stem);
      if (lush) {
        const leaf = new THREE.Mesh(new THREE.IcosahedronGeometry(0.09, 0), capMat);
        leaf.position.y = h;
        leaf.scale.set(1, 0.7, 1);
        plant.add(leaf);
      }
      plant.position.set((c - perRow / 2) * spacing + (r % 2) * 0.18, 0, r * spacing);
      g.add(plant);
    }
  }
  g.position.set(...position);
  return g;
}

export function makeCloud(position = [0, 0, 0], scale = 1, dark = false) {
  const g = new THREE.Group();
  const mat = flat(dark ? 0x8f97a6 : 0xffffff, { transparent: true, opacity: dark ? 0.92 : 0.85 });
  const parts = [
    [0, 0, 0, 0.5],
    [0.45, 0.08, 0, 0.38],
    [-0.42, 0.06, 0, 0.35],
    [0.18, 0.22, 0, 0.32],
  ];
  for (const [x, y, z, r] of parts) {
    const puff = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), mat);
    puff.position.set(x, y, z);
    g.add(puff);
  }
  g.position.set(...position);
  g.scale.setScalar(scale);
  return g;
}

export function makeSun(position = [5, 6, -4], color = 0xffe3a3) {
  const sun = new THREE.Mesh(new THREE.IcosahedronGeometry(0.9, 1), new THREE.MeshBasicMaterial({ color }));
  sun.position.set(...position);
  return sun;
}

export function makeDiary(position = [0, 0, 0]) {
  const book = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.05, 0.24), flat(COLORS.paperOld));
  book.position.set(...position);
  return book;
}

export function makePump(position = [0, 0, 0]) {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.55, 7), flat(0x6e7a72));
  base.position.y = 0.28;
  const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.32, 6), flat(0x565f5a));
  spout.rotation.z = Math.PI / 2.3;
  spout.position.set(0.16, 0.55, 0);
  const handle = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.04, 0.04), flat(0x565f5a));
  handle.position.set(-0.05, 0.62, 0);
  g.add(base, spout, handle);
  g.position.set(...position);
  return g;
}

// ============================================================
// Rain
// ============================================================
export function makeRain({ count = 70, area = 9, height = 6 } = {}) {
  const positions = new Float32Array(count * 6);
  const seeds = [];
  for (let i = 0; i < count; i++) {
    seeds.push({ x: pseudo(i * 3.1) * area, z: pseudo(i * 7.7) * area, offset: pseudo(i * 13.3) * height, speed: 5 + pseudo(i * 5.2) * 2 });
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.LineBasicMaterial({ color: 0xbcd8e6, transparent: true, opacity: 0.55 });
  const lines = new THREE.LineSegments(geo, mat);

  function update(time) {
    const arr = geo.attributes.position.array;
    for (let i = 0; i < count; i++) {
      const s = seeds[i];
      const y = height - (((time * s.speed + s.offset) % height) + height) % height;
      const i6 = i * 6;
      arr[i6] = s.x;
      arr[i6 + 1] = y;
      arr[i6 + 2] = s.z;
      arr[i6 + 3] = s.x;
      arr[i6 + 4] = y - 0.22;
      arr[i6 + 5] = s.z;
    }
    geo.attributes.position.needsUpdate = true;
  }
  update(0);
  return { mesh: lines, update };
}

function pseudo(n) {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}
