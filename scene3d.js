/* ==========================================================================
   scene3d.js — a laptop that opens as you scroll, its screen showing each
   project in turn. Built from plain boxes and planes (three.js r149), no
   external models. Called by home.js via window.VITA3D.init().
   ========================================================================== */
(() => {
  'use strict';
  const T = window.THREE;
  if (!T) return;

  const clamp = (n, a = 0, b = 1) => Math.min(b, Math.max(a, n));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const MAX_ANGLE = 108; // degrees the lid opens to
  const SAME_ORIGIN_OK = location.protocol !== 'file:'; // canvas from file:// images is "tainted"

  const roundRect = (ctx, x, y, w, h, r) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  };

  function init({ el, slides, onFail }) {
    // r149 needs this switched on so hex colours are read as sRGB (otherwise everything renders washed-out)
    if (T.ColorManagement) T.ColorManagement.legacyMode = false;
    let renderer;
    try {
      renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch (e) { onFail && onFail(); return null; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, innerWidth < 700 ? 1.5 : 1.75));
    renderer.outputEncoding = T.sRGBEncoding;
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);
    renderer.domElement.addEventListener('webglcontextlost', (e) => { e.preventDefault(); onFail && onFail(); });

    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(30, 1, 0.1, 100);

    scene.add(new T.HemisphereLight(0xfff4e8, 0x5a1d44, 1.0));
    const key = new T.DirectionalLight(0xffffff, 1.5); key.position.set(3, 5, 4); scene.add(key);
    const rim = new T.DirectionalLight(0xffe386, 0.9); rim.position.set(-4, 2, -3); scene.add(rim);

    /* ---------- laptop ---------- */
    const W = 3.2, D = 2.2, H = 0.12, LT = 0.07, LD = D - 0.08;
    const bodyMat = new T.MeshStandardMaterial({ color: 0x34182c, roughness: 0.5, metalness: 0.15 });
    const group = new T.Group(); scene.add(group);

    const base = new T.Mesh(new T.BoxGeometry(W, H, D), bodyMat);
    base.position.y = H / 2; group.add(base);

    // keyboard (drawn on a canvas)
    const kbCanvas = document.createElement('canvas'); kbCanvas.width = 1024; kbCanvas.height = 512;
    const kc = kbCanvas.getContext('2d');
    kc.fillStyle = '#1c0f19'; kc.fillRect(0, 0, 1024, 512);
    const rows = [14, 14, 13, 12, 8];
    rows.forEach((n, r) => {
      const gap = 8, kw = (1024 - 40 - gap * (n - 1)) / n, kh = 64;
      for (let i = 0; i < n; i++) {
        const w = r === 4 && i === 3 ? kw * 4.2 : kw;
        if (r === 4 && i > 3) break;
        kc.fillStyle = '#2f1727'; roundRect(kc, 20 + i * (kw + gap), 24 + r * (kh + gap), w, kh, 9); kc.fill();
      }
    });
    const kbTex = new T.CanvasTexture(kbCanvas); kbTex.encoding = T.sRGBEncoding; kbTex.anisotropy = 4;
    const kb = new T.Mesh(new T.PlaneGeometry(W - 0.4, (W - 0.4) / 2), new T.MeshStandardMaterial({ map: kbTex, roughness: 0.85 }));
    kb.rotation.x = -Math.PI / 2; kb.position.set(0, H + 0.002, -0.32); group.add(kb);
    const tp = new T.Mesh(new T.PlaneGeometry(1.05, 0.62), new T.MeshStandardMaterial({ color: 0x4d2b42, roughness: 0.45, metalness: 0.25 }));
    tp.rotation.x = -Math.PI / 2; tp.position.set(0, H + 0.002, 0.72); group.add(tp);

    // lid pivots on the back edge
    const hinge = new T.Group(); hinge.position.set(0, H, -D / 2 + 0.04); group.add(hinge);
    const lid = new T.Mesh(new T.BoxGeometry(W, LT, LD), bodyMat); lid.position.set(0, LT / 2, LD / 2); hinge.add(lid);

    // sparkle on the outside of the lid
    const logoC = document.createElement('canvas'); logoC.width = logoC.height = 256;
    const lc = logoC.getContext('2d'); lc.translate(128, 128); lc.fillStyle = '#FFE386';
    lc.beginPath(); lc.moveTo(0, -90); lc.bezierCurveTo(6, -30, 30, -6, 90, 0); lc.bezierCurveTo(30, 6, 6, 30, 0, 90);
    lc.bezierCurveTo(-6, 30, -30, 6, -90, 0); lc.bezierCurveTo(-30, -6, -6, -30, 0, -90); lc.fill();
    const logo = new T.Mesh(new T.PlaneGeometry(0.8, 0.8), new T.MeshBasicMaterial({ map: new T.CanvasTexture(logoC), transparent: true }));
    logo.material.map.encoding = T.sRGBEncoding;
    logo.rotation.x = -Math.PI / 2; logo.position.set(0, LT + 0.002, LD / 2); hinge.add(logo);

    // screen on the inside face (texture is redrawn per slide)
    const SW = 1280, SH = 800;
    const sc = document.createElement('canvas'); sc.width = SW; sc.height = SH;
    const sctx = sc.getContext('2d');
    const screenTex = new T.CanvasTexture(sc); screenTex.encoding = T.sRGBEncoding; screenTex.anisotropy = 4;
    const screen = new T.Mesh(new T.PlaneGeometry(W - 0.22, LD - 0.2), new T.MeshBasicMaterial({ map: screenTex }));
    screen.rotation.x = Math.PI / 2; screen.position.set(0, -0.002, LD / 2); hinge.add(screen);

    // soft contact shadow
    const shC = document.createElement('canvas'); shC.width = shC.height = 256;
    const shx = shC.getContext('2d');
    const gr = shx.createRadialGradient(128, 128, 10, 128, 128, 128);
    gr.addColorStop(0, 'rgba(59,30,51,.38)'); gr.addColorStop(1, 'rgba(59,30,51,0)');
    shx.fillStyle = gr; shx.fillRect(0, 0, 256, 256);
    const shadow = new T.Mesh(new T.PlaneGeometry(W * 1.7, D * 1.9), new T.MeshBasicMaterial({ map: new T.CanvasTexture(shC), transparent: true, depthWrite: false }));
    shadow.rotation.x = -Math.PI / 2; shadow.position.y = -0.003; group.add(shadow);

    /* ---------- slides drawn onto the screen canvas ---------- */
    const imgs = slides.map((s) => {
      if (!s.img || !SAME_ORIGIN_OK) return null;
      const im = new Image(); im.decoding = 'async';
      im.src = s.img;
      im.style.cssText = 'position:fixed;left:0;top:0;width:2px;height:2px;opacity:0.01;pointer-events:none;z-index:-1'; // in the DOM so GIFs keep animating
      document.body.appendChild(im);
      return im;
    });
    const drawSlide = (i, alpha) => {
      const s = slides[i], im = imgs[i];
      sctx.save(); sctx.globalAlpha = alpha;
      if (im && im.complete && im.naturalWidth) {
        const r = Math.max(SW / im.naturalWidth, SH / im.naturalHeight);
        const w = im.naturalWidth * r, h = im.naturalHeight * r;
        sctx.drawImage(im, (SW - w) / 2, (SH - h) / 2, w, h);
      } else {
        // typographic title card
        sctx.fillStyle = s.bg || '#5A1D44'; sctx.fillRect(0, 0, SW, SH);
        sctx.fillStyle = s.fg || '#FFE386';
        sctx.font = '700 150px Khand, "Arial Narrow", Impact, sans-serif'; sctx.textBaseline = 'alphabetic';
        const words = String(s.title).toUpperCase().split(' '), lines = []; let cur = '';
        words.forEach((w) => { const t = cur ? cur + ' ' + w : w; if (sctx.measureText(t).width > SW - 160 && cur) { lines.push(cur); cur = w; } else cur = t; });
        lines.push(cur);
        lines.slice(0, 4).forEach((l, k) => sctx.fillText(l, 80, 190 + k * 140));
        sctx.font = '400 40px "Patrick Hand", cursive'; sctx.fillStyle = s.fg || '#FFE386'; sctx.globalAlpha = alpha * 0.85;
        sctx.fillText(s.tag, 80, SH - 70);
      }
      sctx.restore();
    };
    const state = { p: 0, target: 0, angle: 0, slide: 0, tx: 0, ty: 0, last: 0, lastDrawKey: '' };

    addEventListener('pointermove', (e) => {
      state.tx = (e.clientX / innerWidth - 0.5) * 2; state.ty = (e.clientY / innerHeight - 0.5) * 2;
    }, { passive: true });

    /* ---------- sizing ---------- */
    let aspect = 1;
    const resize = () => {
      const w = Math.max(1, el.clientWidth), h = Math.max(1, el.clientHeight);
      renderer.setSize(w, h, false); aspect = w / h; camera.aspect = aspect; camera.updateProjectionMatrix();
    };
    resize();
    if (window.ResizeObserver) new ResizeObserver(resize).observe(el); else addEventListener('resize', resize);

    const N = slides.length;
    const SLIDES_START = 0.46;
    let fontReady = false;
    if (document.fonts && document.fonts.load) {
      Promise.all([document.fonts.load('700 100px Khand'), document.fonts.load('400 40px "Patrick Hand"')]).then(() => { fontReady = true; state.lastDrawKey = ''; }).catch(() => { fontReady = true; });
    } else fontReady = true;

    function update(p, t, visible) {
      state.target = p;
      state.p += (state.target - state.p) * 0.14;
      const sp = state.p;

      const a = easeInOut(clamp((sp - 0.1) / 0.34));
      state.angle = a * MAX_ANGLE;
      hinge.rotation.x = -(state.angle * Math.PI) / 180;

      const seg = (1 - SLIDES_START) / N;
      const pos = clamp((sp - SLIDES_START) / seg, 0, N - 0.0001);
      const idx = Math.floor(pos), frac = pos - idx;
      state.slide = idx;

      const spin = easeInOut(clamp(sp / 0.44));
      group.rotation.y = lerp(-1.05, 0, spin) + state.tx * 0.07;
      group.rotation.x = state.ty * 0.02;
      group.position.y = Math.sin(t / 900) * 0.025 * (1 - a);

      // frame the laptop: keep it fully visible on narrow screens
      const tanV = Math.tan((camera.fov * Math.PI) / 360);
      const distW = (W * 1.18) / 2 / (tanV * aspect);
      const dist = Math.max(9.6, distW) * (1 - 0.06 * a);
      const shift = aspect > 1.3 ? 1.1 : 0; // nudge right on wide screens so it clears the headline
      camera.position.set(-shift, lerp(2.6, 1.9, a) * (dist / 9.6), dist);
      camera.lookAt(-shift, lerp(0.35, 1.0, a) * (dist / 9.6), 0);

      if (visible) {
        const blend = frac > 0.86 && idx < N - 1 ? (frac - 0.86) / 0.14 : 0;
        const key = [idx, blend.toFixed(2), a > 0.02 ? 1 : 0, fontReady ? 1 : 0].join('|');
        const animated = a > 0.5 && t - state.last > 33; // keep GIFs moving ~30fps
        if (key !== state.lastDrawKey || animated) {
          state.last = t; state.lastDrawKey = key;
          sctx.clearRect(0, 0, SW, SH);
          drawSlide(idx, 1);
          if (blend > 0) drawSlide(idx + 1, easeInOut(blend));
          screenTex.needsUpdate = true;
        }
        renderer.render(scene, camera);
      }
      return { angle: state.angle, slide: idx };
    }

    return { update, resize };
  }

  window.VITA3D = { init };
})();
