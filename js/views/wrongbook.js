/* ==========================================================
   瓜瓜英语 · 错词本（flow）
   见 .design-contract.md §11.3
   职责：列出答错过的单词（按错误次数倒序），一键进入复习环节
   ========================================================== */

(function (global) {
  'use strict';

  /** 该单词属于哪个单元（复习环节需要单元上下文） */
  function unitOf(DATA, en) {
    for (var i = 0; i < DATA.units.length; i++) {
      var ws = DATA.units[i].words;
      for (var j = 0; j < ws.length; j++) if (ws[j].en === en) return DATA.units[i];
    }
    return DATA.units[0];
  }

  global.GuaguaApp.register('wrongbook', {
    chassis: 'flow',
    title: '错词本',
    back: 'me',

    render: function (ctx) {
      var UI = ctx.ui, API = ctx.api, DATA = ctx.data;
      var esc = UI.esc;

      var list = API.wrongList();
      var html = '';

      if (!list.length) {
        html += '' +
          '<div class="empty">' +
            '<img src="' + esc(DATA.units[0].ico) + '" alt="">' +
            '<div>太棒了，目前没有错词！</div>' +
            '<div style="margin-top:6px">去闯关时答错的单词会自动收进这里</div>' +
          '</div>' +
          '<button class="btn btn-primary btn-block" type="button" data-act="practice">' +
            '去玩一局练习' +
          '</button>';
        return html;
      }

      html += '' +
        '<div class="wrong-head">' +
          '<b>' + list.length + '</b> 个待攻克单词' +
          '<span>复习环节会优先出这些词</span>' +
        '</div>' +
        '<div class="wrong-list">';

      list.forEach(function (x) {
        var u = unitOf(DATA, x.word.en);
        html += '' +
          '<button class="wrong-row" type="button" data-en="' + esc(x.word.en) + '" ' +
            'style="--c1:' + esc(u.c1) + ';--c2:' + esc(u.c2) + '">' +
            '<img src="' + esc(x.word.img) + '" alt="">' +
            '<span class="wrong-body">' +
              '<b>' + esc(x.word.en) + '</b>' +
              '<i>' + esc(x.word.zh) + ' · ' + esc(u.titleZh) + '</i>' +
            '</span>' +
            '<span class="wrong-times">错 ' + x.count + ' 次</span>' +
            '<span class="wrong-play" aria-hidden="true">&#9654;</span>' +
          '</button>';
      });

      html += '</div>' +
        '<div class="btn-row">' +
          '<button class="btn btn-primary" type="button" data-act="review">开始复习</button>' +
          '<button class="btn btn-ghost" type="button" data-act="learn">先看单词卡</button>' +
        '</div>';

      return html;
    },

    mount: function (root, ctx) {
      var DATA = ctx.data, API = ctx.api;

      Array.prototype.forEach.call(root.querySelectorAll('[data-en]'), function (el) {
        el.addEventListener('click', function () {
          var en = el.getAttribute('data-en');
          ctx.audio.play(en, en);
        });
      });

      var practiceBtn = root.querySelector('[data-act="practice"]');
      if (practiceBtn) {
        practiceBtn.addEventListener('click', function () {
          ctx.go('practice', { unit: ctx.data.units[0].id });
        });
      }

      /* 一键复习：以第一个错词所在单元为上下文，复习环节会自动优先出错词 */
      var reviewBtn = root.querySelector('[data-act="review"]');
      if (reviewBtn) {
        reviewBtn.addEventListener('click', function () {
          var list = API.wrongList();
          if (!list.length) { ctx.ui.toast('现在没有错词啦'); return; }
          ctx.go('review', { unit: unitOf(DATA, list[0].word.en).id });
        });
      }

      /* 先看单词卡：跳到第一个错词那一页 */
      var learnBtn = root.querySelector('[data-act="learn"]');
      if (learnBtn) {
        learnBtn.addEventListener('click', function () {
          var list = API.wrongList();
          if (!list.length) return;
          var u = unitOf(DATA, list[0].word.en);
          var i = 0;
          u.words.forEach(function (w, k) { if (w.en === list[0].word.en) i = k; });
          ctx.go('learn', { unit: u.id, i: i });
        });
      }
    }
  });

})(window);