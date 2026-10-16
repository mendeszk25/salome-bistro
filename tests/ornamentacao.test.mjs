import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const html=await readFile(join(root,'index.html'),'utf8');
const css=await readFile(join(root,'css/site.css'),'utf8');
const ornaments=['filete-deco','cantoneira-deco','selo-anel-deco','gravura-abacaxi','gravura-citrico','sanfona-linear','ritmo-poster','cantoneira-cartaz'];
test('oito ornamentos originais disponíveis',async()=>{
  for(const n of ornaments){const p=join(root,'assets/ornamentos',`${n}.svg`);const s=await readFile(p,'utf8');assert.match(s,/<svg/);assert.match(s,/<\/svg>/);}
});
test('hero gastronomia e música integram o sistema de ornamentos',()=>{
  for(const n of ['hero-corner-ornament','kitchen-engraving','kitchen-citrus','music-accordion','music-rhythm'])assert.ok(html.includes(n),n);
  for(const n of ornaments)assert.ok(html.includes(n)||css.includes(n),n);
});
test('ornamentos são decorativos e se adaptam às telas',()=>{
  assert.match(css,/\.ornament\{[^}]*pointer-events:none/);
  assert.match(html,/class="ornament hero-corner-ornament"[^>]*alt="" aria-hidden="true"/);
  assert.match(css,/\.hero-art>\.hero-corner-ornament\{width:93px;height:93px/);
  assert.match(css,/@media\(max-width:650px\)/);
  assert.match(css,/prefers-reduced-motion/);
});
