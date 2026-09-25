// scripts/site-url.js
// 포털 사이트 주소를 data/site.json의 site_url 한 곳에서 읽어 온다.
// 사용: const { siteUrl, siteHost } = require('./site-url');  → 'https://albanboss.com', 'albanboss.com'
// sitemap·개별 글 페이지 생성 등 주소가 필요한 스크립트는 이 파일을 쓴다(주소를 직접 적지 않는다).

const fs = require('fs');
const path = require('path');

function siteUrl() {
  const raw = fs.readFileSync(path.join(__dirname, '..', 'data', 'site.json'), 'utf8').replace(/^﻿/, '');
  // 페이지와 같은 방식으로 맨 위 설명 주석을 지운 뒤 해석
  const clean = raw.replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*/g, '');
  return JSON.parse(clean).site_url.replace(/\/+$/, '');
}

function siteHost() {
  return new URL(siteUrl()).host;
}

module.exports = { siteUrl, siteHost };
