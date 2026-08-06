import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useApp } from '../../context/AppContext';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(0,0,0,0.25);
  backdrop-filter: blur(4px);
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
  position: relative;
  animation: ${slideUp} 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
`;

const Title = styled.h2`
  font-size: 18px;
  font-weight: 800;
  color: #2B3A4A;
  margin-bottom: 24px;
  text-align: center;
`;

const InputRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
`;

const Input = styled.input`
  flex: 1;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid #ECEAE5;
  font-size: 14px;
  outline: none;
  &:focus {
    border-color: #9CEAEF;
  }
`;

const AddBtn = styled.button`
  width: 100%;
  padding: 12px;
  background: #2B3A4A;
  color: #fff;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  &:active {
    opacity: 0.8;
  }
`;

const CategoryList = styled.div`
  display: flex;
  flex-direction: column;
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 24px;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: #ECEAE5;
    border-radius: 4px;
  }
`;

const CategoryItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 4px;
  border-bottom: 1px solid #ECEAE5;
  font-size: 14px;
  font-weight: 600;
  color: #2B3A4A;

  &:last-child {
    border-bottom: none;
  }
`;

const DeleteBtn = styled.button`
  color: #A9B3BD;
  font-size: 20px;
  font-weight: bold;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:active {
    opacity: 0.6;
  }
`;

const ConfirmBtn = styled.button`
  width: 100%;
  padding: 14px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 700;
  background: #9CEAEF;
  color: #1D5B60;
  transition: filter 0.15s ease;
  &:active {
    filter: brightness(0.95);
  }
`;

interface CategoryEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CategoryEditModal: React.FC<CategoryEditModalProps> = ({ isOpen, onClose }) => {
  const { categories, addCategory, removeCategory } = useApp();
  const [newCat, setNewCat] = useState('');

  if (!isOpen) return null;

  const handleAdd = () => {
    const trimmed = newCat.trim();
    if (trimmed && !categories.includes(trimmed)) {
      addCategory(trimmed);
      setNewCat('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <Overlay onClick={onClose}>
      <Card onClick={e => e.stopPropagation()}>
        <Title>카테고리 편집</Title>
        
        <InputRow>
          <Input 
            type="text" 
            placeholder="새 카테고리 입력" 
            value={newCat}
            onChange={e => setNewCat(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <AddBtn onClick={handleAdd}>추가</AddBtn>
        </InputRow>

        <CategoryList>
          {categories.map(cat => (
            <CategoryItem key={cat}>
              {cat}
              {cat !== '전체' && (
                <DeleteBtn onClick={() => removeCategory(cat)}>&times;</DeleteBtn>
              )}
            </CategoryItem>
          ))}
        </CategoryList>

        <ConfirmBtn onClick={onClose}>완료</ConfirmBtn>
      </Card>
    </Overlay>
  );
};
