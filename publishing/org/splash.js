/* ==========================================================================
   SortOne - splash.js (스플래시 화면 로직)
   ========================================================================== */

const SPLASH_DURATION = 1600; // 로고 노출 시간(ms)
const FADE_OUT_DURATION = 350; // 페이드아웃 애니메이션 시간(ms, splash.css와 값 일치)

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(goToMain, SPLASH_DURATION);
});

function goToMain() {
  const app = document.querySelector('.app');
  app.classList.add('is-leaving');

  setTimeout(() => {
    window.location.href = 'login.html';
  }, FADE_OUT_DURATION);
}
