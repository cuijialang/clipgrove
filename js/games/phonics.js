/* ==========================================================
   玩 10 · 自然拼读【新增，自创玩法】
   听字母音，选出以这个音开头的单词
   ========================================================== */

(function (global) {
  'use strict';

  var G = global.GuaguaGames;

  G.register('phonics', {
    label: '自然拼读',
    needs: ['audio'],

    render: function (ctx, g) {
      var UI = ctx.ui, esc = UI.esc;
      var letter = g.word.en.charAt(0).toUpperCase();
      var entry = null;
      ctx.data.phonics.forEach(function (p) { if (p.en === g.word.en) entry = p; });
      var sound = entry ? entry.sound : '/' + letter.toLowerCase() + '/';

      var opts = UI.shuffle([g.word].concat(G.distractorsOtherLetter(g.pool, g.word, 2, UI, ctx.data)));

      var html = '' +
        '<div class="q-card">' +
          '<div class="q-hint">听字母音，选出<em>以这个音开头</em>的单词</div>' +
          '<button class="phonics-letter" type="button" data-act="replay">' +
            '<b>' + esc(letter) + '</b><i>' + esc(sound) + '</i>' +
          '</button>' +
          '<div class="options">';

      opts.forEach(function (o) {
        html += '<button class="opt opt-word" type="button" data-opt="' + esc(o.en) + '">' +
                  esc(o.en) + '</button>';
      });

      return html + '</div><div class="q-feedback" data-fb>点字母可以再听一遍</div></div>';
    },

    mount: function (root, ctx, g, finish) {
      var UI = ctx.ui;
      var letter = g.word.en.charAt(0).toUpperCase();
      var locked = false;

      function replay() { ctx.audio.play('letter-' + letter, letter); }

      var rp = root.querySelector('[data-act="replay"]');
      if (rp) rp.addEventListener('click', function () { rp.classList.add('is-playing'); replay(); });
      UI.later(function () { rp && rp.classList.add('is-playing'); replay(); }, 320);

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
            fb.className = 'q-feedback ' + (ok ? 'is-ok' : 'is-no');
            fb.textContent = ok ? ('对啦，' + g.word.en + ' 就是以 ' + letter + ' 开头') :
                                  ('正确答案是 ' + g.word.en);
          }

          ctx.audio.play(g.word.en, g.word.en);
          UI.later(function () { finish({ ok: ok }); }, ok ? 950 : 1650);
        });
      });
    }
  });

})(window);