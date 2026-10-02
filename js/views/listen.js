/* ==========================================================
   瓜瓜英语 · 磨耳朵（tab）
   见 .design-contract.md §6
   职责：公版儿歌列表 + 歌词逐句跟读（真人音频缺失时走合成音）
   ========================================================== */

(function (global) {
  'use strict';

  var sel = null;        // 当前展开的儿歌 id
  var playingId = null;  // 正在逐句朗读的儿歌 id

  /* 歌词区 HTML */
  function lyricsHTML(ctx) {
    var esc = ctx.ui.esc;
    var r = ctx.data.getRhyme(sel);
    if (!r) return '';

    var lines = '';
    r.lines.forEach(function (line, i) {
      lines += '' +
        '<div class="lyric-line" data-line="' + i + '">' +
          '<div class="lyric-en">' + esc(line.en) + '</div>' +
          '<div class="lyric-zh">' + esc(line.zh) + '</div>' +
        '</div>';
    });

    return '' +
      '<div class="lyric-card" data-rhyme-lines="' + esc(r.id) + '">' + lines + '</div>' +
      '<div class="audio-bar">' + ctx.ui.badge('tts') +
        '<span>公版歌词 · 合成音朗读，点任意一句跟着读</span></div>';
  }

  /* 高亮当前朗读句 */
  function paintPlaying(root, index) {
    Array.prototype.forEach.call(root.querySelectorAll('.lyric-line'), function (el) {
      el.classList.toggle('is-playing', parseInt(el.getAttribute('data-line'), 10) === index);
    });
    Array.prototype.forEach.call(root.querySelectorAll('[data-play]'), function (el) {
      el.classList.toggle('is-playing', el.getAttribute('data-play') === playingId);
    });
  }

  function stopAll(root, ctx) {
    playingId = null;
    ctx.audio.stop();
    ctx.ui.clearTimers();
    paintPlaying(root, -1);
  }

  /* 逐句朗读整首儿歌 */
  function start(root, ctx, rhyme) {
    stopAll(root, ctx);
    playingId = rhyme.id;
    paintPlaying(root, -1);

    var t = 0;
    rhyme.lines.forEach(function (line, i) {
      ctx.ui.later(function () {
        paintPlaying(root, i);
        ctx.audio.playSentence(line.en, { rate: 0.7 });
      }, t);
      t += 1250 + line.en.length * 52;
    });

    ctx.ui.later(function () {
      ctx.api.markRhymeHeard(rhyme.id);
      playingId = null;
      paintPlaying(root, -1);
      ctx.ui.toast('听完啦，真棒！');
    }, t + 320);
  }

  global.GuaguaApp.register('listen', {
    chassis: 'tab',
    title: '磨耳朵',
    back: 'home',

    render: function (ctx) {
      var UI = ctx.ui, API = ctx.api, DATA = ctx.data;
      var esc = UI.esc;

      if (!sel) sel = DATA.rhymes[0] ? DATA.rhymes[0].id : null;

      var html = '<div class="section-title"><span>公版儿歌</span>' +
                 '<span class="section-more">共 ' + DATA.rhymes.length + ' 首</span></div>' +
                 '<div class="rhyme-list">';

      DATA.rhymes.forEach(function (r) {
        var heard = API.progress.rhymes.indexOf(r.id) >= 0;
        html += '' +
          '<button class="rhyme-row" type="button" data-rhyme="' + esc(r.id) + '" ' +
            'style="--c1:' + esc(r.c1) + ';--c2:' + esc(r.c2) + '">' +
            '<img class="rhyme-cover" src="' + esc(r.cover) + '" alt="">' +
            '<div class="rhyme-info">' +
              '<div class="rhyme-name">' + esc(r.titleZh) + '<i>' + esc(r.title) + '</i></div>' +
              '<div class="rhyme-meta">' + r.seconds + ' 秒 · ' + r.lines.length + ' 句' +
                (heard ? ' · 已听过' : '') + '</div>' +
            '</div>' +
            '<span class="rhyme-play" data-play="' + esc(r.id) + '" aria-hidden="true">&#9654;</span>' +
          '</button>';
      });

      html += '</div><div data-lyrics>' + lyricsHTML(ctx) + '</div>';
      return html;
    },

    mount: function (root, ctx) {
      var host = root.querySelector('[data-lyrics]');

      function repaintLyrics() {
        host.innerHTML = lyricsHTML(ctx);
        paintPlaying(root, -1);
        bindLines();
      }

      function bindLines() {
        Array.prototype.forEach.call(host.querySelectorAll('[data-line]'), function (el) {
          el.addEventListener('click', function () {
            var r = ctx.data.getRhyme(sel);
            var idx = parseInt(el.getAttribute('data-line'), 10);
            if (!r || !r.lines[idx]) return;
            stopAll(root, ctx);
            paintPlaying(root, idx);
            ctx.audio.playSentence(r.lines[idx].en, { rate: 0.7 });
          });
        });
      }

      Array.prototype.forEach.call(root.querySelectorAll('[data-rhyme]'), function (el) {
        el.addEventListener('click', function () {
          var id = el.getAttribute('data-rhyme');
          var r = ctx.data.getRhyme(id);
          if (!r) return;

          if (playingId === id) { stopAll(root, ctx); return; }

          var changed = sel !== id;
          sel = id;
          if (changed) repaintLyrics();
          else paintPlaying(root, -1);

          start(root, ctx, r);
        });
      });

      bindLines();
    }
  });

})(window);