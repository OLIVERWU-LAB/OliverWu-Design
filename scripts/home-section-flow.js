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
  }

  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const duration = parseFloat(getComputedStyle(carousel).getPropertyValue("--moment-duration")) || 650;
  // One inaccessible copy makes 07 -> 01 slide forward, rather than rewind six frames.
  const loopSlide = slides[0].cloneNode(true);
  loopSlide.dataset.momentClone = "true";
  loopSlide.inert = true;
  loopSlide.setAttribute("aria-hidden", "true");
  loopSlide.querySelector("img")?.setAttribute("alt", "");
  // One moving reel, rather than eight independently composited/reset slides.
  const reel = document.createElement("div");
  reel.className = "contact-moments-reel";
  reel.append(...slides, loopSlide);
  track.append(reel);
  let index = 0;
  let visible = false;
  let timer;
  let resetTimer;
  let wrapping = false;
  let resetFrame;

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
    wrapping = advance && previous === slides.length - 1 && index === 0 && !reduced.matches;
    carousel.style.setProperty("--moment-index", wrapping ? slides.length : index);
    dots.forEach((dot, i) => dot.setAttribute("aria-pressed", String(i === index)));
    slides.forEach((slide, i) => slide.setAttribute("aria-hidden", String(i !== index)));
    updateCaption();
    if (wrapping) resetTimer = setTimeout(finishWrap, duration + 80);
  }

  const holdDuration = 2625;
  function schedule(delay = holdDuration) {
    clearTimeout(timer);
    if (!visible || reduced.matches || document.hidden
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
    show(i);
    // A manual choice restarts one complete transition + hold cycle; autofocus
    // on the dot never disables automatic advance.
    schedule(holdDuration + duration);
  }));
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting && entry.intersectionRatio >= .4;
    schedule();
  }, { threshold: [0, .4] }).observe(carousel);
  new MutationObserver(() => schedule()).observe(document.body, { attributes: true, attributeFilter: ["class"] });
  // The language toggle changes <html lang>; follow it without touching script.js.
  new MutationObserver(localize).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) finishWrap();
    schedule();
  });
  reduced.addEventListener("change", () => {
    finishWrap();
    schedule();
  });
  show(0);
  localize();
})();
