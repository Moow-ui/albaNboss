// scripts/verify-qa-pages.js
// 대표지시 W40-09 (1단계 잔여, Q&A 부분) 검증:
// - data/qna.json 각 항목에 고유 slug가 있는가
// - qa/<slug>/index.html이 실제로 생성되었고, canonical·BreadcrumbList가 있고 FAQ는 없는가
// - 생성된 페이지 본문에 원본 answer·law 문구가 그대로(내용 변경 없이) 들어있는가
// - qna.html·index.html 위젯이 개별 페이지로 연결되는가

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

const qna = readJson('data/qna.json');

assert.strictEqual(qna.length, 16, `data/qna.json 항목 수가 16개가 아닙니다 (현재 ${qna.length}개). 새 질문이 추가/삭제됐다면 generate-qa-pages.js를 다시 실행하세요.`);

const slugs = qna.map((q) => q.slug);
assert(slugs.every(Boolean), 'slug가 없는 질문이 있습니다.');
assert.strictEqual(new Set(slugs).size, slugs.length, 'slug가 중복됩니다.');

// 기존 #holiday-pay 앵커 링크(메인 배너·팁 페이지 등에서 참조)가 깨지지 않는지 확인
const holidayPayItem = qna.find((q) => q.id === 'holiday-pay');
assert(holidayPayItem, 'id가 holiday-pay인 기존 항목을 찾을 수 없습니다.');
assert.strictEqual(holidayPayItem.slug, 'holiday-pay', '기존 id(holiday-pay)와 새 slug가 달라 앵커 링크(#holiday-pay)가 깨집니다.');

qna.forEach((item) => {
  const file = path.join(ROOT, 'qa', item.slug, 'index.html');
  assert(fs.existsSync(file), `${file} 가 없습니다.`);
  const html = fs.readFileSync(file, 'utf8');

  assert(html.includes('rel="canonical"'), `${item.slug}: canonical 태그가 없습니다.`);
  assert(html.includes('"@type": "BreadcrumbList"'), `${item.slug}: BreadcrumbList가 없습니다.`);
  assert(!html.includes('FAQPage'), `${item.slug}: FAQ 구조화 데이터는 넣지 않기로 했습니다.`);

  // 원문 그대로 재구성했는지 (새 사실 추가/변경 없이) 확인
  assert(html.includes(item.answer), `${item.slug}: answer 원문이 페이지에 없습니다(내용이 바뀌었을 수 있습니다).`);
  if (item.law) {
    assert(html.includes(item.law), `${item.slug}: law 원문이 페이지에 없습니다.`);
  }

  const m = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert(m, `${item.slug}: JSON-LD 스크립트를 찾을 수 없습니다.`);
  JSON.parse(m[1]); // throws if invalid
});

// qna.html·index.html 위젯이 slug로 개별 페이지 연결되는지
const qnaHtml = fs.readFileSync(path.join(ROOT, 'qna.html'), 'utf8');
assert(qnaHtml.includes('qna-detail-link'), 'qna.html에 개별 페이지 링크(qna-detail-link)가 없습니다.');
assert(qnaHtml.includes('item.slug'), 'qna.html 렌더 함수가 item.slug를 쓰지 않습니다.');

const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
assert(indexHtml.includes('qna-detail-link'), 'index.html에 개별 페이지 링크(qna-detail-link)가 없습니다.');
assert(/item\.slug[\s\S]{0,60}qa\/\$\{encodeURIComponent/.test(indexHtml), 'index.html Q&A 위젯이 slug 링크로 바뀌지 않았습니다.');

console.log(`OK: 노무 Q&A ${qna.length}개 개별 페이지 생성·연결 검증 통과`);
