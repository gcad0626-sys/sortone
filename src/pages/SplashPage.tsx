import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const splashFadeIn = keyframes`
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const splashFadeOut = keyframes`
  to {
    opacity: 0;
  }
`;

const SplashContainer = styled.div<{ $isLeaving: boolean }>`
  /* Since Layout wraps App, this page is independent if it's outside Layout, wait, in App.tsx SplashPage is rendered at '/' OUTSIDE Layout */
  /* So we need to make it look like .app */
  position: relative;
  width: 100%;
  max-width: ${({ theme }) => theme.layout.appMaxWidth};
  min-height: 100vh;
  margin: 0 auto;
  background-color: ${({ theme }) => theme.colors.primary};
  
  display: flex;
  align-items: center;
  justify-content: center;
  
  animation: ${({ $isLeaving }) => ($isLeaving ? splashFadeOut : 'none')} 0.35s ease forwards;
`;

const SplashLogo = styled.span`
  font-family: ${({ theme }) => theme.fonts.logo};
  font-size: 34px;
  color: ${({ theme }) => theme.colors.textOnPrimary};
  letter-spacing: 0.5px;
  opacity: 0;
  transform: translateY(6px);
  animation: ${splashFadeIn} 0.6s ease forwards;
`;

const SPLASH_DURATION = 1600;

export const SplashPage: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useApp();
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(() => {
        navigate('/login');
      }, 350);
    }, SPLASH_DURATION);

    return () => clearTimeout(timer);
  }, [navigate, isLoggedIn]);

  return (
    <SplashContainer $isLeaving={isLeaving}>
      <SplashLogo>SortOne</SplashLogo>
    </SplashContainer>
  );
};
