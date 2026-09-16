const fs = require('fs');
const path = require('path');
const { checkUrl } = require('./verify_links');

function loadJson(relPath) {
  const full = path.resolve(__dirname, '..', relPath);
  const raw = fs.readFileSync(full, 'utf8');
  const clean = raw.replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*/g, '');
  return JSON.parse(clean);
}

// Check if URL is just a domain main page
function isMainPage(urlStr) {
  try {
    const u = new URL(urlStr);
    return u.pathname === '/' || u.pathname === '' || u.pathname === '/index.html' || u.pathname === '/index.do';
  } catch (e) {
    return true;
  }
}

async function verifyAll() {
  const news = loadJson('data/news.json');
  const articles = loadJson('data/articles.json');
  const videos = loadJson('data/videos.json');

  const categories = [
    { name: '알바·노무 정책소식 (data/news.json)', items: news },
    { name: '최신뉴스 (data/articles.json)', items: articles },
    { name: '추천영상 (data/videos.json)', items: videos }
  ];

  console.log('# [점검 결과 보고]');
  console.log('');

  const reportRows = [];

  for (const cat of categories) {
    console.log(`\n### ${cat.name}`);
    for (const item of cat.items) {
      const url = item.url;
      const title = item.title;
      const mainCheck = isMainPage(url);
      
      let statusStr = '';
      if (mainCheck) {
        statusStr = '❌ 메인 홈페이지 감지 (부적합)';
      } else {
        const res = await checkUrl(url);
        if (res.ok) {
          statusStr = `✅ 실제 글 열림 (HTTP ${res.statusCode})`;
        } else {
          statusStr = `❌ 접속 실패 (${res.error || res.statusCode})`;
        }
      }

      reportRows.push({
        category: cat.name.split(' ')[0],
        title,
        url,
        status: statusStr
      });
    }
  }

  console.log('\n| 분류 | 제목 | 최종 링크 | 확인 여부 (실제 글 열림 / 삭제함) |');
  console.log('| :--- | :--- | :--- | :--- |');
  for (const r of reportRows) {
    console.log(`| ${r.category} | ${r.title} | ${r.url} | ${r.status} |`);
  }
}

verifyAll().catch(console.error);
