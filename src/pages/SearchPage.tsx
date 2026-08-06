import React, { useState, KeyboardEvent, useMemo } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getTagColor } from '../utils/colors';
import { MemoCard } from '../components/common/MemoCard';

const SearchContent = styled.div`
  padding: 20px 18px 90px;
  display: flex;
  flex-direction: column;
  gap: 26px;
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radius.pill};
  padding: 8px 8px 8px 18px;
  box-shadow: ${({ theme }) => theme.shadows.card};
`;

const SearchIcon = styled.svg`
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  color: #A9B3BD;
`;

const SearchInput = styled.input`
  flex: 1;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textMain};
  &::placeholder {
    color: #A9B3BD;
  }
`;

const ClearBtn = styled.button`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #A9B3BD;
  svg {
    width: 16px;
    height: 16px;
  }
`;

const SubmitBtn = styled.button`
  flex-shrink: 0;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.accent};
  color: #1D5B60;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease;

  &:active {
    transform: scale(0.9);
  }

  svg {
    width: 20px;
    height: 20px;
  }
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

const SectionTitle = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textOnPrimary};
`;

const ClearAllBtn = styled.button`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textOnPrimarySub};
`;

const SmartTagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const SmartTag = styled.button<{ $tagText: string }>`
  padding: 6px 12px;
  border-radius: ${({ theme }) => theme.radius.pill};
  font-size: 13px;
  font-weight: 700;
  ${({ $tagText }) => {
    const c = getTagColor($tagText);
    return `background-color: ${c.bg}; color: ${c.text};`;
  }}
  transition: filter 0.15s ease;

  &:hover, &:active {
    filter: brightness(0.95);
  }
`;

const RecentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const RecentItemRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.05);
  cursor: pointer;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const RecentText = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textOnPrimary};
  flex: 1;
`;

const RecentDelBtn = styled.button`
  color: ${({ theme }) => theme.colors.textOnPrimarySub};
  padding: 4px;
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const ResultInfo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
`;

const ResultCount = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textOnPrimary};
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

const SMART_TAGS = ['업무', '일상', '건강', '음식', '여행', '공부'];

const getChosung = (str: string) => {
  const cho = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
  let result = "";
  for(let i=0; i<str.length; i++) {
    const code = str.charCodeAt(i) - 44032;
    if(code > -1 && code < 11172) result += cho[Math.floor(code / 588)];
    else result += str.charAt(i);
  }
  return result;
};

export const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const { memos, deleteMemo, updateMemo, recentSearches, addRecentSearch, removeRecentSearch, clearRecentSearches } = useApp();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (searchQuery: string) => {
    const q = searchQuery.trim();
    if (!q) return;
    setQuery(q);
    addRecentSearch(q);
    setIsSearching(true);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(query);
    }
  };

  const searchResults = useMemo(() => {
    if (!isSearching || !query.trim()) return [];
    const lowerQ = query.toLowerCase();
    const queryCho = getChosung(lowerQ);
    return memos.filter(m => {
      const titleLower = m.title.toLowerCase();
      const contentLower = m.content.toLowerCase();
      
      const titleCho = getChosung(titleLower);
      const contentCho = getChosung(contentLower);

      if (titleLower.includes(lowerQ) || contentLower.includes(lowerQ) || m.tags.some(t => t.toLowerCase().includes(lowerQ))) return true;
      if (titleCho.includes(queryCho) || contentCho.includes(queryCho) || m.tags.some(t => getChosung(t.toLowerCase()).includes(queryCho))) return true;
      return false;
    });
  }, [memos, query, isSearching]);

  const handleClear = () => {
    setQuery('');
    setIsSearching(false);
  };

  return (
    <SearchContent>
      <SearchBar>
        <SearchIcon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </SearchIcon>
        <SearchInput 
          type="text" 
          placeholder="검색어를 입력하세요(예: 텐트, 노트)" 
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value === '') setIsSearching(false);
          }}
          onKeyDown={handleKeyDown}
        />
        {query && (
          <ClearBtn type="button" onClick={handleClear}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </ClearBtn>
        )}
        <SubmitBtn type="button" onClick={() => handleSearch(query)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </SubmitBtn>
      </SearchBar>

      <Section>
        <SectionHeader>
          <SectionTitle>AI 스마트 태그</SectionTitle>
        </SectionHeader>
        <SmartTagList>
          {SMART_TAGS.map(tag => (
            <SmartTag key={tag} $tagText={tag} onClick={() => handleSearch(tag)}>{tag}</SmartTag>
          ))}
        </SmartTagList>
      </Section>

      {!isSearching ? (
        <>
          {recentSearches.length > 0 && (
            <Section>
              <SectionHeader>
                <SectionTitle>최근 검색어</SectionTitle>
                <ClearAllBtn onClick={clearRecentSearches}>모두 지우기</ClearAllBtn>
              </SectionHeader>
              <RecentList>
                {recentSearches.map(term => (
                  <RecentItemRow key={term} onClick={() => handleSearch(term)}>
                    <RecentText>{term}</RecentText>
                    <RecentDelBtn onClick={(e) => { e.stopPropagation(); removeRecentSearch(term); }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </RecentDelBtn>
                  </RecentItemRow>
                ))}
              </RecentList>
            </Section>
          )}
        </>
      ) : (
        <Section>
          <ResultInfo>
            <ResultCount>검색 결과 {searchResults.length}건</ResultCount>
          </ResultInfo>
          {searchResults.map(memo => (
            <MemoCard 
              key={memo.id} 
              memo={memo} 
              onDelete={deleteMemo}
              onToggleImportant={(id) => updateMemo(id, { isImportant: !memo.isImportant })}
            />
          ))}
        </Section>
      )}

      <Fab onClick={() => navigate('/add')}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </Fab>
    </SearchContent>
  );
};
