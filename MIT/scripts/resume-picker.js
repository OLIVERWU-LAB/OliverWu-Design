(() => {
  const trigger = document.querySelector('[data-resume-open]');
  const dialog = document.getElementById('resumePicker');
  const closeButton = dialog?.querySelector('[data-resume-close]');
  if (!trigger || !dialog || !closeButton) return;
  const cursor = document.getElementById('cursorDot');
  const cursorParent = cursor?.parentNode;
  const cursorNext = cursor?.nextSibling;
  const noise = dialog.querySelector('.resume-picker-noise');
  const noiseContext = noise.getContext('2d');
  const surface = dialog.querySelector('.resume-picker-surface');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let animation = 0;
  let lastFrame = -Infinity;

  function paintNoise(time) {
    if (!dialog.open) return;
    if (time - lastFrame >= 30) {
      const width = Math.ceil(surface.clientWidth);
      const height = Math.ceil(surface.clientHeight);
      if (noise.width !== width || noise.height !== height) {
        noise.width = width;
        noise.height = height;
      }
      noiseContext.clearRect(0, 0, width, height);
      window.drawBaseGrain(time, noiseContext, width, height);
      lastFrame = time;
    }
    if (!reducedMotion.matches) animation = requestAnimationFrame(paintNoise);
  }

  function refreshNoise() {
    cancelAnimationFrame(animation);
    lastFrame = -Infinity;
    if (dialog.open) animation = requestAnimationFrame(paintNoise);
  }
  new ResizeObserver(refreshNoise).observe(surface);
  reducedMotion.addEventListener('change', refreshNoise);

  trigger.addEventListener('click', () => {
    if (!dialog.open) dialog.showModal();
    // Native dialogs occupy the browser's top layer; move the existing pen into it.
    if (cursor) dialog.append(cursor);
    dialog.focus({ preventScroll: true });
    refreshNoise();
  });

  dialog.addEventListener('close', () => {
    cancelAnimationFrame(animation);
    if (cursor && cursorParent) cursorParent.insertBefore(cursor, cursorNext);
    trigger.focus({ preventScroll: true });
  });

  closeButton.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
  dialog.querySelectorAll('a[download]').forEach(link => {
    link.addEventListener('click', () => dialog.close());
  });
})();
