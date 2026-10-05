/* Touch-only, opt-in gravity control. Sensor data stays on the device. */
(() => {
  "use strict";
  const control = document.querySelector(".hero-tilt");
  const button = control?.querySelector("[data-tilt-toggle]");
  const status = control?.querySelector("[data-tilt-status]");
  const playground = document.getElementById("heroPhysics");
  if (!control || !button || !playground || !navigator.maxTouchPoints || !matchMedia("(pointer: coarse)").matches) return;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const copy = {
    en: { on: "Tilt to play", off: "Stop tilt", waiting: "Waiting for motion…", denied: "Motion access not allowed.", unavailable: "Motion sensor unavailable.", secure: "Tilt needs HTTPS.", reduced: "Motion is reduced on this device." },
    zh: { on: "倾斜互动", off: "停止倾斜", waiting: "等待手机动作…", denied: "未允许动作传感器访问。", unavailable: "动作传感器不可用。", secure: "倾斜互动需要 HTTPS。", reduced: "设备已开启减少动态效果。" },
  };
  let enabled = false;
  let listening = false;
  let visible = true;
  let message = "";
  let sensorTimer = 0;
  let target = { x: 0, y: 1 };
  const limit = (value) => Math.max(-1.35, Math.min(1.35, value));
  function render() {
    const words = copy[document.documentElement.lang.startsWith("zh") ? "zh" : "en"];
    button.textContent = words[enabled ? "off" : "on"];
    button.setAttribute("aria-pressed", String(enabled));
    status.textContent = words[message] || "";
  }
  function receive(event) {
    const acceleration = event.accelerationIncludingGravity;
    if (!acceleration || !Number.isFinite(acceleration.x) || !Number.isFinite(acceleration.y)) return;
    // Accelerometer axes are portrait-relative and point opposite gravity.
    // CSS y points downward. Rotate into the CURRENT screen orientation.
    const angle = (screen.orientation?.angle ?? window.orientation ?? 0) * Math.PI / 180;
    const x = -acceleration.x / 9.81;
    const y = acceleration.y / 9.81;
    target = { x: limit(x * Math.cos(angle) - y * Math.sin(angle)), y: limit(x * Math.sin(angle) + y * Math.cos(angle)) };
    if (message) { message = ""; clearTimeout(sensorTimer); render(); }
  }
  function sync() {
    const active = enabled && visible && !document.hidden && !reduced.matches
      && !document.body.classList.contains("project-open");
    if (active === listening) return;
    listening = active;
    if (active) {
      window.addEventListener("devicemotion", receive, { passive: true });
      if (message === "waiting") sensorTimer = setTimeout(() => {
        if (message === "waiting") { enabled = false; message = "unavailable"; sync(); render(); }
      }, 5000);
    }
    else {
      window.removeEventListener("devicemotion", receive);
      clearTimeout(sensorTimer);
      target = { x: 0, y: 1 };
    }
  }
  button.addEventListener("click", async () => {
    clearTimeout(sensorTimer);
    if (enabled) { enabled = false; message = ""; sync(); render(); return; }
    if (!window.isSecureContext) { message = "secure"; render(); return; }
    if (reduced.matches) { message = "reduced"; render(); return; }
    if (!window.DeviceMotionEvent) { message = "unavailable"; render(); return; }
    button.disabled = true;
    try {
      // Must execute directly inside the user gesture on iOS; never auto-prompt.
      const permission = typeof DeviceMotionEvent.requestPermission === "function"
        ? await DeviceMotionEvent.requestPermission() : "granted";
      if (permission !== "granted") { message = "denied"; return; }
      enabled = true;
      message = "waiting";
      sync();
    } catch { message = "denied"; }
    finally { button.disabled = false; render(); }
  });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }).observe(playground);
  }
  new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ["class"] });
  new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  document.addEventListener("visibilitychange", sync);
  reduced.addEventListener("change", sync);
  window.addEventListener("pagehide", () => { enabled = false; sync(); });
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
  control.hidden = false;
  render();
})();
