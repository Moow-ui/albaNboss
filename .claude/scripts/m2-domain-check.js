// 새 주소 전환(M2) 확인 스크립트 — albanboss.com 연결, 옛 주소·www 자동 이동, 내용이 그대로인지 확인한다.
// 사용법 (저장소 맨 위 폴더에서):
//   node .claude/scripts/m2-domain-check.js hosts             새 주소·www·옛 주소가 같은 내용을 보여 주는지 (단계 1)
//   node .claude/scripts/m2-domain-check.js snapshot <이름>   옛 주소의 주요 페이지 내용을 .claude/tmp/m2-<이름>/ 에 저장
//   node .claude/scripts/m2-domain-check.js verify <이름>     전환 뒤 검증 체크리스트 (snapshot <이름>과 내용 비교)

const fs = require('fs');
const path = require('path');
const tls = require('tls');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..', '..');
const TMP = path.join(ROOT, '.claude', 'tmp');
const OLD = 'https://albanboss.moow-ui.workers.dev';
const WWW = 'https://www.albanboss.com';
const PAGES = ['/', '/wage/', '/qna.html', '/tips.html', '/news.html', '/policy.html', '/videos.html', '/board.html',
  '/terms.html', '/privacy.html', '/data/standards.json', '/assets/js/wage-core.js'];

const sha256 = (buf) => crypto.createHash('sha256').update(buf).digest('hex');
const stamp = () => `nc=${Date.now()}`;
const withStamp = (url) => url + (url.includes('?') ? '&' : '?') + stamp();

// data/site.json (맨 위 설명 주석 제거 후 해석 — 페이지와 같은 방식)
function siteUrl() {
  const raw = fs.readFileSync(path.join(ROOT, 'data', 'site.json'), 'utf8').replace(/^﻿/, '');
  const clean = raw.replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*/g, '');
  return JSON.parse(clean).site_url.replace(/\/+$/, '');
}

async function get(url, redirect = 'manual') {
  try {
    const res = await fetch(url, { redirect, headers: { 'Cache-Control': 'no-cache' } });
    const body = Buffer.from(await res.arrayBuffer());
    return { status: res.status, location: res.headers.get('location') || '', url: res.url, body };
  } catch (e) {
    return { status: 0, location: '', url, body: Buffer.alloc(0), error: e.cause ? e.cause.message : e.message };
  }
}

// 따라가며 이동 기록 (최대 5번)
async function hops(url) {
  const list = [];
  let current = url;
  for (let i = 0; i < 5; i++) {
    const r = await get(current);
    list.push({ url: current, status: r.status, location: r.location, error: r.error });
    if (![301, 302, 307, 308].includes(r.status) || !r.location) break;
    current = new URL(r.location, current).toString();
  }
  return list;
}

const results = [];
function check(name, ok, detail) {
  results.push({ name, ok });
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ' — ' + detail : ''}`);
}
function finish() {
  const ok = results.every((r) => r.ok);
  console.log(ok ? '결과: 통과' : '결과: 실패');
  process.exitCode = ok ? 0 : 1;
}

async function hosts() {
  const NEW = 'https://albanboss.com';
  for (const p of ['/', '/wage/', '/qna.html', '/tips.html']) {
    const [a, b, c] = await Promise.all([NEW, WWW, OLD].map((base) => get(withStamp(base + p), 'follow')));
    const same = a.status === 200 && b.status === 200 && c.status === 200 &&
      sha256(a.body) === sha256(b.body) && sha256(a.body) === sha256(c.body);
    check(`${p} 새 주소·www·옛 주소 같은 내용`, same,
      `${a.status}/${b.status}/${c.status} ${a.body.length}B${a.error || b.error ? ' 오류: ' + (a.error || b.error) : ''}`);
  }
  finish();
}

async function snapshot(label) {
  if (!label) throw new Error('이름이 필요합니다. 예: snapshot before');
  const dir = path.join(TMP, `m2-${label}`);
  fs.mkdirSync(dir, { recursive: true });
  const index = {};
  for (const p of PAGES) {
    const r = await get(withStamp(OLD + p), 'follow');
    const file = (p === '/' ? 'index' : p.replace(/^\//, '').replace(/\/$/, '/index').replace(/\//g, '__')) + '.txt';
    fs.writeFileSync(path.join(dir, file), r.body);
    index[p] = { status: r.status, file, bytes: r.body.length, hash: sha256(r.body) };
    console.log(`${r.status === 200 ? '✓' : '✗'} ${OLD}${p} → ${r.status} ${r.body.length}B`);
  }
  fs.writeFileSync(path.join(dir, 'index.json'), JSON.stringify(index, null, 2) + '\n', 'utf8');
  console.log(`저장: .claude/tmp/m2-${label}/`);
}

function certInfo(host) {
  return new Promise((resolve) => {
    const socket = tls.connect({ host, port: 443, servername: host, timeout: 15000 }, () => {
      const cert = socket.getPeerCertificate();
      resolve({ authorized: socket.authorized, error: socket.authorizationError, validTo: cert.valid_to });
      socket.end();
    });
    socket.on('error', (e) => resolve({ authorized: false, error: e.message }));
    socket.on('timeout', () => { socket.destroy(); resolve({ authorized: false, error: 'timeout' }); });
  });
}

const showHops = (list) => list.map((h) => `${h.status}${h.location ? ' → ' + h.location : ''}`).join(' | ');

async function verify(label) {
  if (!label) throw new Error('비교할 snapshot 이름이 필요합니다. 예: verify before');
  const NEW = siteUrl();
  check('data/site.json의 site_url', NEW === 'https://albanboss.com', NEW);
  const before = JSON.parse(fs.readFileSync(path.join(TMP, `m2-${label}`, 'index.json'), 'utf8'));
  const oldHost = new URL(OLD).host;
  const newHost = new URL(NEW).host;

  // 1) 새 주소 페이지 200 + 내용이 전환 전과 같음 (전환 전 내용의 옛 주소 글자만 새 주소로 바꿔 비교)
  for (const p of PAGES) {
    const r = await get(withStamp(NEW + p), 'follow');
    const prev = fs.readFileSync(path.join(TMP, `m2-${label}`, before[p].file)).toString('utf8');
    const expected = prev.split(oldHost).join(newHost);
    const same = r.body.toString('utf8') === expected;
    const final = new URL(r.url).pathname;
    check(`새 주소 ${p} 200·내용 같음`, r.status === 200 && same,
      `${r.status}${final !== p ? ` (기존 짧은 주소 정리로 ${final})` : ''} ${r.body.length}B${same ? '' : ' 내용 다름'}${r.error ? ' 오류: ' + r.error : ''}`);
  }

  // 2) 옛 주소·www·http → 한 번의 301로 https://albanboss.com
  const cases = [
    [`${OLD}/wage/?x=1`, `${NEW}/wage/?x=1`],
    [`${WWW}/tips.html`, `${NEW}/tips.html`],
    [`${OLD}/`, `${NEW}/`],
    [`${OLD}/qna?today=2026-10-01`, `${NEW}/qna?today=2026-10-01`],
    [`${WWW}/`, `${NEW}/`],
    ['http://albanboss.com/wage/', `${NEW}/wage/`],
    ['http://www.albanboss.com/', `${NEW}/`]
  ];
  for (const [from, to] of cases) {
    const list = await hops(from);
    const first = list[0];
    const next = list[1] || {};
    const hostHops = list.filter((h) => [301, 302, 307, 308].includes(h.status) && new URL(h.url).origin !== NEW).length;
    const ok = first.status === 301 && first.location === to && hostHops === 1 && list[list.length - 1].status === 200;
    check(`${from} → 301 → ${to}`, ok, showHops(list) + (next.status === 307 ? ' (뒤의 307은 원래 있던 .html 짧은 주소 정리)' : ''));
  }

  // 3) HTTPS 인증서
  for (const host of [newHost, new URL(WWW).host]) {
    const c = await certInfo(host);
    check(`HTTPS 인증서 ${host}`, c.authorized, c.authorized ? `유효, 만료 ${c.validTo}` : c.error);
  }

  // 4) 배포되면 안 되는 파일
  for (const p of ['/wrangler.jsonc', '/worker/index.js', '/CLAUDE.md', '/.claude/settings.json']) {
    const r = await get(withStamp(NEW + p));
    check(`비공개 파일 ${p} 안 열림`, r.status === 404, String(r.status));
  }

  // 5) 계산 엔진 파일이 저장소와 같음
  const local = fs.readFileSync(path.join(ROOT, 'assets', 'js', 'wage-core.js'));
  const served = await get(withStamp(`${NEW}/assets/js/wage-core.js`), 'follow');
  check('배포된 wage-core.js = 저장소 파일', sha256(served.body) === sha256(local), sha256(local).slice(0, 12));
  finish();
}

const [cmd, a] = process.argv.slice(2);
const actions = { hosts, snapshot: () => snapshot(a), verify: () => verify(a) };
if (!actions[cmd]) {
  console.log('사용법: hosts | snapshot <이름> | verify <이름>');
  process.exitCode = 1;
} else {
  Promise.resolve(actions[cmd]()).catch((e) => { console.error('오류:', e.message); process.exitCode = 1; });
}
