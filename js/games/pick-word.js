/* ==========================================================
   玩 2 · 看图选词（从 v1 的 quiz 迁移）
   看插画 → 四个单词选一
   ========================================================== */

(function (global) {
  'use strict';

  var G = global.GuaguaGames;

  G.register('pickWord', {
    label: '看图选词',
    needs: [],

    render: function (ctx, g) {
      var UI = ctx.ui, esc = UI.esc;
      var opts = UI.shuffle([g.word].concat(G.distractors(g.pool, g.word, 3, UI, ctx.data)));

      var html = '<div class="q-card">' +
        '<div class="q-hint">看图片，选出<em>正确的单词</em></div>' +
        '<img class="q-img" src="' + esc(g.word.img) + '" alt="">' +
        '<div class="options">';

      opts.forEach(function (o) {
        html += '<button class="opt opt-word" type="button" data-opt="' + esc(o.en) + '">' +
                  esc(o.en) + '</button>';
      });

      return html + '</div><div class="q-feedback" data-fb></div></div>';
    },

    mount: function (root, ctx, g, finish) {
      var locked = false;

      Array.prototype.forEach.call(root.querySelectorAll('[data-opt]'), function (btn) {
        btn.addEventListener('click', function () {
          if (locked) return;
          locked = true;

          var chosen = btn.getAttribute('data-opt');
          var ok = chosen === g.word.en;

          Array.prototype.forEach.call(root.querySelectorAll('[data-opt]'), function (el) {
            el.disabled = true;
            var v = el.getAttribute('data-opt');
            if (v === g.word.en) el.classList.add('is-correct');
            else if (v === chosen) el.classList.add('is-wrong');
            else el.classList.add('is-dim');
          });

          var fb = root.querySelector('[data-fb]');
          if (fb) {
            fb.classList.add(ok ? 'is-ok' : 'is-no');
            fb.textContent = ok ? '答对啦！' : ('正确答案是 ' + g.word.en);
          }

          ctx.audio.play(g.word.en, g.word.en);
          ctx.ui.later(function () { finish({ ok: ok }); }, ok ? 900 : 1550);
        });
      });
    }
  });

})(window);