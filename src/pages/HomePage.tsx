import React, { useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { MemoCard } from '../components/common/MemoCard';
import type { Category } from '../types';

const MainContent = styled.div`
  padding: 18px 18px 90px;
  display: flex;
  flex-direction: column;
  gap: 26px;
`;

const CategoryFilter = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const CategoryItem = styled.button<{ $isActive: boolean }>`
  flex-shrink: 0;
  padding: 9px 18px;
  border-radius: ${({ theme }) => theme.radius.pill};
  font-size: 13px;
  font-weight: 700;
  color: ${({ $isActive, theme }) => ($isActive ? '#1D5B60' : theme.colors.primary)};
  background-color: ${({ $isActive }) => ($isActive ? '#9CEAEF' : '#FFFFFF')};
  transition: background-color 0.15s ease, color 0.15s ease;
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SectionTitle = styled.h2`
  font-size: 15px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textOnPrimary};
`;

const SortBtn = styled.button`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textOnPrimarySub};
  display: flex;
  align-items: center;
  gap: 4px;
`;

const Fab = styled.button`
  position: fixed;
  bottom: calc(${({ theme }) => theme.layout.tabbarHeight} + 20px);
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.accent};
  box-shadow: ${({ theme }) => theme.shadows.fab};
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1A474A;
  z-index: 95;
  transition: transform 0.2s;

  &:active {
    transform: scale(0.92);
  }

  svg {
    width: 26px;
    height: 26px;
  }
`;

const CATEGORIES: Category[] = ['전체', '업무', '개인', '아이디어'];

export const HomePage: React.FC = () => {
  const { memos, deleteMemo, updateMemo } = useApp();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const queryCategory = (searchParams.get('category') as Category) || '전체';
  const [currentCategory, setCurrentCategory] = useState<Category>(queryCategory);

  useEffect(() => {
    setCurrentCategory(queryCategory);
  }, [queryCategory]);

  const handleCategoryChange = (cat: Category) => {
    setCurrentCategory(cat);
    setSearchParams({ category: cat });
  };
  
  const [sortOrder, setSortOrder] = useState<'latest' | 'oldest'>('latest');
  const [showAllRecent, setShowAllRecent] = useState(false);

  const filteredMemos = useMemo(() => {
    let list = memos.filter(m => !m.isArchived && !m.isDeleted);
    if (currentCategory !== '전체') {
      list = list.filter(m => m.category === currentCategory);
    }
    
    return [...list].sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortOrder === 'latest' ? timeB - timeA : timeA - timeB;
    });
  }, [memos, currentCategory, sortOrder]);

  const importantMemos = filteredMemos.filter(m => m.isImportant);
  const recentMemos = filteredMemos.filter(m => !m.isImportant);

  const toggleSort = () => {
    setSortOrder(prev => prev === 'latest' ? 'oldest' : 'latest');
  };

  return (
    <MainContent>
      <CategoryFilter>
        {CATEGORIES.map(cat => (
          <CategoryItem 
            key={cat} 
            $isActive={currentCategory === cat}
            onClick={() => handleCategoryChange(cat)}
          >
            {cat}
          </CategoryItem>
        ))}
      </CategoryFilter>

      {importantMemos.length > 0 && (
        <Section>
          <SectionHeader>
            <SectionTitle>중요 메모</SectionTitle>
          </SectionHeader>
          {importantMemos.map(memo => (
            <MemoCard 
              key={memo.id} 
              memo={memo} 
              onDelete={deleteMemo}
              onToggleImportant={(id) => updateMemo(id, { isImportant: false })}
            />
          ))}
        </Section>
      )}

      <Section>
        <SectionHeader>
          <SectionTitle>최근 메모</SectionTitle>
          <SortBtn onClick={toggleSort}>
            {sortOrder === 'latest' ? '최신순' : '오래된순'} 
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </SortBtn>
        </SectionHeader>
        {(showAllRecent ? recentMemos : recentMemos.slice(0, 5)).map(memo => (
          <MemoCard 
            key={memo.id} 
            memo={memo} 
            onDelete={deleteMemo}
            onToggleImportant={(id) => updateMemo(id, { isImportant: true })}
          />
        ))}
        {recentMemos.length > 5 && (
          <button 
            onClick={() => setShowAllRecent(!showAllRecent)}
            style={{
              width: '100%', padding: '12px', background: 'transparent', borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer'
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="#9CEAEF" strokeWidth="2" style={{ width: '20px', height: '20px', transform: showAllRecent ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        )}
      </Section>

      <Fab onClick={() => navigate('/add')}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </Fab>
    </MainContent>
  );
};
