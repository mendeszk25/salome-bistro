import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const home=await readFile(path.join(root,'index.html'),'utf8');
const menu=await readFile(path.join(root,'cardapio-impresso.html'),'utf8');
const css=await readFile(path.join(root,'css','site.css'),'utf8');
test('Cabeçalho e rodapé mostram só lettering transparente sem emblema',()=>{
 assert.match(home,/class="logo-wordmark"/);
 assert.match(home,/class="footer-wordmark"><img/);
 assert.doesNotMatch(home,/class="logo-emblem"|class="footer-emblem"|class="logo-caption"/);
 assert.match(css,/\.logo-wordmark/);
 for(const section of ['inicio','a-casa','cozinha','cardapio','musica','galeria','visite']) assert.match(home,new RegExp(`id="${section}"`));
});
test('Marca tipográfica aplicada também ao cardápio impresso',()=>{
 assert.match(home,/og:image/);
 assert.match(home,/apple-touch-icon/);
 assert.match(menu,/class="print-brand"/);
 assert.match(menu,/assets\/brand\/salome-lettering.svg/);
 assert.doesNotMatch(menu,/salome-emblema-320.webp/);
});
test('Arquivos novos da marca existem',async()=>{
 for(const name of ['salome-lettering.svg','salome-lettering-transparente.png','salome-lettering-claro.webp','favicon.ico','icon-32.png','icon-180.png','salome-og.jpg']) {
  const st=await stat(path.join(root,'assets','brand',name)); assert.ok(st.size>0&&st.size<1024*1024,`${name}: inválido`);
 }
});
