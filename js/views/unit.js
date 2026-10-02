/* ==========================================================
   瓜瓜英语 · 单元详情（flow）
   见 .design-contract.md §11.1 / §11.4
   职责：五环节 stepper + 单元词表 + 整体进度
   ========================================================== */

(function (global) {
  'use strict';

  var ORDER = ['warm', 'learn', 'practice', 'review', 'apply'];

  function statusOf(rec, id) {
    return rec[id] ? 'done' : 'todo';
  }

  global.GuaguaApp.register('unit', {
    chassis: 'flow',
    title: function (p) {
      var u = global.GUAGUA_DATA.getUnit(p && p.unit);
      return u ? (u.titleZh + ' · ' + u.title) : '单元';
    },
    back: 'courses',

    render: function (ctx) {
      var UI = ctx.ui, API = ctx.api, DATA = ctx.data;
      var esc = UI.esc;
      var unit = DATA.getUnit(ctx.params.unit) || DATA.units[0];

      var rec = API.stageRecord(unit.id);
      var percent = API.unitPercent(unit.id);
      var next = API.nextStage(unit.id);
      var learnedN = 0;
      unit.words.forEach(function (w) { if (API.progress.learned.indexOf(w.en) >= 0) learnedN++; });

      /* ---- 头部 ---- */
      var html = '' +
        '<div class="unit-hero" style="--c1:' + esc(unit.c1) + ';--c2:' + esc(unit.c2) + '">' +
          '<img class="unit-hero-img" src="' + esc(unit.ico) + '" alt="">' +
          '<div class="unit-hero-info">' +
            '<div class="unit-hero-title">' + esc(unit.title) + '</div>' +
            '<div class="unit-hero-sub">' + esc(unit.titleZh) + ' · ' +
              unit.words.length + ' 词 · 已完成 ' + learnedN + ' 词</div>' +
            UI.pbar(percent) +
            '<div class="unit-hero-pct">五环节进度 ' + percent + '%</div>' +
          '</div>' +
        '</div>';

      /* ---- 五环节 stepper ---- */
      html += '<div class="section-title"><span>五环节闭环</span>' +
              '<span class="section-more">' + API.stageDoneCount(unit.id) + ' / 5 完成</span></div>' +
              '<div class="stage-list">';

      DATA.STAGES.forEach(function (st, i) {
        var st_state = statusOf(rec, st.id);
        html += '' +
          '<button class="stage-row is-' + st_state + '" type="button" data-stage="' + esc(st.id) + '">' +
            '<span class="stage-no">' + (st_state === 'done' ? '&#10003;' : (i + 1)) + '</span>' +
            '<span class="stage-body">' +
              '<b>' + esc(st.name) + '</b>' +
              '<i>' + esc(st.desc) + '</i>' +
            '</span>' +
            '<span class="stage-go" aria-hidden="true">&#9654;</span>' +
          '</button>';
      });
      html += '</div>';

      /* ---- 单元词表 ---- */
      html += '<div class="section-title"><span>本单元单词</span>' +
              '<span class="section-more">' + learnedN + ' / ' + unit.words.length + '</span></div>' +
              '<div class="word-grid">';
      unit.words.forEach(function (w) {
        var learned = API.progress.learned.indexOf(w.en) >= 0;
        html += '' +
          '<button class="word-chip' + (learned ? ' is-done' : '') + '" type="button" ' +
            'data-word="' + esc(w.en) + '">' +
            '<img src="' + esc(w.img) + '" alt="">' +
            '<b>' + esc(w.en) + '</b>' +
            '<i>' + esc(w.zh) + '</i>' +
          '</button>';
      });
      html += '</div>';

      /* ---- 继续按钮 ---- */
      html += '<div class="unit-cta">' +
        '<button class="btn btn-primary btn-block" type="button" data-act="next">' +
          (next.id === 'done' ? '再练一轮（应用环节）' : ('继续第 ' +
            (ORDER.indexOf(next.id) + 1) + ' 环节 · ' + esc(next.name))) +
        '</button>' +
      '</div><div style="height:var(--s-4)"></div>';

      return html;
    },

    mount: function (root, ctx) {
      var unit = ctx.data.getUnit(ctx.params.unit) || ctx.data.units[0];

      Array.prototype.forEach.call(root.querySelectorAll('[data-stage]'), function (el) {
        el.addEventListener('click', function () {
          var id = el.getAttribute('data-stage');
          if (id === 'warm') ctx.go('warm', { unit: unit.id });
          else if (id === 'learn') ctx.go('learn', { unit: unit.id, i: 0 });
          else ctx.go(id, { unit: unit.id });
        });
      });

      Array.prototype.forEach.call(root.querySelectorAll('[data-word]'), function (el) {
        el.addEventListener('click', function () {
          var en = el.getAttribute('data-word');
          var i = 0;
          unit.words.forEach(function (w, k) { if (w.en === en) i = k; });
          ctx.go('learn', { unit: unit.id, i: i });
        });
      });

      root.querySelector('[data-act="next"]').addEventListener('click', function () {
        var next = ctx.api.nextStage(unit.id);
        if (next.id === 'done') ctx.go('apply', { unit: unit.id });
        else if (next.id === 'warm') ctx.go('warm', { unit: unit.id });
        else if (next.id === 'learn') ctx.go('learn', { unit: unit.id, i: 0 });
        else ctx.go(next.id, { unit: unit.id });
      });
    }
  });

})(window);