// Boot: contact wiring, navigation, gallery/lightbox, video, and GSAP motion.
import { CONFIG } from './config.js';
import { initBooking, waLink } from './booking.js';

const root = document.documentElement;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const $ = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];

root.classList.add('anim-ready');

/* ---------- Contact links ---------- */
const SOCIAL_ICONS = {
  facebook: '<path fill="currentColor" d="M13.5 21v-7.5H16l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H8v3h2.5V21h3Z"/>',
  linkedin: '<path fill="currentColor" d="M6.5 8.5h-3V20h3V8.5ZM5 4a1.75 1.75 0 1 0 0 3.5A1.75 1.75 0 0 0 5 4Zm15 9.3c0-3-1.6-4.9-4.1-4.9-1.4 0-2.4.7-2.9 1.5V8.5h-3V20h3v-6c0-1.5.7-2.6 2-2.6 1.2 0 2 .9 2 2.6v6h3v-6.7Z"/>',
  instagram: '<g fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".6" fill="currentColor"/></g>',
  youtube: '<path fill="currentColor" d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8c1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.3-1.6.4-3.2.4-4.8s-.1-3.2-.4-4.8ZM10 15V9l5.2 3L10 15Z"/>',
};

function initContactLinks() {
  const greeting = 'Hi Nayeem, I found your website and would like to ask about an electrical job.';
  $$('[data-wa]').forEach((a) => { a.href = waLink(greeting); a.target = '_blank'; a.rel = 'noopener'; });
  $$('[data-tel]').forEach((a) => { a.href = `tel:${CONFIG.phone}`; });
  $$('[data-mail]').forEach((a) => { a.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent('Electrical service enquiry')}`; });
  $$('[data-site]').forEach((a) => { a.href = CONFIG.website; });
  $$('[data-phone-label]').forEach((el) => { el.textContent = CONFIG.phoneDisplay; });
  $$('[data-email-label]').forEach((el) => { el.textContent = CONFIG.email; });
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  const list = $('[data-socials]');
  if (list) {
    list.innerHTML = Object.entries(CONFIG.social)
      .filter(([key, url]) => url && SOCIAL_ICONS[key])
      .map(([key, url]) => `<li><a href="${url}" target="_blank" rel="noopener" aria-label="${key}"><svg viewBox="0 0 24 24">${SOCIAL_ICONS[key]}</svg></a></li>`)
      .join('');
  }
}

/* ---------- Header & navigation ---------- */
function initHeader() {
  const header = $('.site-header');
  const burger = $('.burger');
  const menu = $('#mobile-menu');
  let lastY = window.scrollY;
  let menuOpen = false;

  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 24);
    if (!menuOpen) header.classList.toggle('is-hidden', y > 640 && y > lastY + 4);
    if (y < lastY - 4 || y < 640) header.classList.remove('is-hidden');
    lastY = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const setMenu = (open) => {
    menuOpen = open;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) header.classList.remove('is-hidden');
  };
  burger.addEventListener('click', () => setMenu(!menuOpen));
  $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menuOpen) { setMenu(false); burger.focus(); } });
  window.matchMedia('(min-width: 1025px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

  // Sliding indicator follows hover, rests on the active section.
  const nav = $('.nav');
  const indicator = $('.nav-indicator');
  const links = $$('.nav-list a');
  let active = null;
  const moveTo = (link) => {
    if (!link) { indicator.style.opacity = '0'; return; }
    const navBox = nav.getBoundingClientRect();
    const box = link.getBoundingClientRect();
    indicator.style.width = `${box.width}px`;
    indicator.style.transform = `translateX(${box.left - navBox.left}px)`;
    indicator.style.opacity = '1';
  };
  links.forEach((l) => l.addEventListener('mouseenter', () => moveTo(l)));
  nav.addEventListener('mouseleave', () => moveTo(active));
  window.addEventListener('resize', () => moveTo(active));

  const sections = links.map((l) => $(l.getAttribute('href'))).filter(Boolean);
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const link = links.find((l) => l.getAttribute('href') === `#${entry.target.id}`);
      links.forEach((l) => l.removeAttribute('aria-current'));
      if (link) link.setAttribute('aria-current', 'true');
      active = link || null;
      moveTo(active);
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => io.observe(s));
  // Clear indicator when back in the hero.
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { links.forEach((l) => l.removeAttribute('aria-current')); active = null; moveTo(null); }
  }, { rootMargin: '-45% 0px -50% 0px' }).observe($('#hero'));

  // WhatsApp FAB appears once the hero is out of view.
  const fab = $('.wa-fab');
  new IntersectionObserver(([e]) => fab.classList.toggle('is-visible', !e.isIntersecting), { threshold: 0.1 }).observe($('#hero'));
}

/* ---------- Work: filters + lightbox ---------- */
function initGallery() {
  const filters = $$('.filter');
  const items = $$('.g-item');
  filters.forEach((btn) => btn.addEventListener('click', () => {
    const cat = btn.dataset.filter;
    filters.forEach((b) => { const on = b === btn; b.classList.toggle('is-active', on); b.setAttribute('aria-pressed', String(on)); });
    items.forEach((item) => item.classList.toggle('is-hidden', cat !== 'all' && item.dataset.cat !== cat));
    if (window.gsap && !reduceMotion) {
      gsap.fromTo(items.filter((i) => !i.classList.contains('is-hidden')), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.04, ease: 'power3.out', overwrite: true });
    }
    window.ScrollTrigger?.refresh();
  }));

  const box = $('#lightbox');
  const img = $('img', box);
  const cap = $('figcaption', box);
  let list = [];
  let index = 0;
  let returnFocus = null;

  const show = (i) => {
    index = (i + list.length) % list.length;
    const t = list[index];
    img.src = t.dataset.lb;
    img.alt = $('img', t)?.alt || '';
    cap.textContent = t.dataset.cap || '';
  };
  const open = (trigger) => {
    list = $$('.lb-trigger').filter((t) => t.offsetParent !== null);
    returnFocus = trigger;
    box.hidden = false;
    document.body.style.overflow = 'hidden';
    show(list.indexOf(trigger));
    $('.lb-close', box).focus();
  };
  const close = () => {
    box.hidden = true;
    document.body.style.overflow = '';
    img.removeAttribute('src');
    returnFocus?.focus();
  };

  $$('.lb-trigger').forEach((t) => t.addEventListener('click', () => open(t)));
  $('.lb-close', box).addEventListener('click', close);
  $('.lb-prev', box).addEventListener('click', () => show(index - 1));
  $('.lb-next', box).addEventListener('click', () => show(index + 1));
  box.addEventListener('click', (e) => { if (e.target === box) close(); });
  document.addEventListener('keydown', (e) => {
    if (box.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
    if (e.key === 'Tab') { // keep focus inside the dialog
      const f = $$('button', box);
      const i = f.indexOf(document.activeElement);
      e.preventDefault();
      f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  });

  // Swipe on touch devices.
  let x0 = null;
  box.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  box.addEventListener('touchend', (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
    x0 = null;
  });
}

/* ---------- Video: play only in view ---------- */
function initVideo() {
  const wrap = $('.case-video');
  if (!wrap) return;
  const video = $('video', wrap);
  const btn = $('.video-toggle', wrap);
  let userPaused = false;

  const play = () => video.play().then(() => wrap.classList.add('is-playing')).catch(() => {});
  btn.addEventListener('click', () => { userPaused = false; play(); });
  video.addEventListener('click', () => {
    if (video.paused) { userPaused = false; play(); } else { userPaused = true; video.pause(); }
  });
  video.addEventListener('pause', () => wrap.classList.remove('is-playing'));
  video.addEventListener('play', () => wrap.classList.add('is-playing'));

  if (reduceMotion) return; // poster + play button only
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !userPaused) play();
    else if (!e.isIntersecting) video.pause();
  }, { threshold: 0.4 }).observe(wrap);
}

/* ---------- Micro-interactions ---------- */
function initInteractions() {
  // Team reel: duplicate items for a seamless loop.
  const reel = $('.reel-row');
  if (reel && !reduceMotion) {
    [...reel.children].forEach((li) => { const c = li.cloneNode(true); c.setAttribute('aria-hidden', 'true'); $('img', c).alt = ''; reel.appendChild(c); });
  }

  if (!finePointer || reduceMotion) return;

  $$('.svc').forEach((card) => card.addEventListener('pointermove', (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - r.left}px`);
    card.style.setProperty('--my', `${e.clientY - r.top}px`);
  }));

  $$('[data-magnetic]').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width / 2) * 0.25;
      const dy = (e.clientY - r.top - r.height / 2) * 0.35;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });

  const giant = $('.footer-giant');
  giant?.addEventListener('pointermove', (e) => {
    const r = giant.getBoundingClientRect();
    giant.style.setProperty('--fx', `${((e.clientX - r.left) / r.width) * 100 - 9}%`);
  });
}

/* ---------- Motion ---------- */
function staticStates() {
  root.classList.add('anim-off');
  $$('.breaker, .step').forEach((el) => el.classList.add('is-on'));
}

function initMotion() {
  const { gsap, ScrollTrigger } = window;
  if (reduceMotion || !gsap || !ScrollTrigger) { staticStates(); return; }
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: 'power3.out' });

  // Hero entrance
  const tl = gsap.timeline({ delay: 0.1 });
  // y:0 overrides the px offset GSAP parses from the CSS pre-hide transform.
  tl.fromTo('[data-hero-line]', { yPercent: 110, y: 0 }, { yPercent: 0, y: 0, duration: 1.1, stagger: 0.1, ease: 'power4.out' })
    .fromTo('[data-hero]', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.08 }, 0.25)
    .fromTo('.hv-portrait', { opacity: 0, y: 60, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 1.3, ease: 'expo.out' }, 0.15)
    .fromTo('.hv-card-a', { opacity: 0, y: 80, rotation: -16 }, { opacity: 1, y: 0, rotation: -6, duration: 1.2, ease: 'expo.out' }, 0.45)
    .fromTo('.hv-card-b', { opacity: 0, y: -60, rotation: 14 }, { opacity: 1, y: 0, rotation: 5, duration: 1.2, ease: 'expo.out' }, 0.55)
    .fromTo('[data-hero-chip]', { opacity: 0, scale: 0.7, y: 16 }, { opacity: 1, scale: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'back.out(2)' }, 0.85);

  // Gentle float for hero chips (desktop only, stops off-screen via ScrollTrigger below).
  const mm = gsap.matchMedia();

  // Current "spark" travelling along the hero wire.
  const path = $('#wirePath');
  const spark = $('.hero-wire .spark');
  if (path && spark) {
    const len = path.getTotalLength();
    const state = { p: 0 };
    const sparkTween = gsap.to(state, {
      p: 1, duration: 5.5, repeat: -1, ease: 'none', repeatDelay: 1.2,
      onUpdate() { const pt = path.getPointAtLength(state.p * len); spark.setAttribute('cx', pt.x); spark.setAttribute('cy', pt.y); spark.style.opacity = state.p < 0.03 || state.p > 0.97 ? 0 : 1; },
    });
    ScrollTrigger.create({ trigger: '#hero', start: 'top top', end: 'bottom top', onToggle: (s) => (s.isActive ? sparkTween.play() : sparkTween.pause()) });
  }

  // Generic reveals, batched for efficiency.
  const textTargets = $$('[data-reveal]:not([data-reveal="img"])');
  ScrollTrigger.batch(textTargets, {
    start: 'top 88%', once: true,
    onEnter: (batch) => gsap.fromTo(batch, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.08, overwrite: true }),
  });
  $$('[data-reveal="img"]').forEach((el) => {
    gsap.fromTo(el, { opacity: 0, clipPath: 'inset(18% 0% 18% 0% round 28px)', scale: 1.04 }, {
      opacity: 1, clipPath: 'inset(0% 0% 0% 0% round 28px)', scale: 1, duration: 1.4, ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      onComplete: () => gsap.set(el, { clearProps: 'clipPath' }),
    });
  });

  // Experience timeline line fills with scroll.
  const tlBar = $('.tl-progress span');
  if (tlBar) {
    gsap.fromTo(tlBar, { '--p': 0 }, { '--p': 1, ease: 'none', scrollTrigger: { trigger: '.timeline', start: 'top 70%', end: 'bottom 60%', scrub: 0.6 } });
  }

  // Process wire + step activation.
  const wire = $('.steps-wire span');
  if (wire) gsap.fromTo(wire, { '--p': 0 }, { '--p': 1, ease: 'none', scrollTrigger: { trigger: '.steps', start: 'top 75%', end: 'bottom 55%', scrub: 0.6 } });
  $$('.step').forEach((step) => ScrollTrigger.create({ trigger: step, start: 'top 72%', onEnter: () => step.classList.add('is-on'), onLeaveBack: () => step.classList.remove('is-on') }));

  // Breakers switch on one by one.
  $$('.breaker').forEach((b, i) => ScrollTrigger.create({ trigger: b, start: 'top 80%', once: true, onEnter: () => setTimeout(() => b.classList.add('is-on'), 180 + i * 40) }));

  // Parallax and float only where there is room for it.
  mm.add('(min-width: 900px)', () => {
    $$('[data-parallax]').forEach((img) => {
      const amt = parseFloat(img.dataset.parallax) || -6;
      gsap.fromTo(img, { yPercent: 0 }, { yPercent: amt, ease: 'none', scrollTrigger: { trigger: img.closest('section'), start: 'top top', end: 'bottom top', scrub: true } });
    });
    gsap.to('.hv-card-a', { y: -40, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hv-card-b', { y: 50, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });
    const floats = $$('[data-hero-chip]').map((chip, i) => gsap.to(chip, { y: i % 2 ? 8 : -8, duration: 2.6 + i * 0.4, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.6 }));
    ScrollTrigger.create({ trigger: '#hero', start: 'top top', end: 'bottom top', onToggle: (s) => floats.forEach((f) => (s.isActive ? f.play() : f.pause())) });
  });

  // Recalculate positions once images finish loading.
  window.addEventListener('load', () => ScrollTrigger.refresh());
}

initContactLinks();
initHeader();
initGallery();
initVideo();
initInteractions();
initBooking();
initMotion();
