/* ==========================================================
   玩 7 · 听音点泡泡【新增，自创玩法】
   泡泡上浮，听发音点中写着正确单词的那个泡泡
   ========================================================== */

(function (global) {
  'use strict';

  var G = global.GuaguaGames;

  var LIFETIME = 9000;   // 一轮的存活时间

  G.register('bubble', {
    label: '听音点泡泡',
    needs: ['audio'],

    render: function (ctx, g) {
      var UI = ctx.ui, esc = UI.esc;
      var pool = UI.shuffle([g.word].concat(G.distractors(g.pool, g.word, 3, UI, ctx.data)));
      var lefts = UI.shuffle([6, 30, 54, 76]);

      var html = '' +
        '<div class="q-card">' +
          '<div class="q-hint">听一听，点中写着<em>正确单词</em>的泡泡</div>' +
          '<button class="sound-btn" type="button" data-act="replay">' +
            G.SPEAKER_SVG + '再听一遍' +
          '</button>' +
          '<div class="bubble-stage" data-stage>';

      pool.forEach(function (w, i) {
        html += '<button class="bubble" type="button" data-b="' + esc(w.en) + '" ' +
                  'style="left:' + lefts[i] + '%;animation-duration:' +
                  (7.6 + (i % 3) * 0.9).toFixed(1) + 's">' + esc(w.en) + '</button>';
      });

      return html + '</div><div class="q-feedback" data-fb>泡泡飘上去就飞走啦，快点点！</div></div>';
    },

    mount: function (root, ctx, g, finish) {
      var UI = ctx.ui;
      var stage = root.querySelector('[data-stage]');
      var fb = root.querySelector('[data-fb]');
      var bubbles = Array.prototype.slice.call(root.querySelectorAll('[data-b]'));
      var locked = false;

      function replay() { ctx.audio.play(g.word.en, g.word.en); }
      UI.later(replay, 320);

      var rp = root.querySelector('[data-act="replay"]');
      if (rp) rp.addEventListener('click', replay);

      /* 泡泡全部飞走 → 本轮失败 */
      var escapeTimer = UI.later(function () {
        if (locked) return;
        locked = true;
        if (fb) { fb.className = 'q-feedback is-no'; fb.textContent = '泡泡飞走了，正确答案是 ' + g.word.en; }
        finish({ ok: false });
      }, LIFETIME);

      bubbles.forEach(function (b) {
        b.addEventListener('click', function () {
          if (locked) return;
          locked = true;
          clearTimeout(escapeTimer);

          var ok = b.getAttribute('data-b') === g.word.en;

          if (ok) {
            b.classList.add('is-pop');
            if (fb) { fb.className = 'q-feedback is-ok'; fb.textContent = '点对啦！'; }
            UI.confetti(10);
          } else {
            b.classList.add('is-burst');
            if (fb) { fb.className = 'q-feedback is-no'; fb.textContent = '正确答案是 ' + g.word.en; }
            /* 把正确答案高亮出来 */
            bubbles.forEach(function (x) {
              if (x.getAttribute('data-b') === g.word.en) x.classList.add('is-answer');
            });
          }

          ctx.audio.play(g.word.en, g.word.en);
          UI.later(function () { finish({ ok: ok }); }, ok ? 850 : 1550);
        });
      });

      /* 舞台不需要滚动，避免误触 */
      if (stage) stage.addEventListener('touchmove', function (e) { e.preventDefault(); }, { passive: false });
    }
  });

})(window);