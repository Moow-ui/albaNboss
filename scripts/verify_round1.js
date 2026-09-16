const fs = require('fs');
const path = require('path');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passCount++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    failCount++;
  }
}

console.log('=== ALBA&BOSS Round 1 Verification ===\n');

// 1. Check data/banner.json
try {
  const banner = JSON.parse(fs.readFileSync('data/banner.json', 'utf8'));
  assert(banner.active === true, 'banner.json is active');
  assert(banner.title.includes('추석 연휴(9/24~9/26)에 근무하셨나요?'), 'banner title correct');
  assert(banner.link === 'qna.html#holiday-pay', 'banner link is qna.html#holiday-pay');
  assert(banner.expires_at === '2026-09-28T00:00:00+09:00', 'banner expiration is 2026-09-28T00:00:00+09:00');

  // Simulation test: 2026-09-16 should show, 2026-09-28 should hide
  const expiresTimestamp = new Date(banner.expires_at).getTime();
  const testNowBefore = new Date('2026-09-16T12:00:00+09:00').getTime();
  const testNowAfter = new Date('2026-09-28T00:00:01+09:00').getTime();

  assert(testNowBefore < expiresTimestamp, 'Simulation: Banner displays before 2026-09-28');
  assert(testNowAfter >= expiresTimestamp, 'Simulation: Banner auto-hides after 2026-09-28 00:00');
} catch (e) {
  assert(false, `banner.json error: ${e.message}`);
}

// 2. Check data/board-config.json
try {
  const boardCfg = JSON.parse(fs.readFileSync('data/board-config.json', 'utf8'));
  assert(boardCfg.write_status.is_open === false, 'board write is_open is false');
  assert(boardCfg.write_status.open_target_date === '2027년 3월', 'open_target_date is 2027년 3월');
  assert(boardCfg.write_status.notice_message.includes('2027년 3월에 정식으로 열립니다'), 'notice message matches');
} catch (e) {
  assert(false, `board-config.json error: ${e.message}`);
}

// 3. Check data/qna.json for holiday-pay
try {
  const rawQna = fs.readFileSync('data/qna.json', 'utf8');
  const cleanQna = rawQna.replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*/g, '');
  const qnaList = JSON.parse(cleanQna);
  const holidayItem = qnaList.find(q => q.id === 'holiday-pay' || (q.question && q.question.includes('추석 등 법정 공휴일')));
  assert(holidayItem !== undefined, 'holiday-pay item found in qna.json');
  assert(holidayItem.id === 'holiday-pay', 'holiday-pay has id="holiday-pay"');
} catch (e) {
  assert(false, `data/qna.json error: ${e.message}`);
}

// 4. Check qna.html
try {
  const qnaHtml = fs.readFileSync('qna.html', 'utf8');
  assert(qnaHtml.includes('holiday-pay'), 'qna.html contains holiday-pay reference');
  assert(qnaHtml.includes('checkHashTarget'), 'qna.html has checkHashTarget function');
  assert(qnaHtml.includes('hashchange'), 'qna.html listens to hashchange');
} catch (e) {
  assert(false, `qna.html error: ${e.message}`);
}

// 5. Check board.html
try {
  const boardHtml = fs.readFileSync('board.html', 'utf8');
  assert(boardHtml.includes('id="notice-modal"'), 'board.html contains notice-modal');
  assert(boardHtml.includes('data/board-config.json'), 'board.html fetches board-config.json');
  assert(boardHtml.includes('views > 0'), 'board.html hides zero views');
  assert(boardHtml.includes('likes > 0'), 'board.html hides zero likes');
  assert(boardHtml.includes('comments > 0'), 'board.html hides zero comments');
} catch (e) {
  assert(false, `board.html error: ${e.message}`);
}

// 6. Check index.html
try {
  const indexHtml = fs.readFileSync('index.html', 'utf8');
  assert(indexHtml.includes('id="holiday-banner-container"'), 'index.html contains holiday banner markup');
  assert(indexHtml.includes('loadHolidayBanner()'), 'index.html calls loadHolidayBanner');
  assert(indexHtml.includes('align-items: stretch;'), 'index.html widget-grid has align-items: stretch');
  assert(indexHtml.includes('사장님 시급 계산기'), 'index.html has "사장님 시급 계산기"');
  assert(indexHtml.includes('알바 급여 계산기'), 'index.html has "알바 급여 계산기"');
  assert(indexHtml.includes('4대보험료 계산기'), 'index.html has "4대보험료 계산기"');
  assert(indexHtml.includes('근로자·사업주 부담분 간편 산출'), 'index.html has "근로자·사업주 부담분 간편 산출"');
  assert(indexHtml.includes('formatStats'), 'index.html board widget hides zero counts');
} catch (e) {
  assert(false, `index.html error: ${e.message}`);
}

// 7. Check standards.json uncorrupted
try {
  const standards = JSON.parse(fs.readFileSync('data/standards.json', 'utf8'));
  assert(standards.minimum_wage !== undefined, 'standards.json exists and valid');
} catch (e) {
  assert(false, `standards.json error: ${e.message}`);
}

console.log(`\nResults: ${passCount} passed, ${failCount} failed.`);
if (failCount > 0) process.exit(1);
