// A cut belongs to the complete backing sheet, not just its coloured child.
// Measure only on layout changes. No scroll or animation-frame polling.
(() => {
  const NS = "http://www.w3.org/2000/svg";
  const configurations = [
    [".page-panel-about", [[".index-nav", "top"], [".index-nav", "bottom"]]],
    [".work-section", [[".section-marquee", "bottom"]]],
    [".experience-section", [[".section-marquee", "bottom"]]],
    [".contact-panel", [[".site-footer", "top"]]],
    [".project-sheet", [[".project-facts", "top"], [".project-facts", "bottom"], [".project-sheet-footer", "top"]]],
  ];
  const extensionOutline = document.createElementNS(NS, "svg");
  extensionOutline.classList.add("paper-edge-extensions");
  extensionOutline.setAttribute("aria-hidden", "true");
  extensionOutline.setAttribute("preserveAspectRatio", "none");
  const extensionPath = document.createElementNS(NS, "path");
  extensionOutline.append(extensionPath);
  // Attach outside the offset body: these coordinates are document coordinates.
  document.documentElement.append(extensionOutline);
  // A viewport-sized one-shot outline travels WITH the first paper. The long
  // document SVG stays still/offscreen; do not promote it to a huge GPU layer.
  const arrivalOutline = document.createElementNS(NS, "svg");
  arrivalOutline.classList.add("home-arrival-outline");
  arrivalOutline.setAttribute("aria-hidden", "true");
  const arrivalPath = document.createElementNS(NS, "path");
  arrivalOutline.append(arrivalPath);
  document.documentElement.append(arrivalOutline);
  const records = configurations.map(([selector, seams]) => {
    const sheet = document.querySelector(selector);
    if (!sheet) return null;
    const detail = selector === ".project-sheet";
    let outline;
    let holeGroup;
    if (!detail) {
      outline = document.createElementNS(NS, "svg");
      outline.classList.add("paper-edge-outline");
      outline.setAttribute("aria-hidden", "true");
      outline.setAttribute("preserveAspectRatio", "none");
      holeGroup = document.createElementNS(NS, "g");
      holeGroup.classList.add("binding-hole-outlines");
      outline.append(holeGroup);
      sheet.append(outline);
    }
    return { sheet, detail, outline, holeGroup, seams: seams.map(([sel, edge]) => ({ node: sheet.querySelector(sel), edge })).filter(item => item.node), signature: "" };
  }).filter(Boolean);
  let frame;
  function measure({ sheet, seams, detail }) {
    const rect = sheet.getBoundingClientRect();
    const width = sheet.offsetWidth;
    if (!width || !rect.height || !rect.width) return null;
    const scale = rect.width / width;
    const height = rect.height / scale;
    const nav = document.querySelector(".index-nav");
    // Reference: notch depth is roughly a third of the navigation strip height.
    const depth = detail ? 18 : Math.min(18, (nav?.offsetHeight || 54) / 3);
    // Collection boundaries cut the backing sheet as well, not just the
    // coloured article. Query after rendering: these children are dynamic.
    const collectionSeams = detail && sheet.dataset.projectId === "sound-design"
      ? [...sheet.querySelectorAll(".sound-project + .sound-project")].map(node => ({ node, edge: "top" }))
      : [];
    const ys = [...seams, ...collectionSeams]
      .filter(({node}) => node.getClientRects().length && node.offsetHeight > 0)
      .map(({ node, edge }) => (node.getBoundingClientRect()[edge] - rect.top) / scale)
      .filter(y => y > depth && y < height - depth)
      .sort((a, b) => a - b)
      .filter((y, i, all) => !i || y - all[i - 1] > .8);
    const f = n => Math.round(n * 100) / 100;
    const arrivalTranslation = !detail && sheet.classList.contains('page-panel-about')
      && document.documentElement.classList.contains('boot-entering')
      ? new DOMMatrix(getComputedStyle(sheet).transform).m42 : 0;
    return {
      width,
      height,
      depth: f(depth),
      seams: ys.map(f),
      scale,
      pageLeft: rect.left + window.scrollX,
      pageRight: rect.right + window.scrollX,
      pageTop: rect.top + window.scrollY - arrivalTranslation,
    };
  }
  function update() {
    frame = null;
    const extensionSegments = [];
    const homepageGeometry = [];
    records.forEach(record => {
      const geometry = measure(record);
      if (!geometry) return;
      // A viewport translation never changes a detail sheet's local cuts.
      // Do not rebuild its full clip polygon while it is sliding onscreen.
      const signature = JSON.stringify(record.detail
        ? { width: geometry.width, height: geometry.height, depth: geometry.depth, seams: geometry.seams }
        : geometry);
      const { width: w, height: h, depth: d, seams } = geometry;
      if (signature !== record.signature) {
        record.signature = signature;
        const points = [[0, 0], [w, 0]];
        seams.forEach(y => points.push([w, y - d], [w - d, y], [w, y + d]));
        points.push([w, h], [0, h]);
        [...seams].reverse().forEach(y => points.push([0, y + d], [d, y], [0, y - d]));
        record.sheet.style.setProperty("--paper-cut-path", `polygon(${points.map(([x, y]) => `${x}px ${y}px`).join(",")})`);
        record.sheet.classList.add("paper-cut-sheet");
        record.sheet.paperGeometry = geometry;
        if (record.outline) {
          record.outline.setAttribute("viewBox", `0 0 ${w} ${h}`);

          const style = getComputedStyle(record.sheet);
          const radius = parseFloat(style.getPropertyValue("--binding-hole")) || 0;
          const pitch = parseFloat(style.getPropertyValue("--binding-pitch")) || 0;
          record.holeGroup.replaceChildren();
          if (radius > 0 && pitch > 0) {
            for (let x = pitch / 2; x < w; x += pitch) {
              const circle = document.createElementNS(NS, "circle");
              circle.classList.add("binding-hole-outline");
              circle.setAttribute("cx", x.toFixed(2));
              circle.setAttribute("cy", (radius * 3).toFixed(2));
              // The mask removes the inner half of a centred stroke. Moving the
              // ring outward leaves a full one-pixel #868686 outline on paper.
              circle.setAttribute("r", (radius + .5).toFixed(2));
              record.holeGroup.append(circle);
            }
          }
        }
      }
      if (record.outline) {
        homepageGeometry.push(geometry);
        // Only the outer top/bottom of a complete panel reaches the viewport.
        [0, h].forEach(localY => {
          const y = geometry.pageTop + localY * geometry.scale;
          extensionSegments.push(`M0 ${y.toFixed(2)} H${window.innerWidth}`);
        });
        // Preserve layout dimensions while handing the bottom boundary to SVG.
        record.sheet.querySelectorAll('.hero, .case-card, .experience-grid > article').forEach(node => {
          const atBottom = node.getClientRects().length > 0
            && Math.abs(node.getBoundingClientRect().bottom - geometry.pageTop + window.scrollY - h * geometry.scale) < 1.5;
          node.classList.toggle('paper-bottom-edge', atBottom);
        });
      }
    });
    // Positioned SVGs contribute to scrollable overflow. Use layout height,
    // not scrollHeight, so the overlay can never recursively lengthen the page.
    const documentHeight = Math.max(
      document.documentElement.offsetHeight,
      document.body.offsetHeight,
      window.innerHeight,
    );
    // A single rail on each side, with its straight segment replaced by the
    // actual notch contour. There is no vertical chord through any cutout.
    homepageGeometry.sort((a,b) => a.pageTop - b.pageTop);
    if (homepageGeometry.length) {
      const g=homepageGeometry[0], parts=[];
      const top=g.pageTop-window.scrollY, bottom=top+g.height*g.scale;
      [top,bottom].forEach(y=>parts.push(`M0 ${y.toFixed(2)} H${window.innerWidth}`));
      for(const side of ['left','right']){
        const x=side==='left'?g.pageLeft:g.pageRight, inward=side==='left'?1:-1;
        let path=`M${x.toFixed(2)} ${-window.innerHeight}`;
        for(const seam of g.seams){const y=top+seam*g.scale,d=g.depth*g.scale;
          path+=` V${(y-d).toFixed(2)} L${(x+inward*d).toFixed(2)} ${y.toFixed(2)} L${x.toFixed(2)} ${(y+d).toFixed(2)}`;
        }
        parts.push(path+` V${Math.max(window.innerHeight,bottom).toFixed(2)}`);
      }
      arrivalOutline.setAttribute('viewBox',`0 0 ${window.innerWidth} ${window.innerHeight}`);
      arrivalPath.setAttribute('d',parts.join(' '));
      for (const side of ['left','right']) {
        const first = homepageGeometry[0];
        const x = side === 'left' ? first.pageLeft : first.pageRight;
        const inward = side === 'left' ? 1 : -1;
        // Paint beyond both document ends, in this SAME contour. Native
        // rubber-band may be compositor-only and leave scrollY clamped at0.
        // SVG paint overflow does not change the CSS viewport/layout box.
        let path = `M${x.toFixed(2)} ${-window.innerHeight}`;
        for (const g of homepageGeometry) {
          for (const seam of g.seams) {
            const y = g.pageTop + seam * g.scale;
            const depth = g.depth * g.scale;
            path += ` V${(y-depth).toFixed(2)} L${(x+inward*depth).toFixed(2)} ${y.toFixed(2)} L${x.toFixed(2)} ${(y+depth).toFixed(2)}`;
          }
        }
        path += ` V${documentHeight + window.innerHeight}`;
        extensionSegments.push(path);
      }
    }
    extensionOutline.setAttribute("viewBox", `0 0 ${window.innerWidth} ${documentHeight}`);
    extensionOutline.setAttribute("width", String(window.innerWidth));
    extensionOutline.setAttribute("height", String(documentHeight));
    extensionPath.setAttribute("d", extensionSegments.join(" "));
    document.documentElement.classList.add("has-paper-geometry");
  }
  function queue() { if (!frame) frame = requestAnimationFrame(update); }
  const sizes = new ResizeObserver(queue);
  records.forEach(({ sheet, seams }) => {
    sizes.observe(sheet);
    seams.forEach(({node}) => sizes.observe(node));
  });
  // Loading/switching a case study and changing language alter seam positions.
  const sheet = document.querySelector(".project-sheet");
  if (sheet) new MutationObserver(queue).observe(sheet, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-project-id", "class"] });
  new MutationObserver(queue).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  window.addEventListener("resize", queue, { passive: true });
  document.fonts.ready.then(queue);
  document.fonts.addEventListener("loadingdone", queue);
  document.addEventListener('portfolio:boot-enter', () => {
    if(frame) cancelAnimationFrame(frame);
    update();
  }, {once:true});
  document.addEventListener('portfolio:boot-ready', () => { arrivalOutline.remove(); queue(); }, {once:true});
  queue();
})();
