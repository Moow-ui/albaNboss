// M2 주소 이동 Worker를 내 컴퓨터(wrangler dev)에서 미리 확인한다.
// 사용법: (wrangler dev --port 8799 실행 중일 때) node .claude/scripts/m2-local-check.js [포트]
// 주소(Host)를 바꿔 가며 요청해, 이동(301) 여부와 정적 파일 제공 여부를 본다.

const http = require('http');

const PORT = Number(process.argv[2] || 8799);

function request(host, path, proto = 'https') {
  return new Promise((resolve) => {
    const req = http.request({ host: '127.0.0.1', port: PORT, path, method: 'GET',
      headers: { Host: host, 'X-Forwarded-Proto': proto } }, (res) => {
      let bytes = 0;
      res.on('data', (c) => { bytes += c.length; });
      res.on('end', () => resolve({ status: res.statusCode, location: res.headers.location || '', bytes }));
    });
    req.on('error', (e) => resolve({ status: 0, location: '', bytes: 0, error: e.message }));
    req.end();
  });
}

const results = [];
function check(name, ok, detail) {
  results.push(ok);
  console.log(`${ok ? '✓' : '✗'} ${name} — ${detail}`);
}

async function main() {
  const cases = [
    ['albanboss.moow-ui.workers.dev', '/wage/?x=1', 301, 'https://albanboss.com/wage/?x=1'],
    ['www.albanboss.com', '/tips.html', 301, 'https://albanboss.com/tips.html'],
    ['albanboss.moow-ui.workers.dev', '/', 301, 'https://albanboss.com/'],
    ['localhost', '/', 200, ''],
    ['localhost', '/wage/', 200, ''],
    ['localhost', '/tips.html', 307, '/tips'],
    ['localhost', '/tips', 200, ''],
    ['localhost', '/wage', 307, '/wage/'],
    ['localhost', '/nonexistent-xyz', 404, ''],
    ['localhost', '/wrangler.jsonc', 404, ''],
    ['localhost', '/worker/index.js', 404, ''],
    ['localhost', '/CLAUDE.md', 404, ''],
    ['localhost', '/data/site.json', 200, ''],
    // /assets/*, /data/* 는 Worker를 거치지 않으므로 옛 주소로 와도 그대로 제공
    ['albanboss.moow-ui.workers.dev', '/assets/images/og-image.png', 200, ''],
    ['albanboss.moow-ui.workers.dev', '/data/standards.json', 200, '']
  ];
  for (const [host, path, status, location] of cases) {
    const r = await request(host, path);
    const locOk = !location || r.location === location || r.location.endsWith(location);
    check(`${host}${path}`, r.status === status && locOk,
      `${r.status}${r.location ? ' → ' + r.location : ''} ${r.bytes}B (기대 ${status}${location ? ' → ' + location : ''})${r.error ? ' 오류: ' + r.error : ''}`);
  }
  const ok = results.every(Boolean);
  console.log(ok ? '결과: 통과' : '결과: 실패');
  process.exitCode = ok ? 0 : 1;
}

main();
