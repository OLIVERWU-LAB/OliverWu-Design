/* Visual Editor — project-only blocks (type prefix "ve-").
   Content lives in data/projects/visual-editor.json; this file only turns it
   into DOM. Shared openings, cover, facts and footer stay on the template. */
function veInlineCopy(text) {
  // Escape first, then allow two inline marks used by the source page:
  // `code` and **bold**. Nothing else is interpreted.
  const escaped = String(text || "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[c]);
  return escaped
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
}

function veEl(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (typeof text === "string") node.textContent = text;
  return node;
}

function veVideo(src, alt) {
  const source = safeProjectAsset(src);
  if (!source) return null;
  const video = document.createElement("video");
  setProjectMediaSource(video, versionProjectImageAsset(source));
  video.loop = true;
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.preload = "metadata";
  video.setAttribute("loop", "");
  video.setAttribute("muted", "");
  video.setAttribute("playsinline", "");
  video.setAttribute("aria-label", typeof alt === "string" ? alt : "");
  bindProjectManagedVideo(video);
  return video;
}

function veSafeHref(href) {
  // Only same-site relative paths into this project's own asset folder.
  return typeof href === "string"
    && /^assets\/projects\/visual-editor\/[a-zA-Z0-9_./-]+(\?[a-zA-Z0-9=&]+)?$/.test(href.trim())
    ? href.trim()
    : "";
}

function renderVisualEditorBlock(block) {
  const root = document.createElement("figure");
  root.className = `project-content-block project-content-${block.type}`;
  root.dataset.layout = "wide";
  const items = Array.isArray(block.items) ? block.items : [];

  if (block.type === "ve-cta") {
    const href = veSafeHref(block.href);
    if (!href) return [];
    const link = veEl("a", "ve-cta");
    link.href = href;
    link.target = "_blank";
    link.rel = "noopener";
    link.append(veEl("span", "ve-cta-label", block.label || "Try it live"), veEl("span", "ve-cta-arrow", "↗"));
    root.append(link);
    // Secondary ghost button: only the project's own GitHub repository.
    if (typeof block.github === "string" && /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(block.github.trim())) {
      const git = veEl("a", "ve-cta is-ghost");
      git.href = block.github.trim();
      git.target = "_blank";
      git.rel = "noopener noreferrer";
      git.append(veEl("span", "ve-cta-label", "GitHub"), veEl("span", "ve-cta-arrow", "↗"));
      root.append(git);
    }
    if (block.note) root.append(veEl("p", "ve-cta-note", block.note));
    return [root];
  }

  if (block.type === "ve-video") {
    const video = veVideo(block.src, block.alt);
    if (!video) return [];
    if (block.title) root.append(veEl("h4", "ve-block-title", block.title));
    const frame = veEl("div", "ve-media");
    frame.append(video);
    root.append(frame);
    return [root];
  }

  if (block.type === "ve-bar") {
    const track = veEl("div", "ve-bar-track");
    const fast = veEl("div", "ve-bar-fast");
    fast.append(veEl("span", "", block.fast || ""));
    const slow = veEl("div", "ve-bar-slow");
    slow.append(veEl("span", "", block.slow || ""));
    track.append(fast, slow);
    const labels = veEl("div", "ve-bar-labels");
    labels.append(veEl("span", "", block.fastLabel || ""), veEl("span", "is-faint", block.slowLabel || ""));
    root.append(track, labels);
    return [root];
  }

  if (block.type === "ve-loops") {
    const grid = veEl("div", "ve-loops");
    items.slice(0, 2).forEach((item) => {
      const card = veEl("section", `ve-loop is-${item.tone === "good" ? "good" : "bad"}`);
      const head = veEl("div", "ve-loop-head");
      head.append(veEl("span", "ve-kicker", item.kicker || ""), veEl("b", "ve-loop-cost", item.cost || ""));
      const list = veEl("ol", "ve-loop-steps");
      (Array.isArray(item.steps) ? item.steps : []).forEach((step) => list.append(veEl("li", "", step)));
      card.append(head, list, veEl("p", "ve-loop-foot", item.foot || ""));
      grid.append(card);
    });
    root.append(grid);
    return [root];
  }

  if (block.type === "ve-cells") {
    const grid = veEl("div", "ve-cells");
    items.slice(0, 6).forEach((item) => {
      const cell = veEl("section", "ve-cell");
      cell.append(veEl("span", "ve-cell-num", item.num || ""), veEl("h4", "", item.title || ""), veEl("p", "", item.body || ""));
      grid.append(cell);
    });
    root.append(grid);
    return [root];
  }

  if (block.type === "ve-compare") {
    if (block.title) root.append(veEl("h4", "ve-block-title", block.title));
    const columns = Array.isArray(block.columns) ? block.columns : [];
    const table = veEl("table", "ve-compare");
    const head = document.createElement("thead");
    const headRow = document.createElement("tr");
    const corner = veEl("th", "", "");
    corner.append(veEl("span", "ve-kicker is-faint", "Approach"));
    headRow.append(corner);
    columns.forEach((column, index) => {
      const th = veEl("th", index === columns.length - 1 ? "is-mine" : "", column);
      th.scope = "col";
      headRow.append(th);
    });
    head.append(headRow);
    const body = document.createElement("tbody");
    (Array.isArray(block.rows) ? block.rows : []).forEach((row) => {
      const tr = document.createElement("tr");
      const th = veEl("th", "", row.label || "");
      th.scope = "row";
      tr.append(th);
      (Array.isArray(row.cells) ? row.cells : []).forEach(([tone, text], index) => {
        const td = veEl("td", index === columns.length - 1 ? "is-mine" : "");
        td.append(veEl("i", `ve-dot is-${["good", "ok", "bad"].includes(tone) ? tone : "ok"}`), document.createTextNode(text || ""));
        tr.append(td);
      });
      body.append(tr);
    });
    table.append(head, body);
    root.append(table);
    if (block.note) root.append(veEl("p", "ve-compare-note", block.note));
    return [root];
  }

  if (block.type === "ve-feature") {
    const video = veVideo(block.src, block.alt);
    if (!video) return [];
    root.classList.toggle("is-flip", block.flip === true);
    const copy = veEl("div", "ve-feature-copy");
    const text = veEl("p", "");
    text.innerHTML = veInlineCopy(block.body);
    copy.append(veEl("span", "ve-feature-num", block.num || ""), veEl("h4", "", block.title || ""), text);
    const frame = veEl("div", "ve-media");
    frame.append(video);
    root.append(copy, frame);
    return [root];
  }

  if (block.type === "ve-save") {
    const video = veVideo(block.src, block.alt);
    const copy = veEl("div", "ve-feature-copy");
    const intro = veEl("p", "");
    intro.innerHTML = veInlineCopy(block.body);
    copy.append(veEl("span", "ve-feature-num", block.num || ""), veEl("h4", "", block.title || ""), intro);
    const list = veEl("div", "ve-save-list");
    items.slice(0, 4).forEach((item) => {
      const row = veEl("section", "ve-save-item");
      const title = veEl("h4", "", item.title || "");
      if (item.kbd) title.append(" ", veEl("kbd", "", item.kbd));
      row.append(title, veEl("p", "", item.body || ""));
      list.append(row);
    });
    copy.append(list);
    root.append(copy);
    if (video) {
      const frame = veEl("div", "ve-media");
      frame.append(video);
      root.append(frame);
    }
    return [root];
  }

  if (block.type === "ve-rules") {
    const list = veEl("ol", "ve-rules");
    items.slice(0, 6).forEach((item) => {
      const li = document.createElement("li");
      const body = veEl("span", "");
      body.innerHTML = veInlineCopy(item.body);
      li.append(veEl("b", "", item.title || ""), " ", body);
      list.append(li);
    });
    root.append(list);
    return [root];
  }

  if (block.type === "ve-code") {
    if (block.title) root.append(veEl("h4", "ve-block-title", block.title));
    if (block.body) root.append(veEl("p", "ve-code-sub", block.body));
    const pre = veEl("pre", "ve-code");
    pre.append(veEl("code", "", block.code || ""));
    root.append(pre);
    return [root];
  }

  return [];
}
