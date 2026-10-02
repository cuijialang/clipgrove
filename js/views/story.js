/* ==========================================================
   瓜瓜英语 · 绘本（flow）
   见 .design-contract.md §6
   无 id 参数 = 绘本列表；带 id = 分页阅读
   ========================================================== */

(function (global) {
  'use strict';

  var DATA = global.GUAGUA_DATA;

  function listHTML(ctx) {
    var esc = ctx.ui.esc;
    var API = ctx.api;
    var html = '<div class="section-title"><span>分级绘本</span>' +
               '<span class="section-more">共 ' + DATA.stories.length + ' 本</span></div>' +
               '<div class="rhyme-list">';

    DATA.stories.forEach(function (s) {
      var read = API.progress.stories.indexOf(s.id) >= 0;
      html += '' +
        '<button class="rhyme-row" type="button" data-story="' + esc(s.id) + '">' +
          '<img class="rhyme-cover" src="' + esc(s.cover) + '" alt="">' +
          '<div class="rhyme-info">' +
            '<div class="rhyme-name">' + esc(s.titleZh) + '<i>' + esc(s.title) + '</i></div>' +
            '<div class="rhyme-meta">' + s.pages.length + ' 页 · 每页一句' +
              (read ? ' · 已读过' : '') + '</div>' +
          '</div>' +
          '<span class="rhyme-play" aria-hidden="true">&#9654;</span>' +
        '</button>';
    });

    return html + '</div>';
  }

  function readHTML(ctx) {
    var esc = ctx.ui.esc;
    var s = DATA.getStory(ctx.params.id);
    if (!s) return '<div class="empty">这本绘本还没有准备好</div>';

    var len = s.pages.length;
    var pi = ctx.ui.clamp(parseInt(ctx.params.page, 10) || 0, 0, len - 1);
    var p = s.pages[pi];

    var dots = '';
    for (var i = 0; i < len; i++) {
      dots += '<span class="dot ' + (i === pi ? 'is-active' : (i < pi ? 'is-done' : '')) + '"></span>';
    }

    return '' +
      '<div class="quiz-head">' +
        '<span>' + esc(s.titleZh) + '</span>' +
        '<span>' + (pi + 1) + ' / ' + len + '</span>' +
      '</div>' +

      '<div class="book">' +
        '<img class="book-img" src="' + esc(p.img) + '" alt="">' +
        '<p class="book-en">' + esc(p.en) + '</p>' +
        '<p class="book-zh">' + esc(p.zh) + '</p>' +
      '</div>' +

      '<div class="book-nav">' +
        '<button class="btn btn-ghost" type="button" data-act="prev"' +
          (pi === 0 ? ' disabled' : '') + '>上一页</button>' +
        '<button class="btn btn-audio" type="button" data-act="play">听一听</button>' +
        '<button class="btn btn-primary" type="button" data-act="next">' +
          (pi === len - 1 ? '读完啦' : '下一页') +
        '</button>' +
      '</div>' +

      '<div class="book-dots">' + dots + '</div>';
  }

  global.GuaguaApp.register('story', {
    chassis: 'flow',
    title: function (p) {
      if (p && p.id) {
        var s = global.GUAGUA_DATA.getStory(p.id);
        return s ? s.titleZh : '绘本';
      }
      return '绘本阅读';
    },
    back: 'courses',

    render: function (ctx) {
      return ctx.params.id ? readHTML(ctx) : listHTML(ctx);
    },

    mount: function (root, ctx) {
      var go = ctx.go;

      /* ---- 列表 ---- */
      Array.prototype.forEach.call(root.querySelectorAll('[data-story]'), function (el) {
        el.addEventListener('click', function () {
          go('story', { id: el.getAttribute('data-story'), page: 0 });
        });
      });

      /* ---- 阅读 ---- */
      var s = ctx.params.id ? ctx.data.getStory(ctx.params.id) : null;
      if (!s) return;

      var len = s.pages.length;
      var pi = ctx.ui.clamp(parseInt(ctx.params.page, 10) || 0, 0, len - 1);
      var p = s.pages[pi];

      var playBtn = root.querySelector('[data-act="play"]');
      if (playBtn) {
        playBtn.addEventListener('click', function () { ctx.audio.playSentence(p.en); });
        ctx.ui.afterPaint(function () { ctx.audio.playSentence(p.en); });
      }

      var prev = root.querySelector('[data-act="prev"]');
      if (prev) {
        prev.addEventListener('click', function () {
          if (pi > 0) go('story', { id: s.id, page: pi - 1 });
        });
      }

      var next = root.querySelector('[data-act="next"]');
      if (next) {
        next.addEventListener('click', function () {
          if (pi < len - 1) {
            go('story', { id: s.id, page: pi + 1 });
          } else {
            ctx.api.markStoryRead(s.id).then(function () {
              ctx.ui.toast('读完整本绘本啦，真棒！');
            });
            go('story');
          }
        });
      }
    }
  });

})(window);