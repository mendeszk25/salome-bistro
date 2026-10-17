/* Salomé iPhone Motion Fix — preference manager, iOS-safe icons and accessible control.
   Only runs on iPhone-sized iOS Safari; desktop and Android markup are untouched. */
(() => {
  'use strict';
  const os = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width:650px)');
  const iphone = /iPhone|iPod/i.test(navigator.userAgent) || (/MacIntel/.test(navigator.platform) && navigator.maxTouchPoints > 1 && /Mobile/.test(navigator.userAgent));
  const active = () => iphone && mobile.matches;
  const storageKey = 'salome-iphone-motion-choice-v1';
  const saved = () => { try { return localStorage.getItem(storageKey); } catch (_) { return null; } };
  let choice = ['full', 'reduce', 'system'].includes(saved()) ? saved() : 'system';
  const shouldReduce = () => !active() ? os.matches : choice === 'reduce' || (choice !== 'full' && os.matches);
  function sync() {
    const root = document.documentElement;
    root.classList.toggle('iphone-device', active());
    root.classList.toggle('iphone-motion-full', active() && choice === 'full' && os.matches);
    root.classList.toggle('iphone-motion-reduced', active() && shouldReduce());
    root.classList.toggle('mo-reduced', active() && shouldReduce());
  }
  window.SalomeIphoneMotion = { isIphone: active, shouldReduce, getChoice: () => choice, osReduced: () => os.matches };
  sync();
  if (!active()) return;

  const NS = 'http://www.w3.org/2000/svg';
  const paths = {
    '✳': '<path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93 4.93 19.07"/>',
    '✦': '<path d="M12 2l2.6 7.4L22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6Z"/>',
    '↗': '<path d="M5 19 19 5M8 5h11v11"/>',
    '↓': '<path d="M12 3v18m-7-7 7 7 7-7"/>',
    '↑': '<path d="M12 21V3m-7 7 7-7 7 7"/>',
    '←': '<path d="M21 12H3m7-7-7 7 7 7"/>',
    '→': '<path d="M3 12h18m-7-7 7 7-7 7"/>',
    '↻': '<path d="M21 5v6h-6M20 11A8 8 0 1 0 19 16"/>',
    '↺': '<path d="M3 5v6h6M4 11a8 8 0 1 1 1 5"/>'
  };
  const chars = /[✳✦↗↓↑←→↻↺]/g;
  function icon(symbol) {
    const span = document.createElement('span');
    span.className = 'iphone-symbol' + ('✳✦'.includes(symbol) ? ' iphone-symbol-star' : '');
    span.setAttribute('aria-hidden', 'true');
    const svg = document.createElementNS(NS,'svg');
    svg.setAttribute('viewBox','0 0 24 24'); svg.setAttribute('width','16'); svg.setAttribute('height','16');
    svg.setAttribute('focusable','false'); svg.setAttribute('aria-hidden','true');
    svg.innerHTML = paths[symbol];
    span.append(svg);
    return span;
  }
  function replaceIn(root) {
    if (!root || !root.isConnected) return;
    const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes=[];let node;
    while ((node=walk.nextNode())) {
      if (!chars.test(node.nodeValue)) { chars.lastIndex=0; continue; }
      chars.lastIndex=0;
      if (node.parentElement?.closest('script,style,noscript,textarea,svg,.iphone-symbol,[contenteditable]')) continue;
      nodes.push(node);
    }
    nodes.forEach(n=>{
      const text=n.nodeValue, frag=document.createDocumentFragment();let last=0,m;
      chars.lastIndex=0;
      while ((m=chars.exec(text))) {
        if (m.index>last) frag.append(document.createTextNode(text.slice(last,m.index)));
        frag.append(icon(m[0]));last=m.index+1;
      }
      if (last<text.length) frag.append(document.createTextNode(text.slice(last)));
      n.replaceWith(frag);
    });
    chars.lastIndex=0;
  }
  function interfaceInit() {
    const actions = document.querySelector('.head-actions');
    if (!actions) return;
    const button = document.createElement('button');
    button.type='button';button.className='iphone-motion-toggle';
    button.setAttribute('aria-label','Configurar animações');
    button.setAttribute('aria-expanded','false');
    button.setAttribute('aria-controls','iphone-motion-panel');
    button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2v20M2 12h20M5 5l14 14M19 5 5 19"/></svg>';
    const panel=document.createElement('div');panel.id='iphone-motion-panel';panel.className='iphone-motion-panel';panel.hidden=true;
    panel.setAttribute('role','group');panel.setAttribute('aria-label','Preferência de animação do site');
    actions.prepend(button); actions.append(panel);
    const close=()=>{panel.hidden=true;button.setAttribute('aria-expanded','false');};
    const open=()=>{
      const isReduced=shouldReduce();
      panel.replaceChildren();
      const header=document.createElement('strong');header.textContent='Animações do Salomé'; panel.append(header);
      const description=document.createElement('p');
      description.textContent=os.matches ? 'O iPhone está com Movimento Reduzido. Você pode manter a experiência tranquila ou escolher ver as animações completas.' : 'Escolha a intensidade das animações neste iPhone.';
      panel.append(description);
      const options=[
        {value:'full',label:'Ativar animações completas'},
        {value:'reduce',label:'Usar movimento reduzido'},
        {value:'system',label:'Seguir ajuste do iPhone'}
      ];
      options.forEach(option=>{
        const b=document.createElement('button');b.type='button';b.className='iphone-motion-option';
        b.textContent=(choice===option.value ? '✓ ' : '')+option.label;
        b.setAttribute('aria-pressed',String(choice===option.value));
        b.addEventListener('click',()=>{
          if (choice===option.value) {close();return;}
          choice=option.value;
          try {localStorage.setItem(storageKey,choice);} catch (_) {}
          sync();close();
          // Existing motion engines initialize observers and scene state once; a controlled
          // reload is safer than concurrent partial reinitializations or hidden content.
          location.reload();
        });panel.append(b);
      });
      const state=document.createElement('small');state.textContent=isReduced ? 'Agora: efeitos reduzidos' : 'Agora: animações completas'; panel.append(state);
      panel.hidden=false;button.setAttribute('aria-expanded','true');
    };
    button.addEventListener('click',()=>{if(panel.hidden)open();else close();});
    document.addEventListener('click',e=>{if(!panel.hidden&&!actions.contains(e.target))close();});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden){close();button.focus();}});
  }
  function initialize() {
    sync();
    replaceIn(document.body);
    interfaceInit();
    // Dynamic signs in music marquee, menu and replay are converted too.
    let task=0;
    const observer=new MutationObserver(mutations=>{
      if(!mutations.some(m=>m.addedNodes.length||m.type==='characterData'))return;
      if(task)return;
      task=requestAnimationFrame(()=>{task=0;observer.disconnect();replaceIn(document.body);observer.observe(document.body,{childList:true,subtree:true,characterData:true});});
    });
    observer.observe(document.body,{childList:true,subtree:true,characterData:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize,{once:true});else initialize();
  os.addEventListener('change',()=>{sync(); location.reload();});
  mobile.addEventListener('change',()=>{sync();if(active()) location.reload();});
})();
