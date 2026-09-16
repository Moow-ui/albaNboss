const https = require('https');
const http = require('http');
const { URL } = require('url');

function checkUrl(urlStr, maxRedirects = 3) {
  return new Promise((resolve) => {
    if (maxRedirects < 0) {
      return resolve({ ok: false, url: urlStr, error: 'Too many redirects' });
    }

    let parsed;
    try {
      parsed = new URL(urlStr);
    } catch (err) {
      return resolve({ ok: false, url: urlStr, error: 'Invalid URL: ' + err.message });
    }

    const client = parsed.protocol === 'https:' ? https : http;
    const req = client.get(urlStr, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
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
        return checkUrl(redirectTarget, maxRedirects - 1).then(resolve);
      }

      let body = '';
      res.setEncoding('utf8');
      res.on('data', chunk => {
        if (body.length < 50000) body += chunk;
      });
      res.on('end', () => {
        const titleMatch = body.match(/<title[^>]*>([^<]*)<\/title>/i);
        const title = titleMatch ? titleMatch[1].trim() : '';
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 400,
          statusCode: res.statusCode,
          url: urlStr,
          title
        });
      });
    });

    req.on('error', (err) => {
      resolve({ ok: false, url: urlStr, error: err.message });
    });

    // 10 second timeout requirement
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({ ok: false, url: urlStr, error: 'Timeout (10s)' });
    });
  });
}

module.exports = { checkUrl };

if (require.main === module) {
  const testUrl = process.argv[2] || 'https://www.moel.go.kr';
  console.log(`Checking ${testUrl}...`);
  checkUrl(testUrl).then(res => console.log(JSON.stringify(res, null, 2)));
}
