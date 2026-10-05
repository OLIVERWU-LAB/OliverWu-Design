/* Touch-only gravity control, on the existing physics loop. No corner UI.
   Browsers requiring permission use the first real tap on the first paper. */
(() => {
  "use strict";
  const playground = document.getElementById("heroPhysics");
  if (!playground || !navigator.maxTouchPoints || !matchMedia("(pointer: coarse)").matches
    || !window.isSecureContext || !window.DeviceMotionEvent) return;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const needsPermission = typeof DeviceMotionEvent.requestPermission === "function";
  let enabled = !needsPermission;
  let listening = false;
  let visible = true;
  let permissionAttempted = false;
  let target = { x: 0, y: 1 };
  const limit = (value) => Math.max(-1.35, Math.min(1.35, value));
  function receive(event) {
    const acceleration = event.accelerationIncludingGravity;
    if (!acceleration || !Number.isFinite(acceleration.x) || !Number.isFinite(acceleration.y)) return;
    // Accelerometer axes are portrait-relative and point opposite gravity.
    // CSS y points downward. Rotate into the CURRENT screen orientation.
    const angle = (screen.orientation?.angle ?? window.orientation ?? 0) * Math.PI / 180;
    const x = -acceleration.x / 9.81;
    const y = acceleration.y / 9.81;
    target = { x: limit(x * Math.cos(angle) - y * Math.sin(angle)), y: limit(x * Math.sin(angle) + y * Math.cos(angle)) };
  }
  function sync() {
    const active = enabled && visible && !document.hidden && !reduced.matches
      && !document.body.classList.contains("project-open");
    if (active === listening) return;
    listening = active;
    if (active) {
      window.addEventListener("devicemotion", receive, { passive: true });
    }
    else {
      window.removeEventListener("devicemotion", receive);
      target = { x: 0, y: 1 };
    }
  }
  async function authorize(event) {
    if (!event.isTrusted || reduced.matches || !visible || permissionAttempted
      || document.body.classList.contains('project-open')) return;
    permissionAttempted = true;
    try {
      // iOS cannot grant this on page load. Keep the normal system prompt.
      enabled = await DeviceMotionEvent.requestPermission() === 'granted';
      sync();
    } catch { enabled = false; }
    finally { playground.closest('.page-panel-about')?.removeEventListener('click', authorize); }
  }
  if (needsPermission) playground.closest('.page-panel-about')?.addEventListener('click', authorize);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }).observe(playground);
  }
  new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ["class"] });
  document.addEventListener("visibilitychange", sync);
  reduced.addEventListener("change", sync);
  window.addEventListener("pagehide", () => { visible = false; sync(); });
  window.addEventListener("pageshow", () => { visible = true; sync(); });
  window.homeTilt = {
    apply(engine, bodies, delta) {
      const desired = listening ? target : { x: 0, y: 1 };
      const blend = 1 - Math.exp(-Math.min(delta, 40) / 140);
      const dx = (desired.x - engine.gravity.x) * blend;
      const dy = (desired.y - engine.gravity.y) * blend;
      engine.gravity.x += dx;
      engine.gravity.y += dy;
      if (Math.hypot(dx, dy) > .008) bodies.forEach((body) => window.Matter.Sleeping.set(body, false));
    },
  };
  sync();
})();
