import React from 'react';
import styled from 'styled-components';
import { useApp } from '../context/AppContext';
import { MemoCard } from '../components/common/MemoCard';

const ArchiveContent = styled.div`
  padding: 20px 18px 90px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const TitleArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textOnPrimary};
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textOnPrimarySub};
  line-height: 1.5;
`;

export const ArchivePage: React.FC = () => {
  const { memos } = useApp();
  const archivedMemos = memos.filter(m => m.isArchived && !m.isDeleted);

  return (
    <ArchiveContent>
      <TitleArea>
        <Title>보관함</Title>
        <Subtitle>보관된 메모는 검색에서만 제외되며 언제든<br />복원할 수 있습니다.</Subtitle>
      </TitleArea>

      <div>
        {archivedMemos.map(memo => (
          <MemoCard key={memo.id} memo={memo} mode="archive" />
        ))}
        {archivedMemos.length === 0 && (
          <p style={{ color: '#fff', textAlign: 'center', marginTop: '40px' }}>보관된 메모가 없습니다.</p>
        )}
      </div>
    </ArchiveContent>
  );
};
