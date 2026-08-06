/* ==========================================================================
   SortOne - sidebar.js (햄버거 메뉴 / 사이드 드로어 공통 로직)
   splash.html, login.html을 제외한 모든 화면에서 공통으로 로드됩니다.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('sidebarOverlay');
  if (!overlay) return; // 드로어 마크업이 없는 페이지(splash/login)는 스킵

  renderSidebarProfile();
  bindSidebarEvents(overlay);
});

/** 사이드바 상단 프로필 요약 렌더링 (ProfileStore 데이터 재사용) */
function renderSidebarProfile() {
  if (typeof ProfileStore === 'undefined') return;
  const user = ProfileStore.getUser();

  const avatarEl = document.getElementById('sidebarAvatar');
  const nameEl = document.getElementById('sidebarName');
  const badgeEl = document.getElementById('sidebarBadge');
  const emailEl = document.getElementById('sidebarEmail');

  if (avatarEl) avatarEl.src = user.avatarUrl;
  if (nameEl) nameEl.textContent = user.name;
  if (badgeEl) badgeEl.textContent = user.membership;
  if (emailEl) emailEl.textContent = user.email;
}

function bindSidebarEvents(overlay) {
  const hamburgerBtn = document.querySelector('.header__icon-btn[aria-label="메뉴"]');
  const drawer = document.getElementById('sidebarDrawer');

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', () => openSidebar(overlay));
  }

  // 딤 영역(드로어 바깥) 클릭 시 닫기
  overlay.addEventListener('click', (e) => {
    if (drawer && !drawer.contains(e.target)) {
      closeSidebar(overlay);
    }
  });

  // 카테고리 메뉴: index.html로 이동 + 카테고리 필터 적용
  overlay.querySelectorAll('[data-category]').forEach((el) => {
    el.addEventListener('click', () => {
      const category = el.dataset.category;
      window.location.href = `index.html?category=${encodeURIComponent(category)}`;
    });
  });

  // 보관함/휴지통: 해당 화면으로 이동
  overlay.querySelectorAll('[data-todo]').forEach((el) => {
    el.addEventListener('click', () => {
      const target = el.dataset.todo;
      if (target === '보관함') {
        window.location.href = 'archive.html';
      } else if (target === '휴지통') {
        window.location.href = 'trash.html';
      }
    });
  });

  // 설정: 아직 별도 화면이 없으므로 준비 중 안내만 표시
  const settingsBtn = document.getElementById('sidebarSettingsBtn');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      alert('설정 화면은 준비 중이에요.');
    });
  }

  // 로그아웃
  const logoutBtn = document.getElementById('sidebarLogoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      showLogoutPopup(overlay);
    });
  }
}

function showLogoutPopup(overlay = null) {
  // 사이드바 닫기
  if (overlay) {
    closeSidebar(overlay);
  }

  let popup = document.getElementById('logoutPopupOverlay');
  if (!popup) {
    popup = document.createElement('div');
    popup.id = 'logoutPopupOverlay';
    popup.className = 'logout-popup-overlay';
    popup.innerHTML = `
      <div class="logout-popup">
        <div class="logout-popup__content">
          <h2 class="logout-popup__title">정말 로그아웃 하시겠습니까?</h2>
          <p class="logout-popup__desc">로그아웃 하시면 현재 진행 중인 세션이<br/>종료되며, 다시 로그인해야 서비스를 이용<br/>하실 수 있습니다.</p>
        </div>
        <div class="logout-popup__actions">
          <button class="logout-popup__btn logout-popup__btn--confirm" id="logoutConfirmBtn">로그아웃</button>
          <button class="logout-popup__btn logout-popup__btn--cancel" id="logoutCancelBtn">취소</button>
        </div>
      </div>
    `;
    document.body.appendChild(popup);

    document.getElementById('logoutConfirmBtn').addEventListener('click', () => {
      if (typeof ProfileStore !== 'undefined') ProfileStore.logout();
      window.location.href = 'login.html';
    });

    document.getElementById('logoutCancelBtn').addEventListener('click', () => {
      popup.style.display = 'none';
    });
  }

  popup.style.display = 'flex';
}

function openSidebar(overlay) {
  overlay.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function closeSidebar(overlay) {
  overlay.classList.remove('is-open');
  document.body.style.overflow = '';
}
