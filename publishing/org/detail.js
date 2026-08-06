/* ==========================================================================
   SortOne - detail.js (메모 상세보기 화면 로직)
   ========================================================================== */

/**
 * ai.html의 "분석 현황" / "실행 항목"은 실제 메모가 아닌 더미 항목이므로,
 * 해당 id로 진입했을 때 보여줄 상세 콘텐츠를 별도로 정의한다.
 * id가 없거나 어떤 데이터와도 매칭되지 않으면 기본 데모 콘텐츠를 보여준다.
 */
const FALLBACK_DETAILS = {
  'analysis-2': {
    title: '미팅 로그 #204 클러스터링',
    aiSummary: [
      '7월 초기 출시를 위해 핵심 API의 안정성과 개발자 경험 향상에 집중합니다.',
      '8월 중순까지 엔터프라이즈 고객을 위한 "스마트 분류" 베타 기능을 도입합니다.',
      '9월 마지막 주에 글로벌 마케팅 캠페인을 본격적으로 시작할 예정입니다.'
    ],
    paragraphs: [
      '엔지니어링 팀과의 회의 결과, 3분기의 주요 목표는 기존 인프라에서 새로운 AI 기반 백엔드로 원활하게 전환하는 것입니다. 새로운 자동 분류 기능을 출시하는 동안 사용자 데이터의 무결성을 최우선 순위로 유지해야 합니다.',
      '마케팅 팀은 "복잡함의 단순화"를 핵심 내러티브로 내세울 것입니다. 사용자들이 자신의 업무 공간이 마법처럼 스스로 정리되는 것처럼 느끼게 하고 싶습니다. 이를 위해서는 우리의 \'따뜻한 미니멀리즘\' 철학에 맞춰 모든 접점에서 마찰을 줄이는 매우 섬세하고 고급스러운 UI/UX가 필요합니다.'
    ]
  },
  'analysis-1': {
    title: '시장 분석 보고서 요약',
    aiSummary: [
      '경쟁 서비스 대비 AI 자동분류 기능의 차별점을 분석 중입니다.',
      '핵심 타겟은 정보 과부하를 겪는 지식노동자 그룹입니다.',
      '분석 진행률은 현재 85%이며 다음 주 완료 예정입니다.'
    ],
    paragraphs: [
      '현재까지 수집된 시장 데이터를 기준으로, 유사 메모 서비스들은 대부분 수동 태깅에 의존하고 있어 사용자의 정리 피로도가 높다는 공통된 페인포인트가 발견되었습니다.',
      '반면 SortOne은 AI가 작성 즉시 태그를 추천하고 분류까지 이어지는 흐름을 제공한다는 점에서 명확한 차별화 지점을 가집니다. 나머지 15% 분석은 가격 정책 비교를 중심으로 마무리할 예정입니다.'
    ]
  },
  'action-1': {
    title: '디자인 팀 검토 미팅 예약',
    aiSummary: [
      '신규 메모 작성 화면의 태그 UI 검토가 필요합니다.',
      '디자인 시스템 컴포넌트 재사용 여부를 함께 논의합니다.',
      '이번 주 내 일정 조율 후 미팅을 확정할 예정입니다.'
    ],
    paragraphs: [
      '디자인 팀과의 검토 미팅에서는 최근 업데이트된 메모 작성 화면의 태그 추천 UI와 하단 서식 툴바의 사용성을 중점적으로 논의할 예정입니다.',
      '특히 AI 추천 태그 칩의 색상 체계가 다른 화면의 카테고리 색상과 일관되게 유지되고 있는지 함께 점검하기로 했습니다.'
    ]
  },
  'action-2': {
    title: '사용자 인터뷰 질문지 리스트업',
    aiSummary: [
      '기존 메모 앱 사용 경험에 대한 질문을 우선 구성합니다.',
      'AI 자동분류 기능에 대한 기대와 우려를 함께 조사합니다.',
      '질문지 초안은 이번 주 중 팀 리뷰를 거칠 예정입니다.'
    ],
    paragraphs: [
      '사용자 인터뷰의 목적은 기존 메모 앱에서 느꼈던 정리의 어려움과, AI 자동분류 기능에 대한 기대치를 파악하는 것입니다.',
      '질문지는 크게 "현재 메모 습관", "분류 방식에 대한 불만", "AI 기능에 대한 신뢰도" 세 가지 축으로 구성할 예정입니다.'
    ]
  }
};

const DEFAULT_DETAIL = FALLBACK_DETAILS['analysis-2'];

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  const memo = id ? MemoStore.getMemoById(id) : null;

  if (memo) {
    renderMemoDetail(memo);
  } else {
    const fallback = (id && FALLBACK_DETAILS[id]) || DEFAULT_DETAIL;
    renderFallbackDetail(fallback);
  }

  document.getElementById('backBtn').addEventListener('click', () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = 'index.html';
    }
  });

  // 상단 네비게이션 추가 아이콘 버튼 동작 연결
  const shareBtn = document.getElementById('shareBtn');
  const editBtn = document.getElementById('editBtn');
  const deleteBtn = document.getElementById('deleteBtn');

  // 더미 데이터(fallback)일 경우에는 편집/삭제 버튼 숨김 처리
  if (!memo) {
    if (editBtn) editBtn.style.display = 'none';
    if (deleteBtn) deleteBtn.style.display = 'none';
  }

  // 1. 공유 버튼: 메모 제목 및 내용 클립보드 복사
  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      const title = memo ? memo.title : ((id && FALLBACK_DETAILS[id]) || DEFAULT_DETAIL).title;
      const paragraphs = memo ? [memo.content] : ((id && FALLBACK_DETAILS[id]) || DEFAULT_DETAIL).paragraphs;
      const textToCopy = `${title}\n\n${paragraphs.join('\n')}`;
      
      navigator.clipboard.writeText(textToCopy).then(() => {
        alert('메모가 클립보드에 복사되었습니다.');
      }).catch((err) => {
        console.error('클립보드 복사 실패:', err);
      });
    });
  }

  // 2. 편집 버튼: add.html 편집 페이지로 이동
  if (editBtn && memo) {
    editBtn.addEventListener('click', () => {
      window.location.href = `add.html?id=${memo.id}`;
    });
  }

  // 3. 삭제 버튼: 커스텀 삭제 확인 모달 팝업 제어
  if (deleteBtn && memo) {
    const deleteModal = document.getElementById('deleteModal');
    const modalCancelBtn = document.getElementById('modalCancelBtn');
    const modalConfirmBtn = document.getElementById('modalConfirmBtn');

    deleteBtn.addEventListener('click', () => {
      deleteModal.classList.add('is-active');
    });

    modalCancelBtn.addEventListener('click', () => {
      deleteModal.classList.remove('is-active');
    });

    modalConfirmBtn.addEventListener('click', () => {
      MemoStore.deleteMemo(memo.id);
      deleteModal.classList.remove('is-active');
      window.location.href = 'index.html'; // 삭제 후 메인 홈으로 이동
    });

    deleteModal.addEventListener('click', (e) => {
      if (e.target === deleteModal) {
        deleteModal.classList.remove('is-active');
      }
    });
  }
});

/** 실제 저장된 메모(Memo) 데이터를 상세 화면에 렌더링 */
function renderMemoDetail(memo) {
  renderSummary(
    memo.aiSummary && memo.aiSummary.length > 0 ? memo.aiSummary : generateDummySummary(memo.content),
    memo
  );

  // URL에서 highlight 문장 가져오기
  const params = new URLSearchParams(window.location.search);
  const highlightText = params.get('highlight');
  
  let paragraphHtml = memo.content;
  if (highlightText) {
    // 형광펜 대상 텍스트 내 HTML 태그 및 엔티티 제거 후 대조
    const cleanHighlight = stripHtmlTags(highlightText);
    if (cleanHighlight && paragraphHtml.includes(cleanHighlight)) {
      paragraphHtml = paragraphHtml.replace(
        cleanHighlight,
        `<span style="background-color: #FFF27F; font-weight: bold; padding: 2px 4px; border-radius: 4px; color: #1D5B60;">${cleanHighlight}</span>`
      );
    }
  }

  const bodyCard = document.getElementById('bodyCard');
  bodyCard.innerHTML = `
    <h1 class="body-card__title">${escapeHtml(memo.title)}</h1>
    <span class="body-card__meta">${formatRelativeDate(memo.createdAt)}</span>
    <div class="body-card__paragraph">${paragraphHtml}</div>
    <div class="body-card__tags">
      ${memo.tags.map((t) => `<span class="tag ${getTagClass(t)}">#${t}</span>`).join('')}
    </div>
  `;

  // 하얀색 카드 클릭 시 메모 편집(add.html?id=ID) 페이지로 연결
  bodyCard.addEventListener('click', () => {
    window.location.href = `add.html?id=${memo.id}`;
  });
}

/** ai.html의 더미 분석/실행 항목 등 메모가 아닌 콘텐츠를 상세 화면에 렌더링 */
function renderFallbackDetail(detailData) {
  renderSummary(detailData.aiSummary);

  const params = new URLSearchParams(window.location.search);
  const highlightText = params.get('highlight');

  const bodyCard = document.getElementById('bodyCard');
  
  let paragraphsHtml = detailData.paragraphs
    .map((p) => {
      let pHtml = escapeHtml(p);
      if (highlightText) {
        const cleanHighlight = stripHtmlTags(highlightText);
        if (cleanHighlight && pHtml.includes(cleanHighlight)) {
          pHtml = pHtml.replace(
            cleanHighlight,
            `<span style="background-color: #FFF27F; font-weight: bold; padding: 2px 4px; border-radius: 4px; color: #1D5B60;">${cleanHighlight}</span>`
          );
        }
      }
      return `<p class="body-card__paragraph">${pHtml}</p>`;
    })
    .join('');

  bodyCard.innerHTML = `
    ${detailData.title ? `<h1 class="body-card__title">${escapeHtml(detailData.title)}</h1>` : ''}
    ${paragraphsHtml}
  `;
}

/** AI 3줄 요약 카드 렌더링 */
function renderSummary(summaryList, memo) {
  const listEl = document.getElementById('summaryList');
  const metaEl = document.getElementById('summaryMeta');

  // 카테고리 + 제목 메타 렌더링
  if (metaEl && memo) {
    const categoryClass = getTagClass(memo.category || '');
    const categoryLabel = memo.category || '';
    metaEl.innerHTML = `
      <div class="summary-card__meta-inner">
        ${categoryLabel ? `<span class="tag ${categoryClass} summary-card__meta-tag">#${escapeHtml(categoryLabel)}</span>` : ''}
        <span class="summary-card__meta-title">${escapeHtml(memo.title || '제목 없음')}</span>
      </div>
    `;
  } else if (metaEl) {
    metaEl.innerHTML = '';
  }

  if (!summaryList || summaryList.length === 0) {
    listEl.innerHTML = `<p class="summary-card__empty">AI 요약을 준비 중이에요.</p>`;
    return;
  }

  listEl.innerHTML = summaryList
    .map(
      (line) => `
        <div class="summary-card__item">
          <span class="summary-card__bullet">&#8226;</span>
          <span>${escapeHtml(stripHtmlTags(line))}</span>
        </div>
      `
    )
    .join('');
}

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
  let clean = html.replace(/<[^>]*>/g, ' ');
  clean = clean.replace(/&nbsp;/gi, ' ');
  clean = clean.replace(/&lt;/gi, '<').replace(/&gt;/gi, '>');
  clean = clean.replace(/&amp;/gi, '&').replace(/&quot;/gi, '"');
  return clean.replace(/\s+/g, ' ').trim();
}
