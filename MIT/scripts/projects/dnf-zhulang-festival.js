/* Project-only enhancement of shared media markup and activity banners. */
(() => {
  const sheet = document.querySelector(".project-sheet");
  if (!sheet) return;
  const projectId = "dnf-zhulang-festival";
  let setupFrame = 0;
  let balanceFrame = 0;

  const balanceMediaGroups = () => {
    balanceFrame = 0;
    if (sheet.dataset.projectId !== projectId) return;
    sheet.querySelectorAll([
      '[data-variant="progression-system"]',
      '[data-variant="event-system"]',
      '[data-variant="card-entry-system"]',
      '[data-variant="battle-system"]'
    ].join(",")).forEach((block) => {
      const group = block.querySelector(".project-media-group:not([data-loop-clone])");
      const feature = group?.children[0];
      const supporting = group?.children[1];
      if (!group || !feature || !supporting) return;
      const featureMedia = feature.querySelector(":scope > :is(video,img)");
      const supportingMedia = supporting.querySelectorAll(".project-media-rail-card > :is(video,img)");
      const lastSupportingMedia = supportingMedia[supportingMedia.length - 1];
      if (!featureMedia || !lastSupportingMedia) return;
      let low = 0.8;
      let high = 3.4;
      for (let index = 0; index < 12; index += 1) {
        const ratio = (low + high) / 2;
        group.style.gridTemplateColumns = `${ratio}fr 1fr`;
        const delta = featureMedia.getBoundingClientRect().bottom
          - lastSupportingMedia.getBoundingClientRect().bottom;
        if (delta > 0) high = ratio;
        else low = ratio;
      }
      group.style.gridTemplateColumns = `${(low + high) / 2}fr 1fr`;
    });
  };
  const requestBalance = () => {
    if (!balanceFrame && sheet.dataset.projectId === projectId) {
      balanceFrame = requestAnimationFrame(balanceMediaGroups);
    }
  };

  const enhance = () => {
    setupFrame = 0;
    if (sheet.dataset.projectId !== projectId) {
      sheet.querySelectorAll(".dnf-event-introduction").forEach((intro) => intro.remove());
      sheet.querySelectorAll(".dnf-activity-banner").forEach((banner) => banner.remove());
      sheet.querySelectorAll(".is-dnf-banner-source").forEach((source) => source.classList.remove("is-dnf-banner-source"));
      sheet.querySelectorAll(".is-dnf-activity-title").forEach((title) => title.classList.remove("is-dnf-activity-title", "is-activity-1", "is-activity-2"));
      return;
    }
    // Split/reparent captions from their English source, not a translated node;
    // new text nodes must retain a reversible baseline on Chinese-first entry.
    if (typeof translatePortfolioTree === "function") translatePortfolioTree(sheet, "en");
    const chapters = sheet.querySelector(".project-chapters");
    chapters?.querySelectorAll(":scope > .project-chapter-titlebar").forEach((titlebar, index) => {
      const chapter = titlebar.nextElementSibling?.classList.contains("project-chapter")
        ? titlebar.nextElementSibling
        : null;
      const opener = chapter?.querySelector('[data-variant="game-opener"]');
      const sourceImage = opener?.querySelector(":scope > img");
      if (!sourceImage) return;
      titlebar.classList.add("is-dnf-activity-title", `is-activity-${index + 1}`);
      if (titlebar.previousElementSibling?.classList.contains("dnf-activity-banner")) return;
      const banner = document.createElement("figure");
      banner.className = `dnf-activity-banner is-activity-${index + 1}`;
      const image = document.createElement("img");
      image.src = sourceImage.currentSrc || sourceImage.src;
      image.alt = sourceImage.alt;
      image.decoding = "async";
      image.draggable = false;
      banner.append(image);
      opener.classList.add("is-dnf-banner-source");
      titlebar.before(banner);
    });
    // Shared captions are plain text. Separate title/body without changing other projects.
    sheet.querySelectorAll(".project-media-rail-card figcaption").forEach((caption) => {
      if (caption.dataset.dnfCaption) return;
      const [heading, ...lines] = caption.textContent.trim().split("\n");
      const title = document.createElement("strong");
      title.textContent = heading;
      caption.replaceChildren(title);
      if (lines.length) {
        const copy = document.createElement("p");
        copy.textContent = lines.join(" ");
        caption.append(copy);
      }
      caption.classList.add(["UI", "UX"].includes(heading.toUpperCase())
        ? "is-dnf-compact-caption"
        : "is-dnf-detailed-caption");
      caption.dataset.dnfCaption = "true";
    });
    const intro = sheet.querySelector('.project-chapter [data-variant="festival-intro"]');
    if (intro) {
      const entryImage = intro.querySelector(":scope > img");
      if (entryImage && !intro.querySelector(".dnf-event-image")) {
        const entryFigure = document.createElement("figure");
        entryFigure.className = "dnf-event-image";
        entryImage.before(entryFigure);
        entryFigure.append(entryImage);
        const entryCaption = document.createElement("figcaption");
        entryCaption.textContent = "DNF activity entry · in-game capture";
        entryFigure.append(entryCaption);
      }
      const introCopy = intro.querySelector(".project-content-copy");
      if (introCopy && !introCopy.querySelector(".dnf-event-meta")) {
        const meta = document.createElement("div");
        meta.className = "dnf-event-meta";
        const icon = document.createElement("img");
        icon.className = "dnf-event-icon";
        icon.src = "assets/projects/dnf-zhulang-festival/dnf-game-icon-png-web.webp";
        icon.alt = "Dungeon & Fighter icon";
        const label = introCopy.querySelector(":scope > span");
        meta.append(icon);
        if (label) meta.append(label);
        introCopy.prepend(meta);
      }
      sheet.querySelectorAll(".dnf-event-introduction").forEach((old) => old.remove());
      intro.classList.add("dnf-event-introduction");
      sheet.querySelector(".project-chapters").prepend(intro);
    }
    const progression = sheet.querySelector('[data-variant="inn-upgrade-progression"]');
    if (progression && !progression.querySelector(".dnf-progression-caption")) {
      const progressionImage = progression.querySelector(":scope > img");
      const progressionCopy = progression.querySelector(":scope > .project-content-copy");
      const progressionLabel = progressionCopy?.querySelector(":scope > span");
      if (progressionImage && progressionCopy) {
        if (progressionLabel) {
          const progressionCaption = document.createElement("figcaption");
          progressionCaption.className = "dnf-progression-caption";
          progressionCaption.textContent = progressionLabel.textContent;
          progressionImage.after(progressionCaption);
        }
        progressionCopy.remove();
      }
    }
    const innCopy = sheet.querySelector('[data-variant="inn-overview"] .project-content-copy');
    if (innCopy && !innCopy.querySelector(".dnf-npc-comparison")) {
      const comparison = document.createElement("div");
      comparison.className = "dnf-npc-comparison";
      comparison.innerHTML = `
        <figure class="dnf-npc-item is-interactive">
          <img src="assets/projects/dnf-zhulang-festival/inn-interactive-npcs-jpg-web.webp" alt="Three interactive inn NPCs" loading="lazy" decoding="async">
          <figcaption><strong>Interactive NPCs</strong></figcaption>
        </figure>
        <figure class="dnf-npc-item">
          <img src="assets/projects/dnf-zhulang-festival/inn-ambient-npcs-jpg-web.webp" alt="Ambient characters inside the inn" loading="lazy" decoding="async">
          <figcaption><strong>Ambient NPCs</strong></figcaption>
        </figure>`;
      innCopy.append(comparison);
    }
    sheet.querySelectorAll(".project-media-rail-card > video").forEach((media) => {
      if (media.dataset.dnfBalanceListener) return;
      media.addEventListener("loadedmetadata", requestBalance, {once:true});
      media.dataset.dnfBalanceListener = "true";
    });
    if (typeof translatePortfolioTree === "function") translatePortfolioTree(sheet);
    requestBalance();
    requestAnimationFrame(() => requestAnimationFrame(requestBalance));
  };
  const observer = new MutationObserver(() => {
    if (!setupFrame) setupFrame = requestAnimationFrame(enhance);
  });
  observer.observe(sheet, {childList: true, subtree: true, attributes: true, attributeFilter: ["data-project-id"]});
  sheet.addEventListener("load", requestBalance, true);
  new ResizeObserver(requestBalance).observe(sheet);
  window.addEventListener("resize", requestBalance, {passive: true});
  enhance();
})();
