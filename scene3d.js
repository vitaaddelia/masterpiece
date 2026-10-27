/* ==========================================================================
   scene3d.js — one aluminium laptop that rides the whole top of the homepage.
   Hero: tilted on the right, bobbing. Stats: drifts to the centre and spins.
   Selected work: faces you, opens, powers on, and two rows of project cards
   spill out of the screen. "Keep scrolling": spins and drops away.
   three.js r160 (vendored ES module). No external models.
   ========================================================================== */
import * as THREE from './vendor/three.module.min.js';

const host = document.getElementById('three');
const seqEl = document.getElementById('sequence');
const fail = () => { seqEl && seqEl.classList.remove('is3d'); host && host.classList.remove('ready'); const pin = document.querySelector('.pin3d'); if (pin) pin.style.display = 'none'; };

const SEC = {
  hero: document.getElementById('hero'),
  ben: document.getElementById('impact'),
  seq: seqEl,
  brk: document.getElementById('break'),
};
const ui = { angle: document.getElementById('angle'), bar: document.getElementById('seqbar') };

let renderer = null;
if (host && SEC.hero && SEC.ben && SEC.seq && SEC.brk) {
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' }); }
  catch (e) { renderer = null; }
}
if (!renderer) fail(); else start();

function start() {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, innerWidth < 768 ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.localClippingEnabled = true;
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.addEventListener('webglcontextlost', (e) => { e.preventDefault(); fail(); });

  const rand = (s => () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; })(2026);
  const lerp = (a, b, t) => a + (b - a) * t;
  const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const canvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; };
  const tex = (c, srgb) => { const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy()); return t; };
  const rr = (x, X, Y, w, h, r) => { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); };
  const loadImg = (src) => new Promise((res, rej) => { const i = new Image(); i.decoding = 'async'; i.onload = () => res(i); i.onerror = rej; i.src = src; });

  /* ---------- textures ---------- */
  // brushed aluminium roughness
  const [cR, xR] = canvas(512, 512);
  { const id = xR.createImageData(512, 512); for (let i = 0; i < id.data.length; i += 4) { const v = 135 + rand() * 45 | 0; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; } xR.putImageData(id, 0, 0); }
  const brushed = tex(cR); brushed.wrapS = brushed.wrapT = THREE.RepeatWrapping; brushed.repeat.set(1.5, 1.5);

  // keyboard: black well with black keys, full-height function row, Touch ID
  const KW = 1300, KH = 510, [cK, xK] = canvas(KW, KH);
  xK.fillStyle = '#111113'; rr(xK, 0, 0, KW, KH, 22); xK.fill();
  { const u = (KW - 16) / 15, F = [...Array(12)].map((_, i) => [1.04, 'F' + (i + 1)]), rows = [
      [[1.5, 'esc'], ...F, [1.02, 'id']],
      [...'`1234567890-='].map(c => [1, c]).concat([[2, 'delete']]),
      [[1.5, 'tab'], ...[...'QWERTYUIOP[]'].map(c => [1, c]), [1.5, '\\']],
      [[1.8, 'caps lock'], ...[...'ASDFGHJKL;\''].map(c => [1, c]), [2.2, 'return']],
      [[2.35, 'shift'], ...[...'ZXCVBNM,./'].map(c => [1, c]), [2.65, 'shift']],
      [[1, 'fn'], [1, 'control'], [1, 'option'], [1.25, 'command'], [5.5, ''], [1.25, 'command'], [1, 'option'], [1, '◀'], [1, 'ud'], [1, '▶']]];
    let y = 8; const rh = 74;
    for (const row of rows) {
      let x = 8;
      for (const [w, l] of row) {
        const kw = w * u - 10, kh = rh - 10;
        const key = (X, Y, ww, hh) => { xK.fillStyle = '#050506'; rr(xK, X, Y, ww, hh, 7); xK.fill(); xK.fillStyle = 'rgba(255,255,255,.055)'; rr(xK, X + 2, Y + 1, ww - 4, hh * .45, 6); xK.fill(); };
        if (l === 'ud') { key(x, y + kh / 2 + 2, kw, kh / 2 - 2); key(x, y, kw, kh / 2 - 2); }
        else if (l === '◀' || l === '▶') key(x, y + kh / 2 + 2, kw, kh / 2 - 2);
        else key(x, y, kw, kh);
        if (l === 'id') { xK.strokeStyle = '#2a2a2d'; xK.lineWidth = 2; rr(xK, x + 4, y + 4, kw - 8, kh - 8, 6); xK.stroke(); }
        else if (l && l !== 'ud') {
          xK.fillStyle = '#cfd0d4'; const big = l.length === 1; xK.font = `500 ${big ? 18 : 12}px Inter, system-ui, sans-serif`;
          if (l === '◀' || l === '▶') { xK.textAlign = 'center'; xK.font = '500 11px Inter, sans-serif'; xK.fillText(l, x + kw / 2, y + kh * .8); }
          else if (big) { xK.textAlign = 'center'; xK.fillText(l, x + kw / 2, y + kh / 2 + 7); }
          else { xK.textAlign = row === rows[0] ? 'center' : 'left'; xK.fillText(l, row === rows[0] ? x + kw / 2 : x + 8, y + kh - 10); }
        }
        if (l === 'ud') { xK.fillStyle = '#cfd0d4'; xK.textAlign = 'center'; xK.font = '500 10px Inter, sans-serif'; xK.fillText('▲', x + kw / 2, y + kh * .32); xK.fillText('▼', x + kw / 2, y + kh * .85); }
        x += w * u;
      }
      y += rh + (row === rows[0] ? 4 : 0) + 8;
    }
  }
  // speaker grille: transparent with dot holes
  const [cS, xS] = canvas(96, 510);
  for (let gy = 10; gy < 500; gy += 9) for (let gx = 8; gx < 92; gx += 9) { xS.fillStyle = '#1b1b1d'; xS.beginPath(); xS.arc(gx + (gy / 9 % 2) * 4.5, gy, 2.3, 0, 7); xS.fill(); }
  const grilleTex = tex(cS, true);
  const keysTex = tex(cK, true);

  // desktop wallpaper: plum gradient, menu bar beside the notch, a browser bar, and the logo once it loads
  const DW = 1200, DH = 780, [cD, xD] = canvas(DW, DH);
  const paintWall = (logo) => {
    const g = xD.createLinearGradient(0, 0, DW, DH); g.addColorStop(0, '#3B1E33'); g.addColorStop(1, '#6a2350'); xD.fillStyle = g; xD.fillRect(0, 0, DW, DH);
    for (const [x, y, r, c] of [[200, 640, 400, 'rgba(155,58,110,.55)'], [1000, 180, 440, 'rgba(255,227,134,.18)'], [720, 740, 320, 'rgba(239,221,230,.12)']]) { const rg = xD.createRadialGradient(x, y, 0, x, y, r); rg.addColorStop(0, c); rg.addColorStop(1, 'rgba(0,0,0,0)'); xD.fillStyle = rg; xD.fillRect(0, 0, DW, DH); }
    if (logo) { const w = 560, h = w * logo.height / logo.width; xD.drawImage(logo, (DW - w) / 2, 82 + (DH - 82 - h) / 2, w, h); }
    xD.fillStyle = 'rgba(20,8,16,.55)'; xD.fillRect(0, 0, DW, 26);
    xD.fillStyle = '#f4eef1'; xD.textAlign = 'left';
    let mx = 16; for (const m of ['Browser', 'File', 'Edit', 'View', 'History']) { xD.font = (m === 'Browser' ? '600' : '400') + ' 12px Inter, system-ui, sans-serif'; xD.fillText(m, mx, 18); mx += xD.measureText(m).width + 18; }
    xD.textAlign = 'right'; xD.font = '400 12px Inter, system-ui, sans-serif'; xD.fillText('Mon 08:47', DW - 16, 18);
    xD.strokeStyle = '#f4eef1'; xD.lineWidth = 1.2; rr(xD, DW - 120, 8, 22, 11, 3); xD.stroke(); xD.fillStyle = '#f4eef1'; xD.fillRect(DW - 118, 10, 14, 7);
    xD.fillStyle = 'rgba(248,246,244,.97)'; xD.fillRect(0, 26, DW, 56);
    ['#ec6a5e', '#f4bf4f', '#61c554'].forEach((c, i) => { xD.fillStyle = c; xD.beginPath(); xD.arc(26 + i * 20, 54, 6.5, 0, 7); xD.fill(); });
    xD.fillStyle = '#EFDDE6'; rr(xD, DW / 2 - 210, 39, 420, 30, 9); xD.fill();
    xD.fillStyle = '#3B1E33'; xD.font = '500 14px Inter, system-ui, sans-serif'; xD.textAlign = 'center'; xD.fillText('Vita Addelia · Portfolio', DW / 2, 59);
    xD.fillStyle = 'rgba(59,30,51,.12)'; xD.fillRect(0, 81, DW, 1);
  };
  paintWall(null);
  const wall = tex(cD, true);

  // project cards: a coloured placeholder first, swapped for the real screen once it loads
  const PAL = [['#EFDDE6', '#9B3A6E'], ['#FFE386', '#5A1D44'], ['#CFDDA0', '#3B1E33'], ['#9B3A6E', '#FBF7F2'], ['#5A1D44', '#FFE386'], ['#F2C6A0', '#3B1E33'], ['#FBF7F2', '#9B3A6E'], ['#3B1E33', '#EFDDE6'], ['#B9D1E6', '#3B1E33'], ['#FFD0B5', '#5A1D44']];
  const IMG = (n) => `Images/laptop-${n}.jpg`;
  const CARDS = [
    ['Alternate Worlds', 'Search rebuild', IMG('catalog-heist')],
    ['Bonza', 'AI onboarding', IMG('bonza')],
    ['Notes ERP', 'Doctor finance', IMG('doctor-finance')],
    ['QA automation', 'Ghost Inspector + Claude', IMG('qa-automation')],
    ['Alternate Worlds', 'Category pages', IMG('catalog-full')],
    ['Feel1 Tallow', 'Landing page', IMG('feel1-tallow')],
    ['Design system', 'Multi-brand', IMG('design-system')],
    ['Byron Bay Candles', 'Mobile checkout', IMG('checkout')],
    ['Social proof', 'Product page', IMG('social-proof')],
    ['Notes ERP', 'Patient list', IMG('patient-list')],
  ];
  const label = (x, W, H, i, light) => {
    x.fillStyle = light ? '#FBF7F2' : PAL[i][1];
    x.font = '600 38px Inter, system-ui, sans-serif'; x.textAlign = 'left'; x.fillText(CARDS[i][0], 40, H - 44);
    x.font = '500 26px Inter, system-ui, sans-serif'; x.textAlign = 'right'; x.globalAlpha = light ? .85 : .7; x.fillText(CARDS[i][1], W - 40, H - 46); x.globalAlpha = 1;
  };
  const cardTex = PAL.map(([bg, fg], i) => {
    const W = 900, H = 600, [c, x] = canvas(W, H);
    rr(x, 0, 0, W, H, 38); x.save(); x.clip();
    x.fillStyle = bg; x.fillRect(0, 0, W, H);
    x.strokeStyle = fg; x.globalAlpha = .08; x.lineWidth = 14; for (let d = -H; d < W; d += 44) { x.beginPath(); x.moveTo(d, H); x.lineTo(d + H, 0); x.stroke(); }
    x.globalAlpha = 1;
    const cx = W / 2, cy = H / 2 - 18; x.strokeStyle = fg; x.lineWidth = 7; x.lineJoin = 'round'; rr(x, cx - 70, cy - 52, 140, 104, 14); x.stroke();
    x.fillStyle = fg; x.beginPath(); x.arc(cx + 30, cy - 18, 13, 0, 7); x.fill();
    x.beginPath(); x.moveTo(cx - 60, cy + 44); x.lineTo(cx - 18, cy - 4); x.lineTo(cx + 10, cy + 24); x.lineTo(cx + 26, cy + 10); x.lineTo(cx + 60, cy + 44); x.closePath(); x.fill();
    label(x, W, H, i, false);
    x.restore();
    return tex(c, true);
  });
  cardTex.forEach((t, i) => {
    loadImg(CARDS[i][2]).then((img) => {
      const c = t.image, x = c.getContext('2d'), W = c.width, H = c.height;
      x.clearRect(0, 0, W, H); x.save(); rr(x, 0, 0, W, H, 38); x.clip();
      const s = Math.max(W / img.width, H / img.height), w = img.width * s, h = img.height * s; x.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
      const g = x.createLinearGradient(0, H - 150, 0, H); g.addColorStop(0, 'rgba(59,30,51,0)'); g.addColorStop(1, 'rgba(59,30,51,.88)'); x.fillStyle = g; x.fillRect(0, H - 150, W, 150);
      label(x, W, H, i, true);
      x.restore(); t.needsUpdate = true;
    }).catch(() => {});
  });

  /* ---------- materials ---------- */
  const alu = new THREE.MeshPhysicalMaterial({ color: 0xd5d6d9, metalness: .92, roughness: .62, roughnessMap: brushed });
  const deckMat = new THREE.MeshStandardMaterial({ map: keysTex, transparent: true, alphaTest: .5, metalness: .2, roughness: .5 });
  const grilleMat = new THREE.MeshStandardMaterial({ map: grilleTex, transparent: true, roughness: .6 });
  const portMat = new THREE.MeshStandardMaterial({ color: 0x141416, roughness: .5 });
  const padRimMat = new THREE.MeshStandardMaterial({ color: 0xb4b6ba, metalness: .8, roughness: .45 });
  const padMat = new THREE.MeshPhysicalMaterial({ color: 0xdcdde0, metalness: .55, roughness: .3, clearcoat: .5, clearcoatRoughness: .2 });
  const hingeMat = new THREE.MeshStandardMaterial({ color: 0x1c1c1f, metalness: .5, roughness: .45 });
  const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x050506, roughness: .18, clearcoat: .6, clearcoatRoughness: .1, envMapIntensity: .22 });
  const dispMat = new THREE.MeshBasicMaterial({ map: wall, color: 0x000000, toneMapped: false });

  /* ---------- scene ---------- */
  host.appendChild(renderer.domElement); host.classList.add('ready');
  const scene = new THREE.Scene();
  { const [c, x] = canvas(1024, 512), g = x.createLinearGradient(0, 0, 0, 512);
    g.addColorStop(0, '#ffffff'); g.addColorStop(.35, '#f1eef0'); g.addColorStop(.5, '#d9d6d9'); g.addColorStop(.75, '#a9a5aa'); g.addColorStop(1, '#8a868c');
    x.fillStyle = g; x.fillRect(0, 0, 1024, 512);
    const eq = new THREE.CanvasTexture(c); eq.mapping = THREE.EquirectangularReflectionMapping; eq.colorSpace = THREE.SRGBColorSpace;
    const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromEquirectangular(eq).texture; pm.dispose(); }
  const cam = new THREE.PerspectiveCamera(30, 1, .1, 100);

  const key = new THREE.DirectionalLight(0xfff0dc, 2.2); key.position.set(3, 6, 4); scene.add(key);
  const rim = new THREE.DirectionalLight(0xffc9e6, 1.0); rim.position.set(-4, 2, -3); scene.add(rim);
  const fill = new THREE.DirectionalLight(0xdfe8ff, .4); fill.position.set(-3, 1, 5); scene.add(fill);
  scene.add(new THREE.HemisphereLight(0xfff6e8, 0x3b1e33, .35));

  const laptop = new THREE.Group(); scene.add(laptop);

  const W = 3.2, BH = .09, BD = 2.26, LT = .045, LD = 2.2;
  const rrShape = (w, h, r, rt = r, rb = r) => { const s = new THREE.Shape(), x = -w / 2, y = -h / 2; s.moveTo(x + rb, y); s.lineTo(x + w - rb, y); if (rb) s.absarc(x + w - rb, y + rb, rb, -Math.PI / 2, 0); s.lineTo(x + w, y + h - rt); if (rt) s.absarc(x + w - rt, y + h - rt, rt, 0, Math.PI / 2); s.lineTo(x + rt, y + h); if (rt) s.absarc(x + rt, y + h - rt, rt, Math.PI / 2, Math.PI); s.lineTo(x, y + rb); if (rb) s.absarc(x + rb, y + rb, rb, Math.PI, Math.PI * 1.5); return s; };
  const slab = (w, d, t, r, bev) => { const g = new THREE.ExtrudeGeometry(rrShape(w - 2 * bev, d - 2 * bev, r), { depth: t - 2 * bev, bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelSegments: 4, curveSegments: 28 }); g.rotateX(-Math.PI / 2); g.translate(0, bev, 0); return g; };
  const flat = (shape, mat, y, z, x = 0) => { const m = new THREE.Mesh(new THREE.ShapeGeometry(shape, 12), mat); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); laptop.add(m); return m; };

  // base
  laptop.add(new THREE.Mesh(slab(W, BD, BH, .12, .014), alu));
  const deck = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.02), deckMat); deck.rotation.x = -Math.PI / 2; deck.position.set(0, BH + .0012, -.5); laptop.add(deck);
  for (const sx of [-1.43, 1.43]) { const g = new THREE.Mesh(new THREE.PlaneGeometry(.19, 1.02), grilleMat); g.rotation.x = -Math.PI / 2; g.position.set(sx, BH + .0012, -.5); laptop.add(g); }
  flat(rrShape(1.36, .8, .05), padRimMat, BH + .0008, .52);
  flat(rrShape(1.345, .785, .045), padMat, BH + .0014, .52);
  const hinge = new THREE.Mesh(new THREE.CylinderGeometry(.038, .038, 2.7, 24), hingeMat); hinge.rotation.z = Math.PI / 2; hinge.position.set(0, BH + .004, -BD / 2 + .045); laptop.add(hinge);
  const port = (side, z, w, h) => { const m = new THREE.Mesh(new THREE.BoxGeometry(.004, h, w), portMat); m.position.set(side * (W / 2 + .001), BH * .5, z); laptop.add(m); };
  port(-1, -.75, .17, .026); port(-1, -.42, .1, .03); port(-1, -.22, .1, .03); port(-1, .55, .05, .05);
  port(1, -.7, .1, .03); port(1, -.35, .16, .036); port(1, .45, .2, .012);

  // lid, with Vita's logo printed on the back
  const lid = new THREE.Group(); lid.position.set(0, BH + .006, -BD / 2 + .04); laptop.add(lid);
  const lidMesh = new THREE.Mesh(slab(W, LD, LT, .12, .01), alu); lidMesh.position.set(0, 0, LD / 2); lid.add(lidMesh);
  { const logoMat = new THREE.MeshStandardMaterial({ transparent: true, opacity: 0, roughness: .4, metalness: 0, toneMapped: false });
    const logo = new THREE.Mesh(new THREE.PlaneGeometry(1.25, 1.25), logoMat);
    // the plane lies on the lid, oriented so the logo reads correctly while the laptop is closed in the hero
    logo.rotation.set(-Math.PI / 2, 0, 0); logo.position.set(0, LT + .0012, LD / 2); lid.add(logo);
    loadImg('Images/logo.png').then((img) => {
      const t = new THREE.Texture(img); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.needsUpdate = true;
      logoMat.map = t; logoMat.opacity = 1; logoMat.alphaTest = .02; logoMat.needsUpdate = true;
      logo.scale.set(1, img.height / img.width, 1);
    }).catch(() => {});
    loadImg('Images/logo-light.png').then((img) => { paintWall(img); wall.needsUpdate = true; }).catch(() => {}); }

  // screen: local x right, y up the screen, z towards the viewer
  const scr = new THREE.Group(); scr.rotation.x = Math.PI / 2; scr.position.set(0, -.0015, LD / 2); lid.add(scr);
  scr.add(new THREE.Mesh(new THREE.ShapeGeometry(rrShape(3.14, 2.16, .1), 16), glassMat));
  const DWU = 3.0, DHU = 1.95, DCY = .035;
  const dispGeo = new THREE.ShapeGeometry(rrShape(DWU, DHU, .05, .05, 0), 12);
  { const p = dispGeo.attributes.position, uv = dispGeo.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / DWU + .5, p.getY(i) / DHU + .5); }
  const disp = new THREE.Mesh(dispGeo, dispMat); disp.position.set(0, DCY, .001); scr.add(disp);
  const notch = new THREE.Mesh(new THREE.ShapeGeometry(rrShape(.32, .075, 0, 0, .03), 8), new THREE.MeshBasicMaterial({ color: 0x050506 })); notch.position.set(0, DCY + DHU / 2 - .0375, .0018); scr.add(notch);
  const camDot = new THREE.Mesh(new THREE.CircleGeometry(.013, 16), new THREE.MeshStandardMaterial({ color: 0x1d1e26, roughness: .15, metalness: .5 })); camDot.position.set(0, DCY + DHU / 2 - .035, .0022); scr.add(camDot);

  // clip planes in screen space, widened during the breakout
  const BOT = -.935, TOP = .795;
  const local = [new THREE.Plane(new THREE.Vector3(1, 0, 0), 1.5), new THREE.Plane(new THREE.Vector3(-1, 0, 0), 1.5), new THREE.Plane(new THREE.Vector3(0, 1, 0), -BOT), new THREE.Plane(new THREE.Vector3(0, -1, 0), TOP)];
  const world = local.map(p => p.clone());

  // card strip: two rows moving in opposite directions
  const CW = 1.38, CH = .92, S = 1.48, N = 10, L = N * S;
  const cardMats = cardTex.map(t => new THREE.MeshBasicMaterial({ map: t, transparent: true, opacity: 0, toneMapped: false, clippingPlanes: world }));
  const strip = new THREE.Group(); strip.position.set(0, 0, .006); scr.add(strip);
  const rows = [{ y: .42, dir: 1, off: 0, items: [] }, { y: -.62, dir: -1, off: .74, items: [] }];   // 1.04 apart: clear gap even at the 1.1x breakout scale
  const cardGeo = new THREE.PlaneGeometry(CW, CH);
  rows.forEach((row, r) => { for (let i = 0; i < N; i++) { const m = new THREE.Mesh(cardGeo, cardMats[r ? (i * 3 + 5) % N : i]); m.position.y = row.y; strip.add(m); row.items.push({ m, x0: i * S }); } });

  /* ---------- scroll choreography ---------- */
  const c01 = v => Math.min(1, Math.max(0, v));
  const prog = el => { const r = el.getBoundingClientRect(); return c01(-r.top / Math.max(1, r.height - innerHeight)); };
  const pass = el => { const r = el.getBoundingClientRect(); return c01((innerHeight - r.top) / (innerHeight + r.height)); };
  const heroOut = () => { const r = SEC.hero.getBoundingClientRect(); return c01(-r.top / r.height); };

  cam.position.set(0, .9, 9.5); cam.lookAt(0, 0, 0);
  let Wv = 1, Hv = 1, mobile = false;
  function resize() {
    const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); mobile = w < 768;
    cam.aspect = w / h; cam.fov = mobile ? 40 : 30; cam.updateProjectionMatrix();
    Hv = 2 * cam.position.length() * Math.tan(cam.fov * Math.PI / 360); Wv = Hv * cam.aspect;
  }
  addEventListener('resize', resize); resize();

  const st = { h: heroOut(), b: prog(SEC.ben), s: prog(SEC.seq), k: pass(SEC.brk) };
  let running = true, last = 0, shownAngle = -1; const t0 = performance.now();
  new IntersectionObserver(es => { const was = running; running = es[0].isIntersecting; if (running && !was) { last = 0; requestAnimationFrame(loop); } })
    .observe(document.getElementById('seqwrap'));

  function loop(now) {
    if (!running) return;
    const t = (now - t0) / 1000, dt = last ? Math.min(.05, (now - last) / 1000) : 0; last = now;
    const tg = { h: heroOut(), b: prog(SEC.ben), s: prog(SEC.seq), k: pass(SEC.brk) };
    for (const k in st) st[k] += (tg[k] - st[k]) * .16;
    const { h, b, s, k } = st, idle = reduce ? 0 : 1;
    const inBen = ss(0, .08, b) * (1 - ss(0, .2, s));
    const inSeq = ss(0, .2, s), drop = ss(.45, 1, k), open = ss(.04, .38, s);

    // position + size as fractions of the screen, so the layout holds at any viewport
    const fx = mobile ? 0 : lerp(.32, 0, ss(0, .85, h));
    let fy = mobile ? lerp(-.3, -.24, ss(0, .9, h)) : lerp(-.03, -.08, h);
    fy = lerp(fy, mobile ? -.14 : -.11, inSeq) - drop * 1.35;
    let size = lerp(mobile ? .56 : .3, mobile ? .5 : .29, ss(0, 1, h));
    size = lerp(size, mobile ? .92 : .48, ss(0, .22, s));
    size *= lerp(1, .72, ss(.3, 1, k));
    const sc = Math.min(size * Wv / 3.2, .64 * Hv / 2.3);
    laptop.scale.setScalar(sc);
    laptop.position.set(fx * Wv / 2, fy * Hv / 2 - lerp(.05, .95, open) * sc + idle * Math.sin(t * 1.1) * .05 * sc * (1 - inSeq), 0);
    laptop.rotation.x = lerp(lerp(.62, .5, h), .14, inSeq);
    laptop.rotation.y = -.55 + idle * Math.sin(t * .6) * .16 * (1 - h) + Math.PI * 2 * ss(.06, .92, b) + .55 * inSeq + Math.PI * 2 * ss(.2, 1, k);
    laptop.rotation.z = .08 * (1 - h) * (1 - inSeq) * (1 - inBen);
    lid.rotation.x = -open * 1.92;

    const power = ss(.3, .42, s), show = ss(.42, .52, s), out = ss(.56, .84, s) * (1 - ss(0, .35, k));
    dispMat.color.setScalar(power);

    // strip motion + breakout
    const speed = reduce ? 0 : .32 * (1 + out * .6);
    rows.forEach(row => { row.off += dt * speed * row.dir; row.items.forEach(it => { it.m.position.x = ((it.x0 + row.off) % L + L) % L - L / 2; }); });
    strip.position.z = .006 + out * .24; strip.scale.setScalar(1 + out * .1);
    cardMats.forEach(m => { m.opacity = show; m.visible = show > .001; });
    const hw = lerp(1.5, 5.1, out);
    local[0].constant = hw; local[1].constant = hw; local[2].constant = lerp(-BOT, 3, out); local[3].constant = lerp(TOP, 3, out);
    scene.updateMatrixWorld();
    world.forEach((w, i) => w.copy(local[i]).applyMatrix4(scr.matrixWorld));

    // lid-angle meter
    const deg = Math.round(open * 1.92 * 180 / Math.PI);
    if (deg !== shownAngle && ui.angle) { shownAngle = deg; ui.angle.textContent = String(deg).padStart(3, '0') + '°'; if (ui.bar) ui.bar.style.width = (open * 100).toFixed(1) + '%'; }

    renderer.render(scene, cam);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}
