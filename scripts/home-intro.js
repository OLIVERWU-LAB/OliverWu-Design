/* First-view readiness only. Waiting letters use CSS transforms, not another
   RAF. Physics starts on the paper's entry frame. */
(() => {
  const root = document.documentElement;
  const intro = document.getElementById('homeIntro');
  const pending = root.classList.contains('boot-pending');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  // No decorative download in the initial HTML. Preload behind the flat
  // greeting, decode before entry, and reveal it with the first paper.
  document.querySelectorAll('[data-backdrop-src]').forEach(image => {
    image.src = image.dataset.backdropSrc;
    image.removeAttribute('data-backdrop-src');
  });
  const critical = [...new Map([...document.querySelectorAll('#heroPhysics img,.backdrop-planet,.backdrop-ground')]
    .map(image => [image.currentSrc || image.src, image])).values()];
  const shell = document.querySelector('.site-shell');
  const arrival = shell?.querySelector('.page-panel-about') || shell;
  let finished = !pending;
  root.classList.add('cover-lazy-enabled');

  // Offscreen home cards must not compete with the falling objects' download.
  const covers = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      entry.target.removeAttribute('data-cover-pending'); covers.unobserve(entry.target);
    }
  }, { rootMargin:'400px 0px', threshold:0 });
  const observeCovers = () => document.querySelectorAll('.case-card[data-cover-pending]').forEach(card => covers.observe(card));
  if (!pending) { observeCovers(); intro?.remove(); return; }
  // Cancel a native smooth fragment scroll that may have started before the
  // early head script removed the URL hash. One reset, no scroll polling.
  window.scrollTo({ top: 0, behavior: 'instant' });
  window.addEventListener('load', () => {
    if (!finished) window.scrollTo({ top: 0, behavior: 'instant' });
  }, { once: true });
  shell.inert = true;
  const chinese = root.lang === 'zh-CN';
  const greeting = chinese ? '你好！我是设计师 Oliver Wu。' : "Hi! I'm Designer Oliver Wu.";
  const copy = intro.querySelector('[data-intro-copy]');
  copy.textContent = '';
  copy.setAttribute('aria-label', greeting);
  const letters = [...greeting];
  for (const [index, letter] of letters.entries()) {
    const glyph = document.createElement('span');
    glyph.className = 'intro-glyph';
    glyph.setAttribute('aria-hidden', 'true');
    glyph.style.setProperty('--glyph-index', index);
    glyph.textContent = letter;
    copy.append(glyph);
  }
  intro.setAttribute('aria-label', chinese ? '正在准备作品集' : 'Preparing portfolio');
  let assetsReady = false;
  const pauseLetters = () => intro.classList.toggle('intro-paused', document.hidden);
  document.addEventListener('visibilitychange', pauseLetters);
  pauseLetters();

  function imageReady(img) {
    img.fetchPriority = 'high';
    const loaded = img.complete ? Promise.resolve() : new Promise(resolve => {
      img.addEventListener('load', resolve, {once:true});
      img.addEventListener('error', resolve, {once:true});
    });
    return loaded.then(async () => {
      if (!img.naturalWidth) return false;
      try { await img.decode?.(); return true; } catch { return false; }
    });
  }
  const fontJobs = document.fonts ? [
    document.fonts.load('400 24px "Monument Extended"'),
    document.fonts.load('800 24px "Monument Extended"'),
    // The user selected one complete Chinese face, including the language tab.
    document.fonts.load('400 24px "ZaoZiGongFang YuanHei"', chinese ? greeting : '中'),
  ] : [Promise.resolve(),Promise.resolve(),Promise.resolve()];
  const fonts = Promise.all(fontJobs.map(job => job.catch(() => [])));
  const images = Promise.all(critical.map(imageReady));
  const ready = Promise.all([images, fonts]).then(([statuses]) => statuses.every(Boolean) ? 'loaded' : 'partial');
  root.dataset.bootPhase = 'loading';
  const started = window.portfolioBootStarted || performance.now();
  const writing = (async () => {
    // Start with the final font where possible; a failed font never blocks entry.
    const writingFace = fontJobs[chinese ? 2 : 1].catch(() => []);
    await Promise.race([writingFace, sleep(2500)]);
    if (finished) return;
    intro.classList.add('intro-writing');
    await sleep(reduced.matches ? 0 : (letters.length - 1) * 40 + 200 + 150);
    if (finished) return;
    intro.classList.remove('intro-writing');
    intro.classList.add('intro-written');
    root.dataset.bootWriting = 'complete';
    if (!assetsReady && !reduced.matches) intro.classList.add('intro-waiting');
  })();

  function finish() {
    if (finished) return;
    finished = true;
    document.removeEventListener('visibilitychange', pauseLetters);
    intro.classList.remove('intro-waiting');
    clearTimeout(window.portfolioBootFallback);
    root.classList.remove('boot-pending', 'boot-entering');
    root.dataset.bootPhase = 'ready';
    root.dataset.bootDurationMs = String(Math.round(performance.now() - started));
    shell.inert = false;
    intro.remove();
    observeCovers();
    document.dispatchEvent(new Event('portfolio:boot-ready'));
  }
  document.addEventListener('portfolio:boot-ready', () => {
    // Also release inert if the early-script watchdog wins.
    if (!finished) finish();
  }, {once:true});
  async function reveal() {
    let timeout;
    const outcome = await Promise.race([ready, new Promise(resolve => { timeout = setTimeout(() => resolve('timeout'), 14000); })]);
    clearTimeout(timeout);
    assetsReady = true;
    if (finished) return;
    root.dataset.bootAssets = outcome;
    await writing;
    await sleep(Math.max(0, 800 - (performance.now() - started)));
    if (finished) return;
    // Two rendering turns commit the initial hidden state without a layout read.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (finished) return;
      // Readiness wins immediately; never wait for a full wave or its rest.
      intro.classList.remove('intro-waiting');
      window.scrollTo({ top: 0, behavior: 'instant' });
      document.dispatchEvent(new Event('portfolio:boot-enter'));
      root.classList.replace('boot-pending', 'boot-entering');
      root.dataset.bootPhase = 'entering';
      root.dataset.bootRevealMs = String(Math.round(performance.now() - started));
      if (reduced.matches) { finish(); return; }
      const arrived = event => {
        if (event.target === arrival && event.animationName === 'home-arrival') {
          arrival.removeEventListener('animationend', arrived); finish();
        }
      };
      arrival.addEventListener('animationend', arrived);
      setTimeout(() => { arrival.removeEventListener('animationend', arrived); finish(); }, 800);
    }));
  }
  reveal();
})();
