/* Salomé Bistrô — motor de motion (JS puro: WAAPI + rAF único). Sem dependências.
   Contrato: window.SalomeMotion.{reg(fn), flags}. Cada módulo recebe ctx e devolve função de limpeza. */
(() => {
  'use strict';
  const root = document.documentElement;
  const mqReduce = matchMedia('(prefers-reduced-motion: reduce)');
  const mqTouch = matchMedia('(hover: none), (pointer: coarse)');
  const flags = {
    reduced: mqReduce.matches,
    touch: mqTouch.matches,
    // aparelho modesto: poucos núcleos/memória ou Save-Data
    low: (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 2 || !!navigator.connection?.saveData
  };
  const q = (s, r = document) => r.querySelector(s);
  const qa = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const EASE = { out: 'cubic-bezier(.16,1,.3,1)', inOut: 'cubic-bezier(.76,0,.24,1)', spring: 'cubic-bezier(.34,1.56,.64,1)' };
  const anim = (el, kf, o) => el && el.animate(kf, { fill: 'both', easing: EASE.out, ...o });

  /* ---------- Ticker sob demanda ----------
     Módulos históricos podem retornar true continuamente. O ticker agora dorme
     quando o scroll e o ponteiro param, retomando apenas com interação. */
  const subs = new Set(); let raf = 0, last = 0, activityAt = performance.now(), frames = 0;
  const stats = { frames: 0, sleeps: 0, wakeups: 0, running: false };
  function wake() {
    activityAt = performance.now();
    if (!raf && !document.hidden && !flags.reduced && subs.size) {
      stats.wakeups++; stats.running = true; raf = requestAnimationFrame(tick);
    }
  }
  const tick = t => {
    const dt = Math.min(48, t - last || 16); last = t; frames++; stats.frames++;
    let keep = false;
    subs.forEach(fn => { if (fn(t, dt) !== false) keep = true; else subs.delete(fn); });
    // 420ms absorvem inércia/lerp. Nenhum frame é solicitado quando ocioso.
    if (keep && !document.hidden && !flags.reduced && t - activityAt < 420) {
      raf = requestAnimationFrame(tick);
    } else {
      raf = 0; last = 0; stats.running = false; stats.sleeps++;
    }
  };
  const sub = fn => { subs.add(fn); wake(); return () => subs.delete(fn); };

  /* ---------- Estado de scroll compartilhado ---------- */
  const S = { y: scrollY, v: 0, vs: 0 };
  let sy = scrollY;
  const onScroll = () => { S.y = scrollY; wake(); };
  /* Observador de visibilidade: módulos só trabalham quando a seção está na tela */
  const visible = new Map();
  const io = new IntersectionObserver(es => es.forEach(e => visible.set(e.target, e.isIntersecting)), { rootMargin: '15% 0px' });
  const watch = el => { if (el) { visible.set(el, true); io.observe(el); } return () => { io.unobserve(el); visible.delete(el); }; };
  const isVis = el => visible.get(el) !== false;

  const cleanups = [];
  const mods = [];
  const ac = new AbortController();
  const on = (t, e, f, o) => t.addEventListener(e, event => { f(event); if (e === 'pointermove' || e === 'pointerleave' || e === 'resize') wake(); }, { passive: true, signal: ac.signal, ...o });
  const ctx = { q, qa, clamp, lerp, EASE, anim, sub, S, flags, watch, isVis, on, root };

  /* Loop de scroll: velocidade suavizada (alimenta skew e efeitos) */
  sub(() => { S.v = scrollY - sy; sy = scrollY; S.vs = lerp(S.vs, S.v, .14); return true; });

  /* ---------- Módulo: Hero ---------- */
  mods.push(function hero() {
    const hero = q('.hero'); if (!hero) return;
    const h1 = q('#hero-title', hero);
    const art = q('.hero-art', hero), img = q('.hero-art>img:not(.ornament)', hero);
    const copy = q('.hero-copy', hero), stamp = q('.hero-orange-stamp', hero), corner = q('.hero-corner-ornament', hero);
    const header = q('.site-header'), ticker = q('.ticker');

    // Divide o título em palavras mascaradas, preservando <em> e leitura por leitores de tela
    if (h1 && !h1.dataset.moSplit) {
      h1.dataset.moSplit = '1'; h1.setAttribute('aria-label', h1.innerHTML.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim());
      const wrap = node => {
        const out = document.createDocumentFragment();
        node.childNodes.forEach(n => {
          if (n.nodeType === 3) n.textContent.split(/(\s+)/).forEach(tk => { if (!tk) return; if (/^\s+$/.test(tk)) out.append(' '); else { const w = document.createElement('span'); w.className = 'mo-word'; w.setAttribute('aria-hidden', 'true'); const i = document.createElement('span'); i.textContent = tk; w.append(i); out.append(w); } });
          else if (n.nodeName === 'BR') out.append(n.cloneNode());
          else if (n.nodeType === 1) { const c = n.cloneNode(false); c.append(wrap(n)); out.append(c); }
        }); return out;
      };
      const f = wrap(h1); h1.replaceChildren(f);
    }
    const words = qa('.mo-word>span', h1);
    const play = () => {
      root.classList.remove('mo-pre');
      if (flags.reduced) return;
      const T = flags.low ? .7 : 1;
      // 1. máscara expansiva + imagem desacelera (sensação de câmera recuando)
      anim(art, [{ clipPath: 'inset(18% 14% 18% 14%)' }, { clipPath: 'inset(0% 0% 0% 0%)' }], { duration: 1300 * T, easing: EASE.inOut });
      anim(img, [{ transform: 'scale(1.35)' }, { transform: 'scale(1)' }], { duration: 1900 * T, easing: EASE.out }).finished.then(a => a.cancel()).catch(() => {});
      // 2. título: palavras sobem de dentro da máscara, giro elástico no assentar
      words.forEach((w, i) => anim(w, [{ transform: 'translateY(112%) rotate(7deg) skewY(5deg)' }, { transform: 'translateY(-3%) rotate(-.6deg)', offset: .72 }, { transform: 'none' }], { duration: 1050 * T, delay: 380 * T + i * 120, easing: EASE.out }));
      // 3. coreografia dos secundários
      const sec = [...qa('.hero-edition>*', hero), q('.hero-strap', hero), q('.hero-description', hero), ...qa('.hero-buttons>*', hero), ...qa('.hero-smallprint>*', hero), q('.hero-photo-top', hero), q('.hero-photo-bottom', hero)].filter(Boolean);
      sec.forEach((el, i) => anim(el, [{ opacity: 0, transform: 'translateY(22px)' }, { opacity: 1, transform: 'none' }], { duration: 800 * T, delay: 900 * T + i * 70 }));
      // 4. selo e ornamento entram com mola
      anim(stamp, [{ opacity: 0, transform: 'translateY(-20%) rotate(-40deg) scale(.2)' }, { opacity: 1, transform: 'translateY(-20%) rotate(7deg) scale(1)' }], { duration: 1100 * T, delay: 1250 * T, easing: EASE.spring });
      anim(corner, [{ opacity: 0, transform: 'scaleX(-1) rotate(-25deg) scale(.4)' }, { opacity: .82, transform: 'scaleX(-1)' }], { duration: 900 * T, delay: 1100 * T, easing: EASE.spring });
      anim(header, [{ opacity: 0, transform: 'translateY(-14px)' }, { opacity: 1, transform: 'none' }], { duration: 700 * T, delay: 200 * T });
    };
    // espera fontes (evita salto de tipografia) com teto de 600ms; nunca bloqueia interação
    Promise.race([document.fonts?.ready, new Promise(r => setTimeout(r, 600))]).then(() => requestAnimationFrame(play));

    // Parallax multicamadas: scroll (todos) + ponteiro (só desktop)
    const m = { x: 0, y: 0, tx: 0, ty: 0 };
    if (!flags.touch && !flags.reduced) on(hero, 'pointermove', e => { const r = hero.getBoundingClientRect(); m.tx = (e.clientX - r.left) / r.width - .5; m.ty = (e.clientY - r.top) / r.height - .5; });
    if (!flags.touch) on(hero, 'pointerleave', () => { m.tx = m.ty = 0; });
    const stopW = watch(hero);
    let introDone = performance.now() + 2600;
    const off = sub(() => {
      if (flags.reduced || !isVis(hero)) return true;
      const p = clamp(S.y / hero.offsetHeight, 0, 1);
      m.x = lerp(m.x, m.tx, .07); m.y = lerp(m.y, m.ty, .07);
      const settled = performance.now() > introDone;
      if (settled) {
        // só mexe no transform da imagem depois da intro (não briga com a animação de entrada)
        img.style.transform = `translate3d(${m.x * -14}px,${p * 70 + m.y * -10}px,0) scale(${1 + p * .08})`;
        stamp && (stamp.style.translate = `${m.x * 26}px ${m.y * 18 + p * -40}px`);
        corner && (corner.style.translate = `${m.x * -18}px ${m.y * -12}px`);
      }
      // saída cinematográfica: texto sobe mais rápido e escurece; a arte afunda
      copy.style.transform = `translate3d(0,${p * -60}px,0)`; copy.style.opacity = String(1 - p * .75);
      return true;
    });
    // Ticker: skew pela velocidade do scroll (transição para a próxima seção)
    if (ticker) sub(() => { const k = clamp(S.vs * -.22, -5, 5); ticker.style.transform = Math.abs(k) < .02 ? '' : `skewX(${k}deg) scaleY(${1 + Math.abs(k) * .02})`; return true; });
    return () => { off(); stopW(); };
  });

  /* ---------- Módulo: Magnético + feedback elástico em botões ---------- */
  mods.push(function magnetic() {
    const els = qa('.btn,.head-book,.underlink,.music-link,.hero-text-link,.footer-visit,.load-more,.category'); if (!els.length) return;
    els.forEach(el => el.dataset.magnetic = '');
    qa('.btn,.head-book,.footer-visit').forEach(el => { el.dataset.magnetic = '.35'; });
    if (flags.touch || flags.reduced) return;
    els.forEach(el => {
      const k = parseFloat(el.dataset.magnetic) || .22; let a = null;
      on(el, 'pointermove', e => { const r = el.getBoundingClientRect(); const x = (e.clientX - r.left - r.width / 2) * k, y = (e.clientY - r.top - r.height / 2) * k; a?.cancel(); el.style.translate = `${x}px ${y}px`; });
      on(el, 'pointerleave', () => { // retorno elástico por mola
        const from = el.style.translate || '0px 0px'; el.style.translate = '';
        a = el.animate([{ translate: from }, { translate: '0px 0px' }], { duration: 700, easing: 'cubic-bezier(.34,1.8,.64,1)' });
      });
      on(el, 'pointerdown', () => el.animate([{ scale: 1 }, { scale: .95 }], { duration: 120, fill: 'forwards', easing: EASE.out }));
      on(el, 'pointerup', () => el.animate([{ scale: .95 }, { scale: 1 }], { duration: 520, fill: 'forwards', easing: EASE.spring }));
    });
  });


  /* ---------- Utilitários da Fase 2 ---------- */
  const splitWords = el => {
    if (!el || el.dataset.moSplit) return qa('.mo-word>span', el || document);
    el.dataset.moSplit = '1';
    el.setAttribute('aria-label', el.innerHTML.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim());
    const wrap = node => { const out = document.createDocumentFragment();
      node.childNodes.forEach(n => {
        if (n.nodeType === 3) n.textContent.split(/(\s+)/).forEach(tk => { if (!tk) return; if (/^\s+$/.test(tk)) out.append(' '); else { const w = document.createElement('span'); w.className = 'mo-word'; w.setAttribute('aria-hidden', 'true'); const i = document.createElement('span'); i.textContent = tk; w.append(i); out.append(w); } });
        else if (n.nodeName === 'BR') out.append(n.cloneNode());
        else if (n.nodeType === 1) { const c = n.cloneNode(false); c.append(wrap(n)); out.append(c); }
      }); return out; };
    el.replaceChildren(wrap(el)); return qa('.mo-word>span', el);
  };
  /* Revela ao entrar na tela (uma vez). Estado inicial só é aplicado pelo JS, então sem JS o conteúdo fica visível. */
  const revealOnce = (el, play, th = .25) => {
    if (!el || flags.reduced) return;
    el.setAttribute('data-mo-rev', '');
    const o = new IntersectionObserver(es => { if (es[0].isIntersecting) { o.disconnect(); el.removeAttribute('data-mo-rev'); play(); } }, { threshold: th });
    o.observe(el); cleanups.push(() => o.disconnect());
  };
  const titleIn = (h, delay = 0) => { const w = splitWords(h); w.forEach(x => x.style.transform = 'translateY(112%) rotate(7deg) skewY(5deg)');
    return () => w.forEach((x, i) => { const a = anim(x, [{ transform: 'translateY(112%) rotate(7deg) skewY(5deg)' }, { transform: 'translateY(-3%) rotate(-.6deg)', offset: .72 }, { transform: 'none' }], { duration: 950, delay: delay + i * 90 }); a.finished.then(() => { a.cancel(); x.style.transform = ''; }).catch(() => {}); }); };
  const riseIn = (els, delay = 0, step = 90) => els.filter(Boolean).forEach((e, i) => anim(e, [{ opacity: 0, transform: 'translateY(26px)' }, { opacity: 1, transform: 'none' }], { duration: 800, delay: delay + i * step }).finished.then(a => a.cancel()).catch(() => {}));
  /* Medição estável de posições (antes de qualquer transform), refeita em resize */
  const track = [];
  const measure = () => { track.forEach(t => { const prev = t.el.style.translate; t.el.style.translate = ''; const r = t.el.getBoundingClientRect(); t.top = r.top + scrollY; t.h = r.height; t.el.style.translate = prev; }); };
  const addTrack = (el, fn) => { if (!el) return null; const t = { el, fn, top: 0, h: 0 }; track.push(t); return t; };
  let rz = 0; on(window, 'resize', () => { clearTimeout(rz); rz = setTimeout(measure, 150); });
  const prog = t => clamp((S.y + innerHeight - t.top) / (innerHeight + t.h), 0, 1); // 0 = entrando por baixo, 1 = saindo por cima
  const prog2 = t => clamp((S.y + innerHeight - t.top) / (innerHeight * .9), 0, 1); // 0→1 até chegar ao centro

  /* ---------- Módulo: Nossa História — narrativa guiada pelo scroll ---------- */
  mods.push(function story() {
    const sec = q('#a-casa'); if (!sec || flags.reduced) return;
    const h2 = q('#welcome-title', sec), label = q('.section-label', sec);
    const ps = qa('.welcome-copy>p, .welcome-copy>.underlink', sec);
    revealOnce(h2, titleIn(h2, 0), .35); h2?.removeAttribute('data-mo-rev');
    ps.forEach(p => p.setAttribute('data-mo-rev', ''));
    revealOnce(q('.welcome-copy', sec), () => { ps.forEach(p => p.removeAttribute('data-mo-rev')); riseIn(ps, 450, 140); }, .3);
    if (label) revealOnce(label, () => riseIn([label], 0), .6);
    const fig = q('.welcome-facade', sec), fimg = q('img', fig || sec), scoot = q('.welcome-scooter', sec), sig = q('.welcome-signature', sec);
    if (fig) fig.style.clipPath = 'inset(100% 0 0 0)';
    if (sig) sig.style.clipPath = 'inset(0 100% 0 0)';
    const tf = addTrack(fig, 'fig'), ts = addTrack(scoot, 'scoot'), tg = addTrack(sig, 'sig');
    measure();
    const stop = watch(sec);
    const off = sub(() => {
      if (!isVis(sec)) return true;
      if (tf) { const p = prog2(tf), e = 1 - Math.pow(1 - p, 3);
        fig.style.clipPath = `inset(${(1 - e) * 100}% 0 0 0)`; if (fimg) fimg.style.scale = String(1.35 - e * .35);
        fig.style.translate = `0 ${(1 - prog(tf)) * -50 + 25}px`; }
      if (ts) { const p = prog2(ts); scoot.style.translate = `${(1 - p) * -60}px ${(1 - prog(ts)) * 90 - 45}px`; scoot.style.opacity = String(clamp(p * 1.6, 0, 1)); }
      if (tg) { const p = prog2(tg); sig.style.clipPath = `inset(0 ${(1 - clamp(p * 1.3, 0, 1)) * 100}% 0 0)`; sig.style.scale = String(.8 + p * .25); }
      return true;
    });
    return () => { off(); stop(); };
  });

  /* ---------- Módulo: Gastronomia — a seção de maior impacto fotográfico ---------- */
  mods.push(function kitchen() {
    const sec = q('#cozinha'); if (!sec || flags.reduced) return;
    const h2 = q('#kitchen-title', sec);
    revealOnce(h2, titleIn(h2, 0), .35); h2?.removeAttribute('data-mo-rev');
    const intro = [q('.section-index', sec), q('.kitchen-intro', sec)]; intro.forEach(e => e?.setAttribute('data-mo-rev', ''));
    revealOnce(q('.kitchen-top', sec), () => { intro.forEach(e => e?.removeAttribute('data-mo-rev')); riseIn(intro, 500, 150); }, .3);
    const figs = qa('.food-gallery figure', sec);
    const cfg = { 'food-one': { speed: -70, from: .7 }, 'food-two': { speed: 90, from: .8 }, 'food-three': { speed: -30, from: .85 } };
    const items = figs.map(f => { const k = Object.keys(cfg).find(c => f.classList.contains(c)); const img = q('img', f); const cap = q('figcaption', f);
      f.style.clipPath = 'inset(14% 10% 14% 10%)'; f.style.overflow = f.style.overflow || ''; return { f, img, cap, c: cfg[k] || { speed: 0, from: .85 }, t: addTrack(f, k) }; });
    const orn = qa('.kitchen-engraving, .kitchen-citrus', sec).map(e => ({ e, t: addTrack(e), d: e.classList.contains('kitchen-citrus') ? 70 : -50 }));
    measure();
    // 3D discreto nos ornamentos: inclinam seguindo o ponteiro (desktop)
    const m = { x: 0, y: 0, tx: 0, ty: 0 };
    if (!flags.touch) { on(sec, 'pointermove', e => { const r = sec.getBoundingClientRect(); m.tx = (e.clientX - r.left) / r.width - .5; m.ty = (e.clientY - r.top) / r.height - .5; }); on(sec, 'pointerleave', () => { m.tx = m.ty = 0; }); }
    const stop = watch(sec);
    const off = sub(() => {
      if (!isVis(sec)) return true;
      m.x = lerp(m.x, m.tx, .06); m.y = lerp(m.y, m.ty, .06);
      const sk = clamp(S.vs * .16, -4, 4);
      items.forEach(({ f, img, cap, c, t }) => {
        const p = prog2(t), e = 1 - Math.pow(1 - p, 3), wide = prog(t);
        const inset = (1 - e) * 14, insetX = (1 - e) * 10;
        f.style.clipPath = e > .998 ? 'none' : `inset(${inset}% ${insetX}% ${inset}% ${insetX}%)`;
        f.style.scale = String(c.from + (1 - c.from) * e);
        f.style.translate = `0 ${(.5 - wide) * c.speed}px`;
        f.style.transform = Math.abs(sk) < .03 ? '' : `skewY(${sk * (c.speed > 0 ? -1 : 1)}deg)`;
        if (img) img.style.scale = String(1.3 - e * .3);
        if (cap) cap.style.opacity = String(clamp((p - .6) * 3, 0, 1));
      });
      orn.forEach(({ e, t, d }) => { const w = prog(t); e.style.translate = `0 ${(.5 - w) * d * 2}px`; e.style.transform = `perspective(700px) rotateY(${m.x * 22}deg) rotateX(${m.y * -16}deg)`; });
      return true;
    });
    return () => { off(); stop(); };
  });

  /* ===================== FASE 3: CARDÁPIO, MÚSICA, EXPERIÊNCIAS ===================== */
  mods.push(function cardapioMotion() {
    const section = q('#cardapio'), results = q('#menu-results');
    if (!section || !results || flags.reduced) return;
    const headline = q('#menu-title', section);
    revealOnce(headline, () => {
      const playTitle = titleIn(headline);
      playTitle();
      riseIn([q('.menu-header>p', section), q('.menu-frame', section)], 170, 150);
    }, .3);
    let lastCount = results.querySelectorAll('.menu-item').length;
    let queue = 0;
    const obs = new MutationObserver(() => {
      cancelAnimationFrame(queue);
      queue = requestAnimationFrame(() => {
        const items = qa('.menu-item', results), count = items.length;
        const start = count > lastCount ? lastCount : 0;
        const incoming = items.slice(start, Math.min(count, start + 10));
        if (isVis(section)) incoming.forEach((row, index) => {
          anim(row, [
            { opacity: 0, transform: 'translate3d(0,22px,0) skewY(2deg)', filter: 'blur(4px)' },
            { opacity: 1, transform: 'none', filter: 'blur(0)' }
          ], { duration: flags.low ? 340 : 510, delay: index * (flags.low ? 22 : 46), easing: EASE.out })?.finished.then(a => a.cancel()).catch(() => {});
        });
        lastCount = count;
      });
    });
    obs.observe(results, { childList: true });
    const cats = q('#menu-categories', section);
    const onCategory = e => {
      const b = e.target.closest('button[data-category]'); if (!b || flags.reduced) return;
      anim(b, [{ scale: .9 }, { scale: 1.075, offset: .55 }, { scale: 1 }], { duration: 420, easing: EASE.spring })?.finished.then(a=>a.cancel()).catch(()=>{});
      q('.menu-paper-top', section)?.animate([{ opacity: .6 }, { opacity: 1 }], { duration: 360 });
    };
    if(cats) on(cats, 'click', onCategory);
    const search = q('#menu-search', section);
    if(search) on(search, 'focus', () => { q('.menu-search', section)?.classList.add('mo-search-focus'); });
    if(search) on(search, 'blur', () => { q('.menu-search', section)?.classList.remove('mo-search-focus'); });
    const stop = watch(section);
    return () => { obs.disconnect(); cancelAnimationFrame(queue); stop(); };
  });

  mods.push(function musicMotion() {
    const section = q('#musica'); if(!section || flags.reduced) return;
    const title = q('#music-title', section), poster = q('.gig-poster', section);
    const paper = q('.music-posters', section);
    const sticker = q('.poster-circle', section), memory = q('.music-memory', section);
    const accordion = q('.music-accordion', section), lines = q('.music-rhythm', section);
    const copy = [q('.music-sup',section), q('.music-copy-main>p',section), q('.music-link',section), q('.music-foot',section)];
    revealOnce(title, titleIn(title), .22);
    revealOnce(q('.music-copy', section), () => riseIn(copy, 220, 135), .2);
    revealOnce(paper, () => {
      anim(poster, [
        {opacity:0, transform:'perspective(1100px) translate3d(0,130px,-260px) rotateX(24deg) rotateZ(-9deg) scale(.72)'},
        {opacity:1, transform:'perspective(1100px) translate3d(0,-12px,0) rotateX(-3deg) rotateZ(2deg) scale(1.015)', offset:.78},
        {opacity:1, transform:'perspective(1100px) translate3d(0,0,0) rotateX(0) rotateZ(0) scale(1)'}
      ], { duration:flags.low?800:1350, easing:EASE.out })?.finished.then(a=>{a.cancel();poster.classList.add('mo-poster-ready')}).catch(()=>{});
      riseIn([memory, sticker], 520, 200);
      if(lines) anim(lines, [{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0 0 0)'}], {duration:1250,delay:250});
      if(accordion) anim(accordion,[{opacity:0,transform:'translateY(30px) rotate(-22deg) scale(.65)'},{opacity:1, transform:'none'}],{duration:950,easing:EASE.spring});
    },.16);
    const motion = {x:0,y:0,tx:0,ty:0}, base = 2;
    if(!flags.touch) {
      on(paper,'pointermove',e=>{const r=paper.getBoundingClientRect();motion.tx=((e.clientX-r.left)/r.width-.5);motion.ty=((e.clientY-r.top)/r.height-.5);});
      on(paper,'pointerleave',()=>{motion.tx=motion.ty=0;});
    }
    const t=addTrack(paper),stop=watch(section);measure();
    const off=sub(()=>{
      if(!isVis(section) || !poster?.classList.contains('mo-poster-ready')) return true;
      motion.x=lerp(motion.x,motion.tx,.08);motion.y=lerp(motion.y,motion.ty,.08);
      const p=prog(t), tilt=flags.touch?0:1;
      poster.style.transform=`perspective(1050px) rotateX(${motion.y * -11 * tilt}deg) rotateY(${motion.x * 14 * tilt}deg) rotateZ(${base+(p-.5)*-2}deg) translate3d(0,${(p-.5)*-24}px,0)`;
      if(sticker) sticker.style.translate=`${motion.x*12*tilt}px ${motion.y*10*tilt}px`;
      if(memory) memory.style.translate=`${motion.x*-13*tilt}px ${(p-.5)*-36+motion.y*-12*tilt}px`;
      if(lines) lines.style.translate=`0 ${(p-.5)*42}px`;
      return true;
    });
    return ()=>{off();stop();poster?.style.removeProperty('transform');};
  });

  mods.push(function togetherMotion() {
    const sec=q('.together');if(!sec||flags.reduced)return;
    const heading=q('#together-title',sec),frame=q('.together-visual',sec),pic=q('.together-visual>img',sec),tag=q('.round-tag',sec);
    revealOnce(heading,titleIn(heading),.22);
    revealOnce(q('.together-content',sec),()=>riseIn([...qa('.together-content>p',sec),q('.underlink',sec)],250,120),.2);
    revealOnce(frame,()=>{
      anim(pic,[{clipPath:'inset(25% 18% 25% 18%)',scale:1.33},{clipPath:'inset(0 0 0 0)',scale:1}],{duration:1250,easing:EASE.inOut})?.finished.then(a=>a.cancel()).catch(()=>{});
      anim(tag,[{opacity:0,transform:'translateY(45px) rotate(-35deg) scale(.5)'},{opacity:1,transform:'none'}],{duration:890,delay:470,easing:EASE.spring});
    },.24);
    const t=addTrack(frame),stop=watch(sec);measure();
    const off=sub(()=>{if(!isVis(sec)||!pic)return true;const p=prog(t);pic.style.translate=`0 ${(p-.5)*-38}px`;return true;});
    return()=>{off();stop();pic?.style.removeProperty('translate');};
  });

  /* ===================== FASE 4: GALERIA, CONTATO, RODAPÉ ===================== */
  mods.push(function galleryMotion() {
    const sec=q('#galeria'),dialog=q('#lightbox'),modalImage=q('#lightbox-img');if(!sec||!dialog||!modalImage||flags.reduced)return;
    revealOnce(q('#gallery-title',sec),titleIn(q('#gallery-title',sec)),.27);
    const cards=qa('.g-photo',sec);
    const observer=new IntersectionObserver(es=>{es.forEach(entry=>{
      if(!entry.isIntersecting)return;observer.unobserve(entry.target);
      const i=cards.indexOf(entry.target);
      anim(entry.target,[{opacity:0,clipPath:'inset(18% 10% 18% 10%)',transform:'translateY(76px) scale(.88)'},{opacity:1,clipPath:'inset(0 0 0 0)',transform:'none'}],{duration:900,delay:(i%3)*100,easing:EASE.out})?.finished.then(a=>a.cancel()).catch(()=>{});
    })},{threshold:.12});cards.forEach(c=>observer.observe(c));
    let source=null,entered=false;
    // A app.js mantém a lógica do <dialog> e seu foco; aqui animamos somente a apresentação.
    cards.forEach(card=>on(card,'click',()=>{source=card;entered=false;}));
    const openObserver=new MutationObserver(()=>{
      if(!dialog.open){entered=false;return;}if(entered)return;entered=true;
      const rect=modalImage.getBoundingClientRect(),from=source?.querySelector('img')?.getBoundingClientRect();
      if(!from||!rect.width||!rect.height)return;
      const dx=from.left+from.width/2-(rect.left+rect.width/2),dy=from.top+from.height/2-(rect.top+rect.height/2);
      const sx=clamp(from.width/rect.width,.16,3),sy=clamp(from.height/rect.height,.16,3);
      anim(modalImage,[{transform:`translate3d(${dx}px,${dy}px,0) scale(${sx},${sy})`,opacity:.3,filter:'blur(8px)'},{transform:'none',opacity:1,filter:'blur(0)'}],{duration:flags.low?430:760,easing:EASE.inOut})?.finished.then(a=>a.cancel()).catch(()=>{});
      anim(dialog,[{opacity:.65},{opacity:1}],{duration:400})?.finished.then(a=>a.cancel()).catch(()=>{});
    });
    openObserver.observe(dialog,{attributes:true,attributeFilter:['open']});
    const srcObserver=new MutationObserver(()=>{
      if(dialog.open && entered) anim(modalImage,[{opacity:.25,filter:'blur(7px)',scale:1.04},{opacity:1,filter:'blur(0)',scale:1}],{duration:430,easing:EASE.out})?.finished.then(a=>a.cancel()).catch(()=>{});
    });
    srcObserver.observe(modalImage,{attributes:true,attributeFilter:['src']});
    const cursor=document.createElement('div');cursor.className='mo-gallery-cursor';cursor.textContent='AMPLIAR ↗';cursor.setAttribute('aria-hidden','true');sec.append(cursor);
    let pointer={x:0,y:0,tx:0,ty:0},active=null;
    if(!flags.touch && !flags.low){
      cards.forEach(card=>{
        on(card,'pointerenter',()=>{active=card;cursor.classList.add('visible');});
        on(card,'pointermove',e=>{
          pointer.tx=e.clientX;pointer.ty=e.clientY;
          const r=card.getBoundingClientRect(); const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
          card.style.transform=`perspective(900px) rotateX(${-y*5}deg) rotateY(${x*6}deg) scale(1.015)`;
        });
        on(card,'pointerleave',()=>{active=null;cursor.classList.remove('visible');card.style.transform='';});
      });
    }
    const off=sub(()=>{if(!active)return true;pointer.x=lerp(pointer.x,pointer.tx,.25);pointer.y=lerp(pointer.y,pointer.ty,.25);cursor.style.transform=`translate3d(${pointer.x}px,${pointer.y}px,0) translate(-50%,-50%)`;return true;});
    return()=>{observer.disconnect();openObserver.disconnect();srcObserver.disconnect();cursor.remove();off();};
  });

  mods.push(function endingMotion(){
    const sec=q('#visite'),footer=q('.footer');if(flags.reduced)return;
    if(sec){
      revealOnce(q('#visit-title',sec),titleIn(q('#visit-title',sec)),.3);
      revealOnce(q('.visit-description',sec),()=>riseIn([...qa('.visit-description>*',sec)],150,130),.15);
      const det=qa('.visit-details>div',sec);
      revealOnce(q('.visit-details',sec),()=>riseIn(det,0,145),.2);
    }
    if(footer){
      const brand=q('.footer-wordmark img',footer),caption=q('.footer-brand-heading',footer),art=q('.footer-signature',footer);
      revealOnce(footer,()=>{
        if(caption) riseIn([caption],0);
        if(art) anim(art,[{opacity:0,clipPath:'inset(0 100% 0 0)'},{opacity:.29,clipPath:'inset(0 0 0 0)'}],{duration:1250,delay:280,easing:EASE.inOut});
      },.12);
      revealOnce(brand,()=>anim(brand,[{opacity:0,transform:'translateY(55px) scale(.84)',clipPath:'inset(0 0 100% 0)'},{opacity:1,transform:'none',clipPath:'inset(0 0 0 0)'}],{duration:1400,easing:EASE.inOut})?.finished.then(a=>a.cancel()).catch(()=>{}),.15);
      revealOnce(q('.footer-bottom',footer),()=>riseIn(qa('.footer-bottom>*',footer),0,130),.14);
    }
  });

  /* ---------- Inicialização / destruição ---------- */
  let started = false;
  function init() {
    if (started) return; started = true;
    on(window, 'scroll', onScroll);
    mods.forEach(m => { try { const c = m(ctx); if (typeof c === 'function') cleanups.push(c); } catch (err) { console.warn('[motion] módulo falhou', err); } });
  }
  function destroy() { cleanups.splice(0).forEach(f => f()); subs.clear(); ac.abort(); io.disconnect(); root.classList.remove('mo-pre'); }
  // pausa o loop em aba oculta
  document.addEventListener('visibilitychange', () => { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; stats.running = false; } else wake(); });
  mqReduce.addEventListener('change', e => {
    flags.reduced = e.matches; root.classList.toggle('mo-reduced', e.matches);
    if (e.matches) { cancelAnimationFrame(raf); raf = 0; stats.running = false; document.getAnimations().forEach(a => { try { a.cancel(); } catch (_) {} }); }
    else wake();
  });
  window.SalomeMotion = { flags, destroy, reg: fn => mods.push(fn), ctx, stats, wake };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
