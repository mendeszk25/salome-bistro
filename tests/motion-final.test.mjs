import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';
const root=process.cwd();
const motion=readFileSync(join(root,'js/motion.js'),'utf8');
const css=readFileSync(join(root,'css/motion.css'),'utf8');
const html=readFileSync(join(root,'index.html'),'utf8');
const app=readFileSync(join(root,'js/app.js'),'utf8');
test('motor de motion mantém módulos das Fases 1–4',()=>{
  for (const name of ['hero','story','kitchen','cardapioMotion','musicMotion','togetherMotion','galleryMotion','endingMotion'])
    assert.match(motion,new RegExp('function '+name+'\\('));
});
test('motion tem economia de recursos e preserva reduced motion e touch',()=>{
  assert.match(motion,/prefers-reduced-motion/);assert.match(motion,/flags\.touch/);
  assert.match(motion,/navigator\.deviceMemory/);assert.match(motion,/IntersectionObserver/);
  assert.match(motion,/const subs = new Set\(\)/);
});
test('cardápio tem pesquisa, categorias, carregamento e estado vazio sem animar tudo',()=>{
  assert.match(app,/normalize\(term\)/); assert.match(app,/shown\+=10/);
  assert.match(app,/Nenhum prato encontrado/);
  assert.match(motion,/Math\.min\(count, start \+ 10\)/);
});
test('galeria preserva dialog nativo, Escape, setas e touch',()=>{
  assert.match(html,/<dialog class="lightbox"/);
  assert.match(app,/modal\.showModal\(\)/); assert.match(app,/ArrowRight/);
  assert.match(app,/lightbox-close/);assert.match(motion,/pointerleave/);
  assert.match(css,/pointer:coarse/);
});
test('build possui apenas recursos locais sem dependência JS nova',()=>{
  for(const p of ['js/motion.js','css/motion.css','js/app.js','assets/brand/salome-lettering.svg'])assert.ok(existsSync(join(root,p)),p);
  assert.match(html,/<script defer src="js\/motion.js"><\/script>/);
});
