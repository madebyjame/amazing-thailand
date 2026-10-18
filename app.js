/* THAI ESCAPE — plain JavaScript. No framework or build step required. */
'use strict';

// A fresh visit to the main URL starts at the introduction, rather than the
// browser's restored scroll position. Explicit province links still work.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

const { provinces, photos } = window.THAILAND_DATA;
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const pad = number => String(number).padStart(2, '0');
const chapters = ['ภาพรวม', 'สถานที่เที่ยว', 'กินอะไรดี', 'พักและวางแผน'];
const chapterIds = ['overview', 'places', 'food', 'stay'];
const totalSlides = 3 + provinces.length * chapterIds.length;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const desktop = matchMedia('(min-width: 1100px) and (min-height: 700px)');
const external = (url, label, className = '') => `<a href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer" class="${className}">${escapeHTML(label)}</a>`;
const mapURL = query => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
const photo = key => photos[key];
// Figma keeps Thai phrases separated by spaces together. Preserve those runs on
// the reference desktop canvas while allowing normal Thai wrapping on mobile.
const editorialText = value => String(value).split(/\s+/).map(run => `<span class="text-run">${escapeHTML(run)}</span>`).join(' ');

function image(key, className = '', eager = false, alt) {
  const p = photo(key);
  return `<img src="${p.src}" alt="${escapeHTML(alt || p.label)}" width="${p.width}" height="${p.height}" loading="${eager ? 'eager' : 'lazy'}" decoding="async" ${eager ? 'fetchpriority="high"' : ''} class="${className}">`;
}

function controls(index) {
  return `<div class="slide-controls flex items-center justify-end gap-3" aria-label="ควบคุมสไลด์"><span class="page-counter">${pad(index + 1)} / ${totalSlides}</span><button type="button" data-step="-1" aria-label="สไลด์ก่อนหน้า" ${index === 0 ? 'disabled' : ''}>↑</button><button type="button" data-step="1" aria-label="สไลด์ถัดไป" ${index === totalSlides - 1 ? 'disabled' : ''}>↓</button></div>`;
}

function themeStyle(p) {
  return Object.entries(p.theme).filter(([key]) => ['bg', 'ink', 'accent', 'muted'].includes(key)).map(([key, value]) => `--${key}:${value}`).join(';');
}

function tabs(p, chapter) {
  return `<nav class="chapter-tabs flex items-center gap-3" aria-label="หัวข้อจังหวัด${p.name}">${chapters.map((label, index) => `<a href="#${p.key}-${chapterIds[index]}" ${index === chapter ? 'aria-current="page"' : ''}>${label}</a>`).join('')}</nav>`;
}

function shell(p, provinceIndex, chapter, body, options = {}) {
  const index = 2 + provinceIndex * 4 + chapter;
  const cinematic = options.cinematic ? ' cinematic' : '';
  return `<section class="slide province-slide ${p.key} chapter-${chapter}${cinematic}" id="${p.key}-${chapterIds[chapter]}" data-province="${provinceIndex}" data-chapter="${chapter}" style="${themeStyle(p)}" aria-labelledby="title-${p.key}-${chapter}">
    ${options.cinematic ? `<div class="cinematic-background" aria-hidden="true">${image(p.overviewPhoto)}</div>` : ''}
    <header class="slide-header flex items-center justify-between gap-4"><span>${p.region} · ${p.theme.short}</span></header>
    ${tabs(p, chapter)}
    <div class="slide-body ${options.bodyClass || ''}">${body}</div>
    <footer class="slide-footer flex items-center justify-between gap-4">${controls(index)}</footer>
  </section>`;
}

function hero() {
  const keys = ['kanchanaburi-stay', 'krabi-ko-poda', 'ayutthaya-wat-phra-si-sanphet'];
  return `<section class="slide hero cinematic" id="intro" data-province="-1" data-chapter="-1" aria-labelledby="hero-title">
    <div class="hero-images" aria-hidden="true">${keys.map(key => image(key, '', true)).join('')}</div><div class="hero-shade" aria-hidden="true"></div>
    <header class="slide-header flex items-center justify-between gap-4"><span>AMAZING THAILAND</span></header>
    <div class="slide-body hero-body"><div class="hero-story flex flex-col items-start">
      <p class="eyebrow">6 ภาค · 6 จังหวัด</p>
      <h1 id="hero-title">วันหยุดนี้<br>เมืองไทยมีเรื่องให้เล่า</h1>
      <p class="hero-description">หาทริปที่ใช่ ในวันหยุดของคุณ</p>
      <div class="hero-actions flex flex-wrap gap-4"><a href="#holiday" class="button button-light">หาวันหยุดที่ใช่ ↗</a><a href="#chiang-mai-overview" class="button button-outline">สำรวจ 6 จังหวัด ↓</a></div>
    </div></div>
    <footer class="slide-footer flex items-center justify-between gap-4">${controls(0)}</footer>
  </section>`;
}

function holiday() {
  const options = [
    { title: 'อยากพักใจ', destination: 'เชียงใหม่', index: 0, image: 'chiang-mai-mae-kampong', alternative: 'หรือกาญจนบุรี / กระบี่' },
    { title: 'อยากกินให้คุ้ม', destination: 'จันทบุรี', index: 3, image: 'chanthaburi-food', alternative: 'หรือบุรีรัมย์ / อยุธยา' },
    { title: 'อยากเที่ยวมีเรื่องเล่า', destination: 'อยุธยา', index: 2, image: 'ayutthaya-wat-phra-si-sanphet', alternative: 'หรือเชียงใหม่ / บุรีรัมย์' }
  ];
  return `<section class="slide holiday" id="holiday" data-province="-1" data-chapter="-1" aria-labelledby="holiday-title">
    <header class="slide-header flex items-center justify-between gap-4"><span>เลือกทริปวันหยุด</span></header>
    <div class="slide-body holiday-body"><div class="holiday-heading"><h2 id="holiday-title">วันหยุดนี้ อยากรู้สึกแบบไหน</h2></div>
      <div class="mood-grid grid grid-cols-3">${options.map(o => `<a class="mood-card group" href="#${provinces[o.index].key}-overview"><figure>${image(o.image)}<figcaption><h3>${o.title}</h3><span>${o.destination} · ${provinces[o.index].tripDays} ↗</span></figcaption></figure></a>`).join('')}</div>
    </div><footer class="slide-footer flex items-center justify-between gap-4">${controls(1)}</footer>
  </section>`;
}

function overview(p, index) {
  const cinematic = true;
  const body = `<div class="overview-story"><h2 id="title-${p.key}-0">${p.theme.short}</h2><p class="province-hook">${p.theme.hook}</p><p class="province-overview">${editorialText(p.overview)}</p></div>`;
  return shell(p, index, 0, body, { cinematic, bodyClass: 'overview-body', keys: [p.overviewPhoto] });
}

const shortName = value => ({ 'อาสนวิหารพระนางมารีอาปฏิสนธินิรมล': 'อาสนวิหารจันทบุรี', 'อุทยานประวัติศาสตร์พนมรุ้ง': 'พนมรุ้ง', 'อุทยานประวัติศาสตร์เมืองสิงห์': 'ปราสาทเมืองสิงห์' }[value] || value);

function galleryCaption(p, index) {
  const place = p.attractions[index];
  return `<div class="gallery-title-row flex items-start justify-between gap-3"><h3>${place.name}</h3>${external(mapURL(`${place.name} ${p.name}`), 'ดูแผนที่ ↗', 'map-link')}</div><p class="gallery-description">${editorialText(place.description)}</p>`;
}

function attractions(p, index) {
  const selected = p.defaultPlace;
  const layout = p.theme.layout;
  const body = `<h2 class="sr-only" id="title-${p.key}-1">4 สถานที่เที่ยว${p.name}</h2><div class="gallery gallery-${layout}" data-gallery="${index}"><figure class="gallery-photo">${image(p.galleryPhotos[selected], 'gallery-image')}<figcaption class="gallery-caption" aria-live="polite" aria-atomic="true">${galleryCaption(p, selected)}</figcaption></figure><div class="gallery-selectors" role="group" aria-label="เลือกสถานที่เที่ยว${p.name}">${p.attractions.map((place, n) => `<button type="button" data-place="${n}" aria-pressed="${n === selected}" aria-label="ชม${place.name}"><span class="place-number">${pad(n + 1)}</span><span class="place-name">${shortName(place.name)}</span><i aria-hidden="true"></i></button>`).join('')}</div></div>`;
  return shell(p, index, 1, body, { bodyClass: 'gallery-body' });
}

function food(p, index) {
  const headings = ['กินให้ถึงถิ่น', 'กินให้ถึงถิ่น', 'มื้ออร่อย<br>ริมแม่น้ำ', 'รสเมืองจันท์', 'กินให้ถึงถิ่น', 'รสจัด<br>จากครัวใต้'];
  const label = index === 1 ? 'ภาพประกอบลูกชิ้นไทย' : index === 4 ? 'ภาพประกอบอาหารปลาแม่น้ำ' : `ภาพประกอบอาหาร / ${photo(p.foodPhoto).label}`;
  const body = `<figure class="editorial-photo food-photo">${image(p.foodPhoto)}<figcaption>ภาพประกอบอาหาร</figcaption></figure><div class="food-story" data-native-scroll><h2 id="title-${p.key}-2">${headings[index]}</h2><div class="dish-list flex flex-col">${p.foods.map(dish => `<article><h3>${dish.name}</h3><p>${editorialText(dish.description)}</p></article>`).join('')}</div></div>`;
  return shell(p, index, 2, body, { bodyClass: 'food-body', keys: [p.foodPhoto] });
}

function stayAreas(p) {
  return p.stays.map(area => `<article class="stay-area"><h3>${area.name}</h3><p>${editorialText(area.description)}</p></article>`).join('');
}

function itinerary(p) {
  return `<details class="itinerary trip-details"><summary>แผนเที่ยว ${p.tripDays}<span aria-hidden="true">+</span></summary><ol>${p.itinerary.map(day => `<li><span class="day-label">${day.day}</span><p>${editorialText(day.plan)}</p></li>`).join('')}</ol></details>`;
}

function stays(p, index) {
  const body = `<figure class="editorial-photo stay-photo">${image(p.stayPhoto)}<figcaption>บรรยากาศย่านพัก</figcaption></figure><div class="stay-story" data-native-scroll><h2 id="title-${p.key}-3">พักให้ตรงจังหวะคุณ</h2><div class="stay-areas">${stayAreas(p)}</div>${itinerary(p)}</div>`;
  return shell(p, index, 3, body, { bodyClass: 'stay-body', keys: [p.stayPhoto] });
}

function finale() {
  return `<section class="slide finale cinematic" id="next-journey" data-province="-1" data-chapter="-1" aria-labelledby="finale-title">
    <div class="finale-background" aria-hidden="true">${image('chanthaburi-noen-nangphaya')}</div>
    <header class="slide-header"><span>THAI ESCAPE · AMAZING THAILAND</span></header>
    <div class="slide-body finale-body">
      <div class="finale-story">
        <p class="eyebrow">1 ภาค 1 จังหวัด ไม่ไปไม่รู้</p>
        <h2 id="finale-title">วันหยุดหน้า<br><span>เจอกันที่ไหนดี</span></h2>
        <p class="finale-description">ยังมีอีกหลายเรื่องราว รอให้คุณออกไปเจอ</p>
        <div class="finale-actions"><a class="button button-light" href="#holiday">เลือกทริปอีกครั้ง ↗</a><a class="finale-home" href="#intro">กลับหน้าแรก ↑</a></div>
      </div>
      <nav class="finale-destinations" aria-label="กลับไปสำรวจ 6 จังหวัด">${provinces.map((p, i) => `<a href="#${p.key}-overview"><span class="finale-number">${pad(i + 1)}</span><span><small>${p.region}</small><strong>${p.theme.short}</strong></span><span class="finale-arrow" aria-hidden="true">↗</span></a>`).join('')}</nav>
    </div>
    <footer class="slide-footer finale-footer"><div class="finale-footer-info"><span class="finale-signature">THAI ESCAPE</span><span class="finale-tagline">ออกไปพบเรื่องราวใหม่ ในเมืองไทย</span></div>${controls(totalSlides - 1)}</footer>
  </section>`;
}

$('#journey').innerHTML = hero() + holiday() + provinces.map((p, index) => overview(p, index) + attractions(p, index) + food(p, index) + stays(p, index)).join('') + finale();
$('#province-nav').innerHTML = provinces.map((p, index) => `<a href="#${p.key}-overview" class="province-link flex items-center" data-province-link="${index}"><span class="nav-number">${pad(index + 1)}</span><span class="nav-place"><span>${p.theme.short}</span><small>${p.region}</small></span></a>`).join('');

const slides = $$('.slide');
let current = 0;
let lockedUntil = 0;
let pendingTarget = null;
let pendingTimer;
let pendingFocus = false;
let wheelSum = 0;
let lastWheelTime = 0;
let scrollFrame = null;

function sync(index, updateHash = true) {
  if (pendingTarget !== null && index !== pendingTarget) return;
  const slide = slides[index];
  if (!slide) return;
  current = index;
  const p = Number(slide.dataset.province);
  const chapter = Number(slide.dataset.chapter);
  $$('.province-link').forEach((link, n) => { if (n === p) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current'); });
  const theme = p >= 0 ? provinces[p].theme : provinces[index === 0 ? 1 : 0].theme;
  document.documentElement.style.setProperty('--active-accent', theme.accent);
  document.body.dataset.current = slide.id;
  document.body.classList.toggle('on-cinematic', slide.classList.contains('cinematic'));
  $('#chapter-status').textContent = p >= 0 ? `${provinces[p].name} / ${pad(chapter + 1)} จาก 04` : slide.id === 'next-journey' ? 'วันหยุดหน้า ไปไหนดี' : '6 จังหวัด / 24 เรื่องราว';
  $$('.chapter-progress i').forEach((bar, n) => bar.classList.toggle('is-active', chapter === n));
  $('#live-status').textContent = p >= 0 ? `${provinces[p].name} · ${chapters[chapter]} · ${index + 1} จาก ${totalSlides}` : index === 0 ? 'เริ่มต้นวันหยุด' : slide.id === 'next-journey' ? 'จบทริป · เลือกจุดหมายสำหรับวันหยุดหน้า' : 'เลือกวันหยุดในแบบของคุณ';
  if (updateHash && location.hash !== `#${slide.id}`) history.replaceState(null, '', `#${slide.id}`);
}

function finishNavigation() {
  if (pendingTarget === null) return;
  const target = pendingTarget;
  const focus = pendingFocus;
  clearTimeout(pendingTimer);
  pendingTarget = null;
  pendingFocus = false;
  sync(target);
  if (focus) {
    slides[target].tabIndex = -1;
    slides[target].focus({ preventScroll: true });
  }
}

function goTo(index, immediate = false, focus = false) {
  const target = Math.max(0, Math.min(slides.length - 1, index));
  pendingTarget = target;
  pendingFocus = focus;
  clearTimeout(pendingTimer);
  const instant = immediate || reduceMotion.matches || Math.abs(target - current) > 1;
  lockedUntil = performance.now() + (instant ? 150 : 850);
  sync(target);
  const top = slides[target].offsetTop;
  window.scrollTo({ top, behavior: instant ? 'instant' : 'smooth' });
  pendingTimer = setTimeout(finishNavigation, instant ? 60 : 900);
  closeMenu();
}

function indexAtViewport() {
  const y = innerHeight * 0.35;
  return Math.max(0, slides.findIndex(slide => { const r = slide.getBoundingClientRect(); return r.top <= y && r.bottom > y; }));
}

addEventListener('scroll', () => {
  if (scrollFrame) return;
  scrollFrame = requestAnimationFrame(() => {
    scrollFrame = null;
    const index = indexAtViewport();
    if (pendingTarget === index && Math.abs(slides[index].getBoundingClientRect().top) < 3) finishNavigation();
    if (index !== current) sync(index);
  });
}, { passive: true });

document.addEventListener('click', event => {
  const step = event.target.closest('[data-step]');
  if (step) { const slideIndex = slides.indexOf(step.closest('.slide')); goTo(slideIndex + Number(step.dataset.step), false, true); return; }
  const anchor = event.target.closest('a[href^="#"]');
  if (anchor) {
    const target = document.getElementById(anchor.getAttribute('href').slice(1));
    if (target?.classList.contains('slide')) { event.preventDefault(); goTo(slides.indexOf(target), false, true); }
  }
});

$$('[data-gallery]').forEach(gallery => {
  const p = provinces[Number(gallery.dataset.gallery)];
  let currentPlace = p.defaultPlace;
  let requestId = 0;
  gallery.addEventListener('click', async event => {
    const button = event.target.closest('[data-place]');
    if (!button) return;
    const next = Number(button.dataset.place);
    if (next === currentPlace) return;
    currentPlace = next;
    const id = ++requestId;
    $$('[data-place]', gallery).forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.place) === next)));
    const img = $('.gallery-image', gallery);
    const asset = photo(p.galleryPhotos[next]);
    const preload = new Image(); preload.src = asset.src;
    try { await preload.decode(); } catch { /* The image element reports any final network error. */ }
    if (id !== requestId) return;
    if (!reduceMotion.matches && img.animate) img.animate([{ opacity: 0.3, transform: 'scale(1.025)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 380, easing: 'ease-out' });
    img.src = asset.src; img.alt = p.attractions[next].name; img.width = asset.width; img.height = asset.height;
    $('.gallery-caption', gallery).innerHTML = galleryCaption(p, next);
  });
});

addEventListener('wheel', event => {
  if (!desktop.matches || document.body.classList.contains('menu-open') || event.ctrlKey || event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
  if (event.target.closest('.sidebar, .chapter-tabs, [data-native-scroll]')) return;
  const slide = slides[current];
  if (slide.scrollHeight > innerHeight + 5) return;
  if ((current === 0 && event.deltaY < 0) || (current === slides.length - 1 && event.deltaY > 0)) return;
  event.preventDefault();
  const now = performance.now();
  if (now < lockedUntil) { wheelSum = 0; lastWheelTime = now; return; }
  if (now - lastWheelTime > 180) wheelSum = 0;
  lastWheelTime = now;
  wheelSum += event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
  if (Math.abs(wheelSum) >= 35) { const direction = Math.sign(wheelSum); wheelSum = 0; goTo(current + direction); }
}, { passive: false });

addEventListener('keydown', event => {
  if (event.target.closest('a, button, input, select, textarea, [contenteditable]')) return;
  if (!['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) return;
  if (!desktop.matches && !['Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  if (performance.now() < lockedUntil) return;
  const target = event.key === 'Home' ? 0 : event.key === 'End' ? slides.length - 1 : current + (['ArrowUp', 'PageUp'].includes(event.key) || event.shiftKey ? -1 : 1);
  goTo(target);
});

let menuOpener = null;
function closeMenu(restoreFocus = false) {
  const wasOpen = document.body.classList.contains('menu-open');
  document.body.classList.remove('menu-open');
  $('#province-panel').inert = true;
  $('.nav-launcher').inert = false;
  $$('#menu-toggle, #desktop-menu-toggle').forEach(button => {
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-label', 'เปิดเมนูจังหวัด');
  });
  if (restoreFocus && wasOpen && menuOpener) menuOpener.focus({ preventScroll: true });
}

$$('#menu-toggle, #desktop-menu-toggle').forEach(button => button.addEventListener('click', () => {
  if (document.body.classList.contains('menu-open')) { closeMenu(true); return; }
  menuOpener = button;
  $('#province-panel').inert = false;
  $('.nav-launcher').inert = true;
  document.body.classList.add('menu-open');
  $$('#menu-toggle, #desktop-menu-toggle').forEach(control => {
    control.setAttribute('aria-expanded', 'true');
    control.setAttribute('aria-label', 'ปิดเมนูจังหวัด');
  });
  requestAnimationFrame(() => {
    if (document.body.classList.contains('menu-open')) ($('.province-link[aria-current]') || $('.province-link')).focus({ preventScroll: true });
  });
}));
$('#close-menu').addEventListener('click', () => closeMenu(true));
$('#province-panel').addEventListener('focusout', event => {
  if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget) && !event.relatedTarget.closest('#menu-toggle, #desktop-menu-toggle')) closeMenu();
});
matchMedia('(max-width: 1023px)').addEventListener('change', event => {
  closeMenu();
});
addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(true); });
document.addEventListener('click', event => {
  if (document.body.classList.contains('menu-open') && !event.target.closest('.sidebar, .mobile-bar, .nav-launcher')) closeMenu();
});

addEventListener('hashchange', () => { const index = slides.findIndex(s => `#${s.id}` === location.hash); if (index >= 0) goTo(index, true); });
addEventListener('pageshow', () => { const index = slides.findIndex(s => `#${s.id}` === location.hash); goTo(Math.max(0, index), true); });
sync(Math.max(0, slides.findIndex(s => `#${s.id}` === location.hash)), false);
