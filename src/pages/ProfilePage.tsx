import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ConfirmModal } from '../components/common/ConfirmModal';

const ProfileContent = styled.div`
  padding: 20px 18px 90px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const ProfileInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 0;
`;

const AvatarWrap = styled.div`
  position: relative;
  margin-bottom: 16px;
`;

const AvatarImg = styled.span<{ $bgColor?: string, $bgImg?: string }>`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: ${({ $bgColor }) => $bgColor || '#A3C9F1'};
  background-image: ${({ $bgImg }) => $bgImg ? `url(${$bgImg})` : 'none'};
  background-size: cover;
  background-position: center;
  color: ${({ theme, $bgImg }) => $bgImg ? 'transparent' : theme.colors.textMain};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 3px solid ${({ theme }) => theme.colors.white};
  transition: background-color 0.2s ease;
`;

const EditAvatarBtn = styled.button`
  position: absolute;
  bottom: 0;
  right: -4px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.textMain};
  color: ${({ theme }) => theme.colors.white};
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid ${({ theme }) => theme.colors.white};
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const ProfileName = styled.h1`
  font-size: 22px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textOnPrimary};
  margin-bottom: 6px;
`;

const ProfileEmail = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textOnPrimarySub};
  margin-bottom: 12px;
`;

const Badges = styled.div`
  display: flex;
  gap: 8px;
`;

const Badge = styled.span`
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  background-color: rgba(255, 255, 255, 0.15);
  color: ${({ theme }) => theme.colors.textOnPrimary};
`;

const ProviderBadge = styled.div<{ $provider: 'google' | 'kakao' | 'email' }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 600;
  margin-top: 8px;
  background-color: ${({ $provider }) => {
    if ($provider === 'google') return '#FFFFFF';
    if ($provider === 'kakao') return '#FEE500';
    return '#F1F5F9';
  }};
  color: ${({ $provider }) => {
    if ($provider === 'google') return '#3C4043';
    if ($provider === 'kakao') return '#000000';
    return '#475569';
  }};
  border: ${({ $provider }) => $provider === 'google' ? '1px solid #DADCE0' : 'none'};
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);

  svg {
    width: 12px;
    height: 12px;
  }
`;

const ProfileCard = styled.section`
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radius.m};
  padding: 20px;
  box-shadow: ${({ theme }) => theme.shadows.card};
  display: flex;
  flex-direction: column;
`;

const CardTitle = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textSub};
  margin-bottom: 16px;
`;

const AiToggleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TextWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Label = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textMain};
`;

const Desc = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSub};
  line-height: 1.4;
`;

const ToggleSwitch = styled.button<{ $checked: boolean }>`
  position: relative;
  width: 48px;
  height: 28px;
  border-radius: 14px;
  background-color: ${({ $checked, theme }) => ($checked ? theme.colors.primary : '#CBD5E1')};
  transition: background-color 0.2s ease;
  flex-shrink: 0;

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${({ $checked }) => ($checked ? '22px' : '2px')};
    width: 24px;
    height: 24px;
    background-color: #FFFFFF;
    border-radius: 50%;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
    transition: left 0.2s cubic-bezier(0.25, 1, 0.5, 1);
  }
`;

const DataList = styled.div`
  display: flex;
  flex-direction: column;
`;

const DataListItem = styled.button`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #ECEAE5;
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textMain};
  text-align: left;

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
  
  &:first-child {
    padding-top: 0;
  }

  svg {
    width: 20px;
    height: 20px;
    color: #A9B3BD;
  }
`;

const ActionBtn = styled.button<{ $danger?: boolean; $bgColor?: string }>`
  width: 100%;
  padding: 18px;
  border-radius: ${({ theme }) => theme.radius.m};
  font-size: 15px;
  font-weight: 700;
  background-color: ${({ theme, $bgColor }) => $bgColor ? $bgColor : theme.colors.white};
  color: ${({ $bgColor, $danger, theme }) => $bgColor ? '#191919' : ($danger ? '#EF4444' : theme.colors.textMain)};
  box-shadow: ${({ theme }) => theme.shadows.card};
  text-align: center;
  transition: opacity 0.2s;

  &:active {
    opacity: 0.8;
  }
`;

type ProfileModalStep = 'none' | 'logout' | 'deleteStart' | 'deleteDone' | 'backupMenu' | 'exportMenu' | 'backupStart' | 'backupDone' | 'restoreStart' | 'restoreDone' | 'exportPdfStart' | 'exportPdfDone' | 'editAvatar';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser, settings, toggleAiAutoClassify, logout, deleteAccount } = useApp();
  const [modalStep, setModalStep] = useState<ProfileModalStep>('none');
  const [editInitials, setEditInitials] = useState(user.avatarInitials || 'IY');
  const [editBgColor, setEditBgColor] = useState(user.avatarBgColor || '#A3C9F1');

  const handleOpenEditAvatar = () => {
    setEditInitials(user.avatarInitials || 'IY');
    setEditBgColor(user.avatarBgColor || '#A3C9F1');
    setModalStep('editAvatar');
  };

  const handleSaveAvatar = () => {
    updateUser({
      avatarInitials: editInitials || 'IY',
      avatarBgColor: editBgColor,
      avatarUrl: '/default-avatar.png',
      hasCustomAvatar: true
    });
    setModalStep('none');
  };

  const handleLogout = () => {
    setModalStep('logout');
  };

  const handleLogoutConfirm = () => {
    setModalStep('none');
    logout();
    navigate('/login');
  };

  const handleDeleteAccount = () => {
    setModalStep('deleteStart');
  };

  const handleDeleteConfirm = () => {
    setModalStep('deleteDone');
    setTimeout(() => {
      setModalStep('none');
      deleteAccount();
      navigate('/login');
    }, 1500);
  };

  return (
    <ProfileContent>
      <ProfileInfo>
        <AvatarWrap>
          <AvatarImg 
            $bgColor={user.avatarBgColor} 
            $bgImg={(user.avatarUrl && user.avatarUrl !== '/default-avatar.png') ? user.avatarUrl : undefined}
          >
            {(!user.avatarUrl || user.avatarUrl === '/default-avatar.png') && (user.avatarInitials || 'IY')}
          </AvatarImg>
          <EditAvatarBtn onClick={handleOpenEditAvatar} aria-label="프로필 수정">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" />
            </svg>
          </EditAvatarBtn>
        </AvatarWrap>
        <ProfileName>{user.name}</ProfileName>
        <ProfileEmail>{user.email}</ProfileEmail>
        <Badges>
          <Badge>{user.membership}</Badge>
          <Badge>D+{Math.floor((new Date().getTime() - new Date(user.activeSince.replace(/\./g, '-')).getTime()) / (1000 * 60 * 60 * 24))}</Badge>
        </Badges>
        {user.provider && (
          <ProviderBadge $provider={user.provider}>
            {user.provider === 'google' && (
              <>
                <svg viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </>
            )}
            {user.provider === 'kakao' && (
              <>
                <svg viewBox="0 0 24 24">
                  <path fill="#000000" d="M12 3c-5.52 0-10 3.5-10 7.81 0 2.8 1.83 5.25 4.61 6.55-.16.58-1.05 4.02-1.09 4.27-.05.3.14.31.27.22.1-.07 3.33-2.22 4.67-3.11.5.06 1.01.1 1.54.1 5.52 0 10-3.51 10-7.83S17.52 3 12 3z"/>
                </svg>
                Kakao
              </>
            )}
            {user.provider === 'email' && (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                Email
              </>
            )}
          </ProviderBadge>
        )}
      </ProfileInfo>

      <ProfileCard>
        <AiToggleRow>
          <TextWrap>
            <Label>AI 자동 분류 모드</Label>
            <Desc>입력된 메모를 AI가 자동으로 카테고리화합니다.</Desc>
          </TextWrap>
          <ToggleSwitch 
            $checked={settings.aiAutoClassify} 
            onClick={toggleAiAutoClassify}
            aria-label="AI 자동 분류 모드"
          />
        </AiToggleRow>
      </ProfileCard>

      <ProfileCard>
        <CardTitle>계정 및 데이터</CardTitle>
        <DataList>
          <DataListItem onClick={() => setModalStep('backupMenu')}>
            <span>데이터 백업 및 복구</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </DataListItem>
          <DataListItem onClick={() => setModalStep('exportMenu')}>
            <span>활동 기록 내보내기</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </DataListItem>
        </DataList>
      </ProfileCard>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <ActionBtn $bgColor="#9CEAEF" onClick={handleLogout}>로그아웃</ActionBtn>
        <ActionBtn $danger $bgColor="#FFAE7C" onClick={handleDeleteAccount}>계정 삭제</ActionBtn>
      </div>

      {/* --- Modals --- */}
      {['backupMenu', 'exportMenu'].includes(modalStep) && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '24px', 
          background: 'rgba(0,0,0,0.25)', 
          backdropFilter: 'blur(4px)', 
          animation: 'fadeIn 0.2s ease'
        }} onClick={() => setModalStep('none')}>
          <div style={{
            background: '#fff', borderRadius: '16px', padding: '32px 24px', width: '100%', maxWidth: '320px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column',
            animation: 'slideUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)', position: 'relative'
          }} onClick={e => e.stopPropagation()}>
            
            {modalStep === 'backupMenu' && (
              <>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#2B3A4A', marginBottom: '8px' }}>데이터 백업 및 복구</h2>
                <p style={{ fontSize: '13px', color: '#6B7C8D', marginBottom: '24px', lineHeight: '1.5' }}>
                  메모와 데이터를 안전하게 백업하거나 이전 상태로<br/>복구할 수 있습니다.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                  <button onClick={() => setModalStep('backupStart')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid #ECEAE5', borderRadius: '12px', background: '#fff', textAlign: 'left' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#2B3A4A' }}>데이터 백업하기</span>
                      <span style={{ fontSize: '11px', color: '#8FA6A0' }}>현재 상태를 클라우드에 저장합니다</span>
                    </div>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#A9B3BD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}><polyline points="9 18 15 12 9 6" /></svg>
                  </button>
                  <button onClick={() => setModalStep('restoreStart')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid #ECEAE5', borderRadius: '12px', background: '#fff', textAlign: 'left' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#2B3A4A' }}>데이터 복구하기</span>
                      <span style={{ fontSize: '11px', color: '#8FA6A0' }}>이전 백업 시점으로 되돌립니다</span>
                    </div>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#A9B3BD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}><polyline points="9 18 15 12 9 6" /></svg>
                  </button>
                </div>
                <button onClick={() => setModalStep('none')} style={{ alignSelf: 'flex-end', padding: '8px 20px', borderRadius: '20px', fontSize: '13px', fontWeight: 700, background: '#9CEAEF', color: '#1D5B60' }}>닫기</button>
              </>
            )}

            {modalStep === 'exportMenu' && (
              <>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#2B3A4A', marginBottom: '8px' }}>활동 내역 내보내기</h2>
                <p style={{ fontSize: '13px', color: '#6B7C8D', marginBottom: '24px', lineHeight: '1.5' }}>
                  지금까지의 메모 활동 내역을 파일로 저장하<br/>거나 외부로 공유할 수 있습니다.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                  <button onClick={() => setModalStep('exportPdfStart')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid #ECEAE5', borderRadius: '12px', background: '#fff', textAlign: 'left' }}>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#2B3A4A' }}>PDF로 내보내기</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#A9B3BD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}><polyline points="9 18 15 12 9 6" /></svg>
                  </button>
                </div>
                <button onClick={() => setModalStep('none')} style={{ alignSelf: 'flex-end', padding: '8px 20px', borderRadius: '20px', fontSize: '13px', fontWeight: 700, background: '#9CEAEF', color: '#1D5B60' }}>닫기</button>
              </>
            )}

          </div>
        </div>
      )}
      
      <ConfirmModal 
        isOpen={modalStep === 'backupStart'} 
        title="데이터 백업 시작" 
        message={'현재 작성된 모든 메모와 설정을 안전하게\n클라우드에 백업하시겠습니까?'} 
        confirmLabel="백업 시작" 
        onConfirm={() => setModalStep('backupDone')} 
        onCancel={() => setModalStep('none')} 
      />
      <ConfirmModal 
        isOpen={modalStep === 'backupDone'} 
        title="데이터 백업 완료" 
        message={'데이터가 성공적으로 백업되었습니다.\n이제 모든 메모를 확인하실 수 있습니다.'} 
        confirmLabel="확인" 
        hideCancel={true} 
        onConfirm={() => setModalStep('none')} 
        onCancel={() => setModalStep('none')} 
      />
      
      <ConfirmModal 
        isOpen={modalStep === 'restoreStart'} 
        title="데이터 복원 시작" 
        message={'선택하신 백업 시점(2024.05.27)으로 모든\n메모와 설정을 복원하시겠습니까?\n\n현재 작성 중인 데이터는 덮어씌워질 수 있습니다.'} 
        confirmLabel="복원 시작" 
        onConfirm={() => setModalStep('restoreDone')} 
        onCancel={() => setModalStep('none')} 
      />
      <ConfirmModal 
        isOpen={modalStep === 'restoreDone'} 
        title="데이터 복원 완료" 
        message={'데이터가 성공적으로 복원되었습니다.\n이제 모든 메모를 확인하실 수 있습니다.'} 
        confirmLabel="확인" 
        hideCancel={true} 
        onConfirm={() => setModalStep('none')} 
        onCancel={() => setModalStep('none')} 
      />
      
      <ConfirmModal 
        isOpen={modalStep === 'deleteStart'} 
        title="계정 삭제" 
        message={'계정을 삭제하면 모든 메모와 데이터가\n영구적으로 삭제되며 복구할 수 없습니다.\n정말 삭제하시겠습니까?'} 
        confirmLabel="영구삭제" 
        onConfirm={handleDeleteConfirm} 
        onCancel={() => setModalStep('none')} 
      />
      <ConfirmModal 
        isOpen={modalStep === 'deleteDone'} 
        title="삭제 완료" 
        message={'모든 데이터가 안전하게 삭제되었습니다.\n그동안 SortOne AI를 이용해 주셔서 감사합니다.'} 
        confirmLabel="확인" 
        hideCancel={true} 
        onConfirm={() => setModalStep('none')} 
        onCancel={() => setModalStep('none')} 
      />
      
      <ConfirmModal 
        isOpen={modalStep === 'logout'} 
        title="로그아웃" 
        message={'로그아웃 하시면 현재 진행 중인 세션이\n종료되며, 다시 로그인해야 합니다.'} 
        confirmLabel="로그아웃" 
        onConfirm={handleLogoutConfirm} 
        onCancel={() => setModalStep('none')} 
      />
      
      <ConfirmModal 
        isOpen={modalStep === 'exportPdfStart'} 
        title="PDF로 내보내기" 
        message={'모든 활동 내역을 PDF 파일로 내보내시겠습니까?'} 
        confirmLabel="내보내기" 
        onConfirm={() => setModalStep('exportPdfDone')} 
        onCancel={() => setModalStep('none')} 
      />
      <ConfirmModal 
        isOpen={modalStep === 'exportPdfDone'} 
        title="내보내기 완료" 
        message={'활동 내역이 성공적으로 PDF로 내보내기 되었습니다.'} 
        confirmLabel="확인" 
        hideCancel={true} 
        onConfirm={() => setModalStep('none')} 
        onCancel={() => setModalStep('none')} 
      />
      
      {modalStep === 'editAvatar' && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '24px', 
          background: 'rgba(0,0,0,0.3)', 
          backdropFilter: 'blur(4px)', 
          animation: 'fadeIn 0.2s ease'
        }} onClick={() => setModalStep('none')}>
          <div style={{
            background: '#fff', borderRadius: '20px', padding: '28px 24px', width: '100%', maxWidth: '320px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', alignItems: 'center',
            animation: 'slideUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)', position: 'relative'
          }} onClick={e => e.stopPropagation()}>
            
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#2B3A4A', marginBottom: '20px', alignSelf: 'flex-start' }}>프로필 이미지 수정</h2>
            
            {/* Live Preview */}
            <div style={{
              width: '84px', height: '84px', borderRadius: '50%', backgroundColor: editBgColor,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '30px', fontWeight: 700, color: '#191919',
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)', border: '3px solid #fff',
              marginBottom: '20px', transition: 'background-color 0.2s ease'
            }}>
              {editInitials || 'IY'}
            </div>

            {/* Initials Input */}
            <div style={{ width: '100%', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#2B3A4A' }}>영문 이니셜 (2자)</label>
              <input 
                type="text" 
                maxLength={2} 
                value={editInitials}
                onChange={e => {
                  const val = e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase();
                  setEditInitials(val);
                }}
                placeholder="예: IY"
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: '10px',
                  border: '1.5px solid #ECEAE5', fontSize: '16px', fontWeight: 700,
                  outline: 'none', textAlign: 'center', letterSpacing: '3px',
                  color: '#2B3A4A', background: '#FAFAFA'
                }}
              />
            </div>

            {/* Color Palette Selection */}
            <div style={{ width: '100%', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#2B3A4A' }}>배경색 선택</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', justifyItems: 'center' }}>
                {['#A3C9F1', '#F9B29C', '#B5EAD7', '#FFDAC1', '#FF9AA2', '#C7CEEA', '#FFE599', '#9CEAEF'].map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setEditBgColor(color)}
                    style={{
                      width: '42px', height: '42px', borderRadius: '50%', backgroundColor: color,
                      border: editBgColor === color ? '3px solid #2B3A4A' : '2px solid #fff',
                      boxShadow: editBgColor === color ? '0 0 0 2px #9CEAEF' : '0 2px 6px rgba(0,0,0,0.1)', cursor: 'pointer',
                      transform: editBgColor === color ? 'scale(1.1)' : 'scale(1)',
                      transition: 'transform 0.15s ease, border 0.15s ease'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
              <button 
                type="button"
                onClick={() => setModalStep('none')}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, background: '#F1F5F9', color: '#64748B', border: 'none', cursor: 'pointer' }}
              >
                취소
              </button>
              <button 
                type="button"
                onClick={handleSaveAvatar}
                disabled={editInitials.length !== 2}
                style={{
                  flex: 1, padding: '12px', borderRadius: '12px', fontSize: '14px', fontWeight: 700,
                  background: editInitials.length === 2 ? '#9CEAEF' : '#CBD5E1',
                  color: editInitials.length === 2 ? '#1D5B60' : '#94A3B8',
                  border: 'none',
                  cursor: editInitials.length === 2 ? 'pointer' : 'not-allowed'
                }}
              >
                저장
              </button>
            </div>

          </div>
        </div>
      )}

    </ProfileContent>
  );
};
