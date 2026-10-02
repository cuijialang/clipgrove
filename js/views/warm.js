/* ==========================================================
   瓜瓜英语 · 预热（flow）
   见 .design-contract.md §11.1
   职责：主题大图 + 主题对话，先听再读，不判分；完成后进入学习环节
   ========================================================== */

(function (global) {
  'use strict';

  global.GuaguaApp.register('warm', {
    chassis: 'flow',
    title: function (p) {
      var u = global.GUAGUA_DATA.getUnit(p && p.unit);
      return u ? (u.titleZh + ' · 预热') : '预热';
    },
    back: 'unit',

    render: function (ctx) {
      var UI = ctx.ui, esc = UI.esc;
      var unit = ctx.data.getUnit(ctx.params.unit) || ctx.data.units[0];
      var talk = unit.talk || [];

      var html = '' +
        '<div class="warm-hero" style="--c1:' + esc(unit.c1) + ';--c2:' + esc(unit.c2) + '">' +
          '<img src="' + esc(unit.ico) + '" alt="">' +
          '<h2>' + esc(unit.title) + '</h2>' +
          '<p>' + esc(unit.titleZh) + ' · 先听听看，再一起说</p>' +
        '</div>';

      talk.forEach(function (t, i) {
        html += '' +
          '<button class="talk-card" type="button" data-talk="' + i + '">' +
            '<span class="talk-play" aria-hidden="true">&#9654;</span>' +
            '<span class="talk-body">' +
              '<b>' + esc(t.en) + '</b>' +
              '<i>' + esc(t.zh) + '</i>' +
            '</span>' +
          '</button>';
      });

      html += '' +
        '<div class="warm-word-rail"><div class="rail-head">本单元会学到</div>' +
        '<div class="rail">';
      unit.words.forEach(function (w) {
        html += '<div class="rail-item mini">' +
                  '<div class="rail-thumb"><img src="' + esc(w.img) + '" alt=""></div>' +
                  '<div class="rail-name">' + esc(w.en) + '</div>' +
                  '<div class="rail-meta">' + esc(w.zh) + '</div>' +
                '</div>';
      });
      html += '</div></div>';

      html += '' +
        '<div class="btn-row">' +
          '<button class="btn btn-audio" type="button" data-act="all">全部听一遍</button>' +
          '<button class="btn btn-primary" type="button" data-act="go">开始学习</button>' +
        '</div>';

      return html;
    },

    mount: function (root, ctx) {
      var unit = ctx.data.getUnit(ctx.params.unit) || ctx.data.units[0];
      var talk = unit.talk || [];

      function playAll() {
        var i = 0;
        (function next() {
          if (i >= talk.length) return;
          ctx.audio.play('warm-' + unit.id + '-' + i, talk[i].en).then(function () {
            i++;
            ctx.ui.later(next, 900);
          });
        })();
      }

      Array.prototype.forEach.call(root.querySelectorAll('[data-talk]'), function (el) {
        el.addEventListener('click', function () {
          var i = parseInt(el.getAttribute('data-talk'), 10);
          el.classList.add('is-playing');
          ctx.audio.play('warm-' + unit.id + '-' + i, talk[i].en);
        });
      });

      root.querySelector('[data-act="all"]').addEventListener('click', playAll);

      root.querySelector('[data-act="go"]').addEventListener('click', function () {
        ctx.go('learn', { unit: unit.id, i: 0 });
      });

      /* 进入即朗读第一句 */
      ctx.ui.later(playAll, 420);
    }
  });

})(window);