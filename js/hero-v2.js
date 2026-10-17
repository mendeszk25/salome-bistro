/* Hero v2 — editorial Art Déco. Progressive enhancement e scrub por scroll.
   Uma única RAF por evento de scroll; sem timers permanentes nem bibliotecas.
   A fonte de verdade é a seção .hero-journey do documento. */
(() => {
  'use strict';
  const journey=document.querySelector('.hero-journey');
  const hero=journey?.querySelector('.hero-v2');
  if(!journey||!hero)return;
  const root=document.documentElement;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const photo=hero.querySelector('.hero-art');
  const title=hero.querySelector('#hero-title');
  const eyebrow=hero.querySelector('.hero-strap');
  const description=hero.querySelector('.hero-description');
  const buttons=[...hero.querySelectorAll('.hero-buttons>a')];
  const between=(a,b,x)=>{const v=Math.max(0,Math.min(1,(x-a)/(b-a)));return v*v*(3-2*v)};
  const clamp=x=>Math.max(0,Math.min(1,x));
  const state={edition:'hero-v2.9.3',scrollProgress:0,sceneUpdates:0,replays:0};
  window.SalomeHeroV2=state;
  let queued=false;
  const update=()=>{
    queued=false;
    if(reduced.matches)return;
    const rect=journey.getBoundingClientRect();
    // A progressão acompanha toda a pista sticky; o CSS define a distância em svh.
    const travel=Math.max(1,journey.offsetHeight-innerHeight);
    const p=clamp((-rect.top+(parseFloat(getComputedStyle(root).getPropertyValue('--h2-head'))||76))/travel);
    state.scrollProgress=p;
    root.style.setProperty('--h2-scroll',p.toFixed(4));
    root.style.setProperty('--h2-photo',between(.12,.89,p).toFixed(4));
    root.style.setProperty('--h2-title',between(.42,.98,p).toFixed(4));
    state.sceneUpdates++;
  };
  const queue=()=>{if(!queued){queued=true;requestAnimationFrame(update)}};
  addEventListener('scroll',queue,{passive:true});addEventListener('resize',queue,{passive:true});
  const animate=(el,keyframes,opt)=>el?.animate?.(keyframes,{fill:'both',easing:'cubic-bezier(.16,1,.3,1)',...opt});
  let playing=false;
  function replay(){
    if(reduced.matches||playing||document.hidden)return;
    playing=true;state.replays++;
    const active=[];
    const a=animate(photo,[{clipPath:'inset(14% 10% 12% 10%)',opacity:.6},{clipPath:'inset(0% 0% 0% 0%)',opacity:1}],{duration:1160,easing:'cubic-bezier(.76,0,.24,1)'});if(a)active.push(a);
    const b=animate(title,[{opacity:0,transform:'translate3d(0,38px,0)',filter:'blur(5px)'},{opacity:1,transform:'none',filter:'blur(0)'}],{duration:1100,delay:140});if(b)active.push(b);
    [eyebrow,description,...buttons].filter(Boolean).forEach((el,i)=>{const m=animate(el,[{opacity:0,transform:'translateY(16px)'},{opacity:1,transform:'none'}],{duration:660,delay:380+i*90});if(m)active.push(m)});
    Promise.all(active.map(a=>a.finished.catch(()=>{}))).finally(()=>{active.forEach(a=>a.cancel());playing=false});
  }
  state.replay=replay;
  // Entrada única após fontes estarem prontas; sem esconder a página se o JS falhar.
  let introStarted=false;
  Promise.race([document.fonts?.ready||Promise.resolve(),new Promise(r=>setTimeout(r,550))]).then(()=>{
    if(!introStarted && !reduced.matches && scrollY<180){introStarted=true;requestAnimationFrame(replay)}
  });
  reduced.addEventListener('change',()=>{
    if(reduced.matches){for(const n of ['--h2-scroll','--h2-photo','--h2-title'])root.style.setProperty(n,'0');}
    else queue();
  });
  // A próxima seção é Nossa História original: não há painel intermediário nem tela bege vazia.
  update();
})();
