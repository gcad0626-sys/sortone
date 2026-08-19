import React from 'react';
import styled from 'styled-components';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const LoginContainer = styled.div`
  /* It runs outside the Layout, so we wrap it inside a container resembling .app */
  position: relative;
  width: 100%;
  max-width: ${({ theme }) => theme.layout.appMaxWidth};
  min-height: 100vh;
  margin: 0 auto;
  background-color: ${({ theme }) => theme.colors.primary};
  display: flex;
  flex-direction: column;
  padding: 0 28px;
`;

const CatchphraseWrap = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Catchphrase = styled.p`
  text-align: center;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textOnPrimary};
`;


const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 28px;
`;

const SocialButton = styled.button<{ $type: 'kakao' | 'google' }>`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 52px;
  border-radius: ${({ theme }) => theme.radius.m};
  font-size: 15px;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background-color: ${({ $type }) => ($type === 'kakao' ? '#FEE500' : '#FFFFFF')};
  color: ${({ $type }) => ($type === 'kakao' ? '#191919' : '#3C4043')};

  svg {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }
`;

const Divider = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  color: ${({ theme }) => theme.colors.textOnPrimarySub};
  font-size: 12px;
  font-weight: 500;

  &::before, &::after {
    content: '';
    flex: 1;
    height: 1px;
    background-color: rgba(255, 255, 255, 0.2);
  }

  span {
    padding: 0 12px;
  }
`;

const LinksBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-bottom: 40px;
`;

const SignupLink = styled(Link)`
  color: ${({ theme }) => theme.colors.textOnPrimary};
  font-size: 14px;
  font-weight: 600;
`;

const SigninText = styled.span`
  color: ${({ theme }) => theme.colors.textOnPrimarySub};
  font-size: 12px;

  a {
    color: ${({ theme }) => theme.colors.textOnPrimary};
    font-weight: 600;
    margin-left: 4px;
  }
`;

const ModalOverlay = styled.div`
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 0 20px;
`;

const ModalCard = styled.div`
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 320px;
  padding: 32px 24px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
`;

const KakaoLogo = styled.div`
  width: 48px;
  height: 48px;
  background-color: #FEE500;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  svg {
    width: 24px;
    height: 24px;
    color: #191919;
  }
`;

const GoogleLogo = styled.div`
  width: 48px;
  height: 48px;
  background-color: #FFFFFF;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  svg {
    width: 24px;
    height: 24px;
  }
`;

const ModalTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: #191919;
  margin-bottom: 12px;
`;

const ModalDesc = styled.p`
  font-size: 13px;
  color: #555;
  text-align: center;
  line-height: 1.4;
  margin-bottom: 24px;
`;

const PermList = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
`;

const PermItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const PermIcon = styled.div<{ $color?: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${({ $color }) => $color || '#E2E8F0'};
  display: flex;
  align-items: center;
  justify-content: center;
  svg {
    width: 20px;
    height: 20px;
    color: #fff;
  }
`;

const PermText = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  strong {
    font-size: 14px;
    color: #191919;
  }
  span {
    font-size: 12px;
    color: #888;
  }
`;

const PermBadge = styled.div<{ $isOptional?: boolean }>`
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 12px;
  background-color: ${({ $isOptional }) => $isOptional ? '#E6F9FA' : '#F1F5F9'};
  color: ${({ $isOptional }) => $isOptional ? '#2E8B92' : '#64748B'};
  font-weight: 600;
`;

const ModalNotice = styled.p`
  font-size: 11px;
  color: #888;
  text-align: center;
  line-height: 1.4;
  margin-bottom: 24px;
`;

const ModalActions = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;

  button {
    width: 100%;
    height: 48px;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 700;
    
    &.allow {
      background-color: #9CEAEF;
      color: #191919;
    }
    &.cancel {
      background-color: #F8B486;
      color: #fff;
    }
  }
`;

const AccountList = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-bottom: 24px;
`;

const AccountItem = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #F1F5F9;
  cursor: pointer;
  
  &:last-child {
    border-bottom: none;
  }

  .icon {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background-color: #F1F5F9;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
    svg {
      width: 18px;
      height: 18px;
      color: #64748B;
    }
  }
`;

const Avatar = styled.div<{ src?: string, $initials?: string }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #E2E8F0;
  margin-right: 12px;
  background-image: ${({ src }) => src ? `url(${src})` : 'none'};
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #191919;
  
  &::after {
    content: '${({ $initials }) => $initials || ''}';
  }
`;

const AccountInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  strong {
    font-size: 14px;
    color: #191919;
  }
  span {
    font-size: 12px;
    color: #64748B;
  }
`;

const GoogleNotice = styled.p`
  font-size: 11px;
  color: #64748B;
  text-align: center;
  line-height: 1.5;
  margin-bottom: 32px;
  background-color: #F8FAFC;
  padding: 16px;
  border-radius: 8px;
`;

const GoogleFooter = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  color: #64748B;
  
  div {
    display: flex;
    gap: 16px;
  }
`;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useApp();
  const [showKakaoModal, setShowKakaoModal] = React.useState(false);
  const [showGoogleModal, setShowGoogleModal] = React.useState(false);

  const handleLogin = () => {
    login();
    navigate('/memo');
  };

  return (
    <LoginContainer>
      <CatchphraseWrap>
        <Catchphrase>
          생각을 명확한 인사이트로<br />바꾸세요.
        </Catchphrase>
      </CatchphraseWrap>

      <ButtonGroup>
        <SocialButton $type="kakao" onClick={() => setShowKakaoModal(true)}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3C6.48 3 2 6.48 2 10.8c0 2.76 1.83 5.18 4.6 6.56-.2.73-.73 2.66-.84 3.07-.13.5.18.5.39.36.16-.11 2.6-1.77 3.66-2.49.72.1 1.46.16 2.19.16 5.52 0 10-3.48 10-7.8C22 6.48 17.52 3 12 3z" />
          </svg>
          카카오로 계속하기
        </SocialButton>
        <SocialButton $type="google" onClick={() => setShowGoogleModal(true)}>
          <svg viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46c-.28 1.5-1.13 2.77-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.81z" />
            <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.92l-3.88-3c-1.08.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.94H1.28v3.1C3.25 21.3 7.31 24 12 24z" />
            <path fill="#FBBC05" d="M5.29 14.29A7.2 7.2 0 0 1 4.91 12c0-.8.14-1.57.38-2.29v-3.1H1.28A11.98 11.98 0 0 0 0 12c0 1.94.46 3.77 1.28 5.39z" />
            <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.28 6.61l4.01 3.1C6.23 6.88 8.88 4.77 12 4.77z" />
          </svg>
          Google 계정으로 계속하기
        </SocialButton>
      </ButtonGroup>

      <Divider><span>또는</span></Divider>

      <LinksBox>
        <SignupLink to="/signup">이메일로 가입하기</SignupLink>
        <SigninText>
          이미 계정이 있으신가요? <Link to="/login">로그인</Link>
        </SigninText>
      </LinksBox>

      {showKakaoModal && (
        <ModalOverlay onClick={() => setShowKakaoModal(false)}>
          <ModalCard onClick={e => e.stopPropagation()}>
            <KakaoLogo>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3C6.48 3 2 6.48 2 10.8c0 2.76 1.83 5.18 4.6 6.56-.2.73-.73 2.66-.84 3.07-.13.5.18.5.39.36.16-.11 2.6-1.77 3.66-2.49.72.1 1.46.16 2.19.16 5.52 0 10-3.48 10-7.8C22 6.48 17.52 3 12 3z" />
              </svg>
            </KakaoLogo>
            <ModalTitle>카카오 계정 로그인</ModalTitle>
            <ModalDesc>SortOne 서비스 이용을 위해<br/>아래 정보에 대한 접근 권한이 필요합니다.</ModalDesc>
            <PermList>
              <PermItem>
                <PermIcon $color="#9CEAEF">
                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </PermIcon>
                <PermText>
                  <strong>프로필 정보</strong>
                  <span>닉네임, 프로필 사진</span>
                </PermText>
                <PermBadge>필수</PermBadge>
              </PermItem>
              <PermItem>
                <PermIcon $color="#E2E8F0">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </PermIcon>
                <PermText>
                  <strong>카카오계정(이메일)</strong>
                  <span>본인 확인 및 서비스 알림 발송</span>
                </PermText>
                <PermBadge $isOptional>선택</PermBadge>
              </PermItem>
            </PermList>
            <ModalNotice>
              정보 제공에 동의하시면 서비스 이용이 가능합니다.<br/>
              제공된 정보는 'SortOne'의 개인정보 처리방침에<br/>따라 안전하게 보호됩니다.
            </ModalNotice>
            <ModalActions>
              <button className="allow" onClick={handleLogin}>허용하기</button>
              <button className="cancel" onClick={() => setShowKakaoModal(false)}>취소</button>
            </ModalActions>
          </ModalCard>
        </ModalOverlay>
      )}

      {showGoogleModal && (
        <ModalOverlay onClick={() => setShowGoogleModal(false)}>
          <ModalCard onClick={e => e.stopPropagation()}>
            <GoogleLogo>
              <svg viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46c-.28 1.5-1.13 2.77-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.81z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.92l-3.88-3c-1.08.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.94H1.28v3.1C3.25 21.3 7.31 24 12 24z" />
                <path fill="#FBBC05" d="M5.29 14.29A7.2 7.2 0 0 1 4.91 12c0-.8.14-1.57.38-2.29v-3.1H1.28A11.98 11.98 0 0 0 0 12c0 1.94.46 3.77 1.28 5.39z" />
                <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.28 6.61l4.01 3.1C6.23 6.88 8.88 4.77 12 4.77z" />
              </svg>
            </GoogleLogo>
            <ModalTitle>계정 선택</ModalTitle>
            <AccountList>
              <AccountItem onClick={handleLogin}>
                <Avatar src="https://i.pravatar.cc/150?u=a042581f4e29026704d" />
                <AccountInfo>
                  <strong>김지수</strong>
                  <span>jisu.kim@gmail.com</span>
                </AccountInfo>
              </AccountItem>
              <AccountItem onClick={handleLogin}>
                <Avatar $initials="L" />
                <AccountInfo>
                  <strong>Lee Seo-yeon</strong>
                  <span>sy.lee.design@gmail.com</span>
                </AccountInfo>
              </AccountItem>
              <AccountItem onClick={handleLogin}>
                <div className="icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                </div>
                <AccountInfo>
                  <strong>다른 계정 사용</strong>
                </AccountInfo>
              </AccountItem>
            </AccountList>
            <GoogleNotice>
              계속하면 Google에서 사용자의 이름, 이메일 주소, 언어 설정, 프로필 사진을 SortOne과 공유하는 데 동의하게 됩니다. SortOne의 개인정보 처리방침 및 서비스 약관을 확인해 보세요.
            </GoogleNotice>
            <GoogleFooter>
              <span>한국어</span>
              <div>
                <span>도움말</span>
                <span>개인정보 보호</span>
                <span>약관</span>
              </div>
            </GoogleFooter>
          </ModalCard>
        </ModalOverlay>
      )}
    </LoginContainer>
  );
};
