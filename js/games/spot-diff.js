/* ==========================================================
   玩 9 · 找不同【新增，自创玩法】
   上下两排图案一一对应，其中下面一排有一个被换掉了，点出它
   ========================================================== */

(function (global) {
  'use strict';

  var G = global.GuaguaGames;

  G.register('spotDiff', {
    label: '找不同',
    needs: ['pointer'],

    render: function (ctx, g) {
      var UI = ctx.ui, esc = UI.esc;
      var trio = UI.shuffle([g.word].concat(G.distractors(g.pool, g.word, 2, UI, ctx.data)));
      var oddIdx = Math.floor(Math.random() * trio.length);
      var oddWord = G.distractors(g.pool, trio[oddIdx], 1, UI, ctx.data)[0];

      var cols = '';
      trio.forEach(function (w, i) {
        var b = (i === oddIdx) ? oddWord : w;
        cols += '' +
          '<div class="diff-col">' +
            '<div class="diff-cell diff-a"><img src="' + esc(w.img) + '" alt=""></div>' +
            '<button class="diff-cell diff-b" type="button" data-pos="' + i + '">' +
              '<img src="' + esc(b.img) + '" alt="">' +
            '</button>' +
          '</div>';
      });

      return '' +
        '<div class="q-card">' +
          '<div class="q-hint">下面一排有一个<em>不一样</em>，点出它</div>' +
          '<div class="diff-grid" data-grid>' + cols + '</div>' +
          '<div class="q-feedback" data-fb>仔细比一比上下两排</div>' +
        '</div>';
    },

    mount: function (root, ctx, g, finish) {
      var UI = ctx.ui;
      var cells = Array.prototype.slice.call(root.querySelectorAll('.diff-b'));
      var fb = root.querySelector('[data-fb]');
      var locked = false;

      /* 正确位置：下面那排 img.src 与上面不同的那一列 */
      var odd = [];
      Array.prototype.forEach.call(root.querySelectorAll('.diff-col'), function (col, i) {
        var a = col.querySelector('.diff-a img').getAttribute('src');
        var b = col.querySelector('.diff-b img').getAttribute('src');
        if (a !== b) odd.push(i);
      });
      var answer = odd[0];

      cells.forEach(function (el) {
        el.addEventListener('click', function () {
          if (locked) return;
          locked = true;

          var ok = parseInt(el.getAttribute('data-pos'), 10) === answer;

          cells.forEach(function (x) {
            var i = parseInt(x.getAttribute('data-pos'), 10);
            if (i === answer) x.classList.add('is-correct');
            else if (x === el) x.classList.add('is-wrong');
            else x.classList.add('is-dim');
          });

          if (fb) {
            fb.className = 'q-feedback ' + (ok ? 'is-ok' : 'is-no');
            fb.textContent = ok ? '找到啦，就是它！' : '再仔细看看，标出来的这个才不一样';
          }

          ctx.audio.play(g.word.en, g.word.en);
          UI.later(function () { finish({ ok: ok }); }, ok ? 900 : 1550);
        });
      });

      UI.later(function () { ctx.audio.play(g.word.en, g.word.en); }, 320);
    }
  });

})(window);