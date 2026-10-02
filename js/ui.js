/* ==========================================================
   瓜瓜英语 · 通用 UI 工具
   所有视图只允许复用这里的组件与工具，不得自造视觉
   ========================================================== */

(function (global) {
  'use strict';

  var CONFETTI_ICONS = ['⭐', '🎉', '🌟', '💛', '✨', '🎈', '🍭'];

  var timers = [];
  var toastEl = null;
  var toastTimer = null;

  /* ---------------- 定时器统一管理（切视图时全部清掉） ---------------- */

  function later(fn, ms) {
    var id = setTimeout(fn, ms);
    timers.push(id);
    return id;
  }

  function clearTimers() {
    for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]);
    timers = [];
  }

  /* ---------------- 基础 ---------------- */

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function clamp(v, min, max) {
    return Math.min(max, Math.max(min, v));
  }

  /** 等一帧后再回调，用于触发 CSS 过渡 */
  function afterPaint(fn) {
    requestAnimationFrame(function () { requestAnimationFrame(fn); });
  }

  /* ---------------- Toast ---------------- */

  function toast(msg, ms) {
    if (!toastEl) toastEl = document.getElementById('toast');
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('is-show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove('is-show');
    }, ms || 1900);
  }

  /* ---------------- 撒花 ---------------- */

  function confetti(count) {
    var box = document.createElement('div');
    box.className = 'confetti';
    var n = count || 16;
    for (var i = 0; i < n; i++) {
      var s = document.createElement('span');
      s.textContent = CONFETTI_ICONS[Math.floor(Math.random() * CONFETTI_ICONS.length)];
      s.style.left = (Math.random() * 96) + '%';
      s.style.animationDuration = (1.5 + Math.random() * 1.2) + 's';
      s.style.animationDelay = (Math.random() * 0.5) + 's';
      s.style.fontSize = (16 + Math.random() * 14) + 'px';
      box.appendChild(s);
    }
    document.body.appendChild(box);
    setTimeout(function () {
      if (box.parentNode) box.parentNode.removeChild(box);
    }, 3000);
  }

  /* ---------------- 小片段 ---------------- */

  /** 三颗星，n = 0..3 */
  function stars(n) {
    var out = '';
    for (var i = 0; i < 3; i++) {
      out += '<span' + (i < n ? ' class="is-on"' : '') + '>★</span>';
    }
    return '<span class="stars">' + out + '</span>';
  }

  /** 音频来源徽章 */
  function badge(src) {
    if (src === 'real') return '<span class="badge badge-real">真人配音</span>';
    return '<span class="badge badge-tts">合成音</span>';
  }

  /** 环形进度 */
  function ring(percent, size, caption) {
    var s = size || 92;
    var stroke = 8;
    var r = (s - stroke) / 2;
    var c = 2 * Math.PI * r;
    var off = c * (1 - clamp(percent, 0, 100) / 100);
    var half = s / 2;
    return '' +
      '<div class="ring" style="width:' + s + 'px;height:' + s + 'px">' +
        '<svg width="' + s + '" height="' + s + '" viewBox="0 0 ' + s + ' ' + s + '">' +
          '<circle class="ring-track" cx="' + half + '" cy="' + half + '" r="' + r + '" fill="none" stroke-width="' + stroke + '"/>' +
          '<circle class="ring-fill" cx="' + half + '" cy="' + half + '" r="' + r + '" fill="none" stroke-width="' + stroke + '" ' +
            'stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '"/>' +
        '</svg>' +
        '<div class="ring-label"><b>' + percent + '%</b><i>' + esc(caption || '') + '</i></div>' +
      '</div>';
  }

  /** 进度条片段 */
  function pbar(percent) {
    return '<div class="pbar"><div class="pbar-fill" data-fill="' + clamp(percent, 0, 100) + '"></div></div>';
  }

  /** 挂载后把进度条推到目标宽度（触发过渡） */
  function playBars(root) {
    var bars = root.querySelectorAll('.pbar-fill[data-fill], .ability-bar i[data-fill]');
    afterPaint(function () {
      for (var i = 0; i < bars.length; i++) {
        bars[i].style.width = bars[i].getAttribute('data-fill') + '%';
      }
    });
  }

  global.GuaguaUI = {
    later: later,
    clearTimers: clearTimers,
    esc: esc,
    shuffle: shuffle,
    pick: pick,
    clamp: clamp,
    afterPaint: afterPaint,
    toast: toast,
    confetti: confetti,
    stars: stars,
    badge: badge,
    ring: ring,
    pbar: pbar,
    playBars: playBars
  };

})(window);