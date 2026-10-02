/* ==========================================================
   瓜瓜英语 · 成长勋章（flow）
   见 .design-contract.md §11.3
   职责：勋章墙，实时显示获得情况与进度
   ========================================================== */

(function (global) {
  'use strict';

  function medalSVG(id) {
    return '' +
      '<svg viewBox="0 0 64 64" width="57" height="57" aria-hidden="true">' +
        '<defs><linearGradient id="mg-' + id + '" x1="0" y1="0" x2="1" y2="1">' +
          '<stop offset="0" stop-color="var(--c1)"/><stop offset="1" stop-color="var(--c2)"/>' +
        '</linearGradient></defs>' +
        '<path d="M20 34 14 60l18-9 18 9-6-26z" fill="url(#mg-' + id + ')"/>' +
        '<circle cx="32" cy="26" r="18" fill="#FFF3D0" stroke="url(#mg-' + id + ')" stroke-width="3"/>' +
        '<path d="M32 15.5 35.7 23l8.3 1.2-6 5.9 1.4 8.3-7.4-3.9-7.4 3.9 1.4-8.3-6-5.9 8.3-1.2z" fill="url(#mg-' + id + ')"/>' +
      '</svg>';
  }

  global.GuaguaApp.register('badges', {
    chassis: 'flow',
    title: '成长勋章',
    back: 'me',

    render: function (ctx) {
      var UI = ctx.ui, API = ctx.api;
      var esc = UI.esc;

      var list = API.badges();
      var got = list.filter(function (b) { return b.earned; }).length;

      var html = '' +
        '<div class="badge-hero">' +
          '<div class="badge-hero-num">' + got + ' <i>/ ' + list.length + '</i></div>' +
          '<div class="badge-hero-text">已获得的勋章<br><span>继续闯关解锁更多</span></div>' +
        '</div>' +
        '<div class="badge-grid">';

      list.forEach(function (b) {
        html += '' +
          '<div class="badge-card' + (b.earned ? ' is-earned' : '') + '" ' +
            'style="--c1:' + esc(b.c1) + ';--c2:' + esc(b.c2) + '">' +
            medalSVG(b.id) +
            '<b>' + esc(b.name) + '</b>' +
            '<i>' + esc(b.desc) + '</i>' +
            (b.earned
              ? '<span class="badge-stamp">已获得</span>'
              : '<span class="badge-progress">' + b.value + ' / ' + b.need + '</span>') +
          '</div>';
      });

      return html + '</div><div style="height:var(--s-4)"></div>';
    }
  });

})(window);