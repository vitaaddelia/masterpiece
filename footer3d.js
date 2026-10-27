/* ==========================================================================
   footer3d.js — a little slicing game behind the footer.
   Design objects (cursor, pen nib, pixel cube, colour ring, pencil, sparkle)
   are tossed up; swipe through them to cut them in half.
   Desktop: just move the mouse. Phones: tap "Play" first so swiping doesn't
   fight with scrolling. Loaded by site.js only when the footer comes into view.
   ========================================================================== */
import * as THREE from './vendor/three.module.min.js';

const footer = document.querySelector('.site-footer');
const glCanvas = footer && footer.querySelector('.foot-game');
const trailCanvas = footer && footer.querySelector('.foot-trail');
if (footer && glCanvas && trailCanvas && !matchMedia('(prefers-reduced-motion: reduce)').matches) start();

function start() {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: glCanvas, antialias: true, alpha: true }); } catch (e) { return; }
  footer.classList.add('game-on');
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.localClippingEnabled = true;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  cam.position.set(0, 0, 12);
  scene.add(new THREE.HemisphereLight(0xfff4e8, 0x3b1e33, 1.1));
  const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(3, 5, 6); scene.add(key);
  const rim = new THREE.DirectionalLight(0xffe386, 0.8); rim.position.set(-5, -2, 3); scene.add(rim);

  const tctx = trailCanvas.getContext('2d');
  let W = 1, H = 1, pxW = 1, pxH = 1;
  function resize() {
    const r = footer.getBoundingClientRect();
    pxW = Math.max(1, r.width); pxH = Math.max(1, r.height);
    renderer.setSize(pxW, pxH, false);
    const dpr = Math.min(devicePixelRatio || 1, 2);
    trailCanvas.width = pxW * dpr; trailCanvas.height = pxH * dpr; tctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cam.aspect = pxW / pxH; cam.updateProjectionMatrix();
    H = 2 * cam.position.z * Math.tan(cam.fov * Math.PI / 360); W = H * cam.aspect;
  }
  addEventListener('resize', resize); resize();

  /* ---------- the design objects ---------- */
  const C = { cream: 0xfbf7f2, sun: 0xffe386, berry: 0x9b3a6e, blush: 0xefdde6, plum2: 0x7a3b66, ink: 0x3b1e33 };
  const mat = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.45, metalness: 0.05, ...o });
  const centre = (g) => { g.computeBoundingBox(); const c = new THREE.Vector3(); g.boundingBox.getCenter(c); g.translate(-c.x, -c.y, -c.z); return g; };

  const makers = [
    function cursor() {
      const s = new THREE.Shape();
      [[0, 0], [0, -1.25], [0.33, -0.95], [0.56, -1.45], [0.76, -1.36], [0.53, -0.87], [0.95, -0.87]].forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
      s.closePath();
      const g = centre(new THREE.ExtrudeGeometry(s, { depth: 0.22, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 2 }));
      const grp = new THREE.Group(); grp.add(new THREE.Mesh(g, mat(C.cream))); grp.scale.setScalar(1.1); return grp;
    },
    function nib() {
      const grp = new THREE.Group();
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.85, 24), mat(C.sun)); tip.position.y = 0.42;
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.6, 24), mat(C.berry)); body.position.y = -0.3;
      grp.add(tip, body); return grp;
    },
    function pixel() {
      const mats = [C.sun, C.berry, C.blush, C.cream, C.plum2, C.sun].map((c) => mat(c));
      const grp = new THREE.Group(); grp.add(new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), mats)); return grp;
    },
    function ring() {
      const grp = new THREE.Group(); grp.add(new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.17, 18, 48), mat(C.blush))); return grp;
    },
    function pencil() {
      const grp = new THREE.Group();
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 1.15, 6), mat(C.sun));
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.35, 6), mat(C.cream)); tip.position.y = 0.75;
      const eraser = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.22, 16), mat(C.berry)); eraser.position.y = -0.68;
      grp.add(body, tip, eraser); grp.scale.setScalar(1.1); return grp;
    },
    function sparkle() {
      const s = new THREE.Shape();
      s.moveTo(0, 0.6); s.quadraticCurveTo(0.06, 0.06, 0.6, 0); s.quadraticCurveTo(0.06, -0.06, 0, -0.6);
      s.quadraticCurveTo(-0.06, -0.06, -0.6, 0); s.quadraticCurveTo(-0.06, 0.06, 0, 0.6);
      const g = centre(new THREE.ExtrudeGeometry(s, { depth: 0.2, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.04, bevelSegments: 2 }));
      const grp = new THREE.Group(); grp.add(new THREE.Mesh(g, mat(C.sun, { emissive: 0x332200 }))); grp.scale.setScalar(1.2); return grp;
    },
  ];

  /* ---------- game state ---------- */
  const G = 9.5;
  const items = [];   // { obj, v, w, r, cut, life, plane, local }
  let spawnT = 0.4, last = 0, running = false, score = 0, best = 0;
  const scoreEl = footer.querySelector('#fScore'), bestEl = footer.querySelector('#fBest');
  try { best = +localStorage.getItem('vita-footer-best') || 0; } catch (e) {}
  if (bestEl) bestEl.textContent = best;

  function spawn() {
    const make = makers[(Math.random() * makers.length) | 0];
    const obj = make();
    const x = (Math.random() - 0.5) * W * 0.75;
    const y = -H / 2 - 1;
    const apex = H * (0.15 + Math.random() * 0.3);       // peaks in the upper-middle of the footer
    const vy = Math.sqrt(2 * G * (apex - y));
    obj.position.set(x, y, 0);
    obj.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
    scene.add(obj);
    items.push({ obj, v: new THREE.Vector3(-x * 0.12 + (Math.random() - 0.5) * 1.2, vy, 0), w: new THREE.Vector3((Math.random() - .5) * 4, (Math.random() - .5) * 4, (Math.random() - .5) * 3), r: 0.75, cut: false, life: 1 });
  }

  function halves(item, dirX, dirY) {
    // cut along the swipe: plane normal is perpendicular to the swipe, through the object's centre
    const n = new THREE.Vector3(-dirY, dirX, 0).normalize();
    item.obj.updateMatrixWorld(true);
    const worldPlane = new THREE.Plane().setFromNormalAndCoplanarPoint(n, item.obj.position);
    const inv = new THREE.Matrix4().copy(item.obj.matrixWorld).invert();
    const out = [];
    [1, -1].forEach((sign) => {
      const local = worldPlane.clone().applyMatrix4(inv); if (sign < 0) local.negate();
      const plane = new THREE.Plane();
      const g = item.obj.clone(true);
      g.traverse((m) => {
        if (!m.isMesh) return;
        const fix = (x) => { const c = x.clone(); c.clippingPlanes = [plane]; c.side = THREE.DoubleSide; return c; };
        m.material = Array.isArray(m.material) ? m.material.map(fix) : fix(m.material);
      });
      scene.add(g);
      const push = n.clone().multiplyScalar(-sign * 2.6);
      out.push({ obj: g, v: item.v.clone().multiplyScalar(0.4).add(push).add(new THREE.Vector3(0, 1.5, 0)), w: item.w.clone().multiplyScalar(1.8), r: 0, cut: true, life: 1, plane, local });
    });
    scene.remove(item.obj);
    return out;
  }

  /* ---------- pointer trail + slicing ---------- */
  const trail = [];   // {x, y, t}
  let playing = !matchMedia('(pointer: coarse)').matches;   // touch screens opt in with the Play button; everything else plays straight away
  const playBtn = footer.querySelector('.foot-play');
  if (playBtn) playBtn.addEventListener('click', () => {
    playing = !playing; footer.classList.toggle('playing', playing);
    playBtn.setAttribute('aria-pressed', String(playing)); playBtn.textContent = playing ? 'Stop' : 'Play';
  });
  function onMove(e) {
    if (!playing) return;
    const r = footer.getBoundingClientRect();
    trail.push({ x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() });
    if (trail.length > 24) trail.shift();
    if (running) checkSlices(performance.now());   // check on every move too, so slow devices never miss a swipe
  }
  footer.addEventListener('pointermove', onMove);
  footer.addEventListener('pointerdown', onMove);
  footer.addEventListener('pointerleave', () => { trail.length = 0; });

  const v3 = new THREE.Vector3();
  function toScreen(p) { v3.copy(p).project(cam); return [(v3.x + 1) / 2 * pxW, (1 - v3.y) / 2 * pxH]; }
  function segDist(px, py, ax, ay, bx, by) {
    const dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l));
    return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
  }
  function checkSlices(now) {
    if (trail.length < 2) return;
    const a = trail[trail.length - 2], b = trail[trail.length - 1];
    if (now - b.t > 80) return;
    const speed = Math.hypot(b.x - a.x, b.y - a.y);
    if (speed < 4) return;
    const unitPx = pxH / H;  // pixels per world unit
    for (let i = items.length - 1; i >= 0; i--) {
      const it = items[i]; if (it.cut) continue;
      const [sx, sy] = toScreen(it.obj.position);
      if (segDist(sx, sy, a.x, a.y, b.x, b.y) < it.r * unitPx) {
        const parts = halves(it, (b.x - a.x) / speed, -(b.y - a.y) / speed);
        items.splice(i, 1, ...parts);
        score++; if (scoreEl) scoreEl.textContent = score;
        if (score > best) { best = score; if (bestEl) bestEl.textContent = best; try { localStorage.setItem('vita-footer-best', best); } catch (e) {} }
      }
    }
  }
  function drawTrail(now) {
    tctx.clearRect(0, 0, pxW, pxH);
    while (trail.length && now - trail[0].t > 160) trail.shift();
    if (trail.length < 2) return;
    tctx.lineCap = 'round'; tctx.lineJoin = 'round';
    for (let i = 1; i < trail.length; i++) {
      const k = i / trail.length;
      tctx.strokeStyle = `rgba(255, 227, 134, ${0.85 * k})`;
      tctx.lineWidth = 1 + 7 * k;
      tctx.beginPath(); tctx.moveTo(trail[i - 1].x, trail[i - 1].y); tctx.lineTo(trail[i].x, trail[i].y); tctx.stroke();
    }
  }

  /* ---------- loop (only while the footer is on screen) ---------- */
  function footerVisible() {
    return innerHeight + scrollY >= document.documentElement.scrollHeight - footer.offsetHeight * 0.85;
  }
  function loop(now) {
    if (!footerVisible()) { running = false; trail.length = 0; tctx.clearRect(0, 0, pxW, pxH); return; }
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016; last = now;
    spawnT -= dt;
    if (spawnT <= 0) { spawn(); if (Math.random() < 0.35) spawn(); spawnT = 0.75 + Math.random() * 0.7; }
    checkSlices(now);
    for (let i = items.length - 1; i >= 0; i--) {
      const it = items[i];
      it.v.y -= G * dt;
      it.obj.position.addScaledVector(it.v, dt);
      it.obj.rotation.x += it.w.x * dt; it.obj.rotation.y += it.w.y * dt; it.obj.rotation.z += it.w.z * dt;
      if (it.plane) { it.obj.updateMatrixWorld(true); it.plane.copy(it.local).applyMatrix4(it.obj.matrixWorld); }
      if (it.obj.position.y < -H / 2 - 2.5 && it.v.y < 0) {
        scene.remove(it.obj);
        it.obj.traverse((m) => { if (m.isMesh) (Array.isArray(m.material) ? m.material : [m.material]).forEach((x) => x.dispose()); });   // geometry is shared between halves
        items.splice(i, 1);
      }
    }
    renderer.render(scene, cam);
    drawTrail(now);
    requestAnimationFrame(loop);
  }
  function wake() { if (!running && footerVisible()) { running = true; last = 0; resize(); requestAnimationFrame(loop); } }
  addEventListener('scroll', wake, { passive: true });
  addEventListener('resize', wake);
  wake();
}
