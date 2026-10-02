/* ==========================================================
   瓜瓜英语 · 玩法宿主视图（practice / review / apply）
   见 .design-contract.md §11.2

   唯一挂载器：所有玩法都由它按 PLAN 依次挂载、统一计分与判定，
   玩法自身不接触导航 / 顶栏 / 底栏。
   ========================================================== */

(function (global) {
  'use strict';

  var App = global.GuaguaApp;
  var G = global.GuaguaGames;

  var MODES = {
    practice: { stage: 'practice', name: '练习', desc: '玩中巩固' },
    review:   { stage: 'review',   name: '复习', desc: '攻克错词' },
    apply:    { stage: 'apply',    name: '应用', desc: '开口对话' }
  };

  var S = null;   // 当前会话

  /* ---------------- 生成步骤队列 ---------------- */

  function buildSteps(ctx, mode) {
    var DATA = ctx.data, API = ctx.api, UI = ctx.ui;
    var unit = DATA.getUnit(ctx.params.unit) || DATA.units[0];
    var plan = DATA.PLAY_PLANS[mode] || DATA.PLAY_PLANS.practice;
    var steps = [];

    if (mode === 'apply') {
      /* 角色扮演 ×1 + 拼读专项 ×3（取单元前三个词做首字母练习） */
      steps.push({ game: plan[0], word: unit.words[0], unit: unit });
      var picks = UI.shuffle(unit.words).slice(0, 3);
      for (var a = 0; a < picks.length; a++) {
        steps.push({ game: 'phonics', word: picks[a], unit: unit });
      }
      return steps;
    }

    if (mode === 'review') {
      /* 错词本优先，再用本单元其余词补齐到 6 步 */
      var wrong = API.wrongList().map(function (x) { return x.word; });
      var chosen = [];
      wrong.forEach(function (w) {
        if (chosen.length < 6 && chosen.indexOf(w) < 0) chosen.push(w);
      });
      UI.shuffle(unit.words).forEach(function (w) {
        if (chosen.length < 6 && chosen.indexOf(w) < 0) chosen.push(w);
      });

      for (var b = 0; b < chosen.length; b++) {
        steps.push({ game: plan[b % plan.length], word: chosen[b], unit: unit });
      }
      return steps;
    }

    /* practice：本单元全部单词，玩法逐词轮换 */
    for (var i = 0; i < unit.words.length; i++) {
      steps.push({ game: plan[i % plan.length], word: unit.words[i], unit: unit });
    }
    return steps;
  }

  function starsFor(score, total) {
    var r = total ? score / total : 0;
    if (r >= 0.875) return 3;
    if (r >= 0.625) return 2;
    if (r >= 0.375) return 1;
    return 0;
  }

  /* ---------------- 渲染 ---------------- */

  function headHTML(ctx) {
    var UI = ctx.ui, esc = UI.esc;
    var step = S.steps[S.index];
    var gameDef = ctx.data.getGame(step.game);
    var label = gameDef ? gameDef.label : step.game;

    return '' +
      '<div class="play-top">' +
        '<div class="quiz-head">' +
          '<span>第 ' + (S.index + 1) + ' / ' + S.steps.length + ' 步</span>' +
          '<span>答对 ' + S.score + ' 步</span>' +
        '</div>' +
        UI.pbar(Math.round((S.index / S.steps.length) * 100)) +
        '<div class="play-tagline">' +
          '<span class="play-tag">' + esc(label) + '</span>' +
          '<span class="play-word">' + esc(step.word ? step.word.en : '') + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="play-stage" data-stage></div>';
  }

  function paint(root, ctx) {
    var stage = root.querySelector('[data-stage]');
    if (!stage) return;

    var step = S.steps[S.index];
    var game = G.get(step.game);

    if (!game) {
      ctx.ui.toast('玩法未注册：' + step.game);
      finishStep(root, ctx, { ok: false });
      return;
    }

    var g = {
      word: step.word,
      unit: step.unit,
      pool: step.unit ? step.unit.words : ctx.data.allWords(),
      index: S.index,
      total: S.steps.length,
      mode: S.mode
    };

    stage.innerHTML = game.render(ctx, g) || '';
    ctx.ui.playBars(stage);

    S.locked = true;
    if (game.mount) {
      game.mount(stage, ctx, g, function (res) {
        if (!S.locked) return;      // 防止重复回调
        finishStep(root, ctx, res || {});
      });
    } else {
      finishStep(root, ctx, { ok: false });
    }
  }

  /* ---------------- 单步结算 ---------------- */

  function finishStep(root, ctx, res) {
    S.locked = false;

    var step = S.steps[S.index];
    var ok = !!res.ok;

    if (ok) {
      S.score++;
      if (step.word) {
        ctx.api.markLearned(step.word.en);
        ctx.api.clearWrong(step.word.en);
      }
      if (res.say) ctx.api.markSpeak();
    } else if (step.word) {
      ctx.api.markWrong(step.word.en);
    }

    S.index++;
    if (S.index >= S.steps.length) return wrapUp(ctx);
    paint(root, ctx);
  }

  function wrapUp(ctx) {
    var total = S.steps.length;
    var score = S.score;
    var stars = starsFor(score, total);
    var unitId = S.unitId;
    var stageId = MODES[S.mode].stage;

    ctx.api.recordQuiz(unitId, { stars: stars, score: score });
    ctx.api.completeStage(unitId, stageId, {
      game: S.steps.map(function (s) { return s.game; }).join(','),
      score: score, total: total, stars: stars
    });

    var gems = 6 + (stars === 3 ? 4 : 0);
    ctx.api.addGems(gems);

    ctx.api.syncBadges().then(function (fresh) {
      ctx.go('result', {
        unit: unitId,
        stage: stageId,
        mode: S.mode,
        score: score,
        total: total,
        stars: stars,
        gems: gems,
        fresh: (fresh || []).map(function (b) { return b.id; }).join(',')
      });
    });
  }

  /* ---------------- 注册三个宿主视图 ---------------- */

  Object.keys(MODES).forEach(function (mode) {
    var meta = MODES[mode];

    App.register(mode, {
      chassis: 'flow',
      title: function (p) {
        var u = global.GUAGUA_DATA.getUnit(p && p.unit);
        return u ? (u.titleZh + ' · ' + meta.name) : meta.name;
      },
      back: 'unit',

      render: function (ctx) {
        var unit = ctx.data.getUnit(ctx.params.unit) || ctx.data.units[0];
        S = {
          mode: mode,
          unitId: unit.id,
          steps: buildSteps(ctx, mode),
          index: 0,
          score: 0,
          locked: false
        };
        return headHTML(ctx);
      },

      mount: function (root, ctx) {
        paint(root, ctx);
      }
    });
  });

})(window);