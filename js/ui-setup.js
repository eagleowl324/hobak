/**
 * 호박(🎃 호박) x StyleSeed ui-setup (sickn33/agentic-awesome-skills)
 * 인터랙티브 디자인 시스템 셋업 위저드 및 토큰 매니저 (js/ui-setup.js)
 *
 * - 4종 브랜드 스킨 (hobak, toss, linear, stripe)
 * - 라이트 / 다크 / 시스템 모드 (WCAG 시맨틱 토큰 동기화)
 * - 라디우스 스케일 (sharp, rounded, soft)
 * - 타이포그래피 스케일 (compact, default, comfortable)
 * - 실시간 디자인 토큰(tokens/*.json & CSS Variables) 인스펙터
 */

(function () {
  const UI_SETUP_STORAGE_KEY = 'hobak_ui_setup_config_v1';

  const SKIN_CATALOG = {
    hobak: {
      id: 'hobak',
      name: '🎃 호박 오리지널',
      sub: 'Karrot Warm · #FF6F0F',
      primary: '#FF6F0F',
      gradient: 'linear-gradient(135deg, #FF6F0F 0%, #FF8E3C 100%)'
    },
    toss: {
      id: 'toss',
      name: '💳 Toss 클린',
      sub: 'Financial Blue · #3182F6',
      primary: '#3182F6',
      gradient: 'linear-gradient(135deg, #3182F6 0%, #5B9DFF 100%)'
    },
    linear: {
      id: 'linear',
      name: '📐 Linear 스페이셜',
      sub: 'Indigo Precision · #5E6AD2',
      primary: '#5E6AD2',
      gradient: 'linear-gradient(135deg, #5E6AD2 0%, #828DF2 100%)'
    },
    stripe: {
      id: 'stripe',
      name: '✨ Stripe 커머스',
      sub: 'Editorial Blurple · #635BFF',
      primary: '#635BFF',
      gradient: 'linear-gradient(135deg, #635BFF 0%, #EC4899 100%)'
    }
  };

  const DEFAULT_CONFIG = {
    skin: 'hobak',
    theme: 'light', // 'light' | 'dark' | 'system'
    radius: 'rounded', // 'sharp' | 'rounded' | 'soft'
    scale: 'default' // 'compact' | 'default' | 'comfortable'
  };

  let currentConfig = loadConfig();

  function loadConfig() {
    try {
      const raw = localStorage.getItem(UI_SETUP_STORAGE_KEY);
      if (!raw) return { ...DEFAULT_CONFIG };
      const parsed = JSON.parse(raw);
      return {
        skin: SKIN_CATALOG[parsed.skin] ? parsed.skin : DEFAULT_CONFIG.skin,
        theme: ['light', 'dark', 'system'].includes(parsed.theme) ? parsed.theme : DEFAULT_CONFIG.theme,
        radius: ['sharp', 'rounded', 'soft'].includes(parsed.radius) ? parsed.radius : DEFAULT_CONFIG.radius,
        scale: ['compact', 'default', 'comfortable'].includes(parsed.scale) ? parsed.scale : DEFAULT_CONFIG.scale
      };
    } catch (e) {
      return { ...DEFAULT_CONFIG };
    }
  }

  function saveConfig() {
    try {
      localStorage.setItem(UI_SETUP_STORAGE_KEY, JSON.stringify(currentConfig));
    } catch (e) {}
  }

  function resolveEffectiveTheme(themeSetting) {
    if (themeSetting === 'system') {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }
    return themeSetting === 'dark' ? 'dark' : 'light';
  }

  function showSetupToast(message) {
    let toast = document.getElementById('ss-setup-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'ss-setup-toast';
      toast.className = 'hobak-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2300);
  }

  function applyConfigToDOM() {
    const root = document.documentElement;
    const effectiveTheme = resolveEffectiveTheme(currentConfig.theme);

    root.setAttribute('data-skin', currentConfig.skin);
    root.setAttribute('data-theme', effectiveTheme);
    root.setAttribute('data-radius', currentConfig.radius);
    root.setAttribute('data-scale', currentConfig.scale);
    root.classList.toggle('dark', effectiveTheme === 'dark');

    // 빠른 다크모드 아이콘 업데이트
    document.querySelectorAll('[data-ss-action="quick-toggle-theme"]').forEach(btn => {
      btn.textContent = effectiveTheme === 'dark' ? '☀️' : '🌙';
      btn.title = effectiveTheme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환';
    });

    updateWizardUI();
  }

  function buildTokenPreviewText() {
    const skinInfo = SKIN_CATALOG[currentConfig.skin] || SKIN_CATALOG.hobak;
    const effectiveTheme = resolveEffectiveTheme(currentConfig.theme);
    const radiusMap = { sharp: '10px', rounded: '20px', soft: '28px' };
    const scaleMap = { compact: '93.75%', default: '100%', comfortable: '106.25%' };

    return JSON.stringify(
      {
        'tokens/colors.json': {
          skin: currentConfig.skin,
          '--ss-brand-primary': skinInfo.primary,
          mode: `${currentConfig.theme} (resolved: ${effectiveTheme})`,
          '--hobak-bg-main': effectiveTheme === 'dark' ? '#12151E' : '#FFFFFF',
          '--hobak-text-primary': effectiveTheme === 'dark' ? '#F3F5F8' : '#212124'
        },
        'tokens/radii.json': {
          preset: currentConfig.radius,
          '--ss-radius-card': radiusMap[currentConfig.radius]
        },
        'tokens/typography.json': {
          preset: currentConfig.scale,
          rootFontSize: scaleMap[currentConfig.scale]
        }
      },
      null,
      2
    );
  }

  function injectTriggers() {
    // 1. 통합 페이지 상단 바 우측에 장착
    const globalRight = document.querySelector('.hobak-global-right');
    if (globalRight && !globalRight.querySelector('[data-ss-action="open-wizard"]')) {
      const quickThemeBtn = document.createElement('button');
      quickThemeBtn.type = 'button';
      quickThemeBtn.className = 'ss-theme-quick-btn';
      quickThemeBtn.setAttribute('data-ss-action', 'quick-toggle-theme');
      quickThemeBtn.textContent = resolveEffectiveTheme(currentConfig.theme) === 'dark' ? '☀️' : '🌙';

      const setupBtn = document.createElement('button');
      setupBtn.type = 'button';
      setupBtn.className = 'ss-setup-trigger-btn';
      setupBtn.setAttribute('data-ss-action', 'open-wizard');
      setupBtn.innerHTML = '<span>🎨 UI Setup</span>';

      globalRight.appendChild(quickThemeBtn);
      globalRight.appendChild(setupBtn);
    }

    // 2. 상품목록 또는 단독 페이지 Antigravity 독에 장착
    document.querySelectorAll('.ag-control-dock').forEach(dock => {
      if (!dock.querySelector('[data-ss-action="open-wizard"]')) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'ag-dock-btn';
        btn.setAttribute('data-ss-action', 'open-wizard');
        btn.innerHTML = '<span>🎨 UI Setup</span>';
        dock.appendChild(btn);
      }
    });
  }

  function ensureWizardModal() {
    let backdrop = document.getElementById('ssWizardBackdrop');
    if (backdrop) return backdrop;

    backdrop = document.createElement('div');
    backdrop.id = 'ssWizardBackdrop';
    backdrop.className = 'ss-wizard-backdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.setAttribute('aria-label', 'UI Setup 디자인 시스템 설정 위저드');

    backdrop.innerHTML = `
      <div class="ss-wizard-modal">
        <div class="ss-wizard-header">
          <div>
            <span class="ss-wizard-badge">✨ sickn33/agentic-awesome-skills · ui-setup</span>
            <h2 class="ss-wizard-title">StyleSeed UI Setup 디자인 시스템 위저드</h2>
            <p class="ss-wizard-subtitle">브랜드 스킨, 다크 모드, 모서리 곡률, 타이포그래피 토큰을 실시간으로 구성합니다.</p>
          </div>
          <button type="button" class="ss-wizard-close" data-ss-action="close-wizard" aria-label="닫기">✕</button>
        </div>

        <!-- Step 1: Brand Skin -->
        <div class="ss-wizard-section">
          <div class="ss-wizard-section-title">
            <span>1️⃣ Step 1. 브랜드 스킨 (Brand Skin Preset)</span>
          </div>
          <div class="ss-skin-grid">
            ${Object.values(SKIN_CATALOG)
              .map(
                skin => `
              <button type="button" class="ss-skin-card" data-ss-skin="${skin.id}">
                <span class="ss-skin-swatch" style="background: ${skin.gradient};"></span>
                <span class="ss-skin-info">
                  <strong>${skin.name}</strong>
                  <span>${skin.sub}</span>
                </span>
              </button>
            `
              )
              .join('')}
          </div>
        </div>

        <!-- Step 2: Color Mode (Light / Dark / System) -->
        <div class="ss-wizard-section">
          <div class="ss-wizard-section-title">
            <span>2️⃣ Step 2. 테마 컬러 모드 (WCAG Light / Dark Tokens)</span>
          </div>
          <div class="ss-option-row">
            <button type="button" class="ss-option-pill" data-ss-theme="light">☀️ 라이트 모드</button>
            <button type="button" class="ss-option-pill" data-ss-theme="dark">🌙 다크 모드</button>
            <button type="button" class="ss-option-pill" data-ss-theme="system">🌓 시스템 연동</button>
          </div>
        </div>

        <!-- Step 3: Border Radius Scale -->
        <div class="ss-wizard-section">
          <div class="ss-wizard-section-title">
            <span>3️⃣ Step 3. 모서리 곡률 스케일 (tokens/radii.json)</span>
          </div>
          <div class="ss-option-row">
            <button type="button" class="ss-option-pill" data-ss-radius="sharp">📐 모던 샤프 (10px)</button>
            <button type="button" class="ss-option-pill" data-ss-radius="rounded">🎃 호박 스탠다드 (20px)</button>
            <button type="button" class="ss-option-pill" data-ss-radius="soft">☁️ 소프트 라운드 (28px)</button>
          </div>
        </div>

        <!-- Step 4: Typography Scale -->
        <div class="ss-wizard-section">
          <div class="ss-wizard-section-title">
            <span>4️⃣ Step 4. 타이포그래피 스케일 (tokens/typography.json)</span>
          </div>
          <div class="ss-option-row">
            <button type="button" class="ss-option-pill" data-ss-scale="compact">컴팩트 뷰 (94%)</button>
            <button type="button" class="ss-option-pill" data-ss-scale="default">기본 프리텐다드 (100%)</button>
            <button type="button" class="ss-option-pill" data-ss-scale="comfortable">큰 글씨 가독성 (106%)</button>
          </div>
        </div>

        <!-- Live Token Manifest Output -->
        <div class="ss-wizard-section">
          <div class="ss-wizard-section-title">
            <span>📦 실시간 디자인 토큰 매니페스트 (Active Token State)</span>
          </div>
          <pre class="ss-token-preview" id="ssTokenPreviewBox"></pre>
        </div>

        <div class="ss-wizard-footer">
          <button type="button" class="ss-reset-btn" data-ss-action="reset-defaults">
            ↺ 호박 기본값으로 복원
          </button>
          <button type="button" class="ss-apply-btn" data-ss-action="close-wizard">
            ✓ 설정 완료 및 닫기
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);
    return backdrop;
  }

  function updateWizardUI() {
    const backdrop = document.getElementById('ssWizardBackdrop');
    if (!backdrop) return;

    backdrop.querySelectorAll('[data-ss-skin]').forEach(el => {
      el.classList.toggle('active', el.getAttribute('data-ss-skin') === currentConfig.skin);
    });
    backdrop.querySelectorAll('[data-ss-theme]').forEach(el => {
      el.classList.toggle('active', el.getAttribute('data-ss-theme') === currentConfig.theme);
    });
    backdrop.querySelectorAll('[data-ss-radius]').forEach(el => {
      el.classList.toggle('active', el.getAttribute('data-ss-radius') === currentConfig.radius);
    });
    backdrop.querySelectorAll('[data-ss-scale]').forEach(el => {
      el.classList.toggle('active', el.getAttribute('data-ss-scale') === currentConfig.scale);
    });

    const previewBox = backdrop.querySelector('#ssTokenPreviewBox');
    if (previewBox) {
      previewBox.textContent = buildTokenPreviewText();
    }
  }

  function openWizard() {
    const backdrop = ensureWizardModal();
    updateWizardUI();
    backdrop.classList.add('open');
  }

  function closeWizard() {
    const backdrop = document.getElementById('ssWizardBackdrop');
    if (backdrop) {
      backdrop.classList.remove('open');
    }
  }

  function bindGlobalEvents() {
    document.addEventListener('click', e => {
      const actionEl = e.target.closest('[data-ss-action]');
      if (actionEl) {
        const action = actionEl.getAttribute('data-ss-action');
        if (action === 'open-wizard') {
          openWizard();
        } else if (action === 'close-wizard') {
          closeWizard();
        } else if (action === 'quick-toggle-theme') {
          const curEffective = resolveEffectiveTheme(currentConfig.theme);
          currentConfig.theme = curEffective === 'dark' ? 'light' : 'dark';
          saveConfig();
          applyConfigToDOM();
          showSetupToast(
            currentConfig.theme === 'dark'
              ? '🌙 다크 모드 토큰(tokens/colors.json)이 적용되었습니다.'
              : '☀️ 라이트 모드 토큰이 적용되었습니다.'
          );
        } else if (action === 'reset-defaults') {
          currentConfig = { ...DEFAULT_CONFIG };
          saveConfig();
          applyConfigToDOM();
          showSetupToast('🎃 호박 오리지널 디자인 시스템 기본값으로 복원되었습니다.');
        }
        return;
      }

      // 모달 백드롭 클릭 시 닫기
      if (e.target && e.target.id === 'ssWizardBackdrop') {
        closeWizard();
        return;
      }

      const skinBtn = e.target.closest('[data-ss-skin]');
      if (skinBtn) {
        const skinId = skinBtn.getAttribute('data-ss-skin');
        if (SKIN_CATALOG[skinId]) {
          currentConfig.skin = skinId;
          saveConfig();
          applyConfigToDOM();
          showSetupToast(`${SKIN_CATALOG[skinId].name} 브랜드 스킨이 적용되었습니다.`);
        }
        return;
      }

      const themeBtn = e.target.closest('[data-ss-theme]');
      if (themeBtn) {
        currentConfig.theme = themeBtn.getAttribute('data-ss-theme');
        saveConfig();
        applyConfigToDOM();
        showSetupToast(`테마 모드가 '${currentConfig.theme}'(으)로 변경되었습니다.`);
        return;
      }

      const radiusBtn = e.target.closest('[data-ss-radius]');
      if (radiusBtn) {
        currentConfig.radius = radiusBtn.getAttribute('data-ss-radius');
        saveConfig();
        applyConfigToDOM();
        showSetupToast(`모서리 곡률 스케일(${currentConfig.radius})이 적용되었습니다.`);
        return;
      }

      const scaleBtn = e.target.closest('[data-ss-scale]');
      if (scaleBtn) {
        currentConfig.scale = scaleBtn.getAttribute('data-ss-scale');
        saveConfig();
        applyConfigToDOM();
        showSetupToast(`타이포그래피 스케일(${currentConfig.scale})이 적용되었습니다.`);
      }
    });

    // ESC 키로 위저드 닫기
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeWizard();
    });
  }

  // 초기 즉시 토큰 반영 (FOUC 방지)
  applyConfigToDOM();

  function initUISetup() {
    ensureWizardModal();
    injectTriggers();
    applyConfigToDOM();
    bindGlobalEvents();
  }

  window.HobakUISetup = {
    openWizard,
    closeWizard,
    getConfig: () => ({ ...currentConfig }),
    setSkin(skin) {
      if (SKIN_CATALOG[skin]) {
        currentConfig.skin = skin;
        saveConfig();
        applyConfigToDOM();
      }
    },
    setTheme(theme) {
      if (['light', 'dark', 'system'].includes(theme)) {
        currentConfig.theme = theme;
        saveConfig();
        applyConfigToDOM();
      }
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(initUISetup, 50);
    });
  } else {
    setTimeout(initUISetup, 50);
  }
})();
