/* ==========================================================================
   SortOne - add.js (메모 작성 화면 로직)
   ========================================================================== */

/**
 * 커스텀 알림 모달 표시
 * 브라우저 기본 alert() 대신 사용하여 도메인 문구 및 스타일 문제를 해결한다.
 * @param {string} message - 표시할 메시지
 * @param {Function} [onConfirm] - 확인 버튼 클릭 시 콜백 (선택)
 */
function showCustomAlert(message, onConfirm) {
  const overlay = document.getElementById('customModalOverlay');
  const msgEl  = document.getElementById('customModalMsg');
  const btnEl  = document.getElementById('customModalConfirm');
  if (!overlay || !msgEl || !btnEl) { alert(message); if (onConfirm) onConfirm(); return; }

  msgEl.textContent = message;
  overlay.classList.add('is-open');

  const close = () => {
    overlay.classList.remove('is-open');
    btnEl.removeEventListener('click', close);
    overlay.removeEventListener('click', onOverlay);
    if (onConfirm) onConfirm();
  };

  const onOverlay = (e) => {
    if (e.target === overlay) close();
  };

  btnEl.addEventListener('click', close);
  overlay.addEventListener('click', onOverlay);
}

/**
 * AI 추천 태그 더미 로직
 * 실제 AI 연동 전까지, 제목/본문의 키워드를 간단히 매칭해서 추천 태그를 뽑아낸다.
 * 매칭되는 키워드가 없으면 기본 추천 태그 세트를 보여준다.
 */
const TAG_KEYWORD_MAP = [
  { keywords: ['프로젝트', '마일스톤', '업무', '회의', '보고', '미팅', '일정', '기획', '계획'], tag: '업무' },
  { keywords: ['성장', '매출', '전략', '목표', '마케팅', '비즈니스', '영업', '브랜딩'], tag: '비지니스 성장' },
  { keywords: ['성과', '결과', 'kpi', '지표', '분석', '데이터', '보고서', '피드백'], tag: '핵심 성과' },
  { keywords: ['아이디어', '기획', '구상', 'ai', '개발', '코드', '기술', '설계', '디자인'], tag: '아이디어' },
  { keywords: ['캠핑', '여행', '취미', '일상', '주말', '영화', '맛집', '운동', '쇼핑'], tag: '개인' },
  { keywords: ['독서', '책', '노트', '메모', '기록', '공부', '학습', '강의', '일기'], tag: '기록' },
  { keywords: ['돈', '예산', '지출', '가계부', '투자', '재테크', '금융', '비용', '결제'], tag: '금융' },
  { keywords: ['건강', '식단', '다이어트', '피트니스', '병원', '약', '처방', '루틴', '감기', '기침', '치료', '의사', '보건'], tag: '건강' },
  { keywords: ['음식', '요리', '식사', '차', '모과차', '커피', '레시피', '디저트', '음료', '간식', '과일', '식재료'], tag: '음식' },
  { keywords: ['가족', '친구', '약속', '모임', '연락', '선물', '경조사', '이벤트'], tag: '네트워킹' },
  { keywords: ['홈', '집', '청소', '정리', '인테리어', '쇼핑리스트', '마트', '장보기'], tag: '라이프' }
];

const DEFAULT_SUGGESTED_TAGS = ['비지니스 성장', '핵심 성과', '아이디어', '건강', '음식', '기록', '금융', '개인'];

/** 태그별 칩 색상 클래스 (디자인 시안의 파랑/핑크/흰색 배지를 순환 배정) */
const CHIP_COLOR_CYCLE = ['ai-tag--blue', 'ai-tag--pink', 'ai-tag--white'];

let selectedTags = [];
let editingMemoId = null;
let suggestDebounceTimer = null;
let checkboxMode = false; // 체크박스 행 자동 연속 삽입 플래그

// contenteditable 선택 영역 저장 변수 및 유틸리티
let savedSelection = null;

function saveSelection() {
  const sel = window.getSelection();
  if (sel.rangeCount > 0) {
    const range = sel.getRangeAt(0);
    const container = document.getElementById('contentInput');
    if (container && container.contains(range.commonAncestorContainer)) {
      savedSelection = range.cloneRange();
    }
  }
}

function restoreSelection() {
  const container = document.getElementById('contentInput');
  if (!container) return;
  container.focus(); // 에디터 영역에 포커스를 주어 명령어 대상을 확보
  
  const sel = window.getSelection();
  if (savedSelection) {
    sel.removeAllRanges();
    sel.addRange(savedSelection);
  } else {
    // 저장된 범위가 없으면 에디터 맨 뒤로 커서 이동
    const range = document.createRange();
    range.selectNodeContents(container);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
    savedSelection = range.cloneRange();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  editingMemoId = params.get('id');

  if (editingMemoId) {
    loadMemoForEdit(editingMemoId);
  } else {
    renderSuggestedTags(DEFAULT_SUGGESTED_TAGS);
  }

  // 뒤로가기 버튼 동작 연결
  const backBtn = document.getElementById('backBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      if (document.referrer) {
        history.back();
      } else {
        window.location.href = 'index.html';
      }
    });
  }

  document.getElementById('titleInput').addEventListener('input', scheduleTagSuggestion);
  document.getElementById('contentInput').addEventListener('input', scheduleTagSuggestion);
  document.getElementById('saveBtn').addEventListener('click', handleSave);

  // 서식 툴바 버튼 상호 배제 및 패널 노출 처리
  document.querySelectorAll('.toolbar__btn[data-format]').forEach((btn) => {
    // mousedown 단계에서 선택 영역 미리 저장 (click 시 포커스가 이동하기 전)
    btn.addEventListener('mousedown', () => {
      saveSelection();
    });

    btn.addEventListener('click', () => {
      const formatType = btn.dataset.format;
      const wasActive = btn.classList.contains('is-active');

      // 모든 버튼 비활성화 및 패널 숨김
      hideFormatPanel();

      if (wasActive) {
        // 이미 활성화된 버튼이었다면 패널 닫고 종료
        return;
      }

      // 새로 켜기
      btn.classList.add('is-active');
      showFormatPanel(formatType);
    });
  });

  // contentInput 내 커서/선택 변경 시 자동 저장
  document.addEventListener('selectionchange', () => {
    const sel = window.getSelection();
    if (!sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    const container = document.getElementById('contentInput');
    if (container && container.contains(range.commonAncestorContainer)) {
      savedSelection = range.cloneRange();
    }
  });

  const contentInput = document.getElementById('contentInput');

  // contenteditable 내 링크 클릭 시 새 탭으로 열기
  contentInput.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href]');
    if (anchor) {
      e.preventDefault();
      window.open(anchor.href, '_blank', 'noopener,noreferrer');
    }
  });

  // 엔터 입력 시 체크박스 모드일 때 다음 줄에 체크박스 자동 삽입
  contentInput.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;

    const sel = window.getSelection();
    if (!sel.rangeCount) return;

    const editor = document.getElementById('contentInput');

    // 커서가 있는 노드를 에디터 직계 자식 레벨까지 탈시
    let node = sel.getRangeAt(0).commonAncestorContainer;
    if (node.nodeType === Node.TEXT_NODE) node = node.parentNode;
    let lineBlock = node;
    while (lineBlock && lineBlock.parentNode !== editor && lineBlock !== editor) {
      lineBlock = lineBlock.parentNode;
    }

    // 에디터 직계 자식 레벨의 행 블록이 체크박스 행인지 확인
    const isCheckboxLine =
      lineBlock &&
      lineBlock !== editor &&
      (lineBlock.dataset.checkboxLine === 'true' ||
       lineBlock.querySelector('input[type="checkbox"]') !== null);

    if (!isCheckboxLine) return; // 체크박스 행이 아니면 기본 엔터로 처리

    e.preventDefault();

    // 커서 위치의 로우 텍스트 유무로 종료/계속 판단
    const lineText = (lineBlock.innerText || lineBlock.textContent || '')
      .replace(/\u00a0/g, '').trim();

    if (lineText === '') {
      // 빈 체크박스 행 → 마크표 제거 후 일반 줄로 변환 (체크박스 모드 종료)
      checkboxMode = false;
      lineBlock.removeAttribute('data-checkbox-line');
      lineBlock.innerHTML = '<br>';
      const newRange = document.createRange();
      newRange.selectNodeContents(lineBlock);
      newRange.collapse(false);
      sel.removeAllRanges();
      sel.addRange(newRange);
    } else {
      // 내용 있는 체크박스 행 → 다음 줄에 새 체크박스 행 삽입
      const newDiv = document.createElement('div');
      newDiv.dataset.checkboxLine = 'true';
      const newCheckbox = document.createElement('input');
      newCheckbox.type = 'checkbox';
      newCheckbox.style.marginRight = '6px';
      newDiv.appendChild(newCheckbox);
      newDiv.appendChild(document.createTextNode('\u00a0'));

      if (lineBlock.nextSibling) {
        editor.insertBefore(newDiv, lineBlock.nextSibling);
      } else {
        editor.appendChild(newDiv);
      }

      // 새 체크박스 직후로 커서 이동
      const newRange = document.createRange();
      newRange.setStartAfter(newCheckbox);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);
    }

    saveSelection();
    scheduleTagSuggestion();
  });
});

/** 기존 메모를 불러와 수정 모드로 채워넣기 */
function loadMemoForEdit(id) {
  const memo = MemoStore.getMemoById(id);
  if (!memo) {
    renderSuggestedTags(DEFAULT_SUGGESTED_TAGS);
    return;
  }
  document.getElementById('titleInput').value = memo.title;
  document.getElementById('contentInput').innerHTML = memo.content;
  selectedTags = [...memo.tags];
  renderSuggestedTags(getSuggestedTagPool(memo.title + ' ' + document.getElementById('contentInput').innerText));
}

/** 입력 중 AI 추천 태그를 디바운스로 갱신 */
function scheduleTagSuggestion() {
  clearTimeout(suggestDebounceTimer);
  suggestDebounceTimer = setTimeout(() => {
    const title = document.getElementById('titleInput').value;
    const content = document.getElementById('contentInput').innerText;
    renderSuggestedTags(getSuggestedTagPool(title + ' ' + content));
  }, 400);
}

/** 텍스트 내 키워드를 매칭해 추천 태그 배열 생성 */
function getSuggestedTagPool(text) {
  const lower = text.toLowerCase();
  const matched = TAG_KEYWORD_MAP.filter((entry) =>
    entry.keywords.some((kw) => lower.includes(kw.toLowerCase()))
  ).map((entry) => entry.tag);

  const unique = [...new Set(matched)];
  return unique.length > 0 ? unique.slice(0, 8) : DEFAULT_SUGGESTED_TAGS;
}

/** AI 추천 태그 칩 렌더링 (선택 토글 가능) */
function renderSuggestedTags(tags) {
  const wrap = document.getElementById('aiTagList');
  wrap.innerHTML = tags
    .map((tag, i) => {
      const colorClass = CHIP_COLOR_CYCLE[i % CHIP_COLOR_CYCLE.length];
      const isSelected = selectedTags.includes(tag);
      return `
        <button
          type="button"
          class="ai-tag ${colorClass} ${isSelected ? 'is-selected' : ''}"
          data-tag="${tag}"
        >${tag}</button>
      `;
    })
    .join('');

  wrap.querySelectorAll('.ai-tag').forEach((btn) => {
    btn.addEventListener('click', () => toggleTag(btn.dataset.tag, btn));
  });
}

function toggleTag(tag, btnEl) {
  if (selectedTags.includes(tag)) {
    selectedTags = selectedTags.filter((t) => t !== tag);
    btnEl.classList.remove('is-selected');
  } else {
    selectedTags.push(tag);
    btnEl.classList.add('is-selected');
  }
}

/** 선택된 태그 중 대표 카테고리(전체/업무/개인/아이디어) 하나를 추론 */
function inferCategory(tags) {
  const CATEGORY_SET = ['업무', '개인', '아이디어'];
  const found = tags.find((t) => CATEGORY_SET.includes(t));
  if (found) return found;

  // 태그의 성격에 따른 카테고리 파생 규칙
  if (tags.some(t => ['건강', '음식', '라이프', '네트워킹', '금융'].includes(t))) {
    return '개인';
  }
  if (tags.some(t => ['비지니스 성장', '핵심 성과'].includes(t))) {
    return '업무';
  }
  if (tags.some(t => ['우선순위'].includes(t))) {
    return '우선순위';
  }
  return '전체';
}

function handleSave() {
  const title = document.getElementById('titleInput').value.trim();
  const contentInput = document.getElementById('contentInput');
  const contentText = contentInput.innerText.trim();
  const content = contentInput.innerHTML.trim();

  if (!title && !contentText) {
    showCustomAlert('제목이나 내용을 입력해주세요.');
    return;
  }

  // 사용자가 수동으로 선택한 태그가 없을 경우 본문과 제목을 실시간 자동 분석하여 태그 부여
  let tagsToSave = [...selectedTags];
  if (tagsToSave.length === 0) {
    const textForAnalysis = (title + ' ' + contentText).toLowerCase();
    const autoTags = [];
    
    TAG_KEYWORD_MAP.forEach((entry) => {
      if (entry.keywords.some((kw) => textForAnalysis.includes(kw.toLowerCase()))) {
        autoTags.push(entry.tag);
      }
    });

    // 중복 제거 및 최대 3개 선별
    tagsToSave = [...new Set(autoTags)].slice(0, 3);

    // 본문 분석을 통해서도 태그가 아예 안 잡힐 경우, 범용적인 '기록'을 기본 자동 태그로 안전하게 부여
    if (tagsToSave.length === 0) {
      tagsToSave = ['기록'];
    }
  }

  const memoData = {
    title: title || '제목 없음',
    content,
    tags: tagsToSave,
    category: inferCategory(tagsToSave)
  };

  if (editingMemoId) {
    MemoStore.updateMemo(editingMemoId, memoData);
  } else {
    MemoStore.addMemo(memoData);
  }

  window.location.href = 'index.html';
}

/* ==========================================================================
   서식 팝업/패널 동적 렌더링 및 인터랙션 로직
   ========================================================================== */

// 서식 설정 상태 저장소
const formatState = {
  fontSize: '16px',
  fontColor: '#2B3A4A',
  highlightColor: 'transparent',
  italic: false,
  underline: false,
  strike: false,
  bulletList: true,
  numList: false,
  checkbox: false,
  align: 'left' // 'left' | 'center' | 'right'
};

// 공통 SVG 아이콘 정의
const SVGS = {
  close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
  alignLeft: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="17" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="17" y1="18" x2="3" y2="18"></line></svg>`,
  alignCenter: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="10" x2="6" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="18" y1="18" x2="6" y2="18"></line></svg>`,
  alignRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="21" y1="10" x2="7" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="21" y1="18" x2="7" y2="18"></line></svg>`,
  indentLeft: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 17 4 12 9 7"></polyline><line x1="20" y1="18" x2="14" y2="18"></line><line x1="20" y1="12" x2="11" y2="12"></line><line x1="20" y1="6" x2="14" y2="6"></line></svg>`,
  indentRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 17 20 12 15 7"></polyline><line x1="4" y1="18" x2="10" y2="18"></line><line x1="4" y1="12" x2="13" y2="12"></line><line x1="4" y1="6" x2="10" y2="6"></line></svg>`,
  gallery: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`,
  camera: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>`,
  info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`
};

/** 서식 패널 비활성화 */
function hideFormatPanel() {
  const panel = document.getElementById('formatPanel');
  panel.classList.remove('is-active');
  panel.innerHTML = '';
  document.querySelectorAll('.toolbar__btn').forEach((b) => b.classList.remove('is-active'));
}

/** 서식 패널 열기 및 렌더링 */
function showFormatPanel(type) {
  const panel = document.getElementById('formatPanel');
  panel.innerHTML = '';
  panel.classList.add('is-active');

  switch (type) {
    case 'bold':
      renderTextStylePanel(panel);
      break;
    case 'italic':
      renderItalicStylePanel(panel);
      break;
    case 'list':
      renderListStylePanel(panel);
      break;
    case 'image':
      renderImagePanel(panel);
      break;
    case 'link':
      renderLinkPanel(panel);
      break;
  }
}

/* ---------- 1. 텍스트 스타일 패널 (Bold 클릭 시) ---------- */
function renderTextStylePanel(panel) {
  panel.innerHTML = `
    <div class="format-panel__header">
      <span class="format-panel__title">텍스트 스타일</span>
      <button class="format-panel__close" type="button">${SVGS.close}</button>
    </div>
    <div class="format-panel__list">
      <button class="format-panel__list-item" type="button" id="goFontSize">
        <div class="format-panel__list-item-left">
          <span class="format-panel__list-item-icon" style="font-weight:700;font-size:14px;">TT</span>
          <span class="format-panel__list-item-label">글자 크기</span>
        </div>
        <div class="format-panel__list-item-right">
          <span class="format-panel__list-item-value">${formatState.fontSize}</span>
        </div>
      </button>
      <button class="format-panel__list-item" type="button" id="goFontColor">
        <div class="format-panel__list-item-left">
          <span class="format-panel__list-item-icon">🎨</span>
          <span class="format-panel__list-item-label">글자 색상</span>
        </div>
        <div class="format-panel__list-item-right">
          <span class="color-dot" style="background-color: ${formatState.fontColor}"></span>
        </div>
      </button>
      <button class="format-panel__list-item" type="button" id="goHighlighter">
        <div class="format-panel__list-item-left">
          <span class="format-panel__list-item-icon">✏️</span>
          <span class="format-panel__list-item-label">형광펜</span>
        </div>
        <div class="format-panel__list-item-right">
          <span class="color-dot ${formatState.highlightColor === 'transparent' ? 'color-dot--bordered' : ''}" style="background-color: ${formatState.highlightColor}"></span>
        </div>
      </button>
    </div>
    <div class="format-panel__alignment-row">
      <button class="alignment-btn ${formatState.align === 'left' ? 'is-active' : ''}" type="button" data-align="left">${SVGS.alignLeft}</button>
      <button class="alignment-btn ${formatState.align === 'center' ? 'is-active' : ''}" type="button" data-align="center">${SVGS.alignCenter}</button>
      <button class="alignment-btn ${formatState.align === 'right' ? 'is-active' : ''}" type="button" data-align="right">${SVGS.alignRight}</button>
    </div>
  `;

  // 이벤트 바인딩
  panel.querySelector('.format-panel__close').addEventListener('click', hideFormatPanel);
  
  document.getElementById('goFontSize').addEventListener('click', () => renderFontSizeSubpanel(panel));
  document.getElementById('goFontColor').addEventListener('click', () => renderFontColorSubpanel(panel));
  document.getElementById('goHighlighter').addEventListener('click', () => renderHighlighterSubpanel(panel));

  panel.querySelectorAll('.alignment-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      panel.querySelectorAll('.alignment-btn').forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      formatState.align = btn.dataset.align;
      // 실시간 본문 정렬 적용 (퍼블리싱 체감용)
      document.getElementById('contentInput').style.textAlign = formatState.align;
    });
  });
}

/* ---------- 2. 글자 스타일 패널 (Italic 클릭 시) ---------- */
function renderItalicStylePanel(panel) {
  restoreSelection();
  const isItalic = document.queryCommandState('italic');
  const isUnderline = document.queryCommandState('underline');
  const isStrike = document.queryCommandState('strikeThrough');
  const isLeft = document.queryCommandState('justifyLeft') || (!document.queryCommandState('justifyCenter') && !document.queryCommandState('justifyRight'));
  const isCenter = document.queryCommandState('justifyCenter');
  const isRight = document.queryCommandState('justifyRight');

  panel.innerHTML = `
    <div class="format-panel__header">
      <span class="format-panel__title">글자 스타일</span>
      <button class="format-panel__close" type="button">${SVGS.close}</button>
    </div>
    <div class="format-panel__list">
      <div class="format-panel__list-item">
        <div class="format-panel__list-item-left">
          <span class="format-panel__list-item-icon" style="font-style:italic; font-family:serif; font-weight:700;">I</span>
          <span class="format-panel__list-item-label">기울임꼴</span>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" id="toggleItalic" class="toggle-switch__input" ${isItalic ? 'checked' : ''} />
          <span class="toggle-switch__slider"></span>
        </label>
      </div>
      <div class="format-panel__list-item">
        <div class="format-panel__list-item-left">
          <span class="format-panel__list-item-icon" style="text-decoration:underline; font-weight:700;">U</span>
          <span class="format-panel__list-item-label">밑줄</span>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" id="toggleUnderline" class="toggle-switch__input" ${isUnderline ? 'checked' : ''} />
          <span class="toggle-switch__slider"></span>
        </label>
      </div>
      <div class="format-panel__list-item">
        <div class="format-panel__list-item-left">
          <span class="format-panel__list-item-icon" style="text-decoration:line-through; font-weight:700;">S</span>
          <span class="format-panel__list-item-label">취소선</span>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" id="toggleStrike" class="toggle-switch__input" ${isStrike ? 'checked' : ''} />
          <span class="toggle-switch__slider"></span>
        </label>
      </div>
    </div>
    <div class="format-panel__alignment-row">
      <button class="alignment-btn ${isLeft ? 'is-active' : ''}" type="button" data-align="left">${SVGS.alignLeft}</button>
      <button class="alignment-btn ${isCenter ? 'is-active' : ''}" type="button" data-align="center">${SVGS.alignCenter}</button>
      <button class="alignment-btn ${isRight ? 'is-active' : ''}" type="button" data-align="right">${SVGS.alignRight}</button>
    </div>
  `;

  panel.querySelector('.format-panel__close').addEventListener('click', hideFormatPanel);

  // 토글 스위치 동작 바인딩
  document.getElementById('toggleItalic').addEventListener('change', () => {
    restoreSelection();
    document.execCommand('italic', false, null);
  });

  document.getElementById('toggleUnderline').addEventListener('change', () => {
    restoreSelection();
    document.execCommand('underline', false, null);
  });

  document.getElementById('toggleStrike').addEventListener('change', () => {
    restoreSelection();
    document.execCommand('strikeThrough', false, null);
  });

  panel.querySelectorAll('.alignment-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      panel.querySelectorAll('.alignment-btn').forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const alignVal = btn.dataset.align;
      restoreSelection();
      document.execCommand('justify' + alignVal.charAt(0).toUpperCase() + alignVal.slice(1), false, null);
    });
  });
}

/** 선택 영역의 상위 태그를 탐색해 현재 리스트 형태(ol, ul, checkbox) 반환 */
function getActiveListType() {
  const sel = window.getSelection();
  if (!sel.rangeCount) return null;
  
  let node = sel.getRangeAt(0).commonAncestorContainer;
  const editor = document.getElementById('contentInput');
  
  // 1. 현재 행 내부에 체크박스가 존재하는지 검사
  let tempNode = node;
  while (tempNode && tempNode !== editor) {
    if (tempNode.nodeType === Node.ELEMENT_NODE) {
      if (tempNode.querySelector('input[type="checkbox"]') || tempNode.tagName === 'INPUT') {
        return 'checkbox';
      }
    }
    tempNode = tempNode.parentNode;
  }
  
  // 2. UL, OL 리스트 노드 검사
  while (node && node !== editor) {
    if (node.tagName === 'LI') {
      const parent = node.parentNode;
      if (parent && parent.tagName === 'OL') return 'ol';
      if (parent && parent.tagName === 'UL') return 'ul';
    }
    node = node.parentNode;
  }
  return null;
}

/** 현재 활성화된 리스트를 빠져나와 그 다음에 새 문단을 생성하고 포커싱 */
function exitCurrentList() {
  const sel = window.getSelection();
  if (!sel.rangeCount) return;
  
  let node = sel.getRangeAt(0).commonAncestorContainer;
  const editor = document.getElementById('contentInput');
  
  // 부모 리스트 태그(UL 또는 OL) 찾기
  let listEl = null;
  while (node && node !== editor) {
    if (node.tagName === 'UL' || node.tagName === 'OL') {
      listEl = node;
      break;
    }
    node = node.parentNode;
  }
  
  if (listEl) {
    // 리스트 태그 다음에 위치할 새 줄 엘리먼트 생성
    const newLine = document.createElement('div');
    newLine.innerHTML = '<br>';
    
    if (listEl.nextSibling) {
      editor.insertBefore(newLine, listEl.nextSibling);
    } else {
      editor.appendChild(newLine);
    }
    
    // 새 줄 내부로 커서 이동
    const range = document.createRange();
    range.selectNodeContents(newLine);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
    
    saveSelection();
  }
}

/**
 * 현재 커서가 있는 UL/OL 전체를 선택 영역으로 설정한다.
 * execCommand 가 전체 리스트가 아닌 한 항목에만 적용되는 문제를 방지한다.
 */
function selectWholeList() {
  const editor = document.getElementById('contentInput');
  const sel = window.getSelection();
  if (!sel.rangeCount) return;

  let node = sel.getRangeAt(0).commonAncestorContainer;
  if (node.nodeType === Node.TEXT_NODE) node = node.parentNode;

  while (node && node !== editor) {
    if (node.tagName === 'UL' || node.tagName === 'OL') {
      const range = document.createRange();
      range.selectNodeContents(node);
      sel.removeAllRanges();
      sel.addRange(range);
      savedSelection = range.cloneRange();
      return;
    }
    node = node.parentNode;
  }
}

/* ---------- 3. 리스트 스타일 패널 (List 클릭 시) ---------- */
function renderListStylePanel(panel) {
  restoreSelection();
  const listType = getActiveListType();
  const isBullet = listType === 'ul';
  const isNum = listType === 'ol';
  const isCheckbox = listType === 'checkbox';

  panel.innerHTML = `
    <div class="format-panel__header">
      <span class="format-panel__title">리스트 스타일</span>
      <button class="format-panel__close" type="button">${SVGS.close}</button>
    </div>
    <div class="format-panel__list">
      <div class="format-panel__list-item">
        <div class="format-panel__list-item-left">
          <span class="format-panel__list-item-icon">⚫</span>
          <span class="format-panel__list-item-label">볼렛 리스트</span>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" id="toggleBullet" class="toggle-switch__input" ${isBullet ? 'checked' : ''} />
          <span class="toggle-switch__slider"></span>
        </label>
      </div>
      <div class="format-panel__list-item">
        <div class="format-panel__list-item-left">
          <span class="format-panel__list-item-icon" style="font-size:11px; font-weight:700;">1.</span>
          <span class="format-panel__list-item-label">번호 리스트</span>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" id="toggleNumList" class="toggle-switch__input" ${isNum ? 'checked' : ''} />
          <span class="toggle-switch__slider"></span>
        </label>
      </div>
      <div class="format-panel__list-item">
        <div class="format-panel__list-item-left">
          <span class="format-panel__list-item-icon">☑️</span>
          <span class="format-panel__list-item-label">체크박스</span>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" id="toggleCheckbox" class="toggle-switch__input" ${isCheckbox ? 'checked' : ''} />
          <span class="toggle-switch__slider"></span>
        </label>
      </div>
    </div>
    <div class="format-panel__alignment-row" style="justify-content: space-around;">
      <button class="indent-btn" type="button" id="btnIndentLeft">
        ${SVGS.indentLeft}
        <span>들여쓰기</span>
      </button>
      <button class="indent-btn" type="button" id="btnIndentRight">
        ${SVGS.indentRight}
        <span>내어쓰기</span>
      </button>
    </div>
  `;

  panel.querySelector('.format-panel__close').addEventListener('click', hideFormatPanel);

  const bToggle = document.getElementById('toggleBullet');
  const nToggle = document.getElementById('toggleNumList');
  const cToggle = document.getElementById('toggleCheckbox');

  bToggle.addEventListener('change', () => {
    if (!bToggle.checked) return; // OFF → 기존 내용 그대로 유지, 아무것도 하지 않음
    restoreSelection();
    selectWholeList();
    const listType = getActiveListType();
    if (listType === 'ol') {
      exitCurrentList();
    }
    document.execCommand('insertUnorderedList', false, null);
  });

  nToggle.addEventListener('change', () => {
    if (!nToggle.checked) return; // OFF → 기존 내용 그대로 유지, 아무것도 하지 않음
    restoreSelection();
    selectWholeList();
    const listType = getActiveListType();
    if (listType === 'ul') {
      exitCurrentList();
    }
    document.execCommand('insertOrderedList', false, null);
  });

  cToggle.addEventListener('change', (e) => {
    if (e.target.checked) {
      // 체크박스 모드 활성화: DOM API로 체크박스 행 직접 삽입
      checkboxMode = true;

      const editor = document.getElementById('contentInput');
      restoreSelection();
      const sel = window.getSelection();

      // 현재 커서 위치의 엔디터 직계 자식 행 블록 찾기
      let anchor = null;
      if (sel.rangeCount > 0) {
        let node = sel.getRangeAt(0).commonAncestorContainer;
        if (node.nodeType === Node.TEXT_NODE) node = node.parentNode;
        let block = node;
        while (block && block.parentNode !== editor && block !== editor) {
          block = block.parentNode;
        }
        if (block && block !== editor) anchor = block;
      }

      // 체크박스 행 div 생성
      const newDiv = document.createElement('div');
      newDiv.dataset.checkboxLine = 'true';
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.style.marginRight = '6px';
      newDiv.appendChild(cb);
      newDiv.appendChild(document.createTextNode('\u00a0'));

      // 커서 위치 다음에 삽입, 없으면 마지막에 추가
      if (anchor && anchor.nextSibling) {
        editor.insertBefore(newDiv, anchor.nextSibling);
      } else {
        editor.appendChild(newDiv);
      }

      // 체크박스 다음으로 커서 이동
      const newRange = document.createRange();
      newRange.setStartAfter(cb);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);
      saveSelection();

    } else {
      // 체크박스 모드 OFF → 이후 Enter 시 체크박스 자동 삽입만 중단, 기존 항목 유지
      checkboxMode = false;
    }
  });

  // 들여쓰기/내어쓰기 동작 바인딩
  document.getElementById('btnIndentLeft').addEventListener('click', () => {
    restoreSelection();
    document.execCommand('indent', false, null);
  });

  document.getElementById('btnIndentRight').addEventListener('click', () => {
    restoreSelection();
    document.execCommand('outdent', false, null);
  });
}

/* ---------- 4. 글자 크기 하위 패널 (텍스트 스타일 내부 진입) ---------- */
function renderFontSizeSubpanel(panel) {
  const sizes = [
    { label: '작게 (Small)', value: '2' }, // 12px
    { label: '보통 (Regular)', value: '3' }, // 16px
    { label: '중간 (Medium)', value: '4' }, // 20px
    { label: '크게 (Large)', value: '5' }, // 24px
    { label: '아주 크게 (X-Large)', value: '6' } // 32px
  ];

  let selectedSize = '3'; // Default 'Regular'

  panel.innerHTML = `
    <div class="format-panel__header">
      <span class="format-panel__title">글자 크기</span>
      <button class="format-panel__close" type="button">${SVGS.close}</button>
    </div>
    <div class="font-size-list">
      ${sizes.map((s) => `
        <button class="font-size-option ${s.value === selectedSize ? 'is-selected' : ''}" type="button" data-size="${s.value}">
          <div class="font-size-option__info">
            <span class="font-size-option__label">${s.label}</span>
          </div>
          <div class="font-size-option__radio"></div>
        </button>
      `).join('')}
    </div>
    <button class="format-panel__action-btn" type="button" id="btnApplyFontSize">적용</button>
  `;

  panel.querySelector('.format-panel__close').addEventListener('click', () => renderTextStylePanel(panel));

  panel.querySelectorAll('.font-size-option').forEach((opt) => {
    opt.addEventListener('click', () => {
      panel.querySelectorAll('.font-size-option').forEach((o) => o.classList.remove('is-selected'));
      opt.classList.add('is-selected');
      selectedSize = opt.dataset.size;
    });
  });

  document.getElementById('btnApplyFontSize').addEventListener('click', () => {
    restoreSelection();
    document.execCommand('fontSize', false, selectedSize);
    renderTextStylePanel(panel);
  });
}

/* ---------- 5. 글자 색상 하위 패널 (텍스트 스타일 내부 진입) ---------- */
function renderFontColorSubpanel(panel) {
  const colors = [
    '#1A1A1A', '#7F7F7F', '#3F3F3F', '#50B8E7', '#8EC0E4',
    '#6355E6', '#9E8FF6', '#FFA8A8', '#A8E2E6', '#BBE2BD'
  ];

  let selectedColor = formatState.fontColor;

  panel.innerHTML = `
    <div class="format-panel__header">
      <span class="format-panel__title">글자 색상</span>
      <button class="format-panel__close" type="button">${SVGS.close}</button>
    </div>
    <div class="color-picker-grid">
      ${colors.map((c) => `
        <button class="color-circle ${c === selectedColor ? 'is-selected' : ''} ${c === '#FFFFFF' ? 'color-circle--white' : ''}" 
                type="button" 
                style="background-color: ${c}" 
                data-color="${c}"></button>
      `).join('')}
    </div>
    <button class="format-panel__action-btn" type="button" id="btnApplyFontColor">확인</button>
  `;

  panel.querySelector('.format-panel__close').addEventListener('click', () => renderTextStylePanel(panel));

  panel.querySelectorAll('.color-circle').forEach((circle) => {
    circle.addEventListener('click', () => {
      panel.querySelectorAll('.color-circle').forEach((c) => c.classList.remove('is-selected'));
      circle.classList.add('is-selected');
      selectedColor = circle.dataset.color;
    });
  });

  document.getElementById('btnApplyFontColor').addEventListener('click', () => {
    formatState.fontColor = selectedColor;
    restoreSelection();
    document.execCommand('foreColor', false, selectedColor);
    renderTextStylePanel(panel);
  });
}

/* ---------- 6. 형광펜 색상 하위 패널 (텍스트 스타일 내부 진입) ---------- */
function renderHighlighterSubpanel(panel) {
  const colors = [
    { name: 'yellow', code: '#FFF27F' },
    { name: 'lime', code: '#CCFF66' },
    { name: 'pink', code: '#FF7FA5' },
    { name: 'cyan', code: '#7FDDFF' },
    { name: 'orange', code: '#FFC47F' },
    { name: 'purple', code: '#DF7FFF' },
    { name: 'teal', code: '#7FFFF0' },
    { name: 'lavender', code: '#C0B3FF' }
  ];

  let selectedHighlight = formatState.highlightColor;

  panel.innerHTML = `
    <div class="format-panel__header">
      <span class="format-panel__title">형광펜 색상</span>
      <button class="format-panel__close" type="button">${SVGS.close}</button>
    </div>
    <div class="color-picker-grid" style="grid-template-columns: repeat(4, 1fr); gap: 16px;">
      ${colors.map((c) => `
        <button class="highlighter-circle ${c.code === selectedHighlight ? 'is-selected' : ''}" 
                type="button" 
                style="background-color: ${c.code}" 
                data-color="${c.code}"></button>
      `).join('')}
    </div>
    <div style="display:flex; justify-content: space-between; align-items:center; margin-top:10px;">
      <button id="btnClearHighlight" type="button" style="background:none; border:none; color:var(--color-text-sub); font-size:12px; font-weight:700; cursor:pointer;">형광펜 지우기</button>
      <button class="format-panel__action-btn" type="button" id="btnApplyHighlighter" style="margin-top:0;">확인</button>
    </div>
  `;

  panel.querySelector('.format-panel__close').addEventListener('click', () => renderTextStylePanel(panel));

  panel.querySelectorAll('.highlighter-circle').forEach((circle) => {
    circle.addEventListener('click', () => {
      panel.querySelectorAll('.highlighter-circle').forEach((c) => c.classList.remove('is-selected'));
      circle.classList.add('is-selected');
      selectedHighlight = circle.dataset.color;
    });
  });

  document.getElementById('btnClearHighlight').addEventListener('click', () => {
    selectedHighlight = 'transparent';
    formatState.highlightColor = selectedHighlight;
    restoreSelection();
    if (!document.execCommand('hiliteColor', false, '#FFFFFF')) {
      document.execCommand('backColor', false, '#FFFFFF');
    }
    renderTextStylePanel(panel);
  });

  document.getElementById('btnApplyHighlighter').addEventListener('click', () => {
    formatState.highlightColor = selectedHighlight;
    restoreSelection();
    if (!document.execCommand('hiliteColor', false, selectedHighlight)) {
      document.execCommand('backColor', false, selectedHighlight);
    }
    renderTextStylePanel(panel);
  });
}

/* ---------- 7. 이미지 추가 패널 (이미지 첨부 클릭 시) ---------- */
function renderImagePanel(panel) {
  panel.innerHTML = `
    <div class="format-panel__header">
      <span class="format-panel__title">이미지 추가</span>
      <button class="format-panel__close" type="button">${SVGS.close}</button>
    </div>
    <div class="image-option-list">
      <button class="image-option-item" type="button" id="btnGallerySelect">
        <div class="image-option-icon-wrap">${SVGS.gallery}</div>
        <div class="image-option-info">
          <span class="image-option-title">갤러리에서 선택</span>
          <span class="image-option-desc">앨범에서 원하는 사진들을 불러옵니다</span>
        </div>
      </button>
      <button class="image-option-item" type="button" id="btnCameraCapture">
        <div class="image-option-icon-wrap">${SVGS.camera}</div>
        <div class="image-option-info">
          <span class="image-option-title">카메라로 촬영</span>
          <span class="image-option-desc">지금 바로 사진을 찍어 추가합니다</span>
        </div>
      </button>
    </div>
    <div class="info-box">
      <div class="info-box-icon">${SVGS.info}</div>
      <div class="info-box-text">
        최대 5장의 이미지를 메모에 첨부할 수 있습니다.<br />
        AI 요약 기능이 이미지를 분석하여 내용을 태그해 줍니다.
      </div>
    </div>
  `;

  panel.querySelector('.format-panel__close').addEventListener('click', hideFormatPanel);

  const handleImageAttach = (source) => {
    const randomImgId = Math.floor(Math.random() * 1000);
    const mockImageUrl = `https://picsum.photos/id/${randomImgId}/600/400`;
    insertTextAtCursor(`<br /><img src="${mockImageUrl}" alt="첨부 이미지" style="max-width:100%; border-radius: var(--radius-m); margin: 8px 0;" /><br />`);
    showCustomAlert(`${source}에서 사진을 첨부하였습니다.`);
    hideFormatPanel();
  };

  document.getElementById('btnGallerySelect').addEventListener('click', () => handleImageAttach('갤러리'));
  document.getElementById('btnCameraCapture').addEventListener('click', () => handleImageAttach('카메라'));
}

/* ---------- 8. 링크 삽입 패널 (링크 첨부 클릭 시) ---------- */
function renderLinkPanel(panel) {
  panel.innerHTML = `
    <div class="format-panel__header">
      <span class="format-panel__title">링크 삽입</span>
      <button class="format-panel__close" type="button">${SVGS.close}</button>
    </div>
    <div class="link-form-fields">
      <div class="link-form-group">
        <label for="linkUrl">URL</label>
        <input type="text" id="linkUrl" placeholder="https://..." value="https://" />
      </div>
    </div>
    <div class="link-panel-footer">
      <button class="link-cancel-btn" type="button" id="btnCancelLink">취소</button>
      <button class="link-confirm-btn" type="button" id="btnConfirmLink">확인</button>
    </div>
  `;

  panel.querySelector('.format-panel__close').addEventListener('click', hideFormatPanel);
  document.getElementById('btnCancelLink').addEventListener('click', hideFormatPanel);

  document.getElementById('btnConfirmLink').addEventListener('click', () => {
    const url = document.getElementById('linkUrl').value.trim();
    if (url && url !== 'https://') {
      insertTextAtCursor(`<a href="${url}" target="_blank" style="color:var(--color-primary); text-decoration:underline;">${url}</a>`);
      hideFormatPanel();
    } else {
      showCustomAlert('유효한 URL 주소를 입력해주세요.');
    }
  });
}

/** contenteditable 용 커서 위치 텍스트/HTML 삽입 함수 */
function insertTextAtCursor(textBefore, textAfter = '') {
  restoreSelection();
  const sel = window.getSelection();
  const selectedText = sel.toString();
  const html = textBefore + selectedText + textAfter;
  
  // 브라우저 네이티브 개체 삽입 기능을 이용하여 유실 없는 커서 기반 삽입 실행
  document.execCommand('insertHTML', false, html);
  
  saveSelection();
  scheduleTagSuggestion();
}

/** 간단한 XSS 방지용 이스케이프 */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

/** 글자색상, 형광펜, 마크다운 태그를 실제 스타일로 파싱하여 렌더링 */
function renderContentHtml(content) {
  if (!content) return '';

  const placeholders = [];
  let parsed = content;
  
  // 1. 색상 및 형광펜 HTML 허용 (span, u, b, i, a, img, ul, ol, li 태그 보존)
  parsed = parsed.replace(/(<span\s+style="[^"]*">|<\/span>|<u>|<\/u>|<i>|<\/i>|<b>|<\/b>|<strong>|<\/strong>|<a\s+[^>]*>|<\/a>|<img\s+[^>]*>|<ul>|<\/ul>|<ol>|<\/ol>|<li>|<\/li>)/gi, (match) => {
    placeholders.push(match);
    return `__SAFE_TAG_PLACEHOLDER_${placeholders.length - 1}__`;
  });
  
  // XSS 방지를 위한 일반 텍스트 이스케이프
  parsed = escapeHtml(parsed);
  
  // 보존된 태그 복구
  parsed = parsed.replace(/__SAFE_TAG_PLACEHOLDER_(\d+)__/g, (match, index) => {
    return placeholders[parseInt(index, 10)];
  });

  // 2. 마크다운 문법 적용
  // Bold: **text** -> <strong>text</strong>
  parsed = parsed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Italic: *text* -> <em>text</em>
  parsed = parsed.replace(/\*(.*?)\*/g, '<em>$1</em>');
  // Strikethrough: ~~text~~ -> <del>text</del>
  parsed = parsed.replace(/~~(.*?)~~/g, '<del>$1</del>');
  
  return parsed;
}
