import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {join} from 'node:path';
const root=new URL('../',import.meta.url).pathname;
const index=readFileSync(join(root,'index.html'),'utf8');
const js=readFileSync(join(root,'js/motion-encore.js'),'utf8');
const css=readFileSync(join(root,'css/motion-encore.css'),'utf8');
test('motion perceptível v2.6 incluído no HTML e no build',()=>{
 assert.match(index,/href="css\/motion-encore\.css"/);
 assert.match(index,/src="js\/motion-encore\.js"/);
 assert.ok(existsSync(join(root,'js/motion-encore.js')));
});
test('Replay Hero e navegação com cortina acessíveis',()=>{
 assert.match(js,/Rever abertura/);
 assert.match(js,/mo-cinematic-curtain/);
 assert.match(js,/history\.pushState/);
 assert.match(js,/state\.replays\+\+/);
});
test('Animações perceptíveis e scroll progressivo com acessibilidade',()=>{
 assert.match(js,/state\.entries\+\+/);
 assert.match(js,/state\.scrollFrames\+\+/);
 assert.match(js,/prefers-reduced-motion: reduce/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
 assert.match(css,/overflow-x:clip/);
});
