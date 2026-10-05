(() => {
  "use strict";

  const TAU = Math.PI * 2;
  const SAMPLES = 4096;
  const CYCLE = 6600;
  const DELAYS = [0, 62, 129, 183, 254, 312, 387, 449];
  const TIMES = { start: 300, settle: 4900, rest: 5450 };
  const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
  const number = (value, fallback = 0) => Number.isFinite(parseFloat(value)) ? parseFloat(value) : fallback;
  const smooth = (t) => t * t * t * (10 + t * (-15 + 6 * t));

  function convexHull(points) {
    points.sort((a, b) => a.x - b.x || a.y - b.y);
    const cross = (a, b, c) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
    const lower = [];
    const upper = [];
    for (const point of points) {
      while (lower.length > 1 && cross(lower[lower.length - 2], lower[lower.length - 1], point) <= 0) lower.pop();
      lower.push(point);
    }
    for (let i = points.length - 1; i >= 0; i--) {
      const point = points[i];
      while (upper.length > 1 && cross(upper[upper.length - 2], upper[upper.length - 1], point) <= 0) upper.pop();
      upper.push(point);
    }
    lower.pop();
    upper.pop();
    return lower.concat(upper);
  }

  function support(hull, angle) {
    const sine = Math.sin(angle);
    const cosine = Math.cos(angle);
    let bottom = -Infinity;
    for (const point of hull) bottom = Math.max(bottom, point.x * sine + point.y * cosine);
    return bottom;
  }

  function rollingGeometry(outline) {
    let area = 0;
    let x = 0;
    let y = 0;
    for (let i = 0; i < outline.length; i++) {
      const a = outline[i];
      const b = outline[(i + 1) % outline.length];
      const weight = a.x * b.y - b.x * a.y;
      area += weight;
      x += (a.x + b.x) * weight;
      y += (a.y + b.y) * weight;
    }
    // The area centroid is inside even an asymmetric L/V hull; its support stays positive.
    const center = { x: x / (3 * area), y: y / (3 * area) };
    const hull = outline.map((point) => ({ x: point.x - center.x, y: point.y - center.y }));
    const distance = new Float64Array(SAMPLES + 1);
    const step = TAU / SAMPLES;
    let previous = support(hull, 0);
    for (let i = 1; i <= SAMPLES; i++) {
      const next = support(hull, i * step);
      // No slip: dx/dtheta = h(theta), dy/dtheta = -h'(theta).
      distance[i] = distance[i - 1] + (previous + next) * step / 2;
      previous = next;
    }
    return {
      center,
      hull,
      distance,
      circumference: distance[SAMPLES],
      radius: Math.max(...hull.map((point) => Math.hypot(point.x, point.y))),
      left: Math.min(...outline.map((point) => point.x)),
      right: Math.max(...outline.map((point) => point.x)),
    };
  }

  function angleAtDistance(geometry, travel) {
    const turns = Math.floor(travel / geometry.circumference);
    const remainder = travel - turns * geometry.circumference;
    let low = 0;
    let high = SAMPLES;
    while (high - low > 1) {
      const middle = (low + high) >>> 1;
      if (geometry.distance[middle] <= remainder) low = middle;
      else high = middle;
    }
    const fraction = (remainder - geometry.distance[low]) / (geometry.distance[high] - geometry.distance[low]);
    return (turns + (low + fraction) / SAMPLES) * TAU;
  }

  function setFont(context, style) {
    context.font = `${style.fontStyle || "normal"} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    context.textBaseline = "alphabetic";
    context.textAlign = "left";
    context.direction = "ltr";
    if ("fontKerning" in context) context.fontKerning = "none";
    if ("fontStretch" in context) context.fontStretch = style.fontStretch || "normal";
    if ("letterSpacing" in context) context.letterSpacing = "0px";
    context.fillStyle = "#000";
    context.strokeStyle = "#000";
  }

  function sampleGlyph(canvas, context, text, style) {
    const size = number(style.fontSize, 32);
    if (context) setFont(context, style);
    const metrics = context ? context.measureText(text) : {};
    const advance = number(metrics.width, size * 0.8);
    const left = -number(metrics.actualBoundingBoxLeft, 0);
    const right = Math.max(left + 1, number(metrics.actualBoundingBoxRight, advance));
    const top = -number(metrics.actualBoundingBoxAscent, size * 0.8);
    const bottom = Math.max(top + 1, number(metrics.actualBoundingBoxDescent, size * 0.2));
    const stroke = number(style.webkitTextStrokeWidth);
    const space = context ? context.measureText(" ").width : size * 0.3;
    let outline;
    let precise = false;

    if (context) {
      try {
        const scale = 4;
        const padding = 3 + stroke;
        const originX = padding - left;
        const baseline = padding - top;
        canvas.width = Math.ceil((right - left + padding * 2) * scale);
        canvas.height = Math.ceil((bottom - top + padding * 2) * scale);
        context.setTransform(scale, 0, 0, scale, 0, 0);
        setFont(context, style);
        context.fillText(text, originX, baseline);
        if (stroke > 0) {
          context.lineWidth = stroke;
          context.strokeText(text, originX, baseline);
        }
        const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
        const points = [];
        for (let row = 0; row < canvas.height; row++) {
          let first = -1;
          let last = -1;
          for (let column = 0; column < canvas.width; column++) {
            if (data[(row * canvas.width + column) * 4 + 3] < 16) continue;
            if (first < 0) first = column;
            last = column;
          }
          if (first < 0) continue;
          const x1 = first / scale - originX;
          const x2 = (last + 1) / scale - originX;
          const y1 = row / scale - baseline;
          const y2 = (row + 1) / scale - baseline;
          points.push({ x: x1, y: y1 }, { x: x2, y: y1 }, { x: x1, y: y2 }, { x: x2, y: y2 });
        }
        if (points.length) {
          outline = convexHull(points);
          precise = outline.length >= 3;
        }
      } catch {
        // Privacy modes may deny pixel readback. Keep readable static text instead of fake rolling.
      }
    }
    if (!precise) {
      outline = [{ x: left, y: top }, { x: right, y: top }, { x: right, y: bottom }, { x: left, y: bottom }];
    }
    return { ...rollingGeometry(outline), advance, space, size, precise };
  }

  function poseAt(glyph, milliseconds) {
    const time = milliseconds - glyph.delay;
    let phase = "hold";
    let travel = 0;
    let scaleX = 1;
    let scaleY = 1;
    if (time >= TIMES.start && time < TIMES.settle) {
      phase = "roll";
      const u = (time - TIMES.start) / (TIMES.settle - TIMES.start);
      const v = clamp(u / .14, 0, 1);
      // One C2-continuous curve: a soft rightward anticipation flows into
      // leftward rolling without a separate launch/exit handoff or pause.
      const compression = 64 * v ** 3 * (1 - v) ** 3;
      const overshoot = Math.min(3, glyph.geometry.size * .045);
      travel = -(glyph.period + overshoot) * smooth(u) + glyph.charge * compression;
      scaleX = 1 + .025 * compression;
      scaleY = 1 - .035 * compression;
    } else if (time >= TIMES.settle && time < TIMES.rest) {
      phase = "settle";
      const u = (time - TIMES.settle) / (TIMES.rest - TIMES.settle);
      const overshoot = Math.min(3, glyph.geometry.size * .045);
      // One brief return from the left overshoot, then approximately 1s rest.
      travel = -glyph.period - overshoot * (1 - smooth(u));
    } else if (time >= TIMES.rest) {
      travel = -glyph.period;
    }
    return {
      phase,
      travel,
      // Fit whole turns to one viewport circuit, so its two portals share
      // the same pose and the final letter is exactly upright at its home.
      angle: angleAtDistance(glyph.geometry, travel * glyph.rotationScale),
      hop: 0,
      scaleX,
      scaleY,
    };
  }

  function initialize(stage) {
    if (stage.groundedWordmark) return;
    const header = stage.parentElement;
    const track = stage.querySelector(".kinetic-wordmark-track");
    const letters = track ? [...track.querySelectorAll(".kinetic-letter:not(.kinetic-letter-copy)")] : [];
    if (letters.length !== 8) return;
    const copies = letters.map((letter) => {
      const copy = letter.cloneNode(true);
      copy.classList.add("kinetic-letter-copy");
      copy.setAttribute("aria-hidden", "true");
      copy.style.visibility = "hidden";
      track.appendChild(copy);
      return copy;
    });

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const shapeCache = new Map();
    let glyphs = [];
    let width = 0;
    let ground = 0;
    let clipLeft = 0;
    let clipRight = 0;
    let visible = false;
    let dirty = true;
    let precise = false;
    let testPaused = false;
    let destroyed = false;
    let elapsed = 0;
    let lastTime = null;
    let frame = null;
    let visibilityFrame = null;
    let measurementCount = 0;
    let preparingEntry = false;
    const originalTransforms = letters.map((letter) => letter.style.transform);
    const listeners = [];

    function listen(target, event, handler, options) {
      target.addEventListener(event, handler, options);
      listeners.push(() => target.removeEventListener(event, handler, options));
    }

    function eligible() {
      return !destroyed && (visible || preparingEntry) && !document.hidden && stage.isConnected
        && (preparingEntry || !document.documentElement.classList.contains("boot-pending"))
        && (preparingEntry || !document.documentElement.classList.contains("boot-entering"))
        && !document.body.classList.contains("project-open")
        && !document.documentElement.classList.contains("project-open");
    }

    function measure() {
      if (!eligible()) return false;
      const trackStyle = getComputedStyle(track);
      const stageStyle = getComputedStyle(stage);
      if (stageStyle.display === "none" || (!preparingEntry && (stageStyle.visibility === "hidden" || stageStyle.visibility === "collapse"))) return false;
      if (!preparingEntry && stage.checkVisibility && !stage.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) return false;
      const trackRect = track.getBoundingClientRect();
      const stageRect = stage.getBoundingClientRect();
      const headerRect = header.getBoundingClientRect();
      const localWidth = number(trackStyle.width, trackRect.width);
      const localHeight = number(trackStyle.height, trackRect.height);
      if (!(localWidth > 0 && localHeight > 0 && trackRect.width > 0 && trackRect.height > 0)) return false;
      const scaleX = trackRect.width / localWidth;
      const scaleY = trackRect.height / localHeight;
      width = localWidth;
      clipLeft = (Math.max(stageRect.left, headerRect.left) - trackRect.left) / scaleX;
      clipRight = (Math.min(stageRect.right, headerRect.right) - trackRect.left) / scaleX;
      ground = (headerRect.bottom - trackRect.top) / scaleY - number(getComputedStyle(header).borderBottomWidth) - 2;
      const styles = letters.map((letter) => getComputedStyle(letter));
      const transforms = letters.map((letter) => letter.style.transform);
      const markers = letters.map((letter) => {
        // A zero-size inline box's top is the real DOM alphabetic baseline, including font leading.
        const marker = document.createElement("span");
        marker.setAttribute("aria-hidden", "true");
        marker.style.cssText = "all:initial;display:inline-block;position:static;width:0;height:0;margin:0;padding:0;border:0;line-height:0;font-size:0;letter-spacing:0;vertical-align:baseline;visibility:hidden;";
        letter.style.transform = "none";
        letter.appendChild(marker);
        return marker;
      });
      let baselines;
      try {
        baselines = markers.map((marker, index) => (marker.getBoundingClientRect().top - letters[index].getBoundingClientRect().top) / scaleY);
      } finally {
        markers.forEach((marker, index) => {
          marker.remove();
          letters[index].style.transform = transforms[index];
        });
      }
      const canvas = document.createElement("canvas");
      let context = null;
      try { context = canvas.getContext("2d", { willReadFrequently: true }); } catch { /* Static fallback below. */ }
      const measured = letters.map((element, index) => {
        const style = styles[index];
        const text = element.textContent.trim();
        const key = [text, style.fontStyle, style.fontWeight, style.fontSize, style.fontFamily, style.fontStretch, style.webkitTextStrokeWidth].join("|");
        let geometry = shapeCache.get(key);
        if (!geometry) {
          geometry = sampleGlyph(canvas, context, text, style);
          if (shapeCache.size >= 32) shapeCache.clear();
          shapeCache.set(key, geometry);
        }
        const insetX = number(style.borderLeftWidth) + number(style.paddingLeft);
        const previous = element.previousElementSibling;
        return {
          element,
          copy: copies[index],
          text,
          geometry,
          baseline: baselines[index],
          originX: insetX + geometry.center.x,
          originY: baselines[index] + geometry.center.y,
          spacing: Math.max(geometry.size * 0.025, number(style.letterSpacing)),
          wordSpace: previous?.classList.contains("kinetic-space") ? Math.max(geometry.space, geometry.size * 0.28) + Math.max(0, number(style.wordSpacing)) : 0,
          delay: DELAYS[index],
          charge: Math.min(8, geometry.size * 0.075),
          frame: null,
          lastTransform: null,
        };
      });

      let cursor = 0;
      let previousRight = -Infinity;
      measured.forEach((glyph) => {
        const { geometry } = glyph;
        cursor += glyph.wordSpace;
        // Use advance widths, but never let negative legacy letter-spacing glue the ink together.
        cursor = Math.max(cursor, previousRight + glyph.spacing + glyph.wordSpace - geometry.left);
        glyph.homeX = cursor + geometry.center.x;
        previousRight = cursor + geometry.right;
        cursor += geometry.advance + glyph.spacing;
      });
      const leftInk = measured[0].homeX + measured[0].geometry.left - measured[0].geometry.center.x;
      const naturalWidth = previousRight - leftInk;
      const available = clipRight - clipLeft;
      const inset = Math.min(clamp(width * 0.022, 14, 32), Math.max(0, (available - naturalWidth) / 2));
      const start = clipLeft + inset - leftInk;
      measured.forEach((glyph) => { glyph.homeX += start; });
      for (const glyph of measured) {
        glyph.period = available;
        glyph.loopTurns = Math.max(1, Math.round(available / glyph.geometry.circumference));
        glyph.rotationScale = glyph.loopTurns * glyph.geometry.circumference / available;
      }
      glyphs = measured;
      precise = glyphs.every((glyph) => glyph.geometry.precise);
      dirty = false;
      measurementCount++;
      return true;
    }

    function rotatedBounds(glyph, angle, scaleX = 1, scaleY = 1) {
      // Whole turns become exact identity matrices, with no accumulated simulation drift.
      angle = Math.abs(angle / TAU - Math.round(angle / TAU)) < 1e-10 ? 0 : angle % TAU;
      const a = Math.cos(angle);
      const b = Math.sin(angle);
      let bottom = -Infinity;
      let left = Infinity;
      let right = -Infinity;
      for (const point of glyph.geometry.hull) {
        const localX = point.x * scaleX;
        const localY = point.y * scaleY;
        const x = a * localX - b * localY;
        bottom = Math.max(bottom, b * localX + a * localY);
        left = Math.min(left, x);
        right = Math.max(right, x);
      }
      return { a, b, bottom, left, right };
    }

    function draw(milliseconds) {
      const time = reduced.matches || !precise ? 0 : ((milliseconds % CYCLE) + CYCLE) % CYCLE;
      for (const glyph of glyphs) {
        const pose = poseAt(glyph, time);
        const bounds = rotatedBounds(glyph, pose.angle, pose.scaleX, pose.scaleY);
        const { a, b, bottom, left, right } = bounds;
        const centerX = clipLeft + ((glyph.homeX + pose.travel - clipLeft) % glyph.period + glyph.period) % glyph.period;
        const centerY = ground - bottom - pose.hop;
        const matrixA = a * pose.scaleX;
        const matrixB = b * pose.scaleX;
        const matrixC = -b * pose.scaleY;
        const matrixD = a * pose.scaleY;
        const matrix = [
          matrixA,
          matrixB,
          matrixC,
          matrixD,
          centerX - matrixA * glyph.originX - matrixC * glyph.originY,
          centerY - matrixB * glyph.originX - matrixD * glyph.originY,
        ];
        const transform = `matrix(${matrix.map((value) => value.toFixed(8)).join(",")})`;
        if (transform !== glyph.lastTransform) {
          glyph.element.style.transform = transform;
          glyph.lastTransform = transform;
        }
        // Render the clipped portion at the opposite portal in the SAME frame.
        // Nothing waits for a whole letter (or the entire word) to leave first.
        const shadowMargin = 3;
        const copyShift = centerX + left - shadowMargin < clipLeft ? glyph.period
          : centerX + right + shadowMargin > clipRight ? -glyph.period : 0;
        if (copyShift !== glyph.lastCopyShift) {
          glyph.copy.style.visibility = copyShift ? "visible" : "hidden";
          glyph.lastCopyShift = copyShift;
        }
        if (copyShift) {
          const copyMatrix = [...matrix];
          copyMatrix[4] += copyShift;
          const copyTransform = `matrix(${copyMatrix.map((value) => value.toFixed(8)).join(",")})`;
          if (copyTransform !== glyph.lastCopyTransform) {
            glyph.copy.style.transform = copyTransform;
            glyph.lastCopyTransform = copyTransform;
          }
        }
        glyph.frame = {
          ...pose,
          matrix,
          centerX,
          centerY,
          support: bottom,
          minX: centerX + left,
          maxX: centerX + right,
          maxY: ground - pose.hop,
          offscreen: centerX + right < clipLeft || centerX + left > clipRight,
        };
      }
    }

    function stop() {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      lastTime = null;
    }

    function sync() {
      if (!eligible()) { stop(); return; }
      if (!dirty && (testPaused || reduced.matches || !precise)) { stop(); return; }
      if (frame === null) frame = requestAnimationFrame(tick);
    }

    function tick(timestamp) {
      frame = null;
      if (!eligible()) { lastTime = null; return; }
      if (dirty && !measure()) { lastTime = null; return; }
      if (reduced.matches) elapsed = 0;
      if (!testPaused && !reduced.matches && precise && lastTime !== null) {
        // A throttled frame must not fast-forward a hidden tab or a restored page through the cycle.
        elapsed = (elapsed + clamp(timestamp - lastTime, 0, 64)) % CYCLE;
      }
      draw(elapsed);
      lastTime = testPaused || reduced.matches || !precise ? null : timestamp;
      sync();
    }

    function invalidate() {
      if (destroyed) return;
      dirty = true;
      sync();
    }

    function refreshVisibility() {
      visibilityFrame = null;
      if (destroyed || document.hidden) return;
      const rect = stage.getBoundingClientRect();
      visible = rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.right > 0
        && rect.top < window.innerHeight && rect.left < window.innerWidth;
      sync();
    }

    function queueVisibility() {
      if (!destroyed && !document.hidden && visibilityFrame === null) visibilityFrame = requestAnimationFrame(refreshVisibility);
    }

    function preferenceChanged() {
      stop();
      elapsed = 0;
      if (reduced.matches && glyphs.length) draw(0);
      sync();
    }

    function fontChanged() {
      if (destroyed) return;
      shapeCache.clear();
      invalidate();
    }

    let intersectionObserver = null;
    if ("IntersectionObserver" in window) {
      intersectionObserver = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.target === stage) visible = entry.isIntersecting && entry.intersectionRect.width > 0 && entry.intersectionRect.height > 0;
        }
        sync();
      });
      intersectionObserver.observe(stage);
    } else {
      listen(window, "scroll", queueVisibility, { passive: true, capture: true });
      queueVisibility();
    }
    const resizeObserver = "ResizeObserver" in window ? new ResizeObserver(invalidate) : null;
    resizeObserver?.observe(stage);
    resizeObserver?.observe(header);
    const mutationObserver = new MutationObserver(() => {
      invalidate();
      if (reduced.matches && glyphs.length) draw(0);
      sync();
    });
    mutationObserver.observe(document.body, { attributes: true, attributeFilter: ["class", "style"] });
    mutationObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "lang", "style"] });
    mutationObserver.observe(header, { attributes: true, attributeFilter: ["class", "style", "hidden"] });
    mutationObserver.observe(stage, { attributes: true, attributeFilter: ["class", "style", "hidden"] });
    listen(window, "resize", () => { invalidate(); if (!intersectionObserver) queueVisibility(); }, { passive: true });
    listen(document, "visibilitychange", () => {
      if (document.hidden && visibilityFrame !== null) {
        cancelAnimationFrame(visibilityFrame);
        visibilityFrame = null;
      }
      if (!document.hidden && !intersectionObserver) queueVisibility();
      sync();
    });
    listen(window, "pagehide", stop);
    listen(document, "portfolio:boot-enter", () => {
      // One static, grounded pose while hidden; never reveal eight unpositioned letters.
      preparingEntry = true;
      if (measure()) draw(0);
      preparingEntry = false;
      stop();
    });
    listen(document, "portfolio:boot-ready", () => { invalidate(); refreshVisibility(); });
    listen(window, "pageshow", () => { invalidate(); queueVisibility(); });
    if (reduced.addEventListener) listen(reduced, "change", preferenceChanged);
    else {
      reduced.addListener(preferenceChanged);
      listeners.push(() => reduced.removeListener(preferenceChanged));
    }
    if (document.fonts) {
      document.fonts.ready.then(fontChanged, fontChanged);
      listen(document.fonts, "loadingdone", fontChanged);
      listen(document.fonts, "loadingerror", fontChanged);
    }

    function snapshot() {
      return {
        ready: glyphs.length === letters.length && !dirty,
        precise,
        time: reduced.matches || !precise ? 0 : elapsed,
        cycleMs: CYCLE,
        width,
        ground,
        clipLeft,
        clipRight,
        measurementCount,
        visible,
        paused: testPaused || reduced.matches || !eligible() || !precise,
        glyphs: glyphs.map((glyph) => ({
          text: glyph.text,
          delay: glyph.delay,
          baseline: glyph.baseline,
          origin: { x: glyph.originX, y: glyph.originY },
          hull: glyph.geometry.hull.map((point) => ({ ...point })),
          circumference: glyph.geometry.circumference,
          homeX: glyph.homeX,
          loopTurns: glyph.loopTurns,
          ...glyph.frame,
        })),
      };
    }

    const controller = {
      cycleMs: CYCLE,
      get ready() { return glyphs.length === letters.length && !dirty; },
      // Usage: stage.controller.pauseForTest(true); stage.controller.renderAt(3800).
      // Manual renders respect hidden/project-open/reduced-motion, and never read layout unless dirty.
      renderAt(milliseconds) {
        if (!Number.isFinite(milliseconds)) throw new TypeError("renderAt expects a finite millisecond value");
        if (destroyed) return snapshot();
        elapsed = reduced.matches ? 0 : ((milliseconds % CYCLE) + CYCLE) % CYCLE;
        lastTime = null;
        if (eligible()) {
          if (!dirty || measure()) draw(elapsed);
        } else if (reduced.matches && glyphs.length) draw(0);
        return snapshot();
      },
      pauseForTest(paused) {
        testPaused = Boolean(paused);
        stop();
        sync();
        return snapshot();
      },
      destroy() {
        if (destroyed) return;
        destroyed = true;
        stop();
        if (visibilityFrame !== null) cancelAnimationFrame(visibilityFrame);
        intersectionObserver?.disconnect();
        resizeObserver?.disconnect();
        mutationObserver.disconnect();
        listeners.forEach((remove) => remove());
        letters.forEach((letter, index) => { letter.style.transform = originalTransforms[index]; });
        copies.forEach((copy) => copy.remove());
        shapeCache.clear();
        if (stage.controller === controller) delete stage.controller;
        delete stage.groundedWordmark;
      },
    };
    stage.controller = controller;
    stage.groundedWordmark = controller;
  }

  function boot() {
    document.querySelectorAll(".site-header > .kinetic-wordmark").forEach(initialize);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
