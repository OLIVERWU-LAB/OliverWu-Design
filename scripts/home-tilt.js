/* Screen-space gravity from pose, not platform-dependent accelerometer signs.
   Reuses Matter's existing loop. No telemetry, polling, or tilt button. */
(() => {
  "use strict";
  const playground = document.getElementById("heroPhysics");
  if (!playground || !navigator.maxTouchPoints || !matchMedia("(pointer: coarse)").matches
    || !window.isSecureContext || !window.DeviceOrientationEvent) return;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const needsPermission = typeof DeviceOrientationEvent.requestPermission === "function";
  // Registering a listener never grants permission. A previously granted
  // browser can deliver immediately; otherwise iOS waits for a trusted tap.
  let enabled = true;
  let listening = false;
  let visible = true;
  let permissionAttempted = false;
  let target = { x: 0, y: 1 };
  function receive(event) {
    if (!Number.isFinite(event.beta) || !Number.isFinite(event.gamma)) return;
    const beta = event.beta * Math.PI / 180;
    const gamma = event.gamma * Math.PI / 180;
    const angle = (screen.orientation?.angle ?? window.orientation ?? 0) * Math.PI / 180;
    // Project world-down onto device X/Y, then rotate into current CSS axes.
    const x = Math.cos(beta) * Math.sin(gamma), y = Math.sin(beta);
    target = { x:x * Math.cos(angle) + y * Math.sin(angle), y:-x * Math.sin(angle) + y * Math.cos(angle) };
  }
  function sync() {
    const active = enabled && visible && !document.hidden && !reduced.matches
      && !document.body.classList.contains("project-open") && !document.querySelector('dialog[open]');
    if (active === listening) return;
    listening = active;
    target = { x:0, y:1 };
    if (active) {
      window.addEventListener("deviceorientation", receive, { passive: true });
    }
    else {
      window.removeEventListener("deviceorientation", receive);
      target = { x: 0, y: 1 };
    }
  }
  async function authorize(event) {
    if (!event.isTrusted || reduced.matches || !visible || permissionAttempted
      || document.body.classList.contains('project-open')) return;
    permissionAttempted = true;
    window.removeEventListener('pointerup', authorize, true);
    try {
      // iOS cannot grant this on page load. Keep the normal system prompt.
      enabled = await DeviceOrientationEvent.requestPermission() === 'granted';
      sync();
    } catch { enabled = false; }
  }
  if (needsPermission) window.addEventListener('pointerup', authorize, { capture:true, passive:true });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }).observe(playground);
  }
  new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ["class"] });
  const dialog = document.getElementById('resumePicker');
  if (dialog) new MutationObserver(sync).observe(dialog, { attributes:true, attributeFilter:['open'] });
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
