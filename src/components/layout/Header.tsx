import React from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const HeaderContainer = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: ${({ theme }) => theme.layout.headerHeight};
  padding: 0 16px;
  background-color: ${({ theme }) => theme.colors.primary};
  border-bottom: 1px dashed #9CEAEF;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;
`;

const LeftArea = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const RightArea = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const IconButton = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textOnPrimary};
  transition: opacity 0.2s;

  &:active {
    opacity: 0.6;
  }

  svg {
    width: 24px;
    height: 24px;
  }
`;

const Logo = styled.span`
  font-family: ${({ theme }) => theme.fonts.logo};
  font-size: 24px;
  color: ${({ theme }) => theme.colors.textOnPrimary};
  line-height: 1;
  margin-top: 2px;
`;

const Avatar = styled.span<{ $bgColor?: string, $bgImg?: string }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${({ $bgColor }) => $bgColor || '#A3C9F1'};
  background-image: ${({ $bgImg }) => $bgImg ? `url(${$bgImg})` : 'none'};
  background-size: cover;
  background-position: center;
  color: ${({ theme, $bgImg }) => $bgImg ? 'transparent' : theme.colors.textMain};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  line-height: normal;
`;

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useApp();
  const isDetail = location.pathname.startsWith('/detail');

  return (
    <HeaderContainer>
      <LeftArea>
        {isDetail ? (
          <IconButton type="button" aria-label="뒤로가기" onClick={() => navigate(-1)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </IconButton>
        ) : (
          <IconButton type="button" aria-label="메뉴" onClick={onMenuClick}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </IconButton>
        )}
        <Logo>SortOne</Logo>
      </LeftArea>
      {!isDetail && (
        <RightArea>
          <IconButton type="button" aria-label="검색" onClick={() => navigate('/search')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </IconButton>
          <Avatar 
            $bgColor={user.avatarBgColor} 
            $bgImg={(user.avatarUrl && user.avatarUrl !== '/default-avatar.png') ? user.avatarUrl : undefined}
            onClick={() => navigate('/profile')}
          >
            {(!user.avatarUrl || user.avatarUrl === '/default-avatar.png') && (user.avatarInitials || 'IY')}
          </Avatar>
        </RightArea>
      )}
    </HeaderContainer>
  );
};
