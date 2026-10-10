/* Gangstar Mirage City — project-only board renderer (type prefix "gts-").
   The user's Figma board is 1920 wide. Every layer in the JSON keeps those
   1920-unit coordinates; the board is drawn at 1920 and scaled by
   1280/1920 so it sits exactly on the shared 1280px detail canvas.
   Stacking = JSON order (already resolved against the reference board). */
function gtsEl(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (typeof text === "string") node.textContent = text;
  return node;
}

function gtsAsset(src) {
  const safe = safeProjectAsset(src);
  return safe ? versionProjectImageAsset(safe) : "";
}

// CSS custom properties holding url() resolve against the stylesheet, not
// the page, so anything passed through a variable must be absolute.
function gtsAbsolute(src) {
  const url = gtsAsset(src);
  return url ? new URL(url, document.baseURI).href : "";
}

function gtsPlace(node, item) {
  node.style.left = `${item.x || 0}px`;
  node.style.top = `${item.y || 0}px`;
  if (item.w) node.style.width = `${item.w}px`;
  if (item.h) node.style.height = `${item.h}px`;
  if (item.r) node.style.transform = `rotate(${item.r}deg)`;
  if (typeof item.z === "number") node.style.zIndex = String(item.z);
}

function gtsImage(src, alt) {
  const image = document.createElement("img");
  image.src = gtsAsset(src);
  image.alt = typeof alt === "string" ? alt : "";
  image.decoding = "sync";
  image.loading = "eager";
  image.draggable = false;
  return image;
}

function renderGangstarBlock(block) {
  if (block.type !== "gts-board") return [];
  const root = document.createElement("figure");
  root.className = "project-content-block project-content-gts-board";
  const flowShift = block.flowShift || {};
  const shiftAfter = Number(flowShift.after);
  const shiftAmount = Number(flowShift.amount) || 0;
  const hasFlowShift = Number.isFinite(shiftAfter) && shiftAmount !== 0;
  const shiftedY = (value) => {
    const y = Number(value) || 0;
    return hasFlowShift && y >= shiftAfter ? y + shiftAmount : y;
  };
  const height = (Number(block.height) || 0) + (hasFlowShift ? shiftAmount : 0);
  root.style.setProperty("--gts-board-h", `${height}px`);

  const board = gtsEl("div", "gts-board");
  board.style.height = `${height}px`;
  const tile = gtsAbsolute(block.tile);
  const frame = gtsAbsolute(block.frame);
  const tag = gtsAbsolute(block.tag);
  if (tile) board.style.setProperty("--gts-tile", `url("${tile}")`);
  if (frame) board.style.setProperty("--gts-frame", `url("${frame}")`);
  if (tag) board.style.setProperty("--gts-tag", `url("${tag}")`);

  // 1 · background zones (tiled checker, blurred home art, shades, pink end)
  (block.zones || []).forEach((zone) => {
    const node = gtsEl("div", `gts-zone gts-zone-${zone.kind}`);
    const zoneY = Number(zone.y) || 0;
    const zoneH = Number(zone.h) || 0;
    const crossesShift = hasFlowShift && zoneY < shiftAfter && zoneY + zoneH > shiftAfter;
    node.style.top = `${shiftedY(zoneY)}px`;
    node.style.height = `${zoneH + (crossesShift ? shiftAmount : 0)}px`;
    if (zone.kind === "tile") {
      node.style.backgroundPositionY = `${(zone.origin || 0) - zone.y}px`;
    }
    if (zone.kind === "blur") {
      const art = gtsEl("div", "gts-blur-art");
      const src = gtsAsset(zone.src);
      if (src) art.style.backgroundImage = `url("${src}")`;
      node.append(art, gtsEl("div", "gts-blur-veil"));
    }
    if (zone.kind === "shade" && zone.fill) node.style.background = zone.fill;
    if (zone.kind === "strip") {
      // A tinted band running parallel to a rotated phone (match page).
      node.style.left = `${zone.x}px`;
      node.style.width = `${zone.w}px`;
      node.style.background = zone.fill;
      node.style.transform = `rotate(${zone.r}deg)`;
      node.style.transformOrigin = "50% 50%";
    }
    board.append(node);
  });

  // 2 · image layers — phones get the Spirited Expedition frame on top of a
  //     rounded screen; plain images are placed as-is.
  (block.layers || []).forEach((layer) => {
    const placedLayer = { ...layer, y: shiftedY(layer.y) };
    // A phone is: screenshot (or clip) sitting UNDER the bezel artwork, with the
    // screen box rounded to match the frame's inner cut. The layer geometry is
    // the SCREEN, the bezel overhangs it.
    if (layer.kind === "phone" || layer.kind === "video") {
      const phone = gtsEl("div", "gts-phone");
      gtsPlace(phone, placedLayer);
      const screen = gtsEl("div", "gts-phone-screen");
      if (layer.kind === "video") {
        const v = document.createElement("video");
        setProjectMediaSource(v, gtsAsset(layer.src));
        v.muted = true; v.loop = true; v.playsInline = true;
        v.setAttribute("muted", ""); v.setAttribute("playsinline", "");
        bindProjectManagedVideo(v);
        screen.append(v);
      } else {
        screen.append(gtsImage(layer.src, layer.alt));
      }
      phone.append(screen, gtsEl("div", "gts-phone-frame"));
      board.append(phone);
      return;
    }
    const image = gtsImage(layer.src, layer.alt);
    image.className = "gts-layer";
    gtsPlace(image, placedLayer);
    board.append(image);
  });

  // 3 · live overlays: section tags, page labels, captions, swatches,
  //     placeholder devices on the pink finale.
  (block.overlays || []).forEach((sourceItem) => {
    const item = { ...sourceItem };
    if (typeof item.y === "number") item.y = shiftedY(item.y);
    if (typeof item.cy === "number") item.cy = shiftedY(item.cy);
    let node = null;
    if (item.kind === "tag") {
      node = gtsEl("div", "gts-tag");
      node.append(gtsEl("span", "", item.text || ""));
      node.style.left = `${item.x || 0}px`;
      node.style.top = `${item.y}px`;
    } else if (item.kind === "label") {
      node = gtsEl("div", `gts-label${item.align === "left" ? " is-left" : ""}`);
      node.append(gtsEl("span", "gts-label-cn", item.cn || ""), gtsEl("span", "gts-label-en", item.en || ""));
      node.style.left = `${item.cx}px`;
      if (typeof item.cy === "number") {
        node.style.top = `${item.cy}px`;
        node.style.transform = `translate(-50%, -50%) rotate(${item.r || 0}deg)`;
      } else {
        node.style.top = `${item.y}px`;
      }
    } else if (item.kind === "caption") {
      const tone = item.tone === "warm" ? " is-warm" : item.tone === "bright" ? " is-bright" : "";
      node = gtsEl("p", `gts-caption${tone}`, item.text || "");
      node.style.left = `${item.cx}px`;
      node.style.top = `${item.y}px`;
      if (item.size) node.style.fontSize = `${item.size}px`;
    } else if (item.kind === "para") {
      node = gtsEl("p", "gts-para", item.text || "");
      node.style.left = `${item.x}px`;
      node.style.top = `${item.y}px`;
      node.style.width = `${item.w}px`;
    } else if (item.kind === "charcap") {
      node = gtsEl("p", "gts-charcap", item.text || "");
      node.style.left = `${item.cx}px`;
      node.style.top = `${item.y}px`;
    } else if (item.kind === "pinkphone") {
      node = gtsEl("div", "gts-phone gts-pinkphone");
      gtsPlace(node, item);
      const scr = gtsEl("div", "gts-phone-screen");
      scr.append(gtsImage(item.src, item.alt || ""));
      node.append(scr, gtsEl("div", "gts-phone-frame"));
    } else if (item.kind === "logo") {
      node = gtsImage(item.src, ""); node.className = "gts-logo"; gtsPlace(node, item);
    } else if (item.kind === "release") {
      node = gtsEl("div", "gts-release");
      node.style.left = `${item.x}px`; node.style.top = `${item.y}px`; node.style.width = `${item.w}px`;
      node.append(gtsEl("span", "gts-release-word", item.text || ""), gtsEl("span", "gts-release-date", item.sub || ""));
    } else if (item.kind === "finaletitle") {
      node = gtsEl("div", "gts-finaletitle", item.text || "");
      node.style.left = `${item.x}px`; node.style.top = `${item.y}px`;
    } else if (item.kind === "swatches") {
      node = gtsEl("div", "gts-swatches");
      node.style.left = `${item.x}px`;
      node.style.top = `${item.y}px`;
      (item.colors || []).forEach((color) => {
        const chip = gtsEl("span", "");
        if (/^#[0-9a-f]{6}$/i.test(color)) chip.style.background = color;
        node.append(chip);
      });
    } else if (item.kind === "device") {
      node = gtsEl("div", "gts-device");
      gtsPlace(node, item);
      const screen = gtsEl("div", "gts-device-screen");
      if (/^#[0-9a-f]{6}$/i.test(item.fill || "")) screen.style.background = item.fill;
      node.append(screen);
    }
    if (node) board.append(node);
  });

  root.append(board);
  return [root];
}
