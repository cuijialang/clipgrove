/* ==========================================================
   瓜瓜英语 · 单词卡（flow）
   见 .design-contract.md §6
   职责：插画单词卡 + 真人音频优先播放 + 三级降级跟读
   ========================================================== */

(function (global) {
  'use strict';

  function status(el, text, live) {
    if (!el) return;
    el.textContent = text || '';
    el.classList.toggle('is-live', !!live);
  }

  global.GuaguaApp.register('learn', {
    chassis: 'flow',
    title: function (p) {
      var u = global.GUAGUA_DATA.getUnit(p && p.unit);
      return u ? (u.titleZh + ' · 单词卡') : '单词卡';
    },
    back: 'courses',

    render: function (ctx) {
      var UI = ctx.ui, DATA = ctx.data;
      var esc = UI.esc;

      var unit = DATA.getUnit(ctx.params.unit) || DATA.units[0];
      var len = unit.words.length;
      var i = UI.clamp(parseInt(ctx.params.i, 10) || 0, 0, len - 1);
      var w = unit.words[i];

      var html = '' +
        '<div class="learn-top">' +
          '<div class="quiz-head">' +
            '<span>' + esc(unit.titleZh) + ' · ' + (i + 1) + ' / ' + len + '</span>' +
            '<span>' + UI.badge(ctx.audio.source(w.en)) + '</span>' +
          '</div>' +
          UI.pbar(Math.round(((i + 1) / len) * 100)) +
        '</div>' +

        '<div class="flash-card" data-word="' + esc(w.en) + '">' +
          '<img class="flash-img" src="' + esc(w.img) + '" alt="' + esc(w.zh) + '">' +
          '<div class="flash-word">' + esc(w.en) + '</div>' +
          '<div class="flash-ipa">' + esc(w.ipa) + '</div>' +
          '<div class="flash-zh">' + esc(w.zh) + '</div>' +
          '<div class="flash-sentence" data-sentence="' + esc(w.sen) + '">' +
            '<p class="sen-en">' + esc(w.sen) + '</p>' +
            '<p class="sen-zh">' + esc(w.senZh) + '</p>' +
          '</div>' +
        '</div>' +

        '<div class="speak-panel">' +
          '<div class="btn-row">' +
            '<button class="btn btn-audio" type="button" data-act="play">再听一遍</button>' +
            '<button class="btn btn-mic" type="button" data-act="mic">跟我读</button>' +
          '</div>' +
          '<div class="speak-status" data-status></div>' +
          '<div class="speak-heard" data-heard></div>' +
        '</div>' +

        '<div class="btn-row">' +
          '<button class="btn btn-ghost" type="button" data-act="prev"' +
            (i === 0 ? ' disabled' : '') + '>上一个</button>' +
          '<button class="btn btn-primary" type="button" data-act="next">' +
            (i === len - 1 ? '去闯关' : '下一个') +
          '</button>' +
        '</div>';

      return html;
    },

    mount: function (root, ctx) {
      var AUDIO = ctx.audio, UI = ctx.ui;
      var unit = ctx.data.getUnit(ctx.params.unit) || ctx.data.units[0];
      var len = unit.words.length;
      var i = UI.clamp(parseInt(ctx.params.i, 10) || 0, 0, len - 1);
      var w = unit.words[i];

      var statusEl = root.querySelector('[data-status]');
      var heardEl = root.querySelector('[data-heard]');
      var micBtn = root.querySelector('[data-act="mic"]');
      var card = root.querySelector('.flash-card');

      /* 进入即记录为已学 */
      ctx.api.markLearned(w.en);

      /* 播放当前单词 */
      function playWord(prompt) {
        if (prompt) UI.toast(prompt);
        return AUDIO.play(w.en, w.en);
      }

      function playSentence() {
        return AUDIO.playSentence(w.sen);
      }

      /* ---- 跟读：三级降级 ---- */
      function followAlong() {
        var mode = AUDIO.mic.mode();

        if (mode === 'recognize') {
          micBtn.disabled = true;
          status(statusEl, '正在听… 请大声读出来', true);
          heardEl.textContent = '';

          // 先示范一遍，再开始听
          AUDIO.play(w.en, w.en).then(function () {
            return AUDIO.mic.recognize(w.en);
          }).then(function (res) {
            micBtn.disabled = false;
            status(statusEl, '', false);

            if (!res.ok) {
              status(statusEl, '没有听清，我们再来一次吧');
              return;
            }
            var ev = AUDIO.mic.evaluate(res.transcript, w.en);
            heardEl.innerHTML = '我听到：<b>' + UI.esc(res.transcript || '…') + '</b>';

            if (ev.level === 'perfect') {
              UI.toast('太棒了，发音很标准！');
              UI.confetti(10);
            } else if (ev.level === 'close') {
              UI.toast('很接近啦，再读一次会更好');
            } else {
              UI.toast('跟着我再读一遍吧');
            }
          });
          return;
        }

        if (mode === 'record') {
          micBtn.disabled = true;
          status(statusEl, '正在录音… 请读出单词', true);
          AUDIO.mic.record(2200).then(function (res) {
            micBtn.disabled = false;
            if (!res.ok) {
              status(statusEl, '', false);
              UI.toast('没有拿到麦克风权限，先跟着听吧');
              return;
            }
            status(statusEl, '听听你自己的发音：', false);
            var el;
            try { el = new global.Audio(res.url); } catch (e) { return; }
            el.onended = function () { AUDIO.mic.release(res.url); };
            el.play().catch(function () { AUDIO.mic.release(res.url); });
          });
          return;
        }

        /* manual：无麦克风权限时的自评模式 */
        playWord('先听一遍，然后跟着大声读');
        status(statusEl, '跟着读三遍，读完点一下（原型演示模式）');
        UI.later(function () {
          status(statusEl, '读得真棒！', false);
          UI.confetti(8);
        }, 2600);
      }

      /* ---- 事件绑定 ---- */
      card.addEventListener('click', function () { playWord(); });

      var senEl = root.querySelector('[data-sentence]');
      if (senEl) {
        senEl.addEventListener('click', function (e) {
          e.stopPropagation();
          playSentence();
        });
      }

      root.querySelector('[data-act="play"]').addEventListener('click', function () {
        playWord();
      });

      micBtn.addEventListener('click', followAlong);

      var prev = root.querySelector('[data-act="prev"]');
      prev.addEventListener('click', function () {
        if (i > 0) ctx.go('learn', { unit: unit.id, i: i - 1 });
      });

      var next = root.querySelector('[data-act="next"]');
      next.addEventListener('click', function () {
        if (i < len - 1) ctx.go('learn', { unit: unit.id, i: i + 1 });
        else ctx.go('quiz', { unit: unit.id });
      });

      /* 进入视图自动朗读一次（被浏览器拦截时静默失败） */
      UI.afterPaint(function () { playWord(); });
    }
  });

})(window);