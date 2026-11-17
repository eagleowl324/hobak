/**
 * 호박(🎃 호박) 중고거래 웹서비스 - 통합 사이트 컨트롤러 (app.js)
 * 3명의 서브에이전트가 각각 개발한
 * - 상품목록 페이지 (window.HobakListPage)
 * - 상품상세 페이지 (window.HobakDetailPage)
 * - 글쓰기 페이지   (window.HobakWritePage)
 * 를 하나의 통합 웹서비스로 연결합니다.
 */

(function () {
  const state = {
    currentView: 'list', // 'list' | 'detail' | 'write'
    currentItemId: 1
  };

  function showAppToast(message) {
    let toast = document.getElementById('hobak-app-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'hobak-app-toast';
      toast.className = 'hobak-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2400);
  }

  function populateQuickItemSelect() {
    const select = document.getElementById('hobakQuickItemSelect');
    if (!select || !window.HobakStore) return;

    const items = window.HobakStore.getItems();
    select.innerHTML = items
      .map(
        item =>
          `<option value="${item.id}" ${
            Number(item.id) === Number(state.currentItemId) ? 'selected' : ''
          }>#${item.id} ${item.title.slice(0, 18)}${
            item.title.length > 18 ? '…' : ''
          }</option>`
      )
      .join('');
  }

  function updateGlobalNavUI() {
    const tabs = document.querySelectorAll('[data-app-view]');
    tabs.forEach(tab => {
      const view = tab.getAttribute('data-app-view');
      tab.classList.toggle('active', view === state.currentView);
    });

    const views = {
      list: document.getElementById('hobakViewList'),
      detail: document.getElementById('hobakViewDetail'),
      write: document.getElementById('hobakViewWrite')
    };

    Object.keys(views).forEach(key => {
      if (views[key]) {
        views[key].classList.toggle('active', key === state.currentView);
      }
    });

    populateQuickItemSelect();
  }

  function switchView(viewName, options = {}) {
    if (viewName === 'write' && window.HobakAuth && !window.HobakAuth.isLoggedIn()) {
      window.HobakAuth.requireAuth(() => {
        switchView('write');
      });
      return;
    }

    state.currentView = viewName;

    if (viewName === 'list') {
      if (window.HobakListPage) {
        if (options.category) {
          window.HobakListPage.setCategory(options.category);
        } else {
          window.HobakListPage.refresh();
        }
      }
      updateGlobalNavUI();
      if (!options.skipHash) {
        history.replaceState(null, '', '#list');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (viewName === 'detail') {
      if (options.itemId !== undefined && options.itemId !== null) {
        state.currentItemId = Number(options.itemId) || 1;
      }
      if (window.HobakDetailPage) {
        window.HobakDetailPage.renderItem(state.currentItemId);
      }
      updateGlobalNavUI();
      if (!options.skipHash) {
        history.replaceState(null, '', `#detail?id=${state.currentItemId}`);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (viewName === 'write') {
      if (window.HobakAuth && !window.HobakAuth.isLoggedIn()) {
        window.HobakAuth.requireAuth(() => {
          switchView('write', options);
        });
        return;
      }
      state.currentView = 'write';
      if (options.editItem && window.HobakWritePage && typeof window.HobakWritePage.loadItemForEdit === 'function') {
        window.HobakWritePage.loadItemForEdit(options.editItem);
      } else {
        if (window.HobakWritePage && typeof window.HobakWritePage.resetForm === 'function') {
          window.HobakWritePage.resetForm();
        }
        const authUser = window.HobakAuth ? window.HobakAuth.getUser() : null;
        const nickInput = document.getElementById('hobakWriteNicknameInput');
        if (authUser && authUser.nickname && nickInput) {
          nickInput.value = authUser.nickname;
        }
      }
      updateGlobalNavUI();
      if (!options.skipHash) {
        history.replaceState(null, '', '#write');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function parseInitialRoute() {
    const hash = window.location.hash || '';
    if (hash.startsWith('#detail')) {
      const queryPart = hash.split('?')[1] || '';
      const params = new URLSearchParams(queryPart);
      const id = Number(params.get('id')) || 1;
      state.currentItemId = id;
      return { view: 'detail', itemId: id };
    }
    if (hash.startsWith('#write')) {
      return { view: 'write' };
    }
    return { view: 'list' };
  }

  function initApp() {
    const listContainer = document.getElementById('hobakIntegratedListMount');
    const detailContainer = document.getElementById('hobakIntegratedDetailMount');
    const writeContainer = document.getElementById('hobakIntegratedWriteMount');

    // 1. 상품목록 서브에이전트 모듈 마운트
    if (window.HobakListPage && listContainer) {
      window.HobakListPage.init({
        container: listContainer,
        onSelectItem(itemId) {
          switchView('detail', { itemId });
        },
        onClickWrite() {
          switchView('write');
        }
      });
    }

    // 2. 상품상세 서브에이전트 모듈 마운트
    if (window.HobakDetailPage && detailContainer) {
      window.HobakDetailPage.init({
        container: detailContainer,
        itemId: state.currentItemId,
        onClose(filterCategory) {
          if (typeof filterCategory === 'string' && filterCategory) {
            switchView('list', { category: filterCategory });
            showAppToast(`'${filterCategory}' 카테고리로 필터링했습니다.`);
          } else {
            switchView('list');
          }
        },
        onDeleted() {
          if (window.HobakListPage) window.HobakListPage.refresh();
          const remaining = window.HobakStore ? window.HobakStore.getItems() : [];
          state.currentItemId = remaining[0] ? remaining[0].id : 1;
          switchView('list');
        },
        onEdit(item) {
          switchView('write', { editItem: item });
        }
      });
    }

    // 3. 글쓰기 서브에이전트 모듈 마운트
    if (window.HobakWritePage && writeContainer) {
      window.HobakWritePage.init({
        container: writeContainer,
        onCancel() {
          switchView('list');
        },
        onSubmitted(newItem, meta) {
          if (window.HobakListPage) {
            window.HobakListPage.refresh();
          }
          if (newItem && newItem.id) {
            state.currentItemId = Number(newItem.id);
            switchView('detail', { itemId: newItem.id });
            if (meta && meta.isEdit) {
              showAppToast(`✏️ '${newItem.title}' 게시글이 수정되었습니다!`);
            } else {
              showAppToast(`🎉 '${newItem.title}' 상품이 등록되었습니다!`);
            }
          } else {
            switchView('list');
          }
        }
      });
    }

    // 4. 상단 글로벌 네비게이션 탭 이벤트 바인딩
    document.querySelectorAll('[data-app-view]').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetView = btn.getAttribute('data-app-view');
        if (targetView) {
          switchView(targetView);
        }
      });
    });

    // 5. 빠른 상품 선택 드롭다운 이벤트
    const quickSelect = document.getElementById('hobakQuickItemSelect');
    if (quickSelect) {
      quickSelect.addEventListener('change', e => {
        const selectedId = Number(e.target.value) || 1;
        switchView('detail', { itemId: selectedId });
      });
    }

    // 6. 스테이지 상단 보조 버튼 바인딩
    document.querySelectorAll('[data-stage-nav]').forEach(btn => {
      btn.addEventListener('click', () => {
        const dest = btn.getAttribute('data-stage-nav');
        if (dest === 'prev-item' || dest === 'next-item') {
          const items = window.HobakStore ? window.HobakStore.getItems() : [];
          if (items.length === 0) return;
          const idx = items.findIndex(i => Number(i.id) === Number(state.currentItemId));
          const curIdx = idx === -1 ? 0 : idx;
          const nextIdx =
            dest === 'next-item'
              ? (curIdx + 1) % items.length
              : (curIdx - 1 + items.length) % items.length;
          switchView('detail', { itemId: items[nextIdx].id });
        } else if (dest) {
          switchView(dest);
        }
      });
    });

    // 7. 초기 해시 라우팅 적용
    const initial = parseInitialRoute();
    switchView(initial.view, { itemId: initial.itemId, skipHash: true });

    window.addEventListener('hashchange', () => {
      const route = parseInitialRoute();
      switchView(route.view, { itemId: route.itemId, skipHash: true });
    });

    // 로그인/로그아웃 상태 변경 시 상세 화면 작성자 관리 UI 즉시 갱신
    if (window.HobakAuth && typeof window.HobakAuth.onChange === 'function') {
      window.HobakAuth.onChange(() => {
        if (state.currentView === 'detail' && window.HobakDetailPage) {
          window.HobakDetailPage.renderItem(state.currentItemId, { skipViewIncrement: true });
        }
      });
    }
  }

  window.HobakApp = {
    switchView,
    getState: () => ({ ...state })
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
