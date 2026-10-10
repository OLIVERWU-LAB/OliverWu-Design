// Homepage section snapping is native CSS; no wheel interception or scroll locks.
(() => {
  const carousel = document.querySelector(".contact-moments");
  if (!carousel) return;
  const track = carousel.querySelector(".contact-moments-track");
  const slides = [...track.querySelectorAll(".contact-moment")];
  const dots = [...carousel.querySelectorAll(".contact-carousel-dots button")];
  const description = carousel.querySelector(".contact-moments-description");
  const year = carousel.querySelector(".contact-moments-year");
  if (!slides.length || slides.length !== dots.length) return;

  // Captions describe what each photo shows; nothing beyond what the user supplied.
  const copy = {
    en: [
      "Volunteer teaching in rural China, with my students",
      "With my team at Tencent",
      "Playing keys in a live performance",
      "With my project team",
      "At the Royal College of Art, London",
      "Graduation day with classmates",
      "Puerto Rico — open to people and cultures everywhere",
    ],
    zh: [
      "在中国乡村支教，与孩子们合影",
      "与腾讯团队的合影",
      "在现场演出中担任键盘",
      "与项目小组伙伴合影",
      "在伦敦英国皇家艺术学院",
      "毕业日与同学合影",
      "在波多黎各旅行——乐于与不同文化的人交流，保持开放",
    ],
  };
  const years = ["2019", "2024", "2025", "2025", "2023", "2024", "2024"];
  const captions = copy.en.map(() => document.createElement("span"));
  description?.replaceChildren(...captions);
  const language = () => (document.documentElement.lang === "zh-CN" ? "zh" : "en");
  function updateCaption() {
    captions.forEach((caption, i) => {
      caption.classList.toggle("is-current", i === index);
      caption.setAttribute("aria-hidden", String(i !== index));
    });
    if (year) {
      year.textContent = years[index];
      year.setAttribute("datetime", years[index]);
    }
  }
  function localize() {
    const lines = copy[language()];
    captions.forEach((caption, i) => { caption.textContent = lines[i]; });
    slides.forEach((slide, i) => slide.querySelector("img")?.setAttribute("alt", `${lines[i]}, ${years[i]}`));
    updateCaption();
    track.setAttribute('aria-label', language() === 'zh' ? '左右拖动或使用左右方向键切换照片' : 'Drag or use the left and right arrow keys to change photos');
  }

  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const duration = parseFloat(getComputedStyle(carousel).getPropertyValue("--moment-duration")) || 650;
  // Inaccessible end copies let both swipe directions cross the seam by one photo.
  const loopSlide = slides[0].cloneNode(true);
  loopSlide.dataset.momentClone = "true";
  loopSlide.inert = true;
  loopSlide.setAttribute("aria-hidden", "true");
  loopSlide.querySelector("img")?.setAttribute("alt", "");
  const previousSlide = slides.at(-1).cloneNode(true);
  previousSlide.dataset.momentClone = "true";
  previousSlide.inert = true;
  previousSlide.setAttribute("aria-hidden", "true");
  previousSlide.querySelector("img")?.setAttribute("alt", "");
  // One moving reel, rather than eight independently composited/reset slides.
  const reel = document.createElement("div");
  reel.className = "contact-moments-reel";
  reel.append(previousSlide, ...slides, loopSlide);
  track.append(reel);
  let index = 0;
  let visible = false;
  let timer;
  let resetTimer;
  let wrapping = false;
  let resetFrame;
  let drag = null;

  function finishWrap() {
    if (!wrapping) return;
    wrapping = false;
    clearTimeout(resetTimer);
    carousel.classList.add("is-resetting");
    carousel.style.setProperty("--moment-index", index);
    // Commit the equivalent first frame with transitions off before re-enabling them.
    void reel.offsetWidth;
    resetFrame = requestAnimationFrame(() => carousel.classList.remove("is-resetting"));
  }

  function show(next, advance = false) {
    finishWrap();
    cancelAnimationFrame(resetFrame);
    carousel.classList.remove("is-resetting");
    const previous = index;
    index = ((next % slides.length) + slides.length) % slides.length;
    const forwardWrap = advance && previous === slides.length - 1 && next > previous;
    const backwardWrap = advance && previous === 0 && next < 0;
    wrapping = !reduced.matches && (forwardWrap || backwardWrap);
    carousel.style.setProperty("--moment-index", wrapping ? (forwardWrap ? slides.length : -1) : index);
    dots.forEach((dot, i) => dot.setAttribute("aria-pressed", String(i === index)));
    slides.forEach((slide, i) => slide.setAttribute("aria-hidden", String(i !== index)));
    updateCaption();
    if (wrapping) resetTimer = setTimeout(finishWrap, duration + 80);
  }

  const holdDuration = 2625;
  function schedule(delay = holdDuration) {
    clearTimeout(timer);
    if (drag || !visible || reduced.matches || document.hidden
      || document.body.classList.contains("project-open")) return;
    timer = setTimeout(() => {
      show(index + 1, true);
      schedule(holdDuration + duration);
    }, delay);
  }

  track.addEventListener("transitionend", (event) => {
    if (event.target === reel && event.propertyName === "transform") finishWrap();
  });
  dots.forEach((dot, i) => dot.addEventListener("click", () => {
    endDrag(false);
    show(i);
    // A manual choice restarts one complete transition + hold cycle; autofocus
    // on the dot never disables automatic advance.
    schedule(holdDuration + duration);
  }));
  track.tabIndex = 0;
  track.setAttribute('role', 'group');
  track.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    endDrag(false);
    show(index + (event.key === 'ArrowRight' ? 1 : -1), true);
    schedule(holdDuration + duration);
  });
  slides.forEach(slide => { slide.querySelector('img').draggable = false; });
  track.addEventListener('dragstart', event => event.preventDefault());
  track.addEventListener('pointerdown', event => {
    if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
    finishWrap();
    clearTimeout(timer);
    const width = track.getBoundingClientRect().width;
    const visual = new DOMMatrix(getComputedStyle(reel).transform).m41;
    drag = { id:event.pointerId, x:event.clientX, y:event.clientY, width,
      offset:visual + (index + 1) * width, dx:0, lastX:event.clientX,
      lastTime:event.timeStamp, velocity:0, horizontal:false };
    // Touch has implicit capture on the IMG. Claim the track immediately,
    // before that implicit capture is processed; pan-y still stays native.
    if (event.isTrusted) track.setPointerCapture?.(event.pointerId);
  });
  track.addEventListener('pointermove', event => {
    if (!drag || drag.id !== event.pointerId) return;
    const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
    if (!drag.horizontal) {
      if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) { endDrag(false); return; }
      if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
      drag.horizontal = true;
      carousel.classList.add('is-dragging');
    }
    const dt = event.timeStamp - drag.lastTime;
    if (dt > 0) drag.velocity = (event.clientX - drag.lastX) / dt;
    drag.lastX = event.clientX; drag.lastTime = event.timeStamp; drag.dx = dx;
    // No new animation loop: one transform update per actual pointer event.
    carousel.style.setProperty('--moment-drag', `${Math.max(-drag.width, Math.min(drag.width, dx + drag.offset))}px`);
  });
  function endDrag(commit, event) {
    if (!drag || (event && event.pointerId !== drag.id)) return;
    const gesture = drag;
    drag = null;
    carousel.classList.remove('is-dragging');
    carousel.style.setProperty('--moment-drag', '0px');
    if (track.hasPointerCapture?.(gesture.id)) track.releasePointerCapture(gesture.id);
    const recent = !event || event.timeStamp - gesture.lastTime < 100;
    const changed = gesture.horizontal && (Math.abs(gesture.dx) > Math.max(24, Math.min(72, gesture.width * .15))
      || (recent && Math.abs(gesture.velocity) > .35 && Math.abs(gesture.dx) > 16));
    if (commit && changed) show(index + (gesture.dx < 0 ? 1 : -1), true);
    schedule(holdDuration + duration);
  }
  track.addEventListener('pointerup', event => endDrag(true, event));
  track.addEventListener('pointercancel', event => endDrag(false, event));
  track.addEventListener('lostpointercapture', event => {
    // A former child capture can bubble here; it is not a lost TRACK capture.
    if (event.target === track && !track.hasPointerCapture?.(event.pointerId)) endDrag(false, event);
  });
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting && entry.intersectionRatio >= .4;
    if (!visible) endDrag(false);
    schedule();
  }, { threshold: [0, .4] }).observe(carousel);
  new MutationObserver(() => { endDrag(false); schedule(); }).observe(document.body, { attributes: true, attributeFilter: ["class"] });
  // The language toggle changes <html lang>; follow it without touching script.js.
  new MutationObserver(localize).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { endDrag(false); finishWrap(); }
    schedule();
  });
  reduced.addEventListener("change", () => {
    finishWrap();
    schedule();
  });
  show(0);
  localize();
})();
