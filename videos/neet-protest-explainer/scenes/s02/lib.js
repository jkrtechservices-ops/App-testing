import * as THREE from "./three.module.min.js";

// ============================================================
// Palette — breaking-news / current-affairs explainer
// ============================================================
export const COLORS = {
  bgDark: 0x0b0d12,
  accentRed: 0xe4372b,
  accentAmber: 0xf2a93b,
  node: 0x3a4658,
  nodeBright: 0x7fa8d9,
  line: 0x2c3646,
};

export function setupRenderer(canvas, w, h) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(w, h, false);
  renderer.setPixelRatio(1);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  return renderer;
}

// Full-bleed orthographic camera matched to a WxH canvas — background layer sits at z=0.
export function makeOrthoCamera(w, h) {
  const camera = new THREE.OrthographicCamera(-w / 2, w / 2, h / 2, -h / 2, 0.1, 100);
  camera.position.z = 10;
  return camera;
}

// Deterministic pseudo-random — same seed always yields the same sequence.
function seededRand(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// A field of glowing "data nodes" with faint connecting lines drifting slowly — a digital/
// network motif used behind text-only beats (curbs, statements, closing question).
export function makeNodeField({ width, height, count = 46, seed = 7 } = {}) {
  const rand = seededRand(seed);
  const group = new THREE.Group();
  const pts = [];
  for (let i = 0; i < count; i++) {
    const x = (rand() - 0.5) * width * 1.1;
    const y = (rand() - 0.5) * height * 1.1;
    pts.push({ x, y, phase: rand() * Math.PI * 2, speed: 0.15 + rand() * 0.25 });
  }

  const nodeGeo = new THREE.CircleGeometry(3.2, 10);
  const nodeMat = new THREE.MeshBasicMaterial({ color: COLORS.nodeBright, transparent: true, opacity: 0.55 });
  const nodes = pts.map((p) => {
    const m = new THREE.Mesh(nodeGeo, nodeMat.clone());
    m.position.set(p.x, p.y, 0);
    group.add(m);
    return m;
  });

  // connect nearby nodes with thin line segments (static topology, animated opacity)
  const lineMat = new THREE.LineBasicMaterial({ color: COLORS.line, transparent: true, opacity: 0.4 });
  const lines = [];
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
      const d = Math.hypot(dx, dy);
      if (d < width * 0.16) {
        const geo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(pts[i].x, pts[i].y, -0.5),
          new THREE.Vector3(pts[j].x, pts[j].y, -0.5),
        ]);
        const line = new THREE.Line(geo, lineMat.clone());
        group.add(line);
        lines.push({ line, a: i, b: j });
      }
    }
  }

  group.userData = { pts, nodes, lines };
  return group;
}

export function animateNodeField(group, time) {
  const { pts, nodes } = group.userData;
  nodes.forEach((n, i) => {
    const p = pts[i];
    n.position.x = p.x + Math.sin(time * p.speed + p.phase) * 8;
    n.position.y = p.y + Math.cos(time * p.speed * 0.8 + p.phase) * 8;
    n.material.opacity = 0.35 + 0.35 * (0.5 + 0.5 * Math.sin(time * 0.9 + p.phase));
  });
}

// Thin horizontal "scanline" sweep — a subtle broadcast-monitor accent.
export function makeScanline(width) {
  const geo = new THREE.PlaneGeometry(width * 1.2, 6);
  const mat = new THREE.MeshBasicMaterial({ color: COLORS.accentRed, transparent: true, opacity: 0.18 });
  return new THREE.Mesh(geo, mat);
}

// Deterministic camera drift for a subtle parallax feel behind the HTML overlay.
export function ambientDrift(camera, time, { ampX = 14, ampY = 8, freq = 0.12 } = {}) {
  camera.position.x = Math.sin(time * freq) * ampX;
  camera.position.y = Math.cos(time * freq * 0.8) * ampY;
}
