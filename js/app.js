/* Salomé Bistrô — Boa comida, muitas histórias. Comportamento sem dependências. */
(() => {
  'use strict';
  const q = (selector,root=document) => root.querySelector(selector);
  const qa = (selector,root=document) => [...root.querySelectorAll(selector)];
  const toggle = q('#menu-toggle');
  const mobileNav = q('#mobile-nav');
  function setNav(open){
    if(!toggle||!mobileNav)return;
    toggle.setAttribute('aria-expanded',String(open));
    toggle.setAttribute('aria-label',open?'Fechar navegação':'Abrir navegação');
    mobileNav.hidden=!open;
  }
  window.matchMedia('(min-width: 901px)').addEventListener('change',e=>{if(e.matches)setNav(false);});
  toggle?.addEventListener('click',()=>setNav(toggle.getAttribute('aria-expanded')!=='true'));
  qa('#mobile-nav a').forEach(link=>link.addEventListener('click',()=>setNav(false)));
  document.addEventListener('click',e=>{if(mobileNav && !mobileNav.hidden && !e.target.closest('.site-header'))setNav(false);});
  document.addEventListener('keydown',e=>{if(e.key==='Escape' && mobileNav && !mobileNav.hidden){setNav(false);toggle?.focus();}});

  const categoryRoot=q('#menu-categories'); const results=q('#menu-results');
  const search=q('#menu-search'); const status=q('#menu-status'); const reset=q('#menu-reset');
  const catalog=(typeof MENU !== 'undefined' && MENU && typeof MENU==='object')?MENU:{};
  const all=Object.entries(catalog).flatMap(([category,items])=>items.map(item=>({...item,category})));
  let active='Todos',term='',shown=10;
  function elem(tag,cls,value){const e=document.createElement(tag);if(cls)e.className=cls;if(value!==undefined)e.textContent=String(value);return e;}
  function normalize(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');}
  function makeRow(item){
    const row=elem('article','menu-item');
    const info=elem('div','item-info');info.append(elem('h3','',item.n||'Prato'),elem('p','item-section',item.category));
    if(item.d)info.append(elem('p','item-description',item.d));
    const price=elem('p','item-price');const prices=(item.precos||[]).filter(p=>p.value);
    if(prices.length===1){if(prices[0].label)price.append(elem('small','',prices[0].label));price.append(document.createTextNode('R$ '+prices[0].value));}
    else if(prices.length>1){prices.forEach(p=>price.append(elem('small','',`${p.label?p.label+': ':''}R$ ${p.value}`)));}
    if(!prices.length)price.textContent='Consulte a casa';
    row.tabIndex=-1;row.append(info,price);return row;
  }
  function render(){
    if(!results)return;
    const matches=all.filter(x=>(active==='Todos'||active===x.category)&&normalize(`${x.n||''} ${x.d||''} ${x.category}`).includes(normalize(term)));
    status.textContent=`${matches.length} ${matches.length===1?'item encontrado':'itens encontrados'} · ${Math.min(shown,matches.length)} ${Math.min(shown,matches.length)===1?'exibido':'exibidos'}`;
    results.replaceChildren();
    if(!matches.length){results.append(elem('p','menu-empty','Nenhum prato encontrado. Tente outra categoria ou outro nome.'));return;}
    matches.slice(0,shown).forEach(x=>results.append(makeRow(x)));
    if(matches.length>shown){const wrap=elem('div','menu-show-more');const button=elem('button','load-more',`Ver mais ${Math.min(10,matches.length-shown)} itens ↓`);button.type='button';button.addEventListener('click',()=>{const firstNew=shown;shown+=10;render();qa('.menu-item',results)[firstNew]?.focus({preventScroll:true});});wrap.append(button);results.append(wrap);}
  }
  if(all.length && categoryRoot && results && search){
    for(const category of Object.keys(catalog)){const b=elem('button','category',category);b.type='button';b.dataset.category=category;b.setAttribute('aria-pressed','false');categoryRoot.append(b);}
    categoryRoot.addEventListener('click',e=>{const button=e.target.closest('button[data-category]');if(!button)return;active=button.dataset.category;shown=10;qa('button[data-category]',categoryRoot).forEach(b=>{const yes=b===button;b.classList.toggle('active',yes);b.setAttribute('aria-pressed',String(yes));});render();});
    search.addEventListener('input',()=>{term=search.value.trim();shown=10;render();});
    reset?.addEventListener('click',()=>{active='Todos';term='';shown=10;search.value='';qa('button[data-category]',categoryRoot).forEach(b=>{const yes=b.dataset.category==='Todos';b.classList.toggle('active',yes);b.setAttribute('aria-pressed',String(yes));});render();});
    render();
  } else if(results){status.textContent='Cardápio indisponível';results.textContent='Consulte o cardápio no restaurante.';}

  const photos=[
    ['assets/letreiro.jpg','Detalhe do letreiro Salomé na fachada'],
    ['assets/area-externa.jpg','Área externa do Salomé com plantas e luzes'],
    ['assets/gastronomia/abacaxi-real.webp','Prato do Salomé servido em abacaxi'],
    ['assets/calcada-pilar.jpg','Detalhes da entrada com vegetação'],
    ['assets/scooter.jpg','Scooter azul no jardim da entrada']
  ];
  const modal=q('#lightbox');const modalImg=q('#lightbox-img');const modalCaption=q('#lightbox-caption');
  let current=0,opener=null;
  modalImg?.addEventListener('error',()=>{modalImg.hidden=true;modalCaption.textContent=`${current+1} / ${photos.length} — Imagem indisponível. Use as setas para continuar.`;});
  function slide(idx){current=(idx+photos.length)%photos.length;modalImg.hidden=false;modalImg.src=photos[current][0];modalImg.alt=photos[current][1];modalCaption.textContent=`${current+1} / ${photos.length} — ${photos[current][1]}`;}
  qa('[data-gallery-index]').forEach(button=>button.addEventListener('click',()=>{if(typeof modal?.showModal!=='function')return;opener=button;slide(Number(button.dataset.galleryIndex));modal.showModal();document.body.classList.add('gallery-open');}));
  q('.lightbox-close')?.addEventListener('click',()=>modal.close());
  q('.lightbox-prev')?.addEventListener('click',()=>slide(current-1));
  q('.lightbox-next')?.addEventListener('click',()=>slide(current+1));
  modal?.addEventListener('click',e=>{if(e.target===modal)modal.close();});
  modal?.addEventListener('close',()=>{document.body.classList.remove('gallery-open');opener?.focus();});
  modal?.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();slide(current+1);}if(e.key==='ArrowLeft'){e.preventDefault();slide(current-1);}});
})();
