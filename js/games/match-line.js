/* ==========================================================
   玩 8 · 连线【新增，自创玩法】
   左列图片，右列单词，先点左再点右画出连线；三组连线全部正确即完成
   判定：全程没有连错 → ok
   ========================================================== */

(function (global) {
  'use strict';

  var G = global.GuaguaGames;

  G.register('matchLine', {
    label: '连线',
    needs: ['pointer'],

    render: function (ctx, g) {
      var UI = ctx.ui, esc = UI.esc;
      var trio = UI.shuffle([g.word].concat(G.distractors(g.pool, g.word, 2, UI, ctx.data)));

      var left = '';
      trio.forEach(function (w) {
        left += '<button class="line-node line-img" type="button" data-side="L" data-key="' + esc(w.en) + '">' +
                  '<img src="' + esc(w.img) + '" alt="">' +
                '</button>';
      });

      var right = '';
      UI.shuffle(trio).forEach(function (w) {
        right += '<button class="line-node line-word" type="button" data-side="R" data-key="' + esc(w.en) + '">' +
                   esc(w.en) +
                 '</button>';
      });

      return '' +
        '<div class="q-card">' +
          '<div class="q-hint">先点图片，再点<em>对应的单词</em>，把它们连起来</div>' +
          '<div class="line-board" data-board>' +
            '<svg class="line-svg" data-svg></svg>' +
            '<div class="line-col">' + left + '</div>' +
            '<div class="line-col">' + right + '</div>' +
          '</div>' +
          '<div class="q-feedback" data-fb>先点左边一张图</div>' +
        '</div>';
    },

    mount: function (root, ctx, g, finish) {
      var UI = ctx.ui, esc = UI.esc;
      var board = root.querySelector('[data-board]');
      var svg = root.querySelector('[data-svg]');
      var fb = root.querySelector('[data-fb]');
      var nodes = Array.prototype.slice.call(root.querySelectorAll('.line-node'));

      var picked = null;
      var matched = 0;
      var mistakes = 0;
      var done = false;

      function center(el) {
        var b = board.getBoundingClientRect();
        var r = el.getBoundingClientRect();
        return { x: r.left - b.left + r.width / 2, y: r.top - b.top + r.height / 2 };
      }

      function drawLine(a, b, cls) {
        var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        var ca = center(a), cb = center(b);
        line.setAttribute('x1', ca.x); line.setAttribute('y1', ca.y);
        line.setAttribute('x2', cb.x); line.setAttribute('y2', cb.y);
        line.setAttribute('class', cls);
        svg.appendChild(line);
        return line;
      }

      nodes.forEach(function (el) {
        el.addEventListener('click', function () {
          if (done || el.classList.contains('is-done')) return;

          if (el.getAttribute('data-side') === 'L') {
            nodes.forEach(function (x) { x.classList.remove('is-pick'); });
            picked = el;
            el.classList.add('is-pick');
            if (fb) { fb.className = 'q-feedback'; fb.textContent = '再点右边对应的单词'; }
            ctx.audio.play(el.getAttribute('data-key'), el.getAttribute('data-key'));
            return;
          }

          /* 点右列 */
          if (!picked) {
            if (fb) fb.textContent = '先点左边的一张图片哦';
            return;
          }

          var ok = picked.getAttribute('data-key') === el.getAttribute('data-key');

          if (ok) {
            drawLine(picked, el, 'line-ok');
            picked.classList.add('is-done');
            el.classList.add('is-done');
            picked.classList.remove('is-pick');
            picked = null;
            matched++;
            ctx.audio.play(el.getAttribute('data-key'), el.getAttribute('data-key'));
            if (fb) { fb.className = 'q-feedback is-ok'; fb.textContent = '连对 ' + matched + ' / 3'; }

            if (matched >= 3) {
              done = true;
              if (fb) fb.textContent = mistakes === 0 ? '全部连对，太厉害了！' : '全部连好啦！';
              UI.confetti(12);
              UI.later(function () { finish({ ok: mistakes === 0 }); }, 950);
            }
          } else {
            mistakes++;
            var bad = drawLine(picked, el, 'line-no');
            el.classList.add('is-shake');
            UI.later(function () {
              if (bad.parentNode) bad.parentNode.removeChild(bad);
              el.classList.remove('is-shake');
            }, 620);
            if (fb) { fb.className = 'q-feedback is-no'; fb.textContent = '这条线不对，再看看'; }
          }
        });
      });

      /* 防止拖动滚动误触 */
      board.addEventListener('touchmove', function (e) { e.preventDefault(); }, { passive: false });

      /* 首词示范发音 */
      UI.later(function () {
        if (g.word && g.word.en) ctx.audio.play(g.word.en, g.word.en);
      }, 320);
    }
  });

})(window);