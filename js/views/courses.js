/* ==========================================================
   瓜瓜英语 · 课程（tab）
   见 .design-contract.md §6
   职责：五大课程版块入口 + 主题单元列表
   ========================================================== */

(function (global) {
  'use strict';

  function firstIdleUnit(API, DATA) {
    for (var i = 0; i < DATA.units.length; i++) {
      if (!API.unitRecord(DATA.units[i].id).plays) return DATA.units[i];
    }
    return DATA.units[0];
  }

  global.GuaguaApp.register('courses', {
    chassis: 'tab',
    title: '课程',
    back: 'home',

    render: function (ctx) {
      var UI = ctx.ui, API = ctx.api, DATA = ctx.data;
      var esc = UI.esc;

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

      html += '<div class="section-title"><span>主题单元</span>' +
              '<span class="section-more">共 ' + API.totalWords() + ' 词</span></div>' +
              '<div class="unit-list">';

      DATA.units.forEach(function (u) {
        var rec = API.unitRecord(u.id);
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
                '<span>' + (rec.plays ? '已闯关 ' + rec.plays + ' 次' : '还没闯过关') + '</span>' +
              '</div>' +
            '</div>' +
            '<div class="unit-go" aria-hidden="true">&#9654;</div>' +
          '</button>';
      });
      html += '</div><div style="height:var(--s-4)"></div>';
      return html;
    },

    mount: function (root, ctx) {
      var go = ctx.go;
      var idle = firstIdleUnit(ctx.api, ctx.data);

      Array.prototype.forEach.call(root.querySelectorAll('[data-unit]'), function (el) {
        el.addEventListener('click', function () {
          go('learn', { unit: el.getAttribute('data-unit'), i: 0 });
        });
      });

      var actions = {
        main: function () { go('learn', { unit: idle.id, i: 0 }); },
        daily: function () { go('listen'); },
        interact: function () { go('quiz', { unit: idle.id }); },
        rhyme: function () { go('listen'); },
        book: function () { go('story'); },
        report: function () { go('me'); }
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