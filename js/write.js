/**
 * 호박(Hobak) 중고거래 웹서비스 - 글쓰기 페이지 모듈 (write.js)
 * 상품상세 페이지(detail)의 레이아웃과 1:1 매칭되는 카드형 WYSIWYG 글쓰기 화면을 렌더링합니다.
 * 단독 페이지(write.html) 및 통합 SPA(index.html)에서 공통으로 재사용할 수 있도록 window.HobakWritePage를 노출합니다.
 */

(function () {
  const SAMPLE_PRESETS = {
    sneakers: {
      label: '👟 스니커즈',
      title: '나이키 에어 조던 1 하이 다크 모카 270mm',
      category: '남성패션/잡화',
      price: 100000,
      size: '270',
      hobakPay: true,
      description:
        '매력적인 나이키 에어 조던 1 하이 다크 모카를 소개해요. 깔끔한 디자인과 편안한 착용감으로 어떤 코디에도 잘 어울려요. 박스와 함께 보내드려요. 이 신발은 당신의 스타일을 한층 더 업그레이드 시켜줄 거예요.\n\n나코탭 포함 풀구성\n밑창 새거에 업체 보강맡겨두고 신발에 손이 잘 안가서 판매합니다 상태아주좋아요\n궁금한점 바로구매 후 편하게 문의주세요',
      images: [
        'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=900&q=85',
        'https://images.unsplash.com/photo-1597045566677-8cf032ed6634?auto=format&fit=crop&w=900&q=85',
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85'
      ]
    },
    smartphone: {
      label: '📱 스마트폰',
      title: '삼성 갤럭시 S24 울트라 256G 티타늄 화이트 자급제',
      category: '디지털기기',
      price: 950000,
      size: '256GB / S급',
      hobakPay: true,
      description:
        '삼성 스토어에서 구매한 갤럭시 S24 울트라 256GB 티타늄 화이트 자급제 모델입니다.\n\n구매 직후 강화유리 필름과 정품 케이스를 장착해 찍힘이나 생활기스 전혀 없는 S급 컨디션입니다.\n배터리 성능 최상이며 박스 및 미사용 케이블 풀박스로 드립니다.',
      images: [
        'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=900&q=85',
        'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=900&q=85'
      ]
    },
    apparel: {
      label: '🧥 패딩/의류',
      title: '크림 아이보리 덕다운 푸퍼 숏패딩 (Free)',
      category: '여성패션/잡화',
      price: 45000,
      size: 'Free (55~66)',
      hobakPay: true,
      description:
        '포근한 크림 아이보리 컬러의 덕다운 푸퍼 숏패딩입니다.\n핏이 부해 보이지 않고 깔끔하게 떨어져서 겨울 데일리 아우터로 딱 좋아요.\n\n작년 시즌 백화점에서 구매 후 3회 착용하고 전문 세탁 완료해 두었습니다. 오염이나 하자 전혀 없어요!',
      images: [
        'https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=900&q=85',
        'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=900&q=85'
      ]
    },
    bag: {
      label: '👜 가방',
      title: '포터 탱커 미니 숄더백 크로스백 블랙',
      category: '남성패션/잡화',
      price: 135000,
      size: '24 x 16cm',
      hobakPay: true,
      description:
        '도쿄 여행 중 매장에서 직접 구매한 요시다 포터 탱커 미니 크로스백 블랙입니다.\n가볍고 수납공간이 알차서 지갑, 휴대폰, 보조배터리, 에어팟 넣기 최고예요.\n\n로고 라벨 해짐 전혀 없고 내부 오렌지 안감도 깨끗합니다.',
      images: [
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=85',
        'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=85'
      ]
    },
    watchCamping: {
      label: '⌚ 시계/캠핑',
      title: '가민 포러너 265 러닝 스마트워치 블랙 풀박스',
      category: '스포츠/레저',
      price: 380000,
      size: '46mm',
      hobakPay: true,
      description:
        '마라톤 대회 준비용으로 구매했던 가민 포러너 265 한글 정품입니다.\nAMOLED 디스플레이가 정말 선명하고 GPS 정확도가 뛰어납니다.\n\n액정 보호필름 부착 상태이며 정품 충전케이블, 여분 스트랩, 박스 모두 포함해 드립니다.',
      images: [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85',
        'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=900&q=85'
      ]
    }
  };

  const DEFAULT_INITIAL_IMAGES = [
    'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1597045566677-8cf032ed6634?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85'
  ];

  const state = {
    container: null,
    onCancel: null,
    onSubmitted: null,
    editingItemId: null,
    images: [],
    currentSlide: 0,
    isDefaultImages: false,
    toastTimer: null
  };

  function getCategories() {
    const raw = Array.isArray(window.HOBAK_CATEGORIES)
      ? window.HOBAK_CATEGORIES
      : ['남성패션/잡화', '여성패션/잡화', '디지털기기', '생활가전', '스포츠/레저', '가구/인테리어', '취미/게임/음반', '도서/티켓/문구'];
    return raw.filter(cat => cat !== '전체');
  }

  function getLocations() {
    const raw = Array.isArray(window.HOBAK_LOCATIONS)
      ? window.HOBAK_LOCATIONS
      : ['부산 중구 대청동4가', '부산 중구 중앙동4가', '부산 중구 남포동', '부산 중구 부평동2가', '부산 중구 광복동', '부산 중구 보수동1가', '부산 중구 동광동', '부산 중구 영주동'];
    const filtered = raw.filter(loc => loc !== '부산 중구 전체');
    return filtered.length > 0 ? filtered : raw;
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatNumberWithCommas(val) {
    const digits = String(val || '').replace(/[^\d]/g, '');
    if (!digits) return '';
    return Number(digits).toLocaleString('ko-KR');
  }

  function parsePriceNumber(val) {
    const digits = String(val || '').replace(/[^\d]/g, '');
    if (!digits) return NaN;
    return Number(digits);
  }

  function showToast(message) {
    let toastEl = document.getElementById('hobakWriteToast');
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.id = 'hobakWriteToast';
      toastEl.className = 'hobak-toast';
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = message;
    toastEl.classList.add('show');
    if (state.toastTimer) clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(() => {
      toastEl.classList.remove('show');
    }, 2400);
  }

  function autoResizeTitle(el) {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }

  function renderHeroSlider() {
    if (!state.container) return;
    const slidesBox = state.container.querySelector('#hobakWriteSlides');
    const dotsBox = state.container.querySelector('#hobakWriteDots');
    const prevBtn = state.container.querySelector('#hobakWritePrevBtn');
    const nextBtn = state.container.querySelector('#hobakWriteNextBtn');
    const badgeBar = state.container.querySelector('#hobakWriteBadgeBar');
    const thumbStrip = state.container.querySelector('#hobakWriteThumbStrip');

    if (!slidesBox) return;

    const total = state.images.length;
    if (state.currentSlide >= total) {
      state.currentSlide = Math.max(0, total - 1);
    }

    if (total === 0) {
      slidesBox.innerHTML = `
        <div class="hobak-write-empty-slide">
          <div class="hobak-write-empty-icon">📷</div>
          <div class="hobak-write-empty-title">상품 사진을 등록해 주세요</div>
          <div class="hobak-write-empty-desc">
            내 PC 사진을 끌어다 놓거나 아래 원클릭 샘플 사진 버튼을 눌러<br/>
            상세 페이지와 동일한 정사각형 프리뷰를 확인해 보세요!
          </div>
          <button type="button" class="hobak-write-empty-upload-btn" id="hobakWriteEmptyUploadBtn">
            <span>📁 내 PC에서 사진 선택</span>
          </button>
        </div>
      `;
      const emptyBtn = slidesBox.querySelector('#hobakWriteEmptyUploadBtn');
      if (emptyBtn) {
        emptyBtn.addEventListener('click', () => {
          const fileInput = state.container.querySelector('#hobakWriteFileInput');
          if (fileInput) fileInput.click();
        });
      }
      if (prevBtn) prevBtn.style.display = 'none';
      if (nextBtn) nextBtn.style.display = 'none';
      if (dotsBox) dotsBox.style.display = 'none';
      if (badgeBar) badgeBar.style.display = 'none';
      if (thumbStrip) thumbStrip.innerHTML = '';
      return;
    }

    const currentImgUrl = state.images[state.currentSlide];
    slidesBox.innerHTML = `
      <img
        src="${escapeHtml(currentImgUrl)}"
        alt="상품 등록 미리보기 이미지 ${state.currentSlide + 1}"
        class="hobak-write-slide-img"
        onerror="this.src='https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=900&q=85'"
      />
    `;

    if (prevBtn) prevBtn.style.display = total > 1 ? 'flex' : 'none';
    if (nextBtn) nextBtn.style.display = total > 1 ? 'flex' : 'none';

    if (dotsBox) {
      dotsBox.style.display = 'flex';
      dotsBox.innerHTML = state.images
        .map(
          (_, idx) => `
          <button
            type="button"
            class="hobak-write-dot ${idx === state.currentSlide ? 'active' : ''}"
            data-slide-idx="${idx}"
            aria-label="${idx + 1}번 이미지 보기"
          ></button>
        `
        )
        .join('');
    }

    if (badgeBar) {
      badgeBar.style.display = 'flex';
      badgeBar.innerHTML = `
        <span class="hobak-write-slide-count">${state.currentSlide + 1} / ${total}</span>
        <button type="button" class="hobak-write-slide-remove-btn" id="hobakWriteRemoveCurrentImgBtn" title="현재 사진 삭제">
          사진 삭제
        </button>
      `;
      const removeBtn = badgeBar.querySelector('#hobakWriteRemoveCurrentImgBtn');
      if (removeBtn) {
        removeBtn.addEventListener('click', () => {
          removeImageAt(state.currentSlide);
        });
      }
    }

    if (thumbStrip) {
      thumbStrip.innerHTML = state.images
        .map(
          (img, idx) => `
          <div class="hobak-write-thumb-item ${idx === state.currentSlide ? 'active' : ''}" data-thumb-idx="${idx}">
            <img src="${escapeHtml(img)}" alt="썸네일 ${idx + 1}" />
            <button type="button" class="hobak-write-thumb-del" data-del-idx="${idx}" title="삭제">✕</button>
          </div>
        `
        )
        .join('');
    }
  }

  function addImages(newUrls, replaceIfDefault = true) {
    const valid = (newUrls || []).map(u => String(u || '').trim()).filter(Boolean);
    if (valid.length === 0) return;

    if (replaceIfDefault && state.isDefaultImages) {
      state.images = [...valid];
      state.isDefaultImages = false;
      state.currentSlide = 0;
    } else {
      const prevLen = state.images.length;
      state.images = [...state.images, ...valid].slice(0, 10);
      state.isDefaultImages = false;
      state.currentSlide = Math.min(prevLen, state.images.length - 1);
    }
    renderHeroSlider();
  }

  function removeImageAt(index) {
    if (index < 0 || index >= state.images.length) return;
    state.images.splice(index, 1);
    state.isDefaultImages = false;
    if (state.currentSlide >= state.images.length) {
      state.currentSlide = Math.max(0, state.images.length - 1);
    }
    renderHeroSlider();
    showToast('선택한 사진이 삭제되었습니다.');
  }

  function handleFilesSelected(fileList) {
    const files = Array.from(fileList || []).filter(f => f.type && f.type.startsWith('image/'));
    if (files.length === 0) {
      showToast('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    const readers = files.map(
      file =>
        new Promise(resolve => {
          const reader = new FileReader();
          reader.onload = e => resolve(e.target && e.target.result ? String(e.target.result) : '');
          reader.onerror = () => resolve('');
          reader.readAsDataURL(file);
        })
    );

    Promise.all(readers).then(dataUrls => {
      const validUrls = dataUrls.filter(Boolean);
      if (validUrls.length > 0) {
        addImages(validUrls, true);
        showToast(`내 PC 사진 ${validUrls.length}장이 추가되었습니다.`);
      }
    });
  }

  function applySamplePreset(presetKey) {
    const preset = SAMPLE_PRESETS[presetKey];
    if (!preset || !state.container) return;

    state.images = [...preset.images];
    state.isDefaultImages = false;
    state.currentSlide = 0;
    renderHeroSlider();

    const autoFillCheck = state.container.querySelector('#hobakWriteAutoFillCheck');
    const titleInput = state.container.querySelector('#hobakWriteTitleInput');
    const catSelect = state.container.querySelector('#hobakWriteCategorySelect');
    const priceInput = state.container.querySelector('#hobakWritePriceInput');
    const payCheck = state.container.querySelector('#hobakWritePayCheck');
    const descInput = state.container.querySelector('#hobakWriteDescInput');
    const sizeInput = state.container.querySelector('#hobakWriteSizeInput');

    const shouldFillText =
      (autoFillCheck && autoFillCheck.checked) ||
      (titleInput && !titleInput.value.trim() && descInput && !descInput.value.trim());

    if (shouldFillText) {
      if (titleInput) {
        titleInput.value = preset.title;
        autoResizeTitle(titleInput);
      }
      if (catSelect) catSelect.value = preset.category;
      if (priceInput) priceInput.value = formatNumberWithCommas(preset.price);
      if (payCheck) payCheck.checked = Boolean(preset.hobakPay);
      if (descInput) descInput.value = preset.description;
      if (sizeInput) sizeInput.value = preset.size;
      showToast(`${preset.label} 샘플 사진과 예시 내용이 입력되었습니다!`);
    } else {
      showToast(`${preset.label} 샘플 사진 ${preset.images.length}장이 적용되었습니다.`);
    }
  }

  function markFieldError(el, message) {
    if (el) {
      el.classList.remove('hobak-write-field-error');
      void el.offsetWidth;
      el.classList.add('hobak-write-field-error');
      el.focus();
      setTimeout(() => {
        el.classList.remove('hobak-write-field-error');
      }, 1200);
    }
    showToast(message);
  }

  async function handleSubmit(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    if (!state.container) return;

    if (window.HobakAuth && !window.HobakAuth.isLoggedIn()) {
      window.HobakAuth.requireAuth(() => {
        handleSubmit();
      });
      return;
    }

    const nicknameInput = state.container.querySelector('#hobakWriteNicknameInput');
    const locationSelect = state.container.querySelector('#hobakWriteLocationSelect');
    const titleInput = state.container.querySelector('#hobakWriteTitleInput');
    const categorySelect = state.container.querySelector('#hobakWriteCategorySelect');
    const priceInput = state.container.querySelector('#hobakWritePriceInput');
    const payCheck = state.container.querySelector('#hobakWritePayCheck');
    const descInput = state.container.querySelector('#hobakWriteDescInput');
    const sizeInput = state.container.querySelector('#hobakWriteSizeInput');

    const title = (titleInput ? titleInput.value : '').trim();
    if (!title) {
      markFieldError(titleInput, '상품 제목을 입력해 주세요.');
      return;
    }

    const rawPrice = priceInput ? priceInput.value.trim() : '';
    const parsedPrice = parsePriceNumber(rawPrice);
    if (rawPrice === '' || isNaN(parsedPrice)) {
      markFieldError(priceInput, '판매 가격을 입력해 주세요. (무료 나눔은 0 입력)');
      return;
    }

    const description = (descInput ? descInput.value : '').trim();
    if (!description) {
      markFieldError(descInput, '상품 상세 설명을 입력해 주세요.');
      return;
    }

    const authUser = window.HobakAuth && typeof window.HobakAuth.getUser === 'function'
      ? window.HobakAuth.getUser()
      : null;

    const nickname = (nicknameInput ? nicknameInput.value : '').trim() || (authUser && authUser.nickname) || '락락';
    const location = (locationSelect ? locationSelect.value : '').trim() || '부산 중구 대청동4가';
    const category = (categorySelect ? categorySelect.value : '').trim() || '남성패션/잡화';
    const hobakPay = payCheck ? Boolean(payCheck.checked) : true;
    const size = (sizeInput ? sizeInput.value : '').trim() || 'FREE';

    const finalImages =
      state.images.length > 0
        ? [...state.images]
        : [...DEFAULT_INITIAL_IMAGES];

    const payload = {
      sellerId: authUser && authUser.id ? authUser.id : null,
      title,
      category,
      price: parsedPrice,
      status: '판매중',
      hobakPay,
      size,
      seller: {
        nickname: (authUser && authUser.nickname) || nickname,
        location,
        mannerTemp: (authUser && Number(authUser.mannerTemp)) || 50.2
      },
      description,
      images: finalImages
    };

    const wasEditing = state.editingItemId !== null;
    let resultItem = null;
    if (wasEditing) {
      const editPatch = {
        title: payload.title,
        category: payload.category,
        price: payload.price,
        hobakPay: payload.hobakPay,
        size: payload.size,
        description: payload.description,
        images: payload.images,
        seller: { location }
      };
      if (window.HobakStore && typeof window.HobakStore.updateItemAsync === 'function') {
        resultItem = await window.HobakStore.updateItemAsync(state.editingItemId, editPatch);
      } else if (window.HobakStore && typeof window.HobakStore.updateItem === 'function') {
        resultItem = window.HobakStore.updateItem(state.editingItemId, editPatch);
      }
      showToast('✏️ 게시글 수정 내용이 Supabase DB에 저장되었습니다!');
    } else {
      if (window.HobakStore && typeof window.HobakStore.addItemAsync === 'function') {
        resultItem = await window.HobakStore.addItemAsync(payload);
      } else if (window.HobakStore && typeof window.HobakStore.addItem === 'function') {
        resultItem = window.HobakStore.addItem(payload);
      } else {
        resultItem = { id: Date.now(), ...payload, timeAgo: '방금 전' };
      }
      showToast('🎃 호박(Supabase DB)에 새 중고 매물이 등록되었습니다!');
    }

    resetForm();

    if (typeof state.onSubmitted === 'function') {
      state.onSubmitted(resultItem, { isEdit: wasEditing });
    } else {
      setTimeout(() => {
        window.location.href = `detail.html?id=${encodeURIComponent(resultItem.id)}`;
      }, 320);
    }
  }

  function handleCancel() {
    resetForm();
    if (typeof state.onCancel === 'function') {
      state.onCancel();
    } else {
      window.location.href = 'list.html';
    }
  }

  function updateSubmitButtonLabels(isEditing) {
    if (!state.container) return;
    const topBtn = state.container.querySelector('#hobakWriteTopSubmitBtn');
    const bottomBtn = state.container.querySelector('#hobakWriteSubmitBtn');
    if (topBtn) topBtn.textContent = isEditing ? '수정 완료' : '등록 완료';
    if (bottomBtn) bottomBtn.textContent = isEditing ? '✏️ 수정 내용 저장하기' : '🎃 호박에 내 물건 등록하기';
  }

  function loadItemForEdit(item) {
    if (!state.container || !item) return;
    resetForm();
    state.editingItemId = Number(item.id);
    state.images = Array.isArray(item.images) ? [...item.images] : [];
    state.currentSlide = 0;
    state.isDefaultImages = false;

    const nicknameInput = state.container.querySelector('#hobakWriteNicknameInput');
    const locationSelect = state.container.querySelector('#hobakWriteLocationSelect');
    const titleInput = state.container.querySelector('#hobakWriteTitleInput');
    const categorySelect = state.container.querySelector('#hobakWriteCategorySelect');
    const priceInput = state.container.querySelector('#hobakWritePriceInput');
    const payCheck = state.container.querySelector('#hobakWritePayCheck');
    const descInput = state.container.querySelector('#hobakWriteDescInput');
    const sizeInput = state.container.querySelector('#hobakWriteSizeInput');

    if (nicknameInput && item.seller && item.seller.nickname) {
      nicknameInput.value = item.seller.nickname;
    }
    if (locationSelect && item.seller && item.seller.location) {
      locationSelect.value = item.seller.location;
    }
    if (titleInput) {
      titleInput.value = item.title || '';
      autoResizeTitle(titleInput);
    }
    if (categorySelect && item.category) {
      categorySelect.value = item.category;
    }
    if (priceInput) {
      priceInput.value = formatNumberWithCommas(item.price);
    }
    if (payCheck) {
      payCheck.checked = Boolean(item.hobakPay);
    }
    if (descInput) {
      descInput.value = item.description || '';
    }
    if (sizeInput) {
      sizeInput.value = item.size || '';
    }

    updateSubmitButtonLabels(true);
    renderHeroSlider();
  }

  function resetForm() {
    if (!state.container) return;

    state.editingItemId = null;
    state.images = [];
    state.currentSlide = 0;
    state.isDefaultImages = false;
    updateSubmitButtonLabels(false);

    const nicknameInput = state.container.querySelector('#hobakWriteNicknameInput');
    const locationSelect = state.container.querySelector('#hobakWriteLocationSelect');
    const titleInput = state.container.querySelector('#hobakWriteTitleInput');
    const categorySelect = state.container.querySelector('#hobakWriteCategorySelect');
    const priceInput = state.container.querySelector('#hobakWritePriceInput');
    const payCheck = state.container.querySelector('#hobakWritePayCheck');
    const descInput = state.container.querySelector('#hobakWriteDescInput');
    const sizeInput = state.container.querySelector('#hobakWriteSizeInput');
    const urlInput = state.container.querySelector('#hobakWriteUrlInput');
    const urlRow = state.container.querySelector('#hobakWriteUrlRow');
    const fileInput = state.container.querySelector('#hobakWriteFileInput');
    const mannerTempEl = state.container.querySelector('.hobak-write-manner-temp');
    const mannerFaceEl = state.container.querySelector('.hobak-write-manner-face');

    const authUser = window.HobakAuth && typeof window.HobakAuth.getUser === 'function'
      ? window.HobakAuth.getUser()
      : null;
    if (nicknameInput) {
      nicknameInput.value = (authUser && authUser.nickname) || '락락';
      nicknameInput.readOnly = Boolean(authUser);
    }
    if (locationSelect) {
      locationSelect.value = (authUser && authUser.location) || '부산 중구 대청동4가';
    }
    if (mannerTempEl) {
      const tempVal = authUser && authUser.mannerTemp ? Number(authUser.mannerTemp) : 50.2;
      mannerTempEl.textContent = `${tempVal.toFixed(1)}°C`;
      if (mannerFaceEl) {
        mannerFaceEl.textContent = tempVal >= 50 ? '😮' : tempVal >= 43 ? '😄' : '🙂';
      }
    }
    if (titleInput) {
      titleInput.value = '';
      titleInput.classList.remove('hobak-write-field-error');
      autoResizeTitle(titleInput);
    }
    if (categorySelect) categorySelect.value = '남성패션/잡화';
    if (priceInput) {
      priceInput.value = '';
      priceInput.classList.remove('hobak-write-field-error');
    }
    if (payCheck) payCheck.checked = true;
    if (descInput) {
      descInput.value = '';
      descInput.classList.remove('hobak-write-field-error');
    }
    if (sizeInput) sizeInput.value = '';
    if (urlInput) urlInput.value = '';
    if (urlRow) urlRow.classList.remove('open');
    if (fileInput) fileInput.value = '';

    renderHeroSlider();
  }

  function bindEvents() {
    const root = state.container;
    if (!root) return;

    const form = root.querySelector('#hobakWriteForm');
    const closeBtn = root.querySelector('#hobakWriteCloseBtn');
    const topSubmitBtn = root.querySelector('#hobakWriteTopSubmitBtn');
    const resetBtn = root.querySelector('#hobakWriteResetBtn');
    const prevBtn = root.querySelector('#hobakWritePrevBtn');
    const nextBtn = root.querySelector('#hobakWriteNextBtn');
    const dotsBox = root.querySelector('#hobakWriteDots');
    const thumbStrip = root.querySelector('#hobakWriteThumbStrip');
    const pcUploadBtn = root.querySelector('#hobakWritePcUploadBtn');
    const fileInput = root.querySelector('#hobakWriteFileInput');
    const toggleUrlBtn = root.querySelector('#hobakWriteToggleUrlBtn');
    const clearImgsBtn = root.querySelector('#hobakWriteClearImgsBtn');
    const urlRow = root.querySelector('#hobakWriteUrlRow');
    const urlInput = root.querySelector('#hobakWriteUrlInput');
    const urlAddBtn = root.querySelector('#hobakWriteUrlAddBtn');
    const heroBox = root.querySelector('#hobakWriteHero');
    const titleInput = root.querySelector('#hobakWriteTitleInput');
    const priceInput = root.querySelector('#hobakWritePriceInput');
    const sizeInput = root.querySelector('#hobakWriteSizeInput');

    if (form) {
      form.addEventListener('submit', handleSubmit);
    }
    if (closeBtn) {
      closeBtn.addEventListener('click', handleCancel);
    }
    if (topSubmitBtn) {
      topSubmitBtn.addEventListener('click', handleSubmit);
    }
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        resetForm();
        showToast('입력 폼이 초기 상태로 리셋되었습니다.');
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (state.images.length <= 1) return;
        state.currentSlide = (state.currentSlide - 1 + state.images.length) % state.images.length;
        renderHeroSlider();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (state.images.length <= 1) return;
        state.currentSlide = (state.currentSlide + 1) % state.images.length;
        renderHeroSlider();
      });
    }

    if (dotsBox) {
      dotsBox.addEventListener('click', e => {
        const dot = e.target.closest('[data-slide-idx]');
        if (!dot) return;
        state.currentSlide = Number(dot.getAttribute('data-slide-idx')) || 0;
        renderHeroSlider();
      });
    }

    if (thumbStrip) {
      thumbStrip.addEventListener('click', e => {
        const delBtn = e.target.closest('[data-del-idx]');
        if (delBtn) {
          e.stopPropagation();
          removeImageAt(Number(delBtn.getAttribute('data-del-idx')));
          return;
        }
        const thumb = e.target.closest('[data-thumb-idx]');
        if (thumb) {
          state.currentSlide = Number(thumb.getAttribute('data-thumb-idx')) || 0;
          renderHeroSlider();
        }
      });
    }

    if (pcUploadBtn && fileInput) {
      pcUploadBtn.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', e => {
        if (e.target.files && e.target.files.length > 0) {
          handleFilesSelected(e.target.files);
          fileInput.value = '';
        }
      });
    }

    if (heroBox) {
      heroBox.addEventListener('dragover', e => {
        e.preventDefault();
        heroBox.classList.add('drag-over');
      });
      heroBox.addEventListener('dragleave', () => {
        heroBox.classList.remove('drag-over');
      });
      heroBox.addEventListener('drop', e => {
        e.preventDefault();
        heroBox.classList.remove('drag-over');
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          handleFilesSelected(e.dataTransfer.files);
        }
      });
    }

    if (toggleUrlBtn && urlRow) {
      toggleUrlBtn.addEventListener('click', () => {
        urlRow.classList.toggle('open');
        if (urlRow.classList.contains('open') && urlInput) {
          urlInput.focus();
        }
      });
    }

    if (clearImgsBtn) {
      clearImgsBtn.addEventListener('click', () => {
        state.images = [];
        state.currentSlide = 0;
        state.isDefaultImages = false;
        renderHeroSlider();
        showToast('등록된 사진이 모두 비워졌습니다.');
      });
    }

    const triggerUrlAdd = () => {
      if (!urlInput) return;
      const val = urlInput.value.trim();
      if (!val) {
        showToast('추가할 이미지 URL을 입력해 주세요.');
        urlInput.focus();
        return;
      }
      addImages([val], true);
      urlInput.value = '';
      showToast('이미지 URL이 슬라이더에 추가되었습니다.');
    };

    if (urlAddBtn) {
      urlAddBtn.addEventListener('click', triggerUrlAdd);
    }
    if (urlInput) {
      urlInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          e.preventDefault();
          triggerUrlAdd();
        }
      });
    }

    root.querySelectorAll('[data-sample-key]').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-sample-key');
        applySamplePreset(key);
      });
    });

    if (titleInput) {
      titleInput.addEventListener('input', () => autoResizeTitle(titleInput));
      titleInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') e.preventDefault();
      });
    }

    if (priceInput) {
      priceInput.addEventListener('input', () => {
        const formatted = formatNumberWithCommas(priceInput.value);
        priceInput.value = formatted;
      });
    }

    root.querySelectorAll('[data-size-preset]').forEach(chip => {
      chip.addEventListener('click', () => {
        const val = chip.getAttribute('data-size-preset');
        if (sizeInput && val) {
          sizeInput.value = val;
          sizeInput.focus();
        }
      });
    });
  }

  function init(options = {}) {
    let target = options.container;
    if (typeof target === 'string') {
      target = document.querySelector(target);
    }
    if (!target) {
      target = document.getElementById('writePageContainer') || document.body;
    }

    state.container = target;
    state.onCancel = typeof options.onCancel === 'function' ? options.onCancel : null;
    state.onSubmitted = typeof options.onSubmitted === 'function' ? options.onSubmitted : null;
    state.images = [];
    state.currentSlide = 0;
    state.isDefaultImages = false;

    const categories = getCategories();
    const locations = getLocations();
    const defaultLocation = locations.includes('부산 중구 대청동4가') ? '부산 중구 대청동4가' : locations[0];
    const currentAuthUser =
      window.HobakAuth && typeof window.HobakAuth.getUser === 'function'
        ? window.HobakAuth.getUser()
        : null;
    const defaultNickname = (currentAuthUser && currentAuthUser.nickname) || '락락';
    const defaultMannerTemp = (currentAuthUser && Number(currentAuthUser.mannerTemp)) || 50.2;
    const defaultMannerEmoji = defaultMannerTemp >= 50 ? '😮' : defaultMannerTemp >= 43 ? '😄' : '🙂';

    target.innerHTML = `
      <div class="hobak-write-container">
        <form id="hobakWriteForm" class="hobak-write-card" novalidate>
          <!-- 1. 상단 정사각형 이미지 프리뷰 슬라이더 & 오버레이 헤더 (상세 페이지 1:1 대응) -->
          <div class="hobak-write-hero" id="hobakWriteHero">
            <div class="hobak-write-hero-header">
              <button
                type="button"
                class="hobak-write-close-btn"
                id="hobakWriteCloseBtn"
                aria-label="닫기 및 취소"
                title="닫기"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
              <button
                type="button"
                class="hobak-write-top-submit-btn"
                id="hobakWriteTopSubmitBtn"
              >
                등록 완료
              </button>
            </div>

            <div class="hobak-write-slides" id="hobakWriteSlides"></div>

            <button
              type="button"
              class="hobak-write-slider-arrow prev"
              id="hobakWritePrevBtn"
              aria-label="이전 사진"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <button
              type="button"
              class="hobak-write-slider-arrow next"
              id="hobakWriteNextBtn"
              aria-label="다음 사진"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>

            <div class="hobak-write-slide-badge-bar" id="hobakWriteBadgeBar"></div>
            <div class="hobak-write-dots" id="hobakWriteDots"></div>
          </div>

          <!-- 이미지 업로드 & 원클릭 샘플 사진 툴바 -->
          <div class="hobak-write-media-toolbar">
            <div class="hobak-write-media-actions">
              <input
                type="file"
                id="hobakWriteFileInput"
                class="hobak-write-file-input"
                accept="image/*"
                multiple
              />
              <button type="button" class="hobak-write-media-btn primary" id="hobakWritePcUploadBtn">
                📷 내 PC 사진 업로드
              </button>
              <button type="button" class="hobak-write-media-btn" id="hobakWriteToggleUrlBtn">
                🔗 이미지 URL 추가
              </button>
              <button type="button" class="hobak-write-media-btn" id="hobakWriteClearImgsBtn">
                🗑️ 사진 비우기
              </button>
            </div>

            <div class="hobak-write-url-row" id="hobakWriteUrlRow">
              <input
                type="url"
                id="hobakWriteUrlInput"
                class="hobak-write-url-input"
                placeholder="https:// 예시 이미지 주소를 입력 후 추가를 누르세요"
              />
              <button type="button" class="hobak-write-url-add-btn" id="hobakWriteUrlAddBtn">
                URL 추가
              </button>
            </div>

            <div class="hobak-write-sample-bar">
              <div class="hobak-write-sample-header">
                <span class="hobak-write-sample-label">✨ 원클릭 샘플 사진 프리셋</span>
                <label class="hobak-write-autofill-toggle" title="체크 시 샘플 사진과 함께 제목/가격/설명도 자동으로 채워줍니다">
                  <input type="checkbox" id="hobakWriteAutoFillCheck" checked />
                  <span>샘플 내용도 함께 채우기</span>
                </label>
              </div>
              <div class="hobak-write-sample-chips">
                <button type="button" class="hobak-write-sample-chip" data-sample-key="sneakers">👟 스니커즈</button>
                <button type="button" class="hobak-write-sample-chip" data-sample-key="smartphone">📱 스마트폰</button>
                <button type="button" class="hobak-write-sample-chip" data-sample-key="apparel">🧥 패딩/의류</button>
                <button type="button" class="hobak-write-sample-chip" data-sample-key="bag">👜 가방</button>
                <button type="button" class="hobak-write-sample-chip" data-sample-key="watchCamping">⌚ 시계/캠핑</button>
              </div>
            </div>

            <div class="hobak-write-thumb-strip" id="hobakWriteThumbStrip"></div>
          </div>

          <!-- 2. 판매자 프로필 & 동네 설정 행 (상세 페이지 프로필 영역 대응) -->
          <div class="hobak-write-profile-section">
            <div class="hobak-write-profile-left">
              <div class="hobak-write-avatar" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="8" r="4.2"></circle>
                  <path d="M4 21c0-4.4 3.6-7.6 8-7.6s8 3.2 8 7.6"></path>
                </svg>
              </div>
              <div class="hobak-write-seller-meta">
                <div class="hobak-write-nickname-wrap">
                  <input
                    type="text"
                    id="hobakWriteNicknameInput"
                    class="hobak-write-nickname-input"
                    value="${escapeHtml(defaultNickname)}"
                    placeholder="판매자 닉네임"
                    maxlength="20"
                    aria-label="판매자 닉네임"
                    ${currentAuthUser ? 'readonly title="로그인된 계정의 닉네임이 자동 적용됩니다."' : ''}
                  />
                </div>
                <select
                  id="hobakWriteLocationSelect"
                  class="hobak-write-location-select"
                  aria-label="거래 동네 선택"
                >
                  ${locations
                    .map(
                      loc =>
                        `<option value="${escapeHtml(loc)}" ${
                          loc === defaultLocation ? 'selected' : ''
                        }>${escapeHtml(loc)}</option>`
                    )
                    .join('')}
                </select>
              </div>
            </div>

            <div class="hobak-write-manner">
              <div class="hobak-write-manner-top">
                <span class="hobak-write-manner-temp">${defaultMannerTemp.toFixed(1)}°C</span>
                <span class="hobak-write-manner-face" aria-hidden="true">${defaultMannerEmoji}</span>
              </div>
              <span class="hobak-write-manner-label">매너온도</span>
            </div>
          </div>

          <!-- 3. 상품 정보 입력 본문 (상세 페이지 본문 순서와 1:1 매칭) -->
          <div class="hobak-write-body">
            <!-- 상품 제목 입력 -->
            <div class="hobak-write-title-field">
              <textarea
                id="hobakWriteTitleInput"
                class="hobak-write-title-input"
                rows="1"
                placeholder="글 제목을 입력해 주세요 (예: 브랜드, 상품명, 사이즈)"
                maxlength="80"
                aria-label="상품 제목"
              ></textarea>
            </div>

            <!-- 카테고리 선택 · 시간 표시 -->
            <div class="hobak-write-submeta-row">
              <select
                id="hobakWriteCategorySelect"
                class="hobak-write-category-select"
                aria-label="카테고리 선택"
              >
                ${categories
                  .map(
                    (cat, idx) =>
                      `<option value="${escapeHtml(cat)}" ${
                        idx === 0 ? 'selected' : ''
                      }>${escapeHtml(cat)}</option>`
                  )
                  .join('')}
              </select>
              <span class="hobak-write-time-dot">·</span>
              <span class="hobak-write-time-label">방금 전</span>
            </div>

            <!-- 판매 가격 입력 & 호박페이 사용 토글 -->
            <div class="hobak-write-price-row">
              <div class="hobak-write-price-input-group">
                <input
                  type="text"
                  inputmode="numeric"
                  id="hobakWritePriceInput"
                  class="hobak-write-price-input"
                  placeholder="가격 입력 (원)"
                  maxlength="13"
                  aria-label="판매 가격"
                />
                <span class="hobak-write-price-unit">원</span>
              </div>

              <label class="hobak-write-pay-toggle">
                <input type="checkbox" id="hobakWritePayCheck" checked />
                <span>🎃 호박페이 사용</span>
              </label>
            </div>

            <!-- 상세 설명 입력 -->
            <div class="hobak-write-desc-wrap">
              <textarea
                id="hobakWriteDescInput"
                class="hobak-write-desc-textarea"
                placeholder="판매할 물건에 대한 설명을 작성해 주세요.&#10;(구매 시기, 사용감, 하자 여부, 직거래 가능 장소 등을 적으면 거래가 빨라져요!)"
                aria-label="상품 상세 설명"
              ></textarea>
            </div>

            <!-- 하단 사이즈/스펙 입력 (상세 페이지 최하단 '사이즈 270' 행과 동일) -->
            <div class="hobak-write-size-row">
              <div class="hobak-write-size-left">
                <label for="hobakWriteSizeInput" class="hobak-write-size-label">사이즈</label>
                <input
                  type="text"
                  id="hobakWriteSizeInput"
                  class="hobak-write-size-input"
                  placeholder="예: 270, Free, 256GB"
                  maxlength="30"
                />
              </div>
              <div class="hobak-write-size-presets">
                <button type="button" class="hobak-write-size-chip" data-size-preset="270">270</button>
                <button type="button" class="hobak-write-size-chip" data-size-preset="Free">Free</button>
                <button type="button" class="hobak-write-size-chip" data-size-preset="256GB">256GB</button>
                <button type="button" class="hobak-write-size-chip" data-size-preset="S급 풀박스">S급 풀박스</button>
              </div>
            </div>

            <!-- 카드 하단 제출 버튼 -->
            <div class="hobak-write-footer-actions">
              <button type="button" class="hobak-write-reset-btn" id="hobakWriteResetBtn">
                초기화
              </button>
              <button type="submit" class="hobak-write-submit-btn" id="hobakWriteSubmitBtn">
                🎃 호박에 내 물건 등록하기
              </button>
            </div>
          </div>
        </form>
      </div>
    `;

    renderHeroSlider();
    bindEvents();

    // 단독 write.html?editId=... 지원
    try {
      const params = new URLSearchParams(window.location.search);
      const editId = params.get('editId');
      if (editId && window.HobakStore && typeof window.HobakStore.getItemById === 'function') {
        const targetItem = window.HobakStore.getItemById(Number(editId));
        if (targetItem) {
          loadItemForEdit(targetItem);
        }
      }
    } catch (e) {}
  }

  window.HobakWritePage = {
    init,
    resetForm,
    loadItemForEdit
  };
})();
