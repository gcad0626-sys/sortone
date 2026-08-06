import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getTagColor } from '../utils/colors';

/* ─── Keyframes ─────────────────────────────────────────────────── */
const slideUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

/* ─── Header ─────────────────────────────────────────────────────── */
const HeaderContainer = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: ${({ theme }) => theme.layout.headerHeight};
  padding: 0 16px;
  background-color: ${({ theme }) => theme.colors.primary};
  flex-shrink: 0;
`;
const LeftArea = styled.div`display: flex; align-items: center; gap: 12px;`;
const RightArea = styled.div`display: flex; align-items: center; gap: 16px;`;
const IconButton = styled.button`
  width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
  color: ${({ theme }) => theme.colors.textOnPrimary}; transition: opacity 0.2s;
  &:active { opacity: 0.6; } svg { width: 24px; height: 24px; }
`;
const Logo = styled.span`
  font-family: ${({ theme }) => theme.fonts.logo}; font-size: 24px;
  color: ${({ theme }) => theme.colors.textOnPrimary}; line-height: 1; margin-top: 2px;
`;
const Avatar = styled.span`
  width: 32px; height: 32px; border-radius: 50%; background-color: #A3C9F1;
  color: ${({ theme }) => theme.colors.textMain}; display: flex; align-items: center;
  justify-content: center; font-size: 13px; font-weight: 700; cursor: pointer;
  border: 2px solid ${({ theme }) => theme.colors.white};
`;

/* ─── Main Content ───────────────────────────────────────────────── */
const AddContent = styled.div`
  flex: 1; display: flex; flex-direction: column; min-height: 0;
  padding: 18px 18px 0; gap: 16px; overflow-y: auto;
`;
const TitleInput = styled.input`
  width: 100%; font-size: 20px; font-weight: 700;
  color: ${({ theme }) => theme.colors.textOnPrimary}; padding-left: 10px;
  &::placeholder { color: ${({ theme }) => theme.colors.textOnPrimarySub}; font-weight: 700; }
`;
const ContentBox = styled.div`
  position: relative; flex: 1; min-height: 260px; background-color: #E4F3F0;
  border-radius: ${({ theme }) => theme.radius.l}; box-shadow: ${({ theme }) => theme.shadows.card};
  overflow: hidden; display: flex; flex-direction: column;
`;
const ContentInput = styled.div`
  width: 100%; flex: 1; padding: 18px; padding-bottom: 60px;
  font-size: 14px; line-height: 1.7; color: ${({ theme }) => theme.colors.textMain};
  outline: none; overflow-y: auto;
  &:empty:before { content: attr(data-placeholder); color: #A9B3BD; pointer-events: none; display: block; }
  ul { list-style: disc; margin: 8px 0 8px 24px; padding-left: 0; }
  ol { list-style: decimal; margin: 8px 0 8px 24px; padding-left: 0; }
  li { margin-bottom: 4px; display: list-item; }
  u { text-decoration: underline; }
  s, strike { text-decoration: line-through; }
  em, i { font-style: italic; }
  b, strong { font-weight: bold; }
`;
const SaveBtn = styled.button`
  position: absolute; bottom: 18px; right: 18px; width: 44px; height: 44px;
  border-radius: 50%; background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white}; display: flex; align-items: center;
  justify-content: center; box-shadow: 0 4px 12px rgba(30, 60, 100, 0.25);
  transition: transform 0.2s;
  &:active { transform: scale(0.9); } svg { width: 22px; height: 22px; }
`;

/* ─── AI Tag Section ─────────────────────────────────────────────── */
const AiTagSection = styled.div`margin-top: 4px; display: flex; flex-direction: column; gap: 8px; padding-bottom: 80px;`;
const AiTagLabel = styled.span`font-size: 13px; font-weight: 700; color: ${({ theme }) => theme.colors.textOnPrimary};`;
const AiTagList = styled.div`display: flex; flex-wrap: wrap; gap: 8px;`;
const AiTag = styled.button<{ $tagText: string; $selected?: boolean }>`
  padding: 7px 16px; border-radius: ${({ theme }) => theme.radius.pill};
  font-size: 13px; font-weight: 600; border: 2px solid transparent; opacity: 0.9;
  transition: opacity 0.15s ease, border-color 0.15s ease, transform 0.1s ease;
  &:active { transform: scale(0.96); }
  ${({ $tagText, $selected }) => {
    const c = getTagColor($tagText);
    return css`
      background-color: ${c.bg}; color: ${c.text};
      ${$selected ? `border-color: ${c.text}; opacity: 1;` : ''}
    `;
  }}
`;

/* ─── Format Panel Wrap ──────────────────────────────────────────── */
const FormatPanelWrap = styled.div<{ $show: boolean }>`
  display: ${({ $show }) => ($show ? 'flex' : 'none')};
  padding: 0 18px; justify-content: center; margin-bottom: 4px;
`;
const FormatPanel = styled.div`
  width: 100%; max-width: calc(480px - 36px); background-color: #FAFAFA;
  border-radius: ${({ theme }) => theme.radius.l};
  box-shadow: 0 8px 24px rgba(30, 60, 90, 0.15); padding: 18px;
  display: flex; flex-direction: column; gap: 12px;
  animation: ${slideUp} 0.25s ease-out forwards;
`;
const PanelHeader = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  padding-bottom: 10px; border-bottom: 1px solid #F0F0F0;
`;
const PanelTitle = styled.span`font-size: 13px; font-weight: 700; color: #2B3A4A;`;
const PanelClose = styled.button`
  background: none; border: none; cursor: pointer; color: #A9B3BD; padding: 2px;
  display: flex; align-items: center; justify-content: center;
  &:hover { color: #2B3A4A; } svg { width: 16px; height: 16px; }
`;

/* Panel List (for text style, italic style) */
const PanelList = styled.div`display: flex; flex-direction: column;`;
const PanelListItem = styled.div<{ $interactive?: boolean }>`
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 6px; border-bottom: 1px solid #F7F7F7; border-radius: 8px;
  user-select: none; transition: background-color 0.15s ease;
  ${({ $interactive }) => $interactive ? `
    cursor: pointer;
    &:hover { background-color: #F0FAF9; }
    &:active { background-color: #E2F3F0; }
  ` : ''}
  &:last-child { border-bottom: none; }
`;
const PanelListItemLeft = styled.div`
  display: flex; align-items: center; gap: 8px; color: ${({ theme }) => theme.colors.textMain};
`;
const PanelListItemIcon = styled.span`
  width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; color: #6B7C8D;
  svg { width: 18px; height: 18px; }
`;
const PanelListItemLabel = styled.span`font-size: 13px; font-weight: 500;`;
const PanelListItemRight = styled.div`display: flex; align-items: center; gap: 6px;`;
const PanelListItemValue = styled.span`font-size: 12px; color: #A9B3BD;`;
const ColorDot = styled.span<{ $color: string; $bordered?: boolean }>`
  width: 14px; height: 14px; border-radius: 50%;
  background-color: ${({ $color }) => $color};
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.1);
  ${({ $bordered }) => $bordered ? 'border: 1.5px solid #A9B3BD; background-color: transparent;' : ''}
`;

/* Custom Toggle Switch */
const CustomToggle = styled.div<{ $checked: boolean }>`
  position: relative;
  width: 38px;
  height: 20px;
  background-color: ${({ $checked }) => ($checked ? '#9CEAEF' : '#E2E8F0')};
  border-radius: 99px;
  transition: background-color 0.2s ease;
  flex-shrink: 0;

  &::before {
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    width: 14px;
    height: 14px;
    background-color: #ffffff;
    border-radius: 50%;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    transition: transform 0.2s cubic-bezier(0.25, 1, 0.5, 1);
    transform: ${({ $checked }) => ($checked ? 'translateX(18px)' : 'translateX(0)')};
  }
`;

/* Alignment row */
const AlignmentRow = styled.div`
  display: flex; justify-content: space-around; border-top: 1px solid #F0F0F0;
  padding-top: 12px; margin-top: 4px;
`;
const AlignBtn = styled.button<{ $active?: boolean }>`
  width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
  color: ${({ $active }) => ($active ? '#1D5B60' : '#6B7C8D')};
  background-color: ${({ $active }) => ($active ? '#EFF3F7' : 'transparent')};
  border-radius: 6px; transition: background-color 0.15s ease, color 0.15s ease;
  svg { width: 18px; height: 18px; }
`;

/* Color picker grid */
const ColorPickerGrid = styled.div<{ $cols?: number }>`
  display: grid; grid-template-columns: repeat(${({ $cols }) => $cols ?? 5}, 1fr);
  gap: 12px; padding: 10px 0; justify-items: center;
`;
const ColorCircle = styled.button<{ $color: string; $selected?: boolean; $isWhite?: boolean }>`
  width: 32px; height: 32px; border-radius: 50%; border: none; cursor: pointer;
  position: relative; transition: transform 0.15s ease;
  background-color: ${({ $color }) => $color};
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.08);
  ${({ $selected, $isWhite }) => $selected ? `
    &::after {
      content: "✓"; position: absolute; top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      color: ${$isWhite ? '#2B3A4A' : '#FFF'};
      font-size: 14px; font-weight: 700;
      text-shadow: ${$isWhite ? 'none' : '0 1px 2px rgba(0,0,0,0.3)'};
    }
  ` : ''}
  &:active { transform: scale(0.9); }
`;
const ActionBtn = styled.button`
  background-color: ${({ theme }) => theme.colors.accent}; color: #1D5B60;
  font-size: 13px; font-weight: 700; padding: 10px 24px;
  border-radius: ${({ theme }) => theme.radius.pill}; border: none; cursor: pointer;
  align-self: flex-end; margin-top: 8px; box-shadow: 0 2px 6px rgba(156,234,239,0.4);
  transition: background-color 0.15s ease;
  &:hover { background-color: #8AE0E6; }
`;

/* Font size list */
const FontSizeList = styled.div`display: flex; flex-direction: column; gap: 10px;`;
const FontSizeOption = styled.button<{ $selected?: boolean }>`
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 16px; border-radius: ${({ theme }) => theme.radius.m};
  background-color: ${({ $selected }) => ($selected ? '#F0FAF9' : '#F8F9FA')};
  border: 1px solid ${({ $selected }) => ($selected ? '#9CEAEF' : '#EEE')};
  cursor: pointer; text-align: left; width: 100%;
`;
const FontSizeOptionInfo = styled.div`display: flex; flex-direction: column; gap: 4px;`;
const FontSizeOptionLabel = styled.span`font-size: 13px; font-weight: 700; color: #2B3A4A;`;
const FontSizeOptionValue = styled.span`font-size: 11px; color: #6B7C8D;`;
const FontSizeRadio = styled.div<{ $selected?: boolean }>`
  width: 18px; height: 18px; border-radius: 50%;
  border: 2px solid ${({ $selected }) => ($selected ? '#9CEAEF' : '#D1D5DB')};
  background-color: ${({ $selected }) => ($selected ? '#9CEAEF' : 'transparent')};
  display: flex; align-items: center; justify-content: center;
  &::after { content: ""; width: 6px; height: 6px; border-radius: 50%;
    background-color: ${({ $selected }) => ($selected ? '#1D5B60' : 'transparent')};
  }
`;

/* Image panel */
const ImageOptionList = styled.div`display: flex; flex-direction: column; gap: 12px; padding: 8px 0;`;
const ImageOptionItem = styled.button`
  display: flex; align-items: center; gap: 14px; padding: 14px;
  border-radius: ${({ theme }) => theme.radius.m}; background-color: #FFF;
  border: 1px solid #EEE; text-align: left; width: 100%;
  &:hover { background-color: #F8F9FA; }
`;
const ImageOptionIconWrap = styled.div`
  width: 40px; height: 40px; border-radius: 50%; background-color: #F0F5FA;
  color: ${({ theme }) => theme.colors.primary}; display: flex; align-items: center; justify-content: center;
  svg { width: 20px; height: 20px; }
`;
const ImageOptionInfo = styled.div`display: flex; flex-direction: column; gap: 3px;`;
const ImageOptionTitle = styled.span`font-size: 13px; font-weight: 700; color: #2B3A4A;`;
const ImageOptionDesc = styled.span`font-size: 11px; color: #6B7C8D;`;
const InfoBox = styled.div`
  display: flex; gap: 8px; background-color: #F0F5FA; padding: 12px 14px;
  border-radius: ${({ theme }) => theme.radius.m}; margin-top: 6px;
`;
const InfoBoxIcon = styled.div`
  color: ${({ theme }) => theme.colors.primary}; display: flex; align-items: flex-start; margin-top: 1px;
  svg { width: 16px; height: 16px; }
`;
const InfoBoxText = styled.div`font-size: 11px; line-height: 1.5; color: #6B7C8D;`;

/* Link panel */
const LinkFormFields = styled.div`display: flex; flex-direction: column; gap: 12px; padding: 6px 0;`;
const LinkFormGroup = styled.div`
  display: flex; flex-direction: column; gap: 6px;
  label { font-size: 11px; font-weight: 700; color: #6B7C8D; }
  input {
    width: 100%; background-color: #FFF; border: 1px solid #DDD;
    border-radius: ${({ theme }) => theme.radius.s}; padding: 10px 12px;
    font-size: 12px; outline: none;
    &:focus { border-color: ${({ theme }) => theme.colors.primary}; }
  }
`;
const LinkPanelFooter = styled.div`display: flex; justify-content: flex-end; gap: 12px; margin-top: 12px;`;
const LinkBtnCancel = styled.button`font-size: 13px; font-weight: 700; color: ${({ theme }) => theme.colors.textSub}; padding: 10px 16px;`;
const LinkBtnConfirm = styled.button`
  background-color: ${({ theme }) => theme.colors.accent}; color: #1D5B60;
  font-size: 13px; font-weight: 700; padding: 10px 22px;
  border-radius: ${({ theme }) => theme.radius.pill}; border: none; cursor: pointer;
  &:hover { background-color: #8AE0E6; }
`;

/* Toolbar */
const ToolbarWrap = styled.div`
  flex-shrink: 0; display: flex; justify-content: center; padding: 14px 18px 18px; z-index: 90;
`;
const Toolbar = styled.div`
  display: flex; align-items: center; gap: 4px;
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radius.pill}; padding: 8px 10px;
  box-shadow: ${({ theme }) => theme.shadows.card}; overflow-x: auto;
  &::-webkit-scrollbar { display: none; }
`;
const ToolbarBtn = styled.button<{ $isActive?: boolean }>`
  width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;
  border-radius: 50%; font-size: 15px; font-weight: 700;
  color: ${({ $isActive, theme }) => ($isActive ? theme.colors.primary : theme.colors.textMain)};
  background-color: ${({ $isActive }) => ($isActive ? 'rgba(29, 91, 96, 0.1)' : 'transparent')};
  transition: background-color 0.15s ease;
  &:active { transform: scale(0.92); }
  &:hover { background-color: rgba(29, 91, 96, 0.1); }
  svg { width: 20px; height: 20px; }
`;
const ToolbarDivider = styled.div`width: 1px; height: 20px; background-color: #ECEAE5; margin: 0 2px;`;

/* ─── SVG helpers ────────────────────────────────────────────────── */
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const AlignLeftIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="17" y1="10" x2="3" y2="10" /><line x1="21" y1="6" x2="3" y2="6" />
    <line x1="21" y1="14" x2="3" y2="14" /><line x1="17" y1="18" x2="3" y2="18" />
  </svg>
);
const AlignCenterIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="10" x2="6" y2="10" /><line x1="21" y1="6" x2="3" y2="6" />
    <line x1="21" y1="14" x2="3" y2="14" /><line x1="18" y1="18" x2="6" y2="18" />
  </svg>
);
const AlignRightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="21" y1="10" x2="7" y2="10" /><line x1="21" y1="6" x2="3" y2="6" />
    <line x1="21" y1="14" x2="3" y2="14" /><line x1="21" y1="18" x2="7" y2="18" />
  </svg>
);

/* ─── Panel sub-types ────────────────────────────────────────────── */
type ToolbarFormat = 'bold' | 'italic' | 'list' | 'image' | 'link';
type SubPanel = 'fontSize' | 'fontColor' | 'highlighter' | null;

const FONT_SIZES = [
  { label: '소형', desc: '12px', value: '1' },
  { label: '보통', desc: '16px', value: '3' },
  { label: '대형', desc: '20px', value: '5' },
  { label: '특대', desc: '24px', value: '6' },
];

const FONT_COLORS = [
  '#1A1A1A', '#7F7F7F', '#3F3F3F', '#50B8E7', '#8EC0E4',
  '#6355E6', '#9E8FF6', '#FFA8A8', '#A8E2E6', '#BBE2BD'
];

const HIGHLIGHT_COLORS = [
  { name: 'yellow', code: '#FFF27F' }, { name: 'lime', code: '#CCFF66' },
  { name: 'pink', code: '#FF7FA5' }, { name: 'cyan', code: '#7FDDFF' },
  { name: 'orange', code: '#FFC47F' }, { name: 'purple', code: '#DF7FFF' },
  { name: 'teal', code: '#7FFFF0' }, { name: 'lavender', code: '#C0B3FF' }
];

const DEFAULT_TAGS = ['비즈니스 성장', '핵심 성과', '아이디어', '건강', '음식', '기록', '금융', '개인'];

/* ─── Component ──────────────────────────────────────────────────── */
export const AddMemoPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const { addMemo, updateMemo, memos } = useApp();

  const editMemo = editId ? memos.find(m => m.id === editId) : null;

  const [title, setTitle] = useState(editMemo?.title ?? '');
  const [activePanel, setActivePanel] = useState<ToolbarFormat | null>(null);
  const [subPanel, setSubPanel] = useState<SubPanel>(null);
  const [align, setAlign] = useState<'left' | 'center' | 'right'>('left');
  const [fontColor, setFontColor] = useState('#2B3A4A');
  const [highlightColor, setHighlightColor] = useState('transparent');
  const [selectedFontSize, setSelectedFontSize] = useState('3');
  const [linkUrl, setLinkUrl] = useState('https://');
  const [selectedTags, setSelectedTags] = useState<string[]>(editMemo?.tags ?? []);
  const [useAi, setUseAi] = useState(true);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [attachedSource, setAttachedSource] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const savedSelectionRef = useRef<Range | null>(null);

  const [activeFormats, setActiveFormats] = useState({
    italic: false,
    underline: false,
    strikeThrough: false,
    insertUnorderedList: false,
    insertOrderedList: false,
  });

  const checkCommandStates = () => {
    try {
      setActiveFormats({
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        strikeThrough: document.queryCommandState('strikeThrough'),
        insertUnorderedList: document.queryCommandState('insertUnorderedList'),
        insertOrderedList: document.queryCommandState('insertOrderedList'),
      });
    } catch {
      // ignore
    }
  };

  // 편집 모드: 초기 content 세팅
  useEffect(() => {
    if (editMemo && contentRef.current) {
      contentRef.current.innerHTML = editMemo.content;
    }
  }, []);

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      if (contentRef.current?.contains(range.commonAncestorContainer)) {
        savedSelectionRef.current = range.cloneRange();
      }
    }
  };

  const restoreSelection = () => {
    const el = contentRef.current;
    if (!el) return;
    el.focus();
    const sel = window.getSelection();
    if (!sel) return;
    if (savedSelectionRef.current && el.contains(savedSelectionRef.current.commonAncestorContainer)) {
      sel.removeAllRanges();
      sel.addRange(savedSelectionRef.current);
    } else {
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
      savedSelectionRef.current = range.cloneRange();
    }
  };

  useEffect(() => {
    const handler = () => {
      const sel = window.getSelection();
      if (!sel || !sel.rangeCount) return;
      const range = sel.getRangeAt(0);
      if (contentRef.current?.contains(range.commonAncestorContainer)) {
        savedSelectionRef.current = range.cloneRange();
        checkCommandStates();
      }
    };
    document.addEventListener('selectionchange', handler);
    return () => document.removeEventListener('selectionchange', handler);
  }, []);

  const exec = (cmd: string, value: string = '') => {
    const el = contentRef.current;
    if (!el) return;
    restoreSelection();
    document.execCommand(cmd, false, value || undefined);
    saveSelection();
    checkCommandStates();
  };

  const execList = (cmd: 'insertUnorderedList' | 'insertOrderedList') => {
    const el = contentRef.current;
    if (!el) return;
    restoreSelection();
    
    if (!el.innerText.trim() && (!el.innerHTML || el.innerHTML === '<br>')) {
      el.innerHTML = '<div><br></div>';
      const range = document.createRange();
      const targetNode = el.firstChild || el;
      range.selectNodeContents(targetNode);
      range.collapse(true);
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }

    document.execCommand(cmd, false);
    saveSelection();
    checkCommandStates();
  };

  const execHighlight = (color: string) => {
    restoreSelection();
    // Chrome supports hiliteColor; Firefox/others use backColor
    if (!document.execCommand('hiliteColor', false, color)) {
      document.execCommand('backColor', false, color);
    }
    saveSelection();
  };

  const handleSave = () => {
    const content = contentRef.current?.innerHTML || '';
    const plainText = contentRef.current?.innerText?.trim() || '';
    if (!title.trim() && !plainText) {
      alert('내용을 입력해주세요.');
      return;
    }
    
    // AI 추천 태그 및 3줄 요약 생성
    let finalTags = selectedTags.length > 0 ? selectedTags : [];
    if (useAi && finalTags.length === 0) {
      const textToAnalyze = (title + ' ' + plainText).toLowerCase();
      if (/(건강|운동|다이어트|병원|약|결명자|차|음료|영양제)/.test(textToAnalyze)) {
        finalTags.push('건강', '일상');
      } else if (/(식당|맛집|음식|식단|레시피|요리|식재료|메뉴)/.test(textToAnalyze)) {
        finalTags.push('음식', '일상');
      } else if (/(회의|미팅|보고|기획|디자인|개발|마케팅|재무|인사|업무|프로젝트|일정|출장)/.test(textToAnalyze)) {
        finalTags.push('업무', '핵심성과');
      } else if (/(아이디어|영감|창의|생각|브레인스토밍)/.test(textToAnalyze)) {
        finalTags.push('아이디어', '프로젝트');
      } else if (/(돈|금융|투자|주식|코인|부동산|저축|예금|가계부|쇼핑)/.test(textToAnalyze)) {
        finalTags.push('금융', '일상');
      } else if (/(공부|학습|독서|책|시험|강의|자격증)/.test(textToAnalyze)) {
        finalTags.push('공부', '개인');
      } else if (/(여행|캠핑|휴가|비행기|호텔|관광)/.test(textToAnalyze)) {
        finalTags.push('여행', '일상');
      } else if (/(가족|친구|지인|모임|약속|데이트)/.test(textToAnalyze)) {
        finalTags.push('관계', '일상');
      } else if (/(영화|음악|드라마|전시|공연|취미|게임)/.test(textToAnalyze)) {
        finalTags.push('취미', '일상');
      } else {
        finalTags.push('메모', '일상');
      }
    }
    
    let generatedSummary: string[] = [];
    if (useAi) {
      const sentences = plainText.replace(/\n+/g, ' ').split(/(?<=[.?!])\s+/).filter(s => s.trim().length > 0);
      if (sentences.length > 0) {
        generatedSummary = sentences.slice(0, 3).map(s => s.trim() + (s.match(/[.?!]$/) ? '' : '.'));
      } else {
        generatedSummary = [
          title.trim() ? `'${title}'에 대한 메모입니다.` : '작성된 메모의 핵심 내용입니다.',
          '작성된 내용을 바탕으로 자동 요약되었습니다.',
          '메모를 더 추가하여 상세 요약을 받아보세요.'
        ];
      }
    }

    if (editId && editMemo) {
      updateMemo(editId, { title: title.trim() || '제목 없음', content, tags: finalTags, aiSummary: generatedSummary });
      navigate(`/detail/${editId}`);
    } else {
      addMemo({ title: title.trim() || '제목 없음', content, tags: finalTags, category: '전체', isImportant: false, aiSummary: generatedSummary });
      navigate('/memo');
    }
  };

  const handleToolbarClick = (format: ToolbarFormat) => {
    saveSelection();
    setSubPanel(null);
    if (format === 'image') {
      setImageModalOpen(true);
      setActivePanel(null);
      return;
    }
    if (activePanel === format) { setActivePanel(null); return; }
    setActivePanel(format);
  };

  const closePanel = () => { setActivePanel(null); setSubPanel(null); };

  const applyAlign = (dir: 'left' | 'center' | 'right') => {
    setAlign(dir);
    exec('justify' + dir.charAt(0).toUpperCase() + dir.slice(1));
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleImageAttach = (source: string) => {
    const id = Math.floor(Math.random() * 1000);
    exec('insertHTML', `<br/><img src="https://picsum.photos/id/${id}/600/400" alt="첨부 이미지" style="max-width:100%;border-radius:8px;margin:8px 0;"/><br/>`);
    setImageModalOpen(false);
    setAttachedSource(source);
  };

  const handleLinkConfirm = () => {
    if (linkUrl && linkUrl !== 'https://') {
      exec('createLink', linkUrl);
      closePanel();
    } else {
      alert('유효한 URL을 입력해주세요.');
    }
  };

  /* ---------- Panel Rendering ---------- */
  const renderBoldPanel = () => (
    <>
      <PanelHeader>
        <PanelTitle>텍스트 서식</PanelTitle>
        <PanelClose onClick={closePanel}><CloseIcon /></PanelClose>
      </PanelHeader>
      <PanelList>
        <PanelListItem style={{ cursor: 'pointer' }} onClick={() => setSubPanel('fontSize')}>
          <PanelListItemLeft>
            <PanelListItemIcon><span style={{ fontWeight: 700, fontSize: 14 }}>TT</span></PanelListItemIcon>
            <PanelListItemLabel>글자 크기</PanelListItemLabel>
          </PanelListItemLeft>
          <PanelListItemRight>
            <PanelListItemValue>{FONT_SIZES.find(f => f.value === selectedFontSize)?.desc ?? '16px'}</PanelListItemValue>
          </PanelListItemRight>
        </PanelListItem>
        <PanelListItem style={{ cursor: 'pointer' }} onClick={() => setSubPanel('fontColor')}>
          <PanelListItemLeft>
            <PanelListItemIcon><span>A</span></PanelListItemIcon>
            <PanelListItemLabel>글자 색상</PanelListItemLabel>
          </PanelListItemLeft>
          <PanelListItemRight><ColorDot $color={fontColor} /></PanelListItemRight>
        </PanelListItem>
        <PanelListItem style={{ cursor: 'pointer' }} onClick={() => setSubPanel('highlighter')}>
          <PanelListItemLeft>
            <PanelListItemIcon><span>🖍</span></PanelListItemIcon>
            <PanelListItemLabel>하이라이터</PanelListItemLabel>
          </PanelListItemLeft>
          <PanelListItemRight>
            <ColorDot $color={highlightColor} $bordered={highlightColor === 'transparent'} />
          </PanelListItemRight>
        </PanelListItem>
      </PanelList>
      <AlignmentRow>
        <AlignBtn $active={align === 'left'} onClick={() => applyAlign('left')}><AlignLeftIcon /></AlignBtn>
        <AlignBtn $active={align === 'center'} onClick={() => applyAlign('center')}><AlignCenterIcon /></AlignBtn>
        <AlignBtn $active={align === 'right'} onClick={() => applyAlign('right')}><AlignRightIcon /></AlignBtn>
      </AlignmentRow>
    </>
  );

  const renderFontSizeSubPanel = () => (
    <>
      <PanelHeader>
        <PanelTitle>글자 크기</PanelTitle>
        <PanelClose onClick={() => setSubPanel(null)}><CloseIcon /></PanelClose>
      </PanelHeader>
      <FontSizeList>
        {FONT_SIZES.map(f => (
          <FontSizeOption key={f.value} $selected={selectedFontSize === f.value}
            onClick={() => setSelectedFontSize(f.value)}>
            <FontSizeOptionInfo>
              <FontSizeOptionLabel>{f.label}</FontSizeOptionLabel>
              <FontSizeOptionValue>{f.desc}</FontSizeOptionValue>
            </FontSizeOptionInfo>
            <FontSizeRadio $selected={selectedFontSize === f.value} />
          </FontSizeOption>
        ))}
      </FontSizeList>
      <ActionBtn onMouseDown={(e) => { e.preventDefault(); exec('fontSize', selectedFontSize); setSubPanel(null); }}>확인</ActionBtn>
    </>
  );

  const renderFontColorSubPanel = () => (
    <>
      <PanelHeader>
        <PanelTitle>글자 색상</PanelTitle>
        <PanelClose onClick={() => setSubPanel(null)}><CloseIcon /></PanelClose>
      </PanelHeader>
      <ColorPickerGrid $cols={5}>
        {FONT_COLORS.map(c => (
          <ColorCircle key={c} $color={c} $selected={fontColor === c} $isWhite={c === '#FFFFFF'}
            onClick={() => setFontColor(c)} />
        ))}
      </ColorPickerGrid>
      <ActionBtn onMouseDown={(e) => { e.preventDefault(); exec('foreColor', fontColor); setSubPanel(null); }}>확인</ActionBtn>
    </>
  );

  const renderHighlighterSubPanel = () => (
    <>
      <PanelHeader>
        <PanelTitle>하이라이터 색상</PanelTitle>
        <PanelClose onClick={() => setSubPanel(null)}><CloseIcon /></PanelClose>
      </PanelHeader>
      <ColorPickerGrid $cols={4}>
        {HIGHLIGHT_COLORS.map(c => (
          <ColorCircle key={c.code} $color={c.code} $selected={highlightColor === c.code}
            onClick={() => setHighlightColor(c.code)} />
        ))}
      </ColorPickerGrid>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
        <button style={{ background: 'none', border: 'none', color: '#6B7C8D', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
          onMouseDown={(e) => { e.preventDefault(); setHighlightColor('transparent'); execHighlight('#FFFFFF'); setSubPanel(null); }}>하이라이터 지우기</button>
        <ActionBtn style={{ marginTop: 0 }}
          onMouseDown={(e) => { e.preventDefault(); execHighlight(highlightColor); setSubPanel(null); }}>확인</ActionBtn>
      </div>
    </>
  );

  const renderItalicPanel = () => (
    <>
      <PanelHeader>
        <PanelTitle>글자 서식</PanelTitle>
        <PanelClose onClick={closePanel}><CloseIcon /></PanelClose>
      </PanelHeader>
      <PanelList>
        <PanelListItem 
          $interactive 
          onMouseDown={(e) => { e.preventDefault(); exec('italic'); }}
        >
          <PanelListItemLeft>
            <PanelListItemIcon><span style={{ fontStyle: 'italic', fontFamily: 'serif', fontWeight: 700 }}>I</span></PanelListItemIcon>
            <PanelListItemLabel>기울임꼴</PanelListItemLabel>
          </PanelListItemLeft>
          <CustomToggle $checked={activeFormats.italic} />
        </PanelListItem>
        <PanelListItem 
          $interactive 
          onMouseDown={(e) => { e.preventDefault(); exec('underline'); }}
        >
          <PanelListItemLeft>
            <PanelListItemIcon><span style={{ textDecoration: 'underline', fontWeight: 700 }}>U</span></PanelListItemIcon>
            <PanelListItemLabel>밑줄</PanelListItemLabel>
          </PanelListItemLeft>
          <CustomToggle $checked={activeFormats.underline} />
        </PanelListItem>
        <PanelListItem 
          $interactive 
          onMouseDown={(e) => { e.preventDefault(); exec('strikeThrough'); }}
        >
          <PanelListItemLeft>
            <PanelListItemIcon><span style={{ textDecoration: 'line-through', fontWeight: 700 }}>S</span></PanelListItemIcon>
            <PanelListItemLabel>취소선</PanelListItemLabel>
          </PanelListItemLeft>
          <CustomToggle $checked={activeFormats.strikeThrough} />
        </PanelListItem>
      </PanelList>
      <AlignmentRow>
        <AlignBtn $active={align === 'left'} onMouseDown={(e) => { e.preventDefault(); applyAlign('left'); }}><AlignLeftIcon /></AlignBtn>
        <AlignBtn $active={align === 'center'} onMouseDown={(e) => { e.preventDefault(); applyAlign('center'); }}><AlignCenterIcon /></AlignBtn>
        <AlignBtn $active={align === 'right'} onMouseDown={(e) => { e.preventDefault(); applyAlign('right'); }}><AlignRightIcon /></AlignBtn>
      </AlignmentRow>
    </>
  );

  const renderListPanel = () => (
    <>
      <PanelHeader>
        <PanelTitle>리스트 서식</PanelTitle>
        <PanelClose onClick={closePanel}><CloseIcon /></PanelClose>
      </PanelHeader>
      <PanelList>
        <PanelListItem 
          $interactive 
          onMouseDown={(e) => { e.preventDefault(); execList('insertUnorderedList'); }}
        >
          <PanelListItemLeft>
            <PanelListItemIcon><span>•</span></PanelListItemIcon>
            <PanelListItemLabel>불릿 리스트</PanelListItemLabel>
          </PanelListItemLeft>
          <CustomToggle $checked={activeFormats.insertUnorderedList} />
        </PanelListItem>
        <PanelListItem 
          $interactive 
          onMouseDown={(e) => { e.preventDefault(); execList('insertOrderedList'); }}
        >
          <PanelListItemLeft>
            <PanelListItemIcon><span style={{ fontSize: 11, fontWeight: 700 }}>1.</span></PanelListItemIcon>
            <PanelListItemLabel>번호 리스트</PanelListItemLabel>
          </PanelListItemLeft>
          <CustomToggle $checked={activeFormats.insertOrderedList} />
        </PanelListItem>
      </PanelList>
    </>
  );

  const renderLinkPanel = () => (
    <>
      <PanelHeader>
        <PanelTitle>링크 삽입</PanelTitle>
        <PanelClose onClick={closePanel}><CloseIcon /></PanelClose>
      </PanelHeader>
      <LinkFormFields>
        <LinkFormGroup>
          <label>URL</label>
          <input type="text" placeholder="https://..." value={linkUrl} onChange={e => setLinkUrl(e.target.value)} />
        </LinkFormGroup>
      </LinkFormFields>
      <LinkPanelFooter>
        <LinkBtnCancel onClick={closePanel}>취소</LinkBtnCancel>
        <LinkBtnConfirm onClick={handleLinkConfirm}>확인</LinkBtnConfirm>
      </LinkPanelFooter>
    </>
  );

  const renderPanelContent = () => {
    if (subPanel === 'fontSize') return renderFontSizeSubPanel();
    if (subPanel === 'fontColor') return renderFontColorSubPanel();
    if (subPanel === 'highlighter') return renderHighlighterSubPanel();
    if (activePanel === 'bold') return renderBoldPanel();
    if (activePanel === 'italic') return renderItalicPanel();
    if (activePanel === 'list') return renderListPanel();
    if (activePanel === 'link') return renderLinkPanel();
    return null;
  };

  const showPanel = activePanel !== null;

  return (
    <>
      <HeaderContainer>
        <LeftArea>
          <IconButton type="button" aria-label="뒤로가기" onClick={() => navigate(-1)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </IconButton>
          <Logo>SortOne</Logo>
        </LeftArea>
        <RightArea>
          <IconButton type="button" aria-label="검색" onClick={() => navigate('/search')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </IconButton>
          <Avatar onClick={() => navigate('/profile')}>IY</Avatar>
        </RightArea>
      </HeaderContainer>

      <AddContent>
        <TitleInput type="text" placeholder="제목을 입력하세요." maxLength={60}
          value={title} onChange={e => setTitle(e.target.value)} />
        <ContentBox>
          <ContentInput ref={contentRef} contentEditable data-placeholder="내용을 입력하세요."
            onMouseUp={saveSelection} onKeyUp={saveSelection} />
          <SaveBtn onClick={handleSave}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </SaveBtn>
        </ContentBox>
        <AiTagSection>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <AiTagLabel>AI 자동 요약 및 추천 태그</AiTagLabel>
            <CustomToggle $checked={useAi} onClick={() => setUseAi(!useAi)} style={{ cursor: 'pointer' }} />
          </div>
          {useAi && (
            <AiTagList style={{ marginTop: '8px' }}>
              {DEFAULT_TAGS.map((tag, i) => (
                <AiTag key={tag} $tagText={tag} $selected={selectedTags.includes(tag)}
                  onClick={() => toggleTag(tag)}>
                  {tag}
                </AiTag>
              ))}
            </AiTagList>
          )}
        </AiTagSection>
      </AddContent>

      <FormatPanelWrap $show={showPanel}>
        <FormatPanel>
          {renderPanelContent()}
        </FormatPanel>
      </FormatPanelWrap>

      <ToolbarWrap>
        <Toolbar>
          <ToolbarBtn $isActive={activePanel === 'bold'} onMouseDown={saveSelection}
            onClick={() => handleToolbarClick('bold')}>B</ToolbarBtn>
          <ToolbarBtn $isActive={activePanel === 'italic'} onMouseDown={saveSelection}
            onClick={() => handleToolbarClick('italic')}>
            <span style={{ fontStyle: 'italic', fontFamily: 'serif' }}>I</span>
          </ToolbarBtn>
          <ToolbarDivider />
          <ToolbarBtn $isActive={activePanel === 'list'} onMouseDown={saveSelection}
            onClick={() => handleToolbarClick('list')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="9" y1="6" x2="20" y2="6" /><line x1="9" y1="12" x2="20" y2="12" /><line x1="9" y1="18" x2="20" y2="18" />
              <circle cx="4.5" cy="6" r="1" /><circle cx="4.5" cy="12" r="1" /><circle cx="4.5" cy="18" r="1" />
            </svg>
          </ToolbarBtn>
          <ToolbarDivider />
          <ToolbarBtn $isActive={activePanel === 'image'} onMouseDown={saveSelection}
            onClick={() => handleToolbarClick('image')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
            </svg>
          </ToolbarBtn>
          <ToolbarBtn $isActive={activePanel === 'link'} onMouseDown={saveSelection}
            onClick={() => handleToolbarClick('link')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </ToolbarBtn>
        </Toolbar>
      </ToolbarWrap>

      {/* 이미지 첨부 모달 */}
      {imageModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '24px', background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(4px)'
        }} onClick={() => setImageModalOpen(false)}>
          <div style={{
            background: '#fff', borderRadius: '22px', padding: '36px 28px 28px', width: '100%', maxWidth: '300px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'
          }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#2B3A4A', marginBottom: '24px' }}>사진 첨부</h2>
            
            <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <button onClick={() => { handleImageAttach('갤러리'); setImageModalOpen(false); }}
                  style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'linear-gradient(135deg, #C8F5D0 0%, #A8EBB8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(80, 200, 120, 0.25)', marginBottom: '8px' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#35B37E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '26px', height: '26px' }}>
                    <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                  </svg>
                </button>
                <span style={{ fontSize: '12px', color: '#6B7C8D' }}>갤러리</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <button onClick={() => { handleImageAttach('카메라'); setImageModalOpen(false); }}
                  style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'linear-gradient(135deg, #FFD1A9 0%, #FFB680 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(255, 182, 128, 0.25)', marginBottom: '8px' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#E67E22" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '26px', height: '26px' }}>
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" />
                  </svg>
                </button>
                <span style={{ fontSize: '12px', color: '#6B7C8D' }}>카메라</span>
              </div>
            </div>

            <button onClick={() => setImageModalOpen(false)}
              style={{ width: '100%', padding: '15px', borderRadius: '12px', fontSize: '15px', fontWeight: 700, background: 'linear-gradient(135deg, #63D4D9 0%, #4BBFC5 100%)', color: '#fff', boxShadow: '0 6px 18px rgba(75, 191, 197, 0.35)' }}>
              취소
            </button>
          </div>
        </div>
      )}

      {/* 이미지 첨부 완료 모달 */}
      {attachedSource && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '24px', background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(4px)', animation: 'fadeIn 0.2s ease'
        }} onClick={() => setAttachedSource(null)}>
          <div style={{
            background: '#fff', borderRadius: '22px', padding: '36px 28px 28px', width: '100%', maxWidth: '300px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
            animation: 'slideUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#2B3A4A', marginBottom: '24px' }}>사진 첨부 완료</h2>
            <span style={{ fontSize: '12px', color: '#6B7C8D', marginBottom: '24px', lineHeight: '1.5' }}>
              {attachedSource}에서 사진을<br/>성공적으로 첨부했습니다.
            </span>
            <button onClick={() => setAttachedSource(null)}
              style={{ width: '100%', padding: '15px', borderRadius: '12px', fontSize: '15px', fontWeight: 700, background: 'linear-gradient(135deg, #63D4D9 0%, #4BBFC5 100%)', color: '#fff', boxShadow: '0 6px 18px rgba(75, 191, 197, 0.35)', transition: 'all 0.18s ease' }}>
              확인
            </button>
          </div>
        </div>
      )}
    </>
  );
};
