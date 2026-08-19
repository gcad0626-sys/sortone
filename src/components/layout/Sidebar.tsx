import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { ConfirmModal } from '../common/ConfirmModal';
import { CategoryEditModal } from '../common/CategoryEditModal';
import { useApp } from '../../context/AppContext';

const Overlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: ${({ theme }) => theme.layout.appMaxWidth};
  background-color: rgba(20, 30, 45, 0.35);
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  pointer-events: ${({ $isOpen }) => ($isOpen ? 'auto' : 'none')};
  transition: opacity 0.25s ease;
  z-index: 200;
`;

const Drawer = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 85%;
  max-width: 320px;
  height: 100%;
  background-color: #FAFAF8;
  box-shadow: 8px 0 24px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  transform: ${({ $isOpen }) => ($isOpen ? 'translateX(0)' : 'translateX(-100%)')};
  transition: transform 0.28s ease;
`;

const ProfileArea = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px 20px 18px;
  border-bottom: 1px solid #ECEAE5;
`;

const Avatar = styled.span<{ $bgColor?: string }>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: ${({ $bgColor }) => $bgColor || '#A3C9F1'};
  color: ${({ theme }) => theme.colors.textMain};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
`;

const InfoBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const NameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const Name = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textMain};
`;

const Badge = styled.span`
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  background-color: #E2E8F0;
  color: #4A5568;
  border-radius: 4px;
`;

const Email = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSub};
`;

const MenuNav = styled.nav`
  display: flex;
  flex-direction: column;
  padding: 12px 10px;
`;

const MenuItem = styled.button<{ $danger?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  color: ${({ $danger, theme }) => ($danger ? '#E25C5C' : theme.colors.textMain)};
  background: transparent;
  width: 100%;
  text-align: left;
  transition: background-color 0.2s ease;

  &:hover, &:active {
    background-color: rgba(0, 0, 0, 0.04);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const Divider = styled.div`
  height: 1px;
  background-color: #ECEAE5;
  margin: 4px 20px;
`;

const Spacer = styled.div`
  flex: 1;
`;

const Footer = styled.div`
  padding: 12px 10px 24px;
`;

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user, categories } = useApp();
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleNavigate = (path: string) => {
    onClose();
    navigate(path);
  };

  const handleLogout = () => {
    setLogoutModalOpen(true);
  };

  const handleLogoutConfirm = () => {
    setLogoutModalOpen(false);
    onClose();
    navigate('/login');
  };

  const handleLogoutCancel = () => {
    setLogoutModalOpen(false);
  };

  return (
    <Overlay $isOpen={isOpen} onClick={onClose}>
      <Drawer $isOpen={isOpen} onClick={(e) => e.stopPropagation()}>
        <ProfileArea onClick={() => handleNavigate('/profile')} style={{ cursor: 'pointer' }}>
          <Avatar $bgColor={user.avatarBgColor}>{user.avatarInitials || 'IY'}</Avatar>
          <InfoBox>
            <NameRow>
              <Name>{user.name}</Name>
              <Badge>{user.membership}</Badge>
            </NameRow>
            <Email>{user.email}</Email>
          </InfoBox>
        </ProfileArea>

        <MenuNav>
          {categories.map(cat => (
            <MenuItem 
              key={cat} 
              onClick={() => handleNavigate(cat === '전체' ? '/memo' : `/memo?category=${cat}`)}
            >
              {cat === '전체' ? '전체 메모' : cat}
            </MenuItem>
          ))}
          <MenuItem onClick={() => setIsEditModalOpen(true)} style={{ color: '#A9B3BD' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </MenuItem>
        </MenuNav>

        <Divider />

        <MenuNav>
          <MenuItem onClick={() => handleNavigate('/archive')}>
            보관함
          </MenuItem>
          <MenuItem onClick={() => handleNavigate('/trash')}>
            휴지통
          </MenuItem>
        </MenuNav>

        <Spacer />

        <Footer>
          <MenuItem $danger onClick={handleLogout}>
            로그아웃
          </MenuItem>
        </Footer>
      </Drawer>

      <ConfirmModal
        isOpen={logoutModalOpen}
        title="정말 로그아웃 하시겠습니까?"
        message={`로그아웃 하시면 현재 진행 중인 세션이\n종료되며, 다시 로그인해야 서비스를 이용\n하실 수 있습니다.`}
        confirmLabel="로그아웃"
        cancelLabel="취소"
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
      />
      <CategoryEditModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
      />
    </Overlay>
  );
};
