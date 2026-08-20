import React from 'react';
import styled from 'styled-components';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

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

  button {
    background: none;
    border: none;
    color: ${({ theme }) => theme.colors.textOnPrimary};
    font-weight: 600;
    margin-left: 4px;
    cursor: pointer;
    padding: 0;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textOnPrimary};
`;

const Input = styled.input`
  height: 48px;
  border-radius: ${({ theme }) => theme.radius.m};
  padding: 0 16px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textMain};
  background-color: rgba(255, 255, 255, 0.9);
  border: 1px solid transparent;
  &:focus {
    background-color: ${({ theme }) => theme.colors.white};
    border-color: ${({ theme }) => theme.colors.accent};
    box-shadow: 0 0 0 3px rgba(156, 234, 239, 0.3);
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  height: 52px;
  border-radius: ${({ theme }) => theme.radius.m};
  background-color: ${({ theme }) => theme.colors.textMain};
  color: ${({ theme }) => theme.colors.white};
  font-size: 16px;
  font-weight: 700;
  margin-top: 16px;
  &:active {
    opacity: 0.8;
  }
`;

const EmailLoginWrap = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-bottom: 60px;
`;

const HeaderTitle = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textOnPrimary};
  margin-bottom: 32px;
  text-align: center;
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

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useApp();
  const [showKakaoModal, setShowKakaoModal] = React.useState(false);
  const [view, setView] = React.useState<'landing' | 'email'>(location.state?.view || 'landing');

  const handleLogin = () => {
    login();
    navigate('/memo');
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/memo');
    } catch (error) {
      console.error('Google login failed:', error);
    }
  };

  return (
    <LoginContainer>
      {view === 'landing' ? (
        <>
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
            <SocialButton $type="google" onClick={handleGoogleLogin}>
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
              이미 계정이 있으신가요? <button onClick={() => setView('email')}>로그인</button>
            </SigninText>
          </LinksBox>
        </>
      ) : (
        <EmailLoginWrap>
          <HeaderTitle>이메일 로그인</HeaderTitle>
          <Form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
            <FormGroup>
              <Label>이메일 주소</Label>
              <Input type="email" placeholder="example@sortone.ai" required />
            </FormGroup>
            <FormGroup>
              <Label>비밀번호</Label>
              <Input type="password" placeholder="비밀번호를 입력하세요" required />
            </FormGroup>
            <SubmitButton type="submit">로그인</SubmitButton>
          </Form>
          <LinksBox style={{ marginTop: '24px' }}>
            <SigninText>
              계정이 없으신가요? <Link to="/signup">가입하기</Link>
            </SigninText>
          </LinksBox>
        </EmailLoginWrap>
      )}

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

    </LoginContainer>
  );
};
