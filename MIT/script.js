const canvas = document.querySelector("#dotField");
const ctx = canvas.getContext("2d", { alpha: true });
const cursorDot = document.querySelector("#cursorDot");
const physicsPlayground = document.querySelector("#heroPhysics");
const physicsTokens = [...document.querySelectorAll(".gravity-object")];
const languageToggle = document.querySelector("#languageToggle");
const languageButtons = [...document.querySelectorAll("[data-language-option]")];
const sectionNavigationLinks = [
  ...document.querySelectorAll('.index-nav a[href^="#"], .brand-mark[href^="#"]'),
];
const workFilterButtons = [...document.querySelectorAll(".work-filter")];
const projectCards = [...document.querySelectorAll(".case-card[data-category]")];
const preferredWorkOrder = [
  "external-blood-vessel",
  "water-babies",
  "show-e-motions",
  "the-red-dawn",
  "cloud-island-device",
  "olive-town",
  "tencent-cloud-gaming",
  "spirited-expedition",
  "utopia-2419",
  "gangstar-bite-me",
  "adaptive-app-market",
  "visual-editor",
  "florahaven",
  "poka-project-p",
  "dnf-zhulang-festival",
  "swrd",
  "sound-design"
];
const filterWorkOrders = {
  "all": [
    "external-blood-vessel",
    "water-babies",
    "show-e-motions",
    "the-red-dawn",
    "cloud-island-device",
    "olive-town",
    "tencent-cloud-gaming",
    "spirited-expedition",
    "utopia-2419",
    "gangstar-bite-me"
  ],
  "embodied": [
    "external-blood-vessel",
    "water-babies",
    "show-e-motions",
    "the-red-dawn"
  ],
  "worlds": [
    "cloud-island-device",
    "olive-town",
    "utopia-2419",
    "tencent-cloud-gaming",
    "spirited-expedition",
    "gangstar-bite-me"
  ],
  "sound": [
    "sound-design",
    "external-blood-vessel",
    "water-babies",
    "swrd"
  ],
  "other": [
    "adaptive-app-market",
    "visual-editor",
    "florahaven",
    "poka-project-p",
    "dnf-zhulang-festival",
    "swrd"
  ]
};
const workCardDescriptors = new Map(projectCards.map((card) => {
  const label = card.querySelector(".case-info > p");
  return [card, label?.textContent.replace(/^\d+\s*\/\s*/, "") || ""];
}));
const workCardTitles = new Map(projectCards.map((card) => [
  card,
  card.querySelector(".case-info h3")?.textContent?.trim() || "",
]));
const workCardContexts = new Map(projectCards.map((card) => [
  card,
  card.querySelector(".case-details > span:first-child")?.textContent?.trim() || "",
]));
const preferredWorkIndex = new Map(preferredWorkOrder.map((id, index) => [id, index]));
projectCards.sort((first, second) => (
  (preferredWorkIndex.get(first.dataset.projectId) ?? Number.MAX_SAFE_INTEGER)
  - (preferredWorkIndex.get(second.dataset.projectId) ?? Number.MAX_SAFE_INTEGER)
));
const projectCardMap = document.querySelector(".case-map");
projectCards.forEach((card, index) => {
  projectCardMap?.append(card);
  const label = card.querySelector(".case-info > p");
  if (!label) return;
  const descriptor = workCardDescriptors.get(card);
  label.textContent = `${String(index + 1).padStart(2, "0")} / ${descriptor}`;
});
const detailProjectCards = projectCards.filter(
  (card) => card.dataset.projectId && card.dataset.locked !== "true",
);
const siteShell = document.querySelector(".site-shell");
const projectDetail = document.querySelector("#projectDetail");
const projectSheet = projectDetail?.querySelector(".project-sheet");
const projectCloseButtons = [...document.querySelectorAll("[data-project-close]")];
const projectScroller = document.getElementById("projectScroller");
const projectTopButton = document.querySelector("[data-project-top]");
const projectDetailTitle = document.querySelector("#projectDetailTitle");
const projectDetailSubtitle = document.querySelector("#projectDetailSubtitle");
const projectDetailCover = document.querySelector("#projectDetailCover");
const projectDetailHero = projectDetailCover?.closest(".project-sheet-hero");
const projectCoverOverlayTitle = document.querySelector("#projectCoverOverlayTitle");
const projectCoverOverlaySubtitle = document.querySelector("#projectCoverOverlaySubtitle");
const projectDetailIntroduction = document.querySelector("#projectDetailIntroduction");
const projectDetailFacts = document.querySelector("#projectDetailFacts");
const projectDetailYear = document.querySelector("#projectDetailYear");
const projectDetailYearLabel = document.querySelector("#projectDetailYearLabel");
const projectDetailReleaseFact = document.querySelector("#projectDetailReleaseFact");
const projectDetailReleaseDate = document.querySelector("#projectDetailReleaseDate");
const projectDetailPartners = document.querySelector("#projectDetailPartners");
const projectDetailCompanyLabel = document.querySelector("#projectDetailCompanyLabel");
const projectDetailGameFact = document.querySelector("#projectDetailGameFact");
const projectDetailGameLabel = document.querySelector("#projectDetailGameLabel");
const projectDetailGameLogo = document.querySelector("#projectDetailGameLogo");
const projectDetailGameName = document.querySelector("#projectDetailGameName");
const projectDetailGameLockup = document.querySelector("#projectDetailGameLockup");
const projectDetailYearFact = document.querySelector("#projectDetailYearFact");
const projectDetailRoles = document.querySelector("#projectDetailRoles");
const projectDetailTags = document.querySelector("#projectDetailTags");
const projectDetailRights = document.querySelector("#projectDetailRights");
const projectDetailRightsLogo = document.querySelector("#projectDetailRightsLogo");
const projectDetailRightsText = document.querySelector("#projectDetailRightsText");
const projectDetailVideo = document.querySelector("#projectDetailVideo");
const projectDetailVideoCaption = document.querySelector("#projectDetailVideoCaption");
const projectDetailVideoPlayer = document.querySelector("#projectDetailVideoPlayer");
const projectDetailVideoFrame = document.querySelector(".project-video-frame");
const projectGalleryImages = [...document.querySelectorAll("[data-project-image]")];
const projectSectionTitles = [...document.querySelectorAll("[data-project-section-title]")];
const projectSectionBodies = [...document.querySelectorAll("[data-project-section-body]")];
const projectSectionCaptions = [...document.querySelectorAll("[data-project-caption]")];
const projectSectionBlocks = [...document.querySelectorAll("[data-project-blocks]")];
const projectChapters = document.querySelector(".project-chapters");
const projectChapterElements = [...document.querySelectorAll(".project-chapter")];
const hoverQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

const grainCanvas = document.createElement("canvas");
const grainCtx = grainCanvas.getContext("2d", { alpha: true });
const grainSize = 180;
grainCanvas.width = grainSize;
grainCanvas.height = grainSize;
const inkBrushes = [];

let viewportWidth = window.innerWidth;
let viewportHeight = window.innerHeight;
let dpr = 1;
let grainPattern = null;
let lastGrainUpdate = -100;
let lastCanvasFrame = -100;
let previousTime = 0;
let inkDrops = [];
let lastInkX = -100;
let lastInkY = -100;
let physicsEngine = null;
let physicsBodies = [];
let physicsWalls = [];
let physicsSize = { width: 0, height: 0 };
let physicsVisible = true;
if (physicsPlayground) {
  new IntersectionObserver(([entry]) => { physicsVisible = entry.isIntersecting; }, { rootMargin: '80px 0px' }).observe(physicsPlayground);
}
let resizeFrame = 0;
let lastScrollY = window.scrollY;
let lastScrollTime = performance.now();
let scrollVelocity = 0;
let lastTrayKick = -1000;
let scrollStopTimer = 0;
let projectReturnFocus = null;
let projectScrollFrame = 0;
let projectTopPullFrame = 0;
let projectTopArrivalFrame = 0;
let projectTopPull = 0;
let projectTopPullTarget = 0;
let projectTopPullVelocity = 0;
let projectCoverLayers = [];
let projectDissolveLayers = [];
let projectHeroAspectRatio = 2;
let projectReturnScrollY = 0;
let activeProjectId = null;
let activeProjectFallbackCover = "none";
let currentLanguage = "en";
let projectVideoResetTimer = 0;
let cursorSuspendedByEmbed = false;
const projectDataCache = new Map();
let projectOpenSequence = 0;
/* Release revision: unchanged large media reuse the browser cache on return. */
const projectImageRevision = '20261006-51';
const projectDesktopCanvasWidth = 1280;
const localizedTextOriginals = new WeakMap();
let localizedAttributeOriginals = new WeakMap();

const pointer = {
  x: viewportWidth * 0.5,
  y: viewportHeight * 0.5,
  active: false,
};

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

function translatePortfolioTree(root, language = currentLanguage) {
  if (!root || !window.zhCNTranslations) return;
  const normalize = (value) => value.replace(/\s+/g, " ").trim().toLowerCase();
  const normalizedCopy = new Map([...window.zhCNTranslations].map(([en, zh]) => [normalize(en), zh]));

  const translateValue = (value) => {
    const leading = value.match(/^\s*/)?.[0] || "";
    const trailing = value.match(/\s*$/)?.[0] || "";
    const core = value.trim();
    if (normalize(core) === "approach" && root.dataset?.projectId === "the-red-dawn") {
      return `${leading}靠近${trailing}`;
    }
    const translated = normalizedCopy.get(normalize(core))
      || (core.startsWith("#") && normalizedCopy.get(normalize(core.slice(1)))
        ? `#${normalizedCopy.get(normalize(core.slice(1)))}`
        : null);
    if (translated) return `${leading}${translated}${trailing}`;
    // Authored line breaks (e.g. six-line onboarding copy) are translated
    // line-by-line without flattening the intended layout.
    if (core.includes("\n")) {
      return `${leading}${core.split("\n").map((line) => normalizedCopy.get(normalize(line)) || line).join("\n")}${trailing}`;
    }
    return value;
  };

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);
  textNodes.forEach((node) => {
    const parent = node.parentElement;
    if (!parent || parent.closest("script, style, iframe, noscript, code, pre, [data-sound-copy-en]")) return;
    if (language === "zh") {
      if (!localizedTextOriginals.has(node)) localizedTextOriginals.set(node, node.nodeValue);
      node.nodeValue = translateValue(localizedTextOriginals.get(node));
    } else if (localizedTextOriginals.has(node)) {
      node.nodeValue = localizedTextOriginals.get(node);
    }
  });

  root.querySelectorAll?.("[title], [aria-label], [alt], [data-text]").forEach((element) => {
    let originals = localizedAttributeOriginals.get(element);
    if (!originals) {
      originals = {};
      localizedAttributeOriginals.set(element, originals);
    }
    ["title", "aria-label", "alt", "data-text"].forEach((attribute) => {
      if (!element.hasAttribute(attribute)) return;
      if (!(attribute in originals)) originals[attribute] = element.getAttribute(attribute);
      const original = originals[attribute];
      element.setAttribute(attribute, language === "zh" ? translateValue(original) : original);
    });
  });
}

function updateProjectDetailCanvas(projectId = projectSheet?.dataset.projectId || activeProjectId) {
  if (!projectSheet) return;

  /* Every case study is authored on the same 1280px canvas. Scaling the canvas
     as one unit keeps type, spacing, imagery and motion in the same proportion
     when the shared page gutter changes. */
  projectSheet.classList.add("is-desktop-canvas");

  const measuredPageGap = siteShell?.getBoundingClientRect().left;
  const pageGap = Number.isFinite(measuredPageGap)
    ? Math.max(0, measuredPageGap)
    : 14;
  const availableWidth = Math.max(1, window.innerWidth - pageGap * 2);
  const scale = availableWidth / projectDesktopCanvasWidth;
  const renderedHeroHeight = (projectDesktopCanvasWidth / Math.max(0.01, projectHeroAspectRatio))
    * scale;
  projectSheet.classList.toggle(
    "is-cover-fully-visible",
    renderedHeroHeight <= window.innerHeight + 1,
  );
  projectSheet.style.setProperty("--project-canvas-width", `${projectDesktopCanvasWidth}px`);
  projectSheet.style.setProperty("--project-canvas-height", `${window.innerHeight / scale}px`);
  projectSheet.style.setProperty("--project-canvas-left", `${pageGap / scale}px`);
  projectSheet.style.setProperty("--project-canvas-scale", scale.toFixed(6));
  projectSheet.style.setProperty("--project-embed-inverse-scale", (1 / scale).toFixed(6));
  projectSheet.style.setProperty("--project-hairline", `${(1 / scale).toFixed(4)}px`);
  window.projectBackground?.syncCanvas();
}

function projectLayoutViewportWidth() {
  return projectSheet?.classList.contains("is-desktop-canvas")
    ? projectDesktopCanvasWidth
    : window.innerWidth;
}

const languageCopy = {
  en: {
    headerStatement: "Hi, I’m Oliver — a UX designer shaping responsive human–AI experiences across interaction and sound.",
    greetingHi: "Hi, I’m Oliver",
    portraitCaption: "Hi, I'm designer Oliver Wu.",
    greetingUX: "UX Designer",
    greetingSound: "Interaction + Sound",
    navAbout: "About",
    navWork: "Selected Work",
    navExperience: "Experience",
    navContact: "Contact",
    heroRole: "Experience Design · Product Design · Game UX · HMI",
    heroTitle: "<span class=\"hero-title-line\">I design experiences,</span><span class=\"hero-title-line\">end to end.</span>",
    heroIntro: "Across products and games, I shape how systems work, feel, and respond—through UX, visual design, sound, and code.",
    resume: "Download Résumé",
    resumePickerTitle: "Download Résumé",
    resumeEnglish: "English Version",
    resumeChinese: "Chinese Version",
    selectedWork: "Selected Work",
    filterAll: "Featured",
    filterEmbodied: "Embodied Interaction",
    filterWorlds: "Worlds & Systems",
    filterOther: "Other Works",
    filterGame: "Games",
    filterProduct: "Products & Systems",
    filterArt: "Art",
    filterSound: "Sound Design",
    experience: "Experience",
    selectedPractice: "Selected Practice",
    practiceEducation: "Practice and education.",
    roleCurrentDates: "Dec 2024—Present",
    roleCurrent: "Interaction Designer",
    organizationTencent: "Tencent",
    roleCurrentNote: "(Visual and audio design on selected projects)",
    roleCurrentDescription: "Projects include In-car Cloud Gaming, Animula Nook UGC Lobby, Multi-brand App Marketplace, League of Legends CN: Spirited Expedition & Shen Ji Miao Suan, DNF Wave Festival, Gangstar Mirage City, T-Game (confidential, with Riot Games), and other live-ops and mini-games for Tencent Charity, QQ Farm, Honor of Kings, and Rust Mobile.",
    roleInternDates: "May—Aug 2024",
    roleIntern: "Interaction Design Intern",
    roleInternDescription: "In-car Cloud Gaming HMI — interaction frameworks for automotive OS and lightweight clients, cross-platform adaptation, controller usability testing and HMI demos. Supported deliveries for Huawei, BMW, and Dongfeng Nissan.",
    degreeMA: "MA Information Experience Design",
    degreeMADescription: "Royal College of Art, London.",
    degreeMARecognition: "World #1 for Art & Design — QS 2026",
    degreeArchitecture: "Bachelor of Architecture",
    degreeArchitectureDescription: "Zhengzhou University, China.",
    degreeArchitectureRecognition: "China’s Double First-Class University · Project 211",
    contactKicker: "Let’s make something responsive",
    contactTitle: "Have a project<br />in mind?",
    contactEmailLabel: "Email",
    contactLinkedInAction: "View profile",
    contactSoundCloudAction: "Listen to my work",
    contactLocationLabel: "Based in,",
    contactLocationValue: "Shenzhen, China",
    contactMomentsTitle: "People & moments",
    contactMomentsPending: "Team photographs to come",
    contactMomentPlaceholder: "Photo and date to be added",
    availability: "Available for selected collaborations and new opportunities.",
    footerPractice: "Product / Experience / Sound",
  },
  zh: {
    headerStatement: "你好，我是 Oliver——一名专注交互、声音与人机体验的 UX 设计师。",
    greetingHi: "你好，我是 Oliver",
    portraitCaption: "你好，我是设计师 Oliver Wu。",
    greetingUX: "UX 设计师",
    greetingSound: "交互 + 声音",
    navAbout: "关于我",
    navWork: "精选作品",
    navExperience: "履历",
    navContact: "联系",
    heroRole: "体验设计 · 产品设计 · 游戏体验 · 车载 HMI",
    heroTitle: "<span class=\"hero-title-line\">我设计完整的</span><span class=\"hero-title-line\">端到端体验。</span>",
    heroIntro: "在产品与游戏之间，我通过 UX、视觉设计、声音与代码，塑造系统如何运行、如何被感知，以及如何回应用户。",
    resume: "下载简历",
    resumePickerTitle: "下载简历",
    resumeEnglish: "英文版",
    resumeChinese: "中文版",
    selectedWork: "精选作品",
    filterAll: "精选",
    filterEmbodied: "具身交互",
    filterWorlds: "世界构建与系统设计",
    filterOther: "其他作品",
    filterGame: "游戏",
    filterProduct: "产品与系统",
    filterArt: "艺术",
    filterSound: "声音设计",
    experience: "履历",
    selectedPractice: "精选实践",
    practiceEducation: "工作与教育背景。",
    roleCurrentDates: "2024 年 12 月—至今",
    roleCurrent: "交互设计师",
    organizationTencent: "腾讯",
    roleCurrentNote: "（部分项目兼任视觉与声音设计）",
    roleCurrentDescription: "参与项目包括车载云游戏、粒粒小人国 UGC 大厅、多品牌应用商城、英雄联盟国服的灵动探险队与神机妙算、DNF 逐浪节、Gangstar Mirage City、T-Game（保密项目，与拳头工作室合作），以及腾讯公益小红花、QQ 经典农场、王者荣耀、失控进化等运营活动与轻量玩法。",
    roleInternDates: "2024 年 5—8 月",
    roleIntern: "交互设计实习生",
    roleInternDescription: "车载云游戏 HMI：参与车载 OS 与微端的交互体系搭建、跨平台适配、手柄用户测试及人机 Demo 验证，支持华为、宝马及东风日产等合作项目交付。",
    degreeMA: "信息体验设计硕士",
    degreeMADescription: "英国皇家艺术学院，伦敦。",
    degreeMARecognition: "QS 2026 艺术与设计学科全球第 1",
    degreeArchitecture: "建筑学学士",
    degreeArchitectureDescription: "郑州大学，中国。",
    degreeArchitectureRecognition: "国家“双一流”建设高校 · “211工程”重点建设高校",
    contactKicker: "一起打造有回应的体验",
    contactTitle: "有想一起实现的<br />项目吗？",
    contactEmailLabel: "邮箱",
    contactLinkedInAction: "查看主页",
    contactSoundCloudAction: "收听我的作品",
    contactLocationLabel: "目前居住于",
    contactLocationValue: "深圳，中国",
    contactMomentsTitle: "伙伴与片刻",
    contactMomentsPending: "团队合照待补充",
    contactMomentPlaceholder: "照片与日期待补充",
    availability: "接受精选合作与新的职业机会。",
    footerPractice: "产品 / 体验 / 声音设计",
  },
};

const projectCardChineseCopy = {
  "utopia-2419": { descriptor: "互动叙事", context: "个人项目", title: "乌托邦 2419" },
  "spirited-expedition": { descriptor: "游戏体验", context: "腾讯项目", title: "灵动探险队" },
  florahaven: { descriptor: "空间计算", context: "个人项目", title: "花境" },
  "olive-town": { descriptor: "城市系统", context: "个人项目", title: "橄榄小镇" },
  "cloud-island-device": { descriptor: "环境系统", context: "个人项目", title: "云岛装置" },
  "external-blood-vessel": { descriptor: "可穿戴音乐技术", context: "合作项目", title: "体外血管" },
  "water-babies": { descriptor: "交互装置", context: "合作项目", title: "水之婴" },
  swrd: { descriptor: "沉浸式 VR 体验", context: "合作项目", title: "静水流深" },
  "poka-project-p": { descriptor: "游戏 UX 与世界观构建", context: "腾讯项目", title: "POKA / P 计划" },
  "the-red-dawn": { descriptor: "批判性装置", context: "皇家艺术学院个人项目", title: "赤色黎明" },
  "show-e-motions": { descriptor: "情感可穿戴设备", context: "皇家艺术学院合作项目", title: "情绪显影" },
  "tencent-cloud-gaming": { descriptor: "车载 HMI", context: "腾讯 · 座舱体验", title: "车载游戏" },
  "dnf-zhulang-festival": { descriptor: "季节性游戏体验", context: "腾讯 · 交互设计", title: "DNF：逐浪夏日祭" },
  "adaptive-app-market": { descriptor: "跨设备应用市场", context: "腾讯 · 体验设计", title: "应用商店 2.0" },
  "visual-editor": { descriptor: "AI 设计工具", context: "个人项目", title: "Skill 可视化编辑器" },
  "gangstar-bite-me": { descriptor: "游戏活动 UI", context: "Gangstar Mirage City", title: "鳄鱼咬一口！" },
  "sound-design": { descriptor: "声音设计作品集", context: "音乐 · 交互 · 沉浸式音频", title: "声音设计作品选" },
};

const projectFallbackCopy = {
  summary: "A full-screen case study for presenting context, process and outcomes.",
  body: "This case study introduces the project context, the design decisions behind the system and the final experience in one clear narrative.",
  company: "Individual",
  year: "2026",
  releaseDate: "",
  roles: ["UX Design", "Interaction Design"],
  partners: [],
  tags: ["UX DESIGN", "INTERACTION", "PROTOTYPING"],
  sections: [
    {
      title: "Context",
      body: "Research, constraints and the central design question establish why the project needed to exist.",
      caption: "CONTEXT / RESEARCH AND SYSTEM LANDSCAPE",
    },
    {
      title: "Concept",
      body: "The concept turns findings into a clear system direction, interaction principles and a testable proposition.",
      caption: "CONCEPT / SYSTEM LOGIC AND DESIGN DIRECTION",
    },
    {
      title: "User Experience",
      body: "Flows, behaviours and feedback states establish how the complete experience works from end to end.",
      caption: "USER EXPERIENCE / FLOW, STATES AND INTERACTION",
    },
    {
      title: "UI & Visual",
      body: "The interface language turns system states into clear, expressive and buildable visual feedback.",
      caption: "UI & VISUAL / COMPONENTS, HIERARCHY AND MOTION",
    },
    {
      title: "Audio Design",
      body: "Audio communicates change, priority and atmosphere as an integrated part of the interaction system.",
      caption: "AUDIO DESIGN / FEEDBACK, MATERIAL AND EXPERIENCE",
    },
  ],
};

function projectIdFromHash() {
  const match = window.location.hash.match(/^#project\/([a-z0-9-]+)$/i);
  return match ? decodeURIComponent(match[1]) : null;
}

function projectUrl(projectId) {
  return `${window.location.pathname}${window.location.search}#project/${encodeURIComponent(projectId)}`;
}

function sectionTargetFromHash(hash = window.location.hash) {
  if (!/^#[a-z][a-z0-9-]*$/i.test(hash)) return null;
  return document.getElementById(decodeURIComponent(hash.slice(1)));
}

function scrollToSection(target, behavior = reduceMotionQuery.matches ? "auto" : "smooth") {
  if (!target) return;
  const targetTop = window.scrollY + target.getBoundingClientRect().top;
  window.scrollTo({ top: targetTop, behavior });
}

function navigateToSection(event) {
  const link = event.currentTarget;
  const hash = link.getAttribute("href");
  const target = sectionTargetFromHash(hash);
  if (!target) return;

  event.preventDefault();
  window.history.pushState(
    {
      portfolioAnchor: target.id,
    },
    "",
    `${window.location.pathname}${window.location.search}#${encodeURIComponent(target.id)}`,
  );
  scrollToSection(target);
}

async function loadProjectData(projectId) {
  if (projectDataCache.has(projectId)) return projectDataCache.get(projectId);
  // Slow is not failed: let the browser settle the request, without a deadline.
  const request = fetch(`data/projects/${encodeURIComponent(projectId)}.json?v=20261008-61`, {
    cache: "no-cache",
    headers: { Accept: "application/json" },
  }).then((response) => {
    if (!response.ok) throw new Error(`Project data unavailable: ${projectId}`);
    return response.json();
  });

  projectDataCache.set(projectId, request);
  try {
    return await request;
  } catch (error) {
    projectDataCache.delete(projectId);
    throw error;
  }
}

function setProjectLoadingState(isLoading) {
  if (!projectSheet) return;
  projectSheet.setAttribute("aria-busy", isLoading ? "true" : "false");
}

let projectPreparingCard = null;
let projectPreparationTimer = 0;
let projectPreparationToken = 0;
const projectPreparation = document.getElementById('projectPreparation');
function endProjectPreparation(token) {
  if (token !== projectPreparationToken) return;
  clearTimeout(projectPreparationTimer);
  projectPreparingCard?.removeAttribute('aria-busy');
  projectPreparingCard = null;
  projectPreparation.hidden = true;
  document.body.classList.remove('project-preparing');
}
function beginProjectPreparation(card, token, feedback = true) {
  endProjectPreparation(projectPreparationToken);
  projectPreparationToken = token;
  projectPreparingCard = card;
  card.setAttribute('aria-busy', 'true');
  document.body.classList.add('project-preparing');
  projectPreparation.querySelector('[data-preparation-title]').textContent = card.querySelector('h3')?.textContent || 'Selected Project';
  const status = projectPreparation.querySelector('[data-preparation-status]');
  status.textContent = currentLanguage === 'zh' ? '正在准备项目详情…' : 'Preparing case study…';
  // Cached data should not flash a modal. A pending click is marked immediately.
  if (feedback) projectPreparationTimer = setTimeout(() => {
    if (projectPreparationToken !== token || !projectPreparingCard) return;
    projectPreparation.hidden = false;
    projectPreparation.querySelector('.project-preparation-paper').focus({preventScroll:true});
  }, 120);
}
function cancelProjectPreparation() {
  if (!projectPreparingCard) return false;
  const card = projectPreparingCard;
  projectOpenSequence += 1;
  endProjectPreparation(projectPreparationToken);
  if (window.projectRuntime.phase === 'preparing' && !projectDetail.classList.contains('is-open')) {
    window.projectBackground?.close();
    window.projectRuntime.begin('closed');
    window.projectRuntime.reset();
    releaseProjectContent();
    activeProjectId = null;
  }
  if (!activeProjectId && location.hash.startsWith('#project/')) history.replaceState(null, '', `${location.pathname}${location.search}#work`);
  card.focus({preventScroll:true});
  scheduleCoverWarm();
  return true;
}
projectPreparation.addEventListener('click', (event) => {
  if (event.target === projectPreparation) closeProject();
});
document.addEventListener('visibilitychange', () => projectPreparation.classList.toggle('is-paused', document.hidden));

function resetProjectVideo() {
  if (!projectDetailVideo || !projectDetailVideoPlayer) return;
  projectDetailVideo.hidden = true;
  projectDetailVideo.setAttribute("aria-label", "Project film");
  projectDetailVideoFrame?.classList.remove("is-website");
  setProjectMediaSource(projectDetailVideoPlayer, '');
  projectDetailVideoPlayer.title = "Project film";
  if (projectDetailVideoCaption) projectDetailVideoCaption.textContent = "";
}

function applyProjectVideo(video) {
  if (!projectDetailVideo || !projectDetailVideoPlayer) return;

  const provider = video?.provider?.trim().toLowerCase();
  const videoId = video?.id?.trim();
  let embedUrl = null;

  if (provider === "youtube" && /^[a-zA-Z0-9_-]{11}$/.test(videoId || "")) {
    // Match the standard embed code generated by YouTube's Share → Embed flow.
    embedUrl = new URL(`https://www.youtube.com/embed/${videoId}`);
    const shareId = video?.shareId?.trim();
    if (/^[a-zA-Z0-9_-]{8,40}$/.test(shareId || "")) {
      embedUrl.searchParams.set("si", shareId);
    }
    embedUrl.searchParams.set("rel", "0");
    embedUrl.searchParams.set("playsinline", "1");
    embedUrl.searchParams.set("iv_load_policy", "3");
    embedUrl.searchParams.set("color", "white");
  }

  if (provider === "vimeo" && /^\d{6,12}$/.test(videoId || "")) {
    embedUrl = new URL(`https://player.vimeo.com/video/${videoId}`);
    embedUrl.searchParams.set("dnt", "1");
    embedUrl.searchParams.set("playsinline", "1");
    embedUrl.searchParams.set("badge", "0");
    embedUrl.searchParams.set("title", "0");
    embedUrl.searchParams.set("byline", "0");
    embedUrl.searchParams.set("portrait", "0");
  }

  if (provider === "website") {
    try {
      const websiteUrl = new URL(video?.url?.trim() || "");
      if (websiteUrl.protocol === "https:") embedUrl = websiteUrl;
    } catch {
      embedUrl = null;
    }
  }

  if (!embedUrl) {
    resetProjectVideo();
    return;
  }

  const isWebsite = provider === "website";
  const title = video.title?.trim() || (isWebsite ? "Interactive project website" : "Project film");
  const caption = video.caption?.trim() || title;

  projectDetailVideo.setAttribute(
    "aria-label",
    isWebsite ? "Interactive project website" : "Project film",
  );
  projectDetailVideoFrame?.classList.toggle("is-website", isWebsite);
  projectDetailVideoPlayer.title = title;
  setProjectMediaSource(projectDetailVideoPlayer, embedUrl.href);
  if (projectDetailVideoCaption) projectDetailVideoCaption.textContent = caption;
  projectDetailVideo.hidden = false;
}

function replaceProjectTextList(container, values) {
  if (!container) return;
  const items = values
    .filter((value) => typeof value === "string" && value.trim())
    .map((value) => {
      const item = document.createElement("li");
      item.textContent = value.trim();
      return item;
    });
  container.replaceChildren(...items);
}

function projectTagLabel(value) {
  if (typeof value !== "string") return "";
  const label = value.trim();
  if (!label) return "";
  return label.startsWith("#") ? label : `#${label}`;
}

function localizedProjectLabel(label, language = currentLanguage) {
  if (language !== "zh") return label;
  const normalized = String(label || "").trim().toUpperCase();
  const labels = {
    "MY ROLE": "我的职责",
    "PROJECT CONTEXT": "项目背景",
    "COLLECTION": "作品合集",
    "PROJECT YEAR": "项目年份",
    "PROJECT YEARS": "项目时间",
    "RELEASE DATE": "发布日期",
    "MAIN GAME": "原作游戏",
    "BASE GAME": "原作游戏",
    "LIVE OPERATION": "上线运营周期",
    "COLLABORATION": "合作项目",
  };
  return labels[normalized] || label;
}

function localizedProjectValue(projectCopy, key, fallback = "", language = currentLanguage) {
  const localizedKey = `${key}Zh`;
  if (language === "zh" && typeof projectCopy?.[localizedKey] === "string") {
    return projectCopy[localizedKey].trim();
  }
  return typeof projectCopy?.[key] === "string" ? projectCopy[key].trim() : fallback;
}

function projectBrandMark(source, name, color = "") {
  const dimensions = source === "assets/media/logo-tencent.svg" ? [1086, 207]
    : source === "assets/media/logo-rca.svg" ? [579, 288] : null;
  if (!dimensions) {
    const image = document.createElement("img");
    image.src = versionProjectImageAsset(source);
    image.alt = name;
    return image;
  }
  const NS = "http://www.w3.org/2000/svg";
  const mark = document.createElementNS(NS, "svg");
  mark.classList.add("brand-mark");
  mark.setAttribute("viewBox", `0 0 ${dimensions.join(" ")}`);
  mark.setAttribute("width", String(dimensions[0] / 3));
  mark.setAttribute("height", String(dimensions[1] / 3));
  mark.setAttribute("preserveAspectRatio", "xMinYMid meet");
  mark.setAttribute("role", "img");
  mark.setAttribute("aria-label", name);
  mark.setAttribute("data-brand", source.includes("tencent") ? "tencent" : "rca");
  mark.style.filter = "none"; // Raster recolouring filters are not needed.
  if (/^#[a-f\d]{3,8}$/i.test(color)) mark.style.color = color;
  const use = document.createElementNS(NS, "use");
  use.setAttribute("href", `${versionProjectImageAsset(source)}#mark`);
  mark.append(use);
  return mark;
}

function renderProjectPartners(partners, fallbackContext, partnerLabel = "", projectId = "") {
  if (!projectDetailPartners) return;
  const partnerItems = Array.isArray(partners) ? partners : [];
  const renderedPartners = partnerItems.slice(0, 5).flatMap((partner) => {
    if (!partner || typeof partner !== "object") return [];
    const name = typeof partner.name === "string" ? partner.name.trim() : "Project partner";
    const detail = typeof partner.detail === "string" ? partner.detail.trim() : "";
    const logo = typeof partner.logo === "string" ? partner.logo.trim() : "";
    if (/^assets\/[a-zA-Z0-9_./-]+$/.test(logo)) {
      const image = projectBrandMark(logo, name, partner.color);
      if (detail) {
        const copy = document.createElement("div");
        copy.className = "project-partner-copy has-logo";
        const description = document.createElement("span");
        description.textContent = detail;
        copy.append(image, description);
        return [copy];
      }
      return [image];
    }
    if (!name) return [];
    const label = document.createElement("strong");
    label.textContent = name;
    const avatars = (Array.isArray(partner.avatars) ? partner.avatars : []).slice(0, 3).flatMap((avatar) => {
      const source = safeProjectAsset(typeof avatar === "string" ? avatar : avatar?.src);
      const avatarAlt = typeof avatar === "object" && typeof avatar?.alt === "string" ? avatar.alt.trim() : "";
      if (source) {
        const image = document.createElement("img");
        image.src = versionProjectImageAsset(source);
        image.alt = avatarAlt;
        image.decoding = "async";
        return [image];
      }
      const initials = typeof avatar === "object" && typeof avatar?.label === "string"
        ? avatar.label.trim().slice(0, 2)
        : "";
      if (!initials) return [];
      const marker = document.createElement("span");
      marker.className = "project-partner-avatar-initial";
      marker.textContent = initials;
      marker.setAttribute("aria-label", avatarAlt || initials);
      return [marker];
    });
    if (!detail && !avatars.length) return [label];
    const copy = document.createElement("div");
    copy.className = "project-partner-copy";
    if (avatars.length) {
      copy.classList.add("has-avatars");
      const avatarGroup = document.createElement("div");
      avatarGroup.className = "project-partner-avatars";
      avatarGroup.append(...avatars);
      copy.append(avatarGroup);
    }
    copy.append(label);
    if (!detail) return [copy];
    const description = document.createElement("span");
    description.textContent = detail;
    copy.append(description);
    return [copy];
  });

  if (!renderedPartners.length && fallbackContext) {
    const label = document.createElement("strong");
    label.textContent = fallbackContext;
    renderedPartners.push(label);
  }
  if (partnerLabel && renderedPartners.length > 1) {
    const row = document.createElement("div");
    row.className = "project-cooperation-row";
    const label = document.createElement("span");
    label.className = "project-cooperation-label";
    label.textContent = partnerLabel;
    const brands = renderedPartners.splice(1);
    row.append(label, ...brands.map(brand => {
      if (projectId !== 'adaptive-app-market') return brand;
      const item = document.createElement('span');
      item.className = 'project-cooperation-brand';
      item.append(brand);
      return item;
    }));
    renderedPartners.push(row);
  }
  projectDetailPartners.replaceChildren(...renderedPartners);
}

function projectBlockImage(source, alt = "") {
  if (typeof source !== "string" || !/^assets\/[a-zA-Z0-9_./-]+$/.test(source)) return null;
  const image = document.createElement("img");
  image.src = versionProjectImageAsset(source);
  image.alt = alt;
  const dimensions = window.portfolioImageDimensions?.[source];
  if (dimensions) [image.width, image.height] = dimensions;
  image.loading = "lazy";
  image.decoding = "async";
  prepareProjectImagePlaceholder(image);
  return image;
}

const imagePlaceholderSources = new WeakMap();
function prepareProjectImagePlaceholder(image) {
  const source = image.getAttribute('src');
  if (!source || image.complete && image.naturalWidth) {
    image.removeAttribute('data-image-pending'); image.removeAttribute('data-image-error');
    imagePlaceholderSources.delete(image); return;
  }
  if (imagePlaceholderSources.get(image) === source) return;
  imagePlaceholderSources.set(image, source);
  image.dataset.imagePending = 'true';
  image.addEventListener('load', () => {
    if (image.getAttribute('src') !== source) return;
    image.removeAttribute('data-image-pending'); image.removeAttribute('data-image-error');
    imagePlaceholderSources.delete(image);
  }, {once:true});
  const unavailable = () => {
    if (image.getAttribute('src') !== source) return;
    image.removeAttribute('data-image-pending'); image.dataset.imageError = 'true';
    imagePlaceholderSources.delete(image);
  };
  image.addEventListener('error', unavailable, {once:true});
  if (image.complete && !image.naturalWidth && image.getAttribute('src')) unavailable();
}

function safeProjectAsset(source) {
  if (typeof source !== "string") return "";
  const trimmedSource = source.trim();
  return /^assets\/[a-zA-Z0-9_./-]+$/.test(trimmedSource) ? trimmedSource : "";
}

function safeSoundCloudPlayer(source) {
  if (typeof source !== "string") return "";
  try {
    const url = new URL(source.trim());
    if (url.protocol !== 'https:' || url.hostname !== 'w.soundcloud.com' || url.pathname !== '/player/') return '';
    // Ask the native widget not to show its app/teaser overlay. SoundCloud
    // controls availability (including the track owner's plan); never hide
    // or intercept cross-origin player controls ourselves.
    url.searchParams.set('show_teaser', 'false');
    return url.href;
  } catch {
    return "";
  }
}

function versionProjectImageAsset(source) {
  const asset = safeProjectAsset(source);
  return asset ? `${asset}?v=${projectImageRevision}` : "";
}

function coverNumber(value, fallback, minimum, maximum) {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? clamp(parsedValue, minimum, maximum) : fallback;
}
function standardCoverMotion(ratio, projectId, kind) {
  if (kind !== 'base' || ['cloud-island-device','spirited-expedition'].includes(projectId)) return null;
  if (ratio === 2) return {speed:0.5,limit:0.8};
  if (ratio === 16 / 9) return {speed:0.28,limit:0.45};
  return null;
}

// Retain URL readiness, not detached sheets or decoded full-size images.
const decodedCoverAssets = new Set();
const warmedCoverAssets = new Set();
const nearbyCoverQueue = new Set();
let coverWarmBusy = false;
let coverWarmScheduled = false;
function queueNearbyCover(card) {
  if (!card || card.dataset.locked === 'true' || card.dataset.projectId === 'sound-design') return;
  nearbyCoverQueue.add(card.dataset.projectId); scheduleCoverWarm();
}
function scheduleCoverWarm() {
  const connection = navigator.connection;
  if (coverWarmScheduled || coverWarmBusy || !nearbyCoverQueue.size || document.hidden
    || window.portfolioHomeAssetsSettled === false
    || document.documentElement.classList.contains('boot-pending')
    || document.documentElement.classList.contains('boot-entering')
    || document.body.classList.contains('project-open') || document.body.classList.contains('project-preparing')
    || connection?.saveData || /(^|-)2g$|^3g$/.test(connection?.effectiveType || '')) return;
  coverWarmScheduled = true;
  const run = () => { coverWarmScheduled = false; warmNearbyCover(); };
  if (window.requestIdleCallback) window.requestIdleCallback(run);
  else window.setTimeout(run, 250);
}
async function warmNearbyCover() {
  if (coverWarmBusy || document.hidden || document.body.classList.contains('project-open')
    || document.body.classList.contains('project-preparing')) return;
  const id = nearbyCoverQueue.values().next().value;
  if (!id) return;
  nearbyCoverQueue.delete(id); coverWarmBusy = true;
  try {
    const copy = await loadProjectData(id);
    const layers = copy.cover?.layers?.length ? copy.cover.layers.map(layer => layer.src) : [copy.cover?.background];
    for (const source of new Set(layers)) {
      if (document.hidden || document.body.classList.contains('project-open') || document.body.classList.contains('project-preparing')) {
        nearbyCoverQueue.add(id); break;
      }
      const url = versionProjectImageAsset(source);
      if (!url || warmedCoverAssets.has(url) || decodedCoverAssets.has(new URL(url, location.href).href)) continue;
      // One low-priority request, no explicit background decode or held Image.
      await new Promise(resolve => {
        const image = new Image(); image.fetchPriority = 'low'; image.decoding = 'async';
        image.onload = () => { warmedCoverAssets.add(url); resolve(); };
        image.onerror = resolve; image.src = url;
      });
    }
  } catch { /* No automatic retries of a real data failure. */ }
  finally { coverWarmBusy = false; scheduleCoverWarm(); }
}
document.addEventListener('portfolio:cover-nearby', event => queueNearbyCover(event.detail));
document.addEventListener('portfolio:boot-ready', scheduleCoverWarm);
document.addEventListener('portfolio:home-assets-settled', scheduleCoverWarm);
document.addEventListener('visibilitychange', scheduleCoverWarm);
detailProjectCards.forEach(card => {
  card.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch') queueNearbyCover(card); });
  card.addEventListener('focus', () => queueNearbyCover(card));
});

function renderProjectCover(coverConfig, fallbackBackground = activeProjectFallbackCover) {
  if (!projectDetailCover || !projectDetailHero) return Promise.resolve();

  const config = coverConfig && typeof coverConfig === "object" ? coverConfig : null;
  const designWidth = coverNumber(config?.designWidth, 3200, 320, 10000);
  const ratio = typeof config?.ratio === "string" && /^\d+(?:\.\d+)?\s*\/\s*\d+(?:\.\d+)?$/.test(config.ratio)
    ? config.ratio
    : "2 / 1";
  projectDetailHero.style.aspectRatio = ratio;
  const [ratioWidth, ratioHeight] = ratio.split("/").map(Number);
  projectHeroAspectRatio = Number.isFinite(ratioWidth) && Number.isFinite(ratioHeight) && ratioHeight > 0
    ? ratioWidth / ratioHeight
    : 2;
  updateProjectDetailCanvas();
  projectDetailCover.replaceChildren();
  projectCoverLayers = [];
  projectDissolveLayers = [];
  projectDetailCover.style.backgroundImage = "none";
  projectDetailCover.classList.add('is-cover-pending');
  delete projectDetailCover.dataset.coverDecoded;
  const coverStatus = projectDetailHero.querySelector('.project-cover-placeholder');
  localizedTextOriginals.delete(coverStatus);
  coverStatus.textContent = 'Loading cover…';

  const configuredLayers = Array.isArray(config?.layers) ? config.layers : [];
  const backgroundSource = safeProjectAsset(config?.background);
  /* When a layered cover already contains a base image, keeping the same
     image on the container creates a second, static background beneath it. */
  projectDetailCover.style.backgroundPosition = "center";
  projectDetailCover.style.backgroundSize = "cover";
  const layers = configuredLayers.length
    ? configuredLayers
    : backgroundSource
      ? [{ src: backgroundSource, kind: "base", parallax: 0.08 }]
      : [];

  if (!layers.length) {
    projectDetailCover.classList.add("is-legacy");
    projectDetailCover.style.backgroundImage = fallbackBackground || "none";
    projectDetailCover.classList.remove('is-cover-pending');
    return Promise.resolve();
  }

  projectDetailCover.classList.remove("is-legacy");
  const renderedLayers = layers.flatMap((layer, layerIndex) => {
    if (!layer || typeof layer !== "object") return [];
    const source = safeProjectAsset(layer.src);
    if (!source) return [];

    const kind = layer.kind === "base" ? "base" : "art";
    const blend = ["normal", "multiply", "screen", "overlay"].includes(layer.blend)
      ? layer.blend
      : "normal";
    const mediaLayer = document.createElement("img");
    mediaLayer.className = `project-cover-layer project-cover-layer-${kind}`;
    // Set before src: cover planes take priority over nearby evidence images.
    mediaLayer.fetchPriority = 'high';
    mediaLayer.loading = 'eager';
    mediaLayer.decoding = 'async';
    // Every ordinary 2:1 cover uses one half-speed plane. Layered authored
    // compositions keep their own foreground rates and explicit exceptions.
    const standardMotion = standardCoverMotion(projectHeroAspectRatio, projectSheet.dataset.projectId, kind);
    mediaLayer.dataset.parallax = String(standardMotion?.speed ?? coverNumber(layer.parallax, 0.12, -0.25, 1.5));
    mediaLayer.dataset.parallaxLimit = String(coverNumber(
      standardMotion?.limit ?? layer.parallaxLimit,
      kind === "base" ? 0.38 : 0.22,
      0,
      0.8,
    ));
    mediaLayer.style.setProperty("--cover-layer-z", String(layerIndex + 1));
    mediaLayer.style.setProperty("--cover-layer-blend", blend);
    mediaLayer.dataset.designWidth = String(designWidth);
    if (Number.isFinite(Number(layer.designTop))) {
      mediaLayer.dataset.designTop = String(Number(layer.designTop));
      mediaLayer.style.setProperty(
        "--cover-layer-design-top",
        `${(Number(layer.designTop) / designWidth * 100).toFixed(6)}cqw`,
      );
    }
    if (Number.isFinite(Number(layer.designCenterY))) {
      mediaLayer.dataset.designCenterY = String(Number(layer.designCenterY));
    }
    if (Number.isFinite(Number(layer.fadeOpaqueY))) {
      mediaLayer.dataset.fadeOpaqueY = String(Number(layer.fadeOpaqueY));
    }
    if (Number.isFinite(Number(layer.fadeTransparentY))) {
      mediaLayer.dataset.fadeTransparentY = String(Number(layer.fadeTransparentY));
    }
    // Identify dissolve layers by authored geometry, not a filename which
    // changes when the image receives a web-optimized derivative.
    const isDissolveLayer = projectSheet?.dataset.projectId === "spirited-expedition"
      && (kind === "base" || (Number.isFinite(Number(layer.fadeOpaqueY)) && Number.isFinite(Number(layer.fadeTransparentY))));
    if (isDissolveLayer) {
      mediaLayer.dataset.dissolve = "true";
      mediaLayer.classList.add("is-dissolve-pending");
    }
    mediaLayer.src = versionProjectImageAsset(source);
    const dimensions = window.portfolioImageDimensions?.[source];
    if (dimensions) [mediaLayer.width, mediaLayer.height] = dimensions;
    mediaLayer.alt = "";
    mediaLayer.draggable = false;
    mediaLayer.decoding = "async";

    if (kind === "art") {
      const layerX = coverNumber(layer.x, 50, -30, 130);
      const layerY = coverNumber(layer.y, 50, -30, 130);
      const layerWidth = coverNumber(layer.width, 40, 8, 120);
      mediaLayer.style.setProperty("--cover-layer-x", `${layerX}%`);
      mediaLayer.style.setProperty("--cover-layer-y", `${layerY}%`);
      mediaLayer.style.setProperty("--cover-layer-width", `${layerWidth}%`);
      mediaLayer.style.setProperty("--cover-layer-mobile-x", `${coverNumber(layer.mobileX, layerX, -30, 130)}%`);
      mediaLayer.style.setProperty("--cover-layer-mobile-y", `${coverNumber(layer.mobileY, layerY, -30, 130)}%`);
      mediaLayer.style.setProperty("--cover-layer-mobile-width", `${coverNumber(layer.mobileWidth, layerWidth, 8, 120)}%`);
    }
    return [mediaLayer];
  });

  const headlineConfig = config?.headline && typeof config.headline === "object"
    ? config.headline
    : null;
  const headlineTitle = typeof headlineConfig?.title === "string"
    ? headlineConfig.title.trim()
    : "";
  const headlineSubtitle = typeof headlineConfig?.subtitle === "string"
    ? headlineConfig.subtitle.trim()
    : "";
  const headlineParts = Array.isArray(headlineConfig?.parts)
    ? headlineConfig.parts.filter((part) => part && typeof part.text === "string")
    : [];
  const headlineLayer = headlineTitle || headlineParts.length ? document.createElement("div") : null;

  if (headlineLayer) {
    headlineLayer.className = "project-cover-headline";
    headlineLayer.style.setProperty(
      "--cover-headline-x",
      `${coverNumber(headlineConfig.x, 50, 0, 100)}%`,
    );
    headlineLayer.style.setProperty(
      "--cover-headline-y",
      `${coverNumber(headlineConfig.y, 10, 0, 100)}%`,
    );
    headlineLayer.style.setProperty(
      "--cover-headline-width",
      `${coverNumber(headlineConfig.width, 72, 20, 100)}%`,
    );

    if (headlineParts.length) {
      headlineParts.forEach((part) => {
        const span = document.createElement("span");
        span.className = `project-cover-headline-${["quote", "emphasis", "support"].includes(part.tone) ? part.tone : "support"}`;
        span.textContent = part.text;
        headlineLayer.append(span);
      });
    } else {
      const title = document.createElement("strong");
      title.textContent = headlineTitle;
      headlineLayer.append(title);
    }

    if (headlineSubtitle) {
      const subtitle = document.createElement("span");
      subtitle.textContent = headlineSubtitle;
      headlineLayer.append(subtitle);
    }
  }

  projectDetailCover.replaceChildren(
    ...renderedLayers,
    ...(headlineLayer ? [headlineLayer] : []),
  );
  projectCoverLayers = renderedLayers;
  projectDissolveLayers = renderedLayers.filter((layer) => layer.dataset.dissolve === "true");
  // Card crops/scales are not detail crops/scales. Keep the authored geometry
  // with a neutral placeholder instead of morphing a different composition.
  projectDetailCover.style.backgroundImage = 'none';

  /* Resolve layered boundaries independently of the sheet entrance. The
     original artwork remains full resolution, but never blocks a click. */
  const previouslyDecoded = renderedLayers.every(layer => decodedCoverAssets.has(layer.src));
  const coverReady = Promise.all(renderedLayers.map(async (layer) => {
    if (!layer.complete) await new Promise((resolve) => {
      layer.addEventListener("load", resolve, { once: true });
      layer.addEventListener("error", resolve, { once: true });
    });
    if (layer.naturalWidth) {
      await layer.decode?.().catch(() => {});
      decodedCoverAssets.add(layer.src);
    }
  }));

  return coverReady.then(() => new Promise((resolve) => {
    requestAnimationFrame(() => {
      if (projectCoverLayers === renderedLayers) {
        projectDetailCover.dataset.coverDecoded = renderedLayers.every(layer => layer.naturalWidth > 0) ? 'true' : 'error';
        if (previouslyDecoded || !['entering','preparing'].includes(window.projectRuntime.phase)) revealProjectCover();
      }
      resolve();
    });
  }));
}

function revealProjectCover() {
  if (projectDetailCover.dataset.coverDecoded === 'error') {
    const status = projectDetailHero.querySelector('.project-cover-placeholder');
    localizedTextOriginals.delete(status);
    status.textContent = 'Cover unavailable';
    translatePortfolioTree(status, currentLanguage);
    return;
  }
  if (projectDetailCover.dataset.coverDecoded !== 'true') return;
  updateProjectParallax();
  projectCoverLayers.forEach(layer => layer.classList.remove('is-dissolve-pending'));
  projectDetailCover.classList.remove('is-cover-pending');
}

function setProjectMediaSource(node, source) {
  if (node.tagName === 'VIDEO') {
    const dimensions = window.portfolioVideoDimensions?.[String(source).split('?')[0]];
    if (dimensions) {
      [node.width, node.height] = dimensions;
      node.style.aspectRatio = `${dimensions[0]} / ${dimensions[1]}`;
    }
  }
  if (['VIDEO', 'IFRAME', 'AUDIO'].includes(node.tagName)) window.projectRuntime.source(node, source);
  else node.src = source;
}

function bindProjectManagedVideo(video, options = {}) {
  if (!video) return;
  window.projectRuntime.bind(video);
}

function resumeContinuousProjectVideos() {
  window.projectRuntime.refresh();
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") resumeContinuousProjectVideos();
});
window.addEventListener("pageshow", resumeContinuousProjectVideos);
window.addEventListener("focus", resumeContinuousProjectVideos);

function projectBlockCopy(block) {
  const copy = document.createElement("figcaption");
  copy.className = "project-content-copy";

  if (typeof block.title === "string" && block.title.trim()) {
    const title = document.createElement("h4");
    title.textContent = block.title.trim();
    copy.append(title);
  }
  if (typeof block.body === "string" && block.body.trim()) {
    const body = document.createElement("p");
    const highlights = Array.isArray(block.highlights) ? block.highlights : [];
    if (highlights.length) {
      body.innerHTML = projectHighlightedCopy(block.body.trim(), highlights);
    } else {
      body.textContent = block.body.trim();
    }
    copy.append(body);
  }
  if (typeof block.caption === "string" && block.caption.trim()) {
    const caption = document.createElement("span");
    caption.textContent = block.caption.trim();
    copy.append(caption);
  }
  return copy;
}

function projectHighlightedCopy(source, highlights) {
  const escapeHtml = (value) => value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
  const ranges = highlights.flatMap((highlight) => {
    const text = typeof highlight?.text === "string" ? highlight.text.trim() : "";
    if (!text) return [];
    const start = source.indexOf(text);
    return start < 0 ? [] : [{ start, end: start + text.length, tone: highlight.tone === "dark" ? "dark" : "accent" }];
  }).sort((a, b) => a.start - b.start);
  if (!ranges.length) return escapeHtml(source);
  let cursor = 0;
  const output = [];
  ranges.forEach((range) => {
    if (range.start < cursor) return;
    output.push(escapeHtml(source.slice(cursor, range.start)));
    output.push(`<mark data-tone="${range.tone}">${escapeHtml(source.slice(range.start, range.end))}</mark>`);
    cursor = range.end;
  });
  output.push(escapeHtml(source.slice(cursor)));
  return output.join("");
}

function setupUtopiaImageRail(viewport) {
  if (viewport.dataset.autoscrollReady) return;
  viewport.dataset.autoscrollReady = "true";
  const autoScrollSpeed = Number(viewport.dataset.scrollSpeed) || -0.045;
  const originals = [...viewport.children];
  const belt = document.createElement("div");
  belt.className = "project-utopia-image-belt";
  const clone = (panel) => {
    const copy = panel.cloneNode(true);
    copy.setAttribute("aria-hidden", "true");
    return copy;
  };
  belt.append(...originals.map(clone), ...originals, ...originals.map(clone));
  viewport.replaceChildren(belt);
  belt.querySelectorAll("img").forEach(image => { image.draggable = false; });
  let cycle = 0, position = 0, dragging = false, lastX = 0, resume = 0;
  const paint = () => {
    if (!cycle) return;
    position = ((position % cycle) + cycle) % cycle;
    belt.style.transform = `translate3d(${-cycle + position}px, 0, 0)`;
  };
  const resize = new ResizeObserver(() => {
    cycle = belt.children[originals.length].offsetLeft - belt.children[0].offsetLeft;
    paint();
  });
  resize.observe(viewport);
  viewport.addEventListener("dragstart", event => event.preventDefault());
  viewport.addEventListener("pointerdown", event => {
    if (event.button !== 0) return;
    dragging = true;
    lastX = event.clientX;
    viewport.setPointerCapture(event.pointerId);
    viewport.classList.add("is-dragging");
  });
  viewport.addEventListener("pointermove", event => {
    if (!dragging) return;
    const scale = viewport.getBoundingClientRect().width / viewport.offsetWidth;
    position += (event.clientX - lastX) / scale;
    lastX = event.clientX;
    paint();
  });
  const release = () => {
    dragging = false;
    resume = performance.now() + 900;
    viewport.classList.remove("is-dragging");
  };
  viewport.addEventListener("pointerup", release);
  viewport.addEventListener("pointercancel", release);
  viewport.addEventListener("lostpointercapture", release);
  const animate = (time, dt) => {
    if (!dragging && time > resume) { position += dt * autoScrollSpeed; paint(); }
  };
  window.projectRuntime.animate(viewport, animate, () => resize.disconnect());
}

function setupProjectMediaRail(track) {
  if (!track || track.dataset.autoscrollReady === "true") return;
  track.dataset.autoscrollReady = "true";

  let isDragging = false;
  let lastPointerX = 0;
  let resumeAt = 0;
  let cycleWidth = 0;
  let hasInitialPosition = false;
  let autoScrollPosition = null;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    && track.dataset.forceAutoscroll !== "true";
  const originalGroups = [...track.children];

  const leadingClones = document.createDocumentFragment();
  originalGroups.forEach((group) => {
    const leadingClone = group.cloneNode(true);
    leadingClone.dataset.loopClone = "before";
    leadingClone.setAttribute("aria-hidden", "true");
    leadingClones.append(leadingClone);

    const trailingClone = group.cloneNode(true);
    trailingClone.dataset.loopClone = "after";
    trailingClone.setAttribute("aria-hidden", "true");
    track.append(trailingClone);
  });
  track.prepend(leadingClones);
  track.querySelectorAll("video").forEach(bindProjectManagedVideo);

  const normalizeScroll = () => {
    if (cycleWidth <= 1) return;
    if (track.scrollLeft >= cycleWidth * 2) track.scrollLeft -= cycleWidth;
    if (track.scrollLeft <= 0) track.scrollLeft += cycleWidth;
  };

  const updateCycleWidth = () => {
    const firstOriginal = track.children[originalGroups.length];
    const firstTrailingClone = track.children[originalGroups.length * 2];
    cycleWidth = firstOriginal && firstTrailingClone
      ? firstTrailingClone.offsetLeft - firstOriginal.offsetLeft
      : 0;
    if (!hasInitialPosition && cycleWidth > 1) {
      track.scrollLeft = cycleWidth;
      hasInitialPosition = true;
    } else {
      normalizeScroll();
    }
  };
  const resizeObserver = new ResizeObserver(updateCycleWidth);
  resizeObserver.observe(track);


  const finishDrag = (event) => {
    if (!isDragging) return;
    isDragging = false;
    track.classList.remove("is-dragging");
    resumeAt = performance.now() + 1400;
    if (typeof track.releasePointerCapture === "function" && track.hasPointerCapture?.(event.pointerId)) {
      track.releasePointerCapture(event.pointerId);
    }
  };

  track.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    isDragging = true;
    autoScrollPosition = null;
    lastPointerX = event.clientX;
    track.classList.add("is-dragging");
    track.setPointerCapture?.(event.pointerId);
  });
  track.addEventListener("pointermove", (event) => {
    if (!isDragging) return;
    track.scrollLeft -= event.clientX - lastPointerX;
    lastPointerX = event.clientX;
    normalizeScroll();
  });
  track.addEventListener("pointerup", finishDrag);
  track.addEventListener("pointercancel", finishDrag);

  const animate = (time, delta) => {
    if (!cycleWidth) updateCycleWidth();
    if (!reducedMotion && !isDragging && time >= resumeAt && cycleWidth > 1) {
      autoScrollPosition ??= track.scrollLeft;
      autoScrollPosition += delta * (Number(track.dataset.scrollSpeed) || 0.088);
      track.scrollLeft = autoScrollPosition;
      const beforeWrap = track.scrollLeft;
      normalizeScroll();
      autoScrollPosition += track.scrollLeft - beforeWrap;
    }
  };
  window.projectRuntime.animate(track, animate, () => resizeObserver.disconnect());
}

function projectEmbedFrames() {
  return [...document.querySelectorAll(".project-sheet iframe")]
    .filter((frame) => frame.offsetParent !== null);
}

function bindProjectEmbedFrame(frame) {
  if (!frame || frame.dataset.cursorBound === "true") return;
  frame.dataset.cursorBound = "true";
  frame.addEventListener("pointerenter", suspendCursorForEmbed, { passive: true });
  frame.addEventListener("pointerleave", restoreCursorFromEmbed, { passive: true });
}

function renderProjectBlocks(container, blocks) {
  if (!container) return;
  const makeUiPhoneDevice = ({ frame, video, image, label = "UI demonstration" }) => {
    const frameSource = safeProjectAsset(frame);
    const videoSource = safeProjectAsset(video);
    const imageSource = safeProjectAsset(image);
    if (!frameSource || (!videoSource && !imageSource)) return null;
    const device = document.createElement("div");
    device.className = "project-ui-phone-device";
    if (videoSource) {
      const media = document.createElement("video");
      media.className = "project-ui-phone-video";
      setProjectMediaSource(media, versionProjectImageAsset(videoSource));
      media.muted = true;
      media.loop = true;
      media.playsInline = true;
      media.preload = "metadata";
      media.setAttribute("muted", "");
      media.setAttribute("playsinline", "");
      media.setAttribute("aria-label", label);
      device.append(media);
      bindProjectManagedVideo(media);
    } else {
      const media = projectBlockImage(imageSource, label);
      media.className = "project-ui-phone-video project-ui-phone-static";
      media.loading = "lazy";
      device.append(media);
    }
    const frameImage = projectBlockImage(frameSource, "Landscape smartphone frame");
    frameImage.className = "project-ui-phone-frame";
    frameImage.loading = "lazy";
    device.append(frameImage);
    return device;
  };
  const makeUiCaption = (titleText, descriptionText) => {
    const caption = document.createElement("figcaption");
    caption.className = "project-ui-phone-caption";
    const title = document.createElement("strong");
    title.textContent = typeof titleText === "string" ? titleText.trim() : "";
    const description = document.createElement("span");
    description.textContent = typeof descriptionText === "string" ? descriptionText.trim() : "";
    caption.append(title, description);
    return caption;
  };
  const rendered = (Array.isArray(blocks) ? blocks : []).slice(0, 30).flatMap((block) => {
    if (!block || typeof block !== "object") return [];
    if (["hmi-gallery", "hmi-loop", "hmi-placeholder", "hmi-notes"].includes(block.type)) {
      return renderHmiProjectBlock(block);
    }
    if (typeof block.type === "string" && block.type.startsWith("ve-") && typeof renderVisualEditorBlock === "function") {
      return renderVisualEditorBlock(block);
    }
    if (typeof block.type === "string" && block.type.startsWith("gts-") && typeof renderGangstarBlock === "function") {
      return renderGangstarBlock(block);
    }
    if (block.type === "sound-showcase" && typeof renderSoundDesignBlock === "function") {
      return renderSoundDesignBlock(block);
    }
    const type = ["split", "duo", "inset", "stage", "text", "video", "video-pair", "project-link", "soundcloud-stack", "motion-grid", "media-rail", "hongshan-intro", "hongshan-footer", "technical-spec", "ui-element-library", "ui-responsive-system", "ui-phone-demo", "ui-phone-fan", "ui-phone-pair", "ui-finale", "audio-player-grid", "audio-footer", "flora-market", "flora-concept-pair", "flora-ui-showcase", "flora-interaction-gallery", "flora-gallery", "flora-feedback", "olive-inspiration", "olive-process-stack", "olive-metabolism-grid", "olive-render-gallery", "cloud-board-stack", "midi-board-stack", "midi-outcome-pair", "water-board-stack", "utopia-epigraph", "utopia-guide", "utopia-section-heading", "utopia-story-sphere", "utopia-story-scroll", "utopia-video-trio", "utopia-synopsis", "utopia-playtime", "utopia-closing", "poka-manifesto", "poka-collage", "poka-loop-video", "poka-process-pair", "poka-ui-showcase", "nibiru-belief-loop", "nibiru-metric", "nibiru-field-study", "nibiru-portrait-film", "nibiru-ritual-sequence", "nibiru-installation-triptych", "nibiru-system-grid", "nibiru-artist-statement", "show-emotions-gallery", "show-emotions-triptych", "show-emotions-system"].includes(block.type) ? block.type : "inset";
    const figure = document.createElement("figure");
    figure.className = `project-content-block project-content-${type}`;
    const layout = ["full", "wide", "rail", "narrow"].includes(block.layout)
      ? block.layout
      : "rail";
    figure.dataset.layout = layout;
    if (typeof block.variant === "string" && /^[a-z0-9-]+$/.test(block.variant.trim())) {
      figure.dataset.variant = block.variant.trim();
    }

    // Show-E-Motions exports are individual images; captions remain live text.
    if (type === "show-emotions-gallery") {
      figure.classList.add("project-content-show-gallery");
      const gallery = document.createElement("div");
      gallery.className = "project-show-gallery";
      const items = Array.isArray(block.items) ? block.items.slice(0, 12) : [];
      items.forEach((item) => {
        const image = projectBlockImage(item.src, item.alt || item.title || "Project image");
        if (!image) return;
        if (Number.isFinite(item.width) && Number.isFinite(item.height)) {
          image.width = item.width;
          image.height = item.height;
        }
        const card = document.createElement("figure");
        card.className = "project-show-gallery-item";
        const media = document.createElement("div");
        media.className = "project-show-gallery-media";
        if (item.comparison) {
          const comparison = projectBlockImage(
            item.comparison,
            item.comparisonAlt || "Related comparison image"
          );
          if (comparison) {
            media.classList.add("has-comparison");
            media.append(comparison);
          }
        }
        media.append(image);
        const caption = document.createElement("figcaption");
        if (item.title) {
          const title = document.createElement("strong");
          title.textContent = item.title;
          caption.append(title);
        }
        if (item.body) {
          const body = document.createElement("span");
          body.textContent = item.body;
          caption.append(body);
        }
        card.append(media, caption);
        gallery.append(card);
      });
      if (!gallery.children.length) return [];
      if (block.copyPosition === "before") figure.append(projectBlockCopy(block), gallery);
      else figure.append(gallery, projectBlockCopy(block));
      return [figure];
    }

    if (type === "show-emotions-triptych") {
      const clips = Array.isArray(block.clips) ? block.clips.slice(0, 3) : [];
      if (clips.length !== 3) return [];
      const content = document.createElement("section");
      content.className = "project-show-emotions-triptych";
      clips.forEach((clip, index) => {
        const source = safeProjectAsset(clip?.src);
        if (!source) return;
        const item = document.createElement("article");
        const video = document.createElement("video");
        setProjectMediaSource(video, versionProjectImageAsset(source));
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        video.defaultMuted = true;
        video.playsInline = true;
        video.preload = "metadata";
        video.setAttribute("autoplay", "");
        video.setAttribute("loop", "");
        video.setAttribute("muted", "");
        video.setAttribute("playsinline", "");
        video.setAttribute("aria-label", typeof clip?.alt === "string" ? clip.alt.trim() : `Affective state ${index + 1}`);
        const number = document.createElement("span");
        number.textContent = String(index + 1).padStart(2, "0");
        const title = document.createElement("strong");
        title.textContent = typeof clip?.title === "string" ? clip.title.trim() : "";
        const body = document.createElement("p");
        body.textContent = typeof clip?.body === "string" ? clip.body.trim() : "";
        item.append(video, number, title, body);
        content.append(item);
        bindProjectManagedVideo(video);
      });
      if (content.children.length !== 3) return [];
      figure.append(content, projectBlockCopy(block));
      return [figure];
    }

    if (type === "show-emotions-system") {
      const steps = (Array.isArray(block.steps) ? block.steps : []).slice(0, 8);
      if (!steps.length) return [];
      const content = document.createElement("section");
      content.className = "project-show-emotions-system";
      const flow = document.createElement("ol");
      steps.forEach((step, index) => {
        const item = document.createElement("li");
        const number = document.createElement("span");
        number.textContent = String(index + 1).padStart(2, "0");
        const title = document.createElement("strong");
        title.textContent = typeof step?.title === "string" ? step.title.trim() : "";
        const body = document.createElement("p");
        body.textContent = typeof step?.body === "string" ? step.body.trim() : "";
        item.append(number, title, body);
        flow.append(item);
      });
      content.append(flow);
      figure.append(content, projectBlockCopy(block));
      return [figure];
    }

    if (type === "nibiru-belief-loop") {
      const content = document.createElement("section");
      content.className = "project-nibiru-belief-loop";
      const core = document.createElement("div");
      core.className = "project-nibiru-belief-core";
      const coreLabel = document.createElement("strong");
      coreLabel.textContent = typeof block.core === "string" ? block.core.trim() : "BELIEF";
      const coreNote = document.createElement("span");
      coreNote.textContent = typeof block.coreNote === "string" ? block.coreNote.trim() : "A self-sealing information system";
      core.append(coreLabel, coreNote);
      const list = document.createElement("ol");
      (Array.isArray(block.steps) ? block.steps : []).slice(0, 6).forEach((step, index) => {
        const item = document.createElement("li");
        const number = document.createElement("span");
        number.textContent = String(index + 1).padStart(2, "0");
        const copy = document.createElement("div");
        const title = document.createElement("strong");
        title.textContent = typeof step?.title === "string" ? step.title.trim() : "";
        const body = document.createElement("p");
        body.textContent = typeof step?.body === "string" ? step.body.trim() : "";
        copy.append(title, body);
        item.append(number, copy);
        list.append(item);
      });
      const note = document.createElement("p");
      note.className = "project-nibiru-belief-note";
      note.textContent = typeof block.note === "string" ? block.note.trim() : "";
      content.append(core, list, note);
      figure.append(content);
      return [figure];
    }

    if (type === "nibiru-metric") {
      const content = document.createElement("section");
      content.className = "project-nibiru-metric";
      const label = document.createElement("span");
      label.textContent = typeof block.label === "string" ? block.label.trim() : "PERCEPTION WORKSHOP";
      const value = document.createElement("strong");
      value.textContent = typeof block.value === "string" ? block.value.trim() : "65%";
      const copy = document.createElement("div");
      const title = document.createElement("h4");
      title.textContent = typeof block.title === "string" ? block.title.trim() : "Images do not simply show evidence. They train interpretation.";
      const body = document.createElement("p");
      body.textContent = typeof block.body === "string" ? block.body.trim() : "";
      copy.append(title, body);
      const image = projectBlockImage(block.image, block.alt || "Workshop response sheets and coded results");
      content.append(label, value, copy, ...(image ? [image] : []));
      figure.append(content);
      return [figure];
    }

    if (type === "nibiru-field-study") {
      const content = document.createElement("section");
      content.className = "project-nibiru-field-study";
      const gallery = document.createElement("div");
      gallery.className = "project-nibiru-field-gallery";
      (Array.isArray(block.images) ? block.images : []).slice(0, 3).forEach((source, index) => {
        const image = projectBlockImage(source, `Field research in Chinatown ${index + 1}`);
        if (image) gallery.append(image);
      });
      const flow = document.createElement("ol");
      flow.className = "project-nibiru-field-flow";
      (Array.isArray(block.steps) ? block.steps : []).slice(0, 4).forEach((step, index) => {
        const item = document.createElement("li");
        const number = document.createElement("span");
        number.textContent = String(index + 1).padStart(2, "0");
        const title = document.createElement("strong");
        title.textContent = typeof step?.title === "string" ? step.title.trim() : "";
        const body = document.createElement("p");
        body.textContent = typeof step?.body === "string" ? step.body.trim() : "";
        item.append(number, title, body);
        flow.append(item);
      });
      const note = document.createElement("p");
      note.className = "project-nibiru-field-note";
      note.textContent = typeof block.note === "string" ? block.note.trim() : "";
      content.append(gallery, flow, note);
      figure.append(content);
      return [figure];
    }

    if (type === "nibiru-portrait-film") {
      const source = safeProjectAsset(block.src);
      if (!source) return [];
      const content = document.createElement("section");
      content.className = "project-nibiru-portrait-film";
      const mediaFrame = document.createElement("div");
      mediaFrame.className = "project-nibiru-portrait-frame";
      const video = document.createElement("video");
      setProjectMediaSource(video, versionProjectImageAsset(source));
      video.controls = true;
      video.playsInline = true;
      video.preload = "metadata";
      video.setAttribute("playsinline", "");
      const poster = safeProjectAsset(block.poster);
      if (poster) video.poster = versionProjectImageAsset(poster);
      video.setAttribute("aria-label", typeof block.title === "string" ? block.title.trim() : "The Red Dawn recruitment film");
      mediaFrame.append(video);
      const copy = projectBlockCopy(block);
      const prophecies = Array.isArray(block.prophecies) ? block.prophecies.slice(0, 2) : [];
      if (prophecies.length) {
        const prophecy = document.createElement("div");
        prophecy.className = "project-nibiru-prophecy";
        prophecies.forEach((entry) => {
          const item = document.createElement("section");
          const title = document.createElement("strong");
          title.textContent = typeof entry?.title === "string" ? entry.title.trim() : "";
          const body = document.createElement("p");
          body.textContent = typeof entry?.body === "string" ? entry.body.trim() : "";
          if (title.textContent) item.append(title);
          if (body.textContent) item.append(body);
          if (item.children.length) prophecy.append(item);
        });
        if (prophecy.children.length) copy.append(prophecy);
      }
      content.append(mediaFrame, copy);
      figure.append(content);
      return [figure];
    }

    if (type === "nibiru-ritual-sequence") {
      const content = document.createElement("ol");
      content.className = "project-nibiru-ritual-sequence";
      (Array.isArray(block.items) ? block.items : []).slice(0, 4).forEach((item, index) => {
        const image = projectBlockImage(item?.src, typeof item?.alt === "string" ? item.alt.trim() : `Ritual state ${index + 1}`);
        if (!image) return;
        const card = document.createElement("li");
        const number = document.createElement("span");
        number.textContent = String(index + 1).padStart(2, "0");
        const label = document.createElement("strong");
        label.textContent = typeof item?.label === "string" ? item.label.trim() : "";
        card.append(image, number, label);
        content.append(card);
      });
      if (!content.children.length) return [];
      figure.append(content);
      return [figure];
    }

    if (type === "nibiru-installation-triptych") {
      const content = document.createElement("section");
      content.className = "project-nibiru-installation-triptych";
      (Array.isArray(block.images) ? block.images : []).slice(0, 3).forEach((source, index) => {
        const image = projectBlockImage(source, `${block.title || "Installation detail"} ${index + 1}`);
        if (image) content.append(image);
      });
      if (content.children.length !== 3) return [];
      figure.append(content, projectBlockCopy(block));
      return [figure];
    }

    if (type === "nibiru-system-grid") {
      const image = projectBlockImage(block.image, block.alt || "Nibiru propaganda system architecture framework");
      if (!image) return [];
      const content = document.createElement("section");
      content.className = "project-nibiru-system-grid";

      const researchLabel = document.createElement("strong");
      researchLabel.className = "project-nibiru-system-side-label";
      researchLabel.textContent = typeof block.sideLabel === "string" ? block.sideLabel.trim() : "RESEARCH";

      const heading = document.createElement("h4");
      heading.textContent = typeof block.title === "string" ? block.title.trim() : "NIBIRU PROPAGANDA SYSTEM ARCHITECTURE FRAMEWORK";

      const structureLabel = document.createElement("strong");
      structureLabel.className = "project-nibiru-system-structure-label";
      structureLabel.textContent = typeof block.structureLabel === "string" ? block.structureLabel.trim() : "STRUCTURE";

      const diagram = document.createElement("div");
      diagram.className = "project-nibiru-system-diagram";
      diagram.append(image);

      const structure = document.createElement("div");
      structure.className = "project-nibiru-system-structure";
      (Array.isArray(block.groups) ? block.groups : []).slice(0, 3).forEach((group) => {
        const section = document.createElement("section");
        const label = document.createElement("strong");
        label.textContent = typeof group?.label === "string" ? group.label.trim() : "";
        const values = document.createElement("ol");
        (Array.isArray(group?.items) ? group.items : []).slice(0, 5).forEach((value) => {
          const item = document.createElement("li");
          item.textContent = String(value || "").trim();
          if (item.textContent) values.append(item);
        });
        section.append(label, values);
        structure.append(section);
      });

      const footer = document.createElement("span");
      footer.className = "project-nibiru-system-footer";
      footer.textContent = typeof block.footer === "string" ? block.footer.trim() : "THE RED DAWN";
      content.append(researchLabel, heading, structureLabel, diagram, structure, footer);
      figure.append(content);
      return [figure];
    }

    if (type === "nibiru-artist-statement") {
      const poster = projectBlockImage(block.poster, block.posterAlt || "Whispering Behind artist statement poster");
      const montage = projectBlockImage(block.montage, block.montageAlt || "Whispering Behind film stills");
      const videoId = typeof block.videoId === "string" ? block.videoId.trim() : "";
      if (!poster || !montage || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) return [];

      const content = document.createElement("section");
      content.className = "project-nibiru-artist-statement";
      const left = document.createElement("div");
      left.className = "project-nibiru-artist-left";
      left.append(poster, projectBlockCopy(block));

      const right = document.createElement("div");
      right.className = "project-nibiru-artist-right";
      const frame = document.createElement("div");
      frame.className = "project-nibiru-artist-video";
      const iframe = document.createElement("iframe");
      setProjectMediaSource(iframe, `https://www.youtube.com/embed/${videoId}?rel=0&playsinline=1&iv_load_policy=3&modestbranding=1`);
      iframe.title = typeof block.title === "string" && block.title.trim() ? block.title.trim() : "Whispering Behind";
      iframe.loading = "lazy";
      iframe.referrerPolicy = "strict-origin-when-cross-origin";
      iframe.allow = "autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share";
      iframe.setAttribute("allowfullscreen", "");
      frame.append(iframe);
      bindProjectEmbedFrame(frame);
      right.append(montage, frame);
      content.append(left, right);
      figure.append(content);
      return [figure];
    }

    if (type === "poka-manifesto") {
      const content = document.createElement("section");
      content.className = "project-poka-manifesto-copy";
      const kicker = document.createElement("span");
      kicker.textContent = typeof block.kicker === "string" ? block.kicker.trim() : "PLANET PRACIA";
      const title = document.createElement("h4");
      title.textContent = typeof block.title === "string" ? block.title.trim() : "A bright future is something we build together.";
      const columns = document.createElement("div");
      columns.className = "project-poka-manifesto-columns";
      (Array.isArray(block.paragraphs) ? block.paragraphs : []).slice(0, 3).forEach((value) => {
        const paragraph = document.createElement("p");
        paragraph.textContent = String(value || "").trim();
        if (paragraph.textContent) columns.append(paragraph);
      });
      const loop = document.createElement("ol");
      loop.className = "project-poka-core-loop";
      (Array.isArray(block.loop) ? block.loop : []).slice(0, 6).forEach((value, index) => {
        const item = document.createElement("li");
        const number = document.createElement("span");
        number.textContent = String(index + 1).padStart(2, "0");
        const label = document.createElement("strong");
        label.textContent = String(value || "").trim();
        item.append(number, label);
        loop.append(item);
      });
      content.append(kicker, title, columns, loop);
      figure.append(content);
      return [figure];
    }

    if (type === "poka-collage") {
      if (typeof block.title === "string" && block.title.trim()) {
        const header = document.createElement("header");
        header.className = "project-poka-collage-heading";
        const kicker = document.createElement("span");
        kicker.textContent = typeof block.kicker === "string" ? block.kicker.trim() : "CONCEPT ART";
        const title = document.createElement("h4");
        title.textContent = block.title.trim();
        const body = document.createElement("p");
        body.textContent = typeof block.body === "string" ? block.body.trim() : "";
        header.append(kicker, title, body);
        figure.append(header);
      }
      const grid = document.createElement("div");
      grid.className = "project-poka-collage-grid";
      (Array.isArray(block.items) ? block.items : []).slice(0, 6).forEach((item, index) => {
        const image = projectBlockImage(item?.src, typeof item?.alt === "string" ? item.alt.trim() : "POKA concept art");
        if (!image) return;
        const card = document.createElement("div");
        card.className = "project-poka-collage-card";
        card.dataset.index = String(index + 1);
        const label = document.createElement("span");
        label.textContent = typeof item?.label === "string" ? item.label.trim() : `CONCEPT ${String(index + 1).padStart(2, "0")}`;
        card.append(image, label);
        grid.append(card);
      });
      if (!grid.children.length) return [];
      figure.append(grid);
      return [figure];
    }

    if (type === "poka-process-pair") {
      if (typeof block.title === "string" && block.title.trim()) {
        const header = document.createElement("header");
        header.className = "project-poka-process-heading";
        const kicker = document.createElement("span");
        kicker.textContent = typeof block.kicker === "string" ? block.kicker.trim() : "IN-ENGINE PROTOTYPE CAPTURE";
        const title = document.createElement("h4");
        title.className = "project-poka-process-title";
        title.textContent = block.title.trim();
        header.append(kicker, title);
        figure.append(header);
      }
      const grid = document.createElement("div");
      grid.className = "project-poka-process-grid";
      (Array.isArray(block.items) ? block.items : []).slice(0, 2).forEach((item, index) => {
        const source = safeProjectAsset(item?.src);
        if (!source) return;
        const frame = document.createElement("div");
        frame.className = "project-poka-process-frame";
        const video = document.createElement("video");
        setProjectMediaSource(video, versionProjectImageAsset(source));
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        video.defaultMuted = true;
        video.playsInline = true;
        video.preload = "metadata";
        video.setAttribute("autoplay", "");
        video.setAttribute("loop", "");
        video.setAttribute("muted", "");
        video.setAttribute("playsinline", "");
        video.setAttribute("aria-label", typeof item?.alt === "string" ? item.alt.trim() : `POKA 3D process ${index + 1}`);
        frame.append(video);
        if (typeof item?.caption === "string" && item.caption.trim()) {
          const caption = document.createElement("span");
          caption.className = "project-poka-process-caption";
          caption.textContent = item.caption.trim();
          frame.append(caption);
        }
        grid.append(frame);
        bindProjectManagedVideo(video, { preserveAutoplay: true });
      });
      if (grid.children.length !== 2) return [];
      figure.append(grid);
      return [figure];
    }

    if (type === "poka-loop-video") {
      const source = safeProjectAsset(block.src);
      const isVimeo = block.provider === "vimeo" && /^\d{6,12}$/.test(String(block.videoId || ""));
      if (!source && !isVimeo) return [];
      const titlePosition = block.titlePosition === "before" ? "before" : "overlay";
      figure.dataset.titlePosition = titlePosition;
      const wrap = document.createElement("div");
      wrap.className = "project-poka-loop-video-frame";
      if (isVimeo) {
        const iframe = document.createElement("iframe");
        setProjectMediaSource(iframe, `https://player.vimeo.com/video/${block.videoId}?badge=0&autopause=0&player_id=0&app_id=58479&autoplay=0&controls=1&title=1&byline=0&portrait=0`);
        iframe.title = typeof block.alt === "string" ? block.alt.trim() : "POKA Project P concept film";
        iframe.allow = "autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share";
        iframe.referrerPolicy = "strict-origin-when-cross-origin";
        iframe.setAttribute("allowfullscreen", "");
        wrap.classList.add("project-poka-loop-video-frame-embed");
        const caption = document.createElement("div");
        caption.className = "project-poka-loop-video-caption";
        const title = document.createElement("strong");
        title.textContent = typeof block.title === "string" ? block.title.trim() : "PLANET PRACIA";
        const subtitle = document.createElement("span");
        subtitle.textContent = typeof block.caption === "string" ? block.caption.trim() : "World Concept Film";
        if (titlePosition === "before") {
          caption.append(subtitle, title);
        } else {
          caption.append(title, subtitle);
        }
        wrap.append(iframe);
        if (titlePosition === "before") {
          figure.append(caption, wrap);
        } else {
          figure.append(wrap, caption);
        }
        if (typeof block.afterTitle === "string" && block.afterTitle.trim()) {
          const afterTitle = document.createElement("h4");
          afterTitle.className = "project-poka-loop-video-after-title";
          afterTitle.textContent = block.afterTitle.trim();
          figure.append(afterTitle);
        }
        return [figure];
      }
      const video = document.createElement("video");
      setProjectMediaSource(video, versionProjectImageAsset(source));
      video.autoplay = true;
      video.loop = true;
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.preload = "metadata";
      video.setAttribute("autoplay", "");
      video.setAttribute("loop", "");
      video.setAttribute("muted", "");
      video.setAttribute("playsinline", "");
      video.setAttribute("aria-label", typeof block.alt === "string" ? block.alt.trim() : "POKA world concept film");
      const caption = document.createElement("div");
      caption.className = "project-poka-loop-video-caption";
      const title = document.createElement("strong");
      title.textContent = typeof block.title === "string" ? block.title.trim() : "PLANET PRACIA";
      const subtitle = document.createElement("span");
      subtitle.textContent = typeof block.caption === "string" ? block.caption.trim() : "World concept film";
      caption.append(title, subtitle);
      wrap.append(video, caption);
      figure.append(wrap);
      bindProjectManagedVideo(video, { preserveAutoplay: true });
      return [figure];
    }

    if (type === "poka-ui-showcase") {
      const content = document.createElement("section");
      content.className = "project-poka-ui-showcase-content";
      const header = document.createElement("header");
      const kicker = document.createElement("span");
      kicker.textContent = typeof block.kicker === "string" ? block.kicker.trim() : "INTERACTION DESIGN";
      const title = document.createElement("h4");
      title.textContent = typeof block.title === "string" ? block.title.trim() : "One world. Multiple interface states.";
      const body = document.createElement("p");
      body.textContent = typeof block.body === "string" ? block.body.trim() : "";
      header.append(kicker, title, body);
      const grid = document.createElement("div");
      grid.className = "project-poka-ui-grid";
      (Array.isArray(block.items) ? block.items : []).slice(0, 10).forEach((item, index) => {
        const image = projectBlockImage(item?.src, typeof item?.alt === "string" ? item.alt.trim() : "POKA interface design");
        if (!image) return;
        const card = document.createElement("div");
        card.className = "project-poka-ui-card";
        card.dataset.index = String(index + 1);
        const label = document.createElement("span");
        label.textContent = typeof item?.label === "string" ? item.label.trim() : `STATE ${String(index + 1).padStart(2, "0")}`;
        card.append(image, label);
        grid.append(card);
      });
      content.append(header, grid);
      figure.append(content);
      return [figure];
    }

    if (type === "utopia-epigraph") {
      const quote = document.createElement("blockquote");
      quote.className = "project-utopia-epigraph-copy";
      const english = document.createElement("div");
      english.className = "project-utopia-epigraph-english";
      (Array.isArray(block.english) ? block.english : []).slice(0, 4).forEach((line) => {
        const paragraph = document.createElement("p");
        paragraph.textContent = String(line || "").trim();
        if (paragraph.textContent) english.append(paragraph);
      });
      const chinese = document.createElement("p");
      chinese.className = "project-utopia-epigraph-chinese";
      chinese.lang = "zh-CN";
      chinese.textContent = typeof block.chinese === "string" ? block.chinese.trim() : "";
      quote.append(english, chinese);
      figure.append(quote);
      return [figure];
    }

    if (type === "utopia-guide") {
      const image = projectBlockImage(block.image, block.alt || "UTOPIA 2419 interaction guide");
      if (!image) return [];
      image.className = "project-utopia-guide-image";
      image.loading = "lazy";
      figure.append(image);
      return [figure];
    }

    if (type === "utopia-section-heading") {
      const header = document.createElement("header");
      header.className = "project-utopia-section-heading";
      const index = document.createElement("span");
      index.textContent = typeof block.index === "string" ? block.index.trim() : "";
      const copy = document.createElement("div");
      const title = document.createElement("h4");
      title.textContent = typeof block.title === "string" ? block.title.trim() : "";
      const body = document.createElement("p");
      body.textContent = typeof block.body === "string" ? block.body.trim() : "";
      copy.append(title, body);
      header.append(index, copy);
      figure.append(header);
      return [figure];
    }

    if (type === "utopia-story-sphere") {
      const sources = (Array.isArray(block.images) ? block.images : [])
        .slice(0, 90)
        .flatMap((source) => {
          const safeSource = safeProjectAsset(source);
          return safeSource ? [safeSource] : [];
        });
      if (!sources.length) return [];

      const content = document.createElement("section");
      content.className = "project-utopia-story-rail";
      content.dataset.forceAutoscroll = "true";
      content.dataset.scrollSpeed = "-0.045";
      content.setAttribute("aria-label", "Scrollable gallery of UTOPIA 2419 story scenes");

      for (let start = 0; start < sources.length; start += 5) {
        const panel = document.createElement("div");
        panel.className = "project-utopia-story-panel";
        panel.dataset.layout = Math.floor(start / 5) % 2 === 0 ? "lead-bottom" : "lead-top";
        Array.from({ length: 5 }, (_, offset) => sources[(start + offset) % sources.length]).forEach((source, panelIndex) => {
          const imageIndex = start + panelIndex;
          const item = document.createElement("figure");
          item.className = "project-utopia-story-rail-item";
          if (panelIndex === 0) item.classList.add("is-lead");
          const image = projectBlockImage(source, `UTOPIA 2419 narrative scene ${imageIndex + 1}`);
          if (!image) return;
          image.loading = "lazy";
          item.append(image);
          panel.append(item);
        });
        if (panel.children.length) content.append(panel);
      }
      figure.append(content);
      // Start after the complete block has been mounted into the document.
      return [figure];
    }

    if (type === "utopia-story-scroll") {
      const overlay = projectBlockImage(block.overlay, "UTOPIA 2419 story structure");
      if (!overlay) return [];
      overlay.className = "project-utopia-story-scroll-overlay";
      overlay.loading = "lazy";
      const viewport = document.createElement("div");
      viewport.className = "project-utopia-story-scroll-viewport";
      const track = document.createElement("div");
      track.className = "project-utopia-story-scroll-track";
      const placeholderCount = Math.min(10, Math.max(3, Number(block.placeholderCount) || 6));
      for (let index = 0; index < placeholderCount; index += 1) {
        const placeholder = document.createElement("div");
        placeholder.className = "project-utopia-story-placeholder";
        const number = document.createElement("span");
        number.textContent = String(index + 1).padStart(2, "0");
        const label = document.createElement("strong");
        label.textContent = "STORY IMAGE PLACEHOLDER";
        placeholder.append(number, label);
        track.append(placeholder);
      }
      viewport.append(track);
      figure.append(viewport, overlay);
      return [figure];
    }

    if (type === "utopia-video-trio") {
      const items = (Array.isArray(block.items) ? block.items : []).slice(0, 3).flatMap((item, index) => {
        const source = safeProjectAsset(item?.src);
        if (!source) return [];
        const video = document.createElement("video");
        setProjectMediaSource(video, versionProjectImageAsset(source));
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        video.defaultMuted = true;
        video.playsInline = true;
        video.preload = "metadata";
        video.setAttribute("autoplay", "");
        video.setAttribute("loop", "");
        video.setAttribute("muted", "");
        video.setAttribute("playsinline", "");
        video.setAttribute("aria-label", typeof item?.alt === "string" ? item.alt.trim() : `UTOPIA 2419 process clip ${index + 1}`);
        bindProjectManagedVideo(video);
        return [video];
      });
      if (!items.length) return [];
      const grid = document.createElement("div");
      grid.className = "project-utopia-video-trio-grid";
      grid.append(...items);
      figure.append(grid);
      return [figure];
    }

    if (type === "utopia-synopsis") {
      const copy = document.createElement("section");
      copy.className = "project-utopia-synopsis-copy";
      const title = document.createElement("h4");
      title.textContent = typeof block.title === "string" ? block.title.trim() : "Synopsis";
      copy.append(title);
      (Array.isArray(block.paragraphs) ? block.paragraphs : []).slice(0, 5).forEach((text) => {
        const paragraph = document.createElement("p");
        paragraph.textContent = String(text || "").trim();
        if (paragraph.textContent) copy.append(paragraph);
      });
      figure.append(copy);
      return [figure];
    }

    if (type === "utopia-playtime") {
      const copy = document.createElement("section");
      copy.className = "project-utopia-playtime-copy";
      const eyebrow = document.createElement("span");
      eyebrow.textContent = typeof block.eyebrow === "string" ? block.eyebrow.trim() : "How to Play";
      const title = document.createElement("h4");
      title.textContent = typeof block.title === "string" ? block.title.trim() : "";
      const body = document.createElement("p");
      body.textContent = typeof block.body === "string" ? block.body.trim() : "";
      copy.append(eyebrow, title, body);
      figure.append(copy);
      return [figure];
    }

    if (type === "utopia-closing") {
      const copy = document.createElement("blockquote");
      copy.className = "project-utopia-closing-copy";
      const english = document.createElement("p");
      english.textContent = typeof block.english === "string" ? block.english.trim() : "";
      const chinese = document.createElement("p");
      chinese.lang = "zh-CN";
      chinese.textContent = typeof block.chinese === "string" ? block.chinese.trim() : "";
      copy.append(english, chinese);
      figure.append(copy);
      return [figure];
    }

    if (type === "olive-inspiration") {
      const image = projectBlockImage(block.image, block.alt || "Olive Town inspiration collage");
      if (!image) return [];
      image.classList.add("project-olive-inspiration-main");
      const sideImages = (Array.isArray(block.sideImages) ? block.sideImages : [])
        .slice(0, 2)
        .flatMap((item, index) => {
          const source = typeof item === "string" ? item : item?.src;
          const alt = typeof item === "object" && typeof item?.alt === "string"
            ? item.alt
            : `Olive Town inspiration collage ${index + 1}`;
          const sideImage = projectBlockImage(source, alt);
          if (!sideImage) return [];
          sideImage.classList.add(
            "project-olive-inspiration-side",
            index === 0 ? "is-left" : "is-right",
          );
          return [sideImage];
        });
      const content = document.createElement("div");
      content.className = "project-olive-inspiration-content";
      const quote = document.createElement("blockquote");
      const quoteLine = document.createElement("p");
      const quoteText = typeof block.quote === "string" ? block.quote.trim() : "";
      const quoteHighlight = typeof block.quoteHighlight === "string"
        ? block.quoteHighlight.trim()
        : "";
      if (quoteText) {
        quoteLine.append(document.createTextNode("“"));
        const highlightIndex = quoteHighlight
          ? quoteText.toLowerCase().indexOf(quoteHighlight.toLowerCase())
          : -1;
        if (highlightIndex >= 0) {
          quoteLine.append(document.createTextNode(quoteText.slice(0, highlightIndex)));
          const emphasis = document.createElement("span");
          emphasis.className = "project-olive-quote-highlight";
          emphasis.textContent = quoteText.slice(highlightIndex, highlightIndex + quoteHighlight.length);
          quoteLine.append(emphasis, document.createTextNode(quoteText.slice(highlightIndex + quoteHighlight.length)));
        } else {
          quoteLine.append(document.createTextNode(quoteText));
        }
        quoteLine.append(document.createTextNode("”"));
      }
      const attribution = document.createElement("cite");
      attribution.textContent = typeof block.attribution === "string" ? block.attribution.trim() : "";
      quote.append(quoteLine, attribution);
      const caption = document.createElement("p");
      caption.className = "project-olive-inspiration-caption";
      caption.textContent = typeof block.captionText === "string" ? block.captionText.trim() : "";
      const stack = document.createElement("div");
      stack.className = "project-olive-inspiration-stack";
      stack.tabIndex = 0;
      stack.setAttribute("role", "group");
      stack.setAttribute("aria-label", "Three layered Olive Town inspiration boards");
      stack.append(
        image,
        ...(sideImages[0] ? [sideImages[0]] : []),
        ...(sideImages[1] ? [sideImages[1]] : []),
      );
      content.append(
        quote,
        stack,
        caption,
      );
      figure.append(content);
      return [figure];
    }

    if (type === "olive-process-stack") {
      const images = (Array.isArray(block.images) ? block.images : []).slice(0, 8).flatMap((item, index) => {
        const source = typeof item === "string" ? item : item?.src;
        const alt = typeof item === "object" && typeof item?.alt === "string"
          ? item.alt
          : `Olive Town design process board ${index + 1}`;
        const image = projectBlockImage(source, alt);
        return image ? [image] : [];
      });
      if (!images.length) return [];
      const stack = document.createElement("div");
      stack.className = "project-olive-process-stack";
      stack.append(...images);
      figure.append(stack);
      return [figure];
    }

    if (type === "cloud-board-stack") {
      const images = (Array.isArray(block.images) ? block.images : []).slice(0, 8).flatMap((item, index) => {
        const source = typeof item === "string" ? item : item?.src;
        const alt = typeof item === "object" && typeof item?.alt === "string"
          ? item.alt
          : `Cloud Island system board ${index + 1}`;
        const image = projectBlockImage(source, alt);
        return image ? [image] : [];
      });
      if (!images.length) return [];
      const stack = document.createElement("div");
      stack.className = "project-cloud-board-stack";
      stack.append(...images);
      figure.append(stack);
      return [figure];
    }

    if (type === "midi-board-stack") {
      const images = (Array.isArray(block.images) ? block.images : []).slice(0, 8).flatMap((item, index) => {
        const source = typeof item === "string" ? item : item?.src;
        const alt = typeof item === "object" && typeof item?.alt === "string"
          ? item.alt
          : `Wearable MIDI instrument design board ${index + 1}`;
        const image = projectBlockImage(source, alt);
        if (!image) return [];
        if (typeof item === "object" && item?.replayFirstVideo === true) {
          const replayPanel = document.createElement("div");
          replayPanel.className = "project-midi-board-replay";
          const replayButton = document.createElement("button");
          replayButton.className = "project-midi-board-replay-button";
          replayButton.type = "button";
          replayButton.setAttribute("aria-label", "Return to the Performance Demo video");
          replayButton.addEventListener("click", () => {
            const firstVideoFrame = projectSheet?.querySelector(".project-content-video-frame");
            if (!firstVideoFrame) return;
            replayButton.blur();
            firstVideoFrame.scrollIntoView({
              behavior: reduceMotionQuery.matches ? "auto" : "smooth",
              block: "start",
              inline: "nearest",
            });
          });
          replayPanel.append(image, replayButton);
          return [replayPanel];
        }
        return [image];
      });
      if (!images.length) return [];
      const stack = document.createElement("div");
      stack.className = "project-midi-board-stack";
      stack.append(...images);
      figure.append(stack);
      return [figure];
    }

    if (type === "midi-outcome-pair") {
      const items = (Array.isArray(block.images) ? block.images : []).slice(0, 2).flatMap((item, index) => {
        const source = typeof item === "string" ? item : item?.src;
        const image = projectBlockImage(source, typeof item?.alt === "string"
          ? item.alt
          : `Wearable MIDI instrument final outcome ${index + 1}`);
        if (!image) return [];
        const wrapper = document.createElement("div");
        wrapper.className = "project-midi-outcome-item";
        const media = document.createElement("div");
        media.className = "project-midi-outcome-media";
        if (typeof item === "object" && item?.cropEdges === true) media.classList.add("is-edge-cropped");
        const caption = document.createElement("p");
        caption.textContent = typeof item?.caption === "string" ? item.caption.trim() : "";
        media.append(image);
        wrapper.append(media, caption);
        return [wrapper];
      });
      if (items.length !== 2) return [];
      const pair = document.createElement("div");
      pair.className = "project-midi-outcome-grid";
      pair.append(...items);
      figure.append(pair);
      return [figure];
    }

    if (type === "water-board-stack") {
      const images = (Array.isArray(block.images) ? block.images : []).slice(0, 6).flatMap((item, index) => {
        const source = typeof item === "string" ? item : item?.src;
        const alt = typeof item === "object" && typeof item?.alt === "string"
          ? item.alt
          : `Water Babies project board ${index + 1}`;
        const image = projectBlockImage(source, alt);
        if (!image) return [];

        if (typeof item === "object" && item?.videoOverlay === true) {
          const panel = document.createElement("div");
          panel.className = "project-water-research-board";
          const videoSource = safeProjectAsset(item.video);
          if (videoSource) {
            const video = document.createElement("video");
            video.className = "project-water-hud-video";
            setProjectMediaSource(video, versionProjectImageAsset(videoSource));
            video.autoplay = true;
            video.muted = true;
            video.loop = true;
            video.playsInline = true;
            video.preload = "metadata";
            video.setAttribute("muted", "");
            video.setAttribute("playsinline", "");
            video.setAttribute("aria-label", "Real-time Water Babies visualization and interface response");
            const playButton = document.createElement("button");
            playButton.className = "project-water-hud-play";
            playButton.type = "button";
            playButton.hidden = true;
            playButton.setAttribute("aria-label", "Play the real-time Water Babies visualization");
            playButton.addEventListener("click", () => video.play().catch(() => {}));
            video.addEventListener("playing", () => { playButton.hidden = true; });
            video.addEventListener("pause", () => {
              window.setTimeout(() => {
                playButton.hidden = !video.paused || !document.body.classList.contains("project-open");
              }, 450);
            });
            panel.append(image, video, playButton);
            bindProjectManagedVideo(video, { preserveAutoplay: true });
            return [panel];
          }
        }

        const renderedItem = [image];
        const soundCloud = typeof item === "object" && item?.soundCloud && typeof item.soundCloud === "object"
          ? item.soundCloud
          : null;
        const soundCloudTrackId = typeof soundCloud?.trackId === "string" ? soundCloud.trackId.trim() : "";
        if (/^\d+$/.test(soundCloudTrackId)) {
          const audio = document.createElement("section");
          audio.className = "project-water-soundcloud";
          audio.setAttribute("aria-label", "Water Babies sound design");

          const iframe = document.createElement("iframe");
          iframe.title = "Water Babies by Oliver Wu on SoundCloud";
          setProjectMediaSource(iframe, safeSoundCloudPlayer(`https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/soundcloud%253Atracks%253A${soundCloudTrackId}&color=%2389c9ec&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true`));
          iframe.width = "100%";
          iframe.height = "166";
          iframe.scrolling = "no";
          iframe.frameBorder = "0";
          iframe.allow = "autoplay; encrypted-media";
          iframe.loading = "lazy";

          const credit = document.createElement("p");
          credit.className = "project-water-soundcloud-credit";
          const track = document.createElement("a");
          track.href = "https://soundcloud.com/oliver-wu-220146389/water-babies";
          track.target = "_blank";
          track.rel = "noopener noreferrer";
          track.textContent = "Water Baby — Creature Sound Design";
          credit.append(track);
          audio.append(credit, iframe);
          renderedItem.push(audio);
        }
        return renderedItem;
      });
      if (!images.length) return [];
      const stack = document.createElement("div");
      stack.className = "project-water-board-stack";
      const audioItems = images.filter((item) => item.classList?.contains("project-water-soundcloud"));
      const visualItems = images.filter((item) => !item.classList?.contains("project-water-soundcloud"));
      stack.append(...visualItems, ...audioItems);
      figure.append(stack);
      return [figure];
    }

    if (type === "olive-metabolism-grid") {
      const main = projectBlockImage(block.mainImage, block.mainAlt || "Interactive Olive Town screen beneath the viaduct");
      const upper = projectBlockImage(block.upperImage, block.upperAlt || "Olive Town capsule architecture study");
      const board = projectBlockImage(block.boardImage, block.boardAlt || "Olive Town architectural design board");
      if (!main || !upper || !board) return [];
      const layout = document.createElement("div");
      layout.className = "project-olive-metabolism-layout";
      const side = document.createElement("div");
      side.className = "project-olive-metabolism-side";
      const note = document.createElement("p");
      note.className = "project-olive-metabolism-note";
      note.textContent = typeof block.note === "string" ? block.note.trim() : "";
      side.append(upper, note);
      layout.append(main, side);
      figure.append(layout, board);
      return [figure];
    }

    if (type === "olive-render-gallery") {
      const renderItem = (item, alt) => {
        const source = typeof item === "string" ? item : item?.src;
        const image = projectBlockImage(source, alt);
        if (!image) return null;
        const wrapper = document.createElement("div");
        wrapper.className = "project-olive-render-item";
        const caption = document.createElement("p");
        caption.textContent = typeof item?.caption === "string" ? item.caption.trim() : "";
        wrapper.append(image, caption);
        return wrapper;
      };
      const pairImages = (Array.isArray(block.pair) ? block.pair : []).slice(0, 2).flatMap((item, index) => {
        const render = renderItem(item, `Olive Town exterior render ${index + 1}`);
        return render ? [render] : [];
      });
      const gridImages = (Array.isArray(block.grid) ? block.grid : []).slice(0, 4).flatMap((item, index) => {
        const render = renderItem(item, `Olive Town spatial render ${index + 1}`);
        return render ? [render] : [];
      });
      if (pairImages.length !== 2 || gridImages.length !== 4) return [];
      const pair = document.createElement("div");
      pair.className = "project-olive-render-pair";
      pair.append(...pairImages);
      const grid = document.createElement("div");
      grid.className = "project-olive-render-grid";
      grid.append(...gridImages);
      figure.append(pair, grid);
      return [figure];
    }

    if (type === "flora-market") {
      const content = document.createElement("div");
      content.className = "project-flora-market-content";
      const copy = projectBlockCopy(block);
      const insights = document.createElement("div");
      insights.className = "project-flora-insights";
      (Array.isArray(block.insights) ? block.insights : []).slice(0, 4).forEach((insight) => {
        const card = document.createElement("article");
        const label = document.createElement("strong");
        const description = document.createElement("p");
        label.textContent = typeof insight?.label === "string" ? insight.label.trim() : "";
        description.textContent = typeof insight?.text === "string" ? insight.text.trim() : "";
        if (label.textContent && description.textContent) {
          card.append(label, description);
          insights.append(card);
        }
      });
      content.append(copy, insights);
      figure.append(content);
      return [figure];
    }

    if (type === "flora-concept-pair") {
      const images = [
        [block.brainstormImage, "Brainstorm sketches on an irregular paper sheet"],
        [block.uxImage, "FloraHaven UX user flow and interface architecture"]
      ].flatMap(([source, alt]) => {
        const image = projectBlockImage(source, alt);
        return image ? [image] : [];
      });
      if (images.length !== 2) return [];
      const pair = document.createElement("div");
      pair.className = "project-flora-concept-grid";
      pair.append(...images);
      figure.append(projectBlockCopy(block), pair);
      return [figure];
    }

    if (type === "flora-ui-showcase") {
      const entries = [
        ["overview", block.overviewImage, block.overviewAlt || "FloraHaven spatial workspace overview", block.overviewCaption],
        ["status", block.statusImage, block.statusAlt || "FloraHaven plant status interface", block.statusCaption],
        ["flow", block.flowImage, block.flowAlt || "FloraHaven watering flow", block.flowCaption],
        ["scene", block.sceneImage, block.sceneAlt || "FloraHaven interface in a living space", block.sceneCaption]
      ];
      const media = entries.flatMap(([name, source, alt, caption]) => {
        const image = projectBlockImage(source, alt);
        if (!image) return [];
        const item = document.createElement("div");
        item.className = `project-flora-ui-item project-flora-ui-${name}`;
        const text = document.createElement("p");
        text.textContent = typeof caption === "string" ? caption.trim() : "";
        if (name === "flow") {
          const crop = document.createElement("div");
          crop.className = "project-flora-ui-flow-crop";
          crop.append(image);
          item.append(crop);
        } else {
          item.append(image);
        }
        if (text.textContent) item.append(text);
        return [item];
      });
      if (media.length !== 4) return [];
      const dark = document.createElement("div");
      dark.className = "project-flora-ui-dark";
      dark.append(...media.slice(1, 3));
      figure.append(media[0], dark, media[3]);
      return [figure];
    }

    if (type === "flora-interaction-gallery") {
      const sources = [
        [block.leftImage, "Plant interaction viewed through Apple Vision Pro"],
        [block.rightImage, "FloraHaven plant detail interface"],
        [block.bottomImage, "Close-up FloraHaven spatial interaction"]
      ];
      const images = sources.flatMap(([source, alt]) => {
        const image = projectBlockImage(source, alt);
        return image ? [image] : [];
      });
      if (images.length !== 3) return [];
      const gallery = document.createElement("div");
      gallery.className = "project-flora-interaction-grid";
      images.forEach((image, index) => image.classList.add(`project-flora-interaction-${index + 1}`));
      const rightCaption = document.createElement("p");
      rightCaption.className = "project-flora-interaction-caption project-flora-interaction-caption-right";
      rightCaption.textContent = typeof block.rightCaption === "string" ? block.rightCaption.trim() : "";
      const bottomCaption = document.createElement("p");
      bottomCaption.className = "project-flora-interaction-caption project-flora-interaction-caption-bottom";
      bottomCaption.textContent = typeof block.bottomCaption === "string" ? block.bottomCaption.trim() : "";
      gallery.append(...images);
      if (rightCaption.textContent) gallery.append(rightCaption);
      if (bottomCaption.textContent) gallery.append(bottomCaption);
      figure.append(projectBlockCopy(block), gallery);
      return [figure];
    }

    if (type === "flora-gallery") {
      const images = (Array.isArray(block.images) ? block.images : []).slice(0, 3).flatMap((source, index) => {
        const image = projectBlockImage(source, `FloraHaven interface context ${index + 1}`);
        return image ? [image] : [];
      });
      if (images.length !== 3) return [];
      const gallery = document.createElement("div");
      gallery.className = "project-flora-gallery-grid";
      gallery.append(...images);
      figure.append(gallery, projectBlockCopy(block));
      return [figure];
    }

    if (type === "flora-feedback") {
      const copy = projectBlockCopy(block);
      const tableWrap = document.createElement("div");
      tableWrap.className = "project-flora-feedback-table-wrap";
      const table = document.createElement("table");
      table.className = "project-flora-feedback-table";
      const head = document.createElement("thead");
      const headRow = document.createElement("tr");
      [block.categoryLabel || "Feedback type", block.beforeLabel || "Plant needs water", block.afterLabel || "After watering"].forEach((text) => {
        const cell = document.createElement("th");
        cell.scope = "col";
        cell.textContent = String(text);
        headRow.append(cell);
      });
      head.append(headRow);
      const body = document.createElement("tbody");
      (Array.isArray(block.rows) ? block.rows : []).slice(0, 4).forEach((row) => {
        const entries = Array.isArray(row?.entries) ? row.entries.slice(0, 4) : [];
        if (!entries.length) return;
        entries.forEach((entry, entryIndex) => {
          const tr = document.createElement("tr");
          if (entryIndex === 0) {
            const heading = document.createElement("th");
            heading.scope = "rowgroup";
            heading.rowSpan = entries.length;
            const label = document.createElement("strong");
            label.textContent = typeof row?.category === "string" ? row.category.trim() : "";
            heading.append(label);
            if (typeof row?.note === "string" && row.note.trim()) {
              const note = document.createElement("small");
              note.textContent = row.note.trim();
              heading.append(note);
            }
            tr.append(heading);
          }
          if (typeof entry?.shared === "string" && entry.shared.trim()) {
            tr.className = "project-flora-feedback-shared-row";
            const cell = document.createElement("td");
            cell.colSpan = 2;
            cell.textContent = entry.shared.trim();
            tr.append(cell);
          } else {
            [entry?.before, entry?.after].forEach((text) => {
              const cell = document.createElement("td");
              cell.textContent = typeof text === "string" ? text.trim() : "";
              tr.append(cell);
            });
          }
          body.append(tr);
        });
      });
      table.append(head, body);
      tableWrap.append(table);
      figure.append(copy, tableWrap);
      return [figure];
    }

    if (type === "ui-element-library") {
      const imageSource = safeProjectAsset(block.image);
      if (!imageSource) return [];
      const heading = document.createElement("h4");
      heading.className = "project-ui-secondary-heading";
      heading.textContent = typeof block.title === "string" ? block.title.trim() : "UI Element Library";
      const image = projectBlockImage(imageSource, block.alt || "UI element library");
      image.className = "project-ui-library-image";
      image.loading = "lazy";
      const tags = document.createElement("ul");
      tags.className = "project-ui-tags";
      (Array.isArray(block.tags) ? block.tags : []).slice(0, 8).forEach((tag) => {
        const item = document.createElement("li");
        item.textContent = String(tag || "").trim();
        if (item.textContent) tags.append(item);
      });
      figure.append(heading, image, tags);
      return [figure];
    }

    if (type === "ui-responsive-system") {
      const imageSource = safeProjectAsset(block.image);
      if (!imageSource) return [];
      const heading = document.createElement("h4");
      heading.className = "project-ui-secondary-heading";
      heading.textContent = typeof block.title === "string" ? block.title.trim() : "Responsive Interface System";
      const layoutPanel = document.createElement("div");
      layoutPanel.className = "project-ui-responsive-layout";
      const image = projectBlockImage(imageSource, block.alt || "Responsive interface system");
      image.className = "project-ui-responsive-image";
      image.loading = "lazy";
      const callouts = document.createElement("div");
      callouts.className = "project-ui-callouts";
      (Array.isArray(block.callouts) ? block.callouts : []).slice(0, 4).forEach((callout) => {
        const item = document.createElement("div");
        item.className = "project-ui-callout";
        const label = document.createElement("strong");
        label.textContent = typeof callout?.label === "string" ? callout.label.trim() : "";
        const description = document.createElement("p");
        description.textContent = typeof callout?.description === "string" ? callout.description.trim() : "";
        item.append(label, description);
        callouts.append(item);
      });
      layoutPanel.append(image, callouts);
      figure.append(heading, layoutPanel);
      return [figure];
    }

    if (type === "ui-phone-demo") {
      const frameSource = safeProjectAsset(block.frame);
      const videoSource = safeProjectAsset(block.video);
      if (!frameSource || !videoSource) return [];
      figure.dataset.alignment = block.alignment === "right" ? "right" : "left";
      figure.dataset.captionPlacement = ["side-left", "side-right"].includes(block.captionPlacement)
        ? block.captionPlacement
        : "below";
      const stage = document.createElement("div");
      stage.className = "project-ui-phone-stage";
      const device = document.createElement("div");
      device.className = "project-ui-phone-device";
      const video = document.createElement("video");
      video.className = "project-ui-phone-video";
      setProjectMediaSource(video, versionProjectImageAsset(videoSource));
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = "metadata";
      video.setAttribute("muted", "");
      video.setAttribute("playsinline", "");
      video.setAttribute("aria-label", typeof block.title === "string" ? block.title.trim() : "UI demonstration");
      const frame = projectBlockImage(frameSource, "Landscape smartphone frame");
      frame.className = "project-ui-phone-frame";
      frame.loading = "lazy";
      device.append(video, frame);
      stage.append(device);
      const decorSource = safeProjectAsset(block.decor);
      if (decorSource) {
        const decor = projectBlockImage(decorSource, "Spirited Expedition island character art");
        decor.className = "project-ui-phone-decor";
        decor.loading = "lazy";
        stage.append(decor);
      }
      const caption = document.createElement("figcaption");
      caption.className = "project-ui-phone-caption";
      const title = document.createElement("strong");
      title.textContent = typeof block.title === "string" ? block.title.trim() : "";
      const description = document.createElement("span");
      description.textContent = typeof block.description === "string" ? block.description.trim() : "";
      caption.append(title, description);
      figure.append(stage, caption);
      bindProjectManagedVideo(video);
      return [figure];
    }

    if (type === "ui-phone-fan") {
      const center = makeUiPhoneDevice({
        frame: block.frame,
        video: block.centerVideo,
        label: typeof block.title === "string" ? block.title.trim() : "Meta progression"
      });
      const left = makeUiPhoneDevice({ frame: block.frame, image: block.leftImage, label: "Guardian character interface" });
      const right = makeUiPhoneDevice({ frame: block.frame, image: block.rightImage, label: "Roguelike upgrade interface" });
      if (!center || !left || !right) return [];
      const stage = document.createElement("div");
      stage.className = "project-ui-phone-fan-stage";
      left.classList.add("project-ui-fan-left");
      center.classList.add("project-ui-fan-center");
      right.classList.add("project-ui-fan-right");
      stage.append(left, center, right);
      const caption = makeUiCaption(block.title, block.description);
      figure.append(stage, caption);
      return [figure];
    }

    if (type === "ui-phone-pair") {
      const left = makeUiPhoneDevice({ frame: block.frame, video: block.leftVideo, label: block.leftLabel || "Defeat state" });
      const right = makeUiPhoneDevice({ frame: block.frame, video: block.rightVideo, label: block.rightLabel || "Victory state" });
      if (!left || !right) return [];
      const stage = document.createElement("div");
      stage.className = "project-ui-phone-pair-stage";
      const leftItem = document.createElement("div");
      const rightItem = document.createElement("div");
      leftItem.className = "project-ui-phone-pair-item";
      rightItem.className = "project-ui-phone-pair-item";
      leftItem.append(left);
      rightItem.append(right);
      stage.append(leftItem, rightItem);
      const caption = makeUiCaption(block.title, block.description);
      figure.append(stage, caption);
      return [figure];
    }

    if (type === "ui-finale") {
      const backgroundSource = safeProjectAsset(block.background);
      const handsSource = safeProjectAsset(block.hands);
      const videoSource = safeProjectAsset(block.video);
      if (!backgroundSource || !handsSource || !videoSource) return [];
      const stage = document.createElement("div");
      stage.className = "project-ui-finale-stage";
      const background = projectBlockImage(backgroundSource, "Spirited Expedition ocean world");
      background.className = "project-ui-finale-background";
      background.loading = "lazy";
      background.addEventListener("load", queueProjectParallax, { once: true });
      const device = document.createElement("div");
      device.className = "project-ui-finale-device";
      const video = document.createElement("video");
      video.className = "project-ui-finale-video";
      setProjectMediaSource(video, versionProjectImageAsset(videoSource));
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = "metadata";
      video.setAttribute("muted", "");
      video.setAttribute("playsinline", "");
      video.setAttribute("aria-label", "Spirited Expedition gameplay");
      const hands = projectBlockImage(handsSource, "Hands holding the game in landscape orientation");
      hands.className = "project-ui-finale-hands";
      hands.loading = "lazy";
      device.append(video, hands);
      const copy = document.createElement("div");
      copy.className = "project-ui-finale-copy";
      const quote = document.createElement("p");
      quote.className = "project-ui-finale-quote";
      (Array.isArray(block.quoteLines) ? block.quoteLines : []).slice(0, 3).forEach((line) => {
        const span = document.createElement("span");
        span.dataset.text = String(line || "").trim();
        span.textContent = span.dataset.text;
        if (span.textContent) quote.append(span);
      });
      const subtitle = document.createElement("p");
      subtitle.className = "project-ui-finale-subtitle";
      subtitle.dataset.text = typeof block.subtitle === "string" ? block.subtitle.trim() : "";
      subtitle.textContent = subtitle.dataset.text;
      copy.append(quote, subtitle);
      stage.append(background, device, copy);
      figure.append(stage);
      bindProjectManagedVideo(video);
      return [figure];
    }

    if (type === "audio-player-grid") {
      const artworkSource = safeProjectAsset(block.image);
      const tracks = (Array.isArray(block.tracks) ? block.tracks : []).slice(0, 3).flatMap((track) => {
        const source = safeSoundCloudPlayer(track?.embed);
        return source ? [{ source, title: typeof track?.title === "string" ? track.title.trim() : "SoundCloud track" }] : [];
      });
      if (!artworkSource || tracks.length !== 3) return [];
      const artwork = projectBlockImage(artworkSource, block.alt || "Spirited Expedition soundtrack artwork");
      artwork.className = "project-audio-artwork";
      artwork.loading = "lazy";
      const players = document.createElement("div");
      players.className = "project-audio-players";
      tracks.forEach((track) => {
        const frame = document.createElement("div");
        frame.className = "project-audio-player-frame";
        const iframe = document.createElement("iframe");
        setProjectMediaSource(iframe, track.source);
        iframe.title = track.title;
        iframe.loading = "lazy";
        iframe.referrerPolicy = "strict-origin-when-cross-origin";
        iframe.allow = "autoplay; encrypted-media";
        iframe.setAttribute("scrolling", "no");
        iframe.setAttribute("frameborder", "0");
        frame.append(iframe);
        players.append(frame);
        bindProjectEmbedFrame(frame);
      });
      figure.append(artwork, players);
      return [figure];
    }

    if (type === "audio-footer") {
      const backgroundSource = safeProjectAsset(block.background);
      if (!backgroundSource) return [];
      const background = projectBlockImage(backgroundSource, "Spirited Expedition closing artwork");
      background.className = "project-audio-footer-background";
      background.loading = "lazy";
      const content = document.createElement("div");
      content.className = "project-audio-footer-content";
      const title = document.createElement("h4");
      title.className = "project-audio-footer-title";
      title.textContent = typeof block.title === "string" ? block.title.trim() : "THANKS FOR WATCHING!";
      const credits = document.createElement("section");
      credits.className = "project-audio-credits";
      const creditsTitle = document.createElement("h5");
      creditsTitle.textContent = typeof block.creditsTitle === "string" ? block.creditsTitle.trim() : "CREDITS";
      const creditList = document.createElement("dl");
      (Array.isArray(block.credits) ? block.credits : []).slice(0, 8).forEach((credit) => {
        const role = document.createElement("dt");
        const name = document.createElement("dd");
        role.textContent = typeof credit?.role === "string" ? credit.role.trim() : "";
        name.textContent = typeof credit?.name === "string" ? credit.name.trim() : "";
        if (role.textContent && name.textContent) creditList.append(role, name);
      });
      credits.append(creditsTitle, creditList);
      const partners = document.createElement("div");
      partners.className = "project-audio-footer-partners";
      (Array.isArray(block.partners) ? block.partners : []).slice(0, 4).forEach((partner, index) => {
        const logoSource = safeProjectAsset(partner?.logo);
        if (!logoSource) return;
        if (partners.querySelector(".project-audio-footer-logo")) {
          const separator = document.createElement("span");
          separator.className = "project-audio-footer-separator";
          separator.setAttribute("aria-hidden", "true");
          partners.append(separator);
        }
        const logo = document.createElement("span");
        logo.className = "project-audio-footer-logo";
        logo.dataset.logoIndex = String(index);
        logo.setAttribute("role", "img");
        logo.setAttribute("aria-label", typeof partner?.name === "string" ? partner.name.trim() : "Project partner");
        logo.style.setProperty("--project-audio-logo", `url("${versionProjectImageAsset(logoSource)}")`);
        partners.append(logo);
      });
      content.append(title, credits, partners);
      figure.append(background, content);
      return [figure];
    }

    if (type === "hongshan-intro") {
      const heading = document.createElement("div");
      heading.className = "project-hongshan-heading";
      const title = document.createElement("h4");
      title.textContent = typeof block.title === "string" ? block.title.trim() : "Hongshan Zoo IP Collaboration";
      heading.append(title);
      const logoSource = safeProjectAsset(block.logo);
      if (logoSource) {
        const logo = projectBlockImage(logoSource, block.logoAlt || "League of Legends and Hongshan Forest Zoo");
        logo.className = "project-hongshan-heading-logo";
        logo.loading = "lazy";
        heading.append(logo);
      }
      const body = document.createElement("p");
      const source = typeof block.body === "string" ? block.body.trim() : "";
      body.innerHTML = projectHighlightedCopy(source, Array.isArray(block.highlights) ? block.highlights : []);
      figure.append(heading, body);
      return [figure];
    }

    if (type === "hongshan-footer") {
      const imageSource = safeProjectAsset(block.image);
      if (!imageSource) return [];
      const image = projectBlockImage(imageSource, block.alt || "Hongshan Zoo collaboration statement");
      image.className = "project-hongshan-footer-image";
      image.loading = "lazy";
      figure.append(image);
      return [figure];
    }

    if (type === "technical-spec") {
      const perspectiveSource = safeProjectAsset(block.perspectiveImage);
      const viewportSource = safeProjectAsset(block.viewportImage);
      const gridSource = safeProjectAsset(block.gridImage);
      const tableSource = safeProjectAsset(block.gridTable);
      const lowerBackgroundSource = safeProjectAsset(block.lowerBackground);
      if (!perspectiveSource || !viewportSource || !gridSource || !tableSource) return [];

      const heading = document.createElement("h4");
      heading.className = "project-technical-heading";
      heading.textContent = typeof block.title === "string" ? block.title.trim() : "Technical Specification & Implementation";

      const perspective = document.createElement("section");
      perspective.className = "project-technical-perspective";
      const perspectiveTitle = document.createElement("h5");
      perspectiveTitle.textContent = typeof block.perspectiveTitle === "string" ? block.perspectiveTitle.trim() : "Perspective & Motion Calibration";
      const perspectiveMedia = projectBlockImage(perspectiveSource, "Isometric and top-down perspective motion calibration");
      perspectiveMedia.loading = "lazy";

      const specification = document.createElement("div");
      specification.className = "project-technical-copy";
      const specificationTitle = document.createElement("h6");
      specificationTitle.textContent = typeof block.specTitle === "string" ? block.specTitle.trim() : "Technical Specification";
      specification.append(specificationTitle);
      (Array.isArray(block.specifications) ? block.specifications : []).slice(0, 4).forEach((item) => {
        const paragraph = document.createElement("p");
        const label = document.createElement("strong");
        label.textContent = typeof item?.label === "string" ? item.label.trim() : "";
        paragraph.append(label, document.createTextNode(label.textContent ? `: ${item?.text || ""}` : String(item?.text || "")));
        specification.append(paragraph);
      });
      const formula = document.createElement("strong");
      formula.className = "project-technical-formula";
      formula.textContent = typeof block.formula === "string" ? block.formula.trim() : "";
      specification.append(formula);
      const notes = document.createElement("div");
      notes.className = "project-technical-formula-notes";
      (Array.isArray(block.formulaNotes) ? block.formulaNotes : []).slice(0, 3).forEach((note) => {
        const line = document.createElement("p");
        line.textContent = typeof note === "string" ? note.trim() : "";
        notes.append(line);
      });
      specification.append(notes);
      perspective.append(perspectiveTitle, perspectiveMedia, specification);

      const lower = document.createElement("section");
      lower.className = "project-technical-lower";
      if (lowerBackgroundSource) lower.style.setProperty("--technical-lower-background", `url(\"${versionProjectImageAsset(lowerBackgroundSource)}\")`);

      const viewport = document.createElement("div");
      viewport.className = "project-technical-panel project-technical-viewport";
      const viewportTitle = document.createElement("h5");
      viewportTitle.textContent = typeof block.viewportTitle === "string" ? block.viewportTitle.trim() : "Viewport Adaptation & Device Mockups";
      const viewportImage = projectBlockImage(viewportSource, "Tablet and smartphone viewport adaptation");
      viewportImage.loading = "lazy";
      viewport.append(viewportTitle, viewportImage);

      const grid = document.createElement("div");
      grid.className = "project-technical-panel project-technical-grid";
      const gridTitle = document.createElement("h5");
      gridTitle.textContent = typeof block.gridTitle === "string" ? block.gridTitle.trim() : "Grid Precision & Unit Specification";
      const gridImage = projectBlockImage(gridSource, "Grid precision and base pixel units");
      gridImage.loading = "lazy";
      const gridCaption = document.createElement("p");
      gridCaption.className = "project-technical-grid-caption";
      gridCaption.textContent = typeof block.gridCaption === "string" ? block.gridCaption.trim() : "";
      const gridTable = projectBlockImage(tableSource, "Hitbox and interaction unit specification table");
      gridTable.className = "project-technical-grid-table";
      gridTable.loading = "lazy";
      grid.append(gridTitle, gridImage, gridCaption, gridTable);

      lower.append(viewport, grid);
      figure.append(heading, perspective, lower);
      return [figure];
    }

    if (type === "video-pair") {
      const items = (Array.isArray(block.items) ? block.items : []).slice(0, 2).flatMap((item, index) => {
        const source = safeProjectAsset(item?.src);
        if (!source) return [];
        const video = document.createElement("video");
        setProjectMediaSource(video, versionProjectImageAsset(source));
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        video.defaultMuted = true;
        video.playsInline = true;
        video.preload = "metadata";
        video.setAttribute("autoplay", "");
        video.setAttribute("loop", "");
        video.setAttribute("muted", "");
        video.setAttribute("playsinline", "");
        video.setAttribute("aria-label", typeof item?.alt === "string" && item.alt.trim()
          ? item.alt.trim()
          : `Still Waters Run Deep process video ${index + 1}`);
        bindProjectManagedVideo(video, { preserveAutoplay: true });
        return [video];
      });
      if (items.length !== 2) return [];
      const pair = document.createElement("div");
      pair.className = "project-video-pair-grid";
      items.forEach(video => {
        const slot = document.createElement('div'); slot.className = 'project-media-slot';
        slot.append(video); pair.append(slot);
      });
      figure.append(pair);
      return [figure];
    }

    if (type === "project-link") {
      let linkUrl;
      try {
        linkUrl = new URL(typeof block.url === "string" ? block.url.trim() : "");
      } catch {
        return [];
      }
      if (linkUrl.protocol !== "https:") return [];

      const link = document.createElement("a");
      link.className = "project-external-credit-link";
      link.href = linkUrl.href;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      const label = document.createElement("span");
      label.textContent = typeof block.kicker === "string" ? block.kicker.trim() : "Collaborator Project Page";
      const title = document.createElement("strong");
      title.textContent = typeof block.title === "string" ? block.title.trim() : "View the complete project";
      const description = document.createElement("p");
      description.textContent = typeof block.description === "string" ? block.description.trim() : "";
      const arrow = document.createElement("b");
      arrow.setAttribute("aria-hidden", "true");
      arrow.textContent = "↗";
      link.append(label, title, description, arrow);

      const credits = Array.isArray(block.credits) ? block.credits.slice(0, 8) : [];
      if (credits.length) {
        const list = document.createElement("ul");
        list.className = "project-external-credit-list";
        credits.forEach((credit) => {
          const item = document.createElement("li");
          const role = document.createElement("span");
          role.textContent = typeof credit?.role === "string" ? credit.role.trim() : "";
          const name = document.createElement("strong");
          name.textContent = typeof credit?.name === "string" ? credit.name.trim() : "";
          item.append(role, name);
          list.append(item);
        });
        figure.append(link, list);
      } else {
        figure.append(link);
      }
      return [figure];
    }

    if (type === "soundcloud-stack") {
      const tracks = (Array.isArray(block.tracks) ? block.tracks : []).slice(0, 16).flatMap((track) => {
        const source = safeSoundCloudPlayer(track?.embed);
        return source ? [{
          source,
          title: typeof track?.title === "string" ? track.title.trim() : "SoundCloud track",
          height: Number.isFinite(Number(track?.height))
            ? Math.min(1200, Math.max(120, Number(track.height)))
            : 166,
        }] : [];
      });
      if (!tracks.length) return [];
      const headingText = typeof block.title === "string" ? block.title.trim() : "";
      const heading = headingText ? document.createElement("h4") : null;
      if (heading) {
        heading.className = "project-soundcloud-stack-heading";
        heading.textContent = headingText;
      }
      const players = document.createElement("div");
      players.className = "project-soundcloud-stack-players";
      tracks.forEach((track) => {
        const item = document.createElement("section");
        item.className = "project-soundcloud-stack-item";
        const title = document.createElement("h5");
        title.textContent = track.title;
        const iframe = document.createElement("iframe");
        setProjectMediaSource(iframe, track.source);
        iframe.title = track.title;
        iframe.width = "100%";
        iframe.height = String(track.height);
        iframe.loading = "lazy";
        iframe.allow = "autoplay; encrypted-media";
        iframe.setAttribute("scrolling", "no");
        iframe.setAttribute("frameborder", "0");
        item.append(title, iframe);
        players.append(item);
        bindProjectEmbedFrame(item);
      });
      figure.append(...(heading ? [heading] : []), players);
      return [figure];
    }

    if (type === "video") {
      const provider = typeof block.provider === "string" ? block.provider.trim().toLowerCase() : "";
      const videoId = typeof block.id === "string" ? block.id.trim() : "";
      const isVimeo = provider === "vimeo" && /^\d+$/.test(videoId);
      const isYoutube = provider === "youtube" && /^[a-zA-Z0-9_-]{11}$/.test(videoId);
      if (!isVimeo && !isYoutube) return [];

      const frame = document.createElement("div");
      frame.className = "project-content-video-frame";
      const videoRatio = typeof block.ratio === "string"
        && /^\d+(?:\.\d+)?\s*\/\s*\d+(?:\.\d+)?$/.test(block.ratio.trim())
        ? block.ratio.trim()
        : "16 / 9";
      frame.style.aspectRatio = videoRatio;
      const iframe = document.createElement("iframe");
      const configuredParams = typeof block.params === "string" && /^[a-zA-Z0-9_=&.-]+$/.test(block.params.trim())
        ? block.params.trim()
        : isVimeo ? "dnt=1&title=0&byline=0&portrait=0" : "rel=0";
      setProjectMediaSource(iframe, isVimeo
        ? `https://player.vimeo.com/video/${videoId}?${configuredParams}`
        : `https://www.youtube-nocookie.com/embed/${videoId}?${configuredParams}`);
      iframe.title = typeof block.title === "string" && block.title.trim()
        ? block.title.trim()
        : "Project video";
      iframe.loading = "lazy";
      iframe.referrerPolicy = "strict-origin-when-cross-origin";
      iframe.allow = "autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share";
      iframe.setAttribute("allowfullscreen", "");
      frame.append(iframe);


      const displayTitle = typeof block.title === "string" && block.title.trim()
        ? block.title.trim()
        : "Project video";
      figure.dataset.videoTitle = displayTitle;

      if (typeof block.decor === "string" && block.decor.trim()) {
        figure.dataset.decor = block.decor.trim();
        if (block.decor.trim() === "sound-stage") {
          const soundLabel = document.createElement("div");
          soundLabel.className = "project-video-sound-label";
          soundLabel.setAttribute("aria-label", "Sound on, designed by me");
          const label = document.createElement("strong");
          label.textContent = "Sound On";
          const note = document.createElement("span");
          note.textContent = "Designed by Me";
          soundLabel.append(label, note);
          figure.append(soundLabel);
        }
        if (block.decor.trim() === "mandrill-stage") {
          const decorImage = document.createElement("img");
          decorImage.className = "project-video-decor project-video-decor-mandrill";
          decorImage.src = versionProjectImageAsset("assets/projects/spirited-expedition/decor-mandrill-png-web.webp");
          decorImage.alt = "";
          decorImage.decoding = "async";
          decorImage.draggable = false;
          figure.append(decorImage);
        }
      }

      const caption = document.createElement("figcaption");
      caption.className = "project-content-video-caption";
      caption.textContent = typeof block.caption === "string" && block.caption.trim()
        ? block.caption.trim()
        : iframe.title;
      figure.append(frame, caption);
      bindProjectEmbedFrame(frame);
      return [figure];
    }

    if (type === "motion-grid") {
      const poster = projectBlockImage(block.image, block.alt || block.title || "UI scene transition overview");
      const clips = Array.isArray(block.clips) ? block.clips.slice(0, 3) : [];
      if (!poster || clips.length !== 3) return [];

      figure.classList.add("project-content-motion-grid");
      const posterPanel = document.createElement("div");
      posterPanel.className = "project-motion-grid-poster";
      posterPanel.append(poster);

      const clipColumn = document.createElement("div");
      clipColumn.className = "project-motion-grid-clips";
      clips.forEach((clip, clipIndex) => {
        const source = safeProjectAsset(clip?.src);
        if (!source) return;
        const item = document.createElement("figure");
        item.className = "project-motion-clip";
        const video = document.createElement("video");
        setProjectMediaSource(video, source);
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        video.defaultMuted = true;
        video.playsInline = true;
        video.preload = "metadata";
        video.setAttribute("autoplay", "");
        video.setAttribute("loop", "");
        video.setAttribute("muted", "");
        video.setAttribute("playsinline", "");
        video.setAttribute("aria-label", clip?.alt || `UI scene transition ${clipIndex + 1}`);
        bindProjectManagedVideo(video);
        const caption = document.createElement("figcaption");
        caption.textContent = typeof clip?.caption === "string" ? clip.caption.trim() : "";
        item.append(video, caption);
        clipColumn.append(item);
      });
      if (clipColumn.children.length !== 3) return [];
      figure.append(posterPanel, clipColumn);
      return [figure];
    }

    if (type === "media-rail") {
      const groups = Array.isArray(block.groups) ? block.groups.slice(0, 8) : [];
      if (!groups.length) return [];
      figure.classList.add("project-content-media-rail");
      const track = document.createElement("div");
      track.className = "project-media-rail-track";

      const createMediaCard = (item, itemIndex, size) => {
        const source = safeProjectAsset(item?.src);
        const mediaType = item?.media === "image" ? "image" : "video";
        if (!source) return null;
        const card = document.createElement("figure");
        card.className = "project-media-rail-card";
        card.dataset.size = size;
        let media;
        if (mediaType === "image") {
          media = projectBlockImage(source, item?.alt || `UX showcase image ${itemIndex + 1}`);
          if (media) media.loading = "lazy";
        } else {
          media = document.createElement("video");
          setProjectMediaSource(media, source);
          media.autoplay = true;
          media.loop = true;
          media.muted = true;
          media.defaultMuted = true;
          media.playsInline = true;
          media.preload = "metadata";
          media.setAttribute("autoplay", "");
          media.setAttribute("loop", "");
          media.setAttribute("muted", "");
          media.setAttribute("playsinline", "");
          media.setAttribute("aria-label", item?.alt || `UX showcase video ${itemIndex + 1}`);
          bindProjectManagedVideo(media);
        }
        if (!media) return null;
        // This authored landscape frame must win over metadata's raw width
        // and height hints; the same frame also applies to the loop copies.
        if (projectSheet.dataset.projectId === 'spirited-expedition') {
          media.style.aspectRatio = size === 'large' ? '1116 / 515' : '821 / 378';
        }
        const caption = document.createElement("figcaption");
        caption.textContent = typeof item?.caption === "string" ? item.caption.trim() : "";
        card.append(media, caption);
        return card;
      };

      let mediaIndex = 0;
      groups.forEach((group, groupIndex) => {
        const feature = createMediaCard(group?.feature, mediaIndex, "large");
        mediaIndex += 1;
        if (!feature) return;
        const panel = document.createElement("section");
        panel.className = "project-media-group";
        panel.setAttribute("aria-label", `UX animation group ${groupIndex + 1}`);
        const secondaryGrid = document.createElement("div");
        secondaryGrid.className = "project-media-group-grid";
        const secondaryItems = Array.isArray(group?.items) ? group.items.slice(0, 4) : [];
        secondaryItems.forEach((item) => {
          const card = createMediaCard(item, mediaIndex, "small");
          mediaIndex += 1;
          if (card) secondaryGrid.append(card);
        });
        panel.dataset.secondaryCount = String(secondaryGrid.children.length);
        if (group?.itemsLayout === "column") panel.dataset.secondaryLayout = "column";
        panel.append(feature);
        if (secondaryGrid.children.length) panel.append(secondaryGrid);
        track.append(panel);
      });
      if (!track.children.length) return [];
      figure.append(track);
      setupProjectMediaRail(track);
      return [figure];
    }

    if (type === "text") {
      figure.append(projectBlockCopy(block));
      return [figure];
    }

    if (type === "duo") {
      const sources = Array.isArray(block.images) ? block.images.slice(0, 2) : [];
      const images = sources.flatMap((source, imageIndex) => {
        const image = projectBlockImage(source, block.alt || `${block.title || "Project detail"} ${imageIndex + 1}`);
        return image ? [image] : [];
      });
      if (images.length < 2) return [];
      const media = document.createElement("div");
      media.className = "project-content-duo-media";
      media.append(...images);
      const copy = projectBlockCopy(block);
      if (block.copyPosition === "before") figure.append(copy, media);
      else figure.append(media, copy);
      return [figure];
    }

    if (type === "split") {
      const image = projectBlockImage(block.image, block.alt || block.title || "Project detail");
      if (!image) return [];
      const copy = projectBlockCopy(block);
      if (block.copyPosition === "before") figure.append(copy, image);
      else figure.append(image, copy);
      return [figure];
    }

    const image = projectBlockImage(block.image, block.alt || block.title || "Project detail");
    if (!image) return [];
    const copy = projectBlockCopy(block);
    if (block.copyPosition === "before") figure.append(copy, image);
    else figure.append(image, copy);
    return [figure];
  });
  const grouped = [...rendered];
  const plotStart = grouped.findIndex((item) => item?.dataset?.variant === "plot-start");
  const plotEnd = grouped.findIndex((item) => item?.dataset?.variant === "plot-end");
  if (plotStart >= 0 && plotEnd > plotStart) {
    const plotField = document.createElement("section");
    plotField.className = "project-utopia-plot-field";
    plotField.append(...grouped.splice(plotStart, plotEnd - plotStart));
    grouped.splice(plotStart, 0, plotField);
  }
  container.replaceChildren(...grouped);
  container.hidden = grouped.length === 0;
  container.querySelectorAll(".project-utopia-story-rail").forEach(setupUtopiaImageRail);
}

function setupUtopiaStorySphere(root, sources) {
  const stage = root?.querySelector(".project-utopia-sphere-stage");
  const preview = root?.querySelector(".project-utopia-sphere-preview");
  const previewImage = root?.querySelector(".project-utopia-sphere-preview-image");
  const connector = root?.querySelector(".project-utopia-sphere-connector");
  const connectorPath = connector?.querySelector("path");
  const nodes = [...(stage?.querySelectorAll(".project-utopia-sphere-node") || [])];
  if (!stage || !preview || !previewImage || !connector || !connectorPath || !nodes.length) return;

  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const points = nodes.map((node, index) => {
    const y = nodes.length === 1 ? 0 : 1 - (index / (nodes.length - 1)) * 2;
    const radius = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = goldenAngle * index;
    return {
      node,
      x: Math.cos(theta) * radius,
      y,
      z: Math.sin(theta) * radius,
    };
  });

  let yaw = -0.32;
  let pitch = -0.08;
  let dragging = false;
  let activeNode = nodes[0];
  let hoverNode = null;
  let pointerX = 0;
  let pointerY = 0;
  let expansion = 0;

  const selectNode = (node, showConnector = true) => {
    if (!node) return;
    activeNode?.classList.remove("is-selected");
    activeNode = node;
    activeNode.classList.add("is-selected");
    const index = Number(activeNode.dataset.index) || 0;
    previewImage.src = versionProjectImageAsset(sources[index] || sources[0]);
    previewImage.alt = `Selected UTOPIA 2419 narrative scene ${index + 1}`;
    connector.classList.toggle("is-visible", showConnector);
    preview.classList.toggle("is-visible", showConnector);
  };

  const updateConnector = () => {
    if (!hoverNode || !connector.classList.contains("is-visible")) return;
    const rootRect = root.getBoundingClientRect();
    const nodeRect = hoverNode.getBoundingClientRect();
    const previewRect = preview.getBoundingClientRect();
    const x1 = nodeRect.left + nodeRect.width * 0.5 - rootRect.left;
    const y1 = nodeRect.top + nodeRect.height * 0.5 - rootRect.top;
    const x2 = previewRect.left - rootRect.left;
    const y2 = previewRect.top + previewRect.height * 0.5 - rootRect.top;
    const elbowX = x1 + (x2 - x1) * 0.48;
    connector.setAttribute("viewBox", `0 0 ${Math.max(1, rootRect.width)} ${Math.max(1, rootRect.height)}`);
    connectorPath.setAttribute("d", `M ${x1} ${y1} H ${elbowX} V ${y2} H ${x2}`);
  };

  nodes.forEach((node) => {
    node.addEventListener("pointerenter", () => {
      if (dragging) return;
      hoverNode = node;
      selectNode(node, true);
    });
    node.addEventListener("pointerleave", () => {
      if (hoverNode !== node) return;
      hoverNode = null;
      connector.classList.remove("is-visible");
      preview.classList.remove("is-visible");
    });
    node.addEventListener("focus", () => {
      hoverNode = node;
      selectNode(node, true);
    });
    node.addEventListener("blur", () => {
      if (hoverNode === node) hoverNode = null;
      connector.classList.remove("is-visible");
      preview.classList.remove("is-visible");
    });
    node.addEventListener("click", () => selectNode(node, true));
  });

  stage.addEventListener("pointerdown", (event) => {
    dragging = true;
    pointerX = event.clientX;
    pointerY = event.clientY;
    hoverNode = null;
    connector.classList.remove("is-visible");
    preview.classList.remove("is-visible");
    stage.classList.add("is-dragging");
    stage.setPointerCapture(event.pointerId);
  });
  stage.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    yaw += (event.clientX - pointerX) * 0.007;
    pitch = clamp(pitch - (event.clientY - pointerY) * 0.005, -1.05, 1.05);
    pointerX = event.clientX;
    pointerY = event.clientY;
  });
  const finishDrag = (event) => {
    if (!dragging) return;
    dragging = false;
    stage.classList.remove("is-dragging");
    if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
  };
  stage.addEventListener("pointerup", finishDrag);
  stage.addEventListener("pointercancel", finishDrag);

  selectNode(activeNode, false);
  const render = (time, delta) => {
    if (!dragging && !hoverNode && !reduceMotionQuery.matches) yaw += delta * 0.000065;
    const expansionTarget = stage.matches(":hover") || dragging ? 1 : 0;
    expansion += (expansionTarget - expansion) * Math.min(1, delta * 0.012);

    const width = stage.clientWidth;
    const height = stage.clientHeight;
    const orbit = Math.min(width, height) * 0.365 * (1 + expansion * 0.14);
    const sinYaw = Math.sin(yaw);
    const cosYaw = Math.cos(yaw);
    const sinPitch = Math.sin(pitch);
    const cosPitch = Math.cos(pitch);

    points.forEach(({ node, x, y, z }) => {
      const rotatedX = x * cosYaw - z * sinYaw;
      const yawZ = x * sinYaw + z * cosYaw;
      const rotatedY = y * cosPitch - yawZ * sinPitch;
      const rotatedZ = y * sinPitch + yawZ * cosPitch;
      const perspective = 1 / (1.28 - rotatedZ * 0.33);
      const depth = (rotatedZ + 1) * 0.5;
      const nodeScale = 0.28 + depth * depth * 1.12;
      node.style.transform = `translate3d(${rotatedX * orbit * perspective}px, ${rotatedY * orbit * perspective}px, 0) translate(-50%, -50%) scale(${nodeScale})`;
      node.style.zIndex = String(Math.round((rotatedZ + 1) * 100));
      node.style.opacity = String(0.12 + depth * 0.88);
      node.style.pointerEvents = rotatedZ < -0.42 ? "none" : "auto";
    });
    updateConnector();
  };
  window.projectRuntime.animate(root, render);
}

let projectNibiruRevealObserver = null;

/* Entrance motion is deliberately opt-in. A case study may select individual
   media objects, but never inherits animation for its copy, embedded players,
   audio controls or authored background fields. */
const projectScrollRevealSelectors = new Map([
  ["the-red-dawn", [
    ".project-content-block:not(.project-content-audio-player-grid):not(.project-content-audio-footer):not(.project-content-nibiru-system-grid):not([data-variant='nibiru-thanks']) img",
  ]],
  ["poka-project-p", [
    ".project-poka-collage-card",
    ".project-poka-ui-card",
  ]],
  ["swrd", [
    ".project-content-video-pair",
  ]],
  ["external-blood-vessel", [
    ".project-content-midi-outcome-pair img",
  ]],
  ["olive-town", [
    ".project-content-olive-render-gallery img",
  ]],
  ["florahaven", [
    ".project-flora-insights article",
    ".project-content-flora-concept-pair img",
    ".project-content-flora-interaction-gallery img",
  ]],
  ["spirited-expedition", [
    ".project-content-ui-phone-demo .project-ui-phone-device",
    ".project-content-ui-phone-fan .project-ui-phone-device",
    ".project-content-ui-phone-pair .project-ui-phone-device",
  ]],
]);

function setupNibiruScrollReveal() {
  projectNibiruRevealObserver?.disconnect();
  projectNibiruRevealObserver = null;
  if (!projectSheet) return;

  projectSheet.querySelectorAll(".project-scroll-reveal, .project-media-reveal").forEach((item) => {
    item.classList.remove("project-scroll-reveal", "project-media-reveal", "is-revealed");
    item.style.removeProperty("--project-reveal-delay");
  });

  const selectors = projectScrollRevealSelectors.get(projectSheet.dataset.projectId);
  if (!selectors?.length) return;
  const items = [...new Set(selectors.flatMap((selector) => [
    ...projectSheet.querySelectorAll(selector),
  ]))];
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    items.forEach((item) => item.classList.add("is-revealed"));
    return;
  }

  items.forEach((item, index) => {
    item.classList.add("project-media-reveal");
    item.classList.remove("is-revealed");
    item.style.setProperty("--project-reveal-delay", `${(index % 4) * 55}ms`);
  });
  projectNibiruRevealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-revealed");
      projectNibiruRevealObserver?.unobserve(entry.target);
    });
  }, {
    root: projectScroller,
    rootMargin: "0px 0px -7% 0px",
    threshold: 0.08,
  });
  items.forEach((item) => projectNibiruRevealObserver?.observe(item));
}

function applyProjectRights(rights) {
  if (!projectDetailRights || !projectDetailRightsLogo || !projectDetailRightsText) return;

  const logo = safeProjectAsset(rights?.logo);
  const text = typeof rights?.text === "string" ? rights.text.trim() : "";
  if (!logo || !text) {
    projectDetailRights.hidden = true;
    projectDetailRightsLogo.src = "";
    projectDetailRightsLogo.alt = "";
    projectDetailRightsText.textContent = "";
    return;
  }

  projectDetailRightsLogo.src = versionProjectImageAsset(logo);
  projectDetailRightsLogo.alt = typeof rights.logoAlt === "string" ? rights.logoAlt.trim() : "";
  projectDetailRightsText.textContent = text;
  projectDetailRights.hidden = false;
}

function prepareUtopiaGrain() {
  if (projectSheet.style.getPropertyValue("--utopia-grain")) return;
  // Generated tile + stepped offsets, inspired by sarathsaleem/grained.
  // Sparse transparent pixels retain a genuinely black background.
  const tile = document.createElement("canvas");
  tile.width = tile.height = 192;
  const context = tile.getContext("2d");
  const pixels = context.createImageData(192, 192);
  for (let i = 0; i < pixels.data.length; i += 4) {
    if (Math.random() > 0.12) continue;
    pixels.data[i] = 255;
    pixels.data[i + 1] = 240;
    pixels.data[i + 2] = 210;
    pixels.data[i + 3] = 10 + Math.floor(Math.random() * 32);
  }
  context.putImageData(pixels, 0, 0);
  projectSheet.style.setProperty("--utopia-grain", `url("${tile.toDataURL()}")`);
}

function applyProjectData(card, projectCopy = projectFallbackCopy) {
  if (!card) return Promise.resolve();

  const projectId = card.dataset.projectId;
  if (activeProjectId !== projectId) return Promise.resolve();
  // Reused cover/fact nodes must not carry the previous project's attribute copy.
  translatePortfolioTree(projectSheet, "en");
  localizedAttributeOriginals = new WeakMap();
  projectSheet.dataset.projectId = projectId;
  projectSheet.toggleAttribute('data-data-unavailable', Boolean(projectCopy.dataUnavailable));
  // Reset the opt-out every time the shared canvas is reused.

  if (projectId === "utopia-2419") prepareUtopiaGrain();

  const localizedTitle = localizedProjectValue(projectCopy, "title", "", "en");
  const projectTitle = localizedTitle
    ? localizedTitle
    : card.querySelector(".case-info h3")?.textContent?.trim() || "Selected Project";
  const explicitProjectSubtitle = localizedProjectValue(projectCopy, "subtitle", "", "en");
  const cardProjectCategory = card.querySelector(".case-info > p")?.textContent
    ?.replace(/^\s*\d+\s*\/\s*/, "")
    .trim() || "";
  const projectSubtitle = explicitProjectSubtitle || cardProjectCategory || "PROJECT CASE STUDY";
  const projectBackground = typeof projectCopy.backgroundColor === "string"
    && /^#[0-9a-f]{6}$/i.test(projectCopy.backgroundColor.trim())
    ? projectCopy.backgroundColor.trim()
    : "#f5f4f1";
  projectDetailTitle.textContent = projectTitle;
  projectDetailTitle.dataset.text = projectTitle;
  if (projectCoverOverlayTitle) projectCoverOverlayTitle.textContent = projectTitle;
  if (projectDetailSubtitle) {
    projectDetailSubtitle.textContent = projectSubtitle;
    projectDetailSubtitle.dataset.text = projectSubtitle;
    projectDetailSubtitle.hidden = !projectSubtitle;
  }
  if (projectCoverOverlaySubtitle) {
    projectCoverOverlaySubtitle.textContent = projectSubtitle;
    projectCoverOverlaySubtitle.hidden = !projectSubtitle;
  }
  projectSheet?.style.setProperty("--project-page-bg", projectBackground);

  projectDetailIntroduction.textContent = localizedProjectValue(projectCopy, "body", "", "en")
    || localizedProjectValue(projectCopy, "summary", "", "en")
    || projectFallbackCopy.body;
  const coverReady = renderProjectCover(projectCopy.cover, activeProjectFallbackCover);
  queueProjectParallax();
  const projectYear = projectCopy.year || card.querySelector(".case-details time")?.textContent?.trim() || projectFallbackCopy.year;
  const releaseDate = typeof projectCopy.releaseDate === "string" ? projectCopy.releaseDate.trim() : "";
  projectDetailYear.textContent = projectYear;
  projectDetailReleaseDate.textContent = releaseDate;
  projectDetailReleaseFact.hidden = !releaseDate;
  if (projectDetailYearLabel) projectDetailYearLabel.textContent = projectCopy.yearLabel || "PROJECT YEAR";
  if (projectDetailCompanyLabel) projectDetailCompanyLabel.textContent = projectCopy.companyLabel || "PROJECT CONTEXT";

  const game = projectCopy.game && typeof projectCopy.game === "object" ? projectCopy.game : null;
  const gameLogo = safeProjectAsset(game?.logo);
  const gameName = typeof game?.name === "string" ? game.name.trim() : "";
  const mergeGameIntoYear = Boolean(projectCopy.mergeGameIntoYear && game);
  if (projectDetailGameLockup && projectDetailGameFact) {
    projectDetailGameFact.append(projectDetailGameLockup);
  }
  if (projectDetailGameLockup && projectDetailYearFact && mergeGameIntoYear) {
    projectDetailYearFact.insertBefore(projectDetailGameLockup, projectDetailYear);
  }
  projectDetailYearFact?.classList.toggle("has-game-lockup", mergeGameIntoYear);
  if (projectDetailGameFact) projectDetailGameFact.hidden = !game || mergeGameIntoYear;
  if (projectDetailGameLabel) projectDetailGameLabel.textContent = game?.label || "MAIN GAME";
  if (projectDetailGameLogo) {
    projectDetailGameLogo.src = gameLogo ? versionProjectImageAsset(gameLogo) : "";
    projectDetailGameLogo.alt = gameName;
    projectDetailGameLogo.hidden = !gameLogo;
  }
  if (projectDetailGameName) {
    projectDetailGameName.textContent = gameName;
    projectDetailGameName.hidden = !gameName;
  }
  const factCount = 3 + (releaseDate ? 1 : 0) + (game && !mergeGameIntoYear ? 1 : 0);
  projectDetailFacts.dataset.factCount = String(factCount);

  const roles = Array.isArray(projectCopy.roles) && projectCopy.roles.length
    ? projectCopy.roles
    : typeof projectCopy.role === "string"
      ? projectCopy.role.split("/")
      : projectFallbackCopy.roles;
  replaceProjectTextList(projectDetailRoles, roles.slice(0, 6));
  renderProjectPartners(projectCopy.partners, projectCopy.company || projectFallbackCopy.company, projectCopy.partnerLabel, projectCopy.id);

  const tags = Array.isArray(projectCopy.tags) && projectCopy.tags.length
    ? projectCopy.tags.slice(0, 6)
    : projectFallbackCopy.tags;
  projectDetailTags.replaceChildren(...tags.map((tag) => {
    const item = document.createElement("li");
    item.textContent = projectTagLabel(tag);
    return item;
  }));
  applyProjectRights(projectCopy.rights);

  const sections = Array.isArray(projectCopy.sections) ? projectCopy.sections : [];
  const requestedSectionCount = Number(projectCopy.sectionCount);
  const visibleSectionCount = Number.isFinite(requestedSectionCount)
    ? clamp(Math.round(requestedSectionCount), 1, projectSectionTitles.length)
    : projectSectionTitles.length;
  projectSectionTitles.forEach((titleNode, sectionIndex) => {
    titleNode.classList.remove("is-stuck");
    titleNode.style.removeProperty("--chapter-title-size");
    titleNode.style.removeProperty("--chapter-title-padding-y");
    titleNode.style.removeProperty("--chapter-sticky-top");
    titleNode.style.removeProperty("--chapter-flow-height");
    titleNode.style.removeProperty("--chapter-visual-height");
    titleNode.style.removeProperty("z-index");
    const sectionArticle = titleNode.nextElementSibling?.classList.contains("project-chapter")
      ? titleNode.nextElementSibling
      : null;
    const sectionHidden = sectionIndex >= visibleSectionCount;
    titleNode.hidden = sectionHidden;
    if (sectionArticle) sectionArticle.hidden = sectionHidden;
    if (sectionHidden) return;
    const sectionCopy = sections[sectionIndex] || projectFallbackCopy.sections[sectionIndex];
    const titleSurface = titleNode.querySelector(".project-chapter-title-surface");
    const titleImageSource = safeProjectAsset(sectionCopy.titleImage);
    if (titleSurface) {
      if (titleImageSource) {
        const titleImage = document.createElement("img");
        titleImage.src = versionProjectImageAsset(titleImageSource);
        titleImage.alt = sectionCopy.title;
        titleImage.decoding = "async";
        titleImage.draggable = false;
        const localizedTitle = document.createElement("span");
        localizedTitle.className = "project-localized-art-title";
        localizedTitle.textContent = sectionCopy.title;
        titleSurface.replaceChildren(titleImage, localizedTitle);
      } else {
        titleSurface.textContent = sectionCopy.title;
      }
    }
    titleNode.classList.toggle("has-image-title", Boolean(titleImageSource));

    const sectionBody = typeof sectionCopy.body === "string" ? sectionCopy.body.trim() : "";
    const sectionCaption = typeof sectionCopy.caption === "string" ? sectionCopy.caption.trim() : "";
    const sectionHeader = projectSectionBodies[sectionIndex]?.closest("header");
    const defaultFigure = projectGalleryImages[sectionIndex]?.closest("figure");
    projectSectionBodies[sectionIndex].textContent = sectionBody;
    projectSectionCaptions[sectionIndex].textContent = sectionCaption;
    if (sectionHeader) sectionHeader.hidden = !sectionBody;
    if (defaultFigure) defaultFigure.hidden = Boolean(sectionCopy.hideDefaultMedia);
    renderProjectBlocks(projectSectionBlocks[sectionIndex], sectionCopy.blocks);
  });
  applyProjectVideo(projectCopy.video);

  if (Array.isArray(projectCopy.gallery) && projectCopy.gallery.length) {
    projectGalleryImages.forEach((image, imageIndex) => {
      const source = safeProjectAsset(projectCopy.gallery[imageIndex % projectCopy.gallery.length]);
      if (source) image.style.backgroundImage = `url("${versionProjectImageAsset(source)}")`;
    });
  }
  translatePortfolioTree(projectSheet, currentLanguage);
  reserveProjectImageGeometry();
  return coverReady;
}

function prepareProjectEmbedViewports() {
  // A foreign document needs its own unzoomed design viewport. Keep the
  // authored outer box, cancel inherited CSS zoom on the iframe only, then
  // transform that viewport once by the SAME canvas scale. No device sniffing,
  // polling, provider SDK, contentWindow DOM access or duplicate live players.
  const plans = [...projectSheet.querySelectorAll('iframe')].flatMap(frame => {
    bindProjectEmbedFrame(frame);
    if (frame.dataset.embedViewport || !frame.offsetWidth || !frame.offsetHeight) return [];
    const css = getComputedStyle(frame);
    return [{ frame, radius:css.borderRadius, width:parseFloat(css.width) || frame.offsetWidth,
      height:parseFloat(css.height) || frame.offsetHeight,
      absolute:css.position === 'absolute', top:css.top, left:css.left,
      right:css.right, bottom:css.bottom, margin:css.margin }];
  });
  plans.forEach(({frame,radius,width,height,absolute,top,left,right,bottom,margin}) => {
    const viewport = document.createElement('div');
    viewport.className = 'project-embed-viewport';
    Object.assign(viewport.style, { width:`${width}px`, height:`${height}px`, margin,
      borderRadius:radius,
      position:absolute ? 'absolute' : 'relative' });
    if (absolute) Object.assign(viewport.style, { top,left,right,bottom });
    frame.before(viewport);
    viewport.append(frame);
    bindProjectEmbedFrame(viewport);
    frame.dataset.embedViewport = 'true';
    Object.assign(frame.style, { position:'absolute', top:'0px', left:'0px',
      right:'auto', bottom:'auto', width:`${width}px`, height:`${height}px`,
      maxWidth:'none', maxHeight:'none', margin:'0px',
      zoom:'var(--project-embed-inverse-scale,1)',
      transform:'scale(var(--project-canvas-scale,1))', transformOrigin:'0 0' });
  });
}

function reserveProjectImageGeometry() {
  const plans = [...projectSheet.querySelectorAll('img[src]')].flatMap(image => {
    const path = new URL(image.src, location.href).pathname;
    const source = path.slice(path.indexOf('assets/'));
    const dimensions = window.portfolioImageDimensions?.[source];
    return dimensions ? [{image,dimensions,auto:getComputedStyle(image).aspectRatio === 'auto'}] : [];
  });
  // Read styles as one batch, then write hints as one batch.
  plans.forEach(({image,dimensions,auto}) => {
    if (!image.hasAttribute('width') || !image.hasAttribute('height')) [image.width, image.height] = dimensions;
    // An explicit CSS aspect-ratio:auto overrides the HTML ratio hint. Keep
    // native-ratio illustrations sized even before their lazy request starts.
    if (auto) image.style.aspectRatio = `${dimensions[0]} / ${dimensions[1]}`;
  });
  projectSheet.querySelectorAll('img[src]').forEach(prepareProjectImagePlaceholder);
}

async function openProject(card, options = {}) {
  if (!projectDetail || !projectSheet || !card) return;

  const projectId = card.dataset.projectId;
  card.removeAttribute('data-cover-pending');
  const openSequence = ++projectOpenSequence;
  beginProjectPreparation(card, openSequence, options.pushHistory !== false || !projectDetail.classList.contains('is-open'));
  let projectCopy;
  try {
    projectCopy = await loadProjectData(projectId);
  } catch {
    const heading = card.querySelector('h3');
    const title = workCardTitles.get(card) || heading?.textContent || 'Selected Project';
    const preview = getComputedStyle(card.querySelector('.case-image')).backgroundImage;
    const source = preview.match(/url\(["']?([^"')]+)["']?\)/)?.[1];
    const path = source ? new URL(source, location.href).pathname : '';
    projectCopy = { dataUnavailable:true, title,
      body:'Some project details are temporarily unavailable. You can return and open this project again.',
      backgroundColor:card.dataset.detailBackground,
      cover:{ratio:card.dataset.detailRatio,background:path.slice(path.indexOf('assets/'))},
      sectionCount:1,sections:[{title:'',body:'',caption:'',hideDefaultMedia:true,blocks:[]}] };
  }
  if (openSequence !== projectOpenSequence) return;
  window.projectRuntime.begin('preparing');
  await window.projectBackground?.prepare(projectId, activeProjectId, options.pushHistory !== false, reduceMotionQuery.matches);
  if (openSequence !== projectOpenSequence) return;
  projectParentBackPending = false;
  window.projectRuntime.reset();
  releaseProjectContent();
  const parentProjectId = projectDetail.classList.contains("is-open")
    && activeProjectId
    && activeProjectId !== projectId
    ? activeProjectId
    : null;
  const parentProjectScrollTop = parentProjectId ? projectScroller.scrollTop : 0;
  const requestedProjectScrollTop = Number.isFinite(options.projectScrollTop)
    ? Math.max(0, options.projectScrollTop)
    : 0;
  updateProjectDetailCanvas(projectId);

  window.clearTimeout(projectVideoResetTimer);
  projectVideoResetTimer = 0;
  projectDetail.classList.remove("is-closing");

  const shouldPushHistory = options.pushHistory !== false;
  const entryScrollY = Number.isFinite(options.scrollY) ? options.scrollY : window.scrollY;
  const title = card.querySelector(".case-info h3")?.textContent?.trim() || "Selected Project";
  const coverImage = card.querySelector(".case-image");
  const cover = coverImage ? window.getComputedStyle(coverImage).backgroundImage : "none";
  const projectIndex = Math.max(0, detailProjectCards.indexOf(card));
  const galleryCovers = projectGalleryImages.map((_, imageIndex) => {
    const galleryCard = detailProjectCards[(projectIndex + imageIndex) % detailProjectCards.length];
    const galleryImage = galleryCard?.querySelector(".case-image");
    return galleryImage ? window.getComputedStyle(galleryImage).backgroundImage : cover;
  });

  projectDetailTitle.textContent = title;
  projectDetailTitle.dataset.text = title;
  if (projectCoverOverlayTitle) projectCoverOverlayTitle.textContent = title;
  if (projectDetailSubtitle) {
    projectDetailSubtitle.textContent = "";
    projectDetailSubtitle.hidden = true;
  }
  if (projectCoverOverlaySubtitle) {
    projectCoverOverlaySubtitle.textContent = "";
    projectCoverOverlaySubtitle.hidden = true;
  }
  activeProjectId = projectId;
  projectTopPull = 0;
  projectTopPullTarget = 0;
  projectTopPullVelocity = 0;
  cancelAnimationFrame(projectTopArrivalFrame);
  projectTopArrivalFrame = 0;
  projectSheet.dataset.projectId = projectId;
  projectSheet.style.setProperty("--project-page-bg", card.dataset.detailBackground || "#f5f4f1");
  const placeholderRatio = card.dataset.detailRatio || '2 / 1';
  projectDetailHero.style.aspectRatio = placeholderRatio;
  const [placeholderWidth, placeholderHeight] = placeholderRatio.split('/').map(Number);
  projectHeroAspectRatio = placeholderWidth / placeholderHeight;
  updateProjectDetailCanvas(projectId);
  activeProjectFallbackCover = cover;
  projectDetailCover?.replaceChildren();
  projectCoverLayers = [];
  projectDissolveLayers = [];
  if (projectDetailCover) {
    projectDetailCover.classList.add("is-legacy");
    projectDetailCover.style.backgroundImage = cover;
    projectDetailCover.style.backgroundPosition = "center";
    projectDetailCover.style.backgroundSize = "cover";
  }
  applyProjectRights(null);
  projectReturnScrollY = entryScrollY;
  projectReturnFocus = card;
  if (shouldPushHistory) {
    if (parentProjectId) {
      window.history.replaceState(
        {
          ...window.history.state,
          portfolioProject: parentProjectId,
          portfolioProjectScrollTop: parentProjectScrollTop,
          portfolioScrollY: projectReturnScrollY,
        },
        "",
        projectUrl(parentProjectId),
      );
    } else {
      window.history.replaceState(
        {
          ...window.history.state,
          portfolioIndex: true,
          portfolioScrollY: entryScrollY,
        },
        "",
        window.location.href,
      );
    }
    window.history.pushState(
      {
        portfolioProject: projectId,
        portfolioParentProject: parentProjectId,
        portfolioScrollY: parentProjectId ? projectReturnScrollY : entryScrollY,
        portfolioProjectScrollTop: requestedProjectScrollTop,
      },
      "",
      projectUrl(projectId),
    );
  }

  // Construct once, below the viewport. Network images never gate entrance.
  // There is no visible provisional title/layout that will later be replaced.
  applyProjectData(card, projectCopy);
  // Settle the actual faces before measuring the title and facts. Most are
  // already loaded by home; Spirited retains its authored project face.
  if (document.fonts) {
    const family = projectId === 'spirited-expedition' ? 'DM UI CN' : currentLanguage === 'zh' ? 'ZaoZiGongFang YuanHei' : 'Monument Extended';
    const fontReady = await document.fonts.load(`${family === 'Monument Extended' ? 800 : 400} 44px "${family}"`).then(faces => faces.length > 0, () => false);
    if (openSequence !== projectOpenSequence) return;
    projectSheet.toggleAttribute('data-font-fallback', !fontReady);
  }
  if (openSequence !== projectOpenSequence || activeProjectId !== projectId) return;

  projectGalleryImages.forEach((image, imageIndex) => {
    if (!image.style.backgroundImage || image.style.backgroundImage === "none") {
      image.style.backgroundImage = galleryCovers[imageIndex] || cover;
    }
  });
  projectScroller.scrollTop = requestedProjectScrollTop;
  updateProjectParallax();

  // Prioritize the opening images without gating either response or scrolling.
  const scrollerTop = projectScroller.getBoundingClientRect().top;
  const firstPaintImages = [...projectSheet.querySelectorAll('img')].filter(image => {
    const rect = image.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && rect.bottom >= scrollerTop && rect.top < scrollerTop + window.innerHeight + 180;
  });
  firstPaintImages.forEach(image => {
    image.loading = 'eager';
    image.decode?.().catch(() => {});
  });
  if (openSequence !== projectOpenSequence || activeProjectId !== projectId) return;

  setProjectLoadingState(false);
  const contentReady = () => {
    if (openSequence !== projectOpenSequence || activeProjectId !== projectId) return;
    endProjectPreparation(openSequence);
    if (projectDetailCover.dataset.coverDecoded === 'true') revealProjectCover();
    projectDetail.setAttribute('aria-hidden','false');
    document.body.classList.add('project-open');
    projectDetail.classList.add('is-open');
    const restored = window.projectBackground?.ready();
    window.projectRuntime.enter(restored, () => { revealProjectCover(); setupNibiruScrollReveal(); });
    projectSheet.focus({ preventScroll: true });
    updateProjectParallax();
  };
  // Scoped enhancers can compose a second layout on their next frame. Finish
  // that chain and reserve their images before the cut observer's last pass.
  requestAnimationFrame(() => requestAnimationFrame(() => {
    reserveProjectImageGeometry();
    prepareProjectEmbedViewports();
    requestAnimationFrame(() => requestAnimationFrame(contentReady));
  }));
}

function projectChapterFlowOffset(target) {
  if (!projectChapters || !target) return 0;

  let flowOffset = 0;
  for (const child of projectChapters.children) {
    if (child === target) return flowOffset;
    const childStyle = window.getComputedStyle(child);
    const marginTop = Number.parseFloat(childStyle.marginTop) || 0;
    const marginBottom = Number.parseFloat(childStyle.marginBottom) || 0;
    flowOffset += child.offsetHeight + marginTop + marginBottom;
  }

  return flowOffset;
}

function scrollProjectToChapter(chapterIndex) {
  if (!projectSheet || !projectChapters || !projectSectionTitles[chapterIndex]) return;
  const target = projectSectionTitles[chapterIndex];
  const layoutWidth = projectLayoutViewportWidth();
  const compactFont = clamp(layoutWidth * 0.016, 18, 28);
  const compactPadding = 10;
  const stackRevealRatio = 0.68;
  const stickyTop = chapterIndex
    * (compactFont * 0.92 + compactPadding * 2 + 2)
    * stackRevealRatio;
  const targetTop = projectChapters.offsetTop
    + projectChapterFlowOffset(target)
    - stickyTop;
  projectScroller.scrollTo({
    top: Math.max(0, targetTop),
    behavior: reduceMotionQuery.matches ? "auto" : "smooth",
  });
}

function updateProjectStickyChapters() {
  /* Chapter titles intentionally stay in normal document flow. */
}

function updateProjectParallax() {
  if (!projectSheet || !projectDetailCover) return;

  /* Read geometry before writing any animation styles. Keeping the two phases
     separate avoids a forced layout on every scroll / pull-back frame. */
  const rawScrollTop = projectScroller.scrollTop;
  const canvasScale = Number.parseFloat(projectSheet.style.getPropertyValue('--project-canvas-scale')) || 1;
  const canvasViewportHeight = window.innerHeight / canvasScale;
  const scrollTop = Math.max(0, rawScrollTop) / canvasScale;
  const overscroll = Math.max(0, -rawScrollTop) / canvasScale;
  const pullDistance = reduceMotionQuery.matches ? 0 : Math.max(overscroll, projectTopPull / canvasScale);
  const heroWidth = projectDetailHero.clientWidth;
  const coverTitleHeight = projectCoverOverlayTitle?.closest(".project-cover-title-overlay")?.offsetHeight || 0;
  const layerHeights = new Map(projectDissolveLayers.map((layer) => [layer, layer.offsetHeight]));
  const finaleStage = projectSheet.querySelector(".project-ui-finale-stage");
  const finaleBackground = finaleStage?.querySelector(".project-ui-finale-background");
  const sheetViewportRect = projectSheet.getBoundingClientRect();
  const finaleStageRect = finaleStage?.getBoundingClientRect();
  const finaleTravel = finaleStageRect
    ? Math.max(1, sheetViewportRect.height * 1.1)
    : 1;
  const finaleLead = finaleStageRect
    ? sheetViewportRect.height * 0.5
    : 0;
  const finaleProgress = finaleStageRect
    ? clamp((sheetViewportRect.top - finaleStageRect.top + finaleLead) / finaleTravel, 0, 1)
    : 0;
  const finaleOverflow = finaleStage && finaleBackground
    ? Math.max(0, finaleBackground.offsetHeight - finaleStage.clientHeight)
    : 0;
  const finaleOffset = reduceMotionQuery.matches ? 0 : -finaleOverflow * finaleProgress;
  const progress = clamp(scrollTop / Math.max(1, canvasViewportHeight * 0.92), 0, 1);
  const isFloraHaven = projectSheet.dataset.projectId === "florahaven";
  const usesFlatCoverParallax = projectSheet.dataset.projectId === "cloud-island-device";
  const heroPullDistance = isFloraHaven
    ? Math.min(pullDistance * (16 / 3), 60)
    : pullDistance;
  const coverPullDistance = isFloraHaven ? pullDistance : 0;
  const parallaxOffset = reduceMotionQuery.matches
    ? 0
    : Math.min(
      scrollTop * (usesFlatCoverParallax ? 0.5 : 0.32),
      canvasViewportHeight * (usesFlatCoverParallax ? 0.5 : 0.38),
    );
  const heroBaseHeight = Math.max(1, heroWidth / projectHeroAspectRatio);
  const heroHeight = heroBaseHeight + heroPullDistance;
  const overscrollScale = reduceMotionQuery.matches
    ? 1
    : 1 + Math.min(
      (pullDistance / heroBaseHeight) * (isFloraHaven ? 2.1 : 0.58),
      isFloraHaven ? 0.12 : 0.1,
    );
  const scale = (reduceMotionQuery.matches ? 1.04 : 1.08 - progress * 0.045)
    + (overscrollScale - 1);

  const layerStates = projectCoverLayers.map((layer) => {
    const layerSpeed = coverNumber(layer.dataset.parallax, 0.12, -0.25, 1.5);
    const layerLimit = canvasViewportHeight * coverNumber(
      layer.dataset.parallaxLimit,
      layer.classList.contains("project-cover-layer-base") ? 0.38 : 0.22,
      0,
      0.8,
    );
    const layerOffset = reduceMotionQuery.matches
      ? 0
      : clamp(scrollTop * layerSpeed, -layerLimit, layerLimit);
    return { layer, layerOffset };
  });

  projectDetailHero?.style.setProperty("--project-hero-pull", `${heroPullDistance.toFixed(2)}px`);
  const coverTitleHeightValue = `${coverTitleHeight.toFixed(2)}px`;
  if (projectDetailHero?.style.getPropertyValue("--project-cover-title-height") !== coverTitleHeightValue) {
    projectDetailHero?.style.setProperty("--project-cover-title-height", coverTitleHeightValue);
  }
  projectDetailCover.style.setProperty("--project-parallax", `${parallaxOffset.toFixed(2)}px`);
  projectDetailCover.style.setProperty("--project-cover-pull", `${coverPullDistance.toFixed(2)}px`);
  projectDetailCover.style.setProperty("--project-scale", scale.toFixed(4));
  projectDetailCover.style.setProperty("--project-cover-overscroll-scale", overscrollScale.toFixed(4));
  finaleBackground?.style.setProperty("--project-ui-finale-offset", `${finaleOffset.toFixed(2)}px`);
  layerStates.forEach(({ layer, layerOffset }) => {
    layer.style.setProperty("--cover-layer-parallax", `${layerOffset.toFixed(2)}px`);
  });

  /* Spirited Expedition keeps each dissolve line on its own 3200px design
     coordinate while the artwork continues to move at its configured
     parallax speed. This preserves the supplied initial masks without making
     an individual gradient drift with its image. */
  if (projectSheet.dataset.projectId === "spirited-expedition") {
    const useMobilePosition = projectLayoutViewportWidth() <= 760;

    projectDissolveLayers.forEach((layer) => {
      const layerState = layerStates.find((state) => state.layer === layer);
      const layerOffset = layerState?.layerOffset || 0;
      const isBase = layer.classList.contains("project-cover-layer-base");
      const yProperty = useMobilePosition ? "--cover-layer-mobile-y" : "--cover-layer-y";
      const layerYValue = Number.parseFloat(layer.style.getPropertyValue(yProperty));
      const layerY = clamp(Number.isFinite(layerYValue) ? layerYValue : 50, -30, 130) / 100;
      const designWidth = coverNumber(layer.dataset.designWidth, 3200, 320, 10000);
      const designScale = heroWidth / designWidth;
      const configuredCenterY = Number.parseFloat(layer.dataset.designCenterY);
      const configuredTop = Number.parseFloat(layer.dataset.designTop);
      const unscaledLayerTop = isBase
        ? (Number.isFinite(configuredTop) ? configuredTop * designScale : 0)
        : Number.isFinite(configuredCenterY)
          ? configuredCenterY * designScale - (layerHeights.get(layer) || 0) / 2
          : heroHeight * layerY - (layerHeights.get(layer) || 0) / 2;
      const configuredFadeEnd = Number.parseFloat(layer.dataset.fadeTransparentY);
      const configuredFadeStart = Number.parseFloat(layer.dataset.fadeOpaqueY);
      const fallbackFadeRatio = isBase
        ? 0.28
        : layer.src.includes("gameplay-handheld")
          ? 0.095
          : 0.07667;
      const fadeEnd = Number.isFinite(configuredFadeEnd)
        ? configuredFadeEnd * designScale - unscaledLayerTop - layerOffset
        : heroHeight - unscaledLayerTop - layerOffset;
      const fadeHeight = Number.isFinite(configuredFadeEnd) && Number.isFinite(configuredFadeStart)
        ? (configuredFadeEnd - configuredFadeStart) * designScale
        : heroHeight * fallbackFadeRatio;

      layer.style.setProperty("--cover-fade-line", `${fadeEnd.toFixed(2)}px`);
      layer.style.setProperty("--cover-fade-height", `${fadeHeight.toFixed(2)}px`);
    });
  }
  updateProjectStickyChapters();
}

function settleProjectTopPull() {
  if (projectTopPullFrame) return;
  const settle = () => {
    const isFloraHaven = activeProjectId === "florahaven";
    projectTopPullTarget *= isFloraHaven ? 0.62 : 0.86;
    projectTopPullVelocity += (projectTopPullTarget - projectTopPull) * (isFloraHaven ? 0.28 : 0.13);
    projectTopPullVelocity *= isFloraHaven ? 0.58 : 0.76;
    projectTopPull += projectTopPullVelocity;

    if (
      Math.abs(projectTopPullTarget) < 0.08
      && Math.abs(projectTopPull) < 0.08
      && Math.abs(projectTopPullVelocity) < 0.08
    ) {
      projectTopPull = 0;
      projectTopPullTarget = 0;
      projectTopPullVelocity = 0;
    }
    updateProjectParallax();
    if (projectTopPull || projectTopPullTarget || projectTopPullVelocity) {
      projectTopPullFrame = requestAnimationFrame(settle);
    } else {
      projectTopPullFrame = 0;
    }
  };
  projectTopPullFrame = requestAnimationFrame(settle);
}

function kickProjectTopPull(deltaY) {
  const isFloraHaven = activeProjectId === "florahaven";
  const maxPull = isFloraHaven
    ? Math.min(window.innerHeight * 0.055, 42)
    : Math.min(window.innerHeight * 0.11, 96);
  const wheelImpulse = Math.min(
    Math.abs(deltaY) * (isFloraHaven ? 0.14 : 0.26),
    isFloraHaven ? maxPull : 26,
  );

  projectTopPullTarget = clamp(
    projectTopPullTarget + wheelImpulse,
    0,
    maxPull,
  );
  settleProjectTopPull();
}

function respondToProjectTopPull(event) {
  if (!projectSheet || reduceMotionQuery.matches || event.deltaY >= 0) return;

  if (projectScroller.scrollTop <= 1) {
    kickProjectTopPull(event.deltaY);
    return;
  }

  /* A wheel event fires before its default scroll is applied. Check on the
     next frame so a gesture that arrives from the body at scrollTop 0 still
     transfers its remaining upward momentum into the cover boundary. */
  cancelAnimationFrame(projectTopArrivalFrame);
  projectTopArrivalFrame = requestAnimationFrame(() => {
    projectTopArrivalFrame = 0;
    if (projectScroller?.scrollTop <= 1) {
      kickProjectTopPull(event.deltaY);
    }
  });
}

function queueProjectParallax() {
  cancelAnimationFrame(projectScrollFrame);
  projectScrollFrame = requestAnimationFrame(updateProjectParallax);
}

let projectParentBackPending = false;

function releaseProjectContent() {
  projectNibiruRevealObserver?.disconnect();
  projectChapters?.querySelector('.am-project-overview')?.remove();
  projectSectionBlocks.forEach(container => container.replaceChildren());
  projectGalleryImages.forEach(image => image.style.removeProperty('background-image'));
  projectDetailCover?.replaceChildren();
  projectDetailPartners?.replaceChildren();
  projectCoverLayers = [];
  projectDissolveLayers = [];
}

function finishProjectClose(restoreScrollY = projectReturnScrollY) {
  if (!projectDetail?.classList.contains("is-open")) return;

  projectOpenSequence += 1;
  projectParentBackPending = false;
  window.projectRuntime.begin('exiting');
  document.body.classList.remove("project-home-hidden");
  window.projectBackground?.close();
  setProjectLoadingState(false);

  const closeDuration = reduceMotionQuery.matches ? 0 : 760;
  projectDetail.classList.add("is-closing");
  projectDetail.classList.remove("is-open");
  projectDetail.setAttribute("aria-hidden", "true");
  projectTopPull = 0;
  projectTopPullTarget = 0;
  projectTopPullVelocity = 0;
  cancelAnimationFrame(projectTopArrivalFrame);
  projectTopArrivalFrame = 0;
  cancelAnimationFrame(projectTopPullFrame);
  projectTopPullFrame = 0;
  projectSheet.querySelectorAll("video").forEach((video) => video.pause());
  projectDetailHero?.style.setProperty("--project-hero-pull", "0px");
  cursorSuspendedByEmbed = false;
  cursorDot.classList.remove("is-visible");
  window.scrollTo(0, restoreScrollY);
  window.clearTimeout(projectVideoResetTimer);
  projectVideoResetTimer = window.setTimeout(() => {
    projectDetail.classList.remove("is-closing");
    window.projectBackground?.clearParent();
    document.body.classList.remove("project-open");
    window.projectRuntime.begin('closed');
    window.projectRuntime.reset();
    releaseProjectContent();
    wakePortfolioFrame();
    activeProjectId = null;
    resetProjectVideo();
    scheduleCoverWarm();
    projectScroller.scrollTop = 0;
    updateProjectParallax();
    projectReturnFocus?.focus({ preventScroll: true });
    projectReturnFocus = null;
    projectVideoResetTimer = 0;
  }, closeDuration);
}

function closeProject(options = {}) {
  if (projectPreparingCard && projectDetail.classList.contains('is-open')
      && (window.projectBackground.returning || window.projectRuntime.phase === 'preparing')) {
    endProjectPreparation(projectPreparationToken);
  } else if (cancelProjectPreparation() && !options.fromHistory) return;
  if (!projectDetail?.classList.contains("is-open")) return;

  if (options.fromHistory) {
    finishProjectClose(options.scrollY);
    return;
  }

  const parentProjectId = window.history.state?.portfolioParentProject;
  if (parentProjectId && parentProjectId !== activeProjectId
    && !projectParentBackPending && !window.projectBackground.returning) {
    projectParentBackPending = true;
    window.history.back();
    return;
  }

  // Embedded players can add entries to the browser's joint session history.
  // Replacing the project route avoids a first Back click being consumed by
  // YouTube or Vimeo before the portfolio layer itself can close.
  const indexUrl = `${window.location.pathname}${window.location.search}#work`;
  window.history.replaceState(
    {
      portfolioIndex: true,
      portfolioScrollY: projectReturnScrollY,
    },
    "",
    indexUrl,
  );

  finishProjectClose(projectReturnScrollY);
}

function scrollProjectToTop() {
  if (!projectSheet) return;
  projectScroller.scrollTo({
    top: 0,
    behavior: reduceMotionQuery.matches ? "auto" : "smooth",
  });
}

function localizedCardCopy(card) {
  const chinese = projectCardChineseCopy[card?.dataset.projectId];
  if (currentLanguage === "zh" && chinese) {
    return {
      descriptor: chinese.descriptor || workCardDescriptors.get(card) || "",
      title: chinese.title || workCardTitles.get(card) || "",
      context: chinese.context || workCardContexts.get(card) || "",
    };
  }
  return {
    descriptor: workCardDescriptors.get(card) || "",
    title: workCardTitles.get(card) || "",
    context: workCardContexts.get(card) || "",
  };
}

function setLanguage(language) {
  // Restore the English baseline before updating nodes owned by other renderers.
  // Otherwise cached originals can overwrite freshly localized labels or audio copy.
  translatePortfolioTree(projectSheet, "en");
  const selectedLanguage = language === "zh" ? "zh" : "en";
  const copy = languageCopy[selectedLanguage];
  currentLanguage = selectedLanguage;

  document.documentElement.lang = selectedLanguage === "zh" ? "zh-CN" : "en";
  document.title = selectedLanguage === "zh"
    ? "Oliver Wu — 体验设计师"
    : "Oliver Wu — Experience Designer";
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const value = copy[element.dataset.i18n];
    if (value) element.textContent = value;
  });
  document.querySelectorAll("[data-i18n-html]").forEach((element) => {
    const value = copy[element.dataset.i18nHtml];
    if (value) element.innerHTML = value;
  });
  document.querySelector("[data-resume-close]")?.setAttribute(
    "aria-label",
    selectedLanguage === "zh" ? "关闭简历选择" : "Close résumé selector",
  );

  if (languageToggle) {
    languageToggle.dataset.language = selectedLanguage;
    languageToggle.setAttribute("aria-label", selectedLanguage === "zh" ? "语言选择" : "Language selection");
    languageButtons.forEach((button) => {
      const isSelected = button.dataset.languageOption === selectedLanguage;
      button.setAttribute("aria-pressed", String(isSelected));
      button.setAttribute("aria-label", button.dataset.languageOption === "zh" ? "切换至中文" : "Switch to English");
    });
  }

  projectCards.forEach((card) => {
    const localized = localizedCardCopy(card);
    const title = card.querySelector(".case-info h3");
    const context = card.querySelector(".case-details > span:first-child");
    if (title) title.textContent = localized.title;
    if (context) context.textContent = localized.context;
    if (card.dataset.locked === "true") {
      const overlayTitle = card.querySelector(".case-unreleased-overlay strong");
      const overlayBody = card.querySelector(".case-unreleased-overlay span");
      if (overlayTitle) overlayTitle.textContent = selectedLanguage === "zh" ? "项目尚未发布" : "PROJECT NOT YET RELEASED";
      if (overlayBody) overlayBody.textContent = selectedLanguage === "zh"
        ? "如需进一步了解，欢迎在面试中与我沟通。"
        : "Please contact me to discuss this work during an interview.";
      const ndaLabel = card.querySelector(".case-details > span:last-child");
      if (ndaLabel) ndaLabel.textContent = selectedLanguage === "zh" ? "受保密协议保护" : "Under NDA";
      card.setAttribute(
        "aria-label",
        selectedLanguage === "zh"
          ? `${localized.title}。项目尚未发布，如需了解请在面试中与我沟通。`
          : `${localized.title}. This project has not yet been released. Please contact me to discuss it during an interview.`,
      );
    } else {
      card.setAttribute(
        "aria-label",
        selectedLanguage === "zh" ? `打开《${localized.title}》项目详情` : `Open ${localized.title} case study`,
      );
    }
  });

  projectCardMap?.setAttribute("aria-label", selectedLanguage === "zh" ? "精选作品" : "Selected portfolio projects");
  document.querySelector(".index-nav")?.setAttribute("aria-label", selectedLanguage === "zh" ? "作品集导航" : "Portfolio navigation");
  physicsPlayground?.setAttribute("aria-label", selectedLanguage === "zh" ? "可交互设计元素" : "Interactive design objects");
  document.querySelector(".contact-moments")?.setAttribute(
    "aria-label",
    selectedLanguage === "zh" ? "人物与生活照片轮播" : "People and moments photo carousel",
  );
  document.querySelector(".contact-carousel-dots")?.setAttribute(
    "aria-label",
    selectedLanguage === "zh" ? "选择照片" : "Photo selection",
  );
  document.querySelector(".contact-person > img")?.setAttribute(
    "alt",
    selectedLanguage === "zh" ? "吴佳佑的肖像" : "Portrait of Oliver Wu",
  );
  document.querySelector(".work-filters")?.setAttribute("aria-label", selectedLanguage === "zh" ? "作品分类" : "Work categories");
  projectCloseButtons.forEach((button) => button.setAttribute(
    "aria-label",
    selectedLanguage === "zh" ? "返回上一页" : "Back to previous page",
  ));
  document.querySelectorAll("[data-project-back-label]").forEach((label) => {
    label.textContent = selectedLanguage === "zh" ? "返回" : "Back";
  });
  projectDetailIntroduction?.closest(".project-intro")?.setAttribute(
    "aria-label",
    selectedLanguage === "zh" ? "项目介绍" : "Project introduction",
  );
  projectDetailFacts?.setAttribute("aria-label", selectedLanguage === "zh" ? "项目信息" : "Project information");
  projectDetailTags?.setAttribute("aria-label", selectedLanguage === "zh" ? "项目标签" : "Project tags");
  projectChapters?.setAttribute("aria-label", selectedLanguage === "zh" ? "项目章节" : "Case study chapters");
  const roleLabel = projectDetailRoles?.closest(".project-fact-roles")?.querySelector(":scope > span");
  if (roleLabel) roleLabel.textContent = selectedLanguage === "zh" ? "我的职责" : "MY ROLE";
  const releaseLabel = projectDetailReleaseFact?.querySelector(":scope > span");
  if (releaseLabel) releaseLabel.textContent = selectedLanguage === "zh" ? "发布日期" : "RELEASE DATE";
  const detailFooterLabel = document.querySelector(".project-sheet-footer > span");
  const detailFooterButton = document.querySelector(".project-sheet-footer > button");
  if (detailFooterLabel) detailFooterLabel.textContent = selectedLanguage === "zh" ? "案例结束" : "END OF CASE STUDY";
  if (detailFooterButton) detailFooterButton.textContent = selectedLanguage === "zh" ? "返回顶部 ↑" : "BACK TO TOP ↑";

  if (projectPreparingCard) {
    projectPreparation.querySelector('[data-preparation-title]').textContent = projectPreparingCard.querySelector('h3')?.textContent || 'Selected Project';
    projectPreparation.querySelector('[data-preparation-status]').textContent = selectedLanguage === 'zh' ? '正在准备项目详情…' : 'Preparing case study…';
  }

  setWorkFilter(projectCardMap?.dataset.activeFilter || "all");
  if (typeof updateSoundDesignLanguage === "function") {
    updateSoundDesignLanguage(selectedLanguage);
  }
  if (projectDetail?.classList.contains("is-open")) {
    translatePortfolioTree(projectSheet, selectedLanguage);
  }

}

function setWorkFilter(filter) {
  const selectedFilter = ["embodied", "worlds", "sound", "other"].includes(filter) ? filter : "all";
  if (projectCardMap) projectCardMap.dataset.activeFilter = selectedFilter;
  const selectedOrder = filterWorkOrders[selectedFilter] || preferredWorkOrder;
  const selectedOrderIndex = new Map(selectedOrder.map((projectId, index) => [projectId, index]));
  const orderedCards = [...projectCards].sort((first, second) => (
    (selectedOrderIndex.get(first.dataset.projectId) ?? Number.MAX_SAFE_INTEGER)
    - (selectedOrderIndex.get(second.dataset.projectId) ?? Number.MAX_SAFE_INTEGER)
  ));
  let visibleIndex = 0;

  workFilterButtons.forEach((button) => {
    const isActive = button.dataset.filter === selectedFilter;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  orderedCards.forEach((card) => {
    projectCardMap?.append(card);
    const categories = card.dataset.category.split(/\s+/);
    const isVisible = categories.includes(selectedFilter === "all" ? "featured" : selectedFilter);
    card.hidden = !isVisible;
    card.dataset.visibleColumn = isVisible && visibleIndex % 2 === 1 ? "right" : "left";
    if (!isVisible) return;

    const label = card.querySelector(".case-info > p");
    const descriptor = localizedCardCopy(card).descriptor;
    if (label) {
      label.textContent = `${String(visibleIndex + 1).padStart(2, "0")} / ${descriptor}`;
    }
    visibleIndex += 1;
  });
}

function rebuildGrain() {
  const image = grainCtx.createImageData(grainSize, grainSize);
  const pixels = image.data;

  for (let index = 0; index < pixels.length; index += 4) {
    const visible = Math.random() > 0.44;
    const value = Math.random() > 0.5 ? 8 : 42;
    pixels[index] = value;
    pixels[index + 1] = value;
    pixels[index + 2] = value;
    pixels[index + 3] = visible ? 7 + Math.random() * 13 : 0;
  }

  grainCtx.putImageData(image, 0, 0);
  grainPattern = ctx.createPattern(grainCanvas, "repeat");
}

function createInkBrushes() {
  if (!hoverQuery.matches || inkBrushes.length > 0) return;

  for (let brushIndex = 0; brushIndex < 10; brushIndex += 1) {
    const brush = document.createElement("canvas");
    const brushCtx = brush.getContext("2d", { alpha: true });
    const size = 112;
    const center = size / 2;
    const pointCount = 22;
    const points = [];
    brush.width = size;
    brush.height = size;

    for (let pointIndex = 0; pointIndex < pointCount; pointIndex += 1) {
      const angle = (pointIndex / pointCount) * Math.PI * 2;
      const bite = pointIndex % (4 + (brushIndex % 3)) === 0 ? 0.7 : 1;
      const wobble = (0.72 + Math.random() * 0.38) * bite;
      points.push({
        x: center + Math.cos(angle) * 34 * wobble * (0.88 + (brushIndex % 2) * 0.18),
        y: center + Math.sin(angle) * 30 * wobble,
      });
    }

    const paintShape = (fillStyle) => {
      brushCtx.beginPath();
      const firstMidX = (points[0].x + points[points.length - 1].x) / 2;
      const firstMidY = (points[0].y + points[points.length - 1].y) / 2;
      brushCtx.moveTo(firstMidX, firstMidY);

      for (let pointIndex = 0; pointIndex < points.length; pointIndex += 1) {
        const point = points[pointIndex];
        const next = points[(pointIndex + 1) % points.length];
        brushCtx.quadraticCurveTo(
          point.x,
          point.y,
          (point.x + next.x) / 2,
          (point.y + next.y) / 2,
        );
      }

      brushCtx.closePath();
      brushCtx.fillStyle = fillStyle;
      brushCtx.fill();
    };

    brushCtx.save();
    brushCtx.filter = "blur(5px)";
    paintShape("rgba(4, 4, 4, 0.23)");
    brushCtx.restore();
    paintShape("rgba(3, 3, 3, 0.68)");

    brushCtx.save();
    brushCtx.globalCompositeOperation = "destination-out";
    for (let gapIndex = 0; gapIndex < 5; gapIndex += 1) {
      const gapAngle = Math.random() * Math.PI * 2;
      const gapDistance = 8 + Math.random() * 18;
      brushCtx.fillStyle = `rgba(0, 0, 0, ${(0.12 + Math.random() * 0.2).toFixed(3)})`;
      brushCtx.beginPath();
      brushCtx.ellipse(
        center + Math.cos(gapAngle) * gapDistance,
        center + Math.sin(gapAngle) * gapDistance,
        2 + Math.random() * 5,
        0.8 + Math.random() * 2.2,
        gapAngle,
        0,
        Math.PI * 2,
      );
      brushCtx.fill();
    }
    brushCtx.restore();

    brushCtx.save();
    brushCtx.strokeStyle = "rgba(3, 3, 3, 0.32)";
    brushCtx.lineCap = "round";
    brushCtx.lineWidth = 1 + Math.random() * 1.8;
    for (let filament = 0; filament < 3; filament += 1) {
      const angle = Math.random() * Math.PI * 2;
      const startRadius = 22 + Math.random() * 9;
      const endRadius = 37 + Math.random() * 9;
      brushCtx.beginPath();
      brushCtx.moveTo(
        center + Math.cos(angle) * startRadius,
        center + Math.sin(angle) * startRadius,
      );
      brushCtx.quadraticCurveTo(
        center + Math.cos(angle + 0.15) * (endRadius - 5),
        center + Math.sin(angle + 0.15) * (endRadius - 5),
        center + Math.cos(angle) * endRadius,
        center + Math.sin(angle) * endRadius,
      );
      brushCtx.stroke();
    }
    brushCtx.restore();

    inkBrushes.push(brush);
  }
}

// Narrow screens stack the copy above the pile. These points are the observed
// 75th-percentile settled pile heights for the real 38-body scene. Piecewise
// interpolation keeps the landing room continuous while resizing and avoids
// running hidden Matter.js simulations on the main thread.
const heroStackQuery = window.matchMedia("(max-width: 1024px)");
const HERO_LANDING_POINTS = [
  [320, 445], [360, 403], [390, 374], [430, 404], [480, 354],
  [540, 330], [620, 316], [700, 358], [760, 358], [840, 374],
  [900, 395], [960, 385], [1024, 401],
];
function interpolateHeroLandingSpace(width) {
  if (width <= HERO_LANDING_POINTS[0][0]) return HERO_LANDING_POINTS[0][1];
  for (let i = 1; i < HERO_LANDING_POINTS.length; i += 1) {
    const [nextWidth, nextHeight] = HERO_LANDING_POINTS[i];
    const [previousWidth, previousHeight] = HERO_LANDING_POINTS[i - 1];
    if (width <= nextWidth) {
      const progress = (width - previousWidth) / (nextWidth - previousWidth);
      return previousHeight + (nextHeight - previousHeight) * progress;
    }
  }
  return HERO_LANDING_POINTS.at(-1)[1];
}
function updateHeroLandingSpace() {
  const heroCopy = physicsPlayground?.closest(".hero-copy");
  if (!heroCopy) return;
  if (!heroStackQuery.matches) {
    heroCopy.style.removeProperty("--hero-landing-space");
    return;
  }
  const preferredSpace = Math.round(interpolateHeroLandingSpace(physicsPlayground.clientWidth));
  heroCopy.style.setProperty("--hero-landing-space", `${preferredSpace}px`);
  void physicsPlayground.offsetHeight;

  // Between desktop and phone layouts, preserve BOTH exterior paper gaps.
  // If the stacked copy would make the first panel taller than the available
  // viewport, trim only its internal landing room; never consume the outer gap.
  const panel = heroCopy.closest(".page-panel-about");
  const outerGap = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--outer-gap")) || 0;
  const availablePanelHeight = Math.max(0, window.innerHeight - outerGap * 2);
  const overflow = Math.max(0, panel.getBoundingClientRect().height - availablePanelHeight);
  if (overflow > 1) {
    heroCopy.style.setProperty("--hero-landing-space", `${Math.max(120, preferredSpace - overflow)}px`);
    void physicsPlayground.offsetHeight;
  }
}

function createPhysicsClipGeometry(element, width, height) {
  // Visible SVG extents, not the transparent viewBox margins.
  const isLarge = element.classList.contains("star-lg");
  const isSmallest = element.classList.contains("star-xs");
  // Include the visible wire, not just its path centreline, in the capsule.
  const clipWidth = width * (isLarge ? 32.2 / 40 : isSmallest ? 58.16 / 60 : 45.04 / 48);
  const clipHeight = height * (isLarge ? 109.2 / 122 : isSmallest ? 114.16 / 122 : 113.04 / 122);
  const offsetY = height * (isLarge ? 0.5 / 122 : 1 / 122);
  const radius = Math.min(clipWidth, clipHeight) / 2;
  const halfStem = clipHeight / 2 - radius;
  const vertices = [];
  // Even sampling includes each round tip as a vertex, never a flat end cap.
  // Four facets per round cap retain a pointed tip and a curved silhouette.
  // Ten vertices instead of 34: no thin compound-wire collision mesh.
  const arcSteps = 4;
  for (let end = 0; end < 2; end += 1) {
    for (let step = 0; step <= arcSteps; step += 1) {
      const angle = end * Math.PI + step * Math.PI / arcSteps;
      vertices.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius + (end === 0 ? halfStem : -halfStem),
      });
    }
  }
  return { vertices, offsetY };
}

function buildPhysicsWorld() {
  if (!physicsPlayground || !window.Matter) return;
  updateHeroLandingSpace();

  const {
    Engine,
    Bodies,
    Body,
    Composite,
  } = window.Matter;
  const bounds = physicsPlayground.getBoundingClientRect();
  const worldWidth = Math.max(1, bounds.width);
  const worldHeight = Math.max(1, bounds.height);
  const floorY = worldHeight;

  // Resolve the entry positions before allowing the devices and small stars to sleep.
  physicsEngine = Engine.create({ enableSleeping: false });
  physicsEngine.plugin.portfolioReducedMotion = reduceMotionQuery.matches;
  physicsEngine.positionIterations = 10;
  physicsEngine.velocityIterations = 6;
  physicsEngine.constraintIterations = 1;
  physicsEngine.gravity.y = 1;
  physicsEngine.gravity.scale = 0.001;
  physicsSize = { width: worldWidth, height: floorY };

  const wallOptions = {
    isStatic: true,
    friction: 0.9,
    restitution: 0.02,
    render: { visible: false },
  };

  physicsWalls = [
    Bodies.rectangle(worldWidth / 2, -30, worldWidth + 120, 60, wallOptions),
    Bodies.rectangle(worldWidth / 2, floorY + 40, worldWidth + 120, 80, wallOptions),
    // Smooth side walls stop the wider paper cutouts wedging in mid-air on phones.
    Bodies.rectangle(-30, floorY / 2, 60, floorY * 2, { ...wallOptions, friction: 0, frictionStatic: 0 }),
    Bodies.rectangle(worldWidth + 30, floorY / 2, 60, floorY * 2, { ...wallOptions, friction: 0, frictionStatic: 0 }),
  ];

  // Keep the four original anchors independent of DOM order and added objects.
  const deviceSpawn = {
    "object-synth": { x: 0.38, yOffset: 8 },
    "object-phone": { x: 0.9, yOffset: 52 },
    "object-tablet": { x: 0.76, yOffset: 92 },
    "object-laptop": { x: 0.58, yOffset: 138 },
  };

  // Original scatter positions, independent of the six larger objects.
  const starSpawn = [
    [0.08, 0.12], [0.16, 0.2], [0.25, 0.1], [0.31, 0.25],
    [0.79, 0.42], [0.86, 0.5], [0.52, 0.13], [0.61, 0.24],
    [0.7, 0.1], [0.93, 0.18], [0.4, 0.33], [0.55, 0.39],
    [0.68, 0.31], [0.91, 0.35], [0.35, 0.14], [0.47, 0.22],
    [0.63, 0.46], [0.75, 0.2], [0.84, 0.29], [0.96, 0.48],
    [0.05, 0.34], [0.12, 0.46], [0.21, 0.32], [0.28, 0.45],
    [0.37, 0.06], [0.43, 0.48], [0.58, 0.07], [0.66, 0.18],
    [0.73, 0.38], [0.82, 0.09], [0.9, 0.25], [0.96, 0.07],
    [0.06, 0.22], [0.18, 0.38], [0.34, 0.12], [0.49, 0.3],
    [0.64, 0.16], [0.8, 0.44], [0.89, 0.08], [0.95, 0.36],
  ];
  let starIndex = 0;
  physicsBodies = physicsTokens.map((element) => {
    const objectWidth = Math.max(2, element.offsetWidth);
    const objectHeight = Math.max(2, element.offsetHeight);
    const isPortrait = element.classList.contains("object-portrait");
    const isSynth = element.classList.contains("object-synth");
    const isCamera = element.classList.contains("object-camera");
    const isStar = element.classList.contains("gravity-star");
    let x;
    let y;

    if (isPortrait) {
      x = clamp(worldWidth * 0.87, objectWidth / 2 + 10, worldWidth - objectWidth / 2 - 18);
      y = objectHeight / 2 + 8;
    } else if (isCamera) {
      // Above the phone's right-side lane; wait off-canvas until the other pieces drop.
      x = clamp(worldWidth * 0.93, objectWidth / 2 + 12, worldWidth - objectWidth / 2 - 14);
      y = -objectHeight / 2 - 12;
    } else if (isStar) {
      const spawnIndex = starIndex++;
      const [ratioX, ratioY] = starSpawn[spawnIndex] || [
        0.05 + ((spawnIndex * 0.61803398875) % 1) * 0.9,
        0.07 + ((spawnIndex * 0.38196601125) % 1) * 0.43,
      ];
      x = clamp(worldWidth * ratioX, objectWidth / 2 + 10, worldWidth - objectWidth / 2 - 12);
      y = clamp(worldHeight * ratioY, objectHeight / 2 + 8, worldHeight - objectHeight / 2 - 18);
    } else {
      const key = Object.keys(deviceSpawn).find((name) => element.classList.contains(name));
      const spawn = deviceSpawn[key] || { x: 0.7, yOffset: 24 };
      x = clamp(worldWidth * spawn.x, objectWidth / 2 + 12, worldWidth - objectWidth / 2 - 14);
      y = clamp(
        objectHeight / 2 + spawn.yOffset,
        objectHeight / 2 + 8,
        worldHeight - objectHeight / 2 - 18,
      );
    }

    const options = {
      angle: isStar
        ? Math.random() * Math.PI * 2
        : isPortrait
          ? -0.055
          : isSynth
            ? -0.1
            : (Math.random() - 0.5) * 0.07,
      // The delayed camera must pass through the top boundary before it collides.
      isSensor: isCamera,
      // Keep tiny clips lighter than devices without an unstable mass ratio.
      density: isStar ? 0.003 : 0.001,
      friction: isStar ? 0.24 : 0.58,
      frictionAir: isStar ? 0.018 : 0.021,
      frictionStatic: isStar ? 0.3 : 1,
      restitution: isStar ? 0.035 : 0.045,
      slop: 0.01,
      sleepThreshold: isStar ? 60 : 34,
    };
    const clip = isStar ? createPhysicsClipGeometry(element, objectWidth, objectHeight) : null;
    const body = clip
      ? Body.create({
        ...options,
        vertices: clip.vertices,
        position: {
          x: x - Math.sin(options.angle) * clip.offsetY,
          y: y + Math.cos(options.angle) * clip.offsetY,
        },
      })
      : Bodies.rectangle(x, y, objectWidth, objectHeight, options);

    // Scatter clips through a broad downward cone. A random orientation alone
    // still reads as a vertical shower when every centre follows the same path.
    const clipFallAngle = isStar ? (Math.random() - .5) * Math.PI * .78 : 0;
    const clipFallSpeed = isStar ? .55 + Math.random() * 1.05 : 0;
    Body.setVelocity(body, {
      x: isStar
        ? Math.sin(clipFallAngle) * clipFallSpeed
        : isSynth
          ? .14
          : (Math.random() - .5) * .18,
      y: isStar
        ? Math.cos(clipFallAngle) * clipFallSpeed
        : isPortrait
          ? 1.2
          : .55 + Math.random() * .45,
    });
    Body.setAngularVelocity(body, (Math.random() - 0.5) * (isStar ? 0.036 : 0.006));

    body.plugin.portfolioElement = element;
    body.plugin.portfolioWidth = objectWidth;
    body.plugin.portfolioHeight = objectHeight;
    body.plugin.portfolioOffsetY = clip?.offsetY || 0;
    body.plugin.portfolioClip = isStar;
    body.plugin.tipDirection = Math.sign(body.angularVelocity) || 1;
    body.plugin.inertiaFactor = 0.82 + Math.random() * 0.24;
    body.plugin.releaseAt = isCamera ? 950 : 0;
    body.plugin.pendingRelease = isCamera;
    return body;
  });

  Composite.add(physicsEngine.world, [
    ...physicsWalls,
    ...physicsBodies.filter((body) => !body.plugin.pendingRelease),
  ]);
  // Reduced motion renders a settled arrangement, without showing the fall.
  if (reduceMotionQuery.matches) {
    for (let step = 0; step < 1200; step += 1) {
      stepPhysicsWorld(1000 / 60);
      if (step >= 299 && physicsBodies.every((body) => body.isSleeping && !body.plugin.pendingRelease)) break;
    }
  }
  renderPhysicsBodies();
}

function nudgeUnsupportedPhysicsClips(delta) {
  const floorContacts = new Set();
  const supportedClips = new Set();
  const recordContact = (body, other) => {
    if (!body.plugin.portfolioClip) return;
    if (other === physicsWalls[1]) floorContacts.add(body);
    else supportedClips.add(body);
  };
  for (const pair of physicsEngine.pairs.list) {
    if (!pair.isActive || pair.isSensor) continue;
    recordContact(pair.bodyA, pair.bodyB);
    recordContact(pair.bodyB, pair.bodyA);
  }
  for (const body of physicsBodies) {
    if (!body.plugin.portfolioClip) continue;
    let onFloor = false;
    let supported = false;
    if (!body.isSensor && !body.plugin.pendingRelease
      && Math.abs(Math.sin(body.angle)) < 0.18
      && body.speed < 0.18 && body.angularSpeed < 0.006) {
      onFloor = floorContacts.has(body);
      supported = supportedClips.has(body);
    }
    if (!onFloor || supported) {
      body.plugin.uprightRestTime = 0;
      continue;
    }
    body.plugin.uprightRestTime = (body.plugin.uprightRestTime || 0) + delta;
    if (body.plugin.uprightRestTime < 200) continue;
    // Only break a quiet, unsupported end-on balance; never prescribe a pose.
    const lean = Math.sin(body.angle * 2);
    const direction = Math.abs(lean) > 0.001 ? Math.sign(lean) : body.plugin.tipDirection;
    window.Matter.Sleeping.set(body, false);
    body.torque += direction * body.inertia * 0.0000015;
  }
}

function stepPhysicsWorld(delta) {
  // Small capsules beneath much larger cutouts need shorter collision steps.
  const substeps = Math.ceil(delta / (1000 / 120));
  for (let step = 0; step < substeps; step += 1) stepPhysicsSubstep(delta / substeps);
}

function stepPhysicsSubstep(delta) {
  const { Body, Composite, Engine, Sleeping } = window.Matter;
  physicsEngine.enableSleeping = physicsEngine.timing.timestamp >= 3000;
  for (const body of physicsBodies) {
    if (body.plugin.pendingRelease && physicsEngine.timing.timestamp >= body.plugin.releaseAt) {
      body.plugin.pendingRelease = false;
      Composite.add(physicsEngine.world, body);
    }
    if (!body.plugin.pendingRelease && body.isSensor && body.bounds.min.y >= 2) {
      body.isSensor = false;
      // Matter caches this flag on existing overlaps; restore those contacts too.
      for (const pair of physicsEngine.pairs.list) {
        if (pair.bodyA === body || pair.bodyB === body) {
          pair.isSensor = pair.bodyA.isSensor || pair.bodyB.isSensor;
        }
      }
    }
  }
  Engine.update(physicsEngine, delta);
  // A narrow tray can eject a small clip above the ceiling during the initial
  // collision burst. Recover only fully off-screen, non-sensor bodies; the
  // delayed camera keeps its intended off-canvas entrance.
  for (const body of physicsBodies) {
    if (!body.plugin.pendingRelease && !body.isSensor && body.bounds.max.y < -2) {
      Sleeping.set(body, false);
      Body.setPosition(body, {
        x: clamp(body.position.x, body.plugin.portfolioWidth / 2 + 8, physicsSize.width - body.plugin.portfolioWidth / 2 - 8),
        y: body.plugin.portfolioHeight / 2 + 4,
      });
      Body.setVelocity(body, { x: body.velocity.x * .3, y: 1.2 });
    }
  }
  nudgeUnsupportedPhysicsClips(delta);
}

function renderPhysicsBodies() {
  for (const body of physicsBodies) {
    const element = body.plugin.portfolioElement;
    const objectWidth = body.plugin.portfolioWidth;
    const objectHeight = body.plugin.portfolioHeight;
    const offsetY = body.plugin.portfolioOffsetY || 0;
    const x = body.position.x + Math.sin(body.angle) * offsetY - objectWidth / 2;
    const y = body.position.y - Math.cos(body.angle) * offsetY - objectHeight / 2;
    const transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotate(${body.angle.toFixed(4)}rad)`;
    if (body.plugin.lastTransform !== transform) {
      element.style.transform = transform;
      body.plugin.lastTransform = transform;
    }
  }
}

function updatePhysics(delta) {
  if (!physicsEngine || !window.Matter || !physicsPlayground || document.hidden) return;
  if (document.getElementById('resumePicker')?.open) return;
  if (document.documentElement.classList.contains('boot-pending')) return;
  if (physicsEngine.plugin.portfolioReducedMotion !== reduceMotionQuery.matches) buildPhysicsWorld();
  if (reduceMotionQuery.matches) return;

  if (!physicsVisible && !document.documentElement.classList.contains('boot-entering')) return;
  if (physicsEngine.enableSleeping && physicsBodies.every(body => body.isSleeping && !body.plugin.pendingRelease)) return;
  stepPhysicsWorld(clamp(delta, 8, 1000 / 60));
  renderPhysicsBodies();
}

// Text wrapping, language changes and mobile browser chrome can resize the full hero
// without a window-width change. Measure its actual area, never a shortened sub-tray.
if (physicsPlayground) {
  new ResizeObserver(() => {
    const bounds = physicsPlayground.getBoundingClientRect();
    if (!physicsEngine || Math.abs(bounds.width - physicsSize.width) > 2
      || Math.abs(bounds.height - physicsSize.height) > 2) buildPhysicsWorld();
  }).observe(physicsPlayground);
}

function applyTrayImpulse(strength) {
  if (
    reduceMotionQuery.matches
    || !physicsEngine
    || !window.Matter
    || !physicsPlayground
  ) {
    return;
  }

  const bounds = physicsPlayground.getBoundingClientRect();
  if (bounds.bottom < 0 || bounds.top > viewportHeight) return;

  const { Body, Sleeping } = window.Matter;
  const impulse = clamp(strength * 10, 16, 34);

  for (const body of physicsBodies) {
    const objectHeight = body.plugin.portfolioHeight;
    const touchesTray =
      body.position.y + objectHeight / 2 >= physicsSize.height - 5
      && Math.abs(body.velocity.y) < 1.2;
    const isSupported = body.isSleeping || touchesTray;
    if (!isSupported) continue;

    const factor = body.plugin.inertiaFactor;
    Sleeping.set(body, false);
    Body.setVelocity(body, {
      x: body.velocity.x,
      y: clamp(Math.min(body.velocity.y, 0) - impulse * factor, -38, 8),
    });
  }
}

function kickPhysicsAtPointer(x, y, movementX, movementY) {
  if (!physicsEngine || !window.Matter || !physicsPlayground || reduceMotionQuery.matches) return;

  const { Body, Sleeping } = window.Matter;
  const bounds = physicsPlayground.getBoundingClientRect();
  if (y < bounds.top || y > bounds.bottom) return;

  const pointerX = x - bounds.left;
  const pointerY = y - bounds.top;
  const movement = Math.hypot(movementX, movementY);
  const interactionRadius = clamp(bounds.width * 0.21, 155, 230);

  for (const body of physicsBodies) {
    if (body.plugin.pendingRelease || body.isSensor) continue;
    const dx = body.position.x - pointerX;
    const dy = body.position.y - pointerY;
    const distance = Math.hypot(dx, dy) || 1;
    if (distance >= interactionRadius) continue;

    const influence = Math.pow(1 - distance / interactionRadius, 1.35);
    const impulse = influence * (2.1 + Math.min(movement, 70) * 0.055);
    const normalX = distance < 8 ? -movementX / (movement || 1) : dx / distance;
    const normalY = distance < 8 ? -movementY / (movement || 1) : dy / distance;
    Sleeping.set(body, false);
    Body.setVelocity(body, {
      x: clamp(body.velocity.x + normalX * impulse + movementX * 0.012 * influence, -11, 11),
      y: clamp(body.velocity.y + normalY * impulse - 1.45 * influence, -12, 10),
    });
    Body.setAngularVelocity(
      body,
      clamp(body.angularVelocity + (movementX / 80) * influence * 0.035, -0.075, 0.075),
    );
  }
}

function addInkDrops(x, y) {
  if (lastInkX < -50 || lastInkY < -50) {
    lastInkX = x;
    lastInkY = y;
    return;
  }

  const dx = x - lastInkX;
  const dy = y - lastInkY;
  const distance = Math.hypot(dx, dy);
  if (distance < 5) return;

  const speedWeight = clamp(distance / 90, 0, 1);
  const spacing = 7 + speedWeight * 3;
  const steps = Math.max(1, Math.ceil(distance / spacing));
  const direction = Math.atan2(dy, dx);

  for (let stepIndex = 1; stepIndex <= steps; stepIndex += 1) {
    const progress = stepIndex / steps;
    const size = 30 + Math.random() * 11 + speedWeight * 8;
    inkDrops.unshift({
      x: lastInkX + dx * progress + (Math.random() - 0.5) * 2.4,
      y: lastInkY + dy * progress + (Math.random() - 0.5) * 2.4,
      life: 1,
      size,
      rotation: direction + (Math.random() - 0.5) * 0.28,
      stretchX: 1.08 + speedWeight * 0.42 + Math.random() * 0.16,
      stretchY: 0.52 + Math.random() * 0.18,
      drift: 0.01 + Math.random() * 0.022,
      brush: Math.floor(Math.random() * inkBrushes.length),
    });
  }

  inkDrops.length = Math.min(inkDrops.length, 92);
  wakePortfolioFrame();
  lastInkX = x;
  lastInkY = y;
}

function updateInk(delta) {
  const motionScale = reduceMotionQuery.matches ? 2.4 : 1;
  for (const drop of inkDrops) {
    drop.life -= delta * 0.00105 * motionScale;
    drop.y += drop.drift * Math.min(delta / 16, 2);
  }
  inkDrops = inkDrops.filter((drop) => drop.life > 0);
}

function drawBaseGrain(time, target = ctx, width = viewportWidth, height = viewportHeight) {
  if (time - lastGrainUpdate > 560 && !reduceMotionQuery.matches) {
    rebuildGrain();
    lastGrainUpdate = time;
  }

  target.save();
  const driftX = reduceMotionQuery.matches ? 0 : Math.sin(time * 0.00007) * 0.28;
  const driftY = reduceMotionQuery.matches ? 0 : Math.cos(time * 0.00006) * 0.24;
  target.translate(driftX, driftY);
  target.fillStyle = grainPattern;
  target.fillRect(-2, -2, width + 4, height + 4);
  target.restore();
}

function drawInk() {
  if (inkDrops.length === 0) return;

  ctx.save();
  ctx.globalCompositeOperation = "multiply";

  for (let index = inkDrops.length - 1; index >= 0; index -= 1) {
    const drop = inkDrops[index];
    const brush = inkBrushes[drop.brush];
    if (!brush) continue;
    const life = Math.pow(drop.life, 1.35);
    const taper = 1 - index / Math.max(1, inkDrops.length - 1);
    const taperedSize = drop.size * (0.34 + Math.pow(taper, 0.58) * 0.66);
    ctx.save();
    ctx.globalAlpha = life * (0.3 + taper * 0.24);
    ctx.translate(drop.x, drop.y);
    ctx.rotate(drop.rotation);
    ctx.scale(drop.stretchX, drop.stretchY);
    ctx.drawImage(
      brush,
      -taperedSize / 2,
      -taperedSize / 2,
      taperedSize,
      taperedSize,
    );
    ctx.restore();
  }

  ctx.restore();
}

function resizeCanvas() {
  viewportWidth = window.innerWidth;
  viewportHeight = window.innerHeight;
  dpr = 1;
  canvas.width = Math.floor(viewportWidth * dpr);
  canvas.height = Math.floor(viewportHeight * dpr);
  canvas.style.width = `${viewportWidth}px`;
  canvas.style.height = `${viewportHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  rebuildGrain();

  if (physicsPlayground) {
    const bounds = physicsPlayground.getBoundingClientRect();
    if (
      !physicsEngine
      || Math.abs(bounds.width - physicsSize.width) > 2
      || Math.abs(bounds.height - physicsSize.height) > 2
    ) {
      buildPhysicsWorld();
    }
  }
}

let portfolioFrame = 0;
function wakePortfolioFrame() {
  if (!portfolioFrame && !document.hidden) portfolioFrame = requestAnimationFrame(frame);
}
function launchHomeArrival() {
  if (reduceMotionQuery.matches || !physicsEngine || !window.Matter) return;
  const {Body,Sleeping}=window.Matter;
  const liftByClass={ 'object-portrait':0, 'object-laptop':8, 'object-synth':130, 'object-tablet':150, 'object-phone':180 };
  const upwardSpeed=clamp(physicsSize.height*.026,11,18);
  let clipIndex=0;
  for(const body of physicsBodies){
    if(body.plugin.pendingRelease) continue; // The camera keeps its delayed lane.
    const element=body.plugin.portfolioElement, height=body.plugin.portfolioHeight;
    const clip=body.plugin.portfolioClip;
    const key=Object.keys(liftByClass).find(name=>element.classList.contains(name));
    // Deterministic staggered lanes: some clips are already high, others low.
    // It uses the same convex bodies, collision solver and single RAF.
    const lane = clip ? (clipIndex++ * .61803398875) % 1 : 0;
    const lift=clip ? physicsSize.height * (.08 + lane * .68) : (liftByClass[key]||0)*Math.min(1,physicsSize.height/500);
    Sleeping.set(body,false);
    Body.setPosition(body,{x:body.position.x,y:Math.max(height/2+8,physicsSize.height-height/2-8-lift)});
    Body.setVelocity(body,{x:body.velocity.x,y:-upwardSpeed*body.plugin.inertiaFactor*(clip ? .3 + (1-lane)*.55 : 1)});
  }
  renderPhysicsBodies();
}
document.addEventListener('portfolio:boot-enter', () => {
  resizeCanvas(); launchHomeArrival(); previousTime=0;
  // The intro swaps its pending class in the same task; start next frame.
  if(!portfolioFrame&&!document.hidden) portfolioFrame=requestAnimationFrame(frame);
}, {once:true});
document.addEventListener('portfolio:boot-ready', () => { resizeCanvas(); previousTime = 0; wakePortfolioFrame(); });
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    cancelAnimationFrame(portfolioFrame); portfolioFrame = 0; previousTime = 0;
  } else wakePortfolioFrame();
});
function frame(time) {
  portfolioFrame = 0;
  if (document.hidden) return;
  const delta = Math.min(time - previousTime || 16, 32);
  previousTime = time;
  const projectIsOpen = document.body.classList.contains("project-open");
  // Welcome and home share the same mouse ink, grain canvas and frame loop.
  updateInk(delta);
  if (!projectIsOpen) updatePhysics(delta);
  if (time - lastCanvasFrame >= 30) {
    ctx.clearRect(0, 0, viewportWidth, viewportHeight);
    if (!projectIsOpen) drawBaseGrain(time);
    drawInk();
    lastCanvasFrame = time;
  }
  // A detail page with no cursor trail has nothing to paint on this canvas.
  // Leave its last (empty) frame in place rather than clear the viewport 30Hz.
  if (!projectIsOpen || inkDrops.length) wakePortfolioFrame();
  else ctx.clearRect(0, 0, viewportWidth, viewportHeight);
}

function suspendCursorForEmbed() {
  cursorSuspendedByEmbed = true;
  pointer.active = false;
  cursorDot.classList.remove("is-visible");
  lastInkX = -100;
  lastInkY = -100;
}

function pointIsNearVideoFrame(clientX, clientY, margin = 0) {
  if (!document.body.classList.contains('project-open')) return false;
  return projectEmbedFrames().some((frame) => {
    const bounds = frame.getBoundingClientRect();
    return (
      clientX >= bounds.left - margin
      && clientX <= bounds.right + margin
      && clientY >= bounds.top - margin
      && clientY <= bounds.bottom + margin
    );
  });
}

function restoreCursorFromEmbed(event) {
  cursorSuspendedByEmbed = false;
  pointer.active = false;

  if (!hoverQuery.matches || !Number.isFinite(event?.clientX) || !Number.isFinite(event?.clientY)) {
    return;
  }

  cursorDot.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
  cursorDot.classList.add("is-visible");
}

window.addEventListener("pointermove", (event) => {
  // Ink is a mouse/pen-hover affordance, never a touch-scroll side effect.
  // Keep touch drags scoped to their controls; no cursor, ink or hover kicks.
  if (event.pointerType === 'touch' || !hoverQuery.matches) return;
  if (event.target instanceof Element && event.target.closest('.project-embed-viewport, iframe')) {
    suspendCursorForEmbed();
    return;
  }

  if (cursorSuspendedByEmbed) {
    cursorSuspendedByEmbed = false;
  }

  const movementX = pointer.active ? event.clientX - pointer.x : 0;
  const movementY = pointer.active ? event.clientY - pointer.y : 0;
  pointer.x = event.clientX;
  pointer.y = event.clientY;
  pointer.active = true;
  if (!inkBrushes.length) createInkBrushes();
  addInkDrops(pointer.x, pointer.y);
  // Welcome input must not wake or displace the still-hidden falling objects.
  if (!document.documentElement.classList.contains('boot-pending')) {
    kickPhysicsAtPointer(pointer.x, pointer.y, movementX, movementY);
  }

  if (hoverQuery.matches && !cursorSuspendedByEmbed) {
    cursorDot.classList.add("is-visible");
    cursorDot.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
  }
}, { passive: true });

window.addEventListener("pointerleave", () => {
  pointer.active = false;
  cursorDot.classList.remove("is-visible");
  lastInkX = -100;
  lastInkY = -100;
}, { passive: true });

bindProjectEmbedFrame(projectDetailVideoFrame);
function syncPenCursorMode() {
  document.documentElement.classList.toggle('pen-cursor-active', hoverQuery.matches);
  if (!hoverQuery.matches) suspendCursorForEmbed();
}
hoverQuery.addEventListener('change', syncPenCursorMode);
syncPenCursorMode();
document.addEventListener("mouseout", (event) => {
  const enteredVideoPlayer = event.relatedTarget instanceof HTMLIFrameElement;
  const crossedIntoVideoBounds = event.relatedTarget === null
    && pointIsNearVideoFrame(event.clientX, event.clientY);

  if (enteredVideoPlayer || crossedIntoVideoBounds) suspendCursorForEmbed();
}, { capture: true, passive: true });
window.addEventListener("blur", () => {
  window.setTimeout(() => {
    if (
      document.activeElement instanceof HTMLIFrameElement
    ) {
      suspendCursorForEmbed();
    }
  }, 0);
});

window.addEventListener("scroll", () => {
  const now = performance.now();
  const currentScrollY = window.scrollY;
  const delta = currentScrollY - lastScrollY;
  const elapsed = clamp(now - lastScrollTime, 8, 100);
  const instantVelocity = (delta / elapsed) * 16.67;
  const nextVelocity = scrollVelocity * 0.42 + instantVelocity * 0.58;
  const acceleration = nextVelocity - scrollVelocity;

  lastScrollY = currentScrollY;
  lastScrollTime = now;
  scrollVelocity = nextVelocity;

  if (Math.abs(acceleration) > 3.4 && now - lastTrayKick > 82) {
    applyTrayImpulse(1.8 + (Math.abs(acceleration) - 3.4) * 0.34);
    lastTrayKick = now;
  }

  window.clearTimeout(scrollStopTimer);
  scrollStopTimer = window.setTimeout(() => {
    const stopSpeed = Math.abs(scrollVelocity);
    if (stopSpeed > 2.2) {
      applyTrayImpulse(1.7 + stopSpeed * 0.42);
    }
    scrollVelocity = 0;
  }, 84);
}, { passive: true });

window.addEventListener("resize", () => {
  cancelAnimationFrame(resizeFrame);
  resizeFrame = requestAnimationFrame(() => {
    resizeCanvas();
    updateProjectDetailCanvas();
    updateProjectParallax();
  });
}, { passive: true });

window.addEventListener("load", () => {
  resizeCanvas();
}, { once: true });

if (languageToggle) {
  setLanguage("en");
  languageButtons.forEach((button) => button.addEventListener("click", () => {
    setLanguage(button.dataset.languageOption);
  }));
}

sectionNavigationLinks.forEach((link) => {
  link.addEventListener("click", navigateToSection);
});

workFilterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setWorkFilter(button.dataset.filter);
  });
});

detailProjectCards.forEach((card) => {
  card.dataset.projectReady = "true";
  card.addEventListener("click", () => {
    openProject(card);
  });

  card.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openProject(card);
  });
});

/* Prime only small JSON documents while idle; no full-detail image warming. */
const warmProjectDataQueue = detailProjectCards.map((card) => card.dataset.projectId);
let warmProjectDataBusy = false;
const warmNextProjectData = () => {
  if (document.documentElement.classList.contains('boot-pending') || document.documentElement.classList.contains('boot-entering')) {
    document.addEventListener('portfolio:boot-ready', warmNextProjectData, { once:true });
    return;
  }
  const connection = navigator.connection;
  // Data-saving/slow connections never warm every project in the background.
  if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || "")) return;
  if (warmProjectDataBusy || document.hidden || document.body.classList.contains('project-open') || document.body.classList.contains('project-preparing')) return;
  const projectId = warmProjectDataQueue.shift();
  if (!projectId) return;
  warmProjectDataBusy = true;
  loadProjectData(projectId)
    .catch(() => {})
    .finally(() => { warmProjectDataBusy = false; window.setTimeout(warmNextProjectData, 80); });
};
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && warmProjectDataQueue.length) warmNextProjectData();
});
if ("requestIdleCallback" in window) {
  window.requestIdleCallback(warmNextProjectData, { timeout: 1800 });
} else {
  window.setTimeout(warmNextProjectData, 700);
}

projectCloseButtons.forEach((button) => {
  button.addEventListener("click", closeProject);
});

projectScroller?.addEventListener("click", (event) => {
  if (event.target !== projectScroller || !projectDetail.classList.contains("is-open")) return;
  const sheetBounds = projectSheet.getBoundingClientRect();
  if (event.clientX < sheetBounds.left || event.clientX > sheetBounds.right) closeProject();
});

projectTopButton?.addEventListener("click", scrollProjectToTop);

projectSectionTitles.forEach((title, chapterIndex) => {
  if (!title.classList.contains("project-chapter-titlebar")) return;
  title.setAttribute("role", "button");
  title.tabIndex = 0;
  title.addEventListener("click", () => scrollProjectToChapter(chapterIndex));
  title.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    scrollProjectToChapter(chapterIndex);
  });
});

projectScroller?.addEventListener("scroll", queueProjectParallax, { passive: true });
projectScroller?.addEventListener("wheel", respondToProjectTopPull, { passive: true });
// A touch pull at the top stretches only the cover. The native scroller stays
// pinned; ordinary vertical reading, multi-touch and pinch zoom are untouched.
let projectTouchPull = null;
projectScroller?.addEventListener('touchstart', event => {
  if (event.touches.length !== 1 || projectScroller.scrollTop > 1 || reduceMotionQuery.matches
    || window.projectRuntime?.phase !== 'idle') { projectTouchPull = null; return; }
  const touch = event.touches[0];
  projectTouchPull = { x:touch.clientX, y:touch.clientY, lastY:touch.clientY };
}, { passive:true });
projectScroller?.addEventListener('touchmove', event => {
  if (!projectTouchPull || event.touches.length !== 1 || window.projectRuntime?.phase !== 'idle') return;
  const touch = event.touches[0], dx = touch.clientX-projectTouchPull.x, dy = touch.clientY-projectTouchPull.y;
  if (dy <= 0 || Math.abs(dx) > Math.abs(dy) || projectScroller.scrollTop > 1) { projectTouchPull = null; return; }
  if (event.cancelable) event.preventDefault();
  const delta = touch.clientY-projectTouchPull.lastY;
  projectTouchPull.lastY = touch.clientY;
  if (delta > 0) kickProjectTopPull(-delta);
}, { passive:false });
projectScroller?.addEventListener('touchend', () => { projectTouchPull = null; }, { passive:true });
projectScroller?.addEventListener('touchcancel', () => { projectTouchPull = null; }, { passive:true });

if (projectDetail) {
  projectDetail.dataset.scriptReady = "true";
}

window.addEventListener("popstate", (event) => {
  if (projectDetail?.classList.contains('is-closing')) {
    window.history.replaceState({ portfolioIndex: true, portfolioScrollY: projectReturnScrollY }, '', `${location.pathname}${location.search}#work`);
    return;
  }
  const projectId = event.state?.portfolioProject || projectIdFromHash();
  const savedScrollY = Number.isFinite(event.state?.portfolioScrollY)
    ? event.state.portfolioScrollY
    : projectReturnScrollY;
  const savedProjectScrollTop = Number.isFinite(event.state?.portfolioProjectScrollTop)
    ? event.state.portfolioProjectScrollTop
    : 0;

  if (projectId) {
    const card = detailProjectCards.find((projectCard) => projectCard.dataset.projectId === projectId);
    if (card) openProject(card, {
      pushHistory: false,
      scrollY: savedScrollY,
      projectScrollTop: savedProjectScrollTop,
    });
    return;
  }

  if (projectDetail?.classList.contains("is-open")) {
    closeProject({ fromHistory: true, scrollY: savedScrollY });
    return;
  }

  const sectionTarget = sectionTargetFromHash();
  if (sectionTarget) {
    requestAnimationFrame(() => scrollToSection(sectionTarget, "auto"));
  } else {
    requestAnimationFrame(() => window.scrollTo(0, savedScrollY));
  }
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeProject();
});

setWorkFilter("all");
updateProjectDetailCanvas();
resizeCanvas();
createInkBrushes();
wakePortfolioFrame();

const initialProjectId = projectIdFromHash();
if (initialProjectId) {
  const initialCard = detailProjectCards.find((card) => card.dataset.projectId === initialProjectId);
  if (initialCard) {
    const initialScrollY = Number.isFinite(window.history.state?.portfolioScrollY)
      ? window.history.state.portfolioScrollY
      : 0;
    window.history.replaceState(
      {
        ...window.history.state,
        directProject: true,
        portfolioProject: initialProjectId,
        portfolioScrollY: initialScrollY,
      },
      "",
      window.location.href,
    );
    requestAnimationFrame(() => {
      openProject(initialCard, { pushHistory: false, scrollY: initialScrollY });
    });
  }
}
