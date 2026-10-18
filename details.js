/* Optional reading slides in from the left, without a modal or backdrop. */
(() => {
  'use strict';
  const panel = document.getElementById('travel-details');
  const content = document.getElementById('travel-content');
  const closeButton = panel.querySelector('.travel-close');
  const labels = { overview: 'รู้จักจังหวัด', places: 'สถานที่เที่ยว', food: 'อาหารท้องถิ่น', stay: 'พักและวางแผน' };
  let opener = null;
  let activeProvince = null;
  let activePlace = 0;
  let closing = false;
  let panelAnimation = null;
  let transitionId = 0;
  let rendering = false;

  function slidePanel(opening) {
    const from = getComputedStyle(panel).transform;
    panelAnimation?.cancel();
    const to = opening ? 'translateX(0)' : 'translateX(-102%)';
    panel.style.transform = to;
    if (reduceMotion.matches) return Promise.resolve();
    panelAnimation = panel.animate([{ transform: from }, { transform: to }], {
      duration: opening ? 640 : 460,
      easing: opening ? 'cubic-bezier(.22,1,.36,1)' : 'cubic-bezier(.4,0,.2,1)'
    });
    return panelAnimation.finished.catch(() => {});
  }

  const paragraph = text => `<p>${escapeHTML(text)}</p>`;
  const list = items => `<div class="reading-list">${items.map(item => `<article><h3>${escapeHTML(item.name)}</h3>${paragraph(item.description)}</article>`).join('')}</div>`;
  const plan = p => `<section class="reading-section"><h3>ไอเดียทริป ${escapeHTML(p.tripDays)}</h3><ol class="reading-plan">${p.itinerary.map(day => `<li><span>${escapeHTML(day.day)}</span>${paragraph(day.plan)}</li>`).join('')}</ol></section>`;
  const placeButtons = (p, selected) => `<div class="reading-places" role="group" aria-label="เลือกอ่านสถานที่เพิ่มเติม">${p.attractions.map((place, n) => `<button type="button" data-detail-place="${n}" aria-pressed="${n === selected}"><span>${pad(n + 1)}</span>${escapeHTML(shortName(place.name))}<span aria-hidden="true">↗</span></button>`).join('')}</div>`;

  function render(p, type, placeIndex = 0) {
    rendering = true;
    const guide = window.THAILAND_GUIDES[p.key];
    activeProvince = p;
    activePlace = Math.max(0, Math.min(p.attractions.length - 1, placeIndex));
    const place = p.attractions[activePlace];
    const titles = { overview: `${p.name} ในจังหวะของคุณ`, places: place.name, food: `รสชาติของ${p.theme.short}`, stay: `พัก${p.theme.short}ให้เข้ากับทริป` };
    const leads = { overview: p.overview, places: place.description, food: guide.food, stay: guide.stay };
    const images = { overview: p.overviewPhoto, places: p.galleryPhotos[activePlace], food: p.foodPhoto, stay: p.stayPhoto };
    let story;
    if (type === 'overview') {
      story = `${paragraph(guide.intro)}<section class="reading-section"><h3>วางจังหวะวันหยุด</h3>${paragraph(guide.planning)}</section><section class="reading-section"><h3>4 จุดหมายที่อยากชวนไป</h3>${placeButtons(p, -1)}</section><section class="reading-callout"><h3>ไอเดียก่อนออกเดินทาง</h3><ul>${guide.tips.map(tip => `<li>${escapeHTML(tip)}</li>`).join('')}</ul></section>`;
    } else if (type === 'places') {
      story = `${paragraph(guide.places[activePlace].story)}<section class="reading-callout"><h3>เที่ยวให้เข้ากับทริป</h3>${paragraph(guide.places[activePlace].tip)}</section>${external(mapURL(`${place.name} ${p.name}`), 'เปิดตำแหน่งใน Google Maps ↗', 'reading-map')}<section class="reading-section"><h3>อีกมุมของ${p.theme.short}</h3>${placeButtons(p, activePlace)}</section>`;
    } else if (type === 'food') {
      story = `${list(p.foods)}<section class="reading-callout"><h3>ให้มื้ออาหารเป็นส่วนหนึ่งของทริป</h3>${paragraph('เลือกหนึ่งเมนูที่อยากลองเป็นหลักของแต่ละมื้อ แล้วเผื่อเวลาเดินชิมระหว่างเที่ยว ลองสั่งมาแบ่งกันเพื่อได้รู้จักหลายรสชาติ โดยไม่ต้องรีบกินให้ครบในครั้งเดียว')}</section>`;
    } else {
      story = `${list(p.stays)}<section class="reading-callout"><h3>เลือกทำเลก่อนเลือกห้อง</h3>${paragraph(guide.planning)}</section>${plan(p)}`;
    }
    content.innerHTML = `<figure class="reading-photo">${image(images[type], '', true, type === 'places' ? place.name : undefined)}<span>${escapeHTML(p.region)} · ${escapeHTML(p.tripDays)}</span></figure><div class="reading-content"><header class="reading-header"><p class="reading-kicker">${escapeHTML(labels[type])} / ${escapeHTML(p.theme.short)}</p><h2 id="travel-title" tabindex="-1">${escapeHTML(titles[type])}</h2><p class="reading-lead">${escapeHTML(leads[type])}</p></header><nav class="reading-nav" aria-label="หัวข้ออ่านเพิ่มเติม">${Object.entries(labels).map(([key, label]) => `<button type="button" data-detail-tab="${key}" aria-pressed="${type === key}">${label}</button>`).join('')}</nav><article class="reading-article">${story}</article><button type="button" class="reading-done" data-close-reading>กลับไปเที่ยวต่อ <span aria-hidden="true">↙</span></button></div>`;
    content.scrollTo({ top: 0, behavior: 'instant' });
    queueMicrotask(() => { rendering = false; });
  }

  async function openReading(button) {
    const p = provinces.find(province => province.key === button.dataset.readMore);
    const type = button.dataset.detailType;
    if (!p || !Object.hasOwn(labels, type)) return;
    const ticket = ++transitionId;
    closing = false;
    opener?.setAttribute('aria-expanded', 'false');
    opener = button;
    closeMenu();
    const chosen = document.querySelector(`#${p.key}-places [data-place][aria-pressed="true"]`);
    render(p, type, Number(chosen?.dataset.place || 0));
    panel.hidden = false;
    panel.inert = false;
    panel.setAttribute('aria-hidden', 'false');
    panel.dataset.state = 'opening';
    button.setAttribute('aria-expanded', 'true');
    document.body.classList.add('reading-open');
    content.querySelector('#travel-title').focus({ preventScroll: true });
    await slidePanel(true);
    if (ticket === transitionId) panel.dataset.state = 'open';
  }

  async function closeReading(restoreFocus = true) {
    if (closing || panel.hidden) return;
    const ticket = ++transitionId;
    const returnTo = opener;
    closing = true;
    panel.dataset.state = 'closing';
    panel.inert = true;
    returnTo?.setAttribute('aria-expanded', 'false');
    await slidePanel(false);
    if (ticket !== transitionId) return;
    panel.hidden = true;
    panel.setAttribute('aria-hidden', 'true');
    panel.dataset.state = 'closed';
    document.body.classList.remove('reading-open');
    closing = false;
    if (restoreFocus) returnTo?.focus({ preventScroll: true });
  }

  document.addEventListener('click', event => {
    const button = event.target.closest('[data-read-more]');
    if (button) { openReading(button); return; }
    // Switching topics replaces the clicked node; retain the original event path.
    if (!panel.hidden && !event.composedPath().includes(panel)) closeReading(false);
  });
  closeButton.addEventListener('click', () => closeReading());
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !panel.hidden) { event.preventDefault(); closeReading(); }
  });
  panel.addEventListener('focusout', event => {
    if (rendering || closing) return;
    if (event.relatedTarget && !panel.contains(event.relatedTarget) && !event.relatedTarget.closest('[data-read-more]')) closeReading(false);
  });
  reduceMotion.addEventListener('change', event => {
    if (event.matches && panelAnimation?.playState === 'running') panelAnimation.finish();
  });
  panel.addEventListener('click', event => {
    if (closing) return;
    const tab = event.target.closest('[data-detail-tab]');
    const place = event.target.closest('[data-detail-place]');
    if (tab || place) {
      const type = tab ? tab.dataset.detailTab : 'places';
      const selected = place ? Number(place.dataset.detailPlace) : activePlace;
      render(activeProvince, type, selected);
      const target = tab ? content.querySelector(`[data-detail-tab="${type}"]`) : content.querySelector(`[data-detail-place="${selected}"]`);
      target?.focus({ preventScroll: true });
      if (!reduceMotion.matches) content.querySelector('.reading-content').animate([{ opacity: .3, transform: 'translateX(-12px)' }, { opacity: 1, transform: 'translateX(0)' }], { duration: 350, easing: 'ease-out' });
    }
    if (event.target.closest('[data-close-reading]')) closeReading();
  });
})();
