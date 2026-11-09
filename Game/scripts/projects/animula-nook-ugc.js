/* Animula Nook case-study compositions on the shared detail canvas. */
(() => {
  const id = 'animula-nook-ugc';
  const sheet = document.querySelector('.project-sheet');
  if (!sheet) return;
  const base = 'assets/projects/animula-nook-ugc/';
  const make = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (typeof text === 'string') node.textContent = text;
    return node;
  };
  const translate = node => translatePortfolioTree(node, currentLanguage);
  const asset = file => versionProjectImageAsset(base + file);
  const decoration = (name, className) => {
    const img = make('img', className);
    img.src = versionProjectImageAsset(name); img.alt = '';
    img.setAttribute('aria-hidden', 'true'); img.draggable = false;
    return img;
  };
  const image = (item, captionFirst = false) => {
    const figure = make('figure', 'ugc-screen');
    const link = make('div', 'ugc-screen-link');
    const img = make('img', 'ugc-image');
    img.src = versionProjectImageAsset(item.file); img.alt = item.alt || item.title;
    img.loading = 'lazy'; img.decoding = 'async'; img.draggable = false;
    [img.width, img.height] = item.dimensions;
    link.append(img);
    if (item.highlight) {
      const mark = make('span', 'ugc-source-highlight');
      mark.setAttribute('aria-hidden', 'true');
      for (const key of ['left', 'top', 'width', 'height']) mark.style[key] = item.highlight[key] + '%';
      mark.style.backgroundColor = item.highlight.color;
      link.append(mark);
    }
    figure.append(link);
    if (item.title || item.body) {
      const caption = make('figcaption', 'ugc-screen-caption');
      if (item.title) caption.append(make('strong', '', item.title));
      if (item.body) caption.append(make('p', '', item.body));
      if (captionFirst) figure.prepend(caption);
      else figure.append(caption);
    }
    return figure;
  };
  const notes = (items, className = '') => {
    const list = make('ol', 'ugc-notes ' + className);
    for (const item of items || []) {
      const row = make('li', '');
      if (item.label) row.append(make('span', 'ugc-step-label', item.label));
      row.append(make('strong', '', item.title), make('p', '', item.body));
      list.append(row);
    }
    return list;
  };
  const video = (item, className = '') => {
    const figure = make('figure', 'ugc-video ' + className);
    const viewport = make('div', 'ugc-video-viewport');
    const player = make('video', 'ugc-player');
    [player.width, player.height] = item.dimensions;
    player.muted = true; player.defaultMuted = true; player.loop = true;
    player.playsInline = true; player.preload = 'none';
    player.setAttribute('data-project-demo-video', '');
    player.defaultPlaybackRate = 1; player.playbackRate = 1;
    player.poster = versionProjectImageAsset(item.poster);
    player.setAttribute('aria-label', item.title);
    viewport.append(player);
    figure.append(viewport);
    const caption = make('figcaption', 'ugc-screen-caption');
    caption.append(make('strong', '', item.title), make('p', '', item.body));
    const marker = make('div', 'ugc-demo-marker');
    marker.append(decoration(base + 'collage/clip-label-16.webp', 'ugc-demo-clip'), make('span', 'ugc-demo-label', 'PC'));
    figure.append(caption, marker);
    // The shared runtime activates visible media and releases it on close.
    setProjectMediaSource(player, versionProjectImageAsset(item.src));
    bindProjectManagedVideo(player);
    return {figure, player, caption};
  };
  let sideCaptionId = 0;
  const relocateCaption = (media, target, className = '') => {
    const note = make('div', 'ugc-relocated-caption ' + className);
    note.id = 'ugc-side-note-' + (++sideCaptionId);
    note.append(...media.caption.childNodes); media.caption.remove();
    media.figure.setAttribute('aria-describedby', note.id); target.append(note);
    return note;
  };
  const markLead = figure => {
    figure.classList.add('ugc-lead-demo');
  };
  const videoWall = config => {
    const wrap = make('div', 'ugc-video-grid');
    config.items.forEach((item, index) => {
      const group = config.groups.find(entry => entry.start === index);
      if (group) wrap.append(inlineHeading({title:group.title}, 'ugc-video-group'));
      wrap.append(video(item).figure);
    });
    return wrap;
  };
  let characterInputId = 0;
  const characterLimit = ({max, countFrom, lines}) => {
    const inputId = 'ugc-character-input-' + (++characterInputId);
    const wrap = make('section', 'ugc-character-limit');
    wrap.style.setProperty('--ugc-character-lines', String(lines));
    const label = make('label', 'ugc-character-field-label', 'Try a comment (up to 70 characters)');
    label.htmlFor = inputId;
    const field = make('textarea', 'ugc-character-textarea');
    field.id = inputId; field.rows = lines; field.wrap = 'soft'; field.spellcheck = false;
    const footer = make('div', 'ugc-character-footer');
    const status = make('output', 'ugc-character-status');
    status.id = inputId + '-status'; status.setAttribute('role', 'status');
    const count = make('span', 'ugc-character-counter');
    count.id = inputId + '-count'; count.setAttribute('translate', 'no');
    field.setAttribute('aria-describedby', status.id + ' ' + count.id);
    const update = () => {
      const length = Array.from(field.value).length;
      const blocked = length > max;
      const state = blocked ? 'blocked' : 'available';
      if (wrap.dataset.state !== state) {
        wrap.dataset.state = state;
        status.replaceChildren(document.createTextNode(blocked ? 'Over the limit' : 'Can send'));
        translate(status);
      }
      count.hidden = length < countFrom;
      count.textContent = length + ' / ' + max;
      field.setAttribute('aria-invalid', String(blocked));
      status.hidden = !length;
    };
    field.addEventListener('input', update);
    footer.append(status, count);
    wrap.append(label, field, footer);
    update();
    return wrap;
  };

  let carouselId = 0;
  const carousel = (items, heading) => {
    const section = make('section', 'ugc-carousel');
    const layout = make('div', 'ugc-carousel-layout');
    const navigation = make('div', 'ugc-carousel-navigation');
    const tabs = make('div', 'ugc-carousel-tabs');
    tabs.setAttribute('role', 'tablist'); tabs.setAttribute('aria-orientation', 'vertical'); tabs.setAttribute('aria-label', heading?.title || 'Demo selection');
    const media = video(items[0]); media.player.loop = false; media.caption.hidden = true;
    const activeDescription = make('p', 'ugc-carousel-description', items[0].body);
    const details = make('div', 'ugc-carousel-detail');
    const feedback = items.find(item => item.characterLimit);
    details.hidden = !feedback;
    if (feedback) {
      navigation.classList.add('has-comment-input');
      details.append(characterLimit(feedback.characterLimit));
    }
    activeDescription.hidden = true;
    const panelId = 'ugc-demo-panel-' + (++carouselId);
    activeDescription.id = panelId + '-description';
    media.figure.setAttribute('aria-describedby', activeDescription.id);
    media.figure.id = panelId; media.figure.setAttribute('role', 'tabpanel');
    let active = 0;
    const buttons = [];
    const select = index => {
      active = (index + items.length) % items.length;
      const item = items[active];
      buttons.forEach((button, n) => {
        button.setAttribute('aria-selected', String(n === active)); button.tabIndex = n === active ? 0 : -1;
      });
      media.figure.setAttribute('aria-labelledby', buttons[active].id);
      [media.player.width, media.player.height] = item.dimensions;
      activeDescription.replaceChildren(document.createTextNode(item.body)); translate(activeDescription);
      media.player.poster = versionProjectImageAsset(item.poster);
      media.player.setAttribute('aria-label', item.title);
      media.player.loop = details.contains(document.activeElement);
      setProjectMediaSource(media.player, versionProjectImageAsset(item.src));
      localizedAttributeOriginals.delete(media.player); translate(media.figure);
    };
    items.forEach((item, n) => {
      const button = make('button', 'ugc-carousel-tab'); button.type = 'button';
      button.id = panelId + '-tab-' + n; button.setAttribute('role', 'tab');
      button.setAttribute('aria-controls', panelId); button.setAttribute('aria-selected', String(n === 0)); button.tabIndex = n === 0 ? 0 : -1;
      button.append(make('strong', '', item.tabTitle || item.title), make('span', 'ugc-carousel-tab-description', item.tabDescription));
      button.addEventListener('click', () => select(n));
      button.addEventListener('keydown', event => {
        const direction = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0;
        if (direction) { event.preventDefault(); select(active + direction); buttons[active].focus(); }
      });
      buttons.push(button); tabs.append(button);
    });
    media.figure.setAttribute('aria-labelledby', buttons[0].id);
    const canAdvance = () => section.isConnected && sheet.dataset.projectId === id && window.projectRuntime.phase === 'idle' && !document.hidden;
    media.player.addEventListener('ended', () => { if (canAdvance() && !details.contains(document.activeElement)) select(active + 1); });
    details.addEventListener('focusin', () => { media.player.loop = true; });
    details.addEventListener('focusout', event => {
      if (details.contains(event.relatedTarget)) return;
      media.player.loop = false;
      if (media.player.ended && canAdvance()) select(active + 1);
    });
    if (heading) {
      navigation.classList.add('has-column-heading');
      navigation.append(inlineHeading({title:heading.title}));
    }
    navigation.append(tabs, details); layout.append(navigation, media.figure, activeDescription); section.append(layout);
    return section;
  };
  const deviceIcon = kind => {
    const icon = make('div', 'ugc-input-icon');
    icon.dataset.kind = kind;
    icon.setAttribute('aria-hidden', 'true');
    const svg = symbol => {
      const node = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      node.setAttribute('viewBox', '0 0 256 256');
      const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
      use.setAttribute('href', asset('device-icons.svg') + '#' + symbol);
      node.append(use); return node;
    };
    icon.append(svg(kind === 'touch' ? 'mobile' : kind));
    if (kind !== 'controller') {
      const badge = svg(kind === 'touch' ? 'touch' : 'mouse');
      badge.classList.add('ugc-device-badge'); icon.append(badge);
    }
    return icon;
  };
  const requirements = config => {
    const wrap = make('div', 'ugc-requirements-grid');
    const devices = make('section', 'ugc-input-models ugc-requirement-panel');
    const deviceBody = make('div', 'ugc-input-body ugc-panel-body');
    devices.append(make('h5', 'ugc-subsection-tab ugc-panel-tab', config.deviceTitle));
    const list = make('ul', 'ugc-device-list');
    config.devices.forEach(item => {
      const row = make('li', 'ugc-device-item');
      const copy = make('div', '');
      copy.append(make('strong', '', item.title), make('p', '', item.body));
      row.append(deviceIcon(item.icon), copy); list.append(row);
    });
    deviceBody.append(list); devices.append(deviceBody);
    const languages = make('section', 'ugc-language-panel ugc-requirement-panel');
    languages.append(make('h5', 'ugc-subsection-tab ugc-panel-tab', config.languageTitle));
    const languageBody = make('div', 'ugc-languages ugc-paper-board ugc-panel-body');
    const samples = make('div', 'ugc-type-grid');
    config.languages.forEach(item => {
      const sample = make('figure', 'ugc-type-sample');
      const header = make('figcaption', 'ugc-type-caption');
      header.append(make('span', 'ugc-locale-code', item.code), make('strong', '', item.name));
      header.setAttribute('translate', 'no');
      sample.append(header);
      const proof = make('img', 'ugc-type-proof');
      proof.src = versionProjectImageAsset(item.sampleImage);
      proof.alt = [item.display, item.secondary, item.body].join(' · ');
      proof.lang = item.locale;
      proof.setAttribute('translate', 'no');
      proof.width = 573; proof.height = 318;
      proof.loading = 'lazy'; proof.decoding = 'async';
      sample.append(proof);
      const fontList = make('dl', 'ugc-font-list');
      for (const [label, name] of [['Display font', item.fontNames.display], ['Secondary font', item.fontNames.secondary], ['Body font', item.fontNames.body]]) {
        const row = make('div', ''); row.append(make('dt', '', label), make('dd', '', name)); fontList.append(row);
      }
      sample.append(fontList);
      samples.append(sample);
    });
    const more = make('section', 'ugc-type-more');
    more.append(make('strong', 'ugc-type-more-label', config.typeNote));
    const extensionNames = make('p', 'ugc-latin-names', 'Français · Português · Español');
    extensionNames.setAttribute('translate', 'no');
    more.append(extensionNames, make('p', '', config.extensionBody));
    samples.append(more);
    languageBody.append(samples); languages.append(languageBody);
    wrap.append(devices, languages);
    return wrap;
  };
  const definition = config => {
    const diagram = make('div', 'ugc-definition');
    const root = make('div', 'ugc-map-root');
    root.append(make('strong', '', 'UGC Hub'));
    diagram.append(root);
    const branches = make('div', 'ugc-map-branches');
    config.branches.forEach((item,n) => {
      const branch = make('section', 'ugc-map-branch');
      branch.append(make('h5', '', item.title), make('p', '', item.body));
      const list = make('ul', 'ugc-map-actions');
      item.items.forEach(text => list.append(make('li', '', text)));
      branch.append(list); branches.append(branch);
    });
    diagram.append(branches);
    const support = make('ul', 'ugc-map-support');
    config.support.forEach(text => support.append(make('li', '', text)));
    diagram.append(support);
    return diagram;
  };
  const inlineHeading = (config, className = '') => {
    const header = make('header', 'ugc-inline-heading ' + className);
    header.append(make('h5', 'ugc-subsection-tab', config.title));
    if (config.body) header.append(make('p', '', config.body));
    return header;
  };
  const spotlight = (config, diagram) => {
    const wrap = make('div', 'ugc-spotlight' + (config.reverse ? ' is-reversed' : ''));
    const copy = make('aside', 'ugc-spotlight-copy');
    copy.append(inlineHeading({title:config.title}), diagram);
    const media = video(config.item);
    media.caption.remove();
    if (config.reverse) wrap.append(copy, media.figure);
    else wrap.append(media.figure, copy);
    return wrap;
  };
  const flowArrow = direction => {
    const arrow = make('span', direction === 'down' ? 'ugc-flow-arrow is-down' : 'ugc-flow-arrow');
    arrow.setAttribute('aria-hidden', 'true');
    arrow.innerHTML = '<svg viewBox="0 0 20 20"><path d="M3 10h13m-5-5 5 5-5 5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    return arrow;
  };
  const searchFlow = () => {
    const flow = make('div', 'ugc-search-flow');
    const choices = make('div', 'ugc-flow-choices');
    choices.append(make('strong', '', 'Type a keyword'), make('strong', '', 'Pick from history'));
    const merge = make('div', 'ugc-flow-merge');
    merge.setAttribute('aria-hidden', 'true');
    const query = make('div', 'ugc-flow-query');
    query.append(make('span', '', 'Keyword in search bar'), make('span', 'ugc-flow-clear', '×'));
    const result = make('div', 'ugc-flow-result');
    const stack = make('span', 'ugc-flow-result-icon');
    stack.setAttribute('aria-hidden', 'true');
    result.append(stack, make('strong', '', 'Show matching results'));
    flow.append(choices, merge, query, flowArrow('down'), result, make('p', 'ugc-flow-note', 'Click × to clear the query and return to history.'));
    return flow;
  };
  const framedInputImage = item => {
    const figure = make('figure', 'ugc-device-presentation');
    const slot = make('div', 'ugc-device-slot');
    const shell = make('div', 'ugc-device-shell is-' + item.device);
    const link = make('div', 'ugc-device-display');
    const screen = make('img', 'ugc-device-interface');
    screen.src = versionProjectImageAsset(item.screen.file); screen.alt = item.screen.alt;
    screen.loading = 'lazy'; screen.decoding = 'async';
    [screen.width, screen.height] = item.screen.dimensions;
    link.append(screen); shell.append(link);
    if (item.device === 'mobile' || item.device === 'pc') {
      const frame = make('img', 'ugc-device-frame');
      frame.src = asset(item.device === 'mobile' ? 'adaptation-19/phone.webp' : 'adaptation-19/laptop.webp');
      frame.alt = ''; frame.setAttribute('aria-hidden', 'true'); frame.loading = 'lazy'; frame.decoding = 'async';
      shell.append(frame);
    } else {
      const controller = make('img', 'ugc-device-controller');
      controller.src = asset('adaptation-19/controller.webp'); controller.alt = ''; controller.setAttribute('aria-hidden', 'true'); controller.loading = 'lazy'; controller.decoding = 'async';
      shell.append(controller);
    }
    slot.append(shell); figure.append(slot);
    return figure;
  };
  const inputMatrix = config => {
    const grid = make('div', 'ugc-input-matrix');
    const headings = make('div', 'ugc-input-matrix-head');
    for (const item of config.items) headings.append(make('h5', 'ugc-subsection-tab is-blue', item.title));
    grid.append(headings);
    for (const [index, title] of ['Comment input', 'Creation input'].entries()) {
      const row = make('section', 'ugc-input-band');
      row.append(make('strong', 'ugc-input-band-label', title));
      for (const item of config.items) {
        const entry = item.inputs[index];
        const cell = make('div', 'ugc-input-situation');
        cell.append(framedInputImage({device:item.device, screen:entry.screen}), make('p', 'ugc-input-rationale', entry.body));
        row.append(cell);
      }
      grid.append(row);
    }
    return grid;
  };
  let componentId = 0;
  const actionComparison = config => {
    const wrap = make('section', 'ugc-action-comparison');
    const grid = make('div', 'ugc-action-comparison-grid');
    const columns = [];
    let state = 0;
    let timer = 0;
    let active = false;
    const select = next => {
      state = next;
      for (const {screens, buttons} of columns) {
        screens.forEach((screen, index) => {
          screen.hidden = index !== state;
          buttons[index].setAttribute('aria-pressed', String(index === state));
        });
      }
    };
    const schedule = (focused = document.activeElement) => {
      clearTimeout(timer);
      if (!active || wrap.contains(focused)) return;
      timer = setTimeout(() => {
        select(1 - state);
        schedule();
      }, 1700);
    };
    for (const [kind, item] of [['pc', config.pc], ['console', config.console]]) {
      const column = make('section', 'ugc-action-model is-' + kind);
      column.append(make('h5', 'ugc-subsection-tab is-blue', item.title));
      const stage = make('div', 'ugc-component-stage');
      const controls = make('div', 'ugc-component-controls');
      controls.setAttribute('role', 'group'); controls.setAttribute('aria-label', item.title);
      const screens = item.screens.map((screen, n) => {
        const node = image(screen); node.classList.add('ugc-component-screen');
        node.id = 'ugc-component-' + (++componentId); node.hidden = n !== state;
        stage.append(node); return node;
      });
      const buttons = [];
      for (const [n, label] of ['Default state', 'Menu open'].entries()) {
        const button = make('button', '', label); button.type = 'button';
        button.setAttribute('aria-pressed', String(n === state)); button.setAttribute('aria-controls', screens[n].id);
        button.addEventListener('click', () => {
          select(n); schedule();
        });
        buttons.push(button); controls.append(button);
      }
      columns.push({screens, buttons});
      const access = make('dl', 'ugc-action-access');
      for (const group of item.access) {
        const row = make('div', ''); row.append(make('dt', '', group.label));
        const values = make('dd', '');
        group.actions.forEach(action => values.append(make('span', '', action)));
        row.append(values); access.append(row);
      }
      column.append(stage, controls, make('p', 'ugc-input-rationale', item.body), access); grid.append(column);
    }
    wrap.append(grid);
    wrap.addEventListener('focusin', () => schedule());
    wrap.addEventListener('focusout', event => schedule(event.relatedTarget));
    window.projectRuntime.watchActivity(wrap, visible => {
      active = visible;
      schedule();
    });
    return wrap;
  };
  const formVisibility = config => {
    const wrap = make('section', 'ugc-form-visibility');
    const layout = make('div', 'ugc-form-layout');
    const media = video(config.item); media.caption.remove();
    const comparisons = make('aside', 'ugc-field-examples');
    comparisons.append(inlineHeading({title:config.title}));
    for (const [label, start] of [['Keep the field in view', 0], ['Reveal the options', 2]]) {
      const group = make('div', 'ugc-field-example');
      const pair = make('div', 'ugc-field-example-pair');
      pair.append(image(config.examples[start]), flowArrow('right'), image(config.examples[start + 1]));
      group.append(make('strong', '', label), pair);
      comparisons.append(group);
    }
    layout.append(media.figure, comparisons);
    wrap.append(layout);
    return wrap;
  };

  const creation = config => {
    const wrap = make('div', 'ugc-creation-content');
    wrap.append(carousel(config.items.slice(0,2), config.groups[0]));
    wrap.append(formVisibility(config.visibility));
    wrap.append(videoWall({items:config.items.slice(2), groups:[{...config.groups[1], start:0}]}));
    return wrap;
  };

  const discovery = config => {
    const wrap = make('div', 'ugc-discovery');
    const top = make('div', 'ugc-discovery-top');
    const features = make('aside', 'ugc-discovery-features');
    const list = make('div', 'ugc-discovery-feature-list');
    list.setAttribute('aria-label', 'Discovery functions');
    config.features.forEach(item => {
      const feature = make('div', 'ugc-discovery-feature');
      feature.append(decoration(item.iconFile, 'ugc-discovery-icon'));
      const copy = make('div', ''); copy.append(make('h5', '', item.title), make('p', '', item.body));
      feature.append(copy); list.append(feature);
    });
    const lead = video(config.items[0]); markLead(lead.figure);
    lead.caption.remove(); features.append(inlineHeading({title:'Content areas'}), list); top.append(features, lead.figure);
    const refine = make('div', 'ugc-refine-comparison');
    const primary = video(config.items[1]); const secondary = video(config.items[2]);
    const side = make('div', 'ugc-refine-side');
    const annotations = make('div', 'ugc-refine-notes');
    relocateCaption(secondary, annotations); relocateCaption(primary, annotations, 'is-linked');
    side.append(secondary.figure, annotations); refine.append(primary.figure, side);
    wrap.append(top, refine, spotlight(config.search, searchFlow()));
    return wrap;
  };
  const social = config => {
    const wrap = make('div', 'ugc-social-content');
    wrap.append(videoWall({items:config.items.slice(0,2),groups:[config.groups[0]]}));
    const pair = make('div', 'ugc-message-pair');
    for (const part of [{title:config.groups[1].title,item:config.items[2]}, {title:config.system.title,item:config.system.item}]) {
      const section = make('section', 'ugc-message-panel');
      section.append(inlineHeading({title:part.title}), video(part.item).figure);
      pair.append(section);
    }
    wrap.append(pair); return wrap;
  };

  const motion = config => {
    const wrap = make('div', 'ugc-motion');
    const comparison = make('div', 'ugc-motion-comparison');
    const editor = make('div', 'ugc-code-document');
    const toolbar = make('div', 'ugc-code-toolbar');
    toolbar.append(make('span', '', 'components.css'), make('span', '', 'CSS / ORIGINAL PARAMETERS'));
    const pre = make('pre', '');
    const code = make('code', '', `.card-grid-loader {
  display: flex; gap: 12px;
  align-items: center; justify-content: center;
}
.card-grid-loader span {
  width: 12px; height: 12px;
  border-radius: 50%; background: #B99561;
  animation: card-grid-loader-bounce
    .8s ease-in-out infinite;
}
.card-grid-loader span:nth-child(2) { animation-delay: .12s; }
.card-grid-loader span:nth-child(3) { animation-delay: .24s; }
@keyframes card-grid-loader-bounce {
  0%, 70%, 100% {
    transform: translateY(0); opacity: .45;
  }
  35% {
    transform: translateY(-8px); opacity: 1;
  }
}`);
    pre.append(code); editor.append(toolbar, pre);

    const right = make('div', 'ugc-motion-right');
    const recording = video(config.items[0]); recording.caption.remove(); right.append(recording.figure);
    const demo = make('div', 'ugc-motion-demo');
    demo.append(make('span', 'ugc-eyebrow', 'LIVE PREVIEW / ORIGINAL SPEED'));
    const stage = make('div', 'ugc-loader-stage is-playing');
    const dots = make('div', 'ugc-loader'); dots.setAttribute('aria-hidden', 'true');
    for (let i=0;i<3;i++) dots.append(make('span',''));
    stage.append(dots);
    const toggle = make('button', 'ugc-motion-toggle'); toggle.type = 'button'; toggle.setAttribute('aria-pressed','true');
    const label = make('span', 'ugc-sr-only', 'Pause animation');
    toggle.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><g class="ugc-pause-icon"><rect x="6" y="5" width="4" height="14" rx="1.5"/><rect x="14" y="5" width="4" height="14" rx="1.5"/></g><path class="ugc-play-icon" d="M7 4.5Q7 3 9 4L20 10.5Q22 12 20 13.5L9 20Q7 21 7 19Z"/></svg>';
    toggle.append(label);
    toggle.addEventListener('click', () => {
      const playing = toggle.getAttribute('aria-pressed') !== 'true';
      toggle.setAttribute('aria-pressed', String(playing)); stage.classList.toggle('is-playing', playing);
      label.replaceChildren(document.createTextNode(playing ? 'Pause animation' : 'Play animation')); translate(toggle);
    });
    demo.append(stage, toggle);
    right.append(demo, notes(config.notes, 'ugc-motion-notes'));
    comparison.append(editor, right); wrap.append(comparison);
    return wrap;
  };

  const workflow = config => {
    const wrap = make('div', 'ugc-workflow');
    const panel = make('section', 'ugc-workflow-panel');
    panel.append(make('h5', 'ugc-subsection-tab ugc-panel-tab', config.boardTitle));
    const main = make('div', 'ugc-workflow-main ugc-paper-board');
    const body = make('div', 'ugc-workflow-body');
    const chart = make('figure', 'ugc-progress');
    chart.innerHTML = '<svg viewBox="0 0 620 270" role="img" aria-label="Prototype build process"><path d="M42 24V256H600" fill="none"/><path d="M42 256L155 94V256Z" fill="#9aaa63" opacity=".48"/><path d="M472 70L585 24V256H472Z" fill="#9aaa63" opacity=".48"/><path d="M155 94L472 70V256H155Z" fill="#a4afc8" opacity=".86"/><path d="M42 256L155 94" stroke-linecap="round" fill="none"/><path d="M155 94L472 70" stroke-linecap="round" fill="none"/><path d="M472 70L585 24" stroke-linecap="round" fill="none"/><path d="M42 94H155M155 94V256M472 70V256" stroke-dasharray="4 5" fill="none"/><circle cx="155" cy="94" r="7" fill="#7c88aa"/><circle cx="472" cy="70" r="7" fill="#7c88aa"/><text x="4" y="98">70%</text><text x="2" y="33">100%</text><text x="450" y="52">~80%</text></svg>';
    const groups = make('div', 'ugc-workflow-tool-groups');
    for (const stage of config.toolStages) {
      const group = make('section', 'ugc-workflow-tool-stage');
      group.append(make('span', 'ugc-workflow-range', stage.range), make('strong', 'ugc-workflow-tool-stage-title', stage.title), make('p', 'ugc-workflow-stage-copy', stage.body)); groups.append(group);
    }
    const tools = make('div', 'ugc-workflow-tools-row');
    for (const stage of [config.toolStages[0], config.toolStages[2]]) {
      const list = make('ul', 'ugc-workflow-tool-list');
      for (const tool of stage.tools) {
        const item = make('li', 'ugc-workflow-tool'); const icon = make('img', '');
        icon.src = versionProjectImageAsset(tool.iconFile); icon.alt = ''; icon.setAttribute('aria-hidden', 'true'); icon.width = 34; icon.height = 34;
        item.append(icon, make('span', '', tool.name)); list.append(item);
      }
      tools.append(list);
    }
    chart.append(groups, tools);
    body.append(chart, image(config.screens[0])); main.append(body); panel.append(main); wrap.append(panel);
    return wrap;
  };
  const visuals = (config, heading) => {
    const wrap = make('div', 'ugc-visual-gallery');
    const scene = make('div', 'ugc-visual-rain');
    if (heading) scene.append(heading);
    const field = make('div', 'ugc-rain-field');
    const rows = make('div', 'ugc-rain-rows');
    // Keep the main flows in the middle and repeat only the edge screens.
    const phoneRows = [
      {shift: 0, screens: [4, 7, 0, 12]},
      {shift: -.5, screens: [5, 3, 6, 8, 13]},
      {shift: 0, screens: [2, 10, 1, 14]},
      {shift: -.5, screens: [4, 15, 11, 9, 5]}
    ];
    const shown = new Set();
    for (const {shift, screens} of phoneRows) {
      const row = make('div', 'ugc-rain-row');
      row.style.setProperty('--ugc-row-shift', shift);
      for (const index of screens) {
        const item = config.phones[index];
        if (!item) continue;
        const phone = framedInputImage(item);
        if (shown.has(index)) phone.setAttribute('aria-hidden', 'true');
        shown.add(index);
        row.append(phone);
      }
      rows.append(row);
    }
    field.append(rows);
    const tv = make('div', 'ugc-rain-tv');
    tv.append(framedInputImage(config.hero));
    const pc = make('div', 'ugc-rain-pc');
    pc.append(framedInputImage(config.pc));
    scene.append(field, tv, pc);
    wrap.append(scene);
    if (config.overview) { const overview = image(config.overview, true); overview.classList.add('ugc-overview'); wrap.append(overview); }
    if (config.credits) wrap.append(make('p', 'ugc-visual-credits', config.credits));
    return wrap;
  };
  const compose = (block, config) => {
    const content = make('div', 'ugc-composition ugc-' + config.kind);
    const copy = block.querySelector('.project-content-copy');
    if (copy) {
      const tab = make('div', 'ugc-section-tab');
      const category = copy.querySelector(':scope > span');
      const title = copy.querySelector('h4');
      if (category) tab.append(category);
      if (title) tab.append(title);
      copy.prepend(tab);
    }
    if(config.journey) {
      block.classList.add('ugc-pc-story');
    }
    if(config.kind === 'definition') content.append(definition(config));
    if(config.kind === 'discovery') content.append(discovery(config));
    if(config.kind === 'participation') {
      const details = videoWall({items:config.detailDemos, groups:[{start:0, title:'Details at a glance'}]});
      content.append(details, carousel(config.items, {title:'Comment feedback'}));
    }
    if(config.kind === 'creation') content.append(creation(config));
    if(config.kind === 'social') content.append(social(config));
    if(config.kind === 'requirements') content.append(requirements(config));
    if(config.kind === 'device-inputs') content.append(inputMatrix(config));
    if(config.kind === 'device-actions') content.append(actionComparison(config));
    if(config.kind === 'motion') content.append(motion(config));
    if(config.kind === 'workflow') content.append(workflow(config));
    if(config.kind === 'visuals') content.append(visuals(config, copy));
    block.append(content);
  };

  window.renderAnimulaNookBlock = block => {
    const figure = make('figure', 'project-content-block project-content-text');
    figure.dataset.layout = block.layout || 'rail';
    figure.dataset.variant = block.variant;
    figure.append(projectBlockCopy(block));
    compose(figure, block.presentation);
    return [figure];
  };
})();
