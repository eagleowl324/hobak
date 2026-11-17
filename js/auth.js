/**
 * 호박(🎃 호박) 중고거래 웹서비스 - Supabase Auth 인증 및 모달 모듈 (js/auth.js)
 *
 * [핵심 요구사항 반영]
 * 1. 이메일, 비밀번호 기반 로그인 및 회원가입 모달 (회원가입 시 닉네임 필수 입력) + Supabase Auth 연동
 * 2. 로그인 상태에 따른 오른쪽 상단 버튼 전환:
 *    - 로그인 전: [로그인] 버튼만 표시
 *    - 로그인 후: [로그인] 버튼 숨김, [닉네임], [로그아웃] 버튼만 표시
 * 3. 비로그인 상태에서 글쓰기 클릭 시 로그인 모달을 먼저 띄우고, 로그인 성공 시 글쓰기 창이 나타나도록 제어
 * 4. 글 등록 시 로그인한 작성자(seller_id, seller_nickname)를 Supabase DB(profiles, items)에 저장하고
 *    목록 카드와 상세 화면에 글쓴이의 닉네임 표시
 */

(function () {
  const AUTH_SESSION_STORAGE_KEY = 'hobak_supabase_auth_session_v1';

  const SUPABASE_URL =
    (window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.url) ||
    'https://ntnvttihrxhfuwuzgutf.supabase.co';
  const SUPABASE_ANON_KEY =
    (window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.anonKey) ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50bnZ0dGlocnhoZnV3dXpndXRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ4MjgyNTksImV4cCI6MjExMDQwNDI1OX0.9uou3l9_Kz156yJET09t07TD6j5U3y0Giby-2axvndo';

  const state = {
    mode: 'login', // 'login' | 'signup'
    session: loadStoredSession(),
    pendingSuccessCallback: null,
    listeners: []
  };

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function showAuthToast(message) {
    let toast = document.getElementById('hobak-auth-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'hobak-auth-toast';
      toast.className = 'hobak-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }

  function authHeaders(accessToken) {
    return {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${accessToken || SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json'
    };
  }

  function loadStoredSession() {
    try {
      const raw = localStorage.getItem(AUTH_SESSION_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && parsed.user && parsed.user.id && parsed.access_token) {
        return parsed;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  function saveSession(sessionObj) {
    state.session = sessionObj;
    try {
      if (sessionObj) {
        localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(sessionObj));
      } else {
        localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
      }
    } catch (e) {}

    updateAllAuthBars();
    syncWriteFormNickname();

    state.listeners.forEach(fn => {
      try {
        fn(state.session ? state.session.user : null);
      } catch (e) {}
    });
  }

  async function fetchOrUpsertProfile(userId, accessToken, fallbackNickname) {
    let nickname = (fallbackNickname || '').trim();
    let location = '부산 중구 대청동4가';
    let mannerTemp = 36.5;

    try {
      // 1) 기존 public.profiles 레코드 조회
      const getRes = await fetch(
        `${SUPABASE_URL}/rest/v1/profiles?select=id,nickname,location_dong,manner_temp&id=eq.${encodeURIComponent(userId)}`,
        {
          method: 'GET',
          headers: authHeaders(accessToken)
        }
      );

      if (getRes.ok) {
        const rows = await getRes.json();
        if (Array.isArray(rows) && rows[0]) {
          if (!nickname && rows[0].nickname) {
            nickname = rows[0].nickname;
          }
          location = rows[0].location_dong || location;
          mannerTemp = Number(rows[0].manner_temp) || 36.5;
        }
      }

      if (!nickname) {
        nickname = '호박주민';
      }

      // 2) public.profiles 테이블에 최신 닉네임 Upsert 보장
      await fetch(`${SUPABASE_URL}/rest/v1/profiles?on_conflict=id`, {
        method: 'POST',
        headers: {
          ...authHeaders(accessToken),
          Prefer: 'resolution=merge-duplicates,return=minimal'
        },
        body: JSON.stringify({
          id: userId,
          nickname,
          location_dong: location,
          manner_temp: mannerTemp
        })
      });
    } catch (e) {
      if (!nickname) nickname = '호박주민';
    }

    return { nickname, location, mannerTemp };
  }

  async function signUpWithEmail({ email, password, nickname }) {
    const cleanEmail = String(email || '').trim();
    const cleanNickname = String(nickname || '').trim();

    const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        email: cleanEmail,
        password,
        data: {
          nickname: cleanNickname,
          location_dong: '부산 중구 대청동4가'
        }
      })
    });

    const data = await res.json();
    if (!res.ok) {
      const msg =
        data.msg ||
        data.error_description ||
        data.message ||
        '회원가입 중 오류가 발생했습니다.';
      throw new Error(translateAuthError(msg));
    }

    let accessToken = data.access_token || (data.session && data.session.access_token) || null;
    let refreshToken = data.refresh_token || (data.session && data.session.refresh_token) || null;
    let rawUser = data.user || (data.id ? data : null);

    // signup 응답에 세션 토큰이 없으면 자동 이메일 확인 트리거로 확정된 계정으로 즉시 로그인
    if (!accessToken) {
      const loginRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          email: cleanEmail,
          password
        })
      });
      const loginData = await loginRes.json();
      if (loginRes.ok && loginData.access_token) {
        accessToken = loginData.access_token;
        refreshToken = loginData.refresh_token;
        rawUser = loginData.user || rawUser;
      }
    }

    if (!rawUser || !rawUser.id) {
      throw new Error('회원 정보를 확인할 수 없습니다.');
    }

    const profile = await fetchOrUpsertProfile(rawUser.id, accessToken, cleanNickname);

    const sessionObj = {
      access_token: accessToken || SUPABASE_ANON_KEY,
      refresh_token: refreshToken || '',
      user: {
        id: rawUser.id,
        email: rawUser.email || cleanEmail,
        nickname: cleanNickname || profile.nickname,
        location: profile.location,
        mannerTemp: profile.mannerTemp
      }
    };

    saveSession(sessionObj);
    return sessionObj.user;
  }

  async function signInWithEmail({ email, password }) {
    const cleanEmail = String(email || '').trim();

    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        email: cleanEmail,
        password
      })
    });

    const data = await res.json();
    if (!res.ok) {
      const msg =
        data.msg ||
        data.error_description ||
        data.message ||
        '이메일 또는 비밀번호가 올바르지 않습니다.';
      throw new Error(translateAuthError(msg));
    }

    const rawUser = data.user;
    const accessToken = data.access_token;
    const metaNickname =
      (rawUser && rawUser.user_metadata && rawUser.user_metadata.nickname) || '';

    const profile = await fetchOrUpsertProfile(rawUser.id, accessToken, metaNickname);

    const sessionObj = {
      access_token: accessToken,
      refresh_token: data.refresh_token || '',
      user: {
        id: rawUser.id,
        email: rawUser.email || cleanEmail,
        nickname: profile.nickname || metaNickname || cleanEmail.split('@')[0],
        location: profile.location,
        mannerTemp: profile.mannerTemp
      }
    };

    saveSession(sessionObj);
    return sessionObj.user;
  }

  async function signOut() {
    const token = state.session && state.session.access_token;
    saveSession(null);

    if (token && token !== SUPABASE_ANON_KEY) {
      fetch(`${SUPABASE_URL}/auth/v1/logout`, {
        method: 'POST',
        headers: authHeaders(token)
      }).catch(() => {});
    }

    showAuthToast('로그아웃되었습니다.');

    if (window.HobakApp && typeof window.HobakApp.getState === 'function') {
      const appState = window.HobakApp.getState();
      if (appState && appState.currentView === 'write') {
        window.HobakApp.switchView('list');
      }
    } else if (window.location.pathname.endsWith('write.html')) {
      window.location.href = 'list.html';
    }
  }

  function translateAuthError(msg) {
    const lower = String(msg || '').toLowerCase();
    if (lower.includes('invalid login credentials')) {
      return '이메일 또는 비밀번호가 일치하지 않습니다.';
    }
    if (lower.includes('user already registered') || lower.includes('already been registered')) {
      return '이미 가입된 이메일입니다. [로그인] 탭에서 로그인해 주세요.';
    }
    if (lower.includes('password should be at least')) {
      return '비밀번호는 최소 6자 이상 입력해 주세요.';
    }
    if (lower.includes('unable to validate email') || lower.includes('invalid format')) {
      return '유효한 이메일 주소 형식을 입력해 주세요.';
    }
    if (lower.includes('email rate limit')) {
      return '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.';
    }
    return msg;
  }

  /* ------------------------------------------------------------------------
     오른쪽 상단 인증 버튼 렌더링 및 상태 전환
     - 로그인 전: [로그인] 버튼만 표시
     - 로그인 후: [로그인] 버튼 숨김, [닉네임], [로그아웃] 버튼만 표시
     ------------------------------------------------------------------------ */
  function getAuthRenderKey() {
    const user = state.session && state.session.user ? state.session.user : null;
    return user && user.id ? `user:${user.id}:${user.nickname || ''}` : 'guest';
  }

  function buildAuthBarHTML() {
    const user = state.session && state.session.user ? state.session.user : null;
    const isLogged = Boolean(user && user.id);
    const nicknameText = user ? user.nickname : '';

    return `
      <button
        type="button"
        class="hobak-auth-login-btn ${isLogged ? 'hobak-auth-hidden' : ''}"
        data-auth-action="open-login"
      >
        로그인
      </button>
      <div class="hobak-auth-user-group ${isLogged ? '' : 'hobak-auth-hidden'}" data-role="auth-user-group">
        <button
          type="button"
          class="hobak-auth-nickname-btn"
          data-role="auth-nickname-btn"
          title="현재 로그인된 닉네임"
        >
          🎃 ${escapeHtml(nicknameText)}
        </button>
        <button
          type="button"
          class="hobak-auth-logout-btn"
          data-auth-action="logout"
        >
          로그아웃
        </button>
      </div>
    `;
  }

  function injectAndRenderAuthBars() {
    const selectors = [
      '.hobak-header-top',
      '.hobak-global-right',
      '.hobak-detail-nav-links',
      '.hobak-write-topbar-Right'
    ];

    selectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(parentEl => {
        if (!parentEl.querySelector('[data-role="hobak-auth-bar"]')) {
          const bar = document.createElement('div');
          bar.className = 'hobak-auth-bar';
          bar.setAttribute('data-role', 'hobak-auth-bar');
          parentEl.appendChild(bar);
        }
      });
    });

    updateAllAuthBars();
  }

  function updateAllAuthBars() {
    const renderKey = getAuthRenderKey();
    const html = buildAuthBarHTML();
    document.querySelectorAll('[data-role="hobak-auth-bar"]').forEach(bar => {
      if (bar.getAttribute('data-auth-key') !== renderKey) {
        bar.setAttribute('data-auth-key', renderKey);
        bar.innerHTML = html;
      }
    });
  }

  function syncWriteFormNickname() {
    const user = state.session && state.session.user ? state.session.user : null;
    const nicknameInput = document.getElementById('hobakWriteNicknameInput');
    if (nicknameInput) {
      if (user && user.nickname) {
        nicknameInput.value = user.nickname;
        nicknameInput.readOnly = true;
        nicknameInput.title = '로그인된 계정의 닉네임이 자동 적용됩니다.';
      } else {
        nicknameInput.readOnly = false;
        nicknameInput.title = '';
      }
    }
    const locSelect = document.getElementById('hobakWriteLocationSelect');
    if (locSelect && user && user.location) {
      locSelect.value = user.location;
    }
    const mannerTempEl = document.querySelector('.hobak-write-manner-temp');
    const mannerFaceEl = document.querySelector('.hobak-write-manner-face');
    if (mannerTempEl) {
      const tempVal = user && user.mannerTemp ? Number(user.mannerTemp) : 50.2;
      mannerTempEl.textContent = `${tempVal.toFixed(1)}°C`;
      if (mannerFaceEl) {
        mannerFaceEl.textContent = tempVal >= 50 ? '😮' : tempVal >= 43 ? '😄' : '🙂';
      }
    }
  }

  /* ------------------------------------------------------------------------
     로그인 / 회원가입 모달 생성 및 제어
     ------------------------------------------------------------------------ */
  function ensureAuthModal() {
    let backdrop = document.getElementById('hobakAuthModalBackdrop');
    if (backdrop) return backdrop;

    backdrop = document.createElement('div');
    backdrop.id = 'hobakAuthModalBackdrop';
    backdrop.className = 'hobak-auth-backdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.setAttribute('aria-label', '호박 로그인 및 회원가입');

    backdrop.innerHTML = `
      <div class="hobak-auth-modal">
        <div class="hobak-auth-modal-top">
          <div class="hobak-auth-brand">
            <span>🎃</span>
            <span id="hobakAuthModalTitle">호박 로그인</span>
          </div>
          <button type="button" class="hobak-auth-close-btn" data-auth-action="close-modal" aria-label="닫기">✕</button>
        </div>

        <div id="hobakAuthNoticeBox" class="hobak-auth-notice"></div>

        <div class="hobak-auth-tabs" role="tablist">
          <button type="button" class="hobak-auth-tab active" data-auth-tab="login">로그인</button>
          <button type="button" class="hobak-auth-tab" data-auth-tab="signup">회원가입</button>
        </div>

        <form id="hobakAuthForm" novalidate>
          <!-- 회원가입 시에만 표시되는 필수 닉네임 필드 -->
          <div id="hobakAuthNicknameField" class="hobak-auth-field hobak-auth-hidden">
            <label for="hobakAuthNicknameInput" class="hobak-auth-label">
              닉네임<span class="hobak-auth-req">* (필수)</span>
            </label>
            <input
              type="text"
              id="hobakAuthNicknameInput"
              class="hobak-auth-input"
              placeholder="호박에서 사용할 닉네임 (예: 단호박러버)"
              maxlength="20"
              autocomplete="nickname"
            />
          </div>

          <div class="hobak-auth-field">
            <label for="hobakAuthEmailInput" class="hobak-auth-label">
              이메일<span class="hobak-auth-req">*</span>
            </label>
            <input
              type="email"
              id="hobakAuthEmailInput"
              class="hobak-auth-input"
              placeholder="example@hobak.com"
              required
              autocomplete="email"
            />
          </div>

          <div class="hobak-auth-field">
            <label for="hobakAuthPasswordInput" class="hobak-auth-label">
              비밀번호<span class="hobak-auth-req">*</span>
            </label>
            <input
              type="password"
              id="hobakAuthPasswordInput"
              class="hobak-auth-input"
              placeholder="비밀번호 입력 (6자 이상)"
              required
              autocomplete="current-password"
            />
          </div>

          <div id="hobakAuthErrorBox" class="hobak-auth-error"></div>

          <button type="submit" id="hobakAuthSubmitBtn" class="hobak-auth-submit-btn">
            로그인하기
          </button>
        </form>
      </div>
    `;

    document.body.appendChild(backdrop);

    const form = backdrop.querySelector('#hobakAuthForm');
    if (form) {
      form.addEventListener('submit', handleAuthFormSubmit);
    }

    return backdrop;
  }

  function setModalMode(mode) {
    state.mode = mode === 'signup' ? 'signup' : 'login';
    const backdrop = ensureAuthModal();

    const titleEl = backdrop.querySelector('#hobakAuthModalTitle');
    const nicknameField = backdrop.querySelector('#hobakAuthNicknameField');
    const passwordInput = backdrop.querySelector('#hobakAuthPasswordInput');
    const submitBtn = backdrop.querySelector('#hobakAuthSubmitBtn');
    const errorBox = backdrop.querySelector('#hobakAuthErrorBox');

    backdrop.querySelectorAll('[data-auth-tab]').forEach(tab => {
      tab.classList.toggle('active', tab.getAttribute('data-auth-tab') === state.mode);
    });

    if (errorBox) {
      errorBox.textContent = '';
      errorBox.classList.remove('show');
    }

    if (state.mode === 'signup') {
      if (titleEl) titleEl.textContent = '호박 회원가입';
      if (nicknameField) nicknameField.classList.remove('hobak-auth-hidden');
      if (passwordInput) passwordInput.setAttribute('autocomplete', 'new-password');
      if (submitBtn) submitBtn.textContent = '회원가입 및 로그인';
    } else {
      if (titleEl) titleEl.textContent = '호박 로그인';
      if (nicknameField) nicknameField.classList.add('hobak-auth-hidden');
      if (passwordInput) passwordInput.setAttribute('autocomplete', 'current-password');
      if (submitBtn) submitBtn.textContent = '로그인하기';
    }
  }

  function showModalError(msg) {
    const backdrop = ensureAuthModal();
    const errorBox = backdrop.querySelector('#hobakAuthErrorBox');
    if (errorBox) {
      errorBox.textContent = msg;
      errorBox.classList.add('show');
    }
  }

  function openModal(options = {}) {
    const backdrop = ensureAuthModal();
    setModalMode(options.mode || 'login');

    const noticeBox = backdrop.querySelector('#hobakAuthNoticeBox');
    if (noticeBox) {
      if (options.notice) {
        noticeBox.textContent = options.notice;
        noticeBox.classList.add('show');
      } else {
        noticeBox.textContent = '';
        noticeBox.classList.remove('show');
      }
    }

    if (typeof options.onSuccess === 'function') {
      state.pendingSuccessCallback = options.onSuccess;
    } else if (!options.keepPending) {
      state.pendingSuccessCallback = null;
    }

    backdrop.classList.add('open');

    setTimeout(() => {
      const targetInput =
        state.mode === 'signup'
          ? backdrop.querySelector('#hobakAuthNicknameInput')
          : backdrop.querySelector('#hobakAuthEmailInput');
      if (targetInput) targetInput.focus();
    }, 60);
  }

  function closeModal(clearPending = true) {
    const backdrop = document.getElementById('hobakAuthModalBackdrop');
    if (backdrop) {
      backdrop.classList.remove('open');
    }
    if (clearPending) {
      state.pendingSuccessCallback = null;
    }
  }

  async function handleAuthFormSubmit(e) {
    e.preventDefault();
    const backdrop = ensureAuthModal();
    const nicknameInput = backdrop.querySelector('#hobakAuthNicknameInput');
    const emailInput = backdrop.querySelector('#hobakAuthEmailInput');
    const passwordInput = backdrop.querySelector('#hobakAuthPasswordInput');
    const submitBtn = backdrop.querySelector('#hobakAuthSubmitBtn');

    const nickname = nicknameInput ? nicknameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value : '';

    if (state.mode === 'signup' && !nickname) {
      showModalError('회원가입 시 닉네임은 필수로 입력해야 합니다.');
      if (nicknameInput) nicknameInput.focus();
      return;
    }

    if (!email || !email.includes('@')) {
      showModalError('올바른 이메일 주소를 입력해 주세요.');
      if (emailInput) emailInput.focus();
      return;
    }

    if (!password || password.length < 6) {
      showModalError('비밀번호를 6자 이상 입력해 주세요.');
      if (passwordInput) passwordInput.focus();
      return;
    }

    if (submitBtn) submitBtn.disabled = true;

    try {
      let user = null;
      if (state.mode === 'signup') {
        user = await signUpWithEmail({ email, password, nickname });
        showAuthToast(`🎉 환영합니다, '${user.nickname}'님! 회원가입 및 로그인이 완료되었습니다.`);
      } else {
        user = await signInWithEmail({ email, password });
        showAuthToast(`🎃 반갑습니다, '${user.nickname}'님!`);
      }

      const callback = state.pendingSuccessCallback;
      state.pendingSuccessCallback = null;
      closeModal(false);

      if (passwordInput) passwordInput.value = '';

      if (typeof callback === 'function') {
        callback(user);
      }
    } catch (err) {
      showModalError(err.message || '인증 처리 중 오류가 발생했습니다.');
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  }

  function requireAuth(onAuthenticated) {
    if (state.session && state.session.user && state.session.user.id) {
      syncWriteFormNickname();
      if (typeof onAuthenticated === 'function') {
        onAuthenticated(state.session.user);
      }
      return true;
    }

    openModal({
      mode: 'login',
      notice: '✏️ 글쓰기는 로그인 후 이용할 수 있어요. 로그인 또는 회원가입을 완료하면 바로 글쓰기 창이 열립니다!',
      onSuccess(user) {
        syncWriteFormNickname();
        if (typeof onAuthenticated === 'function') {
          onAuthenticated(user);
        }
      }
    });
    return false;
  }

  function bindGlobalAuthEvents() {
    if (document._hobakAuthBound) return;
    document._hobakAuthBound = true;

    document.addEventListener('click', e => {
      const actionEl = e.target.closest('[data-auth-action]');
      if (actionEl) {
        const action = actionEl.getAttribute('data-auth-action');
        if (action === 'open-login') {
          openModal({ mode: 'login' });
        } else if (action === 'close-modal') {
          closeModal(true);
        } else if (action === 'logout') {
          signOut();
        }
        return;
      }

      // 단독 페이지에서 <a href="./write.html"> 클릭 시 비로그인이면 로그인 모달 먼저 표시
      const writeLink = e.target.closest('a[href$="write.html"]');
      if (writeLink && (!state.session || !state.session.user || !state.session.user.id)) {
        e.preventDefault();
        const targetHref = writeLink.getAttribute('href') || 'write.html';
        requireAuth(() => {
          window.location.href = targetHref;
        });
        return;
      }

      const tabEl = e.target.closest('[data-auth-tab]');
      if (tabEl) {
        setModalMode(tabEl.getAttribute('data-auth-tab'));
        return;
      }

      if (e.target && e.target.id === 'hobakAuthModalBackdrop') {
        closeModal(true);
      }
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        closeModal(true);
      }
    });

    // 새로운 헤더 DOM이 동적으로 마운트될 때만 인증 바 삽입 (자체 변경은 무시)
    const observer = new MutationObserver(mutations => {
      let shouldCheck = false;
      for (const m of mutations) {
        if (m.type !== 'childList' || m.addedNodes.length === 0) continue;
        const t = m.target;
        if (t instanceof HTMLElement) {
          if (
            t.closest('[data-role="hobak-auth-bar"]') ||
            t.closest('#hobakAuthModalBackdrop') ||
            t.classList.contains('hobak-toast')
          ) {
            continue;
          }
          for (const node of m.addedNodes) {
            if (node instanceof HTMLElement) {
              if (
                node.matches('[data-role="hobak-auth-bar"], #hobakAuthModalBackdrop, .hobak-toast')
              ) {
                continue;
              }
              if (
                node.querySelector('.hobak-header-top, .hobak-global-right, .hobak-detail-nav-links, .hobak-write-topbar-Right') ||
                node.matches('.hobak-header-top, .hobak-global-right, .hobak-detail-nav-links, .hobak-write-topbar-Right')
              ) {
                shouldCheck = true;
                break;
              }
            }
          }
        }
        if (shouldCheck) break;
      }
      if (shouldCheck) {
        injectAndRenderAuthBars();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function initAuth() {
    state.session = loadStoredSession();
    ensureAuthModal();
    injectAndRenderAuthBars();
    syncWriteFormNickname();
    bindGlobalAuthEvents();

    // 단독 write.html에 비로그인으로 직접 진입한 경우 로그인 모달 자동 표시
    if (
      window.location.pathname.endsWith('write.html') &&
      (!state.session || !state.session.user || !state.session.user.id)
    ) {
      requireAuth(() => {
        syncWriteFormNickname();
      });
    }
  }

  window.HobakAuth = {
    init: initAuth,
    isLoggedIn: () => Boolean(state.session && state.session.user && state.session.user.id),
    getUser: () => (state.session && state.session.user ? { ...state.session.user } : null),
    getAccessToken: () => (state.session ? state.session.access_token : null),
    openModal,
    closeModal,
    requireAuth,
    signOut,
    onChange(fn) {
      if (typeof fn === 'function') state.listeners.push(fn);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
  } else {
    initAuth();
  }
})();
