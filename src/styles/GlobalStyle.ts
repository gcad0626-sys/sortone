import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  @import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css");
  @import url('https://fonts.googleapis.com/css2?family=Annie+Use+Your+Telescope&display=swap');

  /* Reset */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    -webkit-tap-highlight-color: transparent;
  }

  html, body {
    width: 100%;
    height: 100%;
    background-color: ${({ theme }) => theme.colors.primary};
    font-family: ${({ theme }) => theme.fonts.base};
    color: ${({ theme }) => theme.colors.textMain};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  button, input, textarea, select {
    font-family: inherit;
    outline: none;
    border: none;
    background: none;
  }

  button {
    cursor: pointer;
  }

  ul, li {
    list-style: none;
  }

  /* App Container */
  .app {
    position: relative;
    width: 100%;
    max-width: ${({ theme }) => theme.layout.appMaxWidth};
    min-height: 100vh;
    margin: 0 auto;
    background-color: ${({ theme }) => theme.colors.primary};
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    animation: app-fade-in 0.45s cubic-bezier(0.25, 1, 0.5, 1) forwards;
  }

  @keyframes app-fade-in {
    0% {
      opacity: 0;
      transform: translateY(10px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Scroll Area */
  .screen {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    padding-top: ${({ theme }) => theme.layout.headerHeight};
    padding-bottom: ${({ theme }) => theme.layout.tabbarHeight};
  }

  .screen__scroll {
    flex: 1;
    position: relative;
  }

  /* Scrollbar hiding for webkit */
  .screen::-webkit-scrollbar {
    display: none;
  }
  .screen {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;
