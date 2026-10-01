// scripts/generate-qa-pages.js
// 대표지시 W40-09 (1단계 잔여): data/qna.json의 각 항목을 /qa/[slug]/index.html
// 정적 페이지로 만든다. 본문이 HTML 소스에 그대로 들어가는 정적 페이지이며,
// qna.json에 이미 있는 검증된 내용(answer·law·source_url)만 재구성하고
// 새로운 법적 사실은 추가하지 않는다. FAQ 구조화 데이터는 넣지 않는다(지시서 명시).
//
// 실행: node scripts/generate-qa-pages.js

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

function resolveCalcHref(url) {
  // wage/index.html 같은 포털 내부 경로는 루트 기준이므로 /qa/[slug]/에서는 ../../ 를 붙인다.
  if (/^https?:\/\//.test(url)) return url;
  return `../../${url}`;
}

function relatedQna(item, all) {
  const sameTag = all.filter(
    (q) => q.slug !== item.slug && Array.isArray(q.tags) && Array.isArray(item.tags) && q.tags.some((t) => item.tags.includes(t))
  );
  const others = all.filter((q) => q.slug !== item.slug && !sameTag.includes(q));
  return [...sameTag, ...others].slice(0, 3);
}

function renderPage(item, allQna) {
  const title = item.seo_title || item.question;
  const pageTitle = `${title} | ALBA&BOSS`;
  const description = item.answer.length > 120 ? `${item.answer.slice(0, 117)}...` : item.answer;
  const pageUrl = `${SITE_URL}/qa/${item.slug}/`;
  const related = relatedQna(item, allQna);

  const calcButton = item.calculator_link
    ? `<div class="calc-cta-row">
          <a class="ab-btn ab-btn--primary" href="${escapeHtml(resolveCalcHref(item.calculator_link))}"${/^https?:\/\//.test(item.calculator_link) ? ' target="_blank" rel="noopener"' : ''}>관련 계산기로 확인하기</a>
        </div>`
    : '';

  const relatedItems = related
    .map(
      (r) => `<a class="related-item" href="../${escapeHtml(r.slug)}/">
            <div class="rel-title">${escapeHtml(r.seo_title || r.question)}</div>
            <div class="rel-sub">노무 Q&amp;A</div>
          </a>`
    )
    .join('\n          ');

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
      { "@type": "ListItem", "position": 3, "name": "노무 Q&A", "item": "${SITE_URL}/qna.html" },
      { "@type": "ListItem", "position": 4, "name": "${escapeHtml(item.question)}", "item": "${escapeHtml(pageUrl)}" }
    ]
  }
  </script>

  <style>
    .article-wrap{ max-width:760px; margin:0 auto; padding:0 20px; }
    .article-hero{ padding:40px 0 28px; }
    .article-title{ font-size:var(--ab-fs-32); font-weight:800; letter-spacing:-0.03em; line-height:1.32; margin:14px 0 12px; color:var(--ab-text); word-break:keep-all; }
    .article-meta{ display:flex; flex-wrap:wrap; align-items:center; gap:10px; font-size:var(--ab-fs-13); color:var(--ab-text-3); margin-bottom:4px; }
    .article-lead{ font-size:var(--ab-fs-17); color:var(--ab-text-2); line-height:1.65; word-break:keep-all; }
    .tag-row{ display:flex; flex-wrap:wrap; gap:6px; margin-bottom:10px; }
    .tag-chip{ font-size:0.78rem; font-weight:600; color:var(--ab-text-2); background:var(--ab-bg); padding:3px 10px; border-radius:var(--ab-r-pill); }

    article section{ margin-bottom:32px; }
    article h2{ font-size:var(--ab-fs-26); font-weight:800; letter-spacing:-0.02em; margin-bottom:14px; padding-top:8px; border-top:1px solid var(--ab-line); word-break:keep-all; }
    article section:first-of-type h2{ border-top:none; padding-top:0; }
    article p{ margin-bottom:12px; word-break:keep-all; }

    .answer-box{ background:var(--ab-boss-soft); border:1px solid var(--ab-boss); border-radius:var(--ab-r-lg); padding:20px 22px; }
    .answer-box p{ font-size:var(--ab-fs-16); color:var(--ab-text); line-height:1.7; margin-bottom:0; word-break:keep-all; }

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
        <li><a href="../../qna.html">노무 Q&amp;A</a></li>
        <li class="sep" aria-hidden="true">›</li>
        <li aria-current="page">${escapeHtml(item.question)}</li>
      </ol>
    </div>
  </nav>

  <div class="article-wrap">
    <section class="article-hero">
      <span class="ab-eyebrow">노무 Q&amp;A · 사장님 · 알바생</span>
      <h1 class="article-title">${escapeHtml(item.question)}</h1>
      <div class="article-meta">
        <span>ALBA&amp;BOSS 편집부</span>
      </div>
      ${Array.isArray(item.tags) && item.tags.length ? `<div class="tag-row">${item.tags.map((t) => `<span class="tag-chip">#${escapeHtml(t)}</span>`).join('')}</div>` : ''}
    </section>

    <article>
      <section>
        <h2>답변</h2>
        <div class="answer-box"><p>${escapeHtml(item.answer)}</p></div>
      </section>

      ${item.law ? `<section>
        <h2>근거 조문</h2>
        <table class="law-table">
          <thead><tr><th>내용</th><th>근거</th><th>출처</th></tr></thead>
          <tbody>
            <tr>
              <td>${escapeHtml(item.question)}</td>
              <td>${escapeHtml(item.law)}</td>
              <td><a href="${escapeHtml(item.source_url || 'https://www.law.go.kr')}" target="_blank" rel="noopener">${item.source_url ? new URL(item.source_url).hostname : 'law.go.kr'}</a></td>
            </tr>
          </tbody>
        </table>
      </section>` : ''}

      ${calcButton ? `<section>
        <h2>계산기로 바로 확인하기</h2>
        ${calcButton}
      </section>` : ''}

      ${related.length ? `<section>
        <h2>더 읽어보면 좋은 질문</h2>
        <div class="related-list">
          ${relatedItems}
        </div>
      </section>` : ''}

      <section>
        <div class="verify-badge">✅ 노무검수관 통과</div>
        <div class="verify-footer">
          이 답변은 ALBA&amp;BOSS 편집부가 법령·정부 공식 안내를 근거로 정리한 일반 기준 설명이며,
          개별 사안에 대한 단정이 아닙니다. 정확한 판단은 관할 노동청 또는 공인노무사 상담을 권장합니다.
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
  const qna = readJson('data/qna.json');

  const missingSlug = qna.filter((q) => !q.slug);
  if (missingSlug.length) {
    throw new Error(`slug 없는 항목이 있습니다: ${missingSlug.map((q) => q.question).join(', ')}`);
  }

  let count = 0;
  qna.forEach((item) => {
    const dir = path.join(ROOT, 'qa', item.slug);
    fs.mkdirSync(dir, { recursive: true });
    const html = renderPage(item, qna);
    fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf8');
    count += 1;
  });

  console.log(`OK: ${count}개 노무 Q&A 개별 페이지를 생성했습니다. (qa/<slug>/index.html)`);
}

main();
