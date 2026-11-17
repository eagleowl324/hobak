/**
 * 호박(Hobak) 중고거래 웹서비스 - 상품상세 페이지 모듈 (detail.js)
 * 단독 페이지(detail.html) 및 통합 페이지(index.html) 모두에서 재사용 가능한
 * window.HobakDetailPage 인터페이스를 제공합니다.
 */

(function () {
  let activeContainer = null;
  let currentItemId = 1;
  let currentSlideIndex = 0;
  let onCloseCallback = null;
  let onDeletedCallback = null;
  let onEditCallback = null;

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getMannerEmoji(temp) {
    const t = Number(temp) || 36.5;
    if (t >= 50) return '😮';
    if (t >= 43) return '😄';
    if (t >= 37.5) return '🙂';
    return '😐';
  }

  function showToast(message) {
    let toastEl = document.getElementById('hobak-global-toast');
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.id = 'hobak-global-toast';
      toastEl.className = 'hobak-toast';
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = message;
    toastEl.classList.add('show');
    clearTimeout(toastEl._hideTimer);
    toastEl._hideTimer = setTimeout(() => {
      toastEl.classList.remove('show');
    }, 2400);
  }

  function resolveItemIdFromUrl() {
    try {
      const params = new URLSearchParams(window.location.search);
      const idParam = params.get('id');
      if (idParam && !isNaN(Number(idParam))) {
        return Number(idParam);
      }
    } catch (e) {}
    return 1;
  }

  function resolveContainer(containerArg) {
    if (containerArg instanceof HTMLElement) return containerArg;
    if (typeof containerArg === 'string') {
      const el = document.querySelector(containerArg);
      if (el) return el;
    }
    return (
      document.getElementById('hobak-detail-container') ||
      document.getElementById('detail-container') ||
      document.body
    );
  }

  function handleClose() {
    if (typeof onCloseCallback === 'function') {
      onCloseCallback();
    } else {
      window.location.href = 'list.html';
    }
  }

  async function handleDelete(item) {
    if (!item) return;
    const confirmed = window.confirm(`'${item.title}' 매물을 삭제하시겠습니까?`);
    if (!confirmed) return;

    if (window.HobakStore && typeof window.HobakStore.deleteItemAsync === 'function') {
      await window.HobakStore.deleteItemAsync(item.id);
    } else if (window.HobakStore && typeof window.HobakStore.deleteItem === 'function') {
      window.HobakStore.deleteItem(item.id);
    }
    showToast('Supabase DB에서 매물이 삭제되었습니다.');

    if (typeof onDeletedCallback === 'function') {
      onDeletedCallback(item.id);
    } else if (typeof onCloseCallback === 'function') {
      onCloseCallback();
    } else {
      setTimeout(() => {
        window.location.href = 'list.html';
      }, 350);
    }
  }

  function updateSliderUI(rootEl, totalSlides) {
    const track = rootEl.querySelector('[data-role="slider-track"]');
    const prevBtn = rootEl.querySelector('[data-role="slider-prev"]');
    const nextBtn = rootEl.querySelector('[data-role="slider-next"]');
    const dots = rootEl.querySelectorAll('[data-role="slider-dot"]');

    if (track) {
      track.style.transform = `translateX(-${currentSlideIndex * 100}%)`;
    }

    if (prevBtn) {
      if (totalSlides <= 1 || currentSlideIndex === 0) {
        prevBtn.classList.add('is-hidden');
      } else {
        prevBtn.classList.remove('is-hidden');
      }
    }

    if (nextBtn) {
      if (totalSlides <= 1) {
        nextBtn.classList.add('is-hidden');
      } else {
        nextBtn.classList.remove('is-hidden');
      }
    }

    dots.forEach((dot, idx) => {
      if (idx === currentSlideIndex) {
        dot.classList.add('active');
        dot.setAttribute('aria-current', 'true');
      } else {
        dot.classList.remove('active');
        dot.removeAttribute('aria-current');
      }
    });
  }

  function handleEdit(item) {
    if (!item) return;
    if (typeof onEditCallback === 'function') {
      onEditCallback(item);
    } else {
      window.location.href = `write.html?editId=${encodeURIComponent(item.id)}`;
    }
  }

  async function handleStatusChange(item, nextStatus) {
    if (!item || !nextStatus) return;
    if (window.HobakStore && typeof window.HobakStore.updateItemAsync === 'function') {
      await window.HobakStore.updateItemAsync(item.id, { status: nextStatus });
    } else if (window.HobakStore && typeof window.HobakStore.updateItem === 'function') {
      window.HobakStore.updateItem(item.id, { status: nextStatus });
    }
    showToast(`거래 상태가 '${nextStatus}'(으)로 변경되었습니다!`);
    renderItem(item.id, { skipViewIncrement: true });
  }

  function renderItem(itemId, options = {}) {
    if (!activeContainer) {
      activeContainer = resolveContainer();
    }
    if (itemId !== undefined && itemId !== null) {
      currentItemId = Number(itemId) || 1;
    }

    const store = window.HobakStore;
    const item = store ? store.getItemById(currentItemId) : null;

    if (!item) {
      activeContainer.innerHTML = `
        <div class="hobak-detail-card" style="padding: 48px 24px; text-align: center;">
          <p style="font-size: 16px; color: #4D5159; margin-bottom: 16px;">존재하지 않거나 삭제된 상품입니다.</p>
          <button type="button" class="hobak-detail-chat-btn" style="padding: 10px 20px;" data-action="close">목록으로 돌아가기</button>
        </div>
      `;
      const backBtn = activeContainer.querySelector('[data-action="close"]');
      if (backBtn) backBtn.addEventListener('click', handleClose);
      return;
    }

    currentItemId = Number(item.id);
    currentSlideIndex = 0;

    if (!options.skipViewIncrement && store && typeof store.incrementViewCount === 'function') {
      item.views = store.incrementViewCount(item.id);
    }

    const images = Array.isArray(item.images) && item.images.length > 0
      ? item.images
      : ['https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=900&q=85'];

    const sellerNickname = (item.seller && item.seller.nickname) || '락락';
    const sellerLocation = (item.seller && item.seller.location) || '부산 중구 대청동4가';
    const mannerTemp = (item.seller && Number(item.seller.mannerTemp)) || 50.2;
    const mannerEmoji = getMannerEmoji(mannerTemp);
    const formattedPrice = store ? store.formatPrice(item.price) : `${Number(item.price || 0).toLocaleString('ko-KR')}원`;
    const isLiked = store ? store.isLiked(item.id) : false;
    const sizeText = item.size || '270';
    const isOwner = store && typeof store.isOwner === 'function' ? store.isOwner(item) : false;

    const rawStatus = item.status || '판매중';
    const normalizedStatus = rawStatus === '거래가능' ? '판매중' : rawStatus;
    const isReserved = normalizedStatus === '예약중';
    const isSold = normalizedStatus === '거래완료';

    let statusBadgeHtml = `<span class="hobak-detail-status-badge selling">판매중</span>`;
    if (isReserved) {
      statusBadgeHtml = `<span class="hobak-detail-status-badge reserved">예약중</span>`;
    } else if (isSold) {
      statusBadgeHtml = `<span class="hobak-detail-status-badge sold">거래완료</span>`;
    }

    const ownerPanelHtml = isOwner
      ? `
        <div class="hobak-detail-owner-panel" aria-label="내 게시글 관리">
          <div class="hobak-detail-owner-header">
            <span class="hobak-detail-owner-title">✏️ 내가 올린 게시글 관리</span>
            <div class="hobak-detail-owner-actions">
              <button type="button" class="hobak-owner-action-btn edit" data-action="edit">수정</button>
              <button type="button" class="hobak-owner-action-btn delete" data-action="delete">삭제</button>
            </div>
          </div>
          <div class="hobak-detail-status-group" role="group" aria-label="거래 상태 변경">
            <button type="button" class="hobak-owner-status-btn ${normalizedStatus === '판매중' ? 'active' : ''}" data-action="change-status" data-status="판매중">판매중</button>
            <button type="button" class="hobak-owner-status-btn ${normalizedStatus === '예약중' ? 'active' : ''}" data-action="change-status" data-status="예약중">예약중</button>
            <button type="button" class="hobak-owner-status-btn ${normalizedStatus === '거래완료' ? 'active' : ''}" data-action="change-status" data-status="거래완료">거래완료</button>
          </div>
        </div>
      `
      : '';

    const slidesHtml = images
      .map(
        (imgUrl, idx) => `
        <div class="hobak-detail-slide">
          <img src="${escapeHtml(imgUrl)}" alt="${escapeHtml(item.title)} 이미지 ${idx + 1}" loading="${idx === 0 ? 'eager' : 'lazy'}" />
        </div>
      `
      )
      .join('');

    const dotsHtml = images
      .map(
        (_, idx) => `
        <button
          type="button"
          class="hobak-detail-dot ${idx === 0 ? 'active' : ''}"
          data-role="slider-dot"
          data-index="${idx}"
          aria-label="${idx + 1}번 이미지 보기"
        ></button>
      `
      )
      .join('');

    activeContainer.innerHTML = `
      <div class="hobak-detail-wrapper">
        <article class="hobak-detail-card ${isSold ? 'is-sold' : ''}" data-item-id="${item.id}">
          <!-- 1. 상단 상품 이미지 슬라이더 & 오버레이 바 -->
          <div class="hobak-detail-media">
            <div class="hobak-detail-media-topbar">
              <button type="button" class="hobak-detail-close-btn" data-action="close" aria-label="닫기">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
              <button type="button" class="hobak-detail-app-btn" data-action="open-app">앱에서 보기</button>
            </div>

            <div class="hobak-detail-slider-track" data-role="slider-track">
              ${slidesHtml}
            </div>

            <button
              type="button"
              class="hobak-detail-arrow prev is-hidden"
              data-role="slider-prev"
              aria-label="이전 이미지"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>

            <button
              type="button"
              class="hobak-detail-arrow next ${images.length <= 1 ? 'is-hidden' : ''}"
              data-role="slider-next"
              aria-label="다음 이미지"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>

            <div class="hobak-detail-dots" role="tablist" aria-label="상품 이미지 인디케이터">
              ${dotsHtml}
            </div>
          </div>

          <!-- 2. 판매자 프로필 & 매너온도 영역 -->
          <section class="hobak-detail-seller-row" aria-label="판매자 정보">
            <div class="hobak-detail-seller-left">
              <div class="hobak-detail-avatar" aria-hidden="true">
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="24" cy="24" r="24" fill="#D2D4D9"/>
                  <circle cx="24" cy="18.5" r="7.5" fill="#FFFFFF"/>
                  <path d="M10.5 40.5C12.2 33.8 17.5 30 24 30C30.5 30 35.8 33.8 37.5 40.5" fill="#FFFFFF"/>
                </svg>
              </div>
              <div class="hobak-detail-seller-info">
                <div class="hobak-detail-seller-name-row">
                  <strong class="hobak-detail-seller-name">${escapeHtml(sellerNickname)}</strong>
                  <span class="hobak-detail-author-badge">작성자</span>
                </div>
                <span class="hobak-detail-seller-loc">${escapeHtml(sellerLocation)}</span>
              </div>
            </div>

            <div class="hobak-detail-manner">
              <div class="hobak-detail-manner-top">
                <span class="hobak-detail-manner-temp">${mannerTemp.toFixed(1)}°C</span>
                <span class="hobak-detail-manner-emoji" aria-hidden="true">${mannerEmoji}</span>
              </div>
              <button type="button" class="hobak-detail-manner-label" data-action="toggle-manner-tooltip">
                매너온도
              </button>
            </div>

            <div class="hobak-manner-tooltip" data-role="manner-tooltip" role="tooltip">
              매너온도는 호박 사용자로부터 받은 칭찬, 후기, 거래 매너 평가를 종합해서 만든 매너 지표예요. (첫 시작 온도 36.5°C)
            </div>
          </section>

          <!-- 3. 상품 본문 상세 영역 -->
          <section class="hobak-detail-content">
            <div class="hobak-detail-title-row">
              ${statusBadgeHtml}
              <h1 class="hobak-detail-title">${escapeHtml(item.title)}</h1>
            </div>

            <div class="hobak-detail-meta">
              <span class="hobak-detail-category" data-action="filter-category" data-category="${escapeHtml(item.category)}">${escapeHtml(item.category)}</span>
              <span>·</span>
              <span>${escapeHtml(item.timeAgo || '끌올 1시간 전')}</span>
            </div>

            <div class="hobak-detail-price-row">
              <strong class="hobak-detail-price">${escapeHtml(formattedPrice)}</strong>
            </div>

            <div class="hobak-detail-description">${escapeHtml(item.description)}</div>

            <div class="hobak-detail-spec-row">
              <span class="hobak-detail-spec-label">사이즈</span>
              <span class="hobak-detail-spec-value">${escapeHtml(sizeText)}</span>
            </div>

            ${ownerPanelHtml}

            <div class="hobak-detail-substats">
              <span data-role="substats-text">관심 ${item.likes || 0} · 채팅 ${item.chats || 0} · 조회 ${item.views || 0}</span>
              <div class="hobak-detail-Utility-btns">
                <button type="button" class="hobak-detail-util-btn" data-action="close">목록으로</button>
              </div>
            </div>
          </section>

          <!-- 4. 하단 인터랙션 액션 바 -->
          <footer class="hobak-detail-action-bar">
            <button
              type="button"
              class="hobak-detail-like-btn ${isLiked ? 'liked' : ''}"
              data-action="toggle-like"
              aria-pressed="${isLiked ? 'true' : 'false'}"
              aria-label="관심 상품 등록"
            >
              <span class="hobak-detail-like-icon" data-role="like-icon">${isLiked ? '♥' : '♡'}</span>
              <span data-role="like-count">${item.likes || 0}</span>
            </button>

            <div class="hobak-detail-action-buttons">
              <button type="button" class="hobak-detail-buy-btn" data-action="buy-now">바로구매</button>
              <button type="button" class="hobak-detail-chat-btn" data-action="chat">채팅으로 거래하기</button>
            </div>
          </footer>
        </article>
      </div>
    `;

    bindEvents(activeContainer, item, images.length);
  }

  function bindEvents(rootEl, item, totalSlides) {
    // 닫기 / 목록으로 버튼
    const closeBtns = rootEl.querySelectorAll('[data-action="close"]');
    closeBtns.forEach((btn) => {
      btn.addEventListener('click', handleClose);
    });

    // 앱에서 보기 버튼
    const appBtn = rootEl.querySelector('[data-action="open-app"]');
    if (appBtn) {
      appBtn.addEventListener('click', () => {
        showToast('🎃 호박 앱으로 연결합니다! 앱에서 실시간 알림을 받아보세요.');
      });
    }

    // 이미지 슬라이더 좌/우 화살표 및 인디케이터 점
    const prevBtn = rootEl.querySelector('[data-role="slider-prev"]');
    const nextBtn = rootEl.querySelector('[data-role="slider-next"]');
    const dots = rootEl.querySelectorAll('[data-role="slider-dot"]');

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentSlideIndex > 0) {
          currentSlideIndex -= 1;
          updateSliderUI(rootEl, totalSlides);
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentSlideIndex < totalSlides - 1) {
          currentSlideIndex += 1;
        } else {
          currentSlideIndex = 0;
        }
        updateSliderUI(rootEl, totalSlides);
      });
    }

    dots.forEach((dot) => {
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = Number(dot.getAttribute('data-index'));
        if (!isNaN(idx) && idx >= 0 && idx < totalSlides) {
          currentSlideIndex = idx;
          updateSliderUI(rootEl, totalSlides);
        }
      });
    });

    // 매너온도 설명 툴팁 토글
    const mannerBtn = rootEl.querySelector('[data-action="toggle-manner-tooltip"]');
    const mannerTooltip = rootEl.querySelector('[data-role="manner-tooltip"]');
    if (mannerBtn && mannerTooltip) {
      mannerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        mannerTooltip.classList.toggle('open');
      });

      rootEl.addEventListener('click', () => {
        mannerTooltip.classList.remove('open');
      });
    }

    // 카테고리 클릭
    const categoryEl = rootEl.querySelector('[data-action="filter-category"]');
    if (categoryEl) {
      categoryEl.addEventListener('click', () => {
        const cat = categoryEl.getAttribute('data-category') || '';
        if (typeof onCloseCallback === 'function') {
          onCloseCallback(cat);
        } else {
          window.location.href = `list.html?category=${encodeURIComponent(cat)}`;
        }
      });
    }

    // 관심(하트) 토글
    const likeBtn = rootEl.querySelector('[data-action="toggle-like"]');
    if (likeBtn) {
      likeBtn.addEventListener('click', () => {
        if (!window.HobakStore) return;
        const result = window.HobakStore.toggleLike(item.id);
        item.likes = result.likesCount;

        const likeIcon = rootEl.querySelector('[data-role="like-icon"]');
        const likeCount = rootEl.querySelector('[data-role="like-count"]');
        const substatsText = rootEl.querySelector('[data-role="substats-text"]');

        if (result.liked) {
          likeBtn.classList.add('liked');
          likeBtn.setAttribute('aria-pressed', 'true');
          if (likeIcon) likeIcon.textContent = '♥';
          showToast('관심 목록에 추가했어요 🧡');
        } else {
          likeBtn.classList.remove('liked');
          likeBtn.setAttribute('aria-pressed', 'false');
          if (likeIcon) likeIcon.textContent = '♡';
          showToast('관심 목록에서 해제했어요.');
        }

        if (likeCount) likeCount.textContent = String(result.likesCount);
        if (substatsText) {
          substatsText.textContent = `관심 ${result.likesCount} · 채팅 ${item.chats || 0} · 조회 ${item.views || 0}`;
        }
      });
    }

    // 바로구매 버튼
    const buyBtn = rootEl.querySelector('[data-action="buy-now"]');
    if (buyBtn) {
      buyBtn.addEventListener('click', () => {
        const priceStr = window.HobakStore
          ? window.HobakStore.formatPrice(item.price)
          : `${Number(item.price).toLocaleString('ko-KR')}원`;
        showToast(`🎃 호박페이 안전결제 (${priceStr}) 창으로 이동합니다!`);
      });
    }

    // 채팅으로 거래하기 버튼
    const chatBtn = rootEl.querySelector('[data-action="chat"]');
    if (chatBtn) {
      chatBtn.addEventListener('click', () => {
        const nickname = (item.seller && item.seller.nickname) || '판매자';
        showToast(`💬 '${nickname}'님과의 호박채팅방을 열었습니다!`);
      });
    }

    // 수정 / 삭제 / 상태 변경 버튼 (직접 올린 게시글 전용)
    const editBtn = rootEl.querySelector('[data-action="edit"]');
    if (editBtn) {
      editBtn.addEventListener('click', () => handleEdit(item));
    }

    const deleteBtns = rootEl.querySelectorAll('[data-action="delete"]');
    deleteBtns.forEach((btn) => {
      btn.addEventListener('click', () => handleDelete(item));
    });

    const statusBtns = rootEl.querySelectorAll('[data-action="change-status"]');
    statusBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const nextStatus = btn.getAttribute('data-status');
        if (nextStatus) handleStatusChange(item, nextStatus);
      });
    });
  }

  const HobakDetailPage = {
    init(options = {}) {
      activeContainer = resolveContainer(options.container);
      onCloseCallback = typeof options.onClose === 'function' ? options.onClose : null;
      onDeletedCallback = typeof options.onDeleted === 'function' ? options.onDeleted : null;
      onEditCallback = typeof options.onEdit === 'function' ? options.onEdit : null;

      const targetId =
        options.itemId !== undefined && options.itemId !== null
          ? Number(options.itemId)
          : resolveItemIdFromUrl();

      renderItem(targetId);
    },

    renderItem(itemId, options = {}) {
      renderItem(itemId, options);
    }
  };

  window.HobakDetailPage = HobakDetailPage;
})();
