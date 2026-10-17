/* Salomé Bistrô — Mobile Motion Revolution v3.0
   Experiência touch-only; preserva o Hero scrub de hero-v2.js, desktop e acesso sem JS.
   Uma única RAF por evento de scroll, sem ticker permanente. */
(() => {
  'use strict';
  const mobile = matchMedia('(max-width: 650px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const saveData = !!navigator.connection?.saveData;
  const weakDevice = (navigator.deviceMemory || 8) <= 2 || saveData;
  const lowPower = weakDevice;
  const doc = document, root = doc.documentElement;
  const q = (s, context = doc) => context?.querySelector(s);
  const qa = (s, context = doc) => [...(context?.querySelectorAll(s) || [])];
  const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
  const ease = 'cubic-bezier(.16,1,.3,1)';
  const cinematic = 'cubic-bezier(.76,0,.24,1)';
  const state = { edition: '3.0.0', enabled: false, heroReplays: 0, headings: 0, photos: 0, menuBatches: 0, galleryOpens: 0, swipes: 0, scrollFrames: 0, reduced: reduced.matches, lowPower };
  window.SalomeMobileMotion = state;
  let started = false, dispose = [], active = new Set();
  const cleanup = fn => { dispose.push(fn); return fn; };
  const listen = (el, type, fn, opt) => { el?.addEventListener(type, fn, opt); cleanup(() => el?.removeEventListener(type, fn, opt)); };
  const play = (el, frames, opts = {}) => {
    if (!el?.animate || reduced.matches || !mobile.matches || document.hidden) return null;
    const a = el.animate(frames, { duration: 850, easing: ease, ...opts });
    active.add(a);
    a.finished.catch(() => {}).finally(() => { active.delete(a); try { a.cancel(); } catch (_) {} });
    return a;
  };
  // Representa cada linha num wrapper sem mudar o texto, a ordem de leitura nem as ênfases.
  function splitLines(el) {
    if (!el || el.dataset.mmSplit) return qa('.mm-line-inner', el);
    el.dataset.mmSplit = 'true'; el.dataset.mmOriginal = el.innerHTML;
    const groups = [[]];
    [...el.childNodes].forEach(node => { if (node.nodeName === 'BR') groups.push([]); else groups.at(-1).push(node); });
    if (groups.length < 2) return [];
    const frag = doc.createDocumentFragment();
    groups.forEach((nodes, i) => {
      const mask = doc.createElement('span'), inside = doc.createElement('span');
      mask.className = 'mm-line-mask'; inside.className = 'mm-line-inner';
      nodes.forEach(n => inside.append(n)); mask.append(inside); frag.append(mask);
    });
    el.replaceChildren(frag);
    return qa('.mm-line-inner', el);
  }
  const single = new WeakSet();
  const onceWhenVisible = (el, fn, threshold = .12) => {
    if (!el || single.has(el)) return;
    single.add(el);
    if (!('IntersectionObserver' in window)) { fn(); return; }
    const io = new IntersectionObserver(entries => {
      if (!entries.some(e => e.isIntersecting)) return;
      io.disconnect(); fn();
    }, { threshold, rootMargin: '0px 0px -7% 0px' });
    io.observe(el); cleanup(() => io.disconnect());
  };
  function rise(el, idx = 0, distance = 42, delay = 0) {
    return play(el, [
      { opacity: .02, transform: `translate3d(0,${distance}px,0) rotateX(5deg)` },
      { opacity: 1, transform: 'translate3d(0,-3px,0) rotateX(0deg)', offset: .84 },
      { opacity: 1, transform: 'none' }
    ], { duration: lowPower ? 520 : 890, delay: delay + idx * (lowPower ? 45 : 92) });
  }
  function reveal(el, i = 0, from = 'bottom') {
    if (!el) return;
    const inset = from === 'left' ? 'inset(0 100% 0 0)' : 'inset(100% 0 0 0)';
    state.photos++;
    play(el, [
      { clipPath: inset, opacity: .65, transform: `translate3d(0,${from === 'left' ? 0 : 50}px,0) scale(.95)` },
      { clipPath: 'inset(0 0 0 0)', opacity: 1, transform: 'none' }
    ], { duration: lowPower ? 580 : 1150, delay: i * 130, easing: cinematic });
  }
  function heading(selector) {
    const el = q(selector); if (!el) return;
    const lines = splitLines(el);
    onceWhenVisible(el, () => {
      state.headings++;
      if (lines.length) lines.forEach((line, idx) => play(line, [
        { transform: 'translate3d(0,108%,0) skewY(6deg) rotate(-2deg)', opacity: .1 },
        { transform: 'translate3d(0,-5%,0) skewY(-1deg)', opacity: 1, offset: .79 },
        { transform: 'none', opacity: 1 }
      ], { duration: lowPower ? 610 : 1040, delay: idx * 155 }));
      else rise(el);
    }, .16);
  }
  function hero() {
    const stage = q('.hero-v3'), title = q('#hero-title'); if (!stage || !title) return;
    const lines = splitLines(title);
    const ornaments = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
    ornaments.setAttribute('viewBox', '0 0 340 82'); ornaments.setAttribute('aria-hidden', 'true');
    ornaments.classList.add('mm-hero-ornament');
    ornaments.innerHTML = '<path d="M3 76 V30 Q3 3 30 3 H136 M337 76 V30 Q337 3 310 3 H204 M146 3 h48 M170 18 l7 7 -7 7 -7 -7 Z" fill="none" stroke="currentColor" stroke-width="1.2" />';
    stage.append(ornaments);
    cleanup(() => ornaments.remove());
    const stroke = q('path', ornaments);
    const duration = lowPower ? 620 : 1300;
    function intro() {
      if (!mobile.matches || reduced.matches || document.hidden) return;
      state.heroReplays++;
      play(stroke, [{ strokeDasharray: '620', strokeDashoffset: 620, opacity: .2 }, { strokeDasharray: '620', strokeDashoffset: 0, opacity: .8 }], { duration, easing: cinematic });
      if (lines.length) lines.forEach((line, i) => play(line, [
        { transform: `translate3d(${i ? 15 : -15}px,103%,0) skewY(${i ? -5 : 5}deg)`, opacity: .1 },
        { transform: 'translate3d(0,0,0) skewY(0)', opacity: 1 }
      ], { duration: lowPower ? 650 : 1100, delay: 160 + i * 200 }));
      qa('.hero-strap,.hero-description,.hero-buttons>a', stage).forEach((el, i) => rise(el, i, 22, 280));
      // Máscara sobreposta: não toca no transform da foto controlado por hero-v2.js.
      const beam = doc.createElement('div'); beam.className = 'mm-hero-beam'; beam.setAttribute('aria-hidden', 'true'); stage.append(beam);
      const a = play(beam, [{ transform: 'translate3d(-110%,0,0)', opacity: 1 }, { transform: 'translate3d(110%,0,0)', opacity: 0 }], { duration: 1150, easing: cinematic });
      a?.finished.catch(() => {}).finally(() => beam.remove());
      if (!a) beam.remove();
    }
    // O replay original já chama SalomeHeroV2.replay(). Esta camada acompanha o mesmo toque.
    listen(q('.mo-replay'), 'click', () => { if (!doc.hidden) intro(); });
    if (scrollY < 100) requestAnimationFrame(() => setTimeout(intro, 180));
  }
  function story() {
    heading('#welcome-title');
    const sec = q('#a-casa');
    onceWhenVisible(sec, () => qa('.welcome-copy>p,.welcome-copy>.underlink', sec).forEach((el, i) => rise(el, i, 28, 160)), .12);
    onceWhenVisible(q('.welcome-visual'), () => {
      reveal(q('.welcome-facade'), 0, 'left');
      rise(q('.welcome-scooter'), 1, 60, 210);
    });
  }
  function gastronomy() {
    heading('#kitchen-title');
    qa('.food-gallery figure').forEach((fig, i) => onceWhenVisible(fig, () => reveal(fig, i % 2, i % 2 ? 'left' : 'bottom'), .1));
    onceWhenVisible(q('.food-to-menu'), () => rise(q('.food-to-menu'), 0, 42));
  }
  function menu() {
    heading('#menu-title');
    const section = q('#cardapio'), results = q('#menu-results'), cats = q('#menu-categories');
    if (!results || !cats) return;
    // O app original renderiza apenas 10 produtos por lote. Nunca animar os 179 itens.
    let queued = 0, previous = 0;
    const observer = new MutationObserver(() => {
      cancelAnimationFrame(queued); queued = requestAnimationFrame(() => {
        const rows = qa('.menu-item', results), start = rows.length > previous ? previous : 0;
        const visibleRows = rows.slice(start, start + (lowPower ? 4 : 7));
        if (section.getBoundingClientRect().bottom > 0 && section.getBoundingClientRect().top < innerHeight) {
          visibleRows.forEach((row, i) => rise(row, i, 18)); state.menuBatches++;
        }
        previous = rows.length;
      });
    });
    observer.observe(results, { childList: true });
    cleanup(() => { observer.disconnect(); cancelAnimationFrame(queued); });
    listen(cats, 'click', e => {
      const el = e.target.closest('button[data-category]'); if (!el) return;
      play(el, [{ transform: 'scale(.94)' }, { transform: 'scale(1.065)', offset: .55 }, { transform: 'none' }], { duration: 380, easing: 'cubic-bezier(.34,1.56,.64,1)' });
    });
    const search = q('#menu-search');
    listen(search, 'focus', () => q('.menu-search')?.classList.add('mm-focus'));
    listen(search, 'blur', () => q('.menu-search')?.classList.remove('mm-focus'));
  }
  function music() {
    heading('#music-title');
    const poster = q('.gig-poster'), shell = q('.music-posters'), title = q('#music-title');
    if (!poster || !shell) return;
    onceWhenVisible(shell, () => {
      play(poster, [
        { transform: 'perspective(850px) translate3d(0,105px,-140px) rotateX(19deg) rotateZ(-11deg) scale(.78)', opacity: .3 },
        { transform: 'perspective(850px) translate3d(0,-5px,0) rotateX(-2deg) rotateZ(3deg) scale(1.02)', opacity: 1, offset: .82 },
        { transform: 'rotate(1deg)', opacity: 1 }
      ], { duration: lowPower ? 780 : 1550, easing: cinematic });
      qa('.poster-circle,.music-memory', shell).forEach((el, i) => rise(el, i, 70, 420));
      play(q('.music-rhythm', shell), [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 1400, delay: 250 });
    }, .08);
    // Toque sem capturar o gesto vertical — retorno elástico natural.
    let x = 0, y = 0, press = false;
    listen(poster, 'pointerdown', e => { if (e.pointerType !== 'touch' || lowPower) return; x = e.clientX; y = e.clientY; press = true; });
    listen(poster, 'pointermove', e => {
      if (!press || lowPower || Math.abs(e.clientY - y) > 26) return;
      const dx = clamp((e.clientX - x) / 35, -7, 7);
      poster.style.setProperty('--mm-touch-tilt', `${dx}deg`);
    }, { passive: true });
    const finish = () => { press = false; poster.style.setProperty('--mm-touch-tilt', '0deg'); };
    listen(poster, 'pointerup', finish); listen(poster, 'pointercancel', finish); listen(poster, 'pointerleave', finish);
    cleanup(() => poster.style.removeProperty('--mm-touch-tilt'));
    if (title) onceWhenVisible(title, () => qa('.mm-line-inner', title).forEach((l, i) => l.style.setProperty('--mm-music-line', String(i))), .16);
  }
  function experiences() {
    heading('#together-title');
    onceWhenVisible(q('.together-visual'), () => { reveal(q('.together-visual>img'), 0); rise(q('.round-tag'), 1, 60, 370); });
  }
  function gallery() {
    heading('#gallery-title');
    qa('.g-photo').forEach((card, i) => onceWhenVisible(card, () => reveal(card, i % 2), .08));
    const modal = q('#lightbox'), image = q('#lightbox-img'); if (!modal || !image) return;
    let thumb = null;
    listen(doc, 'click', event => {
      const button = event.target.closest('[data-gallery-index]'); if (!button) return;
      thumb = q('img', button);
      requestAnimationFrame(() => {
        if (!modal.open || !thumb) return;
        const from = thumb.getBoundingClientRect(), to = image.getBoundingClientRect();
        if (!from.width || !to.width) return;
        state.galleryOpens++;
        const dx = from.x + from.width / 2 - to.x - to.width / 2;
        const dy = from.y + from.height / 2 - to.y - to.height / 2;
        play(image, [
          { transform: `translate3d(${dx}px,${dy}px,0) scale(${clamp(from.width / to.width, .25, 1)})`, opacity: .5 },
          { transform: 'none', opacity: 1 }
        ], { duration: lowPower ? 400 : 740, easing: cinematic });
      });
    });
    let start = null;
    listen(modal, 'touchstart', e => { if (!modal.open || e.touches.length !== 1) return; const t = e.touches[0]; start = { x: t.clientX, y: t.clientY }; }, { passive: true });
    listen(modal, 'touchend', e => {
      if (!modal.open || !start || !e.changedTouches.length) return;
      const t = e.changedTouches[0], dx = t.clientX - start.x, dy = t.clientY - start.y;
      start = null;
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4) {
        q(dx < 0 ? '.lightbox-next' : '.lightbox-prev')?.click(); state.swipes++;
      }
    }, { passive: true });
    listen(modal, 'close', () => { start = null; });
  }
  function ending() {
    heading('#visit-title');
    onceWhenVisible(q('.visit-details'), () => qa('.visit-details>div').forEach((el, i) => rise(el, i, 34, 120)));
    onceWhenVisible(q('.footer'), () => {
      reveal(q('.footer-wordmark'), 0, 'left');
      qa('.footer-bottom>*').forEach((el, i) => rise(el, i, 26, 450));
    });
  }
  // Profundidade ligada ao scroll, sem interferir na progressão do Hero existente.
  function scrollLayers() {
    if (lowPower) return;
    const targets = [
      ['.welcome-visual', -12], ['.food-one img', -22], ['.food-two img', 12],
      ['.food-three img', -16], ['.together-visual>img', -18], ['.gallery-head', -9]
    ].map(([sel,amount]) => ({ el: q(sel), amount })).filter(t => t.el);
    let frame = 0;
    function update() {
      frame = 0;
      if (doc.hidden || reduced.matches || !mobile.matches) return;
      state.scrollFrames++;
      for (const t of targets) {
        const r = t.el.getBoundingClientRect();
        if (r.bottom < -70 || r.top > innerHeight + 70) continue;
        const p = clamp((innerHeight - r.top) / (innerHeight + r.height));
        t.el.style.translate = `0 ${((p - .5) * t.amount * 2).toFixed(1)}px`;
      }
      const poster = q('.gig-poster'), sec = q('#musica');
      if (poster && sec && sec.getBoundingClientRect().bottom > 0 && sec.getBoundingClientRect().top < innerHeight) {
        const r = sec.getBoundingClientRect(), p = clamp((innerHeight - r.top) / (innerHeight + r.height));
        poster.style.setProperty('--mm-scroll-tilt', `${((p - .5) * -5).toFixed(2)}deg`);
        const tr = q('.dir-music-track');
        if (tr) tr.style.translate = `${((p - .5) * -12).toFixed(1)}vw 0`;
      }
    }
    const queue = () => { if (!frame) frame = requestAnimationFrame(update); };
    listen(window, 'scroll', queue, { passive: true }); listen(window, 'resize', queue, { passive: true });
    cleanup(() => { cancelAnimationFrame(frame); targets.forEach(t => t.el.style.removeProperty('translate')); });
    queue();
  }
  function start() {
    if (started || !mobile.matches || reduced.matches) return;
    started = true; state.enabled = true; root.classList.add('mm-active');
    hero(); story(); gastronomy(); menu(); music(); experiences(); gallery(); ending(); scrollLayers();
  }
  function stop() {
    if (!started) return;
    started = false; state.enabled = false; root.classList.remove('mm-active');
    active.forEach(a => { try { a.cancel(); } catch (_) {} }); active.clear();
    dispose.splice(0).reverse().forEach(fn => { try { fn(); } catch (_) {} });
    qa('[data-mm-split]').forEach(el => { el.innerHTML = el.dataset.mmOriginal || el.innerHTML; delete el.dataset.mmSplit; delete el.dataset.mmOriginal; });
  }
  // Atualizações dinâmicas: suporta rotação da tela e mudança de preferência de movimento.
  const handleChange = () => { state.reduced = reduced.matches; if (mobile.matches && !reduced.matches) start(); else stop(); };
  mobile.addEventListener('change', handleChange); reduced.addEventListener('change', handleChange);
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', handleChange, { once: true }); else handleChange();
})();
