import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getTagColor } from '../utils/colors';
import { ConfirmModal } from '../components/common/ConfirmModal';

const TrashContent = styled.div`
  padding: 32px 18px 90px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const TitleArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
`;

const Title = styled.h1`
  font-size: 26px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textOnPrimary};
`;

const Badge = styled.div`
  padding: 6px 14px;
  border-radius: 20px;
  background-color: #FFFFFF;
  font-size: 13px;
  font-weight: 700;
  color: #2B3A4A;
`;

const Subtitle = styled.p`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textOnPrimary};
  opacity: 0.9;
  margin-top: 4px;
`;

const TrashCard = styled.div`
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
  box-shadow: 0 8px 24px rgba(30, 60, 90, 0.08);
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const Tag = styled.span<{ $tagText: string }>`
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  ${({ $tagText }) => {
    const c = getTagColor($tagText);
    return `background-color: ${c.bg}; color: ${c.text};`;
  }}
`;

const DateText = styled.span`
  font-size: 12px;
  color: #A9B3BD;
  font-weight: 600;
`;

const CardTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: #2B3A4A;
  margin-bottom: 8px;
`;

const CardContent = styled.p`
  font-size: 13.5px;
  color: #6B7C8D;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ImagePreview = styled.img`
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  margin-top: 12px;
`;

const Divider = styled.div`
  border-top: 1px dashed #E9ECEF;
  margin: 16px 0 12px;
`;

const ActionRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 20px;
`;

const ActionBtn = styled.button<{ $danger?: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 700;
  color: ${({ $danger }) => $danger ? '#FF4D4F' : '#6B7C8D'};
  transition: opacity 0.15s ease;
  
  &:active {
    opacity: 0.6;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

export const TrashPage: React.FC = () => {
  const { memos, updateMemo, deleteMemo } = useApp();
  const navigate = useNavigate();
  const trashedMemos = memos.filter(m => m.isDeleted);
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteCompleteModalOpen, setDeleteCompleteModalOpen] = useState(false);
  const [selectedMemoId, setSelectedMemoId] = useState<string | null>(null);

  const getDaysAgo = (dateStr: string) => {
    const diff = new Date().getTime() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return '오늘 삭제';
    return `${days}일 전 삭제`;
  };

  const handleRestore = (id: string) => {
    updateMemo(id, { isDeleted: false });
    navigate('/memo');
  };

  const handlePermanentDelete = (id: string) => {
    setSelectedMemoId(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedMemoId) {
      deleteMemo(selectedMemoId);
      setDeleteModalOpen(false);
      setTimeout(() => {
        setDeleteCompleteModalOpen(true);
      }, 300);
    }
  };

  return (
    <TrashContent>
      <TitleArea>
        <Title>휴지통</Title>
        <Badge>{trashedMemos.length}개의 메모</Badge>
        <Subtitle>휴지통의 메모는 30일 후 영구 삭제됩니다.</Subtitle>
      </TitleArea>

      <div>
        {trashedMemos.map(memo => {
          const mainTag = memo.tags && memo.tags.length > 0 ? memo.tags[0] : memo.category;
          const plainText = memo.content.replace(/<[^>]+>/g, ' ').trim();
          
          return (
            <TrashCard key={memo.id}>
              <CardHeader>
                <Tag $tagText={mainTag}>{mainTag}</Tag>
                <DateText>{getDaysAgo(memo.updatedAt)}</DateText>
              </CardHeader>
              
              <CardTitle>{memo.title}</CardTitle>
              {plainText && <CardContent>{plainText}</CardContent>}
              
              {memo.images && memo.images.length > 0 && (
                <ImagePreview src={memo.images[0]} alt="Attached" />
              )}
              
              <Divider />
              
              <ActionRow>
                <ActionBtn onClick={() => handleRestore(memo.id)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                  </svg>
                  복구
                </ActionBtn>
                <ActionBtn $danger onClick={() => handlePermanentDelete(memo.id)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                  </svg>
                  영구 삭제
                </ActionBtn>
              </ActionRow>
            </TrashCard>
          );
        })}
        
        {trashedMemos.length === 0 && (
          <p style={{ color: '#fff', textAlign: 'center', marginTop: '40px', fontWeight: 600 }}>
            휴지통이 비어있습니다.
          </p>
        )}
      </div>

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="메모를 영구 삭제하시겠습니까?"
        message="삭제된 메모는 다시 복구할 수 없습니다."
        confirmLabel="영구삭제"
        cancelLabel="취소"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
      
      <ConfirmModal
        isOpen={deleteCompleteModalOpen}
        onClose={() => setDeleteCompleteModalOpen(false)}
        title="영구 삭제 완료"
        message="메모가 안전하게 영구 삭제되었습니다."
        confirmLabel="확인"
        hideCancel={true}
        onConfirm={() => setDeleteCompleteModalOpen(false)}
        onCancel={() => setDeleteCompleteModalOpen(false)}
      />
    </TrashContent>
  );
};
