import {cp,mkdir,rm} from 'node:fs/promises';import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');const dest=resolve(root,'dist');
await rm(dest,{recursive:true,force:true});await mkdir(dest,{recursive:true});
for(const f of ['index.html','cardapio-impresso.html','assets','css','js'])await cp(resolve(root,f),resolve(dest,f),{recursive:true});
console.log('Build concluído:',dest);
