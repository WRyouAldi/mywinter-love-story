import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd(),dist=path.join(root,'dist');fs.rmSync(dist,{recursive:true,force:true});fs.mkdirSync(dist,{recursive:true});
const copy=(src,dest=path.basename(src))=>{const from=path.join(root,src),to=path.join(dist,dest);fs.mkdirSync(path.dirname(to),{recursive:true});fs.cpSync(from,to,{recursive:true});};
// V2 deployment allowlist. legacy/ and all V1 runtime files are excluded.
['index.html','app','design','data','assets'].forEach(src=>{if(fs.existsSync(path.join(root,src)))copy(src,src);});
fs.writeFileSync(path.join(dist,'v2-runtime.json'),JSON.stringify({version:'2.0.0',design:'editorial-memory',build:new Date().toISOString(),legacyDeployed:false},null,2));
console.log('V2 build complete. Editorial design included; legacy excluded.');
