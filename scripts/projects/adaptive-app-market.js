/* App Market 2.0: project-scoped device compositions and motion. */
(() => {
  const sheet = document.querySelector(".project-sheet");
  if (!sheet) return;

  const projectId = "adaptive-app-market";
  const base = "assets/projects/adaptive-app-market/";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let setupFrame = 0;
  let visibilityObserver = null;

  const asset = (name) => name.startsWith("assets/") ? name : `${base}${name}`;
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (typeof text === "string") node.textContent = text;
    return node;
  };
  const image = (file, alt, className) => {
    const node = el("img", className);
    node.src = asset(file);
    node.alt = alt || "";
    node.loading = "lazy";
    node.decoding = "async";
    node.draggable = false;
    return node;
  };
  const caption = (eyebrow, title, body) => {
    const node = el("figcaption", "am-caption");
    node.append(el("span", "am-caption-kicker", eyebrow), el("strong", "am-caption-title", title));
    if (body) node.append(el("p", "am-caption-body", body));
    return node;
  };

  const statusImage = (tone = "light", tablet = false) => {
    const file = tablet
      ? "tablet-status-on-light-png-web.webp"
      : tone === "dark" ? "phone-status-on-dark-png-web.webp" : "phone-status-on-light-png-web.webp";
    const bar = image(file, "", tablet ? "am-tablet-status" : "am-phone-status");
    bar.setAttribute("aria-hidden", "true");
    return bar;
  };

  const makePhone = ({screen, title, eyebrow, body, scroll = false, status = "light", tabbar = false, tabbarFile = "phone-tabbar-png-web.webp", bottomAction = ""}) => {
    const figure = el("figure", `am-phone${scroll ? " is-scroll-phone" : ""}`);
    const shell = el("div", "am-phone-shell am-observe");
    const viewport = el("div", "am-phone-viewport");
    const screenImage = image(screen, `${title} phone interface`, "am-phone-screen");
    viewport.append(screenImage, statusImage(status));
    const frame = image("phone-frame-2025-png-web.webp", "", "am-phone-frame");
    frame.setAttribute("aria-hidden", "true");
    if (tabbar) {
      const tabbarImage = image(tabbarFile, "", "am-phone-tabbar");
      tabbarImage.setAttribute("aria-hidden", "true");
      viewport.append(tabbarImage);
    }
    if (bottomAction) {
      const actionImage = image(bottomAction, "", "am-phone-detail-action");
      actionImage.setAttribute("aria-hidden", "true");
      viewport.append(actionImage);
    }
    shell.append(viewport, frame);
    figure.append(shell, caption(eyebrow, title, body));
    return figure;
  };

  const makeTablet = (screen, title, eyebrow) => {
    const figure = el("figure", "am-tablet");
    const device = el("div", "am-tablet-device");
    device.append(
      image(screen, `${title} tablet interface`, "am-tablet-screen"),
      statusImage("light", true),
      image("tablet-frame-2025-png-web.webp", "", "am-tablet-frame")
    );
    device.lastElementChild.setAttribute("aria-hidden", "true");
    figure.append(device, caption(eyebrow, title));
    return figure;
  };

  const makeHandheld = ({video, screen, title, eyebrow, featured = false}) => {
    const figure = el("figure", `am-handheld${featured ? " is-featured" : ""}`);
    const device = el("div", "am-handheld-device am-observe");
    if (video) {
      const media = el("video", "am-handheld-screen");
      setProjectMediaSource(media, asset(video));
      media.muted = true;
      media.defaultMuted = true;
      media.loop = true;
      media.playsInline = true;
      media.preload = "metadata";
      media.setAttribute("muted", "");
      media.setAttribute("playsinline", "");
      media.setAttribute("aria-label", `${title} interaction loop`);
      device.append(media);
      bindProjectManagedVideo(media);
    } else {
      device.append(image(screen, `${title} handheld interface`, "am-handheld-screen"));
    }
    const frame = image("handheld-frame-transparent-png-web.webp", "", "am-handheld-frame");
    frame.setAttribute("aria-hidden", "true");
    device.append(frame);
    figure.append(device, caption(eyebrow, title));
    return figure;
  };

  const makeStateCard = ({screen, eyebrow, title, body}) => {
    const card = el("article", "am-state-card");
    const media = el("div", "am-state-media");
    media.append(image(screen, `${title} screen`));
    card.append(media, caption(eyebrow, title, body));
    return card;
  };

  const makePhoneAnalysis = ({screen, eyebrow, title, body, component}) => {
    const card = el("article", "am-phone-analysis-card");
    card.append(makePhone({screen, eyebrow, title, body, status:"light"}));
    const peek = el("aside", "am-component-peek");
    const crop = el("div", "am-component-crop");
    crop.append(image(screen, "", "am-component-image"));
    peek.append(el("span", "am-component-label", "COMPONENT"), el("strong", "", component), crop);
    card.append(peek);
    return card;
  };

  const keepCopy = (block) => {
    const copy = block.querySelector(":scope > .project-content-copy");
    block.replaceChildren();
    if (copy) block.append(copy);
    return copy;
  };

  const makeRibbonScreen = (screen, label) => {
    const card = el("figure", "am-ribbon-phone");
    const shell = el("div", "am-ribbon-shell");
    const viewport = el("div", "am-ribbon-viewport");
    viewport.append(image(screen, `${label} application screen`), statusImage("light"));
    const frame = image("phone-frame-2025-png-web.webp", "", "am-ribbon-frame");
    frame.setAttribute("aria-hidden", "true");
    shell.append(viewport, frame);
    card.append(shell, el("figcaption", "", label));
    return card;
  };

  const makeMiniScreen = ({screen, label, body, scroll = false, status = "light"}) => {
    const figure = el("figure", `am-mini-screen${scroll ? " is-mini-scroll" : ""}`);
    const viewport = el("div", "am-mini-screen-viewport am-observe");
    viewport.append(image(screen, `${label} interface`, "am-mini-screen-image"), statusImage(status));
    figure.append(viewport, caption("RELATED VIEW", label, body));
    return figure;
  };

  const makeFanScreen = ({screen, title, index}) => {
    const figure = el("figure", `am-fan-screen is-fan-${index}`);
    const viewport = el("div", "am-fan-ui");
    viewport.append(image(screen, `${title} interface`), statusImage("light"));
    figure.append(viewport, el("figcaption", "", title));
    return figure;
  };

  const makeBareScreen = ({screen, title, className = "", status = "light"}) => {
    const figure = el("figure", `am-bare-screen${className ? ` ${className}` : ""}`);
    const viewport = el("div", "am-bare-viewport");
    viewport.append(image(screen, `${title} interface`), statusImage(status));
    figure.append(viewport, el("figcaption", "", title));
    return figure;
  };

  const renderPartnerContext = (block) => {
    keepCopy(block);
    const metrics = el("div", "am-metric-strip");
    [
      ["04", "Partner identities", "100%"],
      ["03", "Device formats", "76%"],
      ["05", "Lifecycle moments", "88%"],
      ["01", "Shared foundation", "52%"]
    ].forEach(([value, label, size]) => {
      const item = el("article", "am-metric");
      item.style.setProperty("--am-metric-size", size);
      item.append(el("strong", "", value), el("span", "", label), el("i"));
      metrics.append(item);
    });

    const story = el("figure", "am-partner-overview");
    const product = el("div", "am-partner-device");
    product.append(
      image("zenfone-12-ultra-official-png-web.webp", "Official ASUS Zenfone 12 Ultra product image", "am-partner-device-image"),
      el("span", "am-partner-device-note", "OFFICIAL DEVICE EXAMPLE / ASUS ZENFONE 12 ULTRA")
    );
    const scope = el("figcaption", "am-partner-scope");
    scope.append(
      el("span", "am-overline", "DELIVERY FOOTPRINT"),
      el("strong", "", "A real product system, not a single branded skin."),
      el("p", "", "Tencent MyApp content was adapted into system-level storefronts for partner hardware. The shared foundation covers discovery, decision, installation and management while each product keeps its own brand expression and input model.")
    );
    const lanes = el("div", "am-partner-lanes");
    [["MOBILE", "Tencent · ROG · REDMAGIC · nubia", "Phone and tablet storefronts"], ["HANDHELD", "Lenovo Legion C700", "Controller-first storefront"]].forEach(([label, brands, detail]) => {
      const lane = el("div", "am-partner-lane");
      lane.append(el("span", "", label), el("strong", "", brands), el("p", "", detail));
      lanes.append(lane);
    });
    scope.append(lanes);
    story.append(product, scope);
    block.append(metrics, story);
  };

  const renderPositioning = (block) => {
    keepCopy(block);
    const panel = el("div", "am-positioning-panel");
    const statement = el("div", "am-positioning-statement");
    statement.append(
      el("span", "am-overline", "SYSTEM-LEVEL APP MARKET"),
      el("strong", "am-positioning-title", "One architecture.\nFive brand systems."),
      el("p", "am-positioning-body", "A shared Tencent MyApp foundation adapts across mobile, tablet and handheld products without flattening each partner's identity.")
    );
    const brands = el("div", "am-brand-grid");
    [
      ["01", "nubia", "logo-nubia-wordmark.webp", "MOBILE"],
      ["02", "ROG", "logo-rog.svg", "MOBILE"],
      ["03", "Tencent", "assets/media/logo-tencent.svg", "MOBILE"],
      ["04", "REDMAGIC", "logo-redmagic-symbol.svg", "MOBILE"],
      ["05", "Lenovo", "", "HANDHELD"]
    ].forEach(([index, name, logo, family]) => {
      const item = el("div", "am-brand-item");
      const mark = logo ? image(logo, `${name} logo`, "am-brand-logo") : el("strong", "am-brand-wordmark", "Lenovo");
      item.append(el("span", "am-brand-index", index), mark, el("span", "am-brand-family", family));
      brands.append(item);
    });
    const metrics = el("div", "am-positioning-metrics");
    [["6M+", "Developer network", "TENCENT OPEN PLATFORM · 2016"], ["4.6M", "App supply base", "TENCENT OPEN PLATFORM · 2016"]].forEach(([value, label, source]) => {
      const metric = el("article", "am-positioning-metric");
      metric.append(el("strong", "", value), el("span", "", label), el("small", "", source));
      metrics.append(metric);
    });
    const devices = el("div", "am-positioning-devices");
    const phone = makePhone({screen:"phone-home-2026-jpg-web.webp", title:"Phone", eyebrow:"MOBILE", status:"light"});
    phone.classList.add("is-overview-phone");
    const tablet = makeTablet("tablet-home-png-web.webp", "Tablet", "LANDSCAPE");
    tablet.classList.add("is-overview-tablet");
    const handheld = makeHandheld({screen:"handheld-games-png-web.webp", title:"Handheld", eyebrow:"CONTROLLER"});
    handheld.classList.add("is-overview-handheld");
    devices.append(tablet, phone, handheld);
    panel.append(statement, devices, brands, metrics);
    block.append(panel);
  };

  const renderSystem = (block) => {
    keepCopy(block);
    const board = el("figure", "am-system-board");
    board.append(image("design-system-board-png-web.webp", "Adaptive brand, icon, typography and component specification"));
    const tokens = el("div", "am-token-row");
    ["Brand color follows device", "Unified icon geometry", "Shared type hierarchy", "Reusable components"].forEach((label, index) => {
      const item = el("div", "am-token");
      item.append(el("span", "am-token-number", `0${index + 1}`), el("strong", "", label));
      tokens.append(item);
    });
    block.append(board, tokens);
  };

  const renderPhoneLoop = (block) => {
    keepCopy(block);
    const layout = el("div", "am-phone-loop-layout am-phone-discovery-layout");
    const devices = el("div", "am-phone-loop-devices");
    devices.append(
      makePhone({screen:"phone-home-2026-jpg-web.webp", title:"Home", eyebrow:"DISCOVERY", scroll:true, status:"light", tabbar:true, tabbarFile:"phone-tabbar-home-2026-jpg-web.webp"}),
      makePhone({screen:"phone-games-2026-v3-jpg-web.webp", title:"Games", eyebrow:"BROWSE", scroll:true, status:"light", tabbar:true, tabbarFile:"phone-tabbar-games-2026-jpg-web.webp"})
    );
    const branch = el("aside", "am-discovery-branch");
    branch.append(
      el("span", "am-branch-label", "FROM GAMES"),
      makeMiniScreen({screen:"phone-new-releases-2026-jpg-web.webp", label:"New Releases", body:"A focused secondary destination reached from the Games navigation."})
    );
    layout.append(devices, branch);

    const appsCopy = el("div", "am-inline-section-copy");
    appsCopy.append(
      el("span", "", "APPS / CATEGORY ENTRY"),
      el("h5", "", "Apps Has Its Own Discovery Rhythm"),
      el("p", "", "Category shortcuts narrow intent first; the Apps feed then carries editorial and ranked modules in a continuous surface.")
    );
    const appsLayout = el("div", "am-apps-composition");
    const related = el("div", "am-apps-related");
    related.append(
      makeMiniScreen({screen:"phone-category-2026-jpg-web.webp", label:"Category", body:"Browse by task and genre."}),
      makeMiniScreen({screen:"phone-category-video-2026-jpg-web.webp", label:"Video", body:"A focused category list."}),
      makeMiniScreen({screen:"phone-new-releases-2026-jpg-web.webp", label:"New Releases", body:"Editorial entry from the category layer."})
    );
    const appsPhone = makePhone({screen:"phone-apps-2026-jpg-web.webp", title:"Apps", eyebrow:"CONTINUOUS FEED", scroll:true, status:"light", tabbar:true, tabbarFile:"phone-tabbar-apps-2026-jpg-web.webp"});
    appsPhone.classList.add("am-apps-primary");
    appsLayout.append(related, appsPhone);
    block.append(layout, appsCopy, appsLayout);
  };

  const renderPhoneComponents = (block) => {
    keepCopy(block);
    const hero = el("figure", "am-phone-component-hero");
    hero.append(image("phone-component-overview-2026-jpg-web.webp", "App Market modular phone storefront and reusable discovery components"));
    block.append(hero);
  };

  const renderPhoneStates = (block) => {
    const detailCopy = keepCopy(block);
    detailCopy?.remove();
    const secondaryCopy = el("div", "project-content-copy am-secondary-copy");
    secondaryCopy.append(
      el("span", "", "MY / ACCOUNT AND LIFECYCLE"),
      el("h4", "", "One Personal Hub, Multiple Management Tasks"),
      el("p", "", "Signed-in and signed-out states share one profile shell. Dashed paths connect the primary account page to settings, updates, uninstall and campaign destinations.")
    );
    const profileStage = el("div", "am-profile-stage am-profile-flow-stage");
    const profilePair = el("div", "am-profile-pair");
    const guest = makePhone({screen:"phone-profile-guest-2026-jpg-web.webp", title:"Me", eyebrow:"SIGNED OUT", status:"light"});
    guest.classList.add("am-profile-guest");
    const profileLead = makePhone({screen:"phone-profile-signed-2026-jpg-web.webp", title:"Me", eyebrow:"SIGNED IN", status:"light"});
    profileLead.classList.add("am-profile-lead");
    profilePair.append(guest, profileLead);
    const connectors = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    connectors.setAttribute("class", "am-profile-connectors");
    connectors.setAttribute("viewBox", "0 0 1000 740");
    connectors.setAttribute("aria-hidden", "true");
    connectors.innerHTML = `
      <g fill="none" stroke="rgba(76,105,173,.68)" stroke-width="1.3" stroke-dasharray="4 4">
        <path d="M440 154 H698"/>
        <path d="M440 452 H565 V365 H891"/>
        <path d="M440 486 H698"/>
        <path d="M440 584 H565 V712 H891"/>
      </g>
      <g fill="#fff" stroke="#5f78b5" stroke-width="1.8">
        <circle cx="440" cy="154" r="4.6"/><circle cx="440" cy="452" r="4.6"/>
        <circle cx="440" cy="486" r="4.6"/><circle cx="440" cy="584" r="4.6"/>
      </g>`;
    const branches = el("div", "am-profile-branches");
    [
      ["phone-special-topic-2026-jpg-web.webp", "Campaign", "is-topic"],
      ["phone-updates-2026-jpg-web.webp", "Updates", "is-updates"],
      ["phone-uninstall-2026-jpg-web.webp", "Uninstall", "is-uninstall"],
      ["phone-settings-2026-jpg-web.webp", "Settings", "is-settings"]
    ].forEach(([screen, title, className]) => branches.append(makeBareScreen({screen, title, className})));
    profileStage.append(profilePair, connectors, branches);

    const searchCopy = el("div", "project-content-copy am-search-copy");
    searchCopy.append(
      el("span", "", "SEARCH / INTENT AND RESULT STATES"),
      el("h4", "", "Search Responds to Every Level of Intent"),
      el("p", "", "Recent intent, featured matches, complete results and empty states remain part of one predictable search model.")
    );
    const searchStage = el("div", "am-search-stage");
    [
      ["phone-search-featured-2026-jpg-web.webp", "Featured Result"],
      ["phone-search-results-2026-jpg-web.webp", "All Results"],
      ["phone-search-2026-jpg-web.webp", "Search"],
      ["phone-search-empty-2026-jpg-web.webp", "No Results"]
    ].forEach(([screen, title], index) => searchStage.append(makeBareScreen({screen, title, className:`is-search-${index + 1}`})));

    const detailIntro = el("div", "project-content-copy am-detail-copy");
    detailIntro.append(
      el("span", "", "DETAIL SYSTEM / LIVE CAMPAIGN AND BETA"),
      el("h4", "", "One Game Detail, Different Release Moments"),
      el("p", "", "Honor of Kings keeps one information model across details, reviews and news. A persistent download action stays available while long content scrolls behind it.")
    );
    const grid = el("div", "am-state-grid");
    [
      ["phone-detail-2026-jpg-web.webp", "DETAIL", "Game Detail", "Long-form product content scrolls behind a fixed download action."],
      ["phone-detail-reviews-2026-jpg-web.webp", "COMMUNITY", "Reviews", "Ratings and reviews retain the same branded product context."],
      ["phone-detail-news-2026-jpg-web.webp", "CONTENT", "News", "Editorial updates extend the detail experience without a new destination."]
    ].forEach(([screen, eyebrow, title, body]) => grid.append(makePhone({screen, eyebrow, title, body, scroll:true, status:"dark", bottomAction:"phone-detail-action-2026-png-web.webp"})));
    const beta = el("aside", "am-beta-detail");
    beta.append(
      makeMiniScreen({screen:"phone-detail-beta-2026-jpg-web.webp", label:"Beta Phase", body:"A distinct pre-release state within the same detail system.", status:"dark"})
    );
    const detailStage = el("div", "am-detail-stage");
    detailStage.append(grid, beta);
    block.append(secondaryCopy, profileStage, searchCopy, searchStage, detailIntro, detailStage);
  };

  const renderPhoneFlow = (block) => {
    keepCopy(block);
    const journey = el("div", "am-journey-panel");
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 1440 620");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = `
      <defs>
        <linearGradient id="amJourneyA" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#52a9f5" stop-opacity=".98"/>
          <stop offset=".82" stop-color="#7fd5f2" stop-opacity=".92"/>
          <stop offset=".94" stop-color="#7fd5f2" stop-opacity=".42"/>
          <stop offset="1" stop-color="#7fd5f2" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="amJourneyB" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stop-color="#75eee6" stop-opacity=".98"/>
          <stop offset=".82" stop-color="#8edff0" stop-opacity=".92"/>
          <stop offset=".94" stop-color="#8edff0" stop-opacity=".42"/>
          <stop offset="1" stop-color="#8edff0" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <g>
        <path d="M-220 319 C-150 112 3.125 112 73.125 319 L-220 319Z" fill="url(#amJourneyA)"/>
        <path d="M73.125 319 C143.685 450 254.565 450 325.125 319 L73.125 319Z" fill="url(#amJourneyB)"/>
        <path d="M325.125 319 C395.685 112 506.565 112 577.125 319 L325.125 319Z" fill="url(#amJourneyA)"/>
        <path d="M577.125 319 C647.685 486 758.565 486 829.125 319 L577.125 319Z" fill="url(#amJourneyB)"/>
        <path d="M829.125 319 C909.765 108 1036.485 108 1117.125 319 L829.125 319Z" fill="url(#amJourneyA)"/>
        <path d="M1117.125 319 C1208.93 470 1353.195 470 1445 319 L1117.125 319Z" fill="url(#amJourneyB)"/>
      </g>
      <g fill="none" stroke="#b8c7df" stroke-width="1.4" stroke-dasharray="5 7" opacity=".58">
        <path d="M-220 319 C-150 450 3.125 450 73.125 319"/>
        <path d="M73.125 319 C143.685 174 254.565 174 325.125 319"/>
        <path d="M325.125 319 C395.685 512 506.565 512 577.125 319"/>
        <path d="M577.125 319 C647.685 138 758.565 138 829.125 319"/>
        <path d="M829.125 319 C909.765 516 1036.485 516 1117.125 319"/>
        <path d="M1117.125 319 C1208.93 154 1353.195 154 1445 319"/>
      </g>
      <g fill="none" stroke="#aab8cf" stroke-width="1.2" opacity=".78">
        <path d="M73.125 319V103"/><path d="M325.125 319V535"/><path d="M577.125 319V103"/><path d="M829.125 319V535"/><path d="M1117.125 319V103"/>
      </g>
      <g fill="#fff" stroke="#8b9bb5" stroke-width="1.5">
        <circle cx="73.125" cy="103" r="5"/><circle cx="73.125" cy="319" r="7"/>
        <circle cx="325.125" cy="535" r="5"/><circle cx="325.125" cy="319" r="7"/>
        <circle cx="577.125" cy="103" r="5"/><circle cx="577.125" cy="319" r="7"/>
        <circle cx="829.125" cy="535" r="5"/><circle cx="829.125" cy="319" r="7"/>
        <circle cx="1117.125" cy="103" r="5"/><circle cx="1117.125" cy="319" r="7"/>
      </g>
      <g fill="rgba(255,255,255,.72)" font-family="Arial, sans-serif" font-size="76" font-weight="300" text-anchor="middle">
        <text x="199.125" y="407">01</text><text x="451.125" y="244">02</text><text x="703.125" y="426">03</text>
        <text x="973.125" y="240">04</text><text x="1281.06" y="407">05</text>
      </g>
    `;
    journey.append(svg);
    [
      ["Discover", "Browse Home, Games and category shelves to form an initial intent."],
      ["Evaluate", "Compare product detail, reviews, editorial updates and campaign benefits."],
      ["Install", "Keep download progress and safety feedback visible while content continues."],
      ["Activate", "Return through rewards, campaigns and launch moments that create value."],
      ["Manage", "Use Me, updates, uninstall and settings as one clear ownership hub."]
    ].forEach(([title, body]) => {
      const step = el("article", "am-journey-step");
      step.append(el("strong", "", title), el("p", "", body));
      journey.append(step);
    });

    const marquee = el("div", "am-screen-marquee");
    const rows = [
      [["phone-home-2026-jpg-web.webp", "HOME"], ["phone-games-2026-v3-jpg-web.webp", "GAMES"], ["phone-new-releases-2026-jpg-web.webp", "NEW"], ["phone-category-2026-jpg-web.webp", "CATEGORY"], ["phone-profile-signed-2026-jpg-web.webp", "MY"], ["phone-history-2026-jpg-web.webp", "HISTORY"], ["phone-detail-news-2026-jpg-web.webp", "NEWS"], ["phone-opening-ad-2026-jpg-web.webp", "OPENING"]],
      [["phone-apps-2026-jpg-web.webp", "APPS"], ["phone-category-video-2026-jpg-web.webp", "VIDEO"], ["phone-profile-guest-2026-jpg-web.webp", "SIGNED OUT"], ["phone-benefits-detail-2026-jpg-web.webp", "BENEFITS"], ["phone-tencent-2026-jpg-web.webp", "TENCENT"], ["phone-detail-reviews-2026-jpg-web.webp", "REVIEWS"], ["phone-detail-beta-2026-jpg-web.webp", "BETA"]]
    ];
    rows.forEach((items, rowIndex) => {
      const row = el("div", `am-marquee-row${rowIndex ? " is-reverse" : ""}`);
      const track = el("div", "am-marquee-track");
      [0, 1, 2].forEach((groupIndex) => {
        const group = el("div", "am-marquee-group");
        group.setAttribute("aria-hidden", groupIndex ? "true" : "false");
        items.forEach(([screen, label]) => group.append(makeRibbonScreen(screen, label)));
        track.append(group);
      });
      row.append(track);
      marquee.append(row);
    });
    block.append(journey, marquee);
  };

  const renderTabletHero = (block) => {
    keepCopy(block);
    const layout = el("div", "am-tablet-hero-layout");
    layout.append(makeTablet("tablet-home-png-web.webp", "Featured Home", "LANDSCAPE SHELF"));
    const notes = el("aside", "am-tablet-notes");
    [
      ["Persistent rail", "Primary destinations stay visible at viewing distance."],
      ["Wider modules", "Featured content and ranked lists can coexist without crowding."],
      ["Shared components", "Cards, app rows and install states remain consistent with phone."]
    ].forEach(([title, body]) => {
      const note = el("article", "am-note");
      note.append(el("strong", "am-note-title", title), el("p", "am-note-body", body));
      notes.append(note);
    });
    layout.append(notes);
    block.append(layout);
  };

  const renderTabletGrid = (block) => {
    keepCopy(block);
    const grid = el("div", "am-tablet-grid");
    [
      ["tablet-rankings-png-web.webp", "CHARTS", "Ranked discovery"],
      ["tablet-games-png-web.webp", "GAMES", "Focused game browsing"],
      ["tablet-bonus-png-web.webp", "PERKS", "New-user benefit"],
      ["tablet-top-pick-png-web.webp", "EDITORIAL", "Featured recommendation"]
    ].forEach(([screen, eyebrow, title]) => grid.append(makeTablet(screen, title, eyebrow)));
    block.append(grid);
  };

  const renderHandheldVideo = (block) => {
    const copy = keepCopy(block);
    const wrap = el("div", "am-handheld-video-layout");
    const hero = el("div", "am-handheld-hero");
    const context = el("aside", "am-device-context is-inline");
    context.append(
      el("span", "am-overline", "LENOVO / PARTNER HARDWARE"),
      el("strong", "", "Legion C700"),
      el("p", "", "Controller-first handheld · landscape marketplace · focus-led navigation")
    );
    const connector = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    connector.setAttribute("class", "am-device-context-connector");
    connector.setAttribute("viewBox", "0 0 1000 180");
    connector.setAttribute("aria-hidden", "true");
    connector.innerHTML = '<path d="M785 0 V176"/>';
    if (copy) {
      copy.querySelector("p")?.remove();
      copy.append(context);
    }
    hero.append(connector, makeHandheld({video:"handheld-home-mp4-web.mp4", title:"Handheld Home", eyebrow:"BROWSE", featured:true}));
    wrap.append(hero);
    const pair = el("div", "am-handheld-pair");
    pair.append(
      makeHandheld({video:"handheld-messages-mp4-web.mp4", title:"Messages", eyebrow:"SYSTEM FEEDBACK"}),
      makeHandheld({video:"handheld-game-detail-mp4-web.mp4", title:"Game Detail", eyebrow:"DECISION"})
    );
    wrap.append(pair);
    block.append(wrap);
  };

  const renderHandheldStates = (block) => {
    keepCopy(block);
    const grid = el("div", "am-handheld-state-grid");
    [
      ["handheld-profile-focus-2026-jpg-web.webp", "ACCOUNT", "Manage Apps at a Glance"],
      ["handheld-search-default-2026-jpg-web.webp", "SEARCH", "Start from Recent Intent"],
      ["handheld-games-focus-2026-jpg-web.webp", "DISCOVERY", "Browse with Visible Focus"]
    ].forEach(([screen, eyebrow, title]) => grid.append(makeHandheld({screen, eyebrow, title})));
    block.append(grid);
  };

  const renderHandheldFlow = (block) => {
    keepCopy(block);
    const panel = el("div", "am-controller-panel");
    const labels = [
      ["dpad", "D-PAD", "Move focus", "Navigate shelves and lists"],
      ["stick", "L-STICK", "Browse", "Move continuously across content"],
      ["a", "A", "Confirm", "Open, install or continue"],
      ["b", "B", "Return", "Move back without losing context"],
      ["x", "X", "Download", "Start the primary install action"],
      ["y", "Y", "Quick search", "Jump directly into discovery"]
    ];
    labels.forEach(([type, key, title, body], index) => {
      const item = el("article", "am-controller-step");
      const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      icon.setAttribute("viewBox", "0 0 64 64");
      icon.setAttribute("class", `am-controller-icon is-${type}`);
      icon.setAttribute("aria-hidden", "true");
      if (type === "dpad") {
        icon.innerHTML = '<circle cx="32" cy="32" r="30"/><path d="M27 19h10v8h8v10h-8v8H27v-8h-8V27h8z"/>';
      } else if (type === "stick") {
        icon.innerHTML = '<circle cx="32" cy="32" r="30"/><circle class="am-stick-base" cx="32" cy="35" r="12"/><circle class="am-stick-top" cx="32" cy="28" r="8"/>';
      } else {
        icon.innerHTML = `<circle cx="32" cy="32" r="30"/><text x="32" y="40" text-anchor="middle">${key}</text>`;
      }
      item.append(icon, el("span", "am-controller-index", `0${index + 1}`), el("strong", "", title), el("p", "", body));
      panel.append(item);
    });
    block.append(panel);
  };

  const renderers = {
    "market-positioning": renderPositioning,
    "market-partner-context": renderPartnerContext,
    "market-design-system": renderSystem,
    "market-phone-loop": renderPhoneLoop,
    "market-phone-components": renderPhoneComponents,
    "market-phone-states": renderPhoneStates,
    "market-phone-flow": renderPhoneFlow,
    "market-tablet-hero": renderTabletHero,
    "market-tablet-grid": renderTabletGrid,
    "market-handheld-video": renderHandheldVideo,
    "market-handheld-states": renderHandheldStates,
    "market-handheld-flow": renderHandheldFlow
  };

  // Route the two bent leaders through the gap beneath the left destination,
  // ending exactly on the right destination's screen edge in SVG coordinates.
  const alignProfileConnections = () => {
    const stage = sheet.querySelector('.am-profile-flow-stage');
    const svg = stage?.querySelector('.am-profile-connectors');
    const matrix = svg?.getScreenCTM();
    if (!matrix || !svg.getBoundingClientRect().width) return;
    const inverse = matrix.inverse();
    const paths = svg.querySelectorAll('path');
    [[0, '.is-topic', 154], [2, '.is-uninstall', 486]].forEach(([index, selector, sourceY]) => {
      const target = stage.querySelector(`${selector} .am-bare-viewport`);
      if (!target) return;
      const rect = target.getBoundingClientRect();
      const end = new DOMPoint(rect.left, rect.top).matrixTransform(inverse);
      paths[index].setAttribute('d', `M440 ${sourceY} H${end.x.toFixed(3)}`);
    });
    [[1, '.is-topic', '.is-updates', 452], [3, '.is-uninstall', '.is-settings', 584]].forEach(([index, leftSelector, rightSelector, sourceY]) => {
      const left = stage.querySelector(leftSelector);
      const right = stage.querySelector(`${rightSelector} .am-bare-viewport`);
      if (!left || !right) return;
      const leftRect = left.getBoundingClientRect();
      const rightRect = right.getBoundingClientRect();
      const scale = rightRect.width / right.offsetWidth;
      const endY = Math.min(rightRect.bottom - 12 * scale, Math.max(rightRect.top + 12 * scale, leftRect.bottom + 16 * scale));
      const end = new DOMPoint(rightRect.left, endY).matrixTransform(inverse);
      paths[index].setAttribute('d', `M440 ${sourceY} H565 V${end.y.toFixed(3)} H${end.x.toFixed(3)}`);
    });
  };

  // Measure the rendered circle, including SVG letterboxing and canvas zoom.
  // The grid travels with the content, so alignment remains stable on scroll.
  const alignJourneyGrid = () => {
    alignProfileConnections();
    const panel = sheet.querySelector('.am-journey-panel');
    const circle = panel?.querySelector('circle[r="7"]');
    if (!circle || !panel.getBoundingClientRect().width) return;
    panel.style.transform = 'none';
    const surface = sheet.getBoundingClientRect();
    const rect = circle.getBoundingClientRect();
    const style = getComputedStyle(sheet);
    const scale = Number(style.zoom) || surface.width / sheet.offsetWidth;
    const x = (rect.left + rect.width / 2 - surface.left) / scale - parseFloat(style.borderLeftWidth);
    const y = (rect.top + rect.height / 2 - surface.top) / scale + sheet.scrollTop - parseFloat(style.borderTopWidth);
    const dx = Math.round(x / 32) * 32 + .5 - x;
    const dy = Math.round(y / 32) * 32 + .5 - y;
    panel.style.transform = `translate(${dx}px, ${dy}px)`;
  };
  const journeyResizeObserver = new ResizeObserver(() => requestAnimationFrame(alignJourneyGrid));
  journeyResizeObserver.observe(sheet);
  sheet.addEventListener('scroll', alignJourneyGrid, {passive:true});
  sheet.addEventListener('load', () => requestAnimationFrame(alignJourneyGrid), true);
  document.fonts.ready.then(() => requestAnimationFrame(alignJourneyGrid));

  const bindVisibility = () => {
    visibilityObserver?.disconnect();
    visibilityObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("is-am-visible", entry.isIntersecting);
      });
    }, {root: document.getElementById('projectScroller'), threshold: 0.12});
    sheet.querySelectorAll(".am-observe").forEach((node) => visibilityObserver.observe(node));
  };

  const enhance = () => {
    setupFrame = 0;
    if (sheet.dataset.projectId !== projectId) {
      sheet.querySelector(".am-project-overview")?.remove();
      visibilityObserver?.disconnect();
      return;
    }
    Object.entries(renderers).forEach(([variant, renderer]) => {
      sheet.querySelectorAll(`[data-variant="${variant}"]:not([data-am-enhanced])`).forEach((block) => {
        renderer(block);
        block.dataset.amEnhanced = "true";
      });
    });
    const overviewBlocks = [
      ...sheet.querySelectorAll('[data-variant="market-positioning"], [data-variant="market-partner-context"]')
    ].filter((node) => !node.closest(".am-project-overview"));
    if (overviewBlocks.length) {
      let overview = sheet.querySelector(".am-project-overview");
      if (!overview) {
        overview = el("section", "am-project-overview");
        overview.setAttribute("aria-label", "Project overview");
        sheet.querySelector(".project-chapters")?.prepend(overview);
      }
      overview.replaceChildren(...overviewBlocks);
    }
    bindVisibility();
    requestAnimationFrame(alignJourneyGrid);
  };

  const schedule = () => {
    if (!setupFrame) setupFrame = requestAnimationFrame(enhance);
  };
  const observer = new MutationObserver(schedule);
  observer.observe(sheet, {childList:true, subtree:true, attributes:true, attributeFilter:["data-project-id"]});
  reducedMotion.addEventListener("change", schedule);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") schedule();
    else sheet.querySelectorAll(".am-handheld video").forEach((video) => video.pause());
  });
  schedule();
})();
