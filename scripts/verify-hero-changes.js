// scripts/verify-hero-changes.js
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const indexPath = path.join(rootDir, 'index.html');
const indexHtml = fs.readFileSync(indexPath, 'utf-8');

console.log('=== [메인 첫 화면 문구 검증] ===');

let pass = true;

// 1. 신규 문구 3줄 확인
const hasNewBadge = indexHtml.includes('사장님 · 알바생 노무 계산기');
const hasNewTitle = indexHtml.includes('시급·주휴수당·근무표, 여기서 한 번에');
const hasNewDesc = indexHtml.includes('회원가입 없이 무료로, 최신 법정 기준에 맞춰 바로 계산하세요.');

if (hasNewBadge) {
  console.log('✅ 작은 배지 문구 정상 반영: 사장님 · 알바생 노무 계산기');
} else {
  console.error('❌ 작은 배지 문구 미반영');
  pass = false;
}

if (hasNewTitle) {
  console.log('✅ 큰 제목(h1) 문구 정상 반영: 시급·주휴수당·근무표, 여기서 한 번에');
} else {
  console.error('❌ 큰 제목 문구 미반영');
  pass = false;
}

if (hasNewDesc) {
  console.log('✅ 설명 문구 정상 반영: 회원가입 없이 무료로, 최신 법정 기준에 맞춰 바로 계산하세요.');
} else {
  console.error('❌ 설명 문구 미반영');
  pass = false;
}

// 2. 구 문구 잔존 여부 확인
const hasOldBadge = indexHtml.includes('스마트 비즈니스');
const hasOldTitle = indexHtml.includes('맞춤형 빠른 계산기 대시보드');
const hasOldDesc = indexHtml.includes('사장님과 알바생 모두에게 꼭 필요한 계산 및 관리 도구를 손쉽게 이용하세요.');

if (!hasOldBadge && !hasOldTitle && !hasOldDesc) {
  console.log('✅ 구 문구(스마트 비즈니스, 맞춤형 빠른 계산기 대시보드 등) 잔존 0건');
} else {
  console.error('❌ 구 문구가 여전히 남아있습니다:', { hasOldBadge, hasOldTitle, hasOldDesc });
  pass = false;
}

// 3. 페이지 탭 제목(<title>) 및 메뉴 이름 보존 확인
const titleTagMatch = indexHtml.match(/<title>(.*?)<\/title>/);
const hasMenuDashboard = indexHtml.includes('계산기 대시보드');

if (titleTagMatch) {
  console.log(`✅ 페이지 <title> 보존 확인: ${titleTagMatch[1]}`);
}
if (hasMenuDashboard) {
  console.log('✅ 상단 메뉴 "계산기 대시보드" 보존 확인');
} else {
  console.error('❌ 상단 메뉴 "계산기 대시보드"가 유실되었습니다.');
  pass = false;
}

// 4. 모바일 390px 렌더링 너비 시뮬레이션
// 390px 화면에서 container 패딩 좌우 24px 제외 시 가용 폭은 342px.
// 모바일 h1 font-size: 1.7rem(27.2px), letter-spacing: -0.03em
// 한글 평균 글자폭 ~26.4px, 중간점(·) ~8px, 쉼표 ~8px, 공백 ~7px
const line1 = '시급·주휴수당·근무표,';
const line2 = '여기서 한 번에';

// 대략적인 렌더링 픽셀 계산
function estimateWidth(str, fontSize = 27.2) {
  let w = 0;
  for (const ch of str) {
    if (ch === '·' || ch === ',' || ch === '.') w += fontSize * 0.3;
    else if (ch === ' ') w += fontSize * 0.25;
    else if (ch >= '\uAC00' && ch <= '\uD7A3') w += fontSize * 0.95; // 한글
    else w += fontSize * 0.6;
  }
  return w;
}

const w1 = estimateWidth(line1);
const w2 = estimateWidth(line2);
console.log(`📱 390px 가용폭(342px) 대비 예상 너비:`);
console.log(`   - 1행 [${line1}]: 약 ${Math.round(w1)}px (여유 ${Math.round(342 - w1)}px)`);
console.log(`   - 2행 [${line2}]: 약 ${Math.round(w2)}px (여유 ${Math.round(342 - w2)}px)`);

if (w1 <= 342 && w2 <= 342) {
  console.log('✅ 390px 폭에서 큰 제목이 정확히 2줄로 자연스럽게 분할됩니다.');
} else {
  console.log('⚠️ 390px 폭에서 2줄 초과 가능성 있음.');
}

if (pass) {
  console.log('🎉 모든 체크리스트 통과!');
} else {
  process.exit(1);
}
