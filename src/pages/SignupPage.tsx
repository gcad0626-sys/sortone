import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate, Link } from 'react-router-dom';

const SignupContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: ${({ theme }) => theme.layout.appMaxWidth};
  min-height: 100vh;
  margin: 0 auto;
  background-color: ${({ theme }) => theme.colors.primary};
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  height: 56px;
  padding: 0 16px;
  background-color: transparent;
  padding-top: 10px;
`;

const IconButton = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textOnPrimary};
  
  svg {
    width: 24px;
    height: 24px;
  }
`;

const Title = styled.h1`
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textOnPrimary};
  margin-left: 6px;
`;

const Screen = styled.main`
  flex: 1;
  padding: 0 28px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  
  /* Hide scrollbar */
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const Intro = styled.div`
  margin-top: 16px;
  margin-bottom: 36px;
`;

const IntroTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  line-height: 1.4;
  color: ${({ theme }) => theme.colors.textOnPrimary};
  margin-bottom: 12px;
`;

const IntroDesc = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textOnPrimary};
  opacity: 0.9;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
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
  transition: all 0.2s;

  &:focus {
    background-color: ${({ theme }) => theme.colors.white};
    border-color: ${({ theme }) => theme.colors.accent};
    box-shadow: 0 0 0 3px rgba(156, 234, 239, 0.3);
  }

  &::placeholder {
    color: #A3B5C7;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  margin-bottom: 24px;

  input[type='checkbox'] {
    width: 18px;
    height: 18px;
    accent-color: ${({ theme }) => theme.colors.primaryDark};
  }

  label {
    font-size: 13px;
    color: ${({ theme }) => theme.colors.textOnPrimary};
    
    a {
      color: ${({ theme }) => theme.colors.textOnPrimary};
      font-weight: 600;
      text-decoration: underline;
    }
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
  transition: opacity 0.2s;

  &:active {
    opacity: 0.8;
  }
`;

const Spacer = styled.div`
  flex: 1;
`;

const FooterBox = styled.div`
  padding: 24px 0 40px;
  text-align: center;
`;

const SigninText = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textOnPrimarySub};

  a {
    color: ${({ theme }) => theme.colors.textOnPrimary};
    font-weight: 600;
    margin-left: 4px;
  }
`;

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <SignupContainer style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center', marginBottom: '80px', padding: '0 20px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px', color: '#191919' }}>
            가입을 축하합니다!
          </h1>
          <p style={{ fontSize: '15px', color: '#191919', lineHeight: '1.5' }}>
            이제 SortOne AI와 함께 더 똑똑하고 정<br/>갈한 메모 생활을 시작해 보세요.
          </p>
        </div>
        <div style={{ padding: '0 28px', width: '100%', position: 'absolute', bottom: '100px' }}>
          <SubmitButton 
            type="button" 
            onClick={() => navigate('/memo')}
            style={{ backgroundColor: '#9CEAEF', color: '#191919', borderRadius: '26px' }}
          >
            확인
          </SubmitButton>
        </div>
      </SignupContainer>
    );
  }

  return (
    <SignupContainer>
      <Header>
        <IconButton type="button" onClick={() => navigate(-1)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </IconButton>
        <Title>이메일 가입</Title>
      </Header>

      <Screen>
        <Intro>
          <IntroTitle>새로운 시작을 위해<br />정보를 입력해주세요</IntroTitle>
          <IntroDesc>SortOne과 함께 효율적인 일상을 만들어보세요.</IntroDesc>
        </Intro>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="emailInput">이메일 주소</Label>
            <Input type="email" id="emailInput" placeholder="example@sortone.ai" required />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="passwordInput">비밀번호</Label>
            <Input 
              type="password" 
              id="passwordInput" 
              placeholder="8자 이상 입력하세요" 
              required 
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="passwordConfirmInput">비밀번호 확인</Label>
            <Input 
              type="password" 
              id="passwordConfirmInput" 
              placeholder="비밀번호를 다시 입력하세요" 
              required 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </FormGroup>

          <CheckboxGroup>
            <input type="checkbox" id="termsCheck" required />
            <label htmlFor="termsCheck">
              <Link to="#">이용약관</Link> 및 <Link to="#">개인정보 처리방침</Link>에 동의합니다
            </label>
          </CheckboxGroup>

          <SubmitButton type="submit">가입완료</SubmitButton>
        </Form>

        <Spacer />

        <FooterBox>
          <SigninText>
            이미 계정이 있으신가요? <Link to="/login" state={{ view: 'email' }}>로그인</Link>
          </SigninText>
        </FooterBox>
      </Screen>
    </SignupContainer>
  );
};
