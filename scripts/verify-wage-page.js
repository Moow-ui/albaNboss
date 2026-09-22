// scripts/verify-wage-page.js
const fs = require('fs');
const path = require('path');

const wageHtmlPath = path.join(__dirname, '..', 'wage', 'index.html');
const wageHtml = fs.readFileSync(wageHtmlPath, 'utf-8');

console.log('=== wage/index.html 검증 ===');

// 1. wage-core.js 로드 경로 확인
if (wageHtml.includes('<script src="../assets/js/wage-core.js"></script>')) {
  console.log('✅ wage-core.js 스크립트 태그 정상 확인');
} else {
  console.error('❌ wage-core.js 스크립트 태그 누락 또는 경로 오류');
}

// 2. tokens.css 로드 확인
if (wageHtml.includes('tokens.css')) {
  console.log('✅ tokens.css 로드 정상 확인');
} else {
  console.error('❌ tokens.css 누락');
}

// 3. 인라인 스크립트 문법 검사 (new Function() 이용)
const scriptMatch = wageHtml.match(/<script>([\s\S]*?)<\/script>/);
if (scriptMatch) {
  try {
    // Basic syntax parsing
    new Function(scriptMatch[1]);
    console.log('✅ wage/index.html 인라인 자바스크립트 문법 검사 통과 (오류 0)');
  } catch (e) {
    console.error('❌ 인라인 자바스크립트 문법 오류:', e.message);
  }
}

// 4. 모바일 뷰포트 메타태그 확인
if (wageHtml.includes('<meta name="viewport" content="width=device-width, initial-scale=1.0">')) {
  console.log('✅ 반응형 뷰포트 메타태그 확인');
}

// 5. 제목 일원화 확인
const titleMatch = wageHtml.match(/<title>(.*?)<\/title>/);
console.log('📄 페이지 제목:', titleMatch ? titleMatch[1] : '없음');

console.log('검증 완료.');
