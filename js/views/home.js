/* ==========================================================
   瓜瓜英语 · 首页（tab）
   见 .design-contract.md §6
   职责：今日进度 / 继续学习入口 / 每日一句 / 主题单元横滑 / 磨耳朵推荐
   ========================================================== */

(function (global) {
  'use strict';

  function greeting() {
    var h = new Date().getHours();
    if (h < 11) return '早上好呀';
    if (h < 18) return '下午好呀';
    return '晚上好呀';
  }

  /** 继续学习：优先选「还没闯过关」的第一个单元 */
  function nextUnit(API, DATA) {
    for (var i = 0; i < DATA.units.length; i++) {
      if (!API.unitRecord(DATA.units[i].id).plays) return DATA.units[i];
    }
    return DATA.units[0];
  }

  global.GuaguaApp.register('home', {
    chassis: 'tab',
    title: '首页',
    back: 'home',

    render: function (ctx) {
      var UI = ctx.ui, API = ctx.api, DATA = ctx.data;
      var esc = UI.esc;
      var profile = DATA.profile;

      var learned = API.progress.learned.length;
      var total = API.totalWords();
      var percent = total ? Math.round((learned / total) * 100) : 0;

      var unit = nextUnit(API, DATA);
      var tip = DATA.dailyTips[new Date().getDate() % DATA.dailyTips.length];
      var rhymes = DATA.rhymes.slice(0, 2);

      /* ---- 顶部问候 ---- */
      var html = '' +
        '<div class="home-hello">' +
          '<img class="hello-avatar" src="' + esc(profile.avatar) + '" alt="">' +
          '<div class="hello-text">' +
            '<div class="hello-hi">' + greeting() + '</div>' +
            '<div class="hello-name">' + esc(profile.name) + '</div>' +
          '</div>' +
          '<span class="badge">' + esc(profile.level) + '</span>' +
        '</div>';

      /* ---- 今日进度环 ---- */
      html += '' +
        '<div class="ring-card">' +
          UI.ring(percent, 92, '已学') +
          '<div class="ring-info">' +
            '<h3>今天也要加油哦</h3>' +
            '<p>已学会 ' + learned + ' / ' + total + ' 个单词<br>' +
            '连续打卡 ' + profile.streakDays + ' 天</p>' +
          '</div>' +
        '</div>';

      /* ---- 继续学习大卡 ---- */
      var minutes = Math.max(3, Math.round(unit.words.length * 0.8));
      html += '' +
        '<div class="continue-card" data-continue="' + esc(unit.id) + '">' +
          '<img class="continue-thumb" src="' + esc(unit.ico) + '" alt="">' +
          '<div class="continue-info">' +
            '<b>继续学习 · ' + esc(unit.titleZh) + '</b>' +
            '<span>' + unit.words.length + ' 个单词 · 约 ' + minutes + ' 分钟</span>' +
          '</div>' +
          '<div class="continue-go" aria-hidden="true">&#9654;</div>' +
        '</div>';

      /* ---- 每日一句 ---- */
      html += '' +
        '<div class="tip-card" data-tip="' + esc(tip.en) + '">' +
          '<span class="tip-ico" aria-hidden="true">' +
            '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#FF9F1C" ' +
              'stroke-width="2" stroke-linecap="round">' +
              '<circle cx="12" cy="12" r="4.2"/>' +
              '<path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2' +
                'M5.4 5.4l1.6 1.6M17 17l1.6 1.6M5.4 18.6 7 17M17 7l1.6-1.6"/>' +
            '</svg>' +
          '</span>' +
          '<div class="tip-text">' +
            '<div class="tip-en">' + esc(tip.en) + '</div>' +
            '<div class="tip-zh">' + esc(tip.zh) + ' · 点一下听发音</div>' +
          '</div>' +
        '</div>';

      /* ---- 主题单元横滑 ---- */
      html += '' +
        '<div class="section-title">' +
          '<span>主题单元</span>' +
          '<span class="section-more" data-more="courses">全部 &#8250;</span>' +
        '</div>' +
        '<div class="rail">';

      DATA.units.forEach(function (u) {
        var rec = API.unitRecord(u.id);
        var done = 0;
        u.words.forEach(function (w) { if (API.progress.learned.indexOf(w.en) >= 0) done++; });
        html += '' +
          '<button class="rail-item" type="button" data-unit="' + esc(u.id) + '">' +
            '<div class="rail-thumb"><img src="' + esc(u.ico) + '" alt=""></div>' +
            '<div class="rail-name">' + esc(u.titleZh) + '</div>' +
            '<div class="rail-meta">' + done + '/' + u.words.length + ' 词</div>' +
          '</button>';
      });
      html += '</div>';

      /* ---- 磨耳朵推荐 ---- */
      html += '' +
        '<div class="section-title">' +
          '<span>磨耳朵</span>' +
          '<span class="section-more" data-more="listen">去听听 &#8250;</span>' +
        '</div>';

      rhymes.forEach(function (r) {
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
            '<span class="rhyme-play" aria-hidden="true">&#9654;</span>' +
          '</button>';
      });

      html += '<div style="height:var(--s-4)"></div>';
      return html;
    },

    mount: function (root, ctx) {
      var go = ctx.go;

      /* 继续学习 */
      var cont = root.querySelector('[data-continue]');
      if (cont) {
        cont.addEventListener('click', function () {
          go('learn', { unit: cont.getAttribute('data-continue'), i: 0 });
        });
      }

      /* 单元横滑 */
      Array.prototype.forEach.call(root.querySelectorAll('[data-unit]'), function (el) {
        el.addEventListener('click', function () {
          go('learn', { unit: el.getAttribute('data-unit'), i: 0 });
        });
      });

      /* 每日一句：点一下听发音 */
      var tip = root.querySelector('[data-tip]');
      if (tip) {
        tip.addEventListener('click', function () {
          var text = tip.getAttribute('data-tip');
          ctx.audio.playSentence(text).then(function (src) {
            if (src === 'none') ctx.ui.toast('这台设备暂时不能发声');
          });
        });
      }

      /* 磨耳朵推荐 */
      Array.prototype.forEach.call(root.querySelectorAll('[data-rhyme]'), function (el) {
        el.addEventListener('click', function () { go('listen'); });
      });

      /* 更多入口 */
      Array.prototype.forEach.call(root.querySelectorAll('[data-more]'), function (el) {
        el.addEventListener('click', function () { go(el.getAttribute('data-more')); });
      });
    }
  });

})(window);