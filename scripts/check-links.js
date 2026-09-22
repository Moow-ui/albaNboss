/**
 * scripts/check-links.js
 * 
 * 링크 유효성 검사 스크립트 (Read-only)
 * - data/news.json, data/articles.json, data/videos.json, data/qna.json, data/standards.json URL 검사
 * - 메인 페이지(index.html) 및 각 페이지의 "전체보기" 내부 파일 존재 여부 검사
 * - 10초 타임아웃, 유튜브 oEmbed 검사
 * - 4분류: [정상], [접속 실패], [메인 주소임], [임시 리다이렉트 주소임]
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');

const ROOT_DIR = path.resolve(__dirname, '..');

// JSON 파싱 헬퍼 (주석 지원)
function loadJson(relPath) {
  const full = path.resolve(ROOT_DIR, relPath);
  if (!fs.existsSync(full)) return null;
  const raw = fs.readFileSync(full, 'utf8');
  const clean = raw.replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*/g, '');
  return JSON.parse(clean);
}

// 메인 페이지 여부 판단
function isMainPageUrl(urlStr) {
  try {
    const u = new URL(urlStr);
    const p = u.pathname.replace(/\/+$/, '');
    if (!p || p === '' || p === '/index.html' || p === '/index.do' || p === '/index.jsp' || p === '/main.do') {
      return !u.search; // 쿼리 파라미터도 없으면 완전 메인 페이지
    }
    return false;
  } catch (e) {
    return false;
  }
}

// 임시 리다이렉트 주소 판단 (vertexaisearch 등)
function isTempRedirectUrl(urlStr) {
  return urlStr.includes('vertexaisearch.cloud.google.com') ||
         urlStr.includes('grounding-api-redirect');
}

// HTTP/HTTPS 단일 요청 (10초 타임아웃, 리다이렉트 추적)
function checkHttpUrl(urlStr, maxRedirects = 3) {
  return new Promise((resolve) => {
    if (maxRedirects < 0) {
      return resolve({ ok: false, statusCode: 0, error: 'Too many redirects', finalUrl: urlStr });
    }

    let parsed;
    try {
      parsed = new URL(urlStr);
    } catch (e) {
      return resolve({ ok: false, statusCode: 0, error: '잘못된 URL 형식: ' + e.message, finalUrl: urlStr });
    }

    const client = parsed.protocol === 'https:' ? https : http;
    const req = client.get(urlStr, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    }, (res) => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
        let redirectTarget = res.headers.location;
        if (!redirectTarget.startsWith('http')) {
          redirectTarget = new URL(redirectTarget, urlStr).toString();
        }
        res.resume();
        return checkHttpUrl(redirectTarget, maxRedirects - 1).then(resolve);
      }

      res.resume();
      resolve({
        ok: res.statusCode >= 200 && res.statusCode < 400,
        statusCode: res.statusCode,
        finalUrl: urlStr
      });
    });

    req.on('error', (err) => {
      resolve({ ok: false, statusCode: 0, error: err.message, finalUrl: urlStr });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      resolve({ ok: false, statusCode: 0, error: 'Timeout (10초 초과)', finalUrl: urlStr });
    });
  });
}

// 유튜브 oEmbed 검사
async function checkYouTube(urlStr) {
  const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(urlStr)}&format=json`;
  return new Promise((resolve) => {
    const req = https.get(oembedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const data = JSON.parse(body);
            resolve({ ok: true, statusCode: 200, title: data.title });
          } catch (e) {
            resolve({ ok: true, statusCode: 200 });
          }
        } else {
          resolve({ ok: false, statusCode: res.statusCode, error: `YouTube oEmbed HTTP ${res.statusCode}` });
        }
      });
    });

    req.on('error', (err) => {
      resolve({ ok: false, statusCode: 0, error: err.message });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      resolve({ ok: false, statusCode: 0, error: 'YouTube oEmbed Timeout (10초)' });
    });
  });
}

// 종합 판정 함수
async function verifyUrl(urlStr) {
  if (!urlStr || typeof urlStr !== 'string') {
    return { verdict: '[접속 실패]', detail: 'URL이 비어 있음' };
  }

  // 1. 임시 리다이렉트 검사
  if (isTempRedirectUrl(urlStr)) {
    return { verdict: '[임시 리다이렉트 주소임]', detail: '구글 grounding API 또는 임시 리다이렉트' };
  }

  // 2. 메인 주소 형태 검사
  if (isMainPageUrl(urlStr)) {
    return { verdict: '[메인 주소임]', detail: '사이트 대표 메인 도메인 주소' };
  }

  // 3. 유튜브 영상 검사
  if (urlStr.includes('youtube.com') || urlStr.includes('youtu.be')) {
    const ytRes = await checkYouTube(urlStr);
    if (ytRes.ok) {
      return { verdict: '[정상]', detail: `YouTube oEmbed 정상 (HTTP ${ytRes.statusCode})` };
    } else {
      return { verdict: '[접속 실패]', detail: ytRes.error || `HTTP ${ytRes.statusCode}` };
    }
  }

  // 4. 일반 HTTP 웹페이지 검사
  const httpRes = await checkHttpUrl(urlStr);
  if (httpRes.ok) {
    if (isMainPageUrl(httpRes.finalUrl)) {
      return { verdict: '[메인 주소임]', detail: `리다이렉트 후 메인 주소 도달 (${httpRes.finalUrl})` };
    }
    return { verdict: '[정상]', detail: `HTTP ${httpRes.statusCode} 정상 응답` };
  } else {
    return { verdict: '[접속 실패]', detail: httpRes.error || `HTTP ${httpRes.statusCode}` };
  }
}

// 내부 링크 파일 검사
function verifyInternalLinks() {
  console.log('\n======================================================');
  console.log('  [1/2] 내부 페이지 및 "전체보기" 파일 존재 여부 검사');
  console.log('======================================================');
  
  const expectedFiles = [
    { name: '메인 페이지', path: 'index.html' },
    { name: '정책 소식 전체보기', path: 'policy.html' },
    { name: '최신 뉴스 전체보기', path: 'news.html' },
    { name: '노무/세무 팁 전체보기', path: 'tips.html' },
    { name: '추천 영상 전체보기', path: 'videos.html' },
    { name: '자유게시판 전체보기', path: 'board.html' },
    { name: '노무 Q&A 전체보기', path: 'qna.html' },
    { name: '급여 계산기', path: 'wage/index.html' },
    { name: '이용약관', path: 'terms.html' },
    { name: '개인정보처리방침', path: 'privacy.html' }
  ];

  let internalErrors = 0;
  for (const item of expectedFiles) {
    const abs = path.resolve(ROOT_DIR, item.path);
    const exists = fs.existsSync(abs);
    const status = exists ? '✅ [정상]' : '❌ [누락]';
    console.log(`${status} ${item.name.padEnd(18)} -> ${item.path}`);
    if (!exists) internalErrors++;
  }

  return internalErrors;
}

// 메인 실행 루틴
async function main() {
  console.log('======================================================');
  console.log('       ALBA & BOSS 링크 유효성 검사 (Read-Only)       ');
  console.log('======================================================');

  const internalErrors = verifyInternalLinks();

  console.log('\n======================================================');
  console.log('  [2/2] 외부 콘텐츠 URL 점검 (10초 타임아웃, oEmbed 지원)');
  console.log('======================================================');

  const tasks = [];

  // 1. data/news.json
  const news = loadJson('data/news.json') || [];
  news.forEach(item => {
    tasks.push({ source: 'data/news.json', title: item.title, url: item.url });
  });

  // 2. data/articles.json
  const articles = loadJson('data/articles.json') || [];
  articles.forEach(item => {
    tasks.push({ source: 'data/articles.json', title: item.title, url: item.url });
  });

  // 3. data/videos.json
  const videos = loadJson('data/videos.json') || [];
  videos.forEach(item => {
    tasks.push({ source: 'data/videos.json', title: item.title, url: item.url });
  });

  // 4. data/qna.json
  const qna = loadJson('data/qna.json') || [];
  qna.forEach(item => {
    if (item.source_url) {
      tasks.push({ source: 'data/qna.json', title: item.question, url: item.source_url });
    }
  });

  // 5. data/standards.json
  const standards = loadJson('data/standards.json');
  if (standards) {
    function extractStandardsUrls(obj, prefix = '') {
      if (!obj || typeof obj !== 'object') return;
      if (obj.source_url && typeof obj.source_url === 'string') {
        const titleStr = obj.item || obj.description || obj.name || prefix.replace(/ > $/, '');
        tasks.push({ source: 'data/standards.json', title: titleStr, url: obj.source_url });
      }
      for (const [k, v] of Object.entries(obj)) {
        if (typeof v === 'object' && v !== null) {
          extractStandardsUrls(v, `${prefix}${k} > `);
        }
      }
    }
    extractStandardsUrls(standards);
  }

  console.log(`총 ${tasks.length}개의 콘텐츠 링크를 검사합니다...\n`);

  const summary = {
    '[정상]': 0,
    '[접속 실패]': 0,
    '[메인 주소임]': 0,
    '[임시 리다이렉트 주소임]': 0
  };
  const problematic = [];

  for (let i = 0; i < tasks.length; i++) {
    const t = tasks[i];
    process.stdout.write(`[${i + 1}/${tasks.length}] 검사 중: ${(t.title || '').slice(0, 25)}... `);
    const result = await verifyUrl(t.url);
    summary[result.verdict] = (summary[result.verdict] || 0) + 1;
    console.log(`${result.verdict} (${result.detail})`);

    if (result.verdict !== '[정상]') {
      problematic.push({
        source: t.source,
        title: t.title,
        url: t.url,
        verdict: result.verdict,
        detail: result.detail
      });
    }
  }

  console.log('\n======================================================');
  console.log('                   점검 결과 요약                     ');
  console.log('======================================================');
  console.log(`- 정상 링크           : ${summary['[정상]']}개`);
  console.log(`- 접속 실패           : ${summary['[접속 실패]']}개`);
  console.log(`- 메인 주소임         : ${summary['[메인 주소임]']}개`);
  console.log(`- 임시 리다이렉트 주소: ${summary['[임시 리다이렉트 주소임]']}개`);
  console.log(`- 내부 링크 오류      : ${internalErrors}개`);

  if (problematic.length > 0) {
    console.log('\n⚠️ 조치가 필요한 문제 항목 목록:');
    console.table(problematic.map(p => ({
      파일: p.source,
      제목: (p.title || '').slice(0, 20),
      판정: p.verdict,
      원인: p.detail,
      URL: p.url
    })));
  } else {
    console.log('\n🎉 모든 링크가 [정상] 기준을 완벽하게 만족합니다!');
  }
}

if (require.main === module) {
  main().catch(err => {
    console.error('검사 중 치명적 오류 발생:', err);
    process.exit(1);
  });
}
