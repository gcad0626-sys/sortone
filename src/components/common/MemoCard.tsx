import React, { useState, useRef, useEffect } from 'react';
import type { Memo } from '../../types';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { getTagColor } from '../../utils/colors';
import { ConfirmModal } from './ConfirmModal';

const Card = styled.div<{ $isImportant?: boolean; $showDropdown?: boolean }>`
  background-color: ${({ $isImportant, theme }) => ($isImportant ? theme.colors.importantCardBg : theme.colors.white)};
  border-radius: ${({ theme }) => theme.radius.m};
  padding: 12px 14px;
  margin-bottom: 10px;
  box-shadow: ${({ theme }) => theme.shadows.card};
  cursor: pointer;
  position: relative;
  transition: transform 0.2s, box-shadow 0.2s;
  z-index: ${({ $showDropdown }) => ($showDropdown ? 100 : 1)};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(30, 60, 100, 0.15);
    z-index: ${({ $showDropdown }) => ($showDropdown ? 100 : 2)};
  }
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  margin-bottom: 6px;
`;

const DateText = styled.span`
  font-size: 10px;
  color: ${({ theme }) => theme.colors.textSub};
  font-weight: 500;
`;

const MoreWrap = styled.div`
  position: relative;
`;

const MoreBtn = styled.button`
  font-size: 18px;
  color: ${({ theme }) => theme.colors.textSub};
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Dropdown = styled.div<{ $show: boolean }>`
  display: ${({ $show }) => ($show ? 'block' : 'none')};
  position: absolute;
  top: 100%;
  right: 0;
  background-color: ${({ theme }) => theme.colors.white};
  border: 1px solid #ECEAE5;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 8px 0;
  min-width: 140px;
  z-index: 10;
`;

const DropdownItem = styled.button<{ $danger?: boolean }>`
  display: block;
  width: 100%;
  padding: 10px 16px;
  text-align: left;
  font-size: 14px;
  color: ${({ $danger, theme }) => ($danger ? '#EF4444' : theme.colors.textMain)};
  
  &:hover {
    background-color: #F8F9FA;
  }
`;

const Title = styled.h3`
  font-size: 17px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textMain};
  margin-bottom: 4px;
  line-height: 1.3;
`;

const Desc = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSub};
  line-height: 1.5;
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TagsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Tag = styled.span<{ $tagType: string }>`
  display: inline-block;
  padding: 2px 8px;
  border-radius: ${({ theme }) => theme.radius.pill};
  font-size: 10px;
  font-weight: 400;
  
  ${({ $tagType }) => {
    const color = getTagColor($tagType);
    return `background-color: ${color.bg}; color: ${color.text};`;
  }}
`;

interface MemoCardProps {
  memo: Memo;
  mode?: 'default' | 'trash' | 'archive';
  onToggleImportant?: (id: string) => void;
}

export const MemoCard: React.FC<MemoCardProps> = ({ memo, mode = 'default', onToggleImportant }) => {
  const navigate = useNavigate();
  const { updateMemo, deleteMemo } = useApp();
  const [showDropdown, setShowDropdown] = useState(false);
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  const handleCardClick = () => {
    navigate(`/detail/${memo.id}`);
  };

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    setShowDropdown(false);
    action();
  };

  const handleCopy = () => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = memo.content;
    navigator.clipboard.writeText(tempDiv.innerText).catch(() => {});
    setCopyModalOpen(true);
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    
    const dateMid = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const nowMid = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffDays = Math.round((nowMid.getTime() - dateMid.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '오늘';
    if (diffDays === 1) return '어제';
    if (diffDays > 1 && diffDays < 7) return `${diffDays}일 전`;

    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}.${m}.${d}`;
  };

  return (
    <Card $isImportant={memo.isImportant} $showDropdown={showDropdown} onClick={handleCardClick}>
      <HeaderRow>
        <DateText>{formatDate(memo.createdAt)}</DateText>
        <MoreWrap ref={dropdownRef}>
          <MoreBtn onClick={(e) => { e.stopPropagation(); setShowDropdown(!showDropdown); }}>&#8942;</MoreBtn>
          <Dropdown $show={showDropdown}>
            {mode === 'trash' && (
              <>
                <DropdownItem onClick={(e) => handleAction(e, () => {
                  deleteMemo(memo.id);
                })}>메모 삭제</DropdownItem>
                <DropdownItem onClick={(e) => handleAction(e, () => {
                  updateMemo(memo.id, { isDeleted: false });
                  navigate('/memo');
                })}>메모 복원</DropdownItem>
              </>
            )}
            {mode === 'archive' && (
              <>
                <DropdownItem $danger onClick={(e) => handleAction(e, () => {
                  updateMemo(memo.id, { isDeleted: true, isArchived: false });
                })}>메모 삭제</DropdownItem>
                <DropdownItem onClick={(e) => handleAction(e, () => {
                  updateMemo(memo.id, { isArchived: false });
                  navigate('/memo');
                })}>메모 복원</DropdownItem>
              </>
            )}
            {mode === 'default' && (
              <>
                <DropdownItem onClick={(e) => handleAction(e, handleCopy)}>메모 복사</DropdownItem>
                <DropdownItem onClick={(e) => handleAction(e, () => { updateMemo(memo.id, { isArchived: true }); navigate('/archive'); })}>메모 보관</DropdownItem>
                <DropdownItem onClick={(e) => handleAction(e, () => onToggleImportant && onToggleImportant(memo.id))}>
                  {memo.isImportant ? '고정 해제' : '중요 메모 고정'}
                </DropdownItem>
                <DropdownItem $danger onClick={(e) => handleAction(e, () => {
                  updateMemo(memo.id, { isDeleted: true });
                })}>메모 삭제</DropdownItem>
              </>
            )}
          </Dropdown>
        </MoreWrap>
      </HeaderRow>
      
      <Title>{memo.title}</Title>
      <Desc>{memo.content.replace(/<[^>]+>/g, ' ').trim()}</Desc>
      
      <TagsRow>
        {memo.tags.map(t => (
          <Tag key={t} $tagType={t}>{t}</Tag>
        ))}
      </TagsRow>
      <ConfirmModal 
        isOpen={copyModalOpen}
        title="메모 복사 완료"
        message={'메모 내용이 클립보드에 복사되었습니다.'}
        confirmLabel="확인"
        hideCancel={true}
        noBlur={true}
        onConfirm={() => setCopyModalOpen(false)}
        onCancel={() => setCopyModalOpen(false)}
      />
    </Card>
  );
};
