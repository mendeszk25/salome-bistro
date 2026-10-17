/* Salomé Bistrô — Motion Director v2.7
   3 cenas autorais sobre arquitetura existente: Hero, Música e Galeria.
   Sem alteração de conteúdo, dependências ou lógica do cardápio/lightbox. */
(() => {
  'use strict';
  const doc = document, $=(s,p=doc)=>p.querySelector(s);
  const mq=matchMedia('(prefers-reduced-motion: reduce)');
  const low=(navigator.connection?.saveData || (navigator.deviceMemory||8)<=2);
  const state={edition:'2.7',heroPlays:0,musicScrollUpdates:0,galleryFlips:0,enabled:!mq.matches};
  window.SalomeDirector=state;
  const hero=$('.hero');
  let opening=null,heroTimer=null;
  function heroCurtain(replay=false){
    if(mq.matches || !hero || !hero.animate || doc.hidden) return;
    opening?.remove();
    const root=doc.createElement('div'); root.className='dir-hero-opening';root.setAttribute('aria-hidden','true');
    for(let i=0;i<2;i++){const panel=doc.createElement('div');panel.className='dir-shutter';root.append(panel)}
    hero.prepend(root);opening=root;state.heroPlays++;
    const panels=[...root.children];
    const duration=low?720:1060,delay=replay?370:300;
    if(replay){
      panels.forEach((el,i)=>{el.animate([{transform:`translateX(${i?105:-105}%)`},{transform:'translateX(0)'}],{duration:340,easing:'cubic-bezier(.76,0,.24,1)',fill:'both'});});
    }
    panels.forEach((el,i)=>el.animate([
      {transform:'translateX(0)'},
      {transform:`translateX(${i?102:-102}%)`}
    ],{duration,delay,easing:'cubic-bezier(.76,0,.18,1)',fill:'forwards'}));
    clearTimeout(heroTimer);
    heroTimer=setTimeout(()=>{if(opening===root)opening=null;root.remove()},duration+delay+120);
  }
  // A cena estreia automaticamente; o botão existente repete a experiência.
  if(hero && !hero.closest('.hero-journey') && !mq.matches) requestAnimationFrame(()=>heroCurtain());
  if(!hero?.closest('.hero-journey')) $('.mo-replay')?.addEventListener('click',()=>heroCurtain(true));

  const music=$('#musica'), posters=$('.music-posters');
  let visible=false,ticking=false;
  if(music&&posters){
    const halo=doc.createElement('div');halo.className='dir-music-halo';halo.setAttribute('aria-hidden','true');posters.prepend(halo);
    const ribbon=doc.createElement('div');ribbon.className='dir-music-band';ribbon.setAttribute('aria-hidden','true');
    const track=doc.createElement('div');track.className='dir-music-track';
    track.innerHTML='MÚSICA <b>✳</b> ENCONTROS <b>✳</b> MÚSICA <b>✳</b> ENCONTROS <b>✳</b>';
    ribbon.append(track);music.append(ribbon);
    const io=new IntersectionObserver(entries=>{
      visible=entries.some(e=>e.isIntersecting);
      music.classList.toggle('dir-in-view',visible&&!mq.matches);
      if(visible) queue();
    },{rootMargin:'12% 0px'});io.observe(music);
    function render(){
      ticking=false;
      if(!visible || mq.matches) return;
      const rect=music.getBoundingClientRect(),p=Math.min(1,Math.max(0,(innerHeight-rect.top)/(innerHeight+rect.height)));
      // Deslocamento real de 33vw enquanto a seção atravessa a viewport.
      track.style.transform=`translate3d(calc(-15% + ${((p-.5)*-33).toFixed(2)}vw),0,0)`;
      music.style.setProperty('--dir-music-progress',p.toFixed(3));
      state.musicScrollUpdates++;
    }
    function queue(){if(!ticking){ticking=true;requestAnimationFrame(render)}}
    addEventListener('scroll',queue,{passive:true});addEventListener('resize',queue,{passive:true});
    state.updateMusic=queue;
  }

  // FLIP: a miniatura cresce a partir de sua posição original até o centro da caixa de luz.
  // A imagem voadora é adicionada DENTRO do <dialog>, para respeitar o top layer do navegador.
  const dialog=$('#lightbox');
  doc.addEventListener('click',event=>{
    const button=event.target.closest('[data-gallery-index]');
    if(!button || !dialog || mq.matches || low) return;
    const thumb=$('img',button);if(!thumb)return;
    const start=thumb.getBoundingClientRect();
    const source=thumb.currentSrc || thumb.src;
    requestAnimationFrame(()=>{
      if(!dialog.open)return;
      const destination=$('#lightbox-img')?.getBoundingClientRect();
      if(!destination || destination.width<1)return;
      const flying=doc.createElement('img');flying.className='dir-gallery-fly';flying.alt='';flying.setAttribute('aria-hidden','true');flying.src=source;
      // FLIP invertido: só transform e opacity são animados (sem relayout por frame).
      const dx=start.left-destination.left,dy=start.top-destination.top;
      const sx=start.width/destination.width,sy=start.height/destination.height;
      Object.assign(flying.style,{left:`${destination.left}px`,top:`${destination.top}px`,width:`${destination.width}px`,height:`${destination.height}px`,borderRadius:'2px',transformOrigin:'top left'});
      dialog.append(flying);state.galleryFlips++;
      const animation=flying.animate([
        {transform:`translate3d(${dx}px,${dy}px,0) scale(${sx},${sy})`,opacity:1,filter:'brightness(.9)'},
        {transform:'translate3d(0,0,0) scale(1)',opacity:1,filter:'brightness(1)',offset:.80},
        {transform:'translate3d(0,0,0) scale(1)',opacity:0,filter:'brightness(1)'}
      ],{duration:low?450:790,easing:'cubic-bezier(.16,1,.3,1)',fill:'both'});
      animation.finished.catch(()=>{}).finally(()=>flying.remove());
      dialog.addEventListener('close',()=>{animation.cancel();flying.remove()},{once:true});
    });
  },true);
  if(dialog){
    let flashTimeout=0,opened=false;
    dialog.addEventListener('close',()=>{opened=false;dialog.classList.remove('dir-slide-switch')});
    // O observador só acompanha mudanças reais; não altera a lógica do app.js.
    const picture=$('#lightbox-img');
    new MutationObserver(()=>{
      if(!dialog.open)return;
      if(!opened){opened=true;return}
      dialog.classList.remove('dir-slide-switch');void dialog.offsetWidth;dialog.classList.add('dir-slide-switch');
      clearTimeout(flashTimeout);flashTimeout=setTimeout(()=>dialog.classList.remove('dir-slide-switch'),580);
    }).observe(picture,{attributes:true,attributeFilter:['src']});
  }
  mq.addEventListener('change',event=>{
    state.enabled=!event.matches;
    if(event.matches){opening?.remove();opening=null;heroTimer&&clearTimeout(heroTimer);music?.classList.remove('dir-in-view');}
    else if(music){music.classList.toggle('dir-in-view',visible);state.updateMusic?.()}
  });
})();
