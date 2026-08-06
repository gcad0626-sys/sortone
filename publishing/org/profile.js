/* ==========================================================================
   SortOne - profile.js (프로필 화면 로직)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  renderProfile();
  renderAiToggle();

  document.getElementById('aiToggle').addEventListener('click', () => {
    ProfileStore.toggleAiAutoClassify();
    renderAiToggle();
  });

  document.getElementById('logoutBtn').addEventListener('click', () => {
    if (typeof showLogoutPopup === 'function') {
      showLogoutPopup();
    } else {
      if (confirm('로그아웃 하시겠어요?')) {
        ProfileStore.logout();
        window.location.href = 'login.html';
      }
    }
  });

  // 팝업 열기/닫기 유틸리티
  const showModal = (id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'flex';
  };
  const hideModal = (id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  };

  // 1. 계정 삭제 모달
  document.getElementById('deleteAccountBtn').addEventListener('click', () => showModal('deleteAccountModal'));
  document.getElementById('cancelDeleteBtn').addEventListener('click', () => hideModal('deleteAccountModal'));
  document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
    hideModal('deleteAccountModal');
    showModal('deleteCompleteModal');
  });
  document.getElementById('closeDeleteCompleteBtn').addEventListener('click', () => {
    hideModal('deleteCompleteModal');
    ProfileStore.deleteAccount();
    window.location.href = 'login.html';
  });

  // 2. 데이터 백업 및 복구 모달
  document.getElementById('openBackupRecoveryBtn').addEventListener('click', () => showModal('backupRecoveryModal'));
  document.getElementById('closeBackupRecoveryBtn').addEventListener('click', () => hideModal('backupRecoveryModal'));

  // 3. 데이터 복구 플로우
  document.getElementById('goToRestoreBtn').addEventListener('click', () => {
    hideModal('backupRecoveryModal');
    showModal('restoreStartModal');
  });
  document.getElementById('cancelRestoreBtn').addEventListener('click', () => hideModal('restoreStartModal'));
  document.getElementById('confirmRestoreBtn').addEventListener('click', () => {
    hideModal('restoreStartModal');
    showModal('restoreCompleteModal');
  });
  document.getElementById('closeRestoreCompleteBtn').addEventListener('click', () => hideModal('restoreCompleteModal'));

  // 4. 데이터 백업 플로우
  document.getElementById('goToBackupBtn').addEventListener('click', () => {
    hideModal('backupRecoveryModal');
    showModal('backupStartModal');
  });
  document.getElementById('cancelBackupBtn').addEventListener('click', () => hideModal('backupStartModal'));
  document.getElementById('confirmBackupBtn').addEventListener('click', () => {
    hideModal('backupStartModal');
    showModal('backupCompleteModal');
  });
  document.getElementById('closeBackupCompleteBtn').addEventListener('click', () => hideModal('backupCompleteModal'));

  // 5. 활동내역 내보내기 모달
  document.getElementById('openExportActivityBtn').addEventListener('click', () => showModal('exportActivityModal'));
  document.getElementById('closeExportActivityBtn').addEventListener('click', () => hideModal('exportActivityModal'));
  document.getElementById('pdfExportBtn').addEventListener('click', () => {
    alert('PDF로 내보내기가 시작됩니다.');
    hideModal('exportActivityModal');
  });

  // 모달 바깥(오버레이) 클릭 시 닫기 공통 처리
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.style.display = 'none';
      }
    });
  });
});

/** 프로필 정보(사진/이름/이메일/뱃지) 렌더링 */
function renderProfile() {
  const user = ProfileStore.getUser();

  document.getElementById('profileAvatar').src = user.avatarUrl;
  document.getElementById('profileAvatar').alt = `${user.name} 프로필 사진`;
  document.getElementById('profileName').textContent = user.name;
  document.getElementById('profileEmail').textContent = user.email;
  document.getElementById('profileMembership').textContent = user.membership;
  document.getElementById('profileActiveSince').textContent = `Active since ${user.activeSince}`;
}

/** AI 자동 분류 모드 토글 스위치 렌더링 */
function renderAiToggle() {
  const settings = ProfileStore.getSettings();
  const toggleEl = document.getElementById('aiToggle');
  toggleEl.classList.toggle('is-on', settings.aiAutoClassify);
  toggleEl.setAttribute('aria-checked', String(settings.aiAutoClassify));
}
