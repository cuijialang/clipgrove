/* ==========================================================
   瓜瓜英语 · 应用外壳 / 路由 / 视图注册表
   见 .design-contract.md §5 —— chassis 机制是导航一致性的唯一实现
   ========================================================== */

(function (global) {
  'use strict';

  var DATA = global.GUAGUA_DATA;
  var API = global.GuaguaAPI;
  var UI = global.GuaguaUI;
  var AUDIO = global.GuaguaAudio;

  /* ---------------- 视图注册表 ---------------- */

  var views = {};
  var order = [];

  function register(id, def) {
    views[id] = def;
    order.push(id);
  }

  /* ---------------- 底部导航（App Shell 固定内容） ---------------- */

  var TABS = [
    {
      id: 'home', label: '首页',
      icon: '<path d="M3 10.6 12 3.2l9 7.4V20a1 1 0 0 1-1 1h-5.2v-6.2H9.2V21H4a1 1 0 0 1-1-1z"/>'
    },
    {
      id: 'courses', label: '课程',
      icon: '<path d="M4 4.5h6.2v6.2H4z"/><path d="M13.8 4.5H20v6.2h-6.2z"/><path d="M4 13.3h6.2v6.2H4z"/><path d="M13.8 13.3H20v6.2h-6.2z"/>'
    },
    {
      id: 'listen', label: '磨耳朵',
      icon: '<path d="M4.5 14.5v-2.2a7.5 7.5 0 0 1 15 0v2.2"/><path d="M4.5 14.2h2.6v5.3H5.6a1.1 1.1 0 0 1-1.1-1.1z"/><path d="M19.5 14.2h-2.6v5.3h1.5a1.1 1.1 0 0 0 1.1-1.1z"/>'
    },
    {
      id: 'me', label: '我的',
      icon: '<path d="M12 11.2a3.9 3.9 0 1 0 0-7.8 3.9 3.9 0 0 0 0 7.8z"/><path d="M4.2 20.6c0-3.9 3.5-5.9 7.8-5.9s7.8 2 7.8 5.9"/>'
    }
  ];

  /* ---------------- DOM 引用 ---------------- */

  var appEl = document.getElementById('app');
  var screenEl = document.getElementById('screen');
  var topbarEl = document.getElementById('topbar');
  var topTitleEl = document.getElementById('topTitle');
  var topStarsEl = document.getElementById('topStars');
  var tabbarEl = document.getElementById('tabbar');
  var backBtn = document.getElementById('btnBack');

  var state = { view: null, params: {} };
  var tabBtns = [];

  /* ---------------- 外壳 ---------------- */

  function buildTabbar() {
    var html = '';
    for (var i = 0; i < TABS.length; i++) {
      var t = TABS[i];
      html += '<button class="tab" type="button" data-tab="' + t.id + '" aria-label="' + t.label + '">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" ' +
                'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + t.icon + '</svg>' +
                '<span>' + t.label + '</span>' +
              '</button>';
    }
    tabbarEl.innerHTML = html;

    tabBtns = Array.prototype.slice.call(tabbarEl.querySelectorAll('.tab'));
    tabBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        go(btn.getAttribute('data-tab'));
      });
    });
  }

  function syncStarChip() {
    topStarsEl.textContent = String(API.totalStars());
  }

  /**
   * 导航一致性唯一实现：视图声明 chassis，外壳决定 tabbar/topbar 的显隐与高亮
   * @param {'tab'|'flow'} chassis
   * @param {string} viewId
   */
  function setChassis(chassis, viewId) {
    appEl.setAttribute('data-chassis', chassis);

    if (chassis === 'tab') {
      topbarEl.classList.add('is-hidden');
      tabbarEl.classList.remove('is-hidden');
      tabBtns.forEach(function (btn) {
        btn.classList.toggle('is-active', btn.getAttribute('data-tab') === viewId);
      });
    } else {
      topbarEl.classList.remove('is-hidden');
      tabbarEl.classList.add('is-hidden');
      tabBtns.forEach(function (btn) { btn.classList.remove('is-active'); });
    }
  }

  /* ---------------- 路由 ---------------- */

  function go(viewId, params) {
    var def = views[viewId];
    if (!def) {
      UI.toast('页面未注册：' + viewId);
      return;
    }

    UI.clearTimers();
    AUDIO.stop();

    state.view = viewId;
    state.params = params || {};

    syncStarChip();
    setChassis(def.chassis || 'flow', viewId);

    var title = typeof def.title === 'function' ? def.title(state.params) : (def.title || '');
    topTitleEl.textContent = title;

    var ctx = {
      go: go,
      reload: function () { go(state.view, state.params); },
      params: state.params,
      data: DATA,
      api: API,
      audio: AUDIO,
      ui: UI
    };

    screenEl.innerHTML = def.render(ctx) || '';
    screenEl.scrollTop = 0;
    if (def.mount) def.mount(screenEl, ctx);
    UI.playBars(screenEl);
  }

  backBtn.addEventListener('click', function () {
    var def = views[state.view];
    var target = (def && def.back) || 'home';
    go(target);
  });

  /* ---------------- 启动 ---------------- */

  function boot() {
    buildTabbar();
    go('home');

    if (!AUDIO.ttsSupported) {
      UI.toast('当前浏览器不支持语音朗读，建议用 Chrome / Edge / Safari 打开', 3200);
    }
    if (!global.isSecureContext && AUDIO.mic.mode() !== 'recognize') {
      UI.later(function () {
        UI.toast('提示：用 http://localhost 或 https 打开才能使用麦克风跟读', 3600);
      }, 1400);
    }
  }

  /* ---------------- 对外暴露 ---------------- */

  global.GuaguaApp = {
    register: register,
    go: go,
    views: views
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})(window);