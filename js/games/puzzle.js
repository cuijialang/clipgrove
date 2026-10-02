/* ==========================================================
   玩 6 · 拼图【新增，自创玩法】
   3×2 切块打乱，点两块交换，把图片拼回原样
   判定：交换次数不超过 8 次 → ok
   ========================================================== */

(function (global) {
  'use strict';

  var G = global.GuaguaGames;

  var COLS = 3, ROWS = 2, N = COLS * ROWS;

  G.register('puzzle', {
    label: '拼图',
    needs: [],

    render: function (ctx, g) {
      var UI = ctx.ui, esc = UI.esc;

      /* pos[位置] = 该位置显示的切片编号，初始打乱（保证不是已完成态） */
      var pos = [];
      for (var i = 0; i < N; i++) pos.push(i);
      do { pos = UI.shuffle(pos); } while (isSolvedArray(pos));

      var html = '' +
        '<div class="q-card">' +
          '<div class="q-hint">点两块交换位置，把<em>图片拼回去</em></div>' +
          '<div class="puzzle-ref">' +
            '<img src="' + esc(g.word.img) + '" alt="">' +
            '<span>' + esc(g.word.en) + '</span>' +
          '</div>' +
          '<div class="puzzle-grid" data-grid style="--img:url(' + esc(g.word.img) + ')">';

      for (var k = 0; k < N; k++) {
        html += '<button class="puzzle-tile" type="button" data-pos="' + k + '" ' +
                  'style="background-position:' + bgPos(pos[k]) + '"></button>';
      }

      return html + '</div><div class="q-feedback" data-fb>点一点，交换两块</div></div>';
    },

    mount: function (root, ctx, g, finish) {
      var UI = ctx.ui;
      var tiles = Array.prototype.slice.call(root.querySelectorAll('[data-pos]'));
      var fb = root.querySelector('[data-fb]');

      /* 从 DOM 的初始 background-position 反推 pos 数组 */
      var pos = tiles.map(function (el) {
        var parts = (el.style.backgroundPosition || '0% 0%').split(' ');
        var cx = Math.round(parseFloat(parts[0]) / 50);
        var ry = Math.round(parseFloat(parts[1]) / 100);
        return ry * COLS + cx;
      });

      var sel = null;
      var swaps = 0;
      var done = false;

      function paint() {
        tiles.forEach(function (el, i) {
          el.style.backgroundPosition = bgPos(pos[i]);
          el.classList.remove('is-sel');
        });
        sel = null;
      }

      function solved() {
        for (var i = 0; i < N; i++) if (pos[i] !== i) return false;
        return true;
      }

      tiles.forEach(function (el, i) {
        el.addEventListener('click', function () {
          if (done) return;

          if (sel === null) {
            sel = i;
            el.classList.add('is-sel');
            ctx.audio.play(g.word.en, g.word.en);
            return;
          }
          if (sel === i) {
            sel = null;
            el.classList.remove('is-sel');
            return;
          }

          var t = pos[sel]; pos[sel] = pos[i]; pos[i] = t;
          swaps++;
          paint();

          if (solved()) {
            done = true;
            if (fb) {
              fb.className = 'q-feedback is-ok';
              fb.textContent = '拼好啦！用了 ' + swaps + ' 次交换';
            }
            ctx.audio.play(g.word.en, g.word.en);
            UI.confetti(12);
            UI.later(function () { finish({ ok: swaps <= 8 }); }, 1000);
          }
        });
      });

      UI.later(function () { ctx.audio.play(g.word.en, g.word.en); }, 320);
    }
  });

  /* ---- 工具 ---- */

  function bgPos(slice) {
    var col = slice % COLS;
    var row = Math.floor(slice / COLS);
    return (col * (100 / (COLS - 1))) + '% ' + (row * (100 / (ROWS - 1))) + '%';
  }

  function isSolvedArray(a) {
    for (var i = 0; i < a.length; i++) if (a[i] !== i) return false;
    return true;
  }

})(window);