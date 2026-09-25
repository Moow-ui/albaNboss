// scripts/inspect-deployment.js
// Cloudflare 배포 현황 및 비공개 파일 노출 상태 점검

const https = require('https');

const BASE_URL = require('./site-url').siteUrl();

const testPaths = [
  // 1. 백업 폴더들
  '/backup_20260916/qna.html',
  '/backup_20260916/index.html',
  '/backup_after_v2/index.html',
  '/backup_before_v3/index.html',
  '/backup_before_v4/index.html',

  // 2. 내부 스크립트 및 설정/규칙
  '/scripts/check-links.js',
  '/.agent/rules/content-rules.md',
  '/.agents/rules/content-rules.md',
  '/AGENTS.md',
  '/CHANGELOG.md',
  '/.gitignore',

  // 3. 정상 서비스 페이지 및 데이터
  '/',
  '/qna.html',
  '/tips.html',
  '/wage/',
  '/data/qna.json'
];

function checkUrl(path) {
  return new Promise((resolve) => {
    const url = `${BASE_URL}${path}`;
    const req = https.get(url, { timeout: 10000 }, (res) => {
      if ([301, 302, 307, 308].includes(res.statusCode) && res.headers.location) {
        const redirectUrl = res.headers.location.startsWith('http') 
          ? res.headers.location 
          : `${BASE_URL}${res.headers.location}`;
        https.get(redirectUrl, { timeout: 10000 }, (res2) => {
          resolve({ 
            path, 
            statusCode: res2.statusCode, 
            redirect: `${res.statusCode} -> ${res.headers.location}` 
          });
        }).on('error', (err2) => {
          resolve({ path, statusCode: `REDIRECT_ERROR: ${err2.message}` });
        });
      } else {
        resolve({ path, statusCode: res.statusCode });
      }
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ path, statusCode: 'TIMEOUT' });
    });

    req.on('error', (err) => {
      resolve({ path, statusCode: `ERROR: ${err.message}` });
    });
  });
}

async function run() {
  console.log(`=== 배포 URL 검사 시작: ${BASE_URL} ===\n`);
  const results = [];
  for (const p of testPaths) {
    const res = await checkUrl(p);
    results.push(res);
    const redirectInfo = res.redirect ? ` (${res.redirect})` : '';
    const statusMark = res.statusCode === 200 ? '🔴 200 (노출됨)' : `${res.statusCode === 404 ? '🟢' : '⚪'} ${res.statusCode}`;
    console.log(`[${statusMark}] ${res.path}${redirectInfo}`);
  }

  console.log('\n=== 검사 완료 ===');
}

run();
