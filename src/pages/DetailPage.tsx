import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getTagColor } from '../utils/colors';
import { ConfirmModal } from '../components/common/ConfirmModal';

/* ─── Share Modal Styles ─────────────────────────────────────── */
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(4px);
  animation: ${fadeIn} 0.2s ease;
`;

const ModalCard = styled.div`
  background: #ffffff;
  border-radius: 22px;
  padding: 36px 28px 28px;
  width: 100%;
  max-width: 300px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  animation: ${slideUp} 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const ModalTitle = styled.h2`
  font-size: 18px;
  font-weight: 800;
  color: #2B3A4A;
  margin-bottom: 24px;
`;

const ShareIconBtn = styled.button`
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background: linear-gradient(135deg, #C8F5D0 0%, #A8EBB8 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-bottom: 8px;
  transition: transform 0.18s ease;
  box-shadow: 0 4px 14px rgba(80, 200, 120, 0.25);

  &:active {
    transform: scale(0.93);
  }

  svg {
    width: 26px;
    height: 26px;
    color: #35B37E;
  }
`;

const ShareLabel = styled.span`
  font-size: 12px;
  color: #6B7C8D;
  margin-bottom: 24px;
`;

const ModalCancelBtn = styled.button`
  width: 100%;
  padding: 15px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  background: linear-gradient(135deg, #63D4D9 0%, #4BBFC5 100%);
  color: #ffffff;
  box-shadow: 0 6px 18px rgba(75, 191, 197, 0.35);
  transition: all 0.18s ease;

  &:active {
    transform: scale(0.97);
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 22px rgba(75, 191, 197, 0.45);
  }
`;

/* ─── Detail Page Styles ─────────────────────────────────────── */
const DetailContent = styled.div`
  padding: calc(${({ theme }) => theme.layout.headerHeight} + 20px) 18px 90px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SummaryCard = styled.div`
  background-color: #F1F7CE;
  border-radius: ${({ theme }) => theme.radius.l};
  box-shadow: ${({ theme }) => theme.shadows.card};
  padding: 20px 26px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SummaryLabel = styled.span`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 700;
  color: #5C6B1F;
`;

const SummaryMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
`;

const CategoryBadge = styled.span<{ $tagText: string }>`
  padding: 4px 10px;
  border-radius: ${({ theme }) => theme.radius.pill};
  font-size: 12px;
  font-weight: 700;
  ${({ $tagText }) => {
    const c = getTagColor($tagText);
    return `background-color: ${c.bg}; color: ${c.text};`;
  }}
`;

const SummaryTitle = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: #3D4B15;
`;

const SummaryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SummaryItem = styled.div`
  display: flex;
  gap: 8px;
  font-size: 13px;
  line-height: 1.5;
  color: #4C5919;

  &::before {
    content: '•';
    color: #4C5919;
    font-weight: 700;
  }
`;

const BodyCard = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radius.l};
  box-shadow: ${({ theme }) => theme.shadows.card};
  padding: 24px;
  min-height: 300px;
`;

const MemoTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textMain};
  margin-bottom: 12px;
  line-height: 1.4;
`;

const MemoContent = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSub};
  line-height: 1.6;
  ul {
    list-style-type: disc !important;
    margin: 8px 0 8px 24px !important;
    padding-left: 0 !important;
  }
  ul li {
    list-style-type: disc !important;
    display: list-item !important;
    margin-bottom: 4px;
  }
  ol {
    list-style-type: decimal !important;
    margin: 8px 0 8px 24px !important;
    padding-left: 0 !important;
  }
  ol li {
    list-style-type: decimal !important;
    display: list-item !important;
    margin-bottom: 4px;
  }
  u { text-decoration: underline !important; }
  s, strike { text-decoration: line-through !important; }
  em, i { font-style: italic !important; }
  b, strong { font-weight: bold !important; }
`;

const TagsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Tag = styled.span<{ $tagType: string }>`
  display: inline-block;
  padding: 3px 8px;
  border-radius: ${({ theme }) => theme.radius.pill};
  font-size: 11px;
  font-weight: 400;
  
  ${({ $tagType }) => {
    const color = getTagColor($tagType);
    return `background-color: ${color.bg}; color: ${color.text};`;
  }}
`;

const DetailHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: ${({ theme }) => theme.layout.headerHeight};
  padding: 0 16px;
  background-color: ${({ theme }) => theme.colors.primary};
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
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

const Avatar = styled.span`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #A3C9F1;
  color: ${({ theme }) => theme.colors.textMain};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  border: 2px solid ${({ theme }) => theme.colors.white};
`;

export const DetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { memos, updateMemo } = useApp();

  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copyDoneModalOpen, setCopyDoneModalOpen] = useState(false);
  const [trashModalOpen, setTrashModalOpen] = useState(false);

  const memo = memos.find(m => m.id === id);

  if (!memo) {
    return (
      <DetailContent>
        <p style={{ textAlign: 'center', marginTop: '50px' }}>메모를 찾을 수 없습니다.</p>
        <button onClick={() => navigate('/memo')} style={{ padding: '10px', background: '#fff', borderRadius: '8px' }}>목록으로 돌아가기</button>
      </DetailContent>
    );
  }

  const handleShare = () => {
    setShareModalOpen(true);
  };

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/detail/${memo.id}`;
    navigator.clipboard.writeText(shareUrl).catch(() => {});
    setShareModalOpen(false);
    setCopyDoneModalOpen(true);
  };

  const handleEdit = () => {
    navigate(`/add?edit=${memo.id}`);
  };

  const handleTrash = () => {
    setTrashModalOpen(true);
  };

  const handleTrashConfirm = () => {
    updateMemo(memo.id, { isDeleted: true } as Parameters<typeof updateMemo>[1]);
    setTrashModalOpen(false);
    navigate('/trash');
  };

  return (
    <>
      <DetailHeader>
        <HeaderLeft>
          <IconButton onClick={() => navigate(-1)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </IconButton>
          <Logo>SortOne</Logo>
        </HeaderLeft>
        <HeaderRight>
          {/* 공유 버튼 */}
          <IconButton onClick={handleShare}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </IconButton>
          {/* 연필(편집) 버튼 */}
          <IconButton onClick={handleEdit}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </IconButton>
          {/* 휴지통 버튼 */}
          <IconButton onClick={handleTrash}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </IconButton>
          <Avatar onClick={() => navigate('/profile')}>IY</Avatar>
        </HeaderRight>
      </DetailHeader>

      <DetailContent>
        {(() => {
          const displayTags = (memo.tags && memo.tags.length > 0)
            ? memo.tags
            : (memo.category && memo.category !== '전체' ? [memo.category] : ['일반']);
            
          return (
            <>
              {memo.aiSummary && memo.aiSummary.length > 0 && (
                <SummaryCard>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <SummaryLabel style={{ marginBottom: 0 }}>
                      AI 3줄 요약
                    </SummaryLabel>
                    {displayTags.map(tag => (
                      <CategoryBadge key={tag} $tagText={tag}>{tag}</CategoryBadge>
                    ))}
                  </div>
                  <SummaryMeta style={{ marginTop: 0 }}>
                    <SummaryTitle>{memo.title}</SummaryTitle>
                  </SummaryMeta>
                  <SummaryList>
                    {memo.aiSummary.map((summary: string, idx: number) => (
                      <SummaryItem key={idx}>{summary}</SummaryItem>
                    ))}
                  </SummaryList>
                </SummaryCard>
              )}

              <BodyCard onClick={handleEdit} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  <MemoTitle style={{ marginBottom: 0 }}>{memo.title}</MemoTitle>
                  {displayTags.map(tag => (
                    <CategoryBadge key={tag} $tagText={tag}>{tag}</CategoryBadge>
                  ))}
                </div>
                <MemoContent dangerouslySetInnerHTML={{ __html: memo.content }} />
              </BodyCard>
            </>
          );
        })()}
      </DetailContent>

      {/* 메모 공유 모달 */}
      <ConfirmModal 
        isOpen={shareModalOpen}
        title="메모 공유"
        message="현재 메모의 링크를 복사하여 공유하시겠습니까?"
        confirmLabel="링크 복사"
        onConfirm={handleCopyLink}
        onCancel={() => setShareModalOpen(false)}
      />

      {/* 링크 복사 완료 모달 */}
      <ConfirmModal 
        isOpen={copyDoneModalOpen}
        title="링크 복사 완료"
        message={'메모의 공유링크가 클립보드에 복사\n되었습니다.'}
        confirmLabel="확인"
        hideCancel={true}
        noBlur={true}
        onConfirm={() => setCopyDoneModalOpen(false)}
        onCancel={() => setCopyDoneModalOpen(false)}
      />

      {/* 휴지통 이동 확인 모달 */}
      <ConfirmModal
        isOpen={trashModalOpen}
        title="휴지통으로 이동할까요?"
        message={`메모를 휴지통으로 이동합니다.\n30일 후 영구 삭제되며,\n휴지통에서 복원할 수 있습니다.`}
        confirmLabel="이동"
        cancelLabel="취소"
        confirmVariant="danger"
        onConfirm={handleTrashConfirm}
        onCancel={() => setTrashModalOpen(false)}
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        }
      />
    </>
  );
};
