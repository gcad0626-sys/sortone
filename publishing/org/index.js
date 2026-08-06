/* ==========================================================================
   SortOne - index.js (메인 홈 화면 로직)
   ========================================================================== */

// 로컬 스토리지 키 정의
const CATEGORY_STORAGE_KEY = 'sortone_categories';
const DEFAULT_CATEGORIES = ['전체', '업무', '개인', '아이디어'];

// 카테고리 목록 로드
function loadCategories() {
  const raw = localStorage.getItem(CATEGORY_STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(DEFAULT_CATEGORIES));
    return [...DEFAULT_CATEGORIES];
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    return [...DEFAULT_CATEGORIES];
  }
}

// 카테고리 목록 저장
function saveCategories(cats) {
  localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(cats));
}

let CATEGORIES = loadCategories();
let currentCategory = '전체';

let currentSort = 'latest'; // 'latest' | 'oldest'
let memoIdToDelete = null; // 삭제할 메모의 ID 보관용

// 최신 메모 확장 상태
let isRecentExpanded = false;

document.addEventListener('DOMContentLoaded', () => {
  renderCategoryFilter();
  renderMain();

  document.getElementById('fabAddBtn').addEventListener('click', () => {
    window.location.href = 'add.html';
  });

  // 정렬 드롭다운 기능
  const sortBtn = document.getElementById('sortBtn');
  const sortDropdown = document.getElementById('sortDropdown');

  sortBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    sortDropdown.classList.toggle('is-active');
  });

  document.addEventListener('click', () => {
    sortDropdown.classList.remove('is-active');
    document.querySelectorAll('.memo-card__dropdown, .important-card__dropdown').forEach((dd) => {
      dd.classList.remove('is-active');
    });
  });

  sortDropdown.querySelectorAll('.sort-dropdown__item').forEach((item) => {
    item.addEventListener('click', () => {
      currentSort = item.dataset.sort;

      // 액티브 클래스 갱신
      sortDropdown.querySelectorAll('.sort-dropdown__item').forEach((el) => {
        el.classList.toggle('is-active', el.dataset.sort === currentSort);
      });

      // 라벨 변경
      document.getElementById('sortLabel').textContent = item.textContent;

      // 리렌더링
      renderRecentSection();
    });
  });

  // 커스텀 삭제 모달 이벤트 바인딩
  const deleteModal = document.getElementById('deleteModal');
  const modalCancelBtn = document.getElementById('modalCancelBtn');
  const modalConfirmBtn = document.getElementById('modalConfirmBtn');

  modalCancelBtn.addEventListener('click', () => {
    deleteModal.classList.remove('is-active');
    memoIdToDelete = null;
  });

  modalConfirmBtn.addEventListener('click', () => {
    if (memoIdToDelete) {
      MemoStore.deleteMemo(memoIdToDelete);
      showToast('메모가 삭제되었습니다.');
      deleteModal.classList.remove('is-active');
      memoIdToDelete = null;
      renderMain();
    }
  });

  // 모달 외부 클릭 시 닫기
  deleteModal.addEventListener('click', (e) => {
    if (e.target === deleteModal) {
      deleteModal.classList.remove('is-active');
      memoIdToDelete = null;
    }
  });
});

/** 상단 카테고리 필터 탭 렌더링 */
function renderCategoryFilter() {
  const wrap = document.getElementById('categoryFilter');
  
  // 카테고리 칩 목록 + 우측에 편집 버튼 (+) 추가
  let html = CATEGORIES.map(
    (cat) => `
      <button
        class="category-filter__item ${cat === currentCategory ? 'is-active' : ''}"
        data-category="${cat}"
        type="button"
      >${cat}</button>
    `
  ).join('');

  html += `
    <button class="category-filter__item" id="btnEditCategories" type="button" style="background-color: #FFFFFF; color: var(--color-primary); display: flex; align-items: center; justify-content: center; font-weight: bold; width: 34px; padding: 9px 0;">
      +
    </button>
  `;

  wrap.innerHTML = html;

  wrap.querySelectorAll('.category-filter__item[data-category]').forEach((btn) => {
    btn.addEventListener('click', () => {
      currentCategory = btn.dataset.category;
      renderCategoryFilter();
      renderMain();
    });
  });

  // 카테고리 편집 버튼 클릭 이벤트
  const btnEdit = document.getElementById('btnEditCategories');
  if (btnEdit) {
    btnEdit.addEventListener('click', () => {
      openCategoryModal();
    });
  }
}

// 카테고리 편집 모달 열기 및 렌더링
function openCategoryModal() {
  const modal = document.getElementById('categoryModal');
  modal.classList.add('is-active');
  renderModalCategoryList();

  // 닫기 이벤트 바인딩
  document.getElementById('categoryModalCloseBtn').onclick = () => {
    modal.classList.remove('is-active');
  };

  // 추가 버튼 바인딩
  document.getElementById('addCategoryBtn').onclick = () => {
    const input = document.getElementById('newCategoryInput');
    const val = input.value.trim();
    if (!val) return;
    if (CATEGORIES.includes(val)) {
      showToast('이미 존재하는 카테고리입니다.');
      return;
    }
    CATEGORIES.push(val);
    saveCategories(CATEGORIES);
    input.value = '';
    renderModalCategoryList();
    renderCategoryFilter();
  };
}

// 카테고리별 고유 태그 색상 정의 헬퍼 (파스텔 톤)
function getCategoryColorStyle(cat) {
  switch (cat) {
    case '업무':
      return { bg: '#FFEFE6', text: '#FFAE7C', border: '#FFD3B8' }; // 파스텔 살구 (FFAE7C)
    case '개인':
      return { bg: '#EBF5FF', text: '#93C5FD', border: '#CCE3FF' }; // 파스텔 블루
    case '아이디어':
      return { bg: '#EEFBE7', text: '#A7F3D0', border: '#D5F3C3' }; // 파스텔 그린
    case '전체':
      return { bg: '#F1F5F9', text: '#CBD5E1', border: '#E2E8F0' }; // 파스텔 그레이
    default:
      // 새로 추가된 카테고리를 위한 포인트 컬러 (9CEAEF)
      return { bg: '#E6FCFD', text: '#9CEAEF', border: '#B2F2F6' }; // 파스텔 민트 (9CEAEF)
  }
}

// 모달 내 카테고리 리스트 렌더링 (수정 및 삭제 버튼)
function renderModalCategoryList() {
  const listEl = document.getElementById('modalCategoryList');
  
  listEl.innerHTML = CATEGORIES.map((cat, idx) => {
    const tagClass = getTagClass(cat);

    if (cat === '전체') {
      return `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 6px 12px; background-color: #F8FAFC; border-radius: 12px;">
          <span class="tag ${tagClass}" style="font-weight: 700;">${cat}</span>
          <span style="font-size: 11px; font-weight: 700; color: #94A3B8; white-space: nowrap;">기본 필터</span>
        </div>
      `;
    }
    
    return `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 6px 12px; background-color: #F8FAFC; border-radius: 12px; gap: 8px;">
        <!-- 실제 태그와 동일한 디자인 칩 내부에 편집용 투명 인풋 삽입 -->
        <div class="tag ${tagClass}" style="display: inline-flex; align-items: center; padding: 4px 10px; max-width: 170px; flex: 1;">
          <input type="text" value="${cat}" data-idx="${idx}" class="modal-cat-input" style="border: none; background: none; font-size: 12px; font-weight: 700; color: inherit; width: 100%; padding: 0; outline: none; text-align: center;" />
        </div>
        <div style="display: flex; gap: 4px; flex-shrink: 0; align-items: center;">
          <button type="button" class="btn-del-cat" data-idx="${idx}" style="color: #FFFFFF; background-color: #FFAE7C; border-radius: 999px; font-size: 11px; font-weight: 700; padding: 4px 12px; white-space: nowrap; min-width: 32px; border: none;">삭제</button>
        </div>
      </div>
    `;
  }).join('');

  // 카테고리명 실시간 변경 처리 함수
  const updateCategoryName = (inputEl) => {
    const idx = inputEl.dataset.idx;
    const newVal = inputEl.value.trim();
    if (!newVal) return;
    
    const oldVal = CATEGORIES[idx];
    if (oldVal === newVal) return; // 변한 게 없으면 리턴

    if (CATEGORIES.includes(newVal) && CATEGORIES.indexOf(newVal) !== parseInt(idx, 10)) {
      showToast('이미 존재하는 카테고리명입니다.');
      inputEl.value = oldVal;
      return;
    }

    CATEGORIES[idx] = newVal;
    saveCategories(CATEGORIES);

    // 메모 데이터의 구 카테고리를 신 카테고리로 이전
    const memos = MemoStore.getAllMemos();
    memos.forEach(m => {
      if (m.category === oldVal) {
        MemoStore.updateMemo(m.id, { category: newVal });
      }
    });

    if (currentCategory === oldVal) {
      currentCategory = newVal;
    }

    showToast('카테고리명이 변경되었습니다.');
    renderModalCategoryList();
    renderCategoryFilter();
    renderMain();
  };

  // 인풋 포커스 아웃(blur) 및 엔터 키 입력 시 자동 업데이트 바인딩
  listEl.querySelectorAll('.modal-cat-input').forEach((input) => {
    input.addEventListener('blur', () => {
      updateCategoryName(input);
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        input.blur(); // 포커스를 아웃시키면서 자연스럽게 blur 핸들러가 가동되게 처리
      }
    });
  });

  // 카테고리 삭제 바인딩
  listEl.querySelectorAll('.btn-del-cat').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = btn.dataset.idx;
      const delVal = CATEGORIES[idx];
      
      CATEGORIES.splice(idx, 1);
      saveCategories(CATEGORIES);

      // 삭제된 카테고리를 가진 메모들은 기본값 '전체'로 변환
      const memos = MemoStore.getAllMemos();
      memos.forEach(m => {
        if (m.category === delVal) {
          MemoStore.updateMemo(m.id, { category: '전체' });
        }
      });

      if (currentCategory === delVal) {
        currentCategory = '전체';
      }

      showToast('카테고리가 삭제되었습니다.');
      renderModalCategoryList();
      renderCategoryFilter();
      renderMain();
    });
  });
}

/** 중요 메모 + 최신 메모 리스트 전체 렌더링 */
function renderMain() {
  renderImportantSection();
  renderRecentSection();
}

/** 중요 메모 섹션 렌더링 (선택된 카테고리 기준으로 필터링) */
function renderImportantSection() {
  const section = document.getElementById('importantSection');
  const list = MemoStore.getImportantMemos().filter(
    (m) => currentCategory === '전체' || m.category === currentCategory || m.tags.includes(currentCategory)
  );

  section.style.display = 'flex'; // 레이아웃 덜컥임(화면 점프) 방지를 위해 항상 flex 유지
  const container = document.getElementById('importantList');

  if (list.length === 0) {
    container.innerHTML = `<div class="empty-state" style="padding: 16px 0; font-size: 12px; color: rgba(255,255,255,0.7); text-align: center; border: 1px dashed rgba(255,255,255,0.3); border-radius: var(--radius-m);">고정된 중요 메모가 없습니다.</div>`;
    return;
  }

  container.innerHTML = list.map(renderImportantCard).join('');

  container.querySelectorAll('.important-card').forEach((el) => {
    el.addEventListener('click', (e) => {
      if (e.target.closest('.important-card__more') || e.target.closest('.important-card__dropdown')) return;
      window.location.href = `detail.html?id=${el.dataset.id}`;
    });
  });

  // '...' 더보기 버튼 클릭 시 중요 메모 드롭다운 토글
  container.querySelectorAll('.important-card__more').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const dropdown = btn.nextElementSibling;

      // 다른 카드 드롭다운 닫기
      document.querySelectorAll('.memo-card__dropdown, .important-card__dropdown').forEach((dd) => {
        if (dd !== dropdown) dd.classList.remove('is-active');
      });

      // 현재 카드 드롭다운 toggle
      dropdown.classList.toggle('is-active');
    });
  });

  // 중요 메모 해제 클릭
  container.querySelectorAll('.important-card__dropdown-item.btn-unpin').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.important-card');
      const id = card.dataset.id;
      MemoStore.updateMemo(id, { isImportant: false });
      showToast('중요 메모가 해제되었습니다.');
      renderMain();
    });
  });
}

function renderImportantCard(memo) {
  return `
    <div class="important-card" data-id="${memo.id}">
      <div class="important-card__header">
        <span class="important-card__date">${formatRelativeDate(memo.createdAt)}</span>
        <div class="important-card__more-wrap">
          <button class="important-card__more" type="button" aria-label="더보기">&#8942;</button>
          <div class="important-card__dropdown">
            <button class="important-card__dropdown-item btn-unpin" type="button">중요 메모 해제</button>
          </div>
        </div>
      </div>
      <h3 class="important-card__title">${escapeHtml(memo.title)}</h3>
      <p class="important-card__desc">${escapeHtml(stripHtmlTags(memo.content))}</p>
      <div class="important-card__tags">
        ${memo.tags.map((t) => `<span class="tag ${getTagClass(t)}">#${t}</span>`).join('')}
      </div>
    </div>
  `;
}

/** 최신 메모 섹션 렌더링 (선택된 카테고리 및 정렬 기준으로 필터링) */
function renderRecentSection() {
  // 보관된 메모 ID 목록 조회
  let archivedIds = [];
  try {
    const raw = localStorage.getItem('sortone_archived_memos');
    archivedIds = raw ? JSON.parse(raw) : [];
  } catch (e) {}

  let list = MemoStore.getRecentMemos().filter(
    (m) => (currentCategory === '전체' || m.category === currentCategory || m.tags.includes(currentCategory))
           && !archivedIds.includes(m.id) // 보관된 메모 제외
  );

  // 정렬 기준 적용 (최신순 또는 오래된순)
  if (currentSort === 'oldest') {
    list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  } else {
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  const container = document.getElementById('memoList');

  if (list.length === 0) {
    container.innerHTML = `<div class="empty-state">아직 작성된 메모가 없어요.<br />오른쪽 아래 + 버튼으로 첫 메모를 남겨보세요.</div>`;
    return;
  }

  const LIMIT = 5;
  const displayList = isRecentExpanded ? list : list.slice(0, LIMIT);

  container.innerHTML = displayList.map(renderMemoCard).join('');

  if (list.length > LIMIT) {
    const moreBtn = document.createElement('button');
    moreBtn.className = 'btn-show-more';
    moreBtn.type = 'button';
    moreBtn.innerHTML = isRecentExpanded 
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';
    moreBtn.addEventListener('click', () => {
      isRecentExpanded = !isRecentExpanded;
      renderRecentSection();
    });
    container.appendChild(moreBtn);
  }

  container.querySelectorAll('.memo-card').forEach((el) => {
    el.addEventListener('click', (e) => {
      if (e.target.closest('.memo-card__more') || e.target.closest('.memo-card__dropdown')) return;
      window.location.href = `detail.html?id=${el.dataset.id}`;
    });
  });

  // '...' 더보기 버튼 클릭 시 드롭다운 토글
  container.querySelectorAll('.memo-card__more').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const dropdown = btn.nextElementSibling;

      // 다른 카드 드롭다운 닫기
      document.querySelectorAll('.memo-card__dropdown').forEach((dd) => {
        if (dd !== dropdown) dd.classList.remove('is-active');
      });

      // 현재 카드 드롭다운 토글
      dropdown.classList.toggle('is-active');
    });
  });

  // 드롭다운 아이템 클릭: 메모 복사
  container.querySelectorAll('.memo-card__dropdown-item.btn-copy').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.memo-card');
      const id = card.dataset.id;
      const memo = MemoStore.getMemoById(id);
      if (memo) {
        const textToCopy = `${memo.title}\n\n${stripHtmlTags(memo.content)}`;
        navigator.clipboard.writeText(textToCopy).then(() => {
          showToast('메모가 복사되었습니다.');
        }).catch((err) => {
          console.error('클립보드 복사 실패:', err);
        });
      }
      btn.closest('.memo-card__dropdown').classList.remove('is-active');
    });
  });

  // 드롭다운 아이템 클릭: 메모 삭제 (커스텀 모달 노출)
  container.querySelectorAll('.memo-card__dropdown-item.btn-delete').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.memo-card');
      memoIdToDelete = card.dataset.id;

      // 드롭다운 닫기
      btn.closest('.memo-card__dropdown').classList.remove('is-active');

      // 커스텀 확인 모달 열기
      document.getElementById('deleteModal').classList.add('is-active');
    });
  });

  // 드롭다운 아이템: 메모 보관
  container.querySelectorAll('.memo-card__dropdown-item.btn-archive').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.memo-card');
      const id = card.dataset.id;
      // 보관 목록에 추가
      let archived = [];
      try {
        const raw = localStorage.getItem('sortone_archived_memos');
        archived = raw ? JSON.parse(raw) : [];
      } catch (err) {}
      if (!archived.includes(id)) {
        archived.push(id);
        localStorage.setItem('sortone_archived_memos', JSON.stringify(archived));
      }
      btn.closest('.memo-card__dropdown').classList.remove('is-active');
      showToast('메모가 보관되었습니다.');
      renderMain();
    });
  });

  // 드롭다운 아이템 클릭: 중요 메모 고정
  container.querySelectorAll('.memo-card__dropdown-item.btn-pin').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.memo-card');
      const id = card.dataset.id;
      MemoStore.updateMemo(id, { isImportant: true });
      showToast('중요 메모로 고정되었습니다.');
      renderMain();
    });
  });
}

function renderMemoCard(memo) {
  return `
    <div class="memo-card card" data-id="${memo.id}">
      <div class="memo-card__header">
        <span class="memo-card__date">${formatRelativeDate(memo.createdAt)}</span>
        <div class="memo-card__more-wrap">
          <button class="memo-card__more" type="button" aria-label="더보기">&#8942;</button>
          <div class="memo-card__dropdown">
            <button class="memo-card__dropdown-item btn-copy" type="button">메모 복사</button>
            <button class="memo-card__dropdown-item btn-archive" type="button">메모 보관</button>
            <button class="memo-card__dropdown-item btn-pin" type="button">중요 메모 고정</button>
            <button class="memo-card__dropdown-item btn-delete" type="button" style="color:#EF4444;">메모 삭제</button>
          </div>
        </div>
      </div>
      <h3 class="memo-card__title">${escapeHtml(memo.title)}</h3>
      <p class="memo-card__desc">${escapeHtml(stripHtmlTags(memo.content))}</p>
      <div class="memo-card__tags">
        ${memo.tags.map((t) => `<span class="tag ${getTagClass(t)}">${t}</span>`).join('')}
      </div>
    </div>
  `;
}

/** 간단한 XSS 방지용 이스케이프 */
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

/** 글자색상, 형광펜, 마크다운 태그를 실제 스타일로 파싱하여 렌더링 */
function renderContentHtml(content) {
  if (!content) return '';

  const placeholders = [];
  let parsed = content;
  
  // 1. 색상 및 형광펜 HTML 허용 (span, u 태그 보존)
  parsed = parsed.replace(/(<span\s+style="[^"]*">|<\/span>|<u>|<\/u>)/gi, (match) => {
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
  
  // 3. 줄바꿈을 br 태그로 변환
  parsed = parsed.replace(/\n/g, '<br />');
  
  return parsed;
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
