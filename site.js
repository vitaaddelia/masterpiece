/* ==========================================================================
   site.js — interactions shared by every page
   smooth scroll · split-word reveals · rolling-letter buttons · nav tone
   full-screen menu · copy-to-clipboard · "read case study" pill · cursor trail
   Everything degrades gracefully: no JS = a normal, readable page.
   Respects prefers-reduced-motion.
   ========================================================================== */
(() => {
  'use strict';
  const doc = document;
  const root = doc.documentElement;
  const $ = (s, c = doc) => c.querySelector(s);
  const $$ = (s, c = doc) => Array.from(c.querySelectorAll(s));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  const V = (window.VITA = {
    reduce, fine, lenis: null, ready: false, ticks: [],
    tick(fn) { this.ticks.push(fn); },
    zones: [],
    isDarkAt(docY) { return this.zones.some(([a, b]) => docY >= a && docY <= b); },
  });

  /* ---------- smooth scroll (Lenis) + one shared animation loop ---------- */
  if (!reduce && window.Lenis) {
    try { V.lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true }); } catch (e) { V.lenis = null; }
  }
  const loop = (t) => {
    if (V.lenis) V.lenis.raf(t);
    for (let i = 0; i < V.ticks.length; i++) V.ticks[i](t);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  const scrollToY = (y, dur = 1.2) => {
    if (V.lenis) V.lenis.scrollTo(y, { duration: dur });
    else scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
  };

  /* ---------- menu ---------- */
  const menu = $('#menu');
  const menuBtn = $('#menuBtn');
  const setMenu = (open) => {
    if (!menu || !menuBtn) return;
    root.classList.toggle('menu-on', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-hidden', String(!open));
    if (open) menu.removeAttribute('inert'); else menu.setAttribute('inert', '');
    if (V.lenis) open ? V.lenis.stop() : V.lenis.start();
    if (open) setTimeout(() => { const a = $('a', menu); a && a.focus({ preventScroll: true }); }, 350);
  };
  if (menu && menuBtn) {
    menu.setAttribute('inert', '');
    menuBtn.addEventListener('click', () => setMenu(!root.classList.contains('menu-on')));
    doc.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && root.classList.contains('menu-on')) { setMenu(false); menuBtn.focus(); }
    });
  }

  /* ---------- same-page anchors (smooth, offset for the fixed nav) ---------- */
  doc.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const go = () => {
      if (id === '#top') return scrollToY(0);
      const el = $(id);
      if (el) scrollToY(el.getBoundingClientRect().top + scrollY - 70);
    };
    e.preventDefault();
    if (root.classList.contains('menu-on')) { setMenu(false); setTimeout(go, 450); } else go();
  });

  /* ---------- nav tone: flips to light-on-dark over dark bands ---------- */
  const nav = $('#nav');
  const measure = () => {
    V.zones = $$('section[data-tone="dark"]').map((el) => {
      const r = el.getBoundingClientRect();
      return [r.top + scrollY, r.bottom + scrollY];
    });
  };
  const toneTick = () => { if (nav) nav.classList.toggle('dark', V.isDarkAt(scrollY + 38)); };
  addEventListener('resize', measure);
  addEventListener('load', measure);
  if (window.ResizeObserver) { const m = $('main'); if (m) new ResizeObserver(measure).observe(m); }
  measure();
  V.tick(toneTick);
  V.measure = measure;

  /* ---------- split-word text + rise reveals ---------- */
  const splitEl = (el) => {
    if (el.dataset.splitDone) return;
    el.dataset.splitDone = '1';
    const full = el.textContent.replace(/\s+/g, ' ').trim();
    let i = 0;
    const walk = (node) => {
      Array.from(node.childNodes).forEach((n) => {
        if (n.nodeType === 3) {
          const frag = doc.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((tok) => {
            if (!tok) return;
            if (/^\s+$/.test(tok)) { frag.appendChild(doc.createTextNode(' ')); return; }
            const w = doc.createElement('span'); w.className = 'w'; w.setAttribute('aria-hidden', 'true');
            const s = doc.createElement('span'); s.textContent = tok; s.style.setProperty('--i', i++);
            w.appendChild(s); frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
      });
    };
    walk(el);
    el.setAttribute('aria-label', full);
  };
  $$('[data-split]').forEach(splitEl);

  const startReveals = () => {
    const targets = $$('[data-split], [data-rise]');
    if (reduce || !('IntersectionObserver' in window)) { targets.forEach((t) => t.classList.add('in')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
    targets.forEach((t) => io.observe(t));
  };

  V.markReady = () => {
    if (V.ready) return;
    V.ready = true;
    root.classList.add('ready');
    startReveals();
  };
  V.endLoading = () => root.classList.remove('loading');
  if (!root.classList.contains('loading')) {
    if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', () => V.markReady());
    else V.markReady();
  }

  /* ---------- rolling-letter buttons ---------- */
  $$('.rbtn .lbl').forEach((lbl) => {
    const text = lbl.textContent.trim();
    lbl.setAttribute('aria-hidden', 'true');
    lbl.textContent = '';
    lbl.className = 'word';
    Array.from(text).forEach((c, i) => {
      const ch = doc.createElement('span'); ch.className = 'ch'; ch.style.setProperty('--i', i);
      const a = doc.createElement('span'); a.textContent = c === ' ' ? '\u00a0' : c;
      ch.append(a, a.cloneNode(true)); lbl.appendChild(ch);
    });
    const btn = lbl.closest('.rbtn');
    if (!btn.getAttribute('aria-label')) btn.setAttribute('aria-label', text);
  });

  /* ---------- circle buttons: fill grows from where the cursor enters ---------- */
  $$('.cbtn').forEach((b) => {
    const set = (e) => {
      const r = b.getBoundingClientRect();
      b.style.setProperty('--x', e.clientX - r.left + 'px');
      b.style.setProperty('--y', e.clientY - r.top + 'px');
    };
    b.addEventListener('pointerenter', set);
    b.addEventListener('pointerleave', set);
  });

  /* ---------- "read case study" pill follows the cursor ----------
     Eased with requestAnimationFrame + transform (GPU), so it glides instead of
     snapping; it grows in, shrinks out, and leans a little in the direction you move. */
  $$('.has-pill').forEach((card) => {
    const pill = $('.pill', card);
    if (!pill || !fine) return;
    pill.classList.add('follow');
    let tx = 0, ty = 0, x = 0, y = 0, s = 0, ts = 0, rot = 0, cx = 0, cy = 0, inside = false, raf = 0, last = 0;
    const FOLLOW = reduce ? 1 : 0.16, GROW = reduce ? 1 : 0.14;
    // time-based easing: feels the same on 60 Hz and 120 Hz screens
    const ease = (k, dt) => 1 - Math.pow(1 - k, dt / 16.667);
    const loop = (now) => {
      const dt = last ? Math.min(250, now - last) : 16.667; last = now;
      const f = ease(FOLLOW, dt), g = ease(GROW, dt);
      x += (tx - x) * f; y += (ty - y) * f; s += (ts - s) * g;
      const lean = reduce ? 0 : Math.max(-10, Math.min(10, (tx - x) * 0.12));
      rot += (lean - rot) * ease(0.2, dt);
      pill.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) translate(-50%, -50%) rotate(${rot.toFixed(2)}deg) scale(${s.toFixed(3)})`;
      const busy = Math.abs(tx - x) > 0.2 || Math.abs(ty - y) > 0.2 || Math.abs(ts - s) > 0.002 || Math.abs(rot) > 0.05;
      raf = busy ? requestAnimationFrame(loop) : 0;
      if (!busy) last = 0;
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
    const aim = () => { const r = card.getBoundingClientRect(); tx = cx - r.left; ty = cy - r.top; };
    card.addEventListener('pointerenter', (e) => {
      cx = e.clientX; cy = e.clientY; aim(); inside = true;
      if (s < 0.05) { x = tx; y = ty; }          // appear right under the cursor, then grow
      ts = 1; pill.style.opacity = '1'; kick();
    });
    card.addEventListener('pointermove', (e) => { cx = e.clientX; cy = e.clientY; aim(); kick(); });
    card.addEventListener('pointerleave', (e) => {
      cx = e.clientX; cy = e.clientY; aim(); inside = false;
      ts = 0; pill.style.opacity = '0'; kick();
    });
    // keep it under the cursor if the page scrolls while hovering
    addEventListener('scroll', () => { if (inside) { aim(); kick(); } }, { passive: true });
  });

  /* ---------- copy email ---------- */
  $$('[data-copy]').forEach((b) => {
    b.addEventListener('click', async () => {
      const text = b.dataset.copy;
      try { await navigator.clipboard.writeText(text); }
      catch (e) {
        const ta = doc.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
        doc.body.appendChild(ta); ta.select(); try { doc.execCommand('copy'); } catch (_) {} ta.remove();
      }
      const tip = $('.tip', b);
      if (tip) { tip.classList.add('on'); setTimeout(() => tip.classList.remove('on'), 1400); }
    });
  });

  /* ---------- cursor trail (mouse only, skipped for reduced motion) ---------- */
  if (fine && !reduce) {
    const c = doc.createElement('canvas');
    c.id = 'trail'; c.setAttribute('aria-hidden', 'true');
    doc.body.appendChild(c);
    const ctx = c.getContext('2d');
    let w = 0, h = 0;
    const size = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = innerWidth; h = innerHeight;
      c.width = w * dpr; c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size(); addEventListener('resize', size);
    const pts = [];
    let lastTone = 'light';
    addEventListener('pointermove', (e) => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      pts.push({ x: e.clientX, y: e.clientY, t: performance.now() });
      if (pts.length > 36) pts.shift();
      lastTone = V.isDarkAt(scrollY + e.clientY) ? 'dark' : 'light';
    }, { passive: true });
    const LIFE = 420;
    V.tick(() => {
      const now = performance.now();
      while (pts.length && now - pts[0].t > LIFE) pts.shift();
      ctx.clearRect(0, 0, w, h);
      if (pts.length < 2) return;
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.strokeStyle = lastTone === 'dark' ? '#FFE386' : '#9B3A6E';
      for (let i = 1; i < pts.length; i++) {
        const age = (now - pts[i].t) / LIFE;
        ctx.globalAlpha = Math.max(0, (1 - age) * 0.4);
        ctx.lineWidth = Math.max(1, (1 - age) * 9);
        ctx.beginPath(); ctx.moveTo(pts[i - 1].x, pts[i - 1].y); ctx.lineTo(pts[i].x, pts[i].y); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    });
  }
})();
