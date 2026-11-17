/**
 * 호박(🎃 호박) 중고거래 웹서비스 - 상품목록 페이지 스크립트 (list.js)
 * 단독 페이지(list.html) 및 통합 페이지(index.html) 모두에서 재사용 가능한
 * window.HobakListPage 모듈 인터페이스를 제공합니다.
 */

(function () {
  const ITEMS_PER_PAGE = 12;

  const state = {
    container: null,
    onSelectItem: null,
    onClickWrite: null,
    keyword: '',
    category: '전체',
    location: '부산 중구 전체',
    onlyAvailable: false,
    sortBy: 'latest',
    currentPage: 1,
    sortPanelOpen: false,
    initialized: false
  };

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getShortDongName(fullLocation) {
    if (!fullLocation) return '중앙동';
    return fullLocation.replace(/^부산\s*중구\s*/, '').trim() || fullLocation;
  }

  function showToast(message) {
    let toast = document.getElementById('hobak-list-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'hobak-list-toast';
      toast.className = 'hobak-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    if (toast._timer) clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2200);
  }

  function buildShellHTML() {
    const categories = window.HOBAK_CATEGORIES || [
      '전체', '남성패션/잡화', '여성패션/잡화', '디지털기기',
      '생활가전', '스포츠/레저', '가구/인테리어', '취미/게임/음반', '도서/티켓/문구'
    ];
    const locations = window.HOBAK_LOCATIONS || [
      '부산 중구 전체', '부산 중구 중앙동4가', '부산 중구 대청동4가',
      '부산 중구 남포동', '부산 중구 부평동2가', '부산 중구 광복동',
      '부산 중구 보수동1가', '부산 중구 동광동', '부산 중구 영주동'
    ];
    const keywords = window.HOBAK_POPULAR_KEYWORDS || [
      '나이키', '조던', '갤럭시', '패딩', '포터', '가민',
      '아이폰', '밥솥', '폴로', '캠핑', '머플러', '가방'
    ];

    return `
      <div class="hobak-list-page">
        <!-- 1. 상단 헤더 & 검색 영역 -->
        <header class="hobak-header">
          <div class="hobak-list-container">
            <div class="hobak-header-top">
              <a href="javascript:void(0)" class="hobak-logo" data-action="reset-all" title="호박 홈 (검색/필터 초기화)">
                <span class="hobak-logo-icon" aria-hidden="true">🎃</span>
                <span class="hobak-logo-text">호박</span>
              </a>

              <form class="hobak-search-form" data-role="search-form" role="search">
                <div class="hobak-search-input-wrap">
                  <input
                    type="text"
                    class="hobak-search-input"
                    data-role="search-input"
                    placeholder="물건이나 동네를 검색해보세요"
                    autocomplete="off"
                    aria-label="물건이나 동네 검색"
                  />
                  <button
                    type="button"
                    class="hobak-search-clear"
                    data-action="clear-search"
                    title="검색어 지우기"
                    aria-label="검색어 지우기"
                  >✕</button>
                  <button
                    type="submit"
                    class="hobak-search-btn"
                    title="검색"
                    aria-label="검색"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                  </button>
                </div>
              </form>

              <button type="button" class="hobak-write-btn" data-action="click-write">
                <span>+ 글쓰기 (내 물건 팔기)</span>
              </button>
            </div>

            <!-- 서비스 & 카테고리 칩 바 -->
            <div class="hobak-chip-bar-wrap">
              <nav class="hobak-chip-bar" aria-label="카테고리 필터">
                <button type="button" class="hobak-service-chip" data-action="service-chip">
                  <span>🛍️ 중고거래</span>
                </button>
                <span class="hobak-chip-divider" aria-hidden="true"></span>
                <div data-role="category-chips" style="display: contents;">
                  ${categories.map(cat => `
                    <button
                      type="button"
                      class="hobak-category-chip ${cat === state.category ? 'active' : ''}"
                      data-category="${escapeHtml(cat)}"
                    >${escapeHtml(cat)}</button>
                  `).join('')}
                </div>
              </nav>
            </div>
          </div>
        </header>

        <!-- 2. 검색 결과 타이틀 & 필터 바 -->
        <section class="hobak-subheader">
          <div class="hobak-list-container">
            <div class="hobak-result-title-row">
              <h1 class="hobak-result-title" data-role="result-title">
                <span>🎃 중앙동 중고거래 검색 결과</span>
                <span class="hobak-result-count-badge" data-role="result-count">총 10개</span>
              </h1>
            </div>

            <div class="hobak-filter-bar">
              <div class="hobak-filter-left">
                <button type="button" class="hobak-filter-btn" data-action="toggle-sort-panel">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="4" y1="21" x2="4" y2="14"></line>
                    <line x1="4" y1="10" x2="4" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12" y2="3"></line>
                    <line x1="20" y1="21" x2="20" y2="16"></line>
                    <line x1="20" y1="12" x2="20" y2="3"></line>
                    <line x1="1" y1="14" x2="7" y2="14"></line>
                    <line x1="9" y1="8" x2="15" y2="8"></line>
                    <line x1="17" y1="16" x2="23" y2="16"></line>
                  </svg>
                  <span>필터</span>
                </button>

                <div class="hobak-location-select-wrap">
                  <span class="hobak-location-icon" aria-hidden="true">📍</span>
                  <select class="hobak-location-select" data-role="location-select" aria-label="동네 선택">
                    ${locations.map(loc => `
                      <option value="${escapeHtml(loc)}" ${loc === state.location ? 'selected' : ''}>
                        ${escapeHtml(loc)}
                      </option>
                    `).join('')}
                  </select>
                </div>

                <button
                  type="button"
                  class="hobak-available-toggle ${state.onlyAvailable ? 'active' : ''}"
                  data-action="toggle-available"
                  aria-pressed="${state.onlyAvailable}"
                >
                  <span>✓ 거래가능만 보기</span>
                </button>
              </div>

              <div class="hobak-filter-right">
                <button
                  type="button"
                  class="hobak-reset-data-btn"
                  data-action="restore-initial-data"
                  title="기본 10개 매물 데이터로 초기화"
                >
                  <span>↺ 초기 데이터 복원</span>
                </button>
              </div>
            </div>

            <!-- 정렬 옵션 패널 (필터 버튼 클릭 시 토글) -->
            <div class="hobak-sort-panel" data-role="sort-panel">
              <span class="hobak-sort-label">정렬 기준:</span>
              <button type="button" class="hobak-sort-chip active" data-sort="latest">최신순</button>
              <button type="button" class="hobak-sort-chip" data-sort="popular">인기순(관심순)</button>
              <button type="button" class="hobak-sort-chip" data-sort="priceAsc">낮은 가격순</button>
              <button type="button" class="hobak-sort-chip" data-sort="priceDesc">높은 가격순</button>
            </div>
          </div>
        </section>

        <!-- 3. 메인 2단 레이아웃 (좌측 3열 그리드 + 우측 인기 검색어 사이드바) -->
        <main class="hobak-list-container">
          <div class="hobak-main-layout">
            <!-- 좌측 상품 그리드 영역 -->
            <section class="hobak-grid-section" aria-label="중고거래 매물 목록">
              <div class="hobak-product-grid" data-role="product-grid"></div>

              <!-- 4. 페이지네이션 바 -->
              <nav class="hobak-pagination" data-role="pagination" aria-label="페이지네이션">
                <button type="button" class="hobak-page-btn" data-page="prev" aria-label="이전 페이지">&lt;</button>
                <button type="button" class="hobak-page-btn active" data-page="1">1</button>
                <button type="button" class="hobak-page-btn" data-page="2">2</button>
                <button type="button" class="hobak-page-btn" data-page="3">3</button>
                <button type="button" class="hobak-page-btn" data-page="4">4</button>
                <button type="button" class="hobak-page-btn" data-page="5">5</button>
                <button type="button" class="hobak-page-btn" data-page="next" aria-label="다음 페이지">&gt;</button>
              </nav>
            </section>

            <!-- 우측 인기 검색어 사이드바 -->
            <aside class="hobak-sidebar" aria-label="인기 검색어">
              <div class="hobak-sidebar-card">
                <h2 class="hobak-sidebar-title">
                  <span>🔍 인기 검색어</span>
                </h2>
                <div class="hobak-keyword-tags" data-role="popular-keywords">
                  ${keywords.map(kw => `
                    <button
                      type="button"
                      class="hobak-keyword-tag ${kw === state.keyword ? 'active' : ''}"
                      data-keyword="${escapeHtml(kw)}"
                    >${escapeHtml(kw)}</button>
                  `).join('')}
                </div>
              </div>
            </aside>
          </div>
        </main>

        <!-- 5. 하단 푸터 -->
        <footer class="hobak-footer">
          <div class="hobak-list-container">
            <div class="hobak-footer-top">
              <div class="hobak-footer-brand">
                <a href="javascript:void(0)" class="hobak-footer-logo" data-action="reset-all">
                  <span>🎃</span>
                  <span>호박</span>
                </a>
                <a href="javascript:void(0)" class="hobak-app-download-btn" data-action="app-download">
                  <span>호박 앱 다운로드</span>
                  <span>↗</span>
                </a>
              </div>

              <div class="hobak-footer-socials">
                <a href="javascript:void(0)" class="hobak-social-link" aria-label="YouTube" title="YouTube">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
                <a href="javascript:void(0)" class="hobak-social-link" aria-label="Instagram" title="Instagram">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
                <a href="javascript:void(0)" class="hobak-social-link" aria-label="Facebook" title="Facebook">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                  </svg>
                </a>
              </div>
            </div>

            <div class="hobak-footer-links-grid">
              <div>
                <h3 class="hobak-footer-col-title">탐색</h3>
                <ul class="hobak-footer-col-list">
                  <li><a href="javascript:void(0)" data-action="reset-all">중고거래</a></li>
                  <li><a href="javascript:void(0)">동네업체</a></li>
                  <li><a href="javascript:void(0)">호박알바</a></li>
                  <li><a href="javascript:void(0)">부동산</a></li>
                  <li><a href="javascript:void(0)">중고차</a></li>
                  <li><a href="javascript:void(0)">동네생활</a></li>
                  <li><a href="javascript:void(0)">모임</a></li>
                  <li><a href="javascript:void(0)">채팅하기</a></li>
                  <li><a href="javascript:void(0)">동네지도</a></li>
                </ul>
              </div>
              <div>
                <h3 class="hobak-footer-col-title">비즈니스</h3>
                <ul class="hobak-footer-col-list">
                  <li><a href="javascript:void(0)">호박 비즈니스</a></li>
                  <li><a href="javascript:void(0)">제휴 문의</a></li>
                  <li><a href="javascript:void(0)">광고 문의</a></li>
                </ul>
              </div>
              <div>
                <h3 class="hobak-footer-col-title">법적 고지</h3>
                <ul class="hobak-footer-col-list">
                  <li><a href="javascript:void(0)">이용약관</a></li>
                  <li><a href="javascript:void(0)">개인정보처리방침</a></li>
                  <li><a href="javascript:void(0)">위치기반서비스 이용약관</a></li>
                </ul>
              </div>
              <div>
                <h3 class="hobak-footer-col-title">문의</h3>
                <ul class="hobak-footer-col-list">
                  <li><a href="javascript:void(0)">고객센터</a></li>
                  <li><a href="javascript:void(0)">공지사항</a></li>
                  <li><a href="javascript:void(0)">자주 묻는 질문</a></li>
                </ul>
              </div>
              <div>
                <h3 class="hobak-footer-col-title">호박 글로벌</h3>
                <ul class="hobak-footer-col-list">
                  <li><a href="javascript:void(0)">캐나다</a></li>
                  <li><a href="javascript:void(0)">미국</a></li>
                  <li><a href="javascript:void(0)">일본</a></li>
                  <li><a href="javascript:void(0)">영국</a></li>
                </ul>
              </div>
            </div>

            <div class="hobak-footer-bottom">
              <div class="hobak-company-name">(주)호박마켓</div>
              <div class="hobak-company-lines">
                <p>대표 김호박, 박단호 | 사업자번호 375-87-00088</p>
                <p>직업정보제공사업 신고번호 J1200020200016</p>
                <p>통신판매업 신고번호 2026-부산중구-0051</p>
                <p>호스팅 사업자 Amazon Web Services(AWS)</p>
                <p>주소 부산광역시 중구 중앙대로 100 (중앙동4가, 호박타워 10층)</p>
                <p>전화 1544-9796 | 고객문의 cs@hobakservice.com</p>
              </div>

              <div class="hobak-legal-links">
                <a href="javascript:void(0)">이용약관</a>
                <a href="javascript:void(0)" class="bold">개인정보처리방침</a>
                <a href="javascript:void(0)">운영정책</a>
                <a href="javascript:void(0)">위치기반서비스 이용약관</a>
                <a href="javascript:void(0)">이용자보호 비전과 계획</a>
                <a href="javascript:void(0)">청소년보호정책</a>
              </div>

              <div class="hobak-footer-locale">
                <span>🌐 한국</span>
                <span>⌄</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    `;
  }

  function getFilteredAndSortedItems() {
    const allItems = (window.HobakStore && typeof window.HobakStore.getItems === 'function')
      ? window.HobakStore.getItems()
      : [];

    const kw = (state.keyword || '').trim().toLowerCase();
    const cat = state.category || '전체';
    const loc = state.location || '부산 중구 전체';
    const onlyAvail = Boolean(state.onlyAvailable);

    const filtered = allItems.filter(item => {
      if (cat !== '전체' && item.category !== cat) {
        return false;
      }

      if (loc !== '부산 중구 전체') {
        const itemLoc = (item.seller && item.seller.location) || '';
        const shortLoc = getShortDongName(loc);
        if (!itemLoc.includes(loc) && !itemLoc.includes(shortLoc)) {
          return false;
        }
      }

      if (onlyAvail) {
        const isAvail =
          window.HobakStore && typeof window.HobakStore.isAvailableStatus === 'function'
            ? window.HobakStore.isAvailableStatus(item.status)
            : (item.status === '판매중' || item.status === '거래가능' || !item.status);
        if (!isAvail) {
          return false;
        }
      }

      if (kw) {
        const title = (item.title || '').toLowerCase();
        const desc = (item.description || '').toLowerCase();
        const category = (item.category || '').toLowerCase();
        const sellerLoc = ((item.seller && item.seller.location) || '').toLowerCase();
        const sellerName = ((item.seller && item.seller.nickname) || '').toLowerCase();
        const matched =
          title.includes(kw) ||
          desc.includes(kw) ||
          category.includes(kw) ||
          sellerLoc.includes(kw) ||
          sellerName.includes(kw);
        if (!matched) return false;
      }

      return true;
    });

    if (state.sortBy === 'popular') {
      filtered.sort((a, b) => (Number(b.likes) || 0) - (Number(a.likes) || 0));
    } else if (state.sortBy === 'priceAsc') {
      filtered.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    } else if (state.sortBy === 'priceDesc') {
      filtered.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    }

    return filtered;
  }

  function renderResultHeader(filteredCount) {
    if (!state.container) return;
    const titleEl = state.container.querySelector('[data-role="result-title"]');
    if (!titleEl) return;

    const dongLabel = state.location === '부산 중구 전체'
      ? '중앙동'
      : getShortDongName(state.location);

    const parts = [`🎃 ${dongLabel}`];
    if (state.category && state.category !== '전체') {
      parts.push(`[${state.category}]`);
    }
    if (state.keyword && state.keyword.trim()) {
      parts.push(`'${state.keyword.trim()}'`);
    }
    parts.push('중고거래 검색 결과');

    titleEl.innerHTML = `
      <span>${escapeHtml(parts.join(' '))}</span>
      <span class="hobak-result-count-badge" data-role="result-count">총 ${filteredCount}개</span>
    `;
  }

  function renderControlStates() {
    if (!state.container) return;

    const searchInput = state.container.querySelector('[data-role="search-input"]');
    if (searchInput && searchInput.value !== state.keyword) {
      searchInput.value = state.keyword;
    }

    const clearBtn = state.container.querySelector('[data-action="clear-search"]');
    if (clearBtn) {
      clearBtn.classList.toggle('visible', Boolean(state.keyword && state.keyword.trim()));
    }

    const categoryButtons = state.container.querySelectorAll('[data-category]');
    categoryButtons.forEach(btn => {
      const isMatch = btn.getAttribute('data-category') === state.category;
      btn.classList.toggle('active', isMatch);
    });

    const locSelect = state.container.querySelector('[data-role="location-select"]');
    if (locSelect && locSelect.value !== state.location) {
      locSelect.value = state.location;
    }

    const availBtn = state.container.querySelector('[data-action="toggle-available"]');
    if (availBtn) {
      availBtn.classList.toggle('active', state.onlyAvailable);
      availBtn.setAttribute('aria-pressed', String(state.onlyAvailable));
    }

    const filterBtn = state.container.querySelector('[data-action="toggle-sort-panel"]');
    const sortPanel = state.container.querySelector('[data-role="sort-panel"]');
    if (filterBtn) {
      filterBtn.classList.toggle('active', state.sortPanelOpen || state.sortBy !== 'latest');
    }
    if (sortPanel) {
      sortPanel.classList.toggle('open', state.sortPanelOpen);
    }

    const sortChips = state.container.querySelectorAll('[data-sort]');
    sortChips.forEach(chip => {
      chip.classList.toggle('active', chip.getAttribute('data-sort') === state.sortBy);
    });

    const kwContainer = state.container.querySelector('[data-role="popular-keywords"]');
    if (kwContainer && Array.isArray(window.HOBAK_POPULAR_KEYWORDS)) {
      kwContainer.innerHTML = window.HOBAK_POPULAR_KEYWORDS.map(kw => `
        <button
          type="button"
          class="hobak-keyword-tag ${state.keyword && state.keyword.trim() === kw ? 'active' : ''}"
          data-keyword="${escapeHtml(kw)}"
        >${escapeHtml(kw)}</button>
      `).join('');
    } else {
      const keywordTags = state.container.querySelectorAll('[data-keyword]');
      keywordTags.forEach(tag => {
        const kw = tag.getAttribute('data-keyword');
        tag.classList.toggle('active', Boolean(state.keyword && state.keyword.trim() === kw));
      });
    }
  }

  function renderProductGrid(filteredItems) {
    if (!state.container) return;
    const gridEl = state.container.querySelector('[data-role="product-grid"]');
    if (!gridEl) return;

    if (filteredItems.length === 0) {
      gridEl.innerHTML = `
        <div class="hobak-empty-state">
          <div class="hobak-empty-icon">🎃</div>
          <p class="hobak-empty-title">조건에 맞는 중고거래 매물이 없어요</p>
          <p class="hobak-empty-desc">다른 검색어나 동네, 카테고리를 선택해 보세요.</p>
          <button type="button" class="hobak-empty-reset-btn" data-action="reset-all">
            전체 매물 다시 보기
          </button>
        </div>
      `;
      return;
    }

    const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
    const effectivePage = Math.min(state.currentPage, totalPages);
    const startIdx = (effectivePage - 1) * ITEMS_PER_PAGE;
    const visibleItems = filteredItems.slice(startIdx, startIdx + ITEMS_PER_PAGE);

    gridEl.innerHTML = visibleItems.map(item => {
      const thumbUrl = (Array.isArray(item.images) && item.images[0])
        ? item.images[0]
        : 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=900&q=85';

      const formattedPrice = (window.HobakStore && typeof window.HobakStore.formatPrice === 'function')
        ? window.HobakStore.formatPrice(item.price)
        : (Number(item.price || 0).toLocaleString('ko-KR') + '원');

      const sellerNickname = (item.seller && item.seller.nickname) || '락락';
      const shortDong = getShortDongName(item.seller && item.seller.location);
      const timeAgo = item.timeAgo || '방금 전';
      const rawStatus = item.status || '판매중';
      const isReserved = rawStatus === '예약중';
      const isDone = rawStatus === '거래완료';
      const statusLabel = isReserved ? '예약중' : isDone ? '거래완료' : '판매중';
      const statusTagClass = isReserved ? 'reserved' : isDone ? 'done' : 'selling';
      const isLiked = (window.HobakStore && typeof window.HobakStore.isLiked === 'function')
        ? window.HobakStore.isLiked(item.id)
        : false;

      let statusBadgeHtml = '';
      if (isReserved) {
        statusBadgeHtml = `<span class="hobak-status-overlay-badge reserved">예약중</span>`;
      } else if (isDone) {
        statusBadgeHtml = `<span class="hobak-status-overlay-badge done">거래완료</span>`;
      }

      const statusTagHtml = `<span class="hobak-card-status-tag ${statusTagClass}">${escapeHtml(statusLabel)}</span>`;
      const hobakPayHtml = item.hobakPay
        ? `<span class="hobak-pay-badge">호박페이</span>`
        : '';

      const heartChar = isLiked ? '♥' : '♡';
      const heartClass = isLiked ? 'liked-heart' : '';

      return `
        <article
          class="hobak-product-card ${isDone ? 'is-sold' : ''}"
          data-item-id="${escapeHtml(item.id)}"
          tabindex="0"
          role="link"
          aria-label="${escapeHtml(item.title)} (${escapeHtml(statusLabel)}) - ${escapeHtml(formattedPrice)}"
        >
          <div class="hobak-card-thumb-wrap">
            ${statusBadgeHtml}
            <img
              class="hobak-card-thumb"
              src="${escapeHtml(thumbUrl)}"
              alt="${escapeHtml(item.title)}"
              loading="lazy"
              onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=900&q=85';"
            />
          </div>
          <div class="hobak-card-body">
            <h3 class="hobak-card-title">${escapeHtml(item.title)}</h3>
            <div class="hobak-card-price">${escapeHtml(formattedPrice)}</div>
            <div class="hobak-card-seller-row">
              <span class="hobak-card-seller-badge" title="작성자 닉네임">🎃 ${escapeHtml(sellerNickname)}</span>
              <span class="hobak-card-meta" style="margin:0;">${escapeHtml(shortDong)} · ${escapeHtml(timeAgo)}</span>
            </div>
            <div class="hobak-card-footer">
              <div class="hobak-card-badges-left">
                ${statusTagHtml}
                ${hobakPayHtml}
              </div>
              <div class="hobak-card-stats">
                <span class="${heartClass}">${heartChar} ${Number(item.likes) || 0}</span>
                <span>·</span>
                <span>💬 ${Number(item.chats) || 0}</span>
              </div>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  function renderPagination() {
    if (!state.container) return;
    const paginationEl = state.container.querySelector('[data-role="pagination"]');
    if (!paginationEl) return;

    const buttons = paginationEl.querySelectorAll('[data-page]');
    buttons.forEach(btn => {
      const pageAttr = btn.getAttribute('data-page');
      if (pageAttr === 'prev') {
        btn.disabled = state.currentPage <= 1;
      } else if (pageAttr === 'next') {
        btn.disabled = state.currentPage >= 5;
      } else {
        const pageNum = Number(pageAttr);
        btn.classList.toggle('active', pageNum === state.currentPage);
      }
    });
  }

  function renderAll() {
    const filteredItems = getFilteredAndSortedItems();
    renderControlStates();
    renderResultHeader(filteredItems.length);
    renderProductGrid(filteredItems);
    renderPagination();
  }

  function handleNavigateToItem(itemId) {
    if (typeof state.onSelectItem === 'function') {
      state.onSelectItem(Number(itemId));
    } else {
      window.location.href = `detail.html?id=${encodeURIComponent(itemId)}`;
    }
  }

  function handleNavigateToWrite() {
    const goWrite = () => {
      if (typeof state.onClickWrite === 'function') {
        state.onClickWrite();
      } else {
        window.location.href = 'write.html';
      }
    };

    if (window.HobakAuth && typeof window.HobakAuth.requireAuth === 'function') {
      window.HobakAuth.requireAuth(goWrite);
    } else {
      goWrite();
    }
  }

  function resetAllFilters(toastMsg) {
    state.keyword = '';
    state.category = '전체';
    state.location = '부산 중구 전체';
    state.onlyAvailable = false;
    state.sortBy = 'latest';
    state.currentPage = 1;
    renderAll();
    if (toastMsg) showToast(toastMsg);
  }

  function bindEvents(rootEl) {
    if (rootEl._hobakListBound) return;
    rootEl._hobakListBound = true;

    // 폼 검색 제출 이벤트
    rootEl.addEventListener('submit', e => {
      const form = e.target.closest('[data-role="search-form"]');
      if (!form) return;
      e.preventDefault();
      const input = form.querySelector('[data-role="search-input"]');
      state.keyword = input ? input.value.trim() : '';
      if (state.keyword && window.HobakStore && typeof window.HobakStore.incrementKeywordSearch === 'function') {
        window.HobakStore.incrementKeywordSearch(state.keyword);
      }
      state.currentPage = 1;
      renderAll();
    });

    // 검색창 실시간 입력 이벤트
    rootEl.addEventListener('input', e => {
      const input = e.target.closest('[data-role="search-input"]');
      if (!input) return;
      state.keyword = input.value;
      state.currentPage = 1;
      renderAll();
    });

    // 동네 드롭다운 변경 이벤트
    rootEl.addEventListener('change', e => {
      const select = e.target.closest('[data-role="location-select"]');
      if (!select) return;
      state.location = select.value;
      state.currentPage = 1;
      renderAll();
    });

    // 클릭 이벤트 위임
    rootEl.addEventListener('click', e => {
      // 1) 상품 카드 클릭
      const card = e.target.closest('.hobak-product-card[data-item-id]');
      if (card) {
        const itemId = card.getAttribute('data-item-id');
        if (itemId) handleNavigateToItem(itemId);
        return;
      }

      // 2) 카테고리 칩 클릭
      const catChip = e.target.closest('[data-category]');
      if (catChip) {
        state.category = catChip.getAttribute('data-category') || '전체';
        state.currentPage = 1;
        renderAll();
        return;
      }

      // 3) 인기 검색어 태그 클릭
      const kwTag = e.target.closest('[data-keyword]');
      if (kwTag) {
        const clickedKw = kwTag.getAttribute('data-keyword') || '';
        state.keyword = state.keyword.trim() === clickedKw ? '' : clickedKw;
        if (state.keyword && window.HobakStore && typeof window.HobakStore.incrementKeywordSearch === 'function') {
          window.HobakStore.incrementKeywordSearch(state.keyword);
        }
        state.currentPage = 1;
        renderAll();
        return;
      }

      // 4) 정렬 기준 칩 클릭
      const sortChip = e.target.closest('[data-sort]');
      if (sortChip) {
        state.sortBy = sortChip.getAttribute('data-sort') || 'latest';
        state.currentPage = 1;
        renderAll();
        return;
      }

      // 5) 페이지네이션 클릭
      const pageBtn = e.target.closest('[data-page]');
      if (pageBtn && !pageBtn.disabled) {
        const pageAttr = pageBtn.getAttribute('data-page');
        if (pageAttr === 'prev') {
          state.currentPage = Math.max(1, state.currentPage - 1);
        } else if (pageAttr === 'next') {
          state.currentPage = Math.min(5, state.currentPage + 1);
        } else {
          state.currentPage = Number(pageAttr) || 1;
        }
        renderAll();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // 6) 기타 data-action 버튼
      const actionEl = e.target.closest('[data-action]');
      if (!actionEl) return;

      const action = actionEl.getAttribute('data-action');
      if (action === 'reset-all') {
        e.preventDefault();
        resetAllFilters('검색 및 필터가 초기화되었습니다.');
      } else if (action === 'service-chip') {
        state.category = '전체';
        state.currentPage = 1;
        renderAll();
      } else if (action === 'clear-search') {
        state.keyword = '';
        state.currentPage = 1;
        renderAll();
        const searchInput = rootEl.querySelector('[data-role="search-input"]');
        if (searchInput) searchInput.focus();
      } else if (action === 'click-write') {
        handleNavigateToWrite();
      } else if (action === 'toggle-available') {
        state.onlyAvailable = !state.onlyAvailable;
        state.currentPage = 1;
        renderAll();
      } else if (action === 'toggle-sort-panel') {
        state.sortPanelOpen = !state.sortPanelOpen;
        renderControlStates();
      } else if (action === 'restore-initial-data') {
        if (window.HobakStore && typeof window.HobakStore.resetToInitialAsync === 'function') {
          window.HobakStore.resetToInitialAsync().then(() => {
            resetAllFilters('Supabase DB 및 초기 매물 데이터(10개)가 복원되었습니다.');
          });
        } else if (window.HobakStore && typeof window.HobakStore.resetToInitial === 'function') {
          window.HobakStore.resetToInitial();
          resetAllFilters('초기 매물 데이터(10개)로 복원되었습니다.');
        }
      } else if (action === 'app-download') {
        showToast('호박 앱 다운로드 페이지로 이동합니다. 🎃');
      }
    });

    // 키보드 접근성 (상품 카드 Enter / Space)
    rootEl.addEventListener('keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const card = e.target.closest('.hobak-product-card[data-item-id]');
      if (!card) return;
      e.preventDefault();
      const itemId = card.getAttribute('data-item-id');
      if (itemId) handleNavigateToItem(itemId);
    });
  }

  function applyUrlParams() {
    try {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q') || params.get('keyword');
      const cat = params.get('category');
      const loc = params.get('location');
      if (q) state.keyword = q;
      if (cat) state.category = cat;
      if (loc) state.location = loc;
    } catch (e) {}
  }

  const HobakListPage = {
    init(options = {}) {
      let target = null;
      if (typeof options.container === 'string') {
        target = document.querySelector(options.container);
      } else if (options.container instanceof HTMLElement) {
        target = options.container;
      }

      if (!target) {
        target =
          document.getElementById('hobak-list-app') ||
          document.getElementById('list-container') ||
          document.getElementById('list-view') ||
          document.getElementById('list-page') ||
          document.body;
      }

      state.container = target;
      if (typeof options.onSelectItem === 'function') {
        state.onSelectItem = options.onSelectItem;
      }
      if (typeof options.onClickWrite === 'function') {
        state.onClickWrite = options.onClickWrite;
      }

      // 컨테이너 내부에 상품 그리드 DOM이 없으면 쉘 템플릿을 렌더링
      if (!target.querySelector('[data-role="product-grid"]')) {
        target.innerHTML = buildShellHTML();
      }

      if (!state.initialized) {
        applyUrlParams();
        state.initialized = true;
      }

      bindEvents(target);
      renderAll();
      return this;
    },

    refresh() {
      if (!state.container) {
        this.init();
        return this;
      }
      renderAll();
      return this;
    },

    setKeyword(keyword) {
      state.keyword = keyword || '';
      state.currentPage = 1;
      renderAll();
    },

    setCategory(category) {
      state.category = category || '전체';
      state.currentPage = 1;
      renderAll();
    },

    resetFilters() {
      resetAllFilters();
    }
  };

  window.HobakListPage = HobakListPage;

  // 단독 페이지(list.html)에서 로드될 때 자동 초기화
  document.addEventListener('DOMContentLoaded', () => {
    const standaloneRoot = document.getElementById('hobak-list-app');
    if (standaloneRoot && standaloneRoot.getAttribute('data-auto-init') !== 'false' && !state.container) {
      HobakListPage.init({ container: standaloneRoot });
    }
  });
})();
