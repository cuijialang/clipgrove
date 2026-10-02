/* ==========================================================
   瓜瓜英语 · 闯关（flow）
   见 .design-contract.md §6
   题型：听音选图 ×3 / 看图选词 ×3 / 跟读 ×2（见 data.js 的 QUIZ_PLAN）
   ========================================================== */

(function (global) {
  'use strict';

  var S = null;   // 当前闯关会话（render 时重建，同一次 go() 内 render→mount 连续执行）

  /* ---------------- 出题 ---------------- */

  function buildQuestions(unit, DATA, UI) {
    var plan = DATA.QUIZ_PLAN;
    var words = UI.shuffle(unit.words);
    var qs = [];

    for (var i = 0; i < plan.length; i++) {
      var type = plan[i];
      var w = words[i % words.length];

      if (type === 'speak') {
        qs.push({ type: 'speak', word: w });
      } else {
        var others = UI.shuffle(unit.words.filter(function (x) { return x.en !== w.en; })).slice(0, 3);
        qs.push({ type: type, word: w, options: UI.shuffle([w].concat(others)) });
      }
    }
    return qs;
  }

  function starsFor(score, total) {
    var r = total ? score / total : 0;
    if (r >= 0.875) return 3;
    if (r >= 0.625) return 2;
    if (r >= 0.375) return 1;
    return 0;
  }

  /* ---------------- 片段 ---------------- */

  var SPEAKER_SVG = '' +
    '<span class="sound-ico" aria-hidden="true">' +
      '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#fff" ' +
        'stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4z"/>' +
        '<path d="M15.6 9.2a4.1 4.1 0 0 1 0 5.6M18.3 6.6a7.7 7.7 0 0 1 0 10.8"/>' +
      '</svg>' +
    '</span>';

  function headHTML(ctx) {
    var esc = ctx.ui.esc;
    var html = '' +
      '<div class="quiz-head">' +
        '<span>第 ' + (S.index + 1) + ' / ' + S.questions.length + ' 题</span>' +
        '<span>答对 ' + S.score + ' 题</span>' +
      '</div>' +
      ctx.ui.pbar(Math.round((S.index / S.questions.length) * 100));
    return html;
  }

  function questionHTML(ctx) {
    var esc = ctx.ui.esc;
    var q = S.questions[S.index];

    if (q.type === 'listen') {
      var opts1 = '';
      q.options.forEach(function (o) {
        opts1 += '<button class="opt" type="button" data-opt="' + esc(o.en) + '">' +
                   '<img src="' + esc(o.img) + '" alt="">' +
                 '</button>';
      });
      return '' +
        '<div class="q-card">' +
          '<div class="q-hint">听一听，选出<em>正确的图片</em></div>' +
          '<button class="sound-btn" type="button" data-act="replay">' +
            SPEAKER_SVG + '点我再听一遍' +
          '</button>' +
          '<div class="options">' + opts1 + '</div>' +
          '<div class="q-feedback" data-fb></div>' +
        '</div>';
    }

    if (q.type === 'pick') {
      var opts2 = '';
      q.options.forEach(function (o) {
        opts2 += '<button class="opt opt-word" type="button" data-opt="' + esc(o.en) + '">' +
                   esc(o.en) +
                 '</button>';
      });
      return '' +
        '<div class="q-card">' +
          '<div class="q-hint">看图片，选出<em>正确的单词</em></div>' +
          '<img class="q-img" src="' + esc(q.word.img) + '" alt="">' +
          '<div class="options">' + opts2 + '</div>' +
          '<div class="q-feedback" data-fb></div>' +
        '</div>';
    }

    return '' +
      '<div class="q-card">' +
        '<div class="q-hint">大声读出这个<em>单词</em></div>' +
        '<img class="q-img" src="' + esc(q.word.img) + '" alt="">' +
        '<div class="q-word">' + esc(q.word.en) + '</div>' +
        '<div class="q-zh">' + esc(q.word.zh) + '</div>' +
        '<div class="speak-panel">' +
          '<div class="btn-row">' +
            '<button class="btn btn-audio" type="button" data-act="replay">听一遍</button>' +
            '<button class="btn btn-mic" type="button" data-act="mic">开始跟读</button>' +
          '</div>' +
          '<div class="speak-status" data-status></div>' +
          '<div class="speak-heard" data-heard></div>' +
        '</div>' +
      '</div>';
  }

  /* ---------------- 流程 ---------------- */

  function paint(root, ctx) {
    var body = root.querySelector('[data-body]');
    if (!body) return;

    S.speaking = false;
    body.innerHTML = headHTML(ctx) + questionHTML(ctx);
    ctx.ui.playBars(body);

    var q = S.questions[S.index];

    /* 听音题：进入即播放，让孩子先听 */
    if (q.type === 'listen') {
      ctx.ui.later(function () { ctx.audio.play(q.word.en, q.word.en); }, 360);
    }

    /* 重听：听音题与跟读题都重新播放该单词 */
    var replay = body.querySelector('[data-act="replay"]');
    if (replay) {
      replay.addEventListener('click', function () {
        ctx.audio.play(q.word.en, q.word.en);
      });
    }

    /* 选择题 */
    Array.prototype.forEach.call(body.querySelectorAll('[data-opt]'), function (btn) {
      btn.addEventListener('click', function () {
        judge(root, ctx, body, btn.getAttribute('data-opt'));
      });
    });

    /* 跟读题：用 onclick 而非 addEventListener ——
       C 级自评分支会把同一个按钮换成「很好，下一题」的处理函数 */
    var micBtn = body.querySelector('[data-act="mic"]');
    if (micBtn) {
      micBtn.onclick = function () { speak(root, ctx, body, micBtn); };
    }
  }

  function judge(root, ctx, body, chosen) {
    if (S.locked) return;
    S.locked = true;

    var q = S.questions[S.index];
    var ok = chosen === q.word.en;

    Array.prototype.forEach.call(body.querySelectorAll('[data-opt]'), function (el) {
      el.disabled = true;
      var v = el.getAttribute('data-opt');
      if (v === q.word.en) el.classList.add('is-correct');
      else if (v === chosen) el.classList.add('is-wrong');
      else el.classList.add('is-dim');
    });

    var fb = body.querySelector('[data-fb]');
    if (ok) {
      S.score++;
      fb.classList.add('is-ok');
      fb.textContent = '答对啦！';
    } else {
      fb.classList.add('is-no');
      fb.textContent = '正确答案是 ' + q.word.en;
    }

    ctx.audio.play(q.word.en, q.word.en);
    /* 顺带把答对的单词记入已学 */
    if (ok) ctx.api.markLearned(q.word.en);

    ctx.ui.later(function () { advance(root, ctx); }, ok ? 950 : 1600);
  }

  function speak(root, ctx, body, micBtn) {
    if (S.locked || S.speaking) return;
    S.speaking = true;

    var q = S.questions[S.index];
    var mode = ctx.audio.mic.mode();
    var st = body.querySelector('[data-status]');
    var hd = body.querySelector('[data-heard]');
    var esc = ctx.ui.esc;

    function live(on, text) {
      if (text != null) st.textContent = text;
      st.classList.toggle('is-live', !!on);
    }

    /* 未通过时放开按钮，允许重试 */
    function release() {
      S.speaking = false;
      micBtn.disabled = false;
    }

    function pass(msg) {
      S.locked = true;
      S.speaking = false;
      S.score++;
      live(false, '');
      hd.innerHTML = '我听到：<b>' + esc(msg) + '</b>';
      ctx.api.markLearned(q.word.en);
      ctx.ui.toast('读得真好！');
      ctx.ui.later(function () { advance(root, ctx); }, 1100);
    }

    /* A 级：语音识别，真实评测 */
    if (mode === 'recognize') {
      micBtn.disabled = true;
      live(true, '正在听… 请大声读出来');
      hd.textContent = '';

      ctx.audio.play(q.word.en, q.word.en).then(function () {
        return ctx.audio.mic.recognize(q.word.en);
      }).then(function (res) {
        live(false, '');

        if (!res.ok) {
          release();
          live(false, '没有听清，我们再来一次吧');
          return;
        }
        var ev = ctx.audio.mic.evaluate(res.transcript, q.word.en);
        hd.innerHTML = '我听到：<b>' + esc(res.transcript || '…') + '</b>';

        if (ev.level === 'try') {
          release();
          live(false, '再大声一点，跟着我读一遍');
          return;
        }
        pass(res.transcript || q.word.en);
      });
      return;
    }

    /* B 级：录音回放，孩子自己对比 */
    if (mode === 'record') {
      micBtn.disabled = true;
      live(true, '正在录音… 请读出单词');

      ctx.audio.mic.record(2200).then(function (res) {
        live(false, '');

        if (!res.ok) {
          release();
          live(false, '没有拿到麦克风权限，先跟着听吧');
          return;
        }
        live(false, '听听你自己的发音：');
        var el;
        try { el = new global.Audio(res.url); } catch (e) { return pass('（回放完成）'); }
        el.onended = function () { ctx.audio.mic.release(res.url); };
        el.play().catch(function () { /* 忽略 */ });
        ctx.ui.later(function () { pass('（回放完成）'); }, 2700);
      });
      return;
    }

    /* C 级：无麦克风权限，听→读→自评 */
    ctx.audio.play(q.word.en, q.word.en).then(function () {
      live(false, '跟着大声读三遍，然后点「很好，下一题」');
      micBtn.textContent = '很好，下一题';
      micBtn.onclick = function () { if (!S.locked) pass('（自评通过）'); };
    });
  }

  function advance(root, ctx) {
    S.locked = false;
    S.index++;
    if (S.index >= S.questions.length) {
      var total = S.questions.length;
      var stars = starsFor(S.score, total);
      ctx.api.recordQuiz(S.unitId, { stars: stars, score: S.score });
      ctx.go('result', { unit: S.unitId, score: S.score, total: total, stars: stars });
      return;
    }
    paint(root, ctx);
  }

  /* ---------------- 注册 ---------------- */

  global.GuaguaApp.register('quiz', {
    chassis: 'flow',
    title: function (p) {
      var u = global.GUAGUA_DATA.getUnit(p && p.unit);
      return u ? (u.titleZh + ' · 闯关') : '闯关';
    },
    back: 'courses',

    render: function (ctx) {
      var unit = ctx.data.getUnit(ctx.params.unit) || ctx.data.units[0];
      S = {
        unitId: unit.id,
        questions: buildQuestions(unit, ctx.data, ctx.ui),
        index: 0,
        score: 0,
        locked: false,
        speaking: false
      };
      return '<div data-body></div>';
    },

    mount: function (root, ctx) {
      paint(root, ctx);
    }
  });

})(window);