/* ==========================================================================
   SortOne - search.js (스마트 검색 화면 로직)
   ========================================================================== */

/** AI 스마트 태그 리스트 */
const SMART_TAGS = ['프로젝트 기획', '워크플로우', '아이디어'];
const SMART_TAG_COLOR_CYCLE = ['smart-tag--blue', 'smart-tag--pink', 'smart-tag--white'];

// 연관 검색어(동의어) 매핑 사전
const SYNONYM_MAP = [
  { words: ['건축', '인테리어', '가구', '디자인', '설계', '거실', '바닥재'], label: '디자인/건축' },
  { words: ['미니멀', '미니멀리즘', '심플', '단순', '비우기', '정리'], label: '미니멀리즘' },
  { words: ['회의', '미팅', '로그', '결과', '의제', '소통', '보고'], label: '회의' },
  { words: ['프로젝트', '마일스톤', '일정', '기획', '계획', '목표'], label: '기획' }
];

// 한글 자음/초성 분리 헬퍼
function getChosung(str) {
  const cho = [
    'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
    'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
  ];
  let result = '';
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i) - 44032;
    if (code > -1 && code < 11172) {
      result += cho[Math.floor(code / 588)];
    } else {
      result += str.charAt(i);
    }
  }
  return result;
}

// 검색에 사용될 활성 필터 태그
let activeFilterTag = '전체';
let currentSearchResults = [];

// 최근 검색어 확장 상태
let isRecentSearchExpanded = false;

document.addEventListener('DOMContentLoaded', () => {
  renderSmartTags();
  renderRecentSearches();

  const input = document.getElementById('searchInput');
  const submitBtn = document.getElementById('searchSubmitBtn');
  const clearBtn = document.getElementById('searchClearBtn');

  submitBtn.addEventListener('click', () => runSearch(input.value));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') runSearch(input.value);
  });

  // 검색창 입력 상태에 따른 X 초기화 버튼 노출 여부 제어
  input.addEventListener('input', () => {
    clearBtn.style.display = input.value.trim().length > 0 ? 'block' : 'none';
  });

  // X 버튼 클릭 시 초기화
  clearBtn.addEventListener('click', () => {
    input.value = '';
    clearBtn.style.display = 'none';
    activeFilterTag = '전체';
    currentSearchResults = [];
    
    // 이전 메인 뷰 상태로 원복
    document.getElementById('smartTagSection').style.display = 'flex';
    document.getElementById('recentSearchSection').style.display = 'flex';
    document.getElementById('searchResultSection').style.display = 'none';
  });

  document.getElementById('clearAllBtn').addEventListener('click', () => {
    SearchStore.clearRecentSearches();
    renderRecentSearches();
  });

  document.getElementById('fabAddBtn').addEventListener('click', () => {
    window.location.href = 'add.html';
  });
});

/** AI 스마트 태그 칩 렌더링 */
function renderSmartTags() {
  const wrap = document.getElementById('smartTagList');
  wrap.innerHTML = SMART_TAGS.map(
    (tag, i) => `
      <button
        type="button"
        class="smart-tag ${SMART_TAG_COLOR_CYCLE[i % SMART_TAG_COLOR_CYCLE.length]}"
        data-tag="${escapeHtml(tag)}"
      >${escapeHtml(tag)}</button>
    `
  ).join('');

  wrap.querySelectorAll('.smart-tag').forEach((btn) => {
    btn.addEventListener('click', () => runSearch(btn.dataset.tag));
  });
}

/** 최근 검색어 리스트 렌더링 */
function renderRecentSearches() {
  const list = SearchStore.getRecentSearches();
  const container = document.getElementById('recentList');

  if (list.length === 0) {
    container.innerHTML = `<div class="empty-state">최근 검색어가 없어요.</div>`;
    return;
  }

  const LIMIT = 5;
  const displayList = isRecentSearchExpanded ? list : list.slice(0, LIMIT);

  container.innerHTML = displayList
    .map(
      (keyword) => `
        <div class="recent-item card">
          <svg class="recent-item__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="9"/>
            <polyline points="12 7 12 12 15 14"/>
          </svg>
          <span class="recent-item__text" data-keyword="${escapeHtml(keyword)}">${escapeHtml(keyword)}</span>
          <button class="recent-item__remove" type="button" data-remove="${escapeHtml(keyword)}" aria-label="삭제">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      `
    )
    .join('');

  if (list.length > LIMIT) {
    const moreBtn = document.createElement('button');
    moreBtn.className = 'btn-show-more';
    moreBtn.type = 'button';
    moreBtn.innerHTML = isRecentSearchExpanded 
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';
    moreBtn.addEventListener('click', () => {
      isRecentSearchExpanded = !isRecentSearchExpanded;
      renderRecentSearches();
    });
    container.appendChild(moreBtn);
  }

  container.querySelectorAll('.recent-item__text').forEach((el) => {
    el.addEventListener('click', () => runSearch(el.dataset.keyword));
  });

  container.querySelectorAll('.recent-item__remove').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      SearchStore.removeRecentSearch(btn.dataset.remove);
      renderRecentSearches();
    });
  });
}

/** 인텔리전트 스마트 매칭 검색 실행 */
function runSearch(keyword) {
  const trimmed = (keyword || '').trim();
  if (!trimmed) return;

  const input = document.getElementById('searchInput');
  const clearBtn = document.getElementById('searchClearBtn');
  
  input.value = trimmed;
  clearBtn.style.display = 'block';

  // 최근 검색어 등록 및 리스트 리렌더링
  SearchStore.addRecentSearch(trimmed);
  renderRecentSearches();

  // 1. 메모 검색 및 연관성 매칭 연산
  const searchTokens = trimmed.toLowerCase().split(/\s+/).filter(Boolean);
  const memos = MemoStore.getAllMemos();
  const scoredMemos = [];

  memos.forEach((memo) => {
    let score = 0;
    const memoTitle = memo.title.toLowerCase();
    const memoContent = memo.content.toLowerCase();
    const memoTags = memo.tags.map(t => t.toLowerCase());

    searchTokens.forEach((token) => {
      // (1) 완전 매칭 점수
      if (memoTitle.includes(token)) score += 15;
      if (memoContent.includes(token)) score += 8;
      
      // (2) 태그 일치 점수
      if (memoTags.some(t => t.includes(token))) score += 12;

      // (3) 한글 초성 일치 점수 (토큰 전체가 초성/자음으로만 구성된 경우에만 적용하여 무분별한 매칭 방지)
      const tokenCho = getChosung(token);
      const isPureChosung = /^[ㄱ-ㅎ]+$/.test(token);
      if (isPureChosung && tokenCho.length > 0) {
        const titleCho = getChosung(memoTitle);
        const contentCho = getChosung(memoContent);
        if (titleCho.includes(tokenCho)) score += 5;
        if (contentCho.includes(tokenCho)) score += 2;
      }

      // (4) 인텔리전트 동의어/연관 단어 점수
      SYNONYM_MAP.forEach((entry) => {
        if (entry.words.includes(token)) {
          // 동의어 집단 중 하나가 메모 제목/본문에 발견되는지 검사
          entry.words.forEach((synonym) => {
            if (synonym !== token) {
              if (memoTitle.includes(synonym)) score += 6;
              if (memoContent.includes(synonym)) score += 3;
            }
          });
        }
      });
    });

    if (score > 0) {
      scoredMemos.push({
        memo: memo,
        score: score
      });
    }
  });

  // 점수 높은(관련성 높은) 순으로 정렬
  scoredMemos.sort((a, b) => b.score - a.score);
  currentSearchResults = scoredMemos.map(item => item.memo);
  activeFilterTag = '전체';

  // 2. 검색 화면으로 상태 전환
  document.getElementById('smartTagSection').style.display = 'none';
  document.getElementById('recentSearchSection').style.display = 'none';
  document.getElementById('searchResultSection').style.display = 'flex';

  renderSearchResults();
}

/** 검색 결과 목록 및 상단 연계 태그 필터 칩 렌더링 */
function renderSearchResults() {
  const countEl = document.getElementById('searchResultCount');
  const tagListEl = document.getElementById('resultTagList');
  const memoListEl = document.getElementById('searchMemoList');

  // 현재 필터 적용된 결과 필터링
  const filteredMemos = activeFilterTag === '전체' 
    ? currentSearchResults 
    : currentSearchResults.filter(m => m.tags.includes(activeFilterTag));

  countEl.textContent = `검색 결과 ${filteredMemos.length}건`;

  // 1. 검색 결과 내 고유 태그들 수집하여 필터 칩 생성
  const allTags = ['전체'];
  currentSearchResults.forEach(m => {
    m.tags.forEach(t => {
      if (!allTags.includes(t)) allTags.push(t);
    });
  });

  tagListEl.innerHTML = allTags
    .map((tag) => `
      <button type="button" class="result-tag-btn ${tag === activeFilterTag ? 'is-active' : ''}" data-tag="${escapeHtml(tag)}">
        ${escapeHtml(tag)}
      </button>
    `)
    .join('');

  tagListEl.querySelectorAll('.result-tag-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeFilterTag = btn.dataset.tag;
      renderSearchResults(); // 필터 적용 후 리렌더링
    });
  });

  // 2. 검색된 메모 카드 리스트 출력
  if (filteredMemos.length === 0) {
    memoListEl.innerHTML = `<div class="empty-state">검색 결과에 맞는 메모가 없습니다.</div>`;
    return;
  }

  memoListEl.innerHTML = filteredMemos
    .map((memo) => `
      <div class="search-memo-card card" data-id="${memo.id}">
        <div class="search-memo-card__header">
          <h3 class="search-memo-card__title">${escapeHtml(memo.title)}</h3>
          <span class="search-memo-card__date">${formatRelativeDate(memo.createdAt)}</span>
        </div>
        <p class="search-memo-card__desc">${escapeHtml(stripHtmlTags(memo.content))}</p>
        <div class="search-memo-card__tags">
          ${memo.tags.map(t => `<span class="tag ${getTagClass(t)}">#${t}</span>`).join('')}
        </div>
      </div>
    `)
    .join('');

  // 클릭 시 상세보기 화면(detail.html)으로 정상 이동 처리
  memoListEl.querySelectorAll('.search-memo-card').forEach((card) => {
    card.addEventListener('click', () => {
      window.location.href = `detail.html?id=${card.dataset.id}`;
    });
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

/** HTML 태그 및 엔티티를 모두 제거하여 순수 텍스트 요약문만 추출 */
function stripHtmlTags(html) {
  if (!html) return '';
  // HTML 태그 제거
  let clean = html.replace(/<[^>]*>/g, ' ');
  // HTML 엔티티 제거 및 표준 공백 치환
  clean = clean.replace(/&nbsp;/gi, ' ');
  clean = clean.replace(/&lt;/gi, '<').replace(/&gt;/gi, '>');
  clean = clean.replace(/&amp;/gi, '&').replace(/&quot;/gi, '"');
  return clean.replace(/\s+/g, ' ').trim();
}

