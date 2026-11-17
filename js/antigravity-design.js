/**
 * 호박(🎃 호박) x Antigravity Design Expert (sickn33/agentic-awesome-skills)
 * GSAP + ScrollTrigger + 3D CSS Spatial UI Engine (antigravity-design.js)
 *
 * 핵심 기능:
 * 1. Ambient Spatial Background Orbs (GSAP 무중력 배경 광원 부유 애니메이션)
 * 2. 3D Magnetic Tilt & Specular Glare (마우스 커서 반응형 rotateX/rotateY 및 광원 반사)
 * 3. Weightless Stagger Entrance & Levitation (상품 카드 무중력 등장 및 연속 부유 모션)
 * 4. Isometric 3D Grid Mode Toggle (아이소메트릭 3D 공간 그리드 뷰 전환)
 */

(function () {
  const agState = {
    floatEnabled: true,
    isometricEnabled: false,
    floatTweens: []
  };

  function hasGSAP() {
    return typeof window.gsap !== 'undefined';
  }

  function showAgToast(message) {
    let toast = document.getElementById('ag-design-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'ag-design-toast';
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

  /* ------------------------------------------------------------------------
     1. Ambient Spatial Background (Orbs + Spatial Grid Mesh)
     ------------------------------------------------------------------------ */
  function injectSpatialBackground() {
    if (document.querySelector('.ag-spatial-bg')) return;
    const bg = document.createElement('div');
    bg.className = 'ag-spatial-bg';
    bg.setAttribute('aria-hidden', 'true');
    bg.innerHTML = `
      <div class="ag-spatial-grid-mesh"></div>
      <div class="ag-spatial-orb orb-1"></div>
      <div class="ag-spatial-orb orb-2"></div>
      <div class="ag-spatial-orb orb-3"></div>
    `;
    document.body.prepend(bg);

    if (hasGSAP()) {
      const gsap = window.gsap;
      gsap.to('.ag-spatial-orb.orb-1', {
        x: 70,
        y: 50,
        scale: 1.12,
        duration: 9,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
      gsap.to('.ag-spatial-orb.orb-2', {
        x: -80,
        y: 65,
        scale: 1.15,
        duration: 11,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
      gsap.to('.ag-spatial-orb.orb-3', {
        x: 60,
        y: -55,
        scale: 1.1,
        duration: 10,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    }
  }

  /* ------------------------------------------------------------------------
     2. Antigravity Control Dock (Isometric 3D Grid & Weightless Float Toggles)
     ------------------------------------------------------------------------ */
  function injectControlDock() {
    document.body.classList.toggle('ag-float-active', agState.floatEnabled);

    // 상품목록 필터 우측 영역 또는 우하단 플로팅 독에 컨트롤 버튼 장착
    const filterRight = document.querySelector('.hobak-filter-right');
    if (filterRight && !filterRight.querySelector('.ag-control-dock')) {
      const dock = document.createElement('div');
      dock.className = 'ag-control-dock';
      dock.innerHTML = `
        <span class="ag-dock-badge" title="sickn33/agentic-awesome-skills: antigravity-design-expert 적용됨">
          ✨ Antigravity UI
        </span>
        <button type="button" class="ag-dock-btn ${agState.floatEnabled ? 'active' : ''}" data-ag-action="toggle-float" title="무중력 부유 및 3D 마그네틱 틸트 효과 토글">
          <span>🪐 무중력 부유</span>
        </button>
        <button type="button" class="ag-dock-btn ${agState.isometricEnabled ? 'active' : ''}" data-ag-action="toggle-isometric" title="3D 아이소메트릭 그리드 뷰 전환">
          <span>🧊 3D 아이소메트릭 뷰</span>
        </button>
      `;
      filterRight.prepend(dock);
    }

    // 단독 상세/글쓰기 페이지에서도 확인 가능하도록 플로팅 독 제공 (통합 페이지나 목록이 아닐 때)
    if (!document.querySelector('.hobak-filter-right') && !document.querySelector('.ag-floating-dock')) {
      const floatDock = document.createElement('div');
      floatDock.className = 'ag-control-dock ag-floating-dock';
      floatDock.innerHTML = `
        <span class="ag-dock-badge">✨ Antigravity Design</span>
        <button type="button" class="ag-dock-btn ${agState.floatEnabled ? 'active' : ''}" data-ag-action="toggle-float">
          <span>🪐 무중력 3D</span>
        </button>
      `;
      document.body.appendChild(floatDock);
    }
  }

  function updateDockButtons() {
    document.querySelectorAll('[data-ag-action="toggle-float"]').forEach(btn => {
      btn.classList.toggle('active', agState.floatEnabled);
    });
    document.querySelectorAll('[data-ag-action="toggle-isometric"]').forEach(btn => {
      btn.classList.toggle('active', agState.isometricEnabled);
    });
  }

  function toggleFloatMode() {
    agState.floatEnabled = !agState.floatEnabled;
    document.body.classList.toggle('ag-float-active', agState.floatEnabled);
    updateDockButtons();

    if (agState.floatEnabled) {
      startWeightlessLevitation();
      showAgToast('🪐 Antigravity 무중력 부유 & 3D 틸트 모드가 활성화되었습니다.');
    } else {
      stopWeightlessLevitation();
      showAgToast('무중력 부유 모션을 일시 정지했습니다.');
    }
  }

  function toggleIsometricMode() {
    agState.isometricEnabled = !agState.isometricEnabled;
    document.body.classList.toggle('ag-isometric-active', agState.isometricEnabled);
    updateDockButtons();

    const grid = document.querySelector('.hobak-product-grid');
    if (grid && hasGSAP()) {
      const cards = grid.querySelectorAll('.hobak-product-card');
      window.gsap.fromTo(
        cards,
        { z: -40, opacity: 0.75 },
        {
          z: 0,
          opacity: 1,
          duration: 0.55,
          stagger: 0.04,
          ease: 'back.out(1.6)',
          overwrite: 'auto'
        }
      );
    }

    if (agState.isometricEnabled) {
      showAgToast('🧊 3D 아이소메트릭 공간 그리드 뷰(Isometric Grid)로 전환되었습니다!');
    } else {
      showAgToast('기본 공간 그리드 뷰로 전환되었습니다.');
    }
  }

  /* ------------------------------------------------------------------------
     3. 3D Magnetic Tilt & Specular Glare on Cards
     ------------------------------------------------------------------------ */
  function attach3DTilt(cardEl, options = {}) {
    if (!cardEl || cardEl._agTiltAttached) return;
    cardEl._agTiltAttached = true;

    const maxTilt = options.maxTilt || 9;
    const liftY = options.liftY || -8;
    const scaleAmt = options.scale || 1.02;

    // 스페큘러 광원 레이어 삽입
    if (!cardEl.querySelector('.ag-card-glare')) {
      const glare = document.createElement('div');
      glare.className = 'ag-card-glare';
      glare.setAttribute('aria-hidden', 'true');
      cardEl.appendChild(glare);
    }

    cardEl.addEventListener('mousemove', e => {
      if (!agState.floatEnabled) return;
      // 입력창 및 인터랙션 버튼 위에서는 클릭 오작동 방지를 위해 기울기 억제
      if (
        options.ignoreInputs &&
        e.target instanceof Element &&
        e.target.closest('input, textarea, select, button, a, label')
      ) {
        return;
      }

      const rect = cardEl.getBoundingClientRect();
      const relX = e.clientX - rect.left;
      const relY = e.clientY - rect.top;
      const pctX = Math.max(0, Math.min(1, relX / rect.width));
      const pctY = Math.max(0, Math.min(1, relY / rect.height));

      const rotateY = (pctX - 0.5) * maxTilt * 2;
      const rotateX = (0.5 - pctY) * maxTilt * 2;

      cardEl.style.setProperty('--ag-glare-x', `${(pctX * 100).toFixed(1)}%`);
      cardEl.style.setProperty('--ag-glare-y', `${(pctY * 100).toFixed(1)}%`);

      if (agState.isometricEnabled && cardEl.classList.contains('hobak-product-card')) {
        return; // 아이소메트릭 뷰에서는 CSS Z축 호버 부유 우선
      }

      if (hasGSAP()) {
        window.gsap.to(cardEl, {
          rotateX,
          rotateY,
          y: liftY,
          scale: scaleAmt,
          transformPerspective: 1200,
          duration: 0.35,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      } else {
        cardEl.style.transform = `perspective(1200px) translateY(${liftY}px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale(${scaleAmt})`;
      }
    });

    cardEl.addEventListener('mouseleave', () => {
      if (hasGSAP()) {
        window.gsap.to(cardEl, {
          rotateX: 0,
          rotateY: 0,
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: 'elastic.out(1, 0.6)',
          overwrite: 'auto'
        });
      } else {
        cardEl.style.transform = '';
      }
    });
  }

  /* ------------------------------------------------------------------------
     4. Weightless Stagger Entrance & Continuous Levitation (GSAP)
     ------------------------------------------------------------------------ */
  function stopWeightlessLevitation() {
    agState.floatTweens.forEach(t => {
      if (t && typeof t.kill === 'function') t.kill();
    });
    agState.floatTweens = [];

    document.querySelectorAll('.hobak-product-card').forEach(card => {
      if (hasGSAP()) {
        window.gsap.set(card, { clearProps: 'transform' });
      } else {
        card.style.transform = '';
      }
    });
  }

  function startWeightlessLevitation() {
    stopWeightlessLevitation();
    if (!agState.floatEnabled || !hasGSAP()) return;

    const cards = document.querySelectorAll('.hobak-product-card');
    cards.forEach((card, idx) => {
      const tween = window.gsap.to(card, {
        y: -5 - (idx % 3) * 1.5,
        duration: 2.4 + (idx % 4) * 0.35,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: (idx % 5) * 0.18
      });
      agState.floatTweens.push(tween);
    });
  }

  function enhanceProductGrid(animateEntrance = true) {
    const cards = document.querySelectorAll('.hobak-product-card');
    cards.forEach(card => {
      attach3DTilt(card, { maxTilt: 8.5, liftY: -10, scale: 1.02 });
    });

    const sidebarCard = document.querySelector('.hobak-sidebar-card');
    if (sidebarCard) {
      attach3DTilt(sidebarCard, { maxTilt: 5, liftY: -4, scale: 1.01 });
    }

    if (animateEntrance && hasGSAP() && cards.length > 0) {
      window.gsap.fromTo(
        cards,
        {
          opacity: 0,
          y: 28,
          rotateX: 10,
          scale: 0.96
        },
        {
          opacity: (_, target) => (target.classList.contains('is-sold') ? 0.54 : 1),
          y: 0,
          rotateX: 0,
          scale: 1,
          duration: 0.55,
          stagger: 0.045,
          ease: 'power3.out',
          overwrite: 'auto',
          clearProps: 'opacity',
          onComplete: () => {
            if (agState.floatEnabled) {
              startWeightlessLevitation();
            }
          }
        }
      );
    }
  }

  function enhanceDetailAndWriteCards() {
    const detailCard = document.querySelector('.hobak-detail-card');
    if (detailCard) {
      attach3DTilt(detailCard, { maxTilt: 1.8, liftY: 0, scale: 1, ignoreInputs: true });
      if (hasGSAP() && !detailCard._agAnimatedIn) {
        detailCard._agAnimatedIn = true;
        window.gsap.fromTo(
          detailCard,
          { opacity: 0, y: 26, rotateX: 8, scale: 0.97 },
          { opacity: 1, y: 0, rotateX: 0, scale: 1, duration: 0.55, ease: 'power3.out' }
        );
      }
    }

    const writeCard = document.querySelector('.hobak-write-card');
    if (writeCard) {
      attach3DTilt(writeCard, { maxTilt: 1.5, liftY: 0, scale: 1, ignoreInputs: true });
      if (hasGSAP() && !writeCard._agAnimatedIn) {
        writeCard._agAnimatedIn = true;
        window.gsap.fromTo(
          writeCard,
          { opacity: 0, y: 26, rotateX: 7, scale: 0.97 },
          { opacity: 1, y: 0, rotateX: 0, scale: 1, duration: 0.55, ease: 'power3.out' }
        );
      }
    }
  }

  /* ------------------------------------------------------------------------
     5. DOM Observer & Global Event Binding
     ------------------------------------------------------------------------ */
  function setupObserversAndEvents() {
    document.addEventListener('click', e => {
      const actionBtn = e.target.closest('[data-ag-action]');
      if (!actionBtn) return;
      const action = actionBtn.getAttribute('data-ag-action');
      if (action === 'toggle-float') {
        toggleFloatMode();
      } else if (action === 'toggle-isometric') {
        toggleIsometricMode();
      }
    });

    // 상품 그리드나 상세/글쓰기 카드가 다시 렌더링될 때 자동으로 Antigravity 3D 효과 재바인딩
    const observer = new MutationObserver(mutations => {
      let gridChanged = false;
      let cardChanged = false;

      for (const m of mutations) {
        if (m.type !== 'childList' || m.addedNodes.length === 0) continue;
        const target = m.target;
        if (!(target instanceof HTMLElement)) continue;

        if (
          target.closest('#hobakAuthModalBackdrop') ||
          target.closest('#ssWizardBackdrop') ||
          target.classList.contains('ag-card-glare') ||
          target.classList.contains('hobak-toast')
        ) {
          continue;
        }

        if (target.matches('[data-role="product-grid"]')) {
          gridChanged = true;
        }

        for (const node of m.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;
          if (
            node.matches('.ag-card-glare, .hobak-toast, #hobakAuthModalBackdrop, #ssWizardBackdrop, .ag-spatial-bg')
          ) {
            continue;
          }
          if (node.matches('.hobak-product-card') || node.querySelector('.hobak-product-card')) {
            gridChanged = true;
          }
          if (
            node.matches('.hobak-detail-card, .hobak-write-card') ||
            node.querySelector('.hobak-detail-card, .hobak-write-card')
          ) {
            cardChanged = true;
          }
        }
      }

      if (gridChanged) {
        injectControlDock();
        enhanceProductGrid(true);
      }
      if (cardChanged) {
        enhanceDetailAndWriteCards();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  function initAntigravityDesign() {
    if (hasGSAP() && typeof window.ScrollTrigger !== 'undefined') {
      window.gsap.registerPlugin(window.ScrollTrigger);
    }

    injectSpatialBackground();
    injectControlDock();
    enhanceProductGrid(true);
    enhanceDetailAndWriteCards();
    setupObserversAndEvents();
  }

  window.HobakAntigravityDesign = {
    init: initAntigravityDesign,
    toggleFloatMode,
    toggleIsometricMode
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(initAntigravityDesign, 30);
    });
  } else {
    setTimeout(initAntigravityDesign, 30);
  }
})();
