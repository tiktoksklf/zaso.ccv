/* Zaso atmospheric effects — stable mobile viewport / scroll animation. */
(function () {
  const stage = document.querySelector('.profile-stage');
  if (!stage) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'zaso-weather';
  canvas.setAttribute('aria-hidden', 'true');
  stage.prepend(canvas);

  const lightning = document.createElement('div');
  lightning.className = 'zaso-lightning';
  lightning.setAttribute('aria-hidden', 'true');
  stage.append(lightning);

  // Mobile browser toolbars expand/collapse during scrolling. Their changing
  // visual viewport used to trigger resize() and *randomize every snowflake*.
  // The large viewport unit is stable while the toolbar moves.
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  if (coarsePointer && window.CSS && window.CSS.supports('height', '100lvh')) {
    canvas.style.height = '100lvh';
    lightning.style.height = '100lvh';
  }

  const ctx = canvas.getContext('2d');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let particles = [], w = 0, h = 0, scale = 0;
  let mode = 'none', frame = 0, raf = 0, bolt = 0;

  function seed() {
    const count = mode === 'snow' ? Math.min(155, Math.floor(w * h / 6500))
      : mode === 'none' ? 0 : Math.min(210, Math.floor(w * h / 4400));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: mode === 'snow' ? 1 + Math.random() * 3 : 0.7 + Math.random(),
      v: mode === 'snow' ? 0.45 + Math.random() * 1.8 : 8 + Math.random() * 9,
      drift: (Math.random() - 0.5) * 0.65,
      alpha: 0.3 + Math.random() * 0.65
    }));
  }

  function resize() {
    const nextScale = Math.min(window.devicePixelRatio || 1, 2);
    const bounds = canvas.getBoundingClientRect();
    const nextW = Math.max(1, Math.round(bounds.width || window.innerWidth));
    const nextH = Math.max(1, Math.round(bounds.height || window.innerHeight));
    if (nextW === w && nextH === h && nextScale === scale) return;

    const oldW = w, oldH = h;
    w = nextW; h = nextH; scale = nextScale;
    canvas.width = Math.round(w * scale);
    canvas.height = Math.round(h * scale);
    ctx.setTransform(scale, 0, 0, scale, 0, 0);

    if (!oldW || !oldH) {
      seed();
    } else {
      // Keep existing flakes rather than teleporting them to random positions.
      // This also protects older mobile browsers without 100lvh support.
      if (w !== oldW) for (const p of particles) p.x = p.x * w / oldW;
      if (h !== oldH && !coarsePointer) {
        for (const p of particles) p.y = p.y * h / oldH;
      }
    }
  }

  function draw() {
    raf = 0;
    if (mode === 'none' || reduced.matches) return;
    ctx.clearRect(0, 0, w, h);
    frame++;
    for (const a of particles) {
      ctx.beginPath();
      if (mode === 'snow') {
        ctx.fillStyle = 'rgba(255,255,255,' + a.alpha + ')';
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctx.fill();
        a.y += a.v;
        a.x += a.drift + Math.sin(frame / 85 + a.y / 45) * 0.2;
      } else {
        ctx.strokeStyle = 'rgba(185,207,255,' + a.alpha * 0.62 + ')';
        ctx.lineWidth = a.r;
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(a.x - 3, a.y + 14 + a.v);
        ctx.stroke();
        a.y += a.v;
        a.x -= 2.6;
      }
      if (a.y > h + 25) { a.y = -25; a.x = Math.random() * w; }
      if (a.x < 0) a.x = w;
      if (a.x > w) a.x = 0;
    }
    if (mode === 'storm' && frame > bolt) {
      bolt = frame + 120 + Math.floor(Math.random() * 240);
      lightning.classList.remove('flash');
      void lightning.offsetWidth;
      lightning.classList.add('flash');
    }
    raf = requestAnimationFrame(draw);
  }

  function setMode(next) {
    mode = ['none', 'snow', 'rain', 'storm'].includes(next) ? next : 'none';
    canvas.style.display = mode === 'none' ? 'none' : '';
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    ctx.clearRect(0, 0, w, h);
    lightning.classList.remove('flash');
    seed();
    if (mode !== 'none' && !reduced.matches) raf = requestAnimationFrame(draw);
  }

  window.ZasoEffects = {
    apply(theme = {}) {
      setMode(theme.weather || 'none');
      stage.classList.toggle('zaso-floating', !!theme.floating);
      stage.classList.toggle('zaso-creator-glow', !!theme.glow);
      stage.classList.toggle('zaso-sparkle', !!theme.sparkle);
    },
    setMode
  };

  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    } else if (!document.hidden && mode !== 'none' && !reduced.matches && !raf) {
      raf = requestAnimationFrame(draw);
    }
  });
  resize();
})();
