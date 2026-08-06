/* ==========================================================================
   SortOne - ai.js (AI 자동분류 상세 / Ai 탭 화면 로직)
   ========================================================================== */

const weeklyInsight = {
  label: 'WEEKLY INSIGHT',
  title: '이번 주의 핵심 통찰',
  descParts: [
    { text: '프로젝트 관리와 효율적 소통이 업무 생산성을 ', highlight: false },
    { text: '15%', highlight: true },
    { text: ' 향상시켰습니다.', highlight: false }
  ],
  analysisEfficiency: '+12%'
};

// 로컬 저장소 키
const CHECKED_ACTIONS_KEY = 'sortone_checked_actions';
const HIDDEN_ANALYSIS_KEY = 'sortone_hidden_analysis';
const HIDDEN_ACTIONS_KEY = 'sortone_hidden_actions';

// 분석현황 정렬 기준 (latest / oldest / inprogress / done)
let analysisSortMode = 'latest';

// 확장 상태 변수
let isAnalysisExpanded = false;
let isActionExpanded = false;

/**
 * 메모 기반 실시간 AI 분석 현황 동적 로드
 */
function getDynamicAnalysisStatus() {
  const memos = MemoStore.getAllMemos();
  
  // 로컬저장소에서 숨겨진(삭제된) 분석 카드 ID 조회
  let hiddenIds = [];
  try {
    const raw = localStorage.getItem(HIDDEN_ANALYSIS_KEY);
    hiddenIds = raw ? JSON.parse(raw) : [];
  } catch (e) {}

  // 숨김 처리된 메모는 필터링하여 제외
  const visibleMemos = memos.filter(m => !hiddenIds.includes(m.id));

  if (visibleMemos.length === 0) {
    return [
      { id: 'empty', label: '작성된 메모가 없습니다.', value: '대기', isDone: false }
    ];
  }

  const nowMs = Date.now();

  let result = visibleMemos.map((memo) => {
    const updateTime = new Date(memo.updatedAt).getTime();
    const isRecentlyUpdated = (nowMs - updateTime) < 15000;
    const hasSummary = memo.aiSummary && memo.aiSummary.length > 0;
    const isDone = hasSummary && !isRecentlyUpdated;
    return {
      id: memo.id,
      label: `"${memo.title || '제목 없음'}"`,
      value: isDone ? '완료' : '분석중 (85%)',
      isDone: isDone,
      createdAt: memo.createdAt
    };
  });

  // 정렬 모드 적용
  if (analysisSortMode === 'oldest') {
    result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  } else if (analysisSortMode === 'inprogress') {
    result.sort((a, b) => (a.isDone === b.isDone) ? 0 : a.isDone ? 1 : -1);
  } else if (analysisSortMode === 'done') {
    result.sort((a, b) => (a.isDone === b.isDone) ? 0 : a.isDone ? -1 : 1);
  }
  // 기본(latest)은 MemoStore 순서 그대로

  return result;
}

/**
 * 원본 문장에서 핵심 To-do 구문을 지능적으로 추출하는 함수
 * ex) "감기에 좋은 차는 모과차입니다 모과차 하루에 3잔 마시기" → "모과차 3잔 마시기"
 */
function summarizeActionText(sentence, category) {
  const raw = sentence.replace(/[.!?。]/g, '').trim();

  // ── 패턴 1: [명사] [숫자+단위] [동사형]  ex) "모과차 3잔 마시기", "물 2리터 마시기"
  const pattern1 = /(\S{1,8})\s+(\d+\s*(?:잔|병|컵|개|알|캡슐|번|회|분|km|kg|g|ml|L|리터))\s+(마시기|먹기|섭취|복용하기|운동하기|걷기|뛰기|하기|챙기기|복약하기)/;
  const m1 = raw.match(pattern1);
  if (m1) return `${m1[1]} ${m1[2]} ${m1[3]}`;

  // ── 패턴 2: [명사] [하루에/매일] [숫자+단위] [동사형]  ex) "모과차 하루에 3잔 마시기" → "모과차 3잔 마시기"
  const pattern2 = /(\S{1,8})\s+(?:하루에?|매일|매주|매달|아침마다|저녁마다)\s+(\d+\s*(?:잔|번|회|분|km|알|개|ml|L|리터))\s+(\S{1,8}(?:기|음))/;
  const m2 = raw.match(pattern2);
  if (m2) return `${m2[1]} ${m2[2]} ${m2[3]}`; // 명사 + 수량 + 동사 (빈도어 제외)

  // ── 패턴 3: [명사] [동사형]으로 끝나는 마지막 구절  ex) "모과차 마시기", "회의 준비"
  // 동사형 어미 목록
  const actionVerbs = ['마시기', '먹기', '챙기기', '운동하기', '걷기', '뛰기', '읽기', '쓰기', '보기', '연락하기', '보내기', '사기', '만들기', '정리하기', '확인하기'];
  for (const verb of actionVerbs) {
    const idx = raw.lastIndexOf(verb);
    if (idx !== -1) {
      // verb 앞쪽에서 최대 10자 슬라이싱 (공백 기준으로 마지막 1~2 단어)
      const before = raw.slice(0, idx).trim();
      const words = before.split(/\s+/).filter(Boolean);
      const prefix = words.slice(-2).join(' '); // 앞 최대 2단어
      return prefix ? `${prefix} ${verb}` : verb;
    }
  }

  // ── 패턴 4: "준비", "예약", "작성" 등 업무형 키워드를 포함한 마지막 구절 추출
  const workVerbs = [
    { kw: '예약', label: '예약' }, { kw: '회의', label: '회의' }, { kw: '미팅', label: '미팅' },
    { kw: '준비', label: '준비' }, { kw: '작성', label: '작성' }, { kw: '검토', label: '검토' },
    { kw: '계획', label: '계획' }, { kw: '정리', label: '정리' }
  ];
  for (const { kw, label } of workVerbs) {
    const idx = raw.lastIndexOf(kw);
    if (idx !== -1) {
      const before = raw.slice(0, idx).trim();
      const words = before.split(/\s+/).filter(Boolean);
      const subject = words.slice(-1).join(' ');
      return subject ? `${subject} ${label}` : label;
    }
  }

  // ── 폴백: 원문 앞 20자 자르기
  const fallback = raw.replace(/(할\s*것|해야\s*함|하기로|하겠다|합니다|입니다)/g, '').trim();
  if (fallback.length > 20) return fallback.substring(0, 18) + '...';
  return fallback || raw.substring(0, 18);
}

/**
 * 작성된 실제 메모들로부터 행동(To-do)이 필요한 핵심 문장을 실시간으로 자동 추출한다.
 */
function extractActionItemsFromMemos() {
  const memos = MemoStore.getAllMemos();
  const items = [];
  const uniqueTexts = new Set(); // 중복 방지용 셋
  
  // To-do 행동 의지를 나타내는 지표 어구 (생활 습관·루틴·건강 패턴 포함 강화)
  const actionIndicators = [
    // 동사형 지시어
    '하기', '마시기', '먹기', '먹기', '챙기기', '운동하기', '쓰기', '읽기', '보기', '듣기', '가기', '만나기', '연락하기', '보내기', '사기',
    // 의지·계획 어미
    '할 것', '해야 함', '해야', '하기로', '할 예정', '할 계획', '하겠다', '해보기',
    // 업무·활동 키워드
    '준비', '예약', '리스트업', '작성', '검토', '만들기', '계획', '정리', '확인',
    // 생활 루틴·반복 패턴
    '매일', '하루에', '하루 3', '하루 2', '하루 1', '잔', '번씩', '번 마시', '회씩', '알씩', '분씩',
    // 건강·식습관
    '섭취', '복용', '투약', '복약', '챙겨', '꼭 먹', '꼭 마시'
  ];

  memos.forEach((memo) => {
    // HTML 태그 제거 및 텍스트 표준화
    const text = memo.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    if (!text) return;

    // 문장 단위로 분할
    const sentences = text.split(/(?<=[.!?。])\s+|\n+/).map(s => s.trim()).filter(Boolean);

    let memoExtracted = false;

    for (const sentence of sentences) {
      if (memoExtracted) break;

      let isAction = false;
      for (const indicator of actionIndicators) {
        if (sentence.includes(indicator)) {
          isAction = true;
          break;
        }
      }

      if (isAction) {
        let category = 'WORK';
        if (memo.category === '개인') category = 'PERSONAL';
        else if (memo.category === '아이디어') category = 'IDEA';

        const summaryText = summarizeActionText(sentence, category);
        
        if (!uniqueTexts.has(summaryText)) {
          uniqueTexts.add(summaryText);
          items.push({
            id: `extracted-${memo.id}`,
            memoId: memo.id,
            category: category,
            text: summaryText,
            originalSentence: sentence
          });
          memoExtracted = true;
        }
      }
    }
  });

  // 행동 지시어가 본문에 명시되지 않았더라도 최근 등록된 메모가 있다면 기본 실행 항목으로 추출 제안
  if (items.length === 0 && memos.length > 0) {
    memos.slice(0, 2).forEach((memo) => {
      let category = 'WORK';
      if (memo.category === '개인') category = 'PERSONAL';
      else if (memo.category === '아이디어') category = 'IDEA';

      const dummyText = `"${memo.title}" 세부 실행 항목 작성`;
      items.push({
        id: `auto-${memo.id}`,
        memoId: memo.id,
        category: category,
        text: dummyText,
        originalSentence: memo.title
      });
    });
  }

  return items;
}

document.addEventListener('DOMContentLoaded', () => {
  renderInsightCard();
  renderAnalysisList();
  renderActionList();

  document.getElementById('fabAddBtn').addEventListener('click', () => {
    window.location.href = 'add.html';
  });

  // ── 분석현황 ... 드롭다운 토글
  const analysisMoreBtn = document.getElementById('analysisMoreBtn');
  const analysisDropdown = document.getElementById('analysisDropdown');
  analysisMoreBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    analysisDropdown.classList.toggle('is-active');
    document.getElementById('actionDropdown').classList.remove('is-active');
  });

  // 분석현황 정렬/필터/복원 선택
  analysisDropdown.querySelectorAll('.sort-dropdown__item').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const sort = btn.dataset.sort;
      if (sort === 'reset') {
        localStorage.removeItem(HIDDEN_ANALYSIS_KEY);
        isAnalysisExpanded = true; // 복원 시 전체가 보이도록 확장
        showToast('삭제된 항목이 복원되었습니다.');
      } else {
        analysisSortMode = sort;
      }
      analysisDropdown.classList.remove('is-active');
      renderAnalysisList();
    });
  });

  // ── 실행항목 ... 드롭다운 토글
  const actionMoreBtn = document.getElementById('actionMoreBtn');
  const actionDropdown = document.getElementById('actionDropdown');
  actionMoreBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    actionDropdown.classList.toggle('is-active');
    analysisDropdown.classList.remove('is-active');
  });

  // 실행항목 드롭다운 액션
  actionDropdown.querySelectorAll('.sort-dropdown__item').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const action = btn.dataset.action;
      if (action === 'reset-hidden') {
        localStorage.removeItem(HIDDEN_ACTIONS_KEY);
        isActionExpanded = true; // 복원 시 전체가 보이도록 확장
        showToast('삭제된 항목이 복원되었습니다.');
      } else if (action === 'reset-checked') {
        localStorage.removeItem(CHECKED_ACTIONS_KEY);
        isActionExpanded = true;
        showToast('완료 항목이 초기화되었습니다.');
      }
      actionDropdown.classList.remove('is-active');
      renderActionList();
    });
  });

  // 드롭다운 외부 클릭 시 닫기
  document.addEventListener('click', () => {
    analysisDropdown.classList.remove('is-active');
    actionDropdown.classList.remove('is-active');
  });
});

/** Weekly Insight 카드 렌더링 (메모 개수는 실제 데이터로 계산) */
function renderInsightCard() {
  document.getElementById('insightLabel').textContent = weeklyInsight.label;
  document.getElementById('insightTitle').textContent = weeklyInsight.title;

  const descEl = document.getElementById('insightDesc');
  descEl.innerHTML = weeklyInsight.descParts
    .map((part) =>
      part.highlight
        ? `<span class="highlight">${escapeHtml(part.text)}</span>`
        : escapeHtml(part.text)
    )
    .join('');

  const memoCount = MemoStore.getAllMemos().length;
  document.getElementById('memoCountValue').textContent = `${memoCount}개`;
  document.getElementById('efficiencyValue').textContent = weeklyInsight.analysisEfficiency;
}

// 분석 상태 실시간 폴링용 타이머 보관 변수
let analysisPollingTimer = null;

/** 분석 현황 리스트 렌더링 */
function renderAnalysisList() {
  const container = document.getElementById('analysisList');
  const statusList = getDynamicAnalysisStatus();

  const LIMIT = 5;
  const displayList = isAnalysisExpanded ? statusList : statusList.slice(0, LIMIT);

  container.innerHTML = displayList
    .map(
      (item) => {
        // 데이터가 없는 대기 상태일 때는 X 버튼 미출력
        const showDelete = item.id !== 'empty';
        return `
          <div class="analysis-item card" data-id="${item.id}" style="display: flex; align-items: center; justify-content: space-between;">
            <div class="analysis-item__info" style="flex: 1; display: flex; align-items: center; justify-content: space-between; margin-right: 8px;">
              <span class="analysis-item__label" style="text-align: left;">${escapeHtml(item.label)}</span>
              <span class="analysis-item__value ${item.isDone ? 'is-done' : ''}">${escapeHtml(item.value)}</span>
            </div>
            ${showDelete ? `
              <button class="analysis-item__delete" type="button" aria-label="삭제" data-id="${item.id}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            ` : ''}
          </div>
        `;
      }
    )
    .join('');

  if (statusList.length > LIMIT) {
    const moreBtn = document.createElement('button');
    moreBtn.className = 'btn-show-more';
    moreBtn.type = 'button';
    moreBtn.innerHTML = isAnalysisExpanded 
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';
    moreBtn.addEventListener('click', () => {
      isAnalysisExpanded = !isAnalysisExpanded;
      renderAnalysisList();
    });
    container.appendChild(moreBtn);
  }

  // 1. 카드 본문 영역 클릭 시 상세보기(detail.html) 이동
  container.querySelectorAll('.analysis-item').forEach((el) => {
    el.addEventListener('click', (e) => {
      // X 삭제 버튼을 누른 경우는 메인 클릭 전파 방지
      if (e.target.closest('.analysis-item__delete')) return;

      const id = el.dataset.id;
      if (id && id !== 'empty') {
        window.location.href = `detail.html?id=${id}`;
      }
    });
  });

  // 2. X 삭제 버튼 클릭 시 숨김 처리 (이 리스트에서만 가리기)
  container.querySelectorAll('.analysis-item__delete').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const el = btn.closest('.analysis-item');
      if (el) el.style.display = 'none'; // 즉시 숨김 처리

      const id = btn.dataset.id;
      
      let hiddenIds = [];
      try {
        const raw = localStorage.getItem(HIDDEN_ANALYSIS_KEY);
        hiddenIds = raw ? JSON.parse(raw) : [];
      } catch (err) {}

      if (!hiddenIds.includes(id)) {
        hiddenIds.push(id);
        localStorage.setItem(HIDDEN_ANALYSIS_KEY, JSON.stringify(hiddenIds));
      }
      
      showToast('분석 현황에서 삭제되었습니다.');
    });
  });

  // 3. 만약 '분석중' 상태인 메모가 하나라도 있다면, 2초 후에 분석 진행도를 실시간 감지하여 자동 완료 갱신되도록 스마트 폴링 예약
  const hasInProgress = statusList.some(item => !item.isDone && item.id !== 'empty');
  clearTimeout(analysisPollingTimer);
  if (hasInProgress) {
    analysisPollingTimer = setTimeout(() => {
      renderAnalysisList();
    }, 2000);
  }
}

/** 실행 항목 리스트 렌더링 (실제 추출 및 동그라미 체크박스 제어) */
function renderActionList() {
  const container = document.getElementById('actionList');
  const items = extractActionItemsFromMemos();
  
  // 로컬저장소에서 체크 완료된 ID 목록 조회
  let checkedIds = [];
  try {
    const raw = localStorage.getItem(CHECKED_ACTIONS_KEY);
    checkedIds = raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error(e);
  }

  // 숨긴(삭제된) 실행항목 ID 로드
  let hiddenActionIds = [];
  try {
    const raw = localStorage.getItem(HIDDEN_ACTIONS_KEY);
    hiddenActionIds = raw ? JSON.parse(raw) : [];
  } catch (e) {}

  const visibleItems = items.filter(item => !hiddenActionIds.includes(item.id));

  if (visibleItems.length === 0) {
    container.innerHTML = `<div style="padding: 16px 0; font-size: 12px; color: #A0AEC0; text-align: center; border: 1px dashed #CBD5E1; border-radius: var(--radius-m);">실행 항목이 없습니다.</div>`;
    return;
  }

  const LIMIT = 5;
  const displayItems = isActionExpanded ? visibleItems : visibleItems.slice(0, LIMIT);

  container.innerHTML = displayItems
    .map((item) => {
      const isChecked = checkedIds.includes(item.id);
      return `
        <div class="action-item card ${isChecked ? 'is-checked' : ''}" data-id="${item.id}" data-memoid="${item.memoId}" data-original="${escapeHtml(item.originalSentence)}" style="display: flex; align-items: center;">
          <div class="action-item__checkbox" role="checkbox" aria-checked="${isChecked ? 'true' : 'false'}" tabindex="0"></div>
          <span class="action-item__badge action-item__badge--${item.category.toLowerCase()}">${item.category}</span>
          <span class="action-item__text" style="flex: 1;">${escapeHtml(item.text)}</span>
          <button class="analysis-item__delete action-item__delete" type="button" aria-label="삭제" data-id="${item.id}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      `;
    })
    .join('');

  if (visibleItems.length > LIMIT) {
    const moreBtn = document.createElement('button');
    moreBtn.className = 'btn-show-more';
    moreBtn.type = 'button';
    moreBtn.innerHTML = isActionExpanded 
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';
    moreBtn.addEventListener('click', () => {
      isActionExpanded = !isActionExpanded;
      renderActionList();
    });
    container.appendChild(moreBtn);
  }

  // 클릭 이벤트 핸들러 바인딩
  container.querySelectorAll('.action-item').forEach((el) => {
    el.addEventListener('click', (e) => {
      const actionId = el.dataset.id;

      // X 삭제 버튼 클릭 시 이 목록에서만 숨김 처리
      if (e.target.closest('.action-item__delete')) {
        e.stopPropagation();
        
        // 즉각적인 시각적 피드백 (DOM에서 즉시 숨김)
        el.style.display = 'none';

        let list = [];
        try {
          const raw = localStorage.getItem(HIDDEN_ACTIONS_KEY);
          list = raw ? JSON.parse(raw) : [];
        } catch (err) {}
        
        if (!list.includes(actionId)) {
          list.push(actionId);
          localStorage.setItem(HIDDEN_ACTIONS_KEY, JSON.stringify(list));
        }
        
        showToast('실행 항목에서 삭제되었습니다.');
        return;
      }
      
      // 체크박스 클릭 시 완료 처리 토글
      if (e.target.closest('.action-item__checkbox')) {
        e.stopPropagation();
        let list = [];
        try {
          const raw = localStorage.getItem(CHECKED_ACTIONS_KEY);
          list = raw ? JSON.parse(raw) : [];
        } catch (err) {}
        if (list.includes(actionId)) {
          list = list.filter(id => id !== actionId);
        } else {
          list.push(actionId);
        }
        localStorage.setItem(CHECKED_ACTIONS_KEY, JSON.stringify(list));
        renderActionList();
        return;
      }
      
      // 카드 본문 클릭 시 원본 메모 상세보기로 이동
      const memoId = el.dataset.memoid;
      const originalSentence = el.dataset.original;
      if (memoId) {
        window.location.href = `detail.html?id=${memoId}&highlight=${encodeURIComponent(originalSentence || '')}`;
      }
    });
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

/** 토스트 메시지 출력 */
function showToast(message) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 2000);
}
