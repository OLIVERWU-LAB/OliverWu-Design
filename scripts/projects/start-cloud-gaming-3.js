/* START 3.0: local review compositions built on the shared detail template. */
(() => {
  const projectId = 'start-cloud-gaming-3';
  const sheet = document.querySelector('.project-sheet');
  if (!sheet) return;
  const unbuiltBlock = '.project-content-text[data-variant^="start-"]:not([data-start-built])';
  let pending = false;
  const make = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (typeof text === 'string') node.textContent = text;
    return node;
  };
  const makeImage = (file, className, alt, size) => {
    const image = make('img', className);
    const source = file.startsWith('assets/') ? file : `assets/projects/${projectId}/${file}`;
    image.src = versionProjectImageAsset(source);
    image.alt = alt;
    image.loading = 'lazy';
    image.decoding = 'async';
    image.draggable = false;
    if (size) [image.width, image.height] = size;
    return image;
  };
  const position = (node, rect, width, height) => {
    node.style.left = `${rect.x / width * 100}%`;
    node.style.top = `${rect.y / height * 100}%`;
    node.style.width = `${rect.width / width * 100}%`;
    node.style.height = `${rect.height / height * 100}%`;
  };
  const addLayer = (parent, layer, width, height) => {
    const image = makeImage(layer.file, 'start-screen-layer', '', [layer.width, layer.height]);
    position(image, layer, width, height);
    parent.append(image);
    return image;
  };
  const autoScroll = scroller => {
    const startDelay = 1500;
    const manualDelay = 4200;
    const speed = 74;
    let active = false;
    let frame = 0;
    let timer = 0;
    let previousTime = 0;
    let position = 0;
    let expected = 0;
    let direction = 1;
    const schedule = delay => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
      timer = frame = 0;
      if (!active) return;
      timer = setTimeout(() => {
        timer = 0;
        if (!scroller.isConnected) return;
        position = expected = scroller.scrollTop;
        previousTime = 0;
        frame = requestAnimationFrame(tick);
      }, delay);
    };
    const tick = time => {
      frame = 0;
      if (!active || !scroller.isConnected) return;
      const end = scroller.scrollHeight - scroller.clientHeight;
      if (end <= 0) return;
      const seconds = previousTime ? Math.min(time - previousTime, 40) / 1000 : 0;
      previousTime = time;
      position = Math.max(0, Math.min(end, position + direction * speed * seconds));
      scroller.scrollTop = position;
      expected = scroller.scrollTop;
      if ((direction > 0 && position >= end) || (direction < 0 && position <= 0)) {
        direction *= -1;
        schedule(startDelay);
      } else {
        frame = requestAnimationFrame(tick);
      }
    };
    const takeOver = () => schedule(manualDelay);
    scroller.addEventListener('wheel', takeOver, { passive: true });
    scroller.addEventListener('pointerdown', takeOver, { passive: true });
    scroller.addEventListener('touchstart', event => {
      // Keep the outer sheet's cover-pull handler out of this native scroll gesture.
      event.stopPropagation();
      takeOver();
    }, { passive: true });
    scroller.addEventListener('keydown', event => {
      if (/^(ArrowUp|ArrowDown|PageUp|PageDown|Home|End| )$/.test(event.key)) takeOver();
    });
    scroller.addEventListener('scroll', () => {
      if (Math.abs(scroller.scrollTop - expected) > 0.5) {
        expected = scroller.scrollTop;
        takeOver();
      }
    }, { passive: true });
    window.projectRuntime.watchActivity(scroller, value => {
      active = value;
      schedule(startDelay);
    });
  };
  const scrollableScreen = (viewport, item, alt, scrollers) => {
    const { width, height, base, panes, overlays } = item.scroll;
    viewport.classList.add('has-scroll-panes');
    viewport.style.aspectRatio = `${width} / ${height}`;
    viewport.append(makeImage(base, 'start-screen-base', alt, [width, height]));
    for (const pane of panes) {
      const region = make('div', 'start-scroll-region');
      position(region, pane, width, height);
      const scroller = make('div', 'start-scroll-pane');
      scroller.tabIndex = 0;
      scroller.setAttribute('role', 'region');
      scroller.setAttribute('aria-label', pane.label || item.title || alt);
      if (pane.scrollbar) scroller.dataset.scrollbar = 'visible';
      if (pane.topFade) {
        region.style.setProperty('--start-scroll-fade-size', `${pane.topFade / pane.height * 100}%`);
      }
      const content = make('div', 'start-scroll-content');
      content.style.height = `${pane.contentHeight / pane.height * 100}%`;
      for (const layer of pane.layers) {
        if (!Number.isFinite(layer.pinBottom)) {
          addLayer(content, layer, pane.width, pane.contentHeight);
          continue;
        }
        // Native sticky positioning stays on the same scroll timeline as the left column.
        const column = make('div', 'start-scroll-pin');
        column.style.top = `${(layer.pinBottom - layer.height) / pane.width * 100}cqw`;
        column.style.marginTop = `${layer.y / pane.width * 100}%`;
        column.style.marginLeft = `${layer.x / pane.width * 100}%`;
        column.style.width = `${layer.width / pane.width * 100}%`;
        column.style.height = `${layer.height / pane.contentHeight * 100}%`;
        addLayer(column, { ...layer, x: 0, y: 0 }, layer.width, layer.height);
        content.append(column);
      }
      if (pane.topFade) {
        scroller.addEventListener('scroll', () => {
          region.classList.toggle('is-scrolled', scroller.scrollTop > 1);
        }, { passive: true });
      }
      scroller.append(content);
      region.append(scroller);
      viewport.append(region);
      scrollers.push(scroller);
    }
    for (const layer of overlays || []) addLayer(viewport, layer, width, height);
  };
  const screen = (item, sizes, scrollers) => {
    const card = make('figure', 'start-screen');
    const viewport = make('div', 'start-screen-viewport');
    const alt = item.alt || item.title || '';
    if (item.scroll) scrollableScreen(viewport, item, alt, scrollers);
    else viewport.append(makeImage(item.file, 'start-screen-image', alt, sizes[item.file]));
    card.append(viewport);
    if (item.label || item.title || item.body) {
      const caption = make('figcaption', 'start-screen-caption');
      if (item.label) caption.append(make('span', 'start-screen-label', item.label));
      if (item.title) caption.append(make('strong', '', item.title));
      if (item.body) caption.append(make('p', '', item.body));
      card.append(caption);
    }
    return card;
  };
  const compose = (block, config, sizes) => {
    const panel = make('div', `start-composition start-${config.kind}`);
    const scrollers = [];
    if (config.screens?.length) {
      const grid = make('div', 'start-screen-grid');
      for (const item of config.screens) grid.append(screen(item, sizes, scrollers));
      panel.append(grid);
    }
    if (panel.childElementCount) block.append(panel);
    block.dataset.startBuilt = 'true';
    return scrollers;
  };
  const enableVideoLoops = () => {
    for (const video of sheet.querySelectorAll('[data-variant^="start-handheld-video-"] video:not([data-start-loop])')) {
      video.dataset.startLoop = 'true';
      video.muted = video.defaultMuted = true;
      video.loop = true;
      let active = false;
      window.projectRuntime.watchActivity(video, value => { active = value; });
      // A pause from the native controls persists when the reader scrolls away.
      video.addEventListener('pause', () => { if (active) delete video.dataset.visibilityManaged; });
      video.addEventListener('play', () => { video.dataset.visibilityManaged = 'true'; });
      bindProjectManagedVideo(video);
    }
  };
  const observer = new MutationObserver(() => { void enhance(); });
  const observe = () => observer.observe(sheet, {childList:true, subtree:true, attributes:true, attributeFilter:['data-project-id']});
  async function enhance() {
    if (pending || sheet.dataset.projectId !== projectId || !sheet.querySelector(unbuiltBlock)) return;
    pending = true;
    try {
      const data = await loadProjectData(projectId);
      if (sheet.dataset.projectId !== projectId) return;
      observer.disconnect();
      const scrollers = [];
      for (const section of data.sections) for (const config of section.blocks) {
        const block = sheet.querySelector(`[data-variant="${config.variant}"]:not([data-start-built])`);
        if (block && config.presentation) scrollers.push(...compose(block, config.presentation, data.imageSizes || {}));
      }
      translatePortfolioTree(sheet);
      reserveProjectImageGeometry();
      // Mount the content before binding optional motion to the shared runtime.
      if (typeof window.projectRuntime?.watchActivity === 'function') {
        scrollers.forEach(autoScroll);
        enableVideoLoops();
      }
    } finally { pending = false; observe(); }
  }
  observe();
  void enhance();
})();
