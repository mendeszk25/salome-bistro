import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const html=read('index.html'),main=read('js/motion.js'),encore=read('js/motion-encore.js'),director=read('js/motion-director.js'),css=read('css/motion-director.css');

test('Motion Director v2.7 carregado após app e motores existentes',()=>{
  assert.match(html, /css\/motion-director\.css/);
  assert.match(html, /js\/motion-encore\.js"><\/script><script defer src="js\/motion-director\.js/);
  assert.ok(existsSync(new URL('../js/motion-director.js',import.meta.url)));
});
test('Reutiliza lightbox e âncoras sem bloquear a lógica do cardápio',()=>{
  assert.match(director, /data-gallery-index/);
  assert.match(director, /dialog\.open/);
  assert.doesNotMatch(director, /showModal\(/);
  assert.match(encore, /skip-link/);
  assert.match(html, /<main id="conteudo" tabindex="-1">/);
  assert.match(encore, /target\.focus\(\{preventScroll:true\}\)/);
});
test('Ticker sob demanda adormece quando parado',()=>{
  assert.match(main, /t - activityAt < 420/);
  assert.match(main, /const onScroll = \(\) => \{ S\.y = scrollY; wake\(\); \}/);
  assert.match(main, /stats\.sleeps\+\+/);
});
test('Motion reduzido protege Hero e mantém texto legível',()=>{
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.match(css, /html\.mo-reduced/);
  assert.match(director, /mq\.addEventListener\('change'/);
  assert.match(html, /Boa comida\.<br><em>Muitas<\/em> <span class="hero-memorias">memórias<\/span>/);
});
test('Cenas de Hero, Música e Galeria preservam semântica e interação',()=>{
  assert.match(director, /dir-hero-opening/);
  assert.match(director, /dir-music-band/);
  assert.match(director, /dir-gallery-fly/);
  assert.match(director, /setAttribute\('aria-hidden','true'\)/);
  assert.doesNotMatch(director,/\.addEventListener\('keydown'/);
});
