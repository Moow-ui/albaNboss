/**
 * assets/js/layout.js
 * ALBA & BOSS 포털 전 페이지 공통 레이아웃 (헤더, 브레드크럼, 푸터) 관리 모듈
 */
(function () {
  'use strict';

  function initLayout() {
    const path = window.location.pathname;
    const isSubdir = path.includes('/wage/');
    const basePath = isSubdir ? '../' : '';

    // 현재 페이지 정보 판별
    let activeMenu = 'dashboard';
    let parentMenu = '정보 광장';
    let parentLink = basePath + 'index.html#widget-section';
    let pageTitle = '';

    if (path.endsWith('qna.html') || path.includes('/qna')) {
      activeMenu = 'info';
      pageTitle = '노무 Q&A';
    } else if (path.endsWith('board.html') || path.includes('/board')) {
      activeMenu = 'info';
      pageTitle = '자유 커뮤니티';
    } else if (path.endsWith('policy.html') || path.includes('/policy')) {
      activeMenu = 'info';
      pageTitle = '정책 소식';
    } else if (path.endsWith('news.html') || path.includes('/news')) {
      activeMenu = 'info';
      pageTitle = '최신 뉴스';
    } else if (path.endsWith('tips.html') || path.includes('/tips')) {
      activeMenu = 'info';
      pageTitle = '세무·노무 팁';
    } else if (path.endsWith('videos.html') || path.includes('/videos')) {
      activeMenu = 'info';
      pageTitle = '추천 영상';
    } else if (isSubdir) {
      activeMenu = 'dashboard';
      parentMenu = '계산기 대시보드';
      parentLink = basePath + 'index.html#dashboard-section';
      pageTitle = '사장님 시급 계산기';
    } else {
      activeMenu = 'dashboard';
      pageTitle = '';
    }

    const isMain = !pageTitle;

    // 1. 공통 헤더 렌더링
    const header = document.querySelector('header');
    if (header) {
      header.className = 'site-header ab-header';
      header.id = 'site-header';
      header.innerHTML = `
        <div class="container header-container ab-header-container">
          <div class="logo-group">
            <a href="${basePath}index.html" class="ab-logo" title="ALBA & BOSS 포털 홈으로 이동">
              <span class="a">ALBA</span><span class="amp">&amp;</span><span class="b">BOSS</span>
            </a>
          </div>
          <nav id="main-nav" class="main-nav" aria-label="메인 메뉴">
            <ul class="nav-list ab-nav-list">
              <li class="nav-item">
                <a href="${isMain ? '#dashboard-section' : basePath + 'index.html#dashboard-section'}" 
                   class="nav-link ab-nav-link ${activeMenu === 'dashboard' ? 'is-active active' : ''}">계산기 대시보드</a>
              </li>
              <li class="nav-item">
                <a href="${isMain ? '#widget-section' : basePath + 'index.html#widget-section'}" 
                   class="nav-link ab-nav-link ${activeMenu === 'info' ? 'is-active active' : ''}">정보 광장</a>
              </li>
              <li class="nav-item">
                <a href="#site-footer" 
                   class="nav-link ab-nav-link ${activeMenu === 'support' ? 'is-active active' : ''}">고객안내</a>
              </li>
            </ul>
          </nav>
        </div>
      `;
    }

    // 2. 하위 페이지 브레드크럼 (이동 경로 표시)
    if (!isMain && header) {
      let breadcrumb = document.querySelector('.ab-breadcrumb');
      if (!breadcrumb) {
        breadcrumb = document.createElement('nav');
        breadcrumb.className = 'ab-breadcrumb';
        breadcrumb.setAttribute('aria-label', '이동 경로');
        header.parentNode.insertBefore(breadcrumb, header.nextSibling);
      }
      breadcrumb.innerHTML = `
        <div class="container ab-breadcrumb-container">
          <ol class="ab-breadcrumb-list">
            <li><a href="${basePath}index.html">홈</a></li>
            <li class="sep" aria-hidden="true">›</li>
            <li><a href="${parentLink}">${parentMenu}</a></li>
            <li class="sep" aria-hidden="true">›</li>
            <li aria-current="page">${pageTitle}</li>
          </ol>
        </div>
      `;
    }

    // 3. 공통 푸터 렌더링
    const footer = document.querySelector('footer');
    if (footer) {
      footer.className = 'site-footer ab-footer';
      footer.id = 'site-footer';
      footer.innerHTML = `
        <div class="container footer-container ab-footer-container">
          <div class="footer-info">
            <p class="footer-title ab-footer-title">ALBA &amp; BOSS 포털</p>
            <p class="footer-text ab-footer-text">사장님과 알바생을 위한 스마트 계산기 및 종합 정보 플랫폼</p>
          </div>
          <div class="ab-footer-links">
            <a href="${basePath}terms.html" class="ab-footer-link">이용약관</a>
            <span class="ab-footer-sep" aria-hidden="true">&middot;</span>
            <a href="${basePath}privacy.html" class="ab-footer-link privacy">개인정보처리방침</a>
            <span class="ab-footer-sep" aria-hidden="true">&middot;</span>
            <span class="ab-footer-contact" title="문의 메일 주소는 준비 중입니다." onclick="alert('문의 이메일 주소는 현재 준비 중입니다.')">문의하기</span>
          </div>
          <p class="footer-disclaimer-note ab-footer-note">계산 결과와 정보는 참고용이며, 정확한 판단은 고용노동부(국번없이 1350) 또는 공인노무사와 상담하세요.</p>
          <p class="footer-copy ab-footer-copy">&copy; 2026 ALBA &amp; BOSS. 비개발자 1인 운영 &middot; 주 1회 업데이트</p>
        </div>
      `;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLayout);
  } else {
    initLayout();
  }
})();
