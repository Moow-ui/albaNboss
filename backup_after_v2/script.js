/**
 * ==============================================================================
 * 포털 사이트 동작 스크립트 (Vanilla JavaScript)
 * 외부 라이브러리 없이 가볍고 빠르게 동작합니다.
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initPendingFeatures();
});

/**
 * 1. 대시보드 탭 전환 기능 (사장님용 / 알바생용)
 */
function initTabs() {
  const tabs = document.querySelectorAll('[role="tab"]');
  const panels = document.querySelectorAll('[role="tabpanel"]');

  tabs.forEach((tab) => {
    // 탭 클릭 시 전환 이벤트
    tab.addEventListener('click', () => {
      // 1) 모든 탭 비활성화
      tabs.forEach((t) => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });

      // 2) 모든 내용 패널 숨김
      panels.forEach((p) => {
        p.classList.remove('active');
        p.setAttribute('hidden', 'true');
      });

      // 3) 선택한 탭 활성화
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      // 4) 연결된 패널 활성화
      const targetPanelId = tab.getAttribute('aria-controls');
      const targetPanel = document.getElementById(targetPanelId);

      if (targetPanel) {
        targetPanel.removeAttribute('hidden');
        targetPanel.classList.add('active');
      }
    });

    // 키보드 좌/우 방향키로도 탭 전환 가능하도록 지원
    tab.addEventListener('keydown', (e) => {
      let nextTab = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        nextTab = tab.nextElementSibling || tabs[0];
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        nextTab = tab.previousElementSibling || tabs[tabs.length - 1];
      }

      if (nextTab) {
        e.preventDefault();
        nextTab.focus();
        nextTab.click();
      }
    });
  });
}

/**
 * 2. 준비 중인 계산기 클릭 시 안내 토스트 팝업 띄우기
 */
function initPendingFeatures() {
  const pendingButtons = document.querySelectorAll('.calc-card.is-pending');
  // toast-message ID 또는 toast 클래스 모두 대응
  const toast = document.getElementById('toast-message') || document.querySelector('.toast');
  let toastTimer = null;

  pendingButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault(); // 기본 빈 링크 이동 방지
      const featureName = btn.getAttribute('data-feature-name') || '해당 기능';
      showToast(`✨ '${featureName}'은(는) 현재 준비 중입니다. 곧 찾아뵙겠습니다!`);
    });
  });

  function showToast(message) {
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add('show');

    if (toastTimer) {
      clearTimeout(toastTimer);
    }

    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }
}
