/* ==========================================================
   瓜瓜英语 · 课程（tab）
   见 .design-contract.md §6 / §11.1 / §11.4
   职责：五大课程版块入口 + 多级切换 + 主题单元列表
   ========================================================== */

(function (global) {
  'use strict';

  /* 当前选中的级别（会话内记忆，切走再回来保持） */
  var pickedLevel = null;

  function currentLevel(DATA) {
    if (pickedLevel && DATA.getLevel(pickedLevel)) return pickedLevel;
    /* 默认第一个还没全部完成的级别 */
    for (var i = 0; i < DATA.levels.length; i++) {
      if (stagesDoneInLevel(DATA, global.GuaguaAPI, DATA.levels[i].id) <
          DATA.unitsByLevel(DATA.levels[i].id).length) return DATA.levels[i].id;
    }
    return DATA.levels[0].id;
  }

  function stagesDoneInLevel(DATA, API, levelId) {
    var n = 0;
    DATA.unitsByLevel(levelId).forEach(function (u) {
      if (API.stageRecord(u.id).practice) n++;
    });
    return n;
  }

  global.GuaguaApp.register('courses', {
    chassis: 'tab',
    title: '课程',
    back: 'home',

    render: function (ctx) {
      var UI = ctx.ui, API = ctx.api, DATA = ctx.data;
      var esc = UI.esc;
      var levelId = currentLevel(DATA);

      /* ---- 课程版块 ---- */
      var html = '<div class="section-title"><span>课程版块</span>' +
                 '<span class="section-more">' + DATA.courses.length + ' 个</span></div>' +
                 '<div class="mod-grid">';

      DATA.courses.forEach(function (c) {
        html += '' +
          '<button class="mod-tile" type="button" data-course="' + esc(c.id) + '" ' +
            'style="--tc1:' + esc(c.c1) + ';--tc2:' + esc(c.c2) + '">' +
            '<img src="' + esc(c.ico) + '" alt="">' +
            '<b>' + esc(c.title) + '</b>' +
            '<span>' + esc(c.desc) + '</span>' +
          '</button>';
      });
      html += '</div>';

      /* ---- 级别切换 ---- */
      html += '<div class="section-title"><span>主题单元</span>' +
              '<span class="section-more">共 ' + API.totalWords() + ' 词 · ' +
              DATA.units.length + ' 单元</span></div>' +
              '<div class="level-tabs" data-levels>';

      DATA.levels.forEach(function (lv) {
        var done = stagesDoneInLevel(DATA, API, lv.id);
        var total = DATA.unitsByLevel(lv.id).length;
        html += '' +
          '<button class="level-tab' + (lv.id === levelId ? ' is-active' : '') + '" ' +
            'type="button" data-level="' + esc(lv.id) + '" ' +
            'style="--c1:' + esc(lv.c1) + ';--c2:' + esc(lv.c2) + '">' +
            '<b>' + esc(lv.id) + '</b>' +
            '<i>' + esc(lv.name) + '</i>' +
            '<span>' + done + '/' + total + '</span>' +
          '</button>';
      });
      html += '</div>';

      /* ---- 单元列表 ---- */
      html += '<div class="unit-list">';
      DATA.unitsByLevel(levelId).forEach(function (u) {
        var rec = API.unitRecord(u.id);
        var percent = API.unitPercent(u.id);
        var done = 0;
        u.words.forEach(function (w) { if (API.progress.learned.indexOf(w.en) >= 0) done++; });
        html += '' +
          '<button class="unit-card" type="button" data-unit="' + esc(u.id) + '" ' +
            'style="--c1:' + esc(u.c1) + ';--c2:' + esc(u.c2) + '">' +
            '<img class="unit-thumb" src="' + esc(u.ico) + '" alt="">' +
            '<div class="unit-info">' +
              '<div class="unit-name">' + esc(u.title) + '<i>' + esc(u.titleZh) + '</i></div>' +
              '<div class="unit-meta">' + UI.stars(rec.stars) +
                '<span>' + done + '/' + u.words.length + ' 词</span>' +
                '<span>' + (percent === 100 ? '五环节已完成' : '五环节 ' + percent + '%') + '</span>' +
              '</div>' +
              '<div class="unit-line">' + UI.pbar(percent) + '</div>' +
            '</div>' +
            '<div class="unit-go" aria-hidden="true">&#9654;</div>' +
          '</button>';
      });
      html += '</div><div style="height:var(--s-4)"></div>';
      return html;
    },

    mount: function (root, ctx) {
      var DATA = ctx.data;

      Array.prototype.forEach.call(root.querySelectorAll('[data-level]'), function (el) {
        el.addEventListener('click', function () {
          pickedLevel = el.getAttribute('data-level');
          ctx.reload();
        });
      });

      Array.prototype.forEach.call(root.querySelectorAll('[data-unit]'), function (el) {
        el.addEventListener('click', function () {
          ctx.go('unit', { unit: el.getAttribute('data-unit') });
        });
      });

      function firstUnitOf(levelId) {
        var lv = DATA.getLevel(levelId || currentLevel(DATA)) || DATA.levels[0];
        return DATA.unitsByLevel(lv.id)[0] || DATA.units[0];
      }

      var actions = {
        main: function () { ctx.go('unit', { unit: firstUnitOf().id }); },
        daily: function () { ctx.go('listen'); },
        interact: function () { ctx.go('practice', { unit: firstUnitOf().id }); },
        rhyme: function () { ctx.go('listen'); },
        book: function () { ctx.go('story'); },
        house: function () { ctx.go('house'); }
      };

      Array.prototype.forEach.call(root.querySelectorAll('[data-course]'), function (el) {
        el.addEventListener('click', function () {
          var fn = actions[el.getAttribute('data-course')];
          if (fn) fn();
        });
      });
    }
  });

})(window);