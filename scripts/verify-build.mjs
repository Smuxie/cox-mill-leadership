import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Check the deployable files, rather than assuming the source paths or bundler
// settings produced a complete static site. This makes missing CMS lazy chunks
// and broken event detail links fail the same build Cloudflare will deploy.
const project = fileURLToPath(new URL('../', import.meta.url));
const dist = path.join(project, 'dist');
const errors = [];
const fail = message => errors.push(message);
const assert = (condition, message) => { if (!condition) fail(message); };
if (!fs.existsSync(dist)) {
  console.error('Static build missing: run the Astro build before verify-build.mjs.');
  process.exit(1);
}

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes:true }).flatMap(entry => {
    const file = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) { fail(`Deployment must not contain a symbolic link: ${path.relative(dist,file)}`); return []; }
    return entry.isDirectory() ? walk(file) : [file];
  });
}
const files = walk(dist);
const relative = file => path.relative(dist,file).split(path.sep).join('/');
assert(files.length <= 20000, `Static build exceeds Pages Free's 20,000 file limit: ${files.length}`);
for (const file of files) {
  assert(fs.statSync(file).size <= 25 * 1024 * 1024, `Asset exceeds Pages' 25 MiB file limit: ${relative(file)}`);
  assert(!/(^|\/)(?:\.env(?:\.[^/]*)?|\.git|node_modules)(?:\/|$)/.test(relative(file)), `Private/development file found in deployment: ${relative(file)}`);
}
for (const file of ['functions','_worker.js','_routes.json']) {
  assert(!fs.existsSync(path.join(dist,file)), `Unexpected runtime deployment file/directory: dist/${file}`);
}
assert(!fs.existsSync(path.join(project,'functions')), 'Pages functions/ would create a runtime dependency; this project must stay static.');
const workflows = path.join(project,'.github','workflows');
assert(!fs.existsSync(workflows) || !walk(workflows).some(file => /\.ya?ml$/i.test(file)), 'GitHub Actions workflows are not permitted in this $0 native-Git deployment.');

const required = ['index.html','404.html','events/index.html','archive/index.html','about/index.html','contact/index.html','privacy/index.html','admin/index.html','admin/config.json','admin/cms.js','admin/init.js','admin/manual-init.js','admin/setup.css','_headers','favicon.svg'];
for (const name of required) assert(fs.existsSync(path.join(dist,name)), `Required deployment file missing: ${name}`);
const htmlFiles = files.filter(file => file.endsWith('.html'));
const html = new Map(htmlFiles.map(file => [file,fs.readFileSync(file,'utf8')]));
const decodeEntities = value => value.replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&#(\d+);/g,(_,code) => String.fromCodePoint(Number(code)));
const htmlIds = new Map([...html].map(([file,body]) => [file,new Set([...body.matchAll(/\bid\s*=\s*["']([^"']+)["']/gi)].map(match => decodeEntities(match[1])))]));
let checkedLinks = 0;
let checkedModules = 0;

function publicUrl(file) {
  const name = relative(file);
  return new URL(`/${name.endsWith('index.html') ? name.slice(0,-10) : name}`, 'https://static-build.invalid');
}
function resolveTarget(url) {
  let pathname;
  try { pathname = decodeURIComponent(url.pathname); }
  catch { return undefined; }
  const exact = path.resolve(dist, `.${pathname}`);
  if (exact !== dist && !exact.startsWith(`${dist}${path.sep}`)) return undefined;
  return [exact,`${exact}.html`,path.join(exact,'index.html')].find(file => fs.existsSync(file) && fs.statSync(file).isFile());
}
function checkReference(raw, from, { anchor=false, module=false } = {}) {
  const ref = decodeEntities(raw.trim());
  if (!ref || /^(?:https?:|mailto:|tel:|data:|blob:|\/\/)/i.test(ref)) return;
  if (/^[A-Za-z][A-Za-z\d+.-]*:/.test(ref)) { fail(`Unsupported URL scheme in ${relative(from)}: ${ref}`); return; }
  let url;
  try { url = new URL(ref,publicUrl(from)); }
  catch { fail(`Invalid URL in ${relative(from)}: ${ref}`); return; }
  const target = resolveTarget(url);
  checkedLinks++;
  if (!target) { fail(`Missing ${module?'module/asset':'local destination'} from ${relative(from)}: ${ref}`); return; }
  if (module) checkedModules++;
  if (anchor && url.hash && htmlIds.has(target)) {
    let id;
    try { id=decodeURIComponent(url.hash.slice(1)); }
    catch { fail(`Invalid fragment in ${relative(from)}: ${ref}`); return; }
    assert(htmlIds.get(target).has(id), `Missing anchor from ${relative(from)}: ${ref}`);
  }
}

for (const [file,body] of html) {
  for (const tag of body.matchAll(/<([A-Za-z][\w:-]*)\b([^>]*?)>/g)) {
    for (const attr of tag[2].matchAll(/\b(href|src|poster|action)\s*=\s*(["'])(.*?)\2/gi)) checkReference(attr[3],file,{anchor:attr[1].toLowerCase()==='href'});
    for (const attr of tag[2].matchAll(/\bsrcset\s*=\s*(["'])(.*?)\1/gi)) {
      if (!attr[2].startsWith('data:')) for (const candidate of attr[2].split(',')) checkReference(candidate.trim().split(/\s+/)[0],file);
    }
  }
}

for (const file of files.filter(file => /\.(?:m?js|css)$/.test(file))) {
  const body = fs.readFileSync(file,'utf8');
  if (/\.(?:m?js)$/.test(file)) {
    // Covers ESM imports/exports and literal dynamic imports emitted by Vite.
    // Deliberately ignores arbitrary strings in syntax grammars or UI content.
    for (const match of body.matchAll(/(?:\bfrom\s*|\bimport\s*(?:\(\s*)?)(["'])(\.{1,2}\/[^"']+)\1/g)) checkReference(match[2],file,{module:true});
    for (const match of body.matchAll(/new URL\(\s*(["'])(\.{1,2}\/[^"']+\.(?:wasm|m?js|css|woff2?))\1\s*,\s*import\.meta\.url/g)) checkReference(match[2],file,{module:true});
  } else {
    for (const match of body.matchAll(/url\(\s*(["']?)([^'"()]+)\1\s*\)/g)) checkReference(match[2],file);
  }
}
const cmsFile = path.join(dist,'admin','cms.js');
if (fs.existsSync(cmsFile)) {
  const cms = fs.readFileSync(cmsFile,'utf8');
  assert(!/(?:from\s*|import\s*\()\s*["']@sveltia\/cms/.test(cms), 'CMS package import was not bundled for the browser.');
  assert(files.some(file => relative(file).startsWith('admin/chunks/') && file.endsWith('.js')), 'CMS lazy chunks were not included in dist/admin/chunks/.');
}
if (errors.length) {
  console.error(`Static deployment verification failed (${errors.length}):\n${errors.join('\n')}`);
  process.exitCode=1;
} else {
  console.log(`Static deployment verified: ${htmlFiles.length} HTML pages, ${files.length} files, ${checkedLinks} local references (${checkedModules} module/asset imports). No Pages runtime or Actions workflow found.`);
}
