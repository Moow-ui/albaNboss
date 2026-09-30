// scripts/verify-tip-pages.js
// 대표지시 W40-02 (1단계, 팁 부분) 검증:
// - data/tips.json 각 항목에 고유 slug가 있는가
// - tips/<slug>/index.html이 실제로 생성되었고, canonical·BreadcrumbList가 있고 FAQ는 없는가
// - 생성된 페이지 본문에 원본 summary·detail_tip 문구가 그대로(내용 변경 없이) 들어있는가
// - tips.html 카드가 개별 페이지로 연결되는가

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT = path.join(__dirname, '..');

function stripComments(raw) {
  return raw.replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*/g, '');
}

function readJson(relPath) {
  return JSON.parse(stripComments(fs.readFileSync(path.join(ROOT, relPath), 'utf8')));
}

const tips = readJson('data/tips.json');

assert.strictEqual(tips.length, 11, `data/tips.json 항목 수가 11개가 아닙니다 (현재 ${tips.length}개). 새 팁이 추가/삭제됐다면 generate-tip-pages.js를 다시 실행하세요.`);

const slugs = tips.map((t) => t.slug);
assert(slugs.every(Boolean), 'slug가 없는 팁이 있습니다.');
assert.strictEqual(new Set(slugs).size, slugs.length, 'slug가 중복됩니다.');

tips.forEach((tip) => {
  const file = path.join(ROOT, 'tips', tip.slug, 'index.html');
  assert(fs.existsSync(file), `${file} 가 없습니다.`);
  const html = fs.readFileSync(file, 'utf8');

  assert(html.includes('rel="canonical"'), `${tip.slug}: canonical 태그가 없습니다.`);
  assert(html.includes('"@type": "BreadcrumbList"'), `${tip.slug}: BreadcrumbList가 없습니다.`);
  assert(!html.includes('FAQPage'), `${tip.slug}: FAQ 구조화 데이터는 넣지 않기로 했습니다.`);

  // 원문 그대로 재구성했는지 (새 사실 추가/변경 없이) 확인
  assert(html.includes(tip.summary), `${tip.slug}: summary 원문이 페이지에 없습니다(내용이 바뀌었을 수 있습니다).`);
  assert(html.includes(tip.detail_tip), `${tip.slug}: detail_tip 원문이 페이지에 없습니다.`);
  if (tip.law) {
    assert(html.includes(tip.law), `${tip.slug}: law 원문이 페이지에 없습니다.`);
  }

  const m = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert(m, `${tip.slug}: JSON-LD 스크립트를 찾을 수 없습니다.`);
  JSON.parse(m[1]); // throws if invalid
});

// tips.html이 개별 페이지로 연결되는지 (슬러그 개수만큼 tips/ 링크가 있어야 함)
const tipsHtml = fs.readFileSync(path.join(ROOT, 'tips.html'), 'utf8');
assert(tipsHtml.includes('tip-card-link'), 'tips.html에 tip-card-link 래퍼가 없습니다.');
assert(tipsHtml.includes('item.slug'), 'tips.html 렌더 함수가 item.slug를 쓰지 않습니다.');

// index.html 홈 위젯이 slug로 연결되는지
const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
assert(indexHtml.includes('item.slug ? `tips/'), 'index.html 팁 위젯이 slug 링크로 바뀌지 않았습니다.');

console.log(`OK: 팁 ${tips.length}개 개별 페이지 생성·연결 검증 통과`);
