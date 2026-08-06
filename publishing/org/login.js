/* ==========================================================================
   SortOne - login.js (로그인 화면 로직)
   실제 OAuth/이메일 인증 연동 없이, 클릭 시 로그인 상태만 저장하고
   index.html로 이동하는 더미 UI로 구현 (작업계획_퍼블리싱.md 7-8 참고)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('kakaoLoginBtn').addEventListener('click', () => handleLogin());
  document.getElementById('googleLoginBtn').addEventListener('click', () => handleLogin());
});

function handleLogin() {
  localStorage.setItem('sortone_logged_in', 'true');
  window.location.href = 'index.html';
}
