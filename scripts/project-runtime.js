/* One lifecycle for every case study: move first, then activate visible media.
   No iframe player or video decoder is created during the sheet transition. */
(() => {
  const layer = document.getElementById('projectDetail');
  const scroller = document.getElementById('projectScroller');
  const sheet = scroller?.querySelector('.project-sheet');
  if (!sheet) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const media = new Set();
  const visible = new WeakSet();
  const animations = new Map();
  const chapters = new Set();
  const frameActivity = new WeakMap();
  let phase = 'closed', timer = 0, raf = 0, generation = 0, previousTime = 0;
  let onArrival = null;
  const eligible = () => phase === 'idle' && !document.hidden;
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) visible.add(entry.target);
      else visible.delete(entry.target);
      if (chapters.has(entry.target)) entry.target.toggleAttribute('data-runtime-visible', entry.isIntersecting);
      syncMedia(entry.target);
    }
    schedule();
  }, { root: scroller, rootMargin: '180px 0px', threshold: .01 });

  function syncMedia(node) {
    if (!node.isConnected || !media.has(node)) return;
    const active = eligible() && visible.has(node);
    if (active && node.dataset.projectMediaSrc && !node.hasAttribute('src')) {
      node.src = node.dataset.projectMediaSrc;
    }
    if (node.tagName === 'VIDEO') {
      if (active && !reduced.matches && node.dataset.visibilityManaged === 'true') node.play().catch(() => {});
      else node.pause();
    }
    if (node.tagName === 'AUDIO' && !eligible()) node.pause();
    if (node.tagName === 'IFRAME' && node.hasAttribute('src')) {
      if (!active && frameActivity.get(node) !== false) pauseFrame(node);
      frameActivity.set(node, active);
    }
  }

  function pauseFrame(frame) {
    try {
      const url = new URL(frame.src);
      // Use the providers' message bridge, without adding another player SDK.
      if (url.hostname === 'player.vimeo.com') frame.contentWindow?.postMessage({ method: 'pause' }, url.origin);
      else if (url.hostname === 'w.soundcloud.com') frame.contentWindow?.postMessage(JSON.stringify({ method: 'pause', value: null }), url.origin);
      else if (['www.youtube.com','www.youtube-nocookie.com'].includes(url.hostname)) {
        frame.contentWindow?.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }), url.origin);
      }
    } catch { /* A not-yet-loaded or blocked embed is released on reset. */ }
  }

  function schedule() {
    if (raf || !eligible() || reduced.matches) return;
    if ([...animations.keys()].some(node => node.isConnected && visible.has(node))) raf = requestAnimationFrame(tick);
  }
  function tick(time) {
    raf = 0;
    if (!eligible() || reduced.matches) return;
    const delta = previousTime ? Math.min(40, time - previousTime) : 0;
    previousTime = time;
    for (const [node, entry] of animations) {
      if (!node.isConnected) { entry.dispose?.(); animations.delete(node); observer.unobserve(node); continue; }
      if (visible.has(node)) entry.callback(time, delta);
    }
    schedule();
  }
  function refresh() {
    layer.dataset.runtimeVisibility = document.hidden ? 'hidden' : 'visible';
    media.forEach(syncMedia);
    if (eligible() && reduced.matches) {
      animations.forEach((entry, node) => { if (node.isConnected && visible.has(node)) entry.callback(performance.now(), 0); });
    }
    if (!eligible() || reduced.matches) {
      cancelAnimationFrame(raf); raf = 0; previousTime = 0;
    } else schedule();
  }
  function begin(next) {
    generation += 1;
    clearTimeout(timer); timer = 0; onArrival = null;
    phase = next;
    layer.dataset.runtime = next;
    refresh();
  }
  function reset() {
    observer.disconnect();
    for (const node of media) {
      if (node.tagName === 'VIDEO' || node.tagName === 'AUDIO') node.pause();
      node.removeAttribute('src');
      node.removeAttribute('data-project-media-src');
      if (node.tagName === 'VIDEO' || node.tagName === 'AUDIO') node.load();
    }
    media.clear();
    chapters.clear();
    animations.forEach(entry => entry.dispose?.()); animations.clear();
    cancelAnimationFrame(raf); raf = 0; previousTime = 0;
  }
  function source(node, url) {
    if (!url) { node.removeAttribute('src'); delete node.dataset.projectMediaSrc; return; }
    if (node.tagName === 'IFRAME' && /^https:\/\/www\.youtube(?:-nocookie)?\.com\/embed\//.test(url)) {
      const playerUrl = new URL(url);
      playerUrl.searchParams.set('enablejsapi', '1');
      playerUrl.searchParams.set('origin', location.origin);
      url = playerUrl.href;
    }
    node.dataset.projectMediaSrc = url;
    if (node.tagName === 'VIDEO') {
      node.autoplay = false; node.removeAttribute('autoplay'); node.preload = 'none';
    }
    media.add(node); observer.observe(node);
    syncMedia(node);
  }
  function bind(video) {
    video.dataset.visibilityManaged = 'true';
    video.autoplay = false; video.removeAttribute('autoplay');
    video.preload = 'none';
    media.add(video); observer.observe(video);
    syncMedia(video);
  }
  function arrive() {
    if (phase !== 'entering') return;
    clearTimeout(timer); timer = 0;
    phase = 'idle'; layer.dataset.runtime = 'idle';
    const callback = onArrival; onArrival = null;
    callback?.();
    // Allow the final compositor frame to finish before starting decoders.
    const token = generation;
    requestAnimationFrame(() => { if (token === generation) refresh(); });
  }
  function enter(immediate, callback) {
    begin('entering'); onArrival = callback;
    sheet.querySelectorAll('.project-chapter,.sound-project').forEach(node => {
      chapters.add(node); observer.observe(node);
    });
    if (immediate || reduced.matches) { arrive(); return; }
    // transitionend is authoritative; the fallback covers browser interruption.
    timer = setTimeout(arrive, 840);
  }
  scroller.addEventListener('transitionend', event => {
    if (event.target === scroller && event.propertyName === 'transform') arrive();
  });
  document.addEventListener('visibilitychange', refresh);
  reduced.addEventListener('change', refresh);
  window.projectRuntime = {
    begin, reset, source, bind, enter, refresh,
    get phase() { return phase; },
    animate(node, callback, dispose) {
      animations.set(node, { callback, dispose }); observer.observe(node); schedule();
    },
  };
  layer.dataset.runtime = phase;
})();
