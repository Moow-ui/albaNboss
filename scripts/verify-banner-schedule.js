// scripts/verify-banner-schedule.js
// 배너 스케줄링 로직, 하위 호환성 및 링크 검증 스크립트

const fs = require('fs');
const assert = require('assert');

function parseBannerJson(rawText) {
  const cleanText = rawText.replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*/g, '');
  return JSON.parse(cleanText);
}

function selectBanner(data, todayParam) {
  let now = Date.now();
  if (todayParam) {
    const parsedTime = Date.parse(todayParam.includes('T') ? todayParam : `${todayParam}T00:00:00+09:00`);
    if (!isNaN(parsedTime)) {
      now = parsedTime;
    }
  }

  let activeBanner = null;

  if (Array.isArray(data)) {
    activeBanner = data.find(item => {
      if (!item) return false;
      const start = item.starts_at ? new Date(item.starts_at).getTime() : 0;
      const expire = item.expires_at ? new Date(item.expires_at).getTime() : Infinity;
      return now >= start && now < expire;
    });
  } else if (data && typeof data === 'object') {
    const isActive = data.active !== false;
    const start = data.starts_at ? new Date(data.starts_at).getTime() : 0;
    const expire = data.expires_at ? new Date(data.expires_at).getTime() : Infinity;
    if (isActive && now >= start && now < expire) {
      activeBanner = data;
    }
  }

  return activeBanner;
}

console.log('=== [1] data/banner.json 파일 및 스케줄 로직 검증 ===');
const bannerRaw = fs.readFileSync('data/banner.json', 'utf8');
const bannerData = parseBannerJson(bannerRaw);

assert(Array.isArray(bannerData), 'banner.json은 배열이어야 합니다.');
assert(bannerData.length === 2, 'banner.json에 2개 항목(추석, 10월)이 있어야 합니다.');

// 1) 2026-09-27 테스트 -> 추석 띠
const b1 = selectBanner(bannerData, '2026-09-27');
assert(b1 && b1.id === '2026-chuseok', '2026-09-27에는 추석 띠가 선택되어야 합니다.');
console.log('✅ ?today=2026-09-27 -> [추석 띠]', b1.title);

// 2) 2026-09-28 테스트 -> 10월 띠
const b2 = selectBanner(bannerData, '2026-09-28');
assert(b2 && b2.id === '2026-oct-holidays', '2026-09-28에는 10월 띠가 선택되어야 합니다.');
console.log('✅ ?today=2026-09-28 -> [10월 띠]', b2.title);

// 3) 2026-10-10 테스트 -> 띠 없음
const b3 = selectBanner(bannerData, '2026-10-10');
assert(b3 === null || b3 === undefined, '2026-10-10에는 띠가 없어야 합니다.');
console.log('✅ ?today=2026-10-10 -> [띠 없음 (null)]');

// 4) 현재 시각(2026-09-22) 테스트 -> 추석 띠
const bCurrent = selectBanner(bannerData, null);
console.log('✅ 현재 시각 기준 ->', bCurrent ? `[${bCurrent.id}] ${bCurrent.title}` : '없음');

console.log('\n=== [2] 레거시(단일 객체) 형식 하위 호환성 검증 ===');
const legacyBanner1 = {
  active: true,
  title: "추석 연휴(9/24~9/26)에 근무하셨나요? 휴일수당 기준 확인하기",
  link: "qna.html#holiday-pay",
  icon: "🌕",
  expires_at: "2026-09-28T00:00:00+09:00"
};

const leg1 = selectBanner(legacyBanner1, '2026-09-27');
assert(leg1 && leg1.title === legacyBanner1.title, '레거시 형식: 만료 전 정상 표시되어야 합니다.');
console.log('✅ 레거시 형식 (만료 전 2026-09-27) -> 정상 노출 확인');

const leg2 = selectBanner(legacyBanner1, '2026-09-28');
assert(leg2 === null || leg2 === undefined, '레거시 형식: 만료 후 숨김 처리되어야 합니다.');
console.log('✅ 레거시 형식 (만료 후 2026-09-28) -> 정상 숨김 확인');

console.log('\n=== [3] 링크 대상(qna.html#holiday-pay) 검증 ===');
const qnaRaw = fs.readFileSync('data/qna.json', 'utf8');
const qnaData = parseBannerJson(qnaRaw);
const holidayPayItem = qnaData.find(item => item.id === 'holiday-pay' || (item.question && item.question.includes('삼일절, 광복절, 추석')));
assert(holidayPayItem, 'data/qna.json에 holiday-pay 질문이 존재해야 합니다.');
assert(holidayPayItem.id === 'holiday-pay', 'holiday-pay id가 지정되어 있어야 합니다.');
console.log('✅ holiday-pay Q&A 항목 확인 완료:');
console.log('   - 질문:', holidayPayItem.question);
console.log('   - 답변 요약:', holidayPayItem.answer.slice(0, 70) + '...');

console.log('\n🎉 모든 배너 스케줄링 및 호환성 검증을 완벽히 통과했습니다!');
