/* The single B entrance. No backdrop filters or per-frame geometry polling. */
(() => {
  const layer = document.getElementById("projectDetail");
  const scroller = document.getElementById("projectScroller");
  const sheet = scroller?.querySelector(".project-sheet");
  if (!layer || !sheet) return;
  const mode = "wipe";
  layer.dataset.background = mode;
  document.documentElement.dataset.projectBackground = mode;
  const preview = document.createElement("div");
  preview.className = "project-parent-preview";
  preview.setAttribute("aria-hidden", "true");
  preview.inert = true;
  // After the active canvas in DOM order: existing sheet lookups stay valid.
  layer.append(preview);
  let parent = null;
  let returning = false;
  let entrance = "home";
  let reduced = false;
  let completionTimer = 0;
  let returnTimer = 0;
  let resolveReturn = null;
  let generation = 0;
  let homeSurfaces = [];

  function cancelCompletion() {
    window.clearTimeout(completionTimer);
    completionTimer = 0;
    window.clearTimeout(returnTimer);
    returnTimer = 0;
    resolveReturn?.();
    resolveReturn = null;
  }

  function resetSurface(surface) {
    surface.classList.remove("project-background-moving");
    surface.style.removeProperty("clip-path");
  }

  function showHome() {
    document.body.classList.remove("project-home-hidden");
    homeSurfaces.forEach(resetSurface);
  }

  function showParent() {
    layer.classList.remove("is-parent-hidden");
    resetSurface(preview);
  }

  function wipeBoundary(surface, viewportY) {
    // The shell and document-coordinate SVG have different local origins.
    const localY = viewportY - surface.getBoundingClientRect().top;
    return `polygon(0 0,100% 0,100% ${localY}px,0 ${localY}px)`;
  }

  function prepareHome() {
    homeSurfaces = [...document.querySelectorAll(".site-shell,.paper-edge-extensions")];
    showHome();
    homeSurfaces.forEach(surface => surface.style.setProperty("clip-path", wipeBoundary(surface, window.innerHeight * 1.04)));
  }

  function conceal(surfaces, complete) {
    surfaces.forEach(surface => {
      surface.classList.add("project-background-moving");
      surface.style.setProperty("clip-path", wipeBoundary(surface, 0));
    });
    if (reduced) {
      complete();
      surfaces.forEach(surface => surface.classList.remove("project-background-moving"));
      return;
    }
    const token = generation;
    completionTimer = window.setTimeout(() => {
      if (token !== generation) return;
      complete();
      surfaces.forEach(surface => surface.classList.remove("project-background-moving"));
    }, 760);
  }

  function clearParent() {
    parent = null;
    preview.replaceChildren();
    layer.classList.remove("has-project-parent", "is-parent-hidden", "is-closing-from-parent");
    resetSurface(preview);
  }

  function syncCanvas() {
    if (!parent) return;
    for (const name of ["--project-canvas-width", "--project-canvas-height", "--project-canvas-left", "--project-canvas-scale", "--project-embed-inverse-scale", "--project-hairline"]) {
      parent.paper.style.setProperty(name, sheet.style.getPropertyValue(name));
    }
    const scale = Number(sheet.style.getPropertyValue("--project-canvas-scale")) || 1;
    parent.paper.style.setProperty("--project-parent-offset", `${-parent.designScrollTop}px`);
    // CSS zoom scales the translation together with the canvas.
    parent.scrollTop = parent.designScrollTop * scale;
  }

  function captureParent() {
    const paper = sheet.cloneNode(true);
    paper.classList.add("project-parent-paper");
    const originalMedia = [...sheet.querySelectorAll("iframe,video,audio")];
    const copiedMedia = [...paper.querySelectorAll("iframe,video,audio")];
    copiedMedia.forEach((copy, index) => {
      const original = originalMedia[index];
      const still = document.createElement("div");
      still.className = `${copy.className || ""} project-frozen-media`;
      still.style.width = `${original.offsetWidth}px`;
      still.style.height = `${original.offsetHeight}px`;
      if (original.poster) {
        still.style.backgroundImage = `url(${JSON.stringify(original.poster)})`;
      }
      copy.replaceWith(still);
    });
    // No duplicate IDs/dialogs, focusable controls, scripts or observers.
    paper.querySelectorAll("script, source, track").forEach(node => node.remove());
    [paper, ...paper.querySelectorAll("*")].forEach(node => {
      for (const name of ["id", "role", "aria-modal", "aria-labelledby", "tabindex", "autofocus"]) node.removeAttribute(name);
    });
    const scale = Number(sheet.style.getPropertyValue("--project-canvas-scale")) || 1;
    parent = { id: "sound-design", paper, scrollTop: scroller.scrollTop, designScrollTop: scroller.scrollTop / scale };
    preview.replaceChildren(paper);
    layer.classList.add("has-project-parent");
    syncCanvas();
  }

  async function prepare(projectId, activeProjectId, pushHistory, reducedMotion) {
    generation += 1;
    cancelCompletion();
    reduced = reducedMotion;
    returning = Boolean(parent && parent.id === projectId && !pushHistory);
    if (returning) {
      entrance = "parent";
      showParent();
      layer.classList.add("is-returning-to-parent");
      // Reveal the collection immediately; slide the child out before reuse.
      await new Promise(resolve => {
        resolveReturn = resolve;
        returnTimer = window.setTimeout(() => { resolveReturn = null; returnTimer = 0; resolve(); }, reducedMotion ? 0 : 760);
      });
      return;
    }
    layer.classList.remove("is-returning-to-parent", "is-restoring-parent");
    if (activeProjectId === "sound-design" && projectId !== activeProjectId && layer.classList.contains("is-open")) {
      document.body.classList.add("project-home-hidden");
      entrance = "child";
      captureParent();
      showParent();
      preview.style.setProperty("clip-path", wipeBoundary(preview, window.innerHeight * 1.04));
      layer.classList.add("is-switching-project");
    } else if (!layer.classList.contains("is-open")) {
      entrance = "home";
      clearParent();
      prepareHome();
    } else {
      entrance = "replace";
    }
  }

  function ready() {
    const immediate = returning || entrance === "replace";
    if (returning) {
      // The newly rendered collection takes over the identical frozen view.
      layer.classList.add("is-restoring-parent");
      layer.classList.remove("is-returning-to-parent");
      clearParent();
      returning = false;
      requestAnimationFrame(() => requestAnimationFrame(() => layer.classList.remove("is-restoring-parent")));
    } else if (entrance === "home") {
      conceal(homeSurfaces, () => document.body.classList.add("project-home-hidden"));
    } else if (entrance === "child") {
      conceal([preview], () => layer.classList.add("is-parent-hidden"));
    }
    layer.classList.remove("is-switching-project");
    return immediate;
  }

  function close() {
    const exitingParent = Boolean(parent);
    generation += 1;
    cancelCompletion();
    returning = false;
    showHome();
    showParent();
    // A second Back during child return must move the visible parent copy,
    // not just the child canvas which is already below the viewport.
    layer.classList.toggle("is-closing-from-parent", exitingParent);
    layer.classList.remove("is-switching-project", "is-returning-to-parent", "is-restoring-parent");
  }

  window.projectBackground = { mode, prepare, ready, close, clearParent, syncCanvas, get returning() { return returning; } };
})();
