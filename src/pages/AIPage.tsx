import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getTagColor } from '../utils/colors';

const AiContent = styled.div`
  padding: 20px 18px 90px;
  display: flex;
  flex-direction: column;
  gap: 26px;
`;

const InsightCard = styled.div`
  background: linear-gradient(160deg, #FFFFFF 0%, #EAF7F4 100%);
  border-radius: ${({ theme }) => theme.radius.l};
  box-shadow: ${({ theme }) => theme.shadows.card};
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const InsightLabel = styled.span`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  color: #8FA6A0;
`;

const InsightTitle = styled.h2`
  font-size: 19px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textMain};
`;

const InsightDesc = styled.p`
  font-size: 14px;
  line-height: 1.6;
  color: #56677A;

  strong {
    color: #35B37E;
    font-weight: 700;
  }
`;

const StatsRow = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 8px;
`;

const StatBox = styled.div`
  flex: 1;
  background-color: rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StatLabel = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: #8FA6A0;
`;

const StatValue = styled.span<{ $positive?: boolean }>`
  font-size: 18px;
  font-weight: 700;
  color: ${({ $positive, theme }) => ($positive ? '#35B37E' : theme.colors.textMain)};
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
`;

const SectionTitle = styled.h3`
  font-size: 15px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textOnPrimary};
`;



const AiList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ListItem = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: 30px;
  padding: 14px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  position: relative;
`;



const ItemTitle = styled.h4`
  font-size: 15px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textMain};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
`;

const DeleteBtn = styled.button`
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #A9B3BD;
  transition: background-color 0.15s ease, color 0.15s ease;

  &:active {
    background-color: #FFE4E4;
    color: #EF4444;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const CheckBtn = styled.button<{ $checked: boolean }>`
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  margin-top: 2px;
  border-radius: 50%;
  border: 2px solid ${({ $checked }) => ($checked ? '#3EB312' : '#CBD5E0')};
  background-color: ${({ $checked }) => ($checked ? '#E8FCE0' : 'transparent')};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ $checked }) => ($checked ? '#3EB312' : '#CBD5E0')};
  transition: all 0.2s ease;

  svg {
    width: 12px;
    height: 12px;
  }
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

const MoreBtn = styled.button`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textOnPrimary};
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  padding: 6px 0;
  width: 150px;
  z-index: 10;
`;

const MenuItem = styled.button<{ $danger?: boolean }>`
  width: 100%;
  text-align: left;
  padding: 8px 14px;
  font-size: 14px;
  color: ${({ $danger }) => ($danger ? '#EF4444' : '#4A5568')};
  transition: color 0.2s;
  white-space: nowrap;
  
  &:hover {
    color: #FF62EF;
  }
`;

const MenuDivider = styled.div`
  height: 1px;
  background-color: #E2E8F0;
  margin: 4px 0;
`;

const WorkBadge = styled.span<{ $bg?: string; $color?: string }>`
  background-color: ${({ $bg }) => $bg || '#FDE8F7'};
  color: ${({ $color }) => $color || '#FF62EF'};
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 800;
`;

interface AnalysisItem {
  id: string;
  title: string;
  desc: string;
  status: 'done' | 'doing';
}

interface ActionItem {
  id: string;
  title: string;
  desc: string;
  checked?: boolean;
  category?: string;
}

const getActionTitle = (memo: any) => {
  const t = memo.title || '메모';
  const c = memo.content || '';
  if (t.includes('운동') || c.includes('운동')) return '운동 일정 캘린더에 추가하기';
  if (t.includes('회의') || memo.tags.includes('업무')) return `${t} 주요 내용 팀에 공유하기`;
  if (t.includes('공부') || memo.tags.includes('개인')) return `${t} 관련 자료 리서치하기`;
  if (memo.tags.includes('건강') || t.includes('병원')) return '건강 관련 일정 예약하기';
  return `${t} 관련 후속 작업 진행하기`;
};

export const AIPage: React.FC = () => {
  const navigate = useNavigate();
  const { memos, updateMemo } = useApp();
  const [showAllAnalysis, setShowAllAnalysis] = useState(false);
  const [showAllActions, setShowAllActions] = useState(false);
  const [showAnalysisMenu, setShowAnalysisMenu] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);

  const [hiddenAnalysis, setHiddenAnalysis] = useState<Set<string>>(new Set());
  const [hiddenActions, setHiddenActions] = useState<Set<string>>(new Set());
  const [checkedActions, setCheckedActions] = useState<Set<string>>(new Set());

  const analysisItems = React.useMemo(() => {
    return memos
      .filter(m => !hiddenAnalysis.has(m.id))
      .map(m => ({
        id: m.id,
        title: m.title || '제목 없음',
        desc: m.tags.length > 0 ? `${m.tags.join(', ')} 관련 분석 완료` : '데이터 분석 및 키워드 추출 중...',
        status: m.tags.length > 0 ? 'done' : 'doing'
      })) as AnalysisItem[];
  }, [memos, hiddenAnalysis]);

  const actionItems = React.useMemo(() => {
    return memos
      .filter(m => !hiddenActions.has(m.id) && m.tags.length > 0)
      .map(m => ({
        id: m.id,
        title: getActionTitle(m),
        desc: m.tags.includes('업무') || m.tags.includes('비즈니스 성장') ? '요약된 내용을 팀에 공유해보세요.' : '관련 일정을 캘린더에 추가해보세요.',
        checked: checkedActions.has(m.id),
        category: (m.tags && m.tags.length > 0) ? m.tags[0] : (m.category || '기타')
      })) as ActionItem[];
  }, [memos, hiddenActions, checkedActions]);

  const handleToggleAction = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCheckedActions(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDeleteAnalysis = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    updateMemo(id, { isDeleted: true });
    setHiddenAnalysis(prev => new Set(prev).add(id));
  };

  const handleDeleteAction = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    updateMemo(id, { isDeleted: true });
    setHiddenActions(prev => new Set(prev).add(id));
  };

  const handleRestoreAnalysis = () => {
    hiddenAnalysis.forEach(id => {
      updateMemo(id, { isDeleted: false });
    });
    setHiddenAnalysis(new Set());
    setShowAnalysisMenu(false);
  };

  const handleRestoreAction = () => {
    hiddenActions.forEach(id => {
      updateMemo(id, { isDeleted: false });
    });
    setHiddenActions(new Set());
    setShowActionMenu(false);
  };

  return (
    <AiContent>
      {(showAnalysisMenu || showActionMenu) && (
        <div 
          style={{ position: 'fixed', inset: 0, zIndex: 9 }} 
          onClick={() => { setShowAnalysisMenu(false); setShowActionMenu(false); }} 
        />
      )}
      <InsightCard>
        <InsightLabel>WEEKLY INSIGHT</InsightLabel>
        <InsightTitle>이번 주는 기획 업무에 집중하셨네요!</InsightTitle>
        <InsightDesc>
          작성하신 메모의 <strong>65%</strong>가 새로운 프로젝트 기획과 관련된 내용입니다. 아이디어 확장에 좋은 흐름이에요.
        </InsightDesc>
        <StatsRow>
          <StatBox>
            <StatLabel>작성한 메모</StatLabel>
            <StatValue>{memos.length}개</StatValue>
          </StatBox>
          <StatBox>
            <StatLabel>분석 효율</StatLabel>
            <StatValue $positive>+14%</StatValue>
          </StatBox>
        </StatsRow>
      </InsightCard>

      <Section>
        <SectionHeader>
          <SectionTitle>분석 현황</SectionTitle>
          <MoreBtn onClick={() => setShowAnalysisMenu(!showAnalysisMenu)}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="19" r="1.5" />
            </svg>
          </MoreBtn>
          {showAnalysisMenu && (
            <DropdownMenu>
              <MenuItem onClick={() => setShowAnalysisMenu(false)}>최신 등록순</MenuItem>
              <MenuItem onClick={() => setShowAnalysisMenu(false)}>오래된순</MenuItem>
              <MenuItem onClick={() => setShowAnalysisMenu(false)}>분석 중 먼저</MenuItem>
              <MenuItem onClick={() => setShowAnalysisMenu(false)}>완료된 항목 먼저</MenuItem>
              <MenuDivider />
              <MenuItem $danger onClick={handleRestoreAnalysis}>삭제된 항목 복원</MenuItem>
            </DropdownMenu>
          )}
        </SectionHeader>
        <AiList>
          {(showAllAnalysis ? analysisItems : analysisItems.slice(0, 5)).map(item => (
            <ListItem key={item.id} onClick={() => navigate('/detail/' + item.id)}>
              <ItemTitle>"{item.title}"</ItemTitle>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: item.status === 'done' ? '#35B37E' : '#6B7C8D' }}>
                  {item.status === 'done' ? '완료' : '분석중'}
                </span>
                <DeleteBtn onClick={(e) => handleDeleteAnalysis(item.id, e)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </DeleteBtn>
              </div>
            </ListItem>
          ))}
          {analysisItems.length > 5 && (
            <button 
              onClick={() => setShowAllAnalysis(!showAllAnalysis)}
              style={{
                width: '100%', padding: '12px', background: 'transparent', borderRadius: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer'
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="#9CEAEF" strokeWidth="2" style={{ width: '20px', height: '20px', transform: showAllAnalysis ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          )}
          {analysisItems.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px', color: '#A9B3BD', fontSize: '14px' }}>
              분석 현황이 없습니다.
            </div>
          )}
        </AiList>
      </Section>

      <Section>
        <SectionHeader>
          <SectionTitle>실행 항목</SectionTitle>
          <MoreBtn onClick={() => setShowActionMenu(!showActionMenu)}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="19" r="1.5" />
            </svg>
          </MoreBtn>
          {showActionMenu && (
            <DropdownMenu>
              <MenuItem onClick={handleRestoreAction}>삭제항목 복원</MenuItem>
              <MenuItem $danger onClick={() => setShowActionMenu(false)}>완료 항목 초기화</MenuItem>
            </DropdownMenu>
          )}
        </SectionHeader>
        <AiList>
          {(showAllActions ? actionItems : actionItems.slice(0, 5)).map(item => (
            <ListItem key={item.id} onClick={() => navigate('/detail/' + item.id)}>
              <CheckBtn $checked={!!item.checked} onClick={(e) => handleToggleAction(item.id, e)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </CheckBtn>
              <WorkBadge 
                $bg={getTagColor(item.category || '').bg} 
                $color={getTagColor(item.category || '').text}
              >
                {item.category === '전체' ? '기타' : item.category}
              </WorkBadge>
              <ItemTitle style={{ textDecoration: item.checked ? 'line-through' : 'none', color: item.checked ? '#A9B3BD' : undefined }}>{item.title}</ItemTitle>
              <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
                <DeleteBtn onClick={(e) => handleDeleteAction(item.id, e)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </DeleteBtn>
              </div>
            </ListItem>
          ))}
          {actionItems.length > 5 && (
            <button 
              onClick={() => setShowAllActions(!showAllActions)}
              style={{
                width: '100%', padding: '12px', background: 'transparent', borderRadius: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer'
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="#9CEAEF" strokeWidth="2" style={{ width: '20px', height: '20px', transform: showAllActions ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          )}
          {actionItems.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px', color: '#A9B3BD', fontSize: '14px' }}>
              실행 항목이 없습니다.
            </div>
          )}
        </AiList>
      </Section>

      <Fab onClick={() => navigate('/add')}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </Fab>
    </AiContent>
  );
};
