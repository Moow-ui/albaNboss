// scripts/generate-sitemap.js
// 포털 정적 페이지 목록으로 sitemap.xml·robots.txt를 만든다.
// 주소는 site-url.js를 통해 data/site.json의 site_url 한 곳에서만 읽는다.
// 실행: node scripts/generate-sitemap.js

const fs = require('fs');
const path = require('path');
const { siteUrl } = require('./site-url');

const ROOT_DIR = path.resolve(__dirname, '..');
const BASE = siteUrl();

function stripComments(raw) {
  return raw.replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*/g, '');
}

function readJson(relPath) {
  return JSON.parse(stripComments(fs.readFileSync(path.join(ROOT_DIR, relPath), 'utf8')));
}

// 2026-W40 대표지시 3단계: /tips/<slug>/·/qa/<slug>/ 개별 페이지를 sitemap에 자동 등록한다.
// (1단계에서 생성된 slug만 반영. slug 없는 항목은 목록 페이지로만 노출되므로 건너뛴다.)
function slugPages(relPath, prefix) {
  const items = readJson(relPath);
  return items
    .filter((item) => item.slug)
    .map((item) => ({ loc: `/${prefix}/${item.slug}/`, priority: '0.6', changefreq: 'monthly' }));
}

const PAGES = [
  { loc: '/', priority: '1.0', changefreq: 'daily' },
  { loc: '/wage/', priority: '0.9', changefreq: 'weekly' },
  { loc: '/policy.html', priority: '0.8', changefreq: 'daily' },
  { loc: '/news.html', priority: '0.8', changefreq: 'daily' },
  { loc: '/tips.html', priority: '0.7', changefreq: 'weekly' },
  { loc: '/qna.html', priority: '0.7', changefreq: 'weekly' },
  ...slugPages('data/tips.json', 'tips'),
  ...slugPages('data/qna.json', 'qa'),
  { loc: '/videos.html', priority: '0.6', changefreq: 'weekly' },
  { loc: '/board.html', priority: '0.6', changefreq: 'daily' },
  { loc: '/privacy.html', priority: '0.3', changefreq: 'yearly' },
  { loc: '/terms.html', priority: '0.3', changefreq: 'yearly' },
];

function buildSitemap() {
  const today = new Date().toISOString().slice(0, 10);
  const urls = PAGES.map((p) => `  <url>
    <loc>${BASE}${p.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

function buildRobots() {
  return `User-agent: *
Allow: /

Sitemap: ${BASE}/sitemap.xml
`;
}

fs.writeFileSync(path.join(ROOT_DIR, 'sitemap.xml'), buildSitemap(), 'utf8');
fs.writeFileSync(path.join(ROOT_DIR, 'robots.txt'), buildRobots(), 'utf8');

console.log('sitemap.xml, robots.txt 생성 완료 (기준 주소: ' + BASE + ')');
