// scripts/generate-tip-pages.js
// 대표지시 W40-02 (1단계): data/tips.json의 각 항목을 /tips/[slug]/index.html
// 정적 페이지로 만든다. 본문이 HTML 소스에 그대로 들어가는 정적 페이지이며,
// tips.json에 이미 있는 검증된 내용(summary·detail_tip·law)만 재구성하고
// 새로운 법적 사실은 추가하지 않는다.
//
// 실행: node scripts/generate-tip-pages.js

const fs = require('fs');
const path = require('path');
const { siteUrl } = require('./site-url');

const ROOT = path.join(__dirname, '..');
const SITE_URL = siteUrl();

function stripComments(raw) {
  return raw.replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*/g, '');
}

function readJson(relPath) {
  const raw = fs.readFileSync(path.join(ROOT, relPath), 'utf8');
  return JSON.parse(stripComments(raw));
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const CATEGORY_CLASS = { 세무팁: 'cat-tax', 노무팁: 'cat-labor', 정부지원금: 'cat-grant' };

function matchCalculators(tip, calculatorLinks) {
  const haystack = [tip.title, tip.summary, tip.detail_tip, ...(tip.tags || [])].join(' ');
  const matched = [];
  const seen = new Set();
  calculatorLinks.forEach((group) => {
    const hit = group.keywords.some((kw) => haystack.includes(kw));
    if (!hit) return;
    group.calculators.forEach((calc) => {
      if (!calc.is_ready || !calc.url || seen.has(calc.name)) return;
      seen.add(calc.name);
      matched.push(calc);
    });
  });
  return matched;
}

function relatedTips(tip, allTips) {
  const sameCategory = allTips.filter((t) => t.slug !== tip.slug && t.category === tip.category);
  const others = allTips.filter((t) => t.slug !== tip.slug && t.category !== tip.category);
  return [...sameCategory, ...others].slice(0, 3);
}

function resolveCalcHref(url) {
  // wage/index.html 같은 포털 내부 경로는 루트 기준이므로 /tips/[slug]/에서는 ../../ 를 붙인다.
  if (/^https?:\/\//.test(url)) return url;
  return `../../${url}`;
}

function renderPage(tip, allTips, calculatorLinks) {
  const title = tip.seo_title || tip.title;
  const pageTitle = `${title} | ALBA&BOSS`;
  const description = tip.summary.length > 120 ? `${tip.summary.slice(0, 117)}...` : tip.summary;
  const pageUrl = `${SITE_URL}/tips/${tip.slug}/`;
  const catClass = CATEGORY_CLASS[tip.category] || 'cat-labor';
  const calcs = matchCalculators(tip, calculatorLinks);
  const related = relatedTips(tip, allTips);

  const calcButtons = calcs
    .map((c, i) => `<a class="ab-btn ${i === 0 ? 'ab-btn--primary' : 'ab-btn--secondary'}" href="${escapeHtml(resolveCalcHref(c.url))}"${/^https?:\/\//.test(c.url) ? ' target="_blank" rel="noopener"' : ''}>${escapeHtml(c.name)} 열기</a>`)
    .join('\n          ');

  const relatedItems = related
    .map(
      (r) => `<a class="related-item" href="../${escapeHtml(r.slug)}/">
            <div class="rel-title">${escapeHtml(r.seo_title || r.title)}</div>
            <div class="rel-sub">${escapeHtml(r.category)} · 세무·노무 팁</div>
          </a>`
    )
    .join('\n          ');

  const lawRow = tip.law
    ? `<tr>
              <td>근거 조문</td>
              <td>${escapeHtml(tip.law)}</td>
              <td><a href="https://www.law.go.kr/법령/근로기준법" target="_blank" rel="noopener">law.go.kr</a></td>
            </tr>`
    : '';

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(pageTitle)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${escapeHtml(pageUrl)}">
  <link rel="icon" type="image/svg+xml" href="../../assets/icons/favicon.svg">
  <link rel="alternate icon" href="../../assets/icons/favicon.png">

  <!-- Open Graph -->
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="ALBA&BOSS">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${SITE_URL}/assets/images/og-image.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="${escapeHtml(pageUrl)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${SITE_URL}/assets/images/og-image.png">

  <!-- Pretendard 글꼴 및 ALBA&BOSS 디자인 토큰 -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
  <link rel="stylesheet" href="../../assets/css/tokens.css">

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "홈", "item": "${SITE_URL}/" },
      { "@type": "ListItem", "position": 2, "name": "정보 광장", "item": "${SITE_URL}/index.html#widget-section" },
      { "@type": "ListItem", "position": 3, "name": "세무·노무 팁", "item": "${SITE_URL}/tips.html" },
      { "@type": "ListItem", "position": 4, "name": "${escapeHtml(tip.title)}", "item": "${escapeHtml(pageUrl)}" }
    ]
  }
  </script>

  <style>
    .article-wrap{ max-width:760px; margin:0 auto; padding:0 20px; }
    .article-hero{ padding:40px 0 28px; }
    .article-title{ font-size:var(--ab-fs-32); font-weight:800; letter-spacing:-0.03em; line-height:1.32; margin:14px 0 12px; color:var(--ab-text); word-break:keep-all; }
    .article-meta{ display:flex; flex-wrap:wrap; align-items:center; gap:10px; font-size:var(--ab-fs-13); color:var(--ab-text-3); margin-bottom:4px; }
    .article-lead{ font-size:var(--ab-fs-17); color:var(--ab-text-2); line-height:1.65; word-break:keep-all; }
    .badge-row{ display:flex; gap:8px; margin-bottom:10px; }
    .badge-category{ font-size:0.78rem; font-weight:700; padding:3px 10px; border-radius:var(--ab-r-pill); }
    .cat-tax{ background:#fef3c7; color:#92400e; }
    .cat-labor{ background:#dbeafe; color:#1e40af; }
    .cat-grant{ background:#dcfce7; color:#166534; }
    .badge-target{ font-size:0.78rem; font-weight:600; color:var(--ab-text-2); background:var(--ab-bg); padding:3px 10px; border-radius:var(--ab-r-pill); }

    article section{ margin-bottom:32px; }
    article h2{ font-size:var(--ab-fs-26); font-weight:800; letter-spacing:-0.02em; margin-bottom:14px; padding-top:8px; border-top:1px solid var(--ab-line); word-break:keep-all; }
    article section:first-of-type h2{ border-top:none; padding-top:0; }
    article p{ margin-bottom:12px; word-break:keep-all; }

    .callout{ border-left:4px solid var(--ab-boss); background:var(--ab-surface); border-radius:0 var(--ab-r-md) var(--ab-r-md) 0; padding:14px 18px; font-size:var(--ab-fs-14); color:var(--ab-text-2); margin:14px 0; }
    .callout strong{ color:var(--ab-text); }

    .law-table{ width:100%; border-collapse:collapse; font-size:var(--ab-fs-13); margin-top:8px; }
    .law-table th, .law-table td{ border:1px solid var(--ab-line); padding:9px 10px; text-align:left; vertical-align:top; }
    .law-table th{ background:var(--ab-bg); }
    .law-table a{ color:var(--ab-boss); text-decoration:underline; }

    .calc-cta-row{ display:flex; flex-wrap:wrap; gap:10px; margin-top:16px; }

    .related-list{ display:flex; flex-direction:column; gap:10px; }
    .related-item{ display:block; background:var(--ab-surface); border:1px solid var(--ab-line); border-radius:var(--ab-r-md); padding:14px 16px; text-decoration:none; transition:border-color .2s; }
    .related-item:hover{ border-color:var(--ab-boss); }
    .related-item .rel-title{ font-weight:700; color:var(--ab-text); font-size:var(--ab-fs-15); }
    .related-item .rel-sub{ font-size:var(--ab-fs-12); color:var(--ab-text-3); margin-top:2px; }

    .verify-footer{ background:var(--ab-bg); border:1px dashed var(--ab-line-strong); border-radius:var(--ab-r-md); padding:16px 18px; font-size:var(--ab-fs-12); color:var(--ab-text-3); line-height:1.7; margin-top:8px; }
    .verify-badge{ display:inline-flex; align-items:center; gap:6px; background:var(--ab-live-soft); color:var(--ab-live); font-weight:700; font-size:var(--ab-fs-12); padding:4px 10px; border-radius:var(--ab-r-pill); margin-bottom:8px; }
  </style>
</head>
<body>

  <header class="site-header ab-header" id="site-header">
    <div class="container header-container ab-header-container">
      <div class="logo-group">
        <a href="../../index.html" class="ab-logo" title="ALBA & BOSS 포털 홈으로 이동">
          <span class="a">ALBA</span><span class="amp">&amp;</span><span class="b">BOSS</span>
        </a>
      </div>
      <nav id="main-nav" class="main-nav" aria-label="메인 메뉴">
        <ul class="nav-list ab-nav-list">
          <li class="nav-item"><a href="../../index.html#dashboard-section" class="nav-link ab-nav-link">계산기 대시보드</a></li>
          <li class="nav-item"><a href="../../index.html#widget-section" class="nav-link ab-nav-link is-active active">정보 광장</a></li>
          <li class="nav-item"><a href="../../index.html#site-footer" class="nav-link ab-nav-link">고객안내</a></li>
        </ul>
      </nav>
    </div>
  </header>

  <nav class="ab-breadcrumb" aria-label="이동 경로">
    <div class="container ab-breadcrumb-container">
      <ol class="ab-breadcrumb-list">
        <li><a href="../../index.html">홈</a></li>
        <li class="sep" aria-hidden="true">›</li>
        <li><a href="../../tips.html">세무·노무 팁</a></li>
        <li class="sep" aria-hidden="true">›</li>
        <li aria-current="page">${escapeHtml(tip.title)}</li>
      </ol>
    </div>
  </nav>

  <div class="article-wrap">
    <section class="article-hero">
      <div class="badge-row">
        <span class="badge-category ${catClass}">${escapeHtml(tip.category)}</span>
        <span class="badge-target">${escapeHtml(tip.target)}</span>
      </div>
      <h1 class="article-title">${escapeHtml(title)}</h1>
      <div class="article-meta">
        <span>${escapeHtml(tip.author)}</span>
        <span aria-hidden="true">·</span>
        <span>${escapeHtml(tip.date)} 작성</span>
      </div>
    </section>

    <article>
      <section>
        <h2>핵심 요약</h2>
        <p class="article-lead">${escapeHtml(tip.summary)}</p>
      </section>

      <section>
        <h2>실무 팁</h2>
        <div class="callout"><strong>실무 적용 팁</strong> — ${escapeHtml(tip.detail_tip)}</div>
      </section>

      ${tip.law ? `<section>
        <h2>근거 조문</h2>
        <table class="law-table">
          <thead><tr><th>내용</th><th>근거</th><th>출처</th></tr></thead>
          <tbody>
            ${lawRow}
          </tbody>
        </table>
      </section>` : ''}

      ${calcs.length ? `<section>
        <h2>관련 계산기로 확인하기</h2>
        <div class="calc-cta-row">
          ${calcButtons}
        </div>
      </section>` : ''}

      ${related.length ? `<section>
        <h2>더 읽어보면 좋은 글</h2>
        <div class="related-list">
          ${relatedItems}
        </div>
      </section>` : ''}

      <section>
        <div class="verify-badge">✅ 노무검수관 통과</div>
        <div class="verify-footer">
          이 글은 ${escapeHtml(tip.date)}에 ALBA&amp;BOSS 편집부가 정리한 실무 팁이며, 개별 사업장의 상황에 따라
          결과가 달라질 수 있는 일반 기준 설명입니다. 법적 효력이 없는 참고 자료이므로 정확한 판단은
          관할 노동청 또는 공인노무사 상담을 권장합니다.
        </div>
      </section>
    </article>
  </div>

  <footer class="ab-footer">
    <div class="ab-container">
      <div class="ab-footer-links">
        <a href="../../terms.html" class="ab-footer-link">이용약관</a>
        <span class="ab-footer-sep" aria-hidden="true">&middot;</span>
        <a href="../../privacy.html" class="ab-footer-link privacy">개인정보처리방침</a>
        <span class="ab-footer-sep" aria-hidden="true">&middot;</span>
        <span class="ab-footer-contact" title="문의 메일 주소는 준비 중입니다.">문의하기</span>
      </div>
      <p>&copy; 2026 ALBA &amp; BOSS. 비개발자 1인 운영 &middot; 주 1회 업데이트</p>
      <p style="margin-top: 4px; font-size: 12px; color: var(--ab-text-3);">
        본 포털의 모든 계산 결과 및 정보는 법적 효력이 없으며 참고용입니다. 정확한 판단은 공인노무사 등 전문가 상담을 권장합니다.
      </p>
    </div>
  </footer>

</body>
</html>
`;
}

function main() {
  const tips = readJson('data/tips.json');
  const calculatorLinks = readJson('data/calculator-links.json');

  const missingSlug = tips.filter((t) => !t.slug);
  if (missingSlug.length) {
    throw new Error(`slug 없는 항목이 있습니다: ${missingSlug.map((t) => t.title).join(', ')}`);
  }

  let count = 0;
  tips.forEach((tip) => {
    const dir = path.join(ROOT, 'tips', tip.slug);
    fs.mkdirSync(dir, { recursive: true });
    const html = renderPage(tip, tips, calculatorLinks);
    fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf8');
    count += 1;
  });

  console.log(`OK: ${count}개 팁 개별 페이지를 생성했습니다. (tips/<slug>/index.html)`);
}

main();
