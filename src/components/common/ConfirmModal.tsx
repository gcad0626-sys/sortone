import React from 'react';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

const Overlay = styled.div<{ $noBlur?: boolean }>`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: ${({ $noBlur }) => $noBlur ? 'transparent' : 'rgba(0,0,0,0.25)'};
  backdrop-filter: ${({ $noBlur }) => $noBlur ? 'none' : 'blur(4px)'};
  animation: ${fadeIn} 0.2s ease;
`;

const Card = styled.div`
  background: #fff;
  border-radius: 16px;
  padding: 32px 24px;
  width: 100%;
  max-width: 320px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  animation: ${slideUp} 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
`;

const Title = styled.h2`
  font-size: 18px;
  font-weight: 800;
  color: #2B3A4A;
  margin-bottom: 16px;
`;

const Message = styled.p`
  font-size: 13px;
  color: #6B7C8D;
  margin-bottom: 28px;
  line-height: 1.5;
  white-space: pre-wrap;
`;

const ConfirmBtn = styled.button`
  width: 100%;
  padding: 14px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 700;
  background: #9CEAEF;
  color: #1D5B60;
  margin-bottom: 12px;
  transition: filter 0.15s ease;
  &:active {
    filter: brightness(0.95);
  }
`;

const CancelBtn = styled.button`
  width: 100%;
  padding: 14px;
  font-size: 14px;
  font-weight: 600;
  color: #A9B3BD;
  transition: color 0.15s ease;
  &:active {
    color: #8FA6A0;
  }
`;

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  hideCancel?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  noBlur?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = '확인',
  cancelLabel = '취소',
  hideCancel = false,
  onConfirm,
  onCancel,
  noBlur = false,
}) => {
  if (!isOpen) return null;

  return (
    <Overlay $noBlur={noBlur} onClick={hideCancel ? onConfirm : onCancel}>
      <Card onClick={e => e.stopPropagation()}>
        <Title>{title}</Title>
        <Message>{message}</Message>
        <ConfirmBtn onClick={onConfirm}>{confirmLabel}</ConfirmBtn>
        {!hideCancel && <CancelBtn onClick={onCancel}>{cancelLabel}</CancelBtn>}
      </Card>
    </Overlay>
  );
};
