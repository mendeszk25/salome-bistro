import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
test('Hero usa Boa comida. Muitas memórias e mantém os hooks de motion', () => {
  const html=readFileSync(resolve(root,'index.html'),'utf8');
  const css=readFileSync(resolve(root,'css/site.css'),'utf8');
  assert.match(html, /<h1 id="hero-title">Boa comida\.<br><em>Muitas<\/em> <span class="hero-memorias">memórias<\/span><\/h1>/);
  assert.ok(!html.includes('<br>histórias<span class="hero-stop">'));
  assert.match(css, /\.hero h1 \.hero-memorias \{ display:block; \}/);
  assert.match(readFileSync(resolve(root,'js/motion.js'),'utf8'), /#hero-title/);
});
