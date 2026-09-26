import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

const copy = (src, dest = path.basename(src)) => {
  const from = path.join(root, src);
  const to = path.join(dist, dest);
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.cpSync(from, to, { recursive: true });
};

// V2 allowlist: legacy/ is intentionally excluded from the deploy artifact.
copy('index.html');
copy('app', 'app');
copy('styles', 'styles');
if (fs.existsSync(path.join(root, 'data'))) copy('data', 'data');
if (fs.existsSync(path.join(root, 'assets'))) copy('assets', 'assets');

fs.writeFileSync(path.join(dist, 'v2-runtime.json'), JSON.stringify({
  version: '2.0.0',
  build: new Date().toISOString(),
  runtime: 'experience-first',
  legacyDeployed: false
}, null, 2));

console.log('V2 build complete:', dist);
console.log('Legacy excluded from deployment artifact: true');
