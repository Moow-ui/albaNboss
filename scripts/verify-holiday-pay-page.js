// scripts/verify-holiday-pay-page.js
// 대표지시 W40-01: /tips/holiday-pay-october 페이지의 숫자가 data/standards.json과
// 일치하는지, 필수 SEO 태그(canonical, BreadcrumbList)가 있는지, 배너 링크가
// 새 페이지로 바뀌었는지 확인한다.

const fs = require('fs');
const path = require('path');
const assert = require('assert');

function stripComments(raw) {
  return raw.replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*/g, '$1');
}

function readJson(relPath) {
  const raw = fs.readFileSync(path.join(__dirname, '..', relPath), 'utf8');
  return JSON.parse(stripComments(raw));
}

const standards = readJson('data/standards.json');
const banner = readJson('data/banner.json');
const pageHtml = fs.readFileSync(
  path.join(__dirname, '..', 'tips', 'holiday-pay-october', 'index.html'),
  'utf8'
);

// 1. 2026 최저시급이 standards.json과 페이지 본문에서 일치하는가
const hourly2026 = standards.minimum_wage.years['2026'].hourly;
assert.strictEqual(hourly2026, 10320, 'standards.json의 2026 최저시급이 바뀌었습니다. 페이지도 함께 확인하세요.');
assert(pageHtml.includes('10,320원'), '페이지에 2026 최저시급(10,320원) 표기가 없습니다.');

// 2. 휴일근로 가산율(8시간 이내 50%, 초과 100%)이 standards.json과 일치하는가
const holidayWork = standards.overtime_rates.holiday_work;
assert.strictEqual(holidayWork.rate_under_8h, 1.5, '8시간 이내 휴일근로 배율이 바뀌었습니다.');
assert.strictEqual(holidayWork.rate_over_8h, 2, '8시간 초과 휴일근로 배율이 바뀌었습니다.');

// 3. 계산 예시 숫자 재검산 (8시간 근무, 5인 이상, 시급제)
const hourlyWage = hourly2026;
const paidHoliday = 8 * hourlyWage; // 유급휴일수당
const actualWork = 8 * hourlyWage; // 실제 근로분
const holidayPremium = 8 * hourlyWage * 0.5; // 8시간 이내 가산 50%
const total = paidHoliday + actualWork + holidayPremium;
assert.strictEqual(paidHoliday, 82560);
assert.strictEqual(actualWork, 82560);
assert.strictEqual(holidayPremium, 41280);
assert.strictEqual(total, 206400);
[
  paidHoliday.toLocaleString('ko-KR') + '원',
  holidayPremium.toLocaleString('ko-KR') + '원',
  total.toLocaleString('ko-KR') + '원',
].forEach((needle) => {
  assert(pageHtml.includes(needle), `페이지에 계산 결과(${needle})가 없습니다.`);
});

// 4. 필수 SEO 요소
assert(pageHtml.includes('rel="canonical"'), 'canonical 태그가 없습니다.');
assert(pageHtml.includes('"@type": "BreadcrumbList"'), 'BreadcrumbList 구조화 데이터가 없습니다.');
assert(!pageHtml.includes('"@type": "FAQPage"'), 'FAQ 구조화 데이터는 넣지 않기로 했습니다.');

// 5. 배너가 새 페이지를 가리키는가
const octBanner = banner.find((b) => b.id === '2026-oct-holidays');
assert(octBanner, 'banner.json에 2026-oct-holidays 항목이 없습니다.');
assert.strictEqual(octBanner.link, 'tips/holiday-pay-october/', '배너 링크가 새 페이지로 연결되지 않았습니다.');

console.log('OK: 휴일수당 페이지 숫자·태그·배너 링크 검증 통과');
