/* Sound-only collection: original native embeds, one consistent reading layout. */
function soundDesignLanguage() {
  return typeof currentLanguage === "string" ? currentLanguage : "en";
}

function setSoundDesignCopy(element, english, chinese = english) {
  if (!element) return;
  element.dataset.soundCopyEn = english || "";
  element.dataset.soundCopyZh = window.zhCNTranslations?.get(english) || chinese || english || "";
  element.textContent = soundDesignLanguage() === "zh"
    ? element.dataset.soundCopyZh
    : element.dataset.soundCopyEn;
}

function updateSoundDesignLanguage(language = soundDesignLanguage()) {
  document.querySelectorAll("[data-sound-copy-en]").forEach((element) => {
    element.textContent = language === "zh"
      ? element.dataset.soundCopyZh || element.dataset.soundCopyEn
      : element.dataset.soundCopyEn;
  });
}

function renderSoundDesignBlock(block) {
  if (block.type !== "sound-showcase") return [];
  const root = document.createElement("section");
  root.className = "sound-showcase";
  const order = ["external-blood-vessel", "water-babies", "swrd", "spirited-expedition", "utopia-2419"];
  const items = [...(block.items || [])].sort((a, b) => order.indexOf(a.projectId) - order.indexOf(b.projectId));
  items.forEach((item, index) => {
    const article = document.createElement("article");
    article.className = `sound-project sound-project--${item.projectId}`;
    const header = document.createElement("header");
    header.className = "sound-project-header";
    const meta = document.createElement("p");
    meta.className = "sound-project-meta";
    setSoundDesignCopy(
      meta,
      "PROJECT " + String(index + 1).padStart(2, "0") + " / " + item.year,
      "项目 " + String(index + 1).padStart(2, "0") + " / " + item.year,
    );
    const title = document.createElement("h3");
    setSoundDesignCopy(title, item.title, item.titleZh || item.title);
    const jump = document.createElement("button");
    jump.type = "button";
    jump.className = "sound-project-jump";
    const jumpLabel = document.createElement("span");
    setSoundDesignCopy(jumpLabel, "View full project", "查看完整项目");
    const jumpIcon = document.createElement("span");
    jumpIcon.className = "sound-project-jump-icon";
    jumpIcon.setAttribute("aria-hidden", "true");
    jumpIcon.textContent = "↗";
    jump.append(jumpLabel, jumpIcon);
    jump.addEventListener("click", () => {
      const target = detailProjectCards.find((card) => card.dataset.projectId === item.projectId);
      if (target) openProject(target, { scrollY: projectReturnScrollY });
    });
    header.append(meta, title, jump);
    const layout = document.createElement("div");
    layout.className = "sound-project-layout";
    const context = document.createElement("aside");
    context.className = "sound-project-context";
    const coverSource = safeProjectAsset(item.cover);
    if (coverSource) {
      const cover = document.createElement("img");
      cover.src = versionProjectImageAsset(coverSource);
      cover.alt = soundDesignLanguage() === "zh" ? `${item.titleZh || item.title} 项目图像` : `${item.title} artwork`;
      cover.width = 264;
      cover.height = 264;
      cover.loading = index === 0 ? "eager" : "lazy";
      cover.decoding = "async";
      context.append(cover);
    }
    const subtitle = document.createElement("h4");
    setSoundDesignCopy(subtitle, item.subtitle, item.subtitleZh || item.subtitle);
    const description = document.createElement("p");
    setSoundDesignCopy(description, item.description, item.descriptionZh || item.description);
    context.append(subtitle, description);
    const media = document.createElement("div");
    media.className = "sound-project-embeds";
    const blocks = [];
    if (item.video) {
      const videoTitle = soundDesignLanguage() === "zh"
        ? item.video.titleZh || item.video.title
        : item.video.title;
      blocks.push({ ...item.video, title: videoTitle, type: "video", layout: "full", caption: videoTitle });
    }
    if (item.projectId === "external-blood-vessel") blocks.push({
      type: "video", provider: "vimeo", id: "1222444084", layout: "full",
      title: soundDesignLanguage() === "zh" ? "功能原型测试" : "Functional Prototype Test",
      caption: soundDesignLanguage() === "zh" ? "功能原型 — 手势到声音的实时响应" : "Functional prototype — gesture-to-sound response"
    });
    if (item.loopVideos?.length) blocks.push({
      type: "utopia-video-trio", layout: "full", items: item.loopVideos
    });
    if (item.tracks?.length) blocks.push({
      type: "soundcloud-stack",
      layout: "full",
      tracks: item.tracks.map((track) => ({
        ...track,
        title: soundDesignLanguage() === "zh" ? track.titleZh || track.title : track.title,
      })),
    });
    renderProjectBlocks(media, blocks);
    const videoCopies = [];
    if (item.video) videoCopies.push([
      item.video.title,
      item.video.titleZh || item.video.title,
    ]);
    if (item.projectId === "external-blood-vessel") videoCopies.push([
      "Functional prototype — gesture-to-sound response",
      "功能原型 — 手势到声音的实时响应",
    ]);
    media.querySelectorAll(".project-content-video-caption").forEach((caption, captionIndex) => {
      const copy = videoCopies[captionIndex];
      if (copy) setSoundDesignCopy(caption, copy[0], copy[1]);
    });
    media.querySelectorAll(".project-soundcloud-stack-item h5").forEach((heading, trackIndex) => {
      const track = item.tracks?.[trackIndex];
      if (track) setSoundDesignCopy(heading, track.title, track.titleZh || track.title);
    });
    layout.append(context, media);
    article.append(header, layout);
    root.append(article);
  });
  return [root];
}
