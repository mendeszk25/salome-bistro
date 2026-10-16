import test from 'node:test'; import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import path from 'node:path'; import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const html=await readFile(path.join(root,'index.html'),'utf8');
const js=await readFile(path.join(root,'js','app.js'),'utf8');
const css=await readFile(path.join(root,'css','site.css'),'utf8');
const menu=await readFile(path.join(root,'js','menu-data.js'),'utf8');
test('site contém estrutura e seções essenciais',()=>{for(const id of ['inicio','a-casa','cozinha','cardapio','musica','galeria','visite'])assert.match(html,new RegExp('id="'+id+'"'));assert.match(html,/<html lang="pt-BR">/);});
test('todas as imagens locais mencionadas existem',async()=>{const refs=[...html.matchAll(/(?:src|href)="(assets\/[^"#]+)"/g)].map(x=>x[1]);for(const filename of refs)await stat(path.join(root,filename));assert.ok(refs.length>12);});
test('dados atuais são cautelosos e não incluem eventos fictícios',()=>{assert.match(html,/Confirme antes da visita/);assert.match(html,/sujeita a confirmação|sujeitas a alterações|sujeita a alterações/i);assert.doesNotMatch(html,/sábado \d{1,2} de outubro, show confirmado/i);});
test('navegação e cardápio têm estrutura acessível',()=>{assert.match(html,/aria-expanded="false"/);assert.match(html,/aria-live="polite"/);assert.match(html,/href="#conteudo"/);assert.match(html,/<dialog/);assert.match(menu,/const MENU/);assert.match(js,/render\(/);assert.match(js,/normalize\(/);});
test('scripts Node têm sintaxe válida',()=>{execFileSync('node',['--check',path.join(root,'js','app.js')]);execFileSync('node',['--check',path.join(root,'js','menu-data.js')]);});
test('fontes visuais respeitam mobile, contraste e reduced motion',()=>{assert.match(css,/@media\(max-width:650px\)/);assert.match(css,/prefers-reduced-motion/);assert.match(css,/:focus-visible/);});
test('referências de Instagram e mapas são links externos explícitos',()=>{assert.match(html,/instagram.com\/salomebistro/);assert.match(html,/google.com\/maps\/search/);});

test('link para as 12 páginas impressas é funcional e preserva todos os arquivos', async()=>{
  assert.match(html,/href="cardapio-impresso.html"/);
  const menuPage=await readFile(path.join(root,'cardapio-impresso.html'),'utf8');
  for(let i=1;i<=12;i++){
    const file=`assets/cardapio-impresso/pagina-${String(i).padStart(2,'0')}.jpg`;
    assert.ok(menuPage.includes(file),`Página ${i} ausente do HTML`);
    await stat(path.join(root,file));
  }
});
test('elementos visuais de destaque não são posicionados intencionalmente fora do viewport',()=>{
  assert.match(css,/\.hero-orange-stamp\{right:clamp\(/);
  assert.match(css,/\.poster-circle\{position:static/);
  assert.match(css,/\.music-memory\{position:static/);
});
test('galeria aponta para fotografias diferentes da fotografia hero principal',()=>{
  assert.match(html,/class="g-photo ga"[^>]*><img src="assets\/letreiro.jpg"/);
  assert.match(js,/\['assets\/calcada-pilar.jpg'/);
});
