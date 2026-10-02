/* ==========================================================
   玩 3 · 跟读评测（从 v1 的 quiz 迁移）
   三级降级：语音识别 → 录音回放 → 听读自评
   ========================================================== */

(function (global) {
  'use strict';

  var G = global.GuaguaGames;

  G.register('speakWord', {
    label: '跟读评测',
    needs: ['audio', 'mic'],

    render: function (ctx, g) {
      var esc = ctx.ui.esc;
      return '' +
        '<div class="q-card">' +
          '<div class="q-hint">大声读出这个<em>单词</em></div>' +
          '<img class="q-img" src="' + esc(g.word.img) + '" alt="">' +
          '<div class="q-word">' + esc(g.word.en) + '</div>' +
          '<div class="q-zh">' + esc(g.word.zh) + '</div>' +
          '<div class="speak-panel">' +
            '<div class="btn-row">' +
              '<button class="btn btn-audio" type="button" data-act="replay">听一遍</button>' +
              '<button class="btn btn-mic" type="button" data-act="mic">开始跟读</button>' +
            '</div>' +
            '<div class="speak-status" data-status></div>' +
            '<div class="speak-heard" data-heard></div>' +
          '</div>' +
        '</div>';
    },

    mount: function (root, ctx, g, finish) {
      var UI = ctx.ui, AUDIO = ctx.audio, esc = UI.esc;
      var st = root.querySelector('[data-status]');
      var hd = root.querySelector('[data-heard]');
      var micBtn = root.querySelector('[data-act="mic"]');
      var locked = false;

      function live(on, text) {
        if (text != null) st.textContent = text;
        st.classList.toggle('is-live', !!on);
      }
      function release() { micBtn.disabled = false; }

      var rp = root.querySelector('[data-act="replay"]');
      if (rp) rp.addEventListener('click', function () { AUDIO.play(g.word.en, g.word.en); });

      function pass(msg) {
        locked = true;
        live(false, '');
        hd.innerHTML = '我听到：<b>' + esc(msg) + '</b>';
        UI.toast('读得真好！');
        finish({ ok: true, say: true });
      }

      micBtn.onclick = function () {
        if (locked) return;
        var mode = AUDIO.mic.mode();

        /* A 级：语音识别，真实评测 */
        if (mode === 'recognize') {
          micBtn.disabled = true;
          live(true, '正在听… 请大声读出来');
          hd.textContent = '';

          AUDIO.play(g.word.en, g.word.en).then(function () {
            return AUDIO.mic.recognize(g.word.en);
          }).then(function (res) {
            live(false, '');
            if (!res.ok) {
              release();
              live(false, '没有听清，我们再来一次吧');
              return;
            }
            var ev = AUDIO.mic.evaluate(res.transcript, g.word.en);
            hd.innerHTML = '我听到：<b>' + esc(res.transcript || '…') + '</b>';
            if (ev.level === 'try') {
              release();
              live(false, '再大声一点，跟着我读一遍');
              return;
            }
            pass(res.transcript || g.word.en);
          });
          return;
        }

        /* B 级：录音回放，孩子自己对比 */
        if (mode === 'record') {
          micBtn.disabled = true;
          live(true, '正在录音… 请读出单词');

          AUDIO.mic.record(2200).then(function (res) {
            live(false, '');
            if (!res.ok) {
              release();
              live(false, '没有拿到麦克风权限，先跟着听吧');
              return;
            }
            live(false, '听听你自己的发音：');
            var el;
            try { el = new global.Audio(res.url); } catch (e) { return pass('（回放完成）'); }
            el.onended = function () { AUDIO.mic.release(res.url); };
            el.play().catch(function () { /* 忽略 */ });
            UI.later(function () { pass('（回放完成）'); }, 2600);
          });
          return;
        }

        /* C 级：无麦克风权限，听 → 读 → 自评 */
        AUDIO.play(g.word.en, g.word.en).then(function () {
          live(false, '跟着大声读三遍，然后点「很好，下一题」');
          micBtn.textContent = '很好，下一题';
          micBtn.onclick = function () { if (!locked) pass('（自评通过）'); };
        });
      };

      /* 进入即示范一次 */
      UI.later(function () { AUDIO.play(g.word.en, g.word.en); }, 320);
    }
  });

})(window);