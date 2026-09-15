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
const index = read('index.html');
const robots = read('robots.txt');
const sitemap = read('sitemap.xml');

if (cname !== DOMAIN) {
  fail(`CNAME must be exactly ${DOMAIN}, found: ${cname || '(empty)'}`);
}

if (!index.includes('<meta name="robots" content="index,follow">')) {
  fail('homepage must explicitly contain robots index,follow');
}

if (/\bnoindex\b/i.test(index)) {
  fail('homepage contains noindex');
}

if (!index.includes(`<link rel="canonical" href="${ORIGIN}/">`)) {
  fail(`homepage canonical must be ${ORIGIN}/`);
}

if (!/User-agent:\s*\*/i.test(robots) || !/Allow:\s*\//i.test(robots)) {
  fail('robots.txt must allow crawling');
}

if (!robots.includes(`Sitemap: ${ORIGIN}/sitemap.xml`)) {
  fail('robots.txt must reference the production sitemap');
}

if (!sitemap.includes(`<loc>${ORIGIN}/</loc>`)) {
  fail('sitemap must contain the production homepage URL');
}

const publicSeoFiles = [index, robots, sitemap, cname].join('\n');
if (/github\.io/i.test(publicSeoFiles)) {
  fail('public SEO files contain a github.io host');
}

if (/https?:\/\/www\.led-trailer\.com/i.test(publicSeoFiles)) {
  fail('public SEO files contain www host instead of the canonical apex domain');
}

if (!process.exitCode) {
  console.log(`SEO guard passed for ${ORIGIN}/`);
}
