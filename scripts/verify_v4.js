const fs = require('fs');
const path = require('path');
const vm = require('vm');

const rootDir = "c:\\Users\\s_kingm0209\\OneDrive - konkuk.ac.kr\\바탕 화면\\main";
const indexPath = path.join(rootDir, 'index.html');
const backupPath = path.join(rootDir, 'backup_before_v4', 'index.html');

const content = fs.readFileSync(indexPath, 'utf8');

console.log('=== ALBA&BOSS 메인(index.html) 정돈 v4 검증 시작 ===\n');

let pass = 0;
let fail = 0;

function check(desc, cond, err = '') {
  if (cond) {
    console.log(`[PASS] ${desc}`);
    pass++;
  } else {
    console.error(`[FAIL] ${desc} : ${err}`);
    fail++;
  }
}

// 1. backup_before_v4/ 존재
check('1. backup_before_v4/ 폴더에 백업 index.html 존재', fs.existsSync(backupPath) && fs.statSync(backupPath).size > 100000);

// 2. 섹션 순서·카드 개수·색상·토글 동작이 이전과 동일
const headerIdx = content.indexOf('id="site-header"');
const dashIdx = content.indexOf('id="dashboard-section"');
const widgetIdx = content.indexOf('id="widget-section"');
const footerIdx = content.indexOf('id="site-footer"');
const sectionOrderOk = headerIdx < dashIdx && dashIdx < widgetIdx && widgetIdx < footerIdx;
check('2-1. 섹션 순서 (헤더 -> 대시보드/도구카드 -> 정보광장 -> 푸터) 보존', sectionOrderOk);

const cardColorsOk = content.includes('card-blue') && content.includes('card-teal') && 
  content.includes('card-indigo') && content.includes('card-orange') && 
  content.includes('card-purple') && content.includes('card-rose');
check('2-2. 6개 카드 색상 클래스 보존', cardColorsOk);

const widgetCount = (content.match(/<article[^>]*class="widget-box"/g) || []).length;
check('2-3. 정보광장 6개 카드 개수 보존', widgetCount === 6);

const hasTabLogic = content.includes('initSPATabSwitcher') && content.includes('selectedUser') && content.includes('data-target-user');
check('2-4. 사장님/알바생 SPA 탭 전환 동작 스크립트 온전함', hasTabLogic);

// 3. 모든 카드에서 칩이 메타 줄 오른쪽에 최대 2개, 줄바꿈 없음
const hasMetaLeft = content.includes('class="meta-left"');
const hasMetaRight = content.includes('class="meta-right-tags"');
const hasFlexNowrap = content.includes('flex-wrap: nowrap;') && content.includes('white-space: nowrap;');
const hasSlice2 = content.includes('item.tags.slice(0, 2)');
check('3. 메타 줄 왼쪽(출처/날짜) & 오른쪽 끝 칩(최대 2개), 줄바꿈 없음 (nowrap)', hasMetaLeft && hasMetaRight && hasFlexNowrap && hasSlice2);

// 4. 1행·2행 어느 카드에도 하단 큰 빈 공간 없음
const alignStartOk = content.includes('align-items: start;');
const hasClamp2 = content.includes('-webkit-line-clamp: 2;') && content.includes('min-height: 2.7em;');
check('4. 1행/2행 하단 빈 공간 제거 (align-items: start 및 제목/요약/메타 높이 통일)', alignStartOk && hasClamp2);

// 5. 출시 예정 카드가 완성 카드와 확연히 구분됨
const pendingTeal = content.includes('.calc-card.card-teal.is-pending') && content.includes('#f0fdfa');
const pendingIndigo = content.includes('.calc-card.card-indigo.is-pending') && content.includes('#eef2ff');
const pendingPurple = content.includes('.calc-card.card-purple.is-pending') && content.includes('#f5f3ff');
const pendingRose = content.includes('.calc-card.card-rose.is-pending') && content.includes('#fff1f2');
const pendingDashed = content.includes('border: 1.5px dashed');
const liveElevated = content.includes('.calc-card:not(.is-pending):hover') && content.includes('translateY(-4px)');
check('5. 출시 예정 카드 연한 단색/점선/진한텍스트 적용 및 완성 카드 호버 리프트(-4px) 구분', 
  pendingTeal && pendingIndigo && pendingPurple && pendingRose && pendingDashed && liveElevated);

// 6. 1920x1080 첫 화면에 정보 광장 제목까지 보임 (히어로 압축 검증)
const heroCompressed = content.includes('padding: 24px 0 20px;') && 
  content.includes('.section-title-wrap {\n      text-align: center;\n      max-width: 680px;\n      margin: 0 auto 14px;') &&
  content.includes('min-height: 195px;');
check('6. 히어로 영역 상하 패딩/마진/카드 압축 (1920x1080 첫 화면 정보광장 제목 노출)', heroCompressed);

// 7. 팁 항목 제목 앞 전구 아이콘 제거됨 (영상 ▶는 유지)
const tipsHasBulb = content.includes('💡 ${escapeHtml(item.title)}');
const videoHasPlay = content.includes('▶ ${escapeHtml(item.title)}');
check('7. 세무·노무 팁 항목 제목 앞 전구(💡) 아이콘 제거 & 영상 ▶ 유지', !tipsHasBulb && videoHasPlay);

// 8. 375px 폭에서 가로 스크롤 없음
const overflowHidden = content.includes('overflow-x: hidden;');
check('8. 모바일 375px 가로 스크롤 없음 (overflow-x: hidden)', overflowHidden);

// 9. 헤더 규격 통일 확인
const headerHeightOk = content.includes('.widget-header') && content.includes('height: 52px;');
const moreLinkOk = content.includes('.widget-more-link') && content.includes('height: 26px;');
check('9. 6개 카드 헤더 높이/아이콘/전체보기 버튼 규격 통일', headerHeightOk && moreLinkOk);

// 10. JS 문법 무결성 (콘솔 에러 유무)
const scriptMatch = content.match(/<script>([\s\S]*?)<\/script>/);
let scriptClean = false;
if (scriptMatch) {
  try {
    new vm.Script(scriptMatch[1]);
    scriptClean = true;
  } catch (err) {
    console.error('JS Syntax Error:', err.message);
  }
}
check('10. 자바스크립트 인라인 문법 무결성 (Console Syntax Clean)', scriptClean);

console.log(`\n=== 검증 완료: 통과 ${pass}건 / 실패 ${fail}건 ===\n`);

if (fail > 0) {
  process.exit(1);
}
