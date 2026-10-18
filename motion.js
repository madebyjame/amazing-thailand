/* Finite entrance animations; no animation loop or scroll-position polling. */
(() => {
  'use strict';
  const seen = new WeakSet();
  const running = new Set();
  const ease = 'cubic-bezier(.22,1,.36,1)';
  const track = animation => {
    running.add(animation);
    animation.finished.catch(() => {}).finally(() => running.delete(animation));
    return animation;
  };
  const enter = (node, delay = 0, distance = 22, duration = 750) => {
    if (!node) return;
    track(node.animate([{ opacity: 0, transform: `translateY(${distance}px)` }, { opacity: 1, transform: 'translateY(0)' }], { duration, delay, easing: ease, fill: 'backwards' }));
  };
  function reveal(slide) {
    if (seen.has(slide)) return;
    seen.add(slide);
    slide.dataset.revealed = 'true';
    if (reduceMotion.matches) return;
    if (slide.id === 'intro') {
      slide.querySelectorAll('.hero-images img').forEach((img, n) => {
        track(img.animate([{ transform: 'scale(1.08)' }, { transform: 'scale(1)' }], { duration: 2400, delay: n * 100, easing: ease, fill: 'backwards' }));
      });
      enter(slide.querySelector('.slide-header'), 60, 12, 800);
      enter(slide.querySelector('.hero-story > .eyebrow'), 120, 16, 800);
      slide.querySelectorAll('.hero-line > span').forEach((line, n) => {
        track(line.animate([{ transform: 'translateY(110%)', opacity: .25 }, { transform: 'translateY(0)', opacity: 1 }], { duration: 1100, delay: 180 + n * 140, easing: ease, fill: 'backwards' }));
      });
      enter(slide.querySelector('.hero-description'), 480, 20, 900);
      slide.querySelectorAll('.hero-actions > *').forEach((action, n) => enter(action, 600 + n * 90, 18, 800));
      enter(slide.querySelector('.slide-footer'), 650, 12, 800);
    } else {
      const targets = slide.querySelectorAll('.slide-header, .chapter-tabs, .holiday-heading, .mood-card, .overview-story, .gallery-photo, .gallery-selectors button, .food-story, .stay-story, .finale-story, .finale-destinations, .slide-footer');
      targets.forEach((node, n) => enter(node, Math.min(n * 55, 280), node.matches('.gallery-photo') ? 10 : 18, 700));
    }
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { reveal(entry.target); observer.unobserve(entry.target); }
    });
  }, { threshold: .12, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('.slide').forEach(slide => observer.observe(slide));
  document.body.dataset.motion = reduceMotion.matches ? 'reduced' : 'ready';
  reduceMotion.addEventListener('change', event => {
    document.body.dataset.motion = event.matches ? 'reduced' : 'ready';
    if (event.matches) running.forEach(animation => animation.cancel());
  });

  // Smooth the native disclosure without making the reading content mandatory.
  document.querySelectorAll('.trip-details').forEach(details => {
    const summary = details.querySelector('summary');
    const content = details.querySelector('ol');
    let animation = null;
    summary.addEventListener('click', event => {
      if (reduceMotion.matches) return;
      event.preventDefault();
      const expanding = animation ? details.dataset.expanding !== 'true' : !details.open;
      const from = details.getBoundingClientRect().height;
      animation?.cancel();
      details.open = true;
      details.dataset.expanding = String(expanding);
      const style = getComputedStyle(details);
      const closedHeight = summary.offsetHeight + parseFloat(style.paddingTop) + parseFloat(style.paddingBottom) + parseFloat(style.borderTopWidth);
      const to = expanding ? details.scrollHeight : closedHeight;
      details.style.overflow = 'hidden';
      animation = details.animate([{ height: `${from}px` }, { height: `${to}px` }], { duration: 340, easing: ease });
      const currentAnimation = animation;
      animation.onfinish = () => {
        if (animation !== currentAnimation) return;
        details.open = expanding;
        details.style.overflow = '';
        animation = null;
      };
      if (expanding) enter(content, 40, 6, 300);
    });
    reduceMotion.addEventListener('change', event => {
      if (event.matches && animation) {
        animation.cancel(); animation = null;
        details.style.overflow = '';
      }
    });
  });
})();
