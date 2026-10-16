import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const keys=['cantoneira-deco','filete-deco','selo-anel-deco','gravura-abacaxi','gravura-citrico','sanfona-linear','ritmo-poster','flor-musica-culinaria','cantoneira-cartaz'];
test('nove ornamentos detalhados são vetores reais sem imagens raster embutidas', async()=>{
 for(const k of keys) {
  const xml=await readFile(join(root,'assets','ornamentos',k+'.svg'),'utf8');
  assert.match(xml,/<svg[^>]+viewBox=/,k);
  assert.match(xml,/<title>/,k);
  assert.doesNotMatch(xml,/<image|data:image\/(png|jpeg|webp)/i,k);
  assert.ok((xml.match(/<path/g)||[]).length >= 2,k);
 }
});
test('ornamentos de gravura possuem detalhes vetoriais suficientes',async()=>{
 for(const k of ['gravura-abacaxi','gravura-citrico','sanfona-linear']) {
  const xml=await readFile(join(root,'assets/ornamentos',k+'.svg'),'utf8');
  assert.ok(xml.length>5000,k);
 }
});
test('ornamentos continuam decorativos e nova assinatura não compete com textos',async()=>{
 const html=await readFile(join(root,'index.html'),'utf8');
 const css=await readFile(join(root,'css/site.css'),'utf8');
 assert.match(html,/class="ornament welcome-signature"[^>]*alt="" aria-hidden="true"/);
 assert.match(html,/class="ornament footer-signature"[^>]*alt="" aria-hidden="true"/);
 assert.match(css,/\.welcome-signature\s*\{[^}]*opacity:\.23/);
 assert.ok(css.includes('.welcome-signature {display:none;}'));
});
