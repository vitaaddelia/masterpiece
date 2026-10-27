/* ==========================================================================
   home.js — homepage-only interactions
   loader · scrolling stat circles · rotating word · draggable carousel
   (the 3D laptop lives in scene3d.js, an ES module)
   ========================================================================== */
(() => {
  'use strict';
  const doc = document;
  const root = doc.documentElement;
  const V = window.VITA;
  if (!V) return;
  const $ = (s, c = doc) => c.querySelector(s);
  const $$ = (s, c = doc) => Array.from(c.querySelectorAll(s));
  const clamp = (n, a = 0, b = 1) => Math.min(b, Math.max(a, n));
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  /* ---------------------------- loader ---------------------------- */
  const loader = $('#loader');
  if (loader && root.classList.contains('loading')) {
    const mark = $('.lmark', loader);
    const cols = $$('.odo .col', loader);
    // hundreds column shows blank / 1, tens + ones show 0-9
    const build = (col, digits) => {
      const s = doc.createElement('span');
      digits.forEach((d) => { const i = doc.createElement('i'); i.textContent = d; s.appendChild(i); });
      col.appendChild(s);
    };
    build(cols[0], ['\u00a0', '1']);
    build(cols[1], [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    build(cols[2], [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const setCount = (n) => {
      const h = n >= 100 ? 1 : 0, t = Math.floor((n % 100) / 10), o = n % 10;
      [h, t, o].forEach((d, i) => { cols[i].firstChild.style.transform = `translateY(${-d}em)`; });
    };
    setCount(0);
    let finished = false;
    const finish = () => {
      if (finished) return; finished = true;
      setTimeout(() => {
        loader.classList.add('out');
        setTimeout(() => V.markReady(), 300);
        setTimeout(() => {
          loader.remove(); V.endLoading();
          try { sessionStorage.setItem('vita-loaded', '1'); } catch (e) {}
        }, 900);
      }, 120);
    };
    requestAnimationFrame(() => setTimeout(() => mark && mark.classList.add('in'), 80));
    const DUR = 900, t0 = performance.now();
    const step = (now) => {
      const p = clamp((now - t0) / DUR);
      setCount(Math.round(100 * easeInOut(p)));
      if (p < 1) requestAnimationFrame(step); else finish();
    };
    requestAnimationFrame(step);
    setTimeout(() => { if (!V.ready) { loader.remove(); V.endLoading(); V.markReady(); } }, 7000); // failsafe
  }

  /* ----------------------- stat circles (impact) ----------------------- */
  const imp = $('#impact');
  if (imp) {
    const circs = $$('.circ', imp);
    const fmt = (el, v) => {
      const dec = +el.dataset.dec || 0;
      let s = v.toFixed(dec);
      if (el.dataset.comma) s = Number(s).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
      return (el.dataset.prefix || '') + s + (el.dataset.suffix || '');
    };
    const setVal = (el, p) => { $('.n', el).textContent = fmt(el, +el.dataset.count * easeOut(clamp(p))); };
    const finalize = () => circs.forEach((c) => setVal(c, 1));
    let pinned = false, top = 0, span = 1;
    const measureImp = () => { top = imp.getBoundingClientRect().top + scrollY; span = Math.max(1, imp.offsetHeight - innerHeight); };
    imp.classList.add('is-pinned');          // layout is always the pinned one
    pinned = !V.reduce;                      // but it only animates when motion is allowed
    if (!pinned) finalize();
    addEventListener('resize', measureImp);
    measureImp();
    // counting for the un-pinned layout: run once as each circle scrolls into view
    if ('IntersectionObserver' in window && !V.reduce) {
      const seen = new WeakSet();
      const io = new IntersectionObserver((es) => es.forEach((en) => {
        if (!en.isIntersecting || pinned || seen.has(en.target)) return;
        seen.add(en.target);
        const t0 = performance.now(), el = en.target;
        const run = (now) => { const p = clamp((now - t0) / 1400); setVal(el, p); if (p < 1) requestAnimationFrame(run); };
        setVal(el, 0); requestAnimationFrame(run);
      }), { threshold: 0.6 });
      circs.forEach((c) => { if (!pinned) setVal(c, 0); io.observe(c); });
    }
    V.tick(() => {
      if (!pinned) return;
      const sp = clamp((scrollY - top) / span);
      circs.forEach((c, i) => {
        const start = i * 0.12;
        const local = clamp((sp - start) / 0.38);
        const e = easeOut(local);
        const y = (1 - e) * 70 - sp * 14;                 // rises in, then drifts up a little
        c.style.transform = `translate3d(0, ${y}vh, 0) scale(${0.62 + 0.38 * e}) rotate(${(1 - e) * (i % 2 ? 14 : -14)}deg)`;
        c.style.opacity = String(clamp(local * 3));
        setVal(c, (sp - start - 0.06) / 0.36);
      });
    });
  }

  /* --------------------------- rotating word --------------------------- */
  const rot = $('.rot');
  if (rot) {
    const g = $('.g', rot), words = $$('.g span', rot);
    let i = 0;
    const apply = () => {
      rot.style.width = words[i].getBoundingClientRect().width + 'px';
      g.style.transform = `translateY(${-i * 0.9}em)`;
    };
    apply();
    (doc.fonts && doc.fonts.ready ? doc.fonts.ready : Promise.resolve()).then(apply);
    addEventListener('resize', apply);
    if (!V.reduce) setInterval(() => { i = (i + 1) % words.length; apply(); }, 2300);
  }

  /* ------------------------ draggable carousel ------------------------ */
  const wrap = $('.exp-wrap');
  if (wrap) {
    const track = $('.exp-track', wrap);
    const originals = Array.from(track.children);
    for (let k = 0; k < 2; k++) originals.forEach((c) => {
      const cl = c.cloneNode(true); cl.setAttribute('aria-hidden', 'true'); track.appendChild(cl);
    });
    let x = 0, v = 0, dragging = false, lastX = 0, setW = 1, hovering = false;
    const measureC = () => {
      const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0;
      setW = originals.length * (originals[0].offsetWidth + gap);
    };
    const wrapX = () => { while (x <= -setW) x += setW; while (x > 0) x -= setW; };
    measureC(); addEventListener('resize', measureC);
    wrap.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      dragging = true; lastX = e.clientX; v = 0; wrap.classList.add('drag');
      try { wrap.setPointerCapture(e.pointerId); } catch (_) {}
    });
    wrap.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - lastX; lastX = e.clientX; x += dx; v = dx; wrapX();
    });
    const end = () => { dragging = false; wrap.classList.remove('drag'); };
    wrap.addEventListener('pointerup', end); wrap.addEventListener('pointercancel', end);
    wrap.addEventListener('mouseenter', () => { hovering = true; });
    wrap.addEventListener('mouseleave', () => { hovering = false; });
    const nudge = (dir) => { v = dir * 24; };
    const prev = $('.exp-ctrl .prev'), next = $('.exp-ctrl .next');
    prev && prev.addEventListener('click', () => nudge(1));
    next && next.addEventListener('click', () => nudge(-1));
    V.tick(() => {
      if (!dragging) {
        x += v; v *= 0.93;
        if (Math.abs(v) < 0.08) { v = 0; if (!V.reduce && !hovering) x -= 0.4; }
        wrapX();
      }
      track.style.transform = `translate3d(${x}px,0,0)`;
    });
  }

})();

/* ---------- project cards: colour fill grows from the cursor; title letters roll ---------- */
(() => {
  document.querySelectorAll('.proj').forEach((card) => {
    const media = card.querySelector('.proj-media');
    if (media) media.addEventListener('pointerenter', (e) => {
      const r = media.getBoundingClientRect();
      media.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
      media.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
    });
    const h = card.querySelector('.proj-meta h3');
    if (!h || h.dataset.rolled) return;
    const text = h.textContent; h.dataset.rolled = '1';
    h.setAttribute('aria-label', text);
    h.innerHTML = '';
    let i = 0;
    text.split(' ').forEach((word, wi) => {
      if (wi) h.appendChild(document.createTextNode(' '));      // lines break between words, never inside one
      const wordEl = document.createElement('span'); wordEl.style.whiteSpace = 'nowrap'; wordEl.setAttribute('aria-hidden', 'true');
      [...word].forEach((ch) => {
        const w = document.createElement('span'); w.className = 'tl'; w.style.setProperty('--i', i++);
        const a = document.createElement('span'); const b = document.createElement('span');
        a.textContent = b.textContent = ch;
        w.append(a, b); wordEl.appendChild(w);
      });
      h.appendChild(wordEl);
    });
  });
})();
