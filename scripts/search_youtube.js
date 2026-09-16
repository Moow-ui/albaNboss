const https = require('https');

function searchYouTube(keyword) {
  return new Promise((resolve) => {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(keyword)}`;
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'ko-KR,ko;q=0.9'
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        const matches = [];
        const regex = /"videoId":"([a-zA-Z0-9_-]{11})"/g;
        let m;
        const seen = new Set();
        while ((m = regex.exec(body)) !== null && matches.length < 10) {
          const id = m[1];
          if (!seen.has(id)) {
            seen.add(id);
            matches.push(id);
          }
        }
        resolve(matches);
      });
    });
    req.on('error', (err) => resolve([]));
    req.setTimeout(10000, () => {
      req.destroy();
      resolve([]);
    });
  });
}

function getOembed(videoId) {
  return new Promise((resolve) => {
    const urlStr = `https://www.youtube.com/watch?v=${videoId}`;
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(urlStr)}&format=json`;
    const req = https.get(oembedUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const data = JSON.parse(body);
            resolve({ ok: true, videoId, url: urlStr, title: data.title, author: data.author_name });
          } catch (e) {
            resolve({ ok: false, videoId, error: 'JSON parse error' });
          }
        } else {
          resolve({ ok: false, videoId, error: `HTTP ${res.statusCode}` });
        }
      });
    });
    req.on('error', (err) => resolve({ ok: false, videoId, error: err.message }));
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({ ok: false, videoId, error: 'Timeout' });
    });
  });
}

async function main() {
  const queries = [
    '5인 미만 사업장 근로기준법 노무사',
    '알바 3.3% 4대보험 차이 세무사'
  ];

  for (const q of queries) {
    console.log(`\nSearching YouTube for: ${q}...`);
    const ids = await searchYouTube(q);
    console.log(`Found ${ids.length} candidate IDs:`, ids);

    for (const id of ids) {
      const oembed = await getOembed(id);
      if (oembed.ok) {
        console.log(`[VALID] ${oembed.title} | Channel: ${oembed.author} | URL: ${oembed.url}`);
      }
    }
  }
}

main();

