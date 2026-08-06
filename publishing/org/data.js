/* ==========================================================================
   SortOne - data.js
   공통 데이터 관리 로직 (추후 React 전환을 고려해 스키마를 명확히 유지)
   ========================================================================== */

/**
 * @typedef {Object} Memo
 * @property {string} id            - 고유 ID
 * @property {string} title         - 메모 제목
 * @property {string} content       - 메모 본문
 * @property {string[]} tags        - 표시용 태그 배열 (예: ['업무', '우선순위'])
 * @property {'전체'|'업무'|'개인'|'아이디어'} category - 상단 필터용 대표 카테고리
 * @property {boolean} isImportant  - 중요 메모(핀 고정) 여부
 * @property {string[]} aiSummary   - AI 3줄 요약 (문장 배열, 없으면 빈 배열 → 상세 화면에서 대체 문구 처리)
 * @property {string} createdAt     - ISO 날짜 문자열 (생성일)
 * @property {string} updatedAt     - ISO 날짜 문자열 (수정일)
 */

const STORAGE_KEY = 'sortone_memos';

/** 초기 더미 데이터 (최초 1회, localStorage가 비어있을 때만 사용) */
const INITIAL_MEMOS = [
  {
    id: 'm1',
    title: '신규 프로젝트 마일스톤',
    content:
      '다음 분기 핵심 과제와 세부 일정을 정리함. 디자인 시스템 고도화 및 접근성 가이드라인 준수가 최우선...',
    tags: ['업무', '우선순위'],
    category: '업무',
    isImportant: true,
    aiSummary: [
      '다음 분기 핵심 과제와 세부 일정을 정리했습니다.',
      '디자인 시스템 고도화가 최우선 과제로 설정되었습니다.',
      '접근성 가이드라인 준수 여부를 지속적으로 점검할 예정입니다.'
    ],
    createdAt: '2023-10-24T09:00:00.000Z',
    updatedAt: '2023-10-24T09:00:00.000Z'
  },
  {
    id: 'm2',
    title: '주말 캠핑 체크리스트',
    content: '텐트, 침낭, 화로대, 식재료(고기, 야채, 소스), 랜턴, 보',
    tags: ['개인'],
    category: '개인',
    isImportant: false,
    aiSummary: [
      '캠핑에 필요한 장비와 식재료 목록을 정리했습니다.',
      '텐트, 침낭, 화로대 등 기본 장비가 포함되어 있습니다.',
      '조명을 위한 랜턴도 준비 목록에 추가되었습니다.'
    ],
    createdAt: '2023-10-25T09:00:00.000Z',
    updatedAt: '2023-10-25T09:00:00.000Z'
  },
  {
    id: 'm3',
    title: '차세대 AI 필터링 로직 아이디어',
    content: '사용자의 최근 검색 패턴과 컨텍스트를 분석하여 실...',
    tags: ['아이디어'],
    category: '아이디어',
    isImportant: false,
    aiSummary: [
      '사용자의 최근 검색 패턴을 분석하는 아이디어입니다.',
      '컨텍스트 기반 필터링으로 정확도를 높이는 것이 목표입니다.',
      '구체적인 구현 방식은 추가 논의가 필요합니다.'
    ],
    createdAt: '2023-10-24T09:00:00.000Z',
    updatedAt: '2023-10-24T09:00:00.000Z'
  },
  {
    id: 'm4',
    title: '독서 노트: 미니멀리즘의 힘',
    content: '"불필요한 것을 덜어낼 때 진정 중요한 것이 무엇인지',
    tags: ['개인'],
    category: '개인',
    isImportant: false,
    aiSummary: [
      '미니멀리즘을 주제로 한 독서 노트입니다.',
      '불필요한 것을 덜어내는 삶의 태도를 다룹니다.',
      '진정 중요한 것에 집중하자는 메시지를 담고 있습니다.'
    ],
    createdAt: '2023-10-20T09:00:00.000Z',
    updatedAt: '2023-10-20T09:00:00.000Z'
  }
];

const MemoStore = {
  /** localStorage에서 메모 배열을 읽어온다. 없으면 초기 더미 데이터로 시딩. */
  _load() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MEMOS));
      return [...INITIAL_MEMOS];
    }
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error('메모 데이터 파싱 실패, 초기 데이터로 복구합니다.', e);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MEMOS));
      return [...INITIAL_MEMOS];
    }
  },

  _save(memos) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memos));
  },

  /** @returns {Memo[]} 전체 메모 배열 (최신순 정렬) */
  getAllMemos() {
    const memos = this._load();
    return memos.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  },

  /** @returns {Memo[]} 중요 메모(핀 고정)만 반환 */
  getImportantMemos() {
    return this.getAllMemos().filter((m) => m.isImportant);
  },

  /** @returns {Memo[]} 중요 메모를 제외한 일반 최신 메모 목록 */
  getRecentMemos() {
    return this.getAllMemos().filter((m) => !m.isImportant);
  },

  /**
   * @param {'전체'|'업무'|'개인'|'아이디어'} category
   * @returns {Memo[]}
   */
  getMemosByCategory(category) {
    const memos = this.getAllMemos();
    if (!category || category === '전체') return memos;
    return memos.filter((m) => m.category === category);
  },

  /** @param {string} id */
  getMemoById(id) {
    return this._load().find((m) => m.id === id) || null;
  },

  /** @param {Partial<Memo>} memoData */
  addMemo(memoData) {
    const memos = this._load();
    const now = new Date().toISOString();
    /** @type {Memo} */
    const newMemo = {
      id: 'm' + Date.now(),
      title: memoData.title || '',
      content: memoData.content || '',
      tags: memoData.tags || [],
      category: memoData.category || '전체',
      isImportant: memoData.isImportant || false,
      aiSummary: memoData.aiSummary || generateDummySummary(memoData.content || ''),
      createdAt: now,
      updatedAt: now
    };
    memos.push(newMemo);
    this._save(memos);
    return newMemo;
  },

  /**
   * @param {string} id
   * @param {Partial<Memo>} data
   */
  updateMemo(id, data) {
    const memos = this._load();
    const idx = memos.findIndex((m) => m.id === id);
    if (idx === -1) return null;
    memos[idx] = {
      ...memos[idx],
      ...data,
      updatedAt: new Date().toISOString()
    };
    this._save(memos);
    return memos[idx];
  },

  /** @param {string} id */
  deleteMemo(id) {
    const memos = this._load().filter((m) => m.id !== id);
    this._save(memos);
  }
};

/* ---------- 공통 유틸: 상대 날짜 포맷 ---------- */
function formatRelativeDate(isoString) {
  const date = new Date(isoString);
  const now = new Date();

  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round(
    (startOfDay(now) - startOfDay(date)) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return '오늘';
  if (diffDays === 1) return '어제';
  if (diffDays > 1 && diffDays < 7) return `${diffDays}일 전`;

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd}`;
}

/* ---------- 공통 유틸: 본문에서 AI 3줄 요약 더미 생성 ---------- */
function generateDummySummary(content) {
  if (!content) return [];
  const sentences = content
    .split(/(?<=[.!?。])\s+|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (sentences.length === 0) return [];
  return sentences.slice(0, 3);
}

/* ---------- 공통 유틸: 카테고리 -> 태그 클래스 매핑 ---------- */
function getTagClass(tagName) {
  switch (tagName) {
    case '업무':
      return 'tag--work';
    case '개인':
      return 'tag--personal';
    case '아이디어':
      return 'tag--idea';
    case '우선순위':
      return 'tag--priority';
    default:
      return 'tag--default';
  }
}

/* ==========================================================================
   ProfileStore - 사용자 프로필/설정 관리 (작업계획_퍼블리싱.md 5-4 참고)
   ========================================================================== */

const USER_STORAGE_KEY = 'sortone_user';
const SETTINGS_STORAGE_KEY = 'sortone_settings';
const LOGIN_STORAGE_KEY = 'sortone_logged_in';

const INITIAL_USER = {
  name: 'Alex Morgan',
  email: 'alex@sortone.ai',
  avatarUrl:
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">' +
        '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0%" stop-color="#FFD9A0"/>' +
        '<stop offset="100%" stop-color="#FFB870"/>' +
        '</linearGradient></defs>' +
        '<circle cx="48" cy="48" r="48" fill="url(#g)"/>' +
        '<text x="48" y="59" font-family="Noto Sans KR, sans-serif" font-size="32" font-weight="700" fill="#7A4A1E" text-anchor="middle">AM</text>' +
        '</svg>'
    ),
  membership: 'Pro Member',
  activeSince: '2023'
};

const INITIAL_SETTINGS = {
  aiAutoClassify: true
};

const ProfileStore = {
  getUser() {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(INITIAL_USER));
      return { ...INITIAL_USER };
    }
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error('사용자 데이터 파싱 실패, 초기 데이터로 복구합니다.', e);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(INITIAL_USER));
      return { ...INITIAL_USER };
    }
  },

  getSettings() {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(INITIAL_SETTINGS));
      return { ...INITIAL_SETTINGS };
    }
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error('설정 데이터 파싱 실패, 초기 데이터로 복구합니다.', e);
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(INITIAL_SETTINGS));
      return { ...INITIAL_SETTINGS };
    }
  },

  /** AI 자동 분류 모드 토글 (반전 후 저장) */
  toggleAiAutoClassify() {
    const settings = this.getSettings();
    settings.aiAutoClassify = !settings.aiAutoClassify;
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    return settings;
  },

  /** 더미 로그아웃: 로그인 상태만 초기화 */
  logout() {
    localStorage.setItem(LOGIN_STORAGE_KEY, 'false');
  },

  /** 더미 계정 삭제: 앱에서 사용하는 모든 로컬 데이터 초기화 */
  deleteAccount() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SEARCH_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(SETTINGS_STORAGE_KEY);
    localStorage.setItem(LOGIN_STORAGE_KEY, 'false');
  }
};

/* ==========================================================================
   SearchStore - 최근 검색어 관리 (작업계획_퍼블리싱.md 5-2 참고)
   ========================================================================== */

const SEARCH_STORAGE_KEY = 'sortone_recent_searches';

const INITIAL_RECENT_SEARCHES = [
  '2024년 사업 기획서 초안',
  '건축 미니멀리즘',
  '마케팅 회의록 03.12'
];

const SearchStore = {
  _load() {
    const raw = localStorage.getItem(SEARCH_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SEARCH_STORAGE_KEY, JSON.stringify(INITIAL_RECENT_SEARCHES));
      return [...INITIAL_RECENT_SEARCHES];
    }
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error('검색어 데이터 파싱 실패, 초기 데이터로 복구합니다.', e);
      localStorage.setItem(SEARCH_STORAGE_KEY, JSON.stringify(INITIAL_RECENT_SEARCHES));
      return [...INITIAL_RECENT_SEARCHES];
    }
  },

  _save(list) {
    localStorage.setItem(SEARCH_STORAGE_KEY, JSON.stringify(list));
  },

  /** @returns {string[]} 최근 검색어 목록 (최신순) */
  getRecentSearches() {
    return this._load();
  },

  /** @param {string} keyword 검색 실행 시 최상단에 추가 (중복 제거) */
  addRecentSearch(keyword) {
    const trimmed = (keyword || '').trim();
    if (!trimmed) return this._load();
    const list = this._load().filter((k) => k !== trimmed);
    list.unshift(trimmed);
    this._save(list);
    return list;
  },

  /** @param {string} keyword 개별 삭제 */
  removeRecentSearch(keyword) {
    const list = this._load().filter((k) => k !== keyword);
    this._save(list);
    return list;
  },

  /** 전체 삭제("모두 지우기") */
  clearRecentSearches() {
    this._save([]);
    return [];
  }
};
