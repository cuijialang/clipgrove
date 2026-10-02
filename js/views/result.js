/* ==========================================================
   瓜瓜英语 · 成绩单（flow）
   见 .design-contract.md §6 / §11.2
   职责：星星 / 正确率 / 魔石奖励 / 新勋章，并引导到下一个环节
   ========================================================== */

(function (global) {
  'use strict';

  function word(stars) {
    if (stars === 3) return '太厉害啦！';
    if (stars === 2) return '做得很好！';
    if (stars === 1) return '继续加油！';
    return '再来一次会更好！';
  }

  var STAGE_NAME = { warm: '预热', learn: '学习', practice: '练习', review: '复习', apply: '应用' };

  global.GuaguaApp.register('result', {
    chassis: 'flow',
    title: '成绩单',
    back: 'unit',

    render: function (ctx) {
      var UI = ctx.ui, esc = UI.esc, API = ctx.api;
      var unit = ctx.data.getUnit(ctx.params.unit) || ctx.data.units[0];

      var total = parseInt(ctx.params.total, 10) || ctx.data.QUIZ_PLAN.length;
      var score = UI.clamp(parseInt(ctx.params.score, 10) || 0, 0, total);
      var stars = UI.clamp(parseInt(ctx.params.stars, 10) || 0, 0, 3);
      var gems = parseInt(ctx.params.gems, 10) || 0;
      var mode = ctx.params.mode || '';
      var rate = total ? Math.round((score / total) * 100) : 0;

      var starsHTML = '';
      for (var i = 0; i < 3; i++) {
        var on = i < stars;
        starsHTML += '<span class="star-big ' + (on ? 'is-on' : 'is-off') + '"' +
          (on ? ' style="animation-delay:' + (i * 0.22) + 's"' : '') + '>&#9733;</span>';
      }

      /* 新获得的勋章 */
      var fresh = (ctx.params.fresh || '').split(',').filter(Boolean);
      var freshHTML = '';
      if (fresh.length) {
        freshHTML = '<div class="fresh-badges" data-fresh>' +
          '<div class="fresh-title">解锁新勋章</div>';
        fresh.forEach(function (id) {
          var b = ctx.data.getBadge(id);
          if (!b) return;
          freshHTML += '<div class="fresh-badge">' +
                         '<b>' + esc(b.name) + '</b><i>' + esc(b.desc) + '</i>' +
                       '</div>';
        });
        freshHTML += '</div>';
      }

      /* 下一个环节 */
      var next = API.nextStage(unit.id);
      var nextLabel = next.id === 'done' ? '去呱呱小屋看看' : ('下一个环节 · ' + next.name);

      return '' +
        '<div class="result">' +
          '<div class="result-emoji" aria-hidden="true">' +
            '<svg viewBox="0 0 64 64" width="62" height="62">' +
              '<path d="M20 38 14 60l18-9 18 9-6-22z" fill="#FF7A45"/>' +
              '<circle cx="32" cy="25" r="18" fill="#FFB020"/>' +
              '<circle cx="32" cy="25" r="18" fill="none" stroke="#FF8A3D" stroke-width="3"/>' +
              '<path d="M32 14.5 35.7 22l8.3 1.2-6 5.9 1.4 8.3-7.4-3.9-7.4 3.9 1.4-8.3-6-5.9 8.3-1.2z" fill="#fff"/>' +
            '</svg>' +
          '</div>' +
          '<h2 class="result-title">' + word(stars) + '</h2>' +
          '<p class="result-sub">' + esc(unit.titleZh) + ' · ' +
            esc(STAGE_NAME[mode] || '闯关') + '</p>' +
          '<div class="stars-big">' + starsHTML + '</div>' +

          '<div class="score-card">' +
            '<div class="score-item">' +
              '<div class="score-num">' + score + '</div>' +
              '<div class="score-label">答对步数</div>' +
            '</div>' +
            '<div class="score-item">' +
              '<div class="score-num">' + total + '</div>' +
              '<div class="score-label">总步数</div>' +
            '</div>' +
            '<div class="score-item">' +
              '<div class="score-num">' + rate + '%</div>' +
              '<div class="score-label">正确率</div>' +
            '</div>' +
          '</div>' +

          (gems ? '<div class="gem-reward">获得 <b>&#9670; ' + gems + '</b> 颗魔石</div>' : '') +
          freshHTML +

          '<div class="result-actions">' +
            '<button class="btn btn-primary" type="button" data-act="next">' + esc(nextLabel) + '</button>' +
            '<button class="btn btn-ghost" type="button" data-act="again">再玩一次</button>' +
            '<button class="btn btn-ghost" type="button" data-act="unit">回到单元</button>' +
          '</div>' +
        '</div>';
    },

    mount: function (root, ctx) {
      var unitId = (ctx.data.getUnit(ctx.params.unit) || ctx.data.units[0]).id;
      var stars = ctx.ui.clamp(parseInt(ctx.params.stars, 10) || 0, 0, 3);
      var mode = ctx.params.mode || '';

      if (stars >= 2) ctx.ui.later(function () { ctx.ui.confetti(stars === 3 ? 22 : 14); }, 420);

      root.querySelector('[data-act="next"]').addEventListener('click', function () {
        var next = ctx.api.nextStage(unitId);
        if (next.id === 'done') { ctx.go('house'); return; }
        if (next.id === 'warm') { ctx.go('warm', { unit: unitId }); return; }
        if (next.id === 'learn') { ctx.go('learn', { unit: unitId, i: 0 }); return; }
        ctx.go(next.id, { unit: unitId });
      });

      root.querySelector('[data-act="again"]').addEventListener('click', function () {
        ctx.go(mode || 'practice', { unit: unitId });
      });

      root.querySelector('[data-act="unit"]').addEventListener('click', function () {
        ctx.go('unit', { unit: unitId });
      });
    }
  });

})(window);