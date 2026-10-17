/* Salomé Bistrô — Movimento Cinematográfico v2.6
   Camada progressiva, sem dependências, para tornar o movimento claramente perceptível.
   O site permanece funcional sem este arquivo. Respeita reduced motion. */
(() => {
  'use strict';
  const doc = document, root = doc.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const touch = matchMedia('(pointer: coarse)').matches;
  const $ = (s, p=doc) => p.querySelector(s);
  const $$ = (s, p=doc) => [...p.querySelectorAll(s)];
  const ease = 'cubic-bezier(.16, 1, .3, 1)';
  const clamp = (n,min=0,max=1) => Math.min(max, Math.max(min,n));
  const state = { version:'2.7.0', enabled:!(window.SalomeIphoneMotion?.shouldReduce() ?? reduce.matches), entries:0, transitions:0, replays:0, scrollFrames:0 };
  window.SalomeMotionEncore = state;
  const animate = (el,frames,options) => {
    if (!el || !state.enabled || !el.animate) return null;
    return el.animate(frames, {duration:880,easing:ease, ...options});
  };
  const completed = a => a?.finished?.catch(()=>{});
  let busy = false;
  const cover = doc.createElement('div');
  cover.className='mo-cinematic-curtain';cover.setAttribute('aria-hidden','true');
  cover.innerHTML='<div class="mo-curtain-label">SALOMÉ <span>BISTRÔ</span></div><p class="mo-curtain-subtitle">BOA COMIDA · MUITAS MEMÓRIAS</p>';
  doc.body.append(cover);
  const progress = doc.createElement('div');progress.className='mo-progress';progress.setAttribute('aria-hidden','true');doc.body.append(progress);

  // Reveja a abertura, mesmo quando o usuário já ficou na página por algum tempo.
  const replay = doc.createElement('button'); replay.type='button'; replay.className='mo-replay';
  replay.textContent='Rever abertura ↻'; replay.setAttribute('aria-label','Rever a animação cinematográfica de abertura');
  const heroButtons = $('.hero-buttons');heroButtons?.insertAdjacentElement('afterend',replay);
  async function replayIntro() {
    if(window.SalomeHeroV2?.replay) { window.SalomeHeroV2.replay(); return; }
    if(!state.enabled || busy) return;
    busy=true;state.replays++;
    const hero=$('.hero'),art=$('.hero-art'),main=$('.hero-main');
    if(!hero||!art||!main){busy=false;return;}
    const title=$('#hero-title'),stamp=$('.hero-orange-stamp');
    // O pai é animado em vez dos filhos para não competir com a tipografia da fase 1.
    const a=animate(art,[
      {clipPath:'inset(42% 40% 42% 40%)',transform:'translateX(13%) scale(1.17)',filter:'brightness(.5)'},
      {clipPath:'inset(0 0 0 0)',transform:'translateX(0) scale(1)',filter:'brightness(1)'}
    ],{duration:1320,easing:'cubic-bezier(.75,0,.12,1)'});
    const b=animate(main,[
      {opacity:0, transform:'translate3d(-95px,55px,0) rotateY(-13deg) skewX(-6deg)',filter:'blur(13px)'},
      {opacity:1,transform:'translate3d(0,0,0) rotateY(0) skewX(0)',filter:'blur(0)'}
    ],{duration:1150,delay:150});
    const c=animate(stamp,[
      {opacity:0,transform:'translateY(-20%) rotate(-80deg) scale(.12)'},
      {opacity:1,transform:'translateY(-20%) rotate(7deg) scale(1)'}
    ],{duration:920,delay:400,easing:'cubic-bezier(.22,1.5,.55,1)'});
    await Promise.all([completed(a),completed(b),completed(c)]);
    // Não manter transformações finais em estilo inline: preserva layout e parallax original.
    for(const x of [a,b,c]) x?.cancel();
    busy=false;
  }
  replay.addEventListener('click', replayIntro);
  // iPhone movement preferences have a discreet, accessible control in the header.
  // Never show system-status text inside the cinematic Hero.
  if((window.SalomeIphoneMotion?.shouldReduce() ?? reduce.matches)) replay.hidden=true;
  state.replay = replayIntro;

  // Navegação dentro da página recebe cortina cinematográfica, mas mantém âncoras reais.
  doc.addEventListener('click',async e=>{
    const link=e.target.closest('a[href^="#"]');
    if(!link||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.altKey||e.shiftKey||!state.enabled||busy) return;
    const hash=link.getAttribute('href'); if(!hash||hash==='#')return;
    const target=doc.getElementById(hash.slice(1));if(!target)return;
    // Pular conteúdo é uma operação acessível imediata, nunca uma cena cinematográfica.
    if(link.classList.contains('skip-link') || hash==='#conteudo') return;
    e.preventDefault(); busy=true; state.transitions++;
    try{
      cover.classList.add('mo-active');
      const first=animate(cover,[{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0 0 0)'}],{duration:390,easing:'cubic-bezier(.76,0,.24,1)',fill:'forwards'});
      await completed(first);
      // Instantâneo atrás da cortina; previne duplicar smooth scrolling.
      const pad=parseInt(getComputedStyle(doc.documentElement).scrollPaddingTop,10)||80;
      const top=target.getBoundingClientRect().top + scrollY - (hash==='#inicio'?0:pad);
      window.scrollTo({top:Math.max(0,top),behavior:'instant'});
      try {history.pushState(null,'',hash)} catch (_) {/* file:// também é suportado */}
      // Transferir o foco, além da URL/rolagem, permite continuar com Tab e leitores de tela.
      if(!target.hasAttribute('tabindex')) target.setAttribute('tabindex','-1');
      target.focus({preventScroll:true});
      await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
      first?.cancel();
      const last=animate(cover,[{clipPath:'inset(0 0 0 0)'},{clipPath:'inset(0 0 0 100%)'}],{duration:470,easing:'cubic-bezier(.76,0,.24,1)',fill:'forwards'});
      await completed(last);last?.cancel();
    }catch(err){console.warn('[Salomé Motion] transição de navegação',err)}
    finally{cover.classList.remove('mo-active');busy=false;}
  });

  // Cada capítulo tem uma entrada visual forte e REPETÍVEL após deixar a tela.
  const chapters=[
    {sec:'#a-casa', h:'#welcome-title', image:'.welcome-visual'},
    {sec:'#cozinha', h:'#kitchen-title', image:'.food-gallery'},
    {sec:'#cardapio', h:'#menu-title', image:'.menu-frame'},
    {sec:'.together', h:'#together-title', image:'.together-visual'},
    {sec:'#visite', h:'#visit-title', image:'.visit-description'},
    {sec:'.footer', h:'.footer-wordmark', image:'.footer-signature'}
  ];
  let observer;
  if(state.enabled && 'IntersectionObserver' in window){
    const lastPlayed = new WeakMap();
    observer=new IntersectionObserver(entries=>entries.forEach(e=>{
      if(!e.isIntersecting || matchMedia('(max-width:650px)').matches)return;
      const sec=e.target, cfg=chapters.find(c=>$(c.sec)===sec);
      if(!cfg)return;
      if(performance.now()-(lastPlayed.get(sec)||-9000)<3100)return;
      lastPlayed.set(sec,performance.now());state.entries++;
      const heading=$(cfg.h,sec),image=$(cfg.image,sec);
      const isMobile=innerWidth<700;
      animate(heading,[
        {opacity:.35,transform:`translate3d(${isMobile?-22:-75}px,${isMobile?55:94}px,0) scale(.86) skewX(-7deg)`,filter:'blur(8px)'},
        {opacity:1,transform:'translate3d(4px,-8px,0) scale(1.012) skewX(1deg)',filter:'blur(0)',offset:.72},
        {opacity:1,transform:'none',filter:'blur(0)'}
      ],{duration:isMobile?720:1080,easing:'cubic-bezier(.19,1,.22,1)'});
      // Anima a estrutura externa, sem substituir movimentos internos do sistema anterior.
      animate(image,[
        {opacity:.55,transform:`perspective(1200px) translate3d(${isMobile?20:85}px,${isMobile?55:90}px,-110px) rotateY(${isMobile?0:-8}deg) scale(.89)`,filter:'saturate(.65)'},
        {opacity:1,transform:'perspective(1200px) translate3d(0,0,0) rotateY(0) scale(1)',filter:'saturate(1)'}
      ],{duration:isMobile?870:1250,delay:110,easing:ease});
      sec.classList.remove('mo-chapter-arriving');void sec.offsetWidth;sec.classList.add('mo-chapter-arriving');
      setTimeout(()=>sec.classList.remove('mo-chapter-arriving'),1250);
    }),{threshold:.18,rootMargin:'0px 0px -8% 0px'});
    chapters.forEach(c=>{const s=$(c.sec);if(s) observer.observe(s)});
  }

  // Progresso da rolagem + narrativa de profundidade (scrub verdadeiro: altera enquanto scroll muda).
  const scrollPairs=[
    ['#a-casa','.welcome-visual',24,-16,1],
    ['#musica','.music-posters',38,-9,1.01],
    ['#galeria','.gallery-head',-33,5,1],
    ['#visite','.visit-main',18,0,1]
  ];
  const tracks=scrollPairs.map(([section,child,y,r,sc])=>({section:$(section), child:$(child,$(section)||doc), y,r,sc})).filter(x=>x.section&&x.child);
  let scheduled=false;
  const update=()=>{
    scheduled=false;if(!state.enabled)return;
    state.scrollFrames++;
    const body=doc.documentElement,max=body.scrollHeight-innerHeight;
    progress.style.transform=`scaleX(${max>0?clamp(scrollY/max):0})`;
    if(matchMedia('(max-width:650px)').matches) return;
    tracks.forEach(t=>{
      const r=t.section.getBoundingClientRect();
      if(r.bottom<0||r.top>innerHeight)return;
      const p=clamp((innerHeight-r.top)/(innerHeight+r.height));
      const centered=p-.5;
      // Composição segue scroll, mesmo depois das animações de entrada.
      t.child.style.translate=`0 ${Math.round(centered*t.y*2)}px`;
      if(t.r && !touch)t.child.style.rotate=`${(centered*t.r).toFixed(2)}deg`;
    });
  };
  window.addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(update)}},{passive:true});
  window.addEventListener('resize',update,{passive:true});update();
  reduce.addEventListener('change',e=>{
    state.enabled=!e.matches;replay.hidden=e.matches;
    if(e.matches){progress.style.transform='scaleX(0)';tracks.forEach(t=>{t.child.style.translate='';t.child.style.rotate=''})}
    else update();
  });
  root.dataset.motionEdition='2.7';
  console.info('[Salomé] Motion Revolution 2.7 ativado. Teste: clicar em “Rever abertura” ou navegar pelas seções.');
})();
