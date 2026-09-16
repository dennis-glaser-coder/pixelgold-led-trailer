import fs from 'node:fs';

const DOMAIN = 'led-trailer.com';
const ORIGIN = `https://${DOMAIN}`;

function read(path) {
  if (!fs.existsSync(path)) {
    console.error(`SEO guard failed: missing ${path}`);
    process.exitCode = 1;
    return '';
  }
  return fs.readFileSync(path, 'utf8');
}

function fail(message) {
  console.error(`SEO guard failed: ${message}`);
  process.exitCode = 1;
}

const cname = read('CNAME').trim();
const robots = read('robots.txt');
const sitemap = read('sitemap.xml');

if (cname !== DOMAIN) fail(`CNAME must be exactly ${DOMAIN}, found: ${cname || '(empty)'}`);
if (!/User-agent:\s*\*/i.test(robots) || !/Allow:\s*\//i.test(robots)) fail('robots.txt must allow crawling');
if (!robots.includes(`Sitemap: ${ORIGIN}/sitemap.xml`)) fail('robots.txt must reference the production sitemap');

const urls = [...sitemap.matchAll(/<loc>(https:\/\/[^<]+)<\/loc>/g)].map(m => m[1]);
if (!urls.length) fail('sitemap contains no URLs');
if (!urls.includes(`${ORIGIN}/`)) fail('sitemap must contain the homepage');

for (const url of urls) {
  let parsed;
  try { parsed = new URL(url); } catch { fail(`invalid sitemap URL: ${url}`); continue; }
  if (parsed.origin !== ORIGIN) { fail(`non-production host in sitemap: ${url}`); continue; }
  if (!parsed.pathname.endsWith('/')) { fail(`sitemap URL must end with slash: ${url}`); continue; }
  const localPath = parsed.pathname === '/' ? 'index.html' : `${parsed.pathname.slice(1)}index.html`;
  const html = read(localPath);
  if (!html) continue;
  if (!html.includes('<meta name="robots" content="index,follow">')) fail(`${localPath} must explicitly contain robots index,follow`);
  if (/\bnoindex\b/i.test(html)) fail(`${localPath} contains noindex`);
  if (!html.includes(`<link rel="canonical" href="${url}">`)) fail(`${localPath} canonical must be ${url}`);
  if (/github\.io/i.test(html)) fail(`${localPath} contains a github.io host`);
  if (/https?:\/\/www\.led-trailer\.com/i.test(html)) fail(`${localPath} contains www instead of the canonical apex domain`);
}

const publicSeoFiles = [robots, sitemap, cname].join('\n');
if (/github\.io/i.test(publicSeoFiles)) fail('public SEO files contain a github.io host');
if (/https?:\/\/www\.led-trailer\.com/i.test(publicSeoFiles)) fail('public SEO files contain www instead of the canonical apex domain');

if (!process.exitCode) console.log(`SEO guard passed for ${urls.length} production URLs on ${ORIGIN}`);
