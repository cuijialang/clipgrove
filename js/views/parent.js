/* ==========================================================
   瓜瓜英语 · 家长中心（flow）
   见 .design-contract.md §6
   职责：学习时长 / 时长限制开关 / 单元掌握度 / 真人配音覆盖 / 清空记录
   ========================================================== */

(function (global) {
  'use strict';

  global.GuaguaApp.register('parent', {
    chassis: 'flow',
    title: '家长中心',
    back: 'me',

    render: function (ctx) {
      var UI = ctx.ui, API = ctx.api, DATA = ctx.data;
      var esc = UI.esc;

      var profile = DATA.profile;
      var report = API.buildReport();
      var limitOn = !!API.progress.settings.dailyLimitOn;

      var html = '' +
        '<div class="stat-grid">' +
          '<div class="stat-cell">' +
            '<b>' + profile.todayMinutes + ' 分</b><span>今日学习时长</span></div>' +
          '<div class="stat-cell">' +
            '<b>' + report.weekDone + '/' + report.weekTarget + '</b><span>本周打卡天数</span></div>' +
          '<div class="stat-cell">' +
            '<b>' + report.wordsLearned + '</b><span>累计学会单词</span></div>' +
          '<div class="stat-cell">' +
            '<b>' + report.stars + '</b><span>累计获得星星</span></div>' +
        '</div>';

      /* ---- 时长限制 ---- */
      html += '<div class="section-title"><span>使用时长限制</span></div>' +
        '<div class="limit-card">' +
          '<div class="limit-text">' +
            '<b>每日 ' + profile.dailyLimitMinutes + ' 分钟</b>' +
            '<span>开启后到点提醒孩子休息（原型演示开关）</span>' +
          '</div>' +
          '<button class="switch' + (limitOn ? ' is-on' : '') + '" type="button" ' +
            'data-act="limit" aria-pressed="' + limitOn + '" aria-label="每日时长限制"></button>' +
        '</div>';

      /* ---- 单元掌握度 ---- */
      html += '<div class="section-title"><span>单元掌握度</span>' +
              '<span class="section-more">按已学单词计算</span></div>';

      API.mastery().forEach(function (m) {
        html += '' +
          '<div class="mastery-row">' +
            '<div class="mastery-name">' + esc(m.titleZh) + '</div>' +
            '<div class="ability-bar"><i data-fill="' + UI.clamp(m.percent, 0, 100) + '"></i></div>' +
            '<div class="ability-val">' + m.percent + '%</div>' +
          '</div>';
      });

      /* ---- 逐课学习报告（最近 8 次环节记录） ---- */
      var STAGE_NAME = {};
      DATA.STAGES.forEach(function (st) { STAGE_NAME[st.id] = st.name; });

      var lessons = (API.progress.lessons || []).slice().reverse().slice(0, 8);
      html += '<div class="section-title"><span>逐课学习报告</span>' +
              '<span class="section-more">最近 ' + lessons.length + ' 次</span></div>';

      if (!lessons.length) {
        html += '<div class="empty">还没有完成任何学习环节，去闯一关就会记录在这里</div>';
      } else {
        html += '<div class="report-list">';
        lessons.forEach(function (l) {
          var u = DATA.getUnit(l.unitId) || DATA.units[0];
          var d = new Date(l.at || Date.now());
          var two = function (n) { return ('0' + n).slice(-2); };
          html += '' +
            '<div class="report-row">' +
              '<img src="' + esc(u.ico) + '" alt="">' +
              '<span class="report-body">' +
                '<b>' + esc(u.titleZh) + ' · ' + esc(STAGE_NAME[l.stage] || l.stage) + '</b>' +
                '<i>' + two(d.getMonth() + 1) + '-' + two(d.getDate()) + ' ' +
                  two(d.getHours()) + ':' + two(d.getMinutes()) +
                  ' · 答对 ' + l.score + '/' + l.total + '</i>' +
              '</span>' +
              UI.stars(l.stars) +
            '</div>';
        });
        html += '</div>';
      }

      /* ---- 真人配音覆盖（当前为 0%，登记 mp3 后自动生效） ---- */
      var cov = ctx.audio.coverage();
      html += '<div class="section-title"><span>音频资源</span></div>' +
        '<div class="limit-card">' +
          '<div class="limit-text">' +
            '<b>真人配音覆盖 ' + cov.percent + '%（' + cov.real + '/' + cov.total + '）</b>' +
            '<span>把 mp3 放进 assets/audio/en/ 并在 manifest.js 登记即自动启用，' +
              '未登记的词使用浏览器合成音</span>' +
          '</div>' +
          UI.badge(cov.real ? 'real' : 'tts') +
        '</div>';

      /* ---- 清空记录 ---- */
      html += '<div class="btn-row">' +
        '<button class="btn btn-ghost" type="button" data-act="reset">清空全部学习记录</button>' +
        '</div><div style="height:var(--s-6)"></div>';

      return html;
    },

    mount: function (root, ctx) {
      var sw = root.querySelector('[data-act="limit"]');
      sw.addEventListener('click', function () {
        var on = !sw.classList.contains('is-on');
        sw.classList.toggle('is-on', on);
        sw.setAttribute('aria-pressed', String(on));
        ctx.api.setSetting('dailyLimitOn', on).then(function () {
          ctx.ui.toast(on ? '已开启每日时长限制' : '已关闭每日时长限制');
        });
      });

      root.querySelector('[data-act="reset"]').addEventListener('click', function () {
        if (!global.confirm('确定要清空全部学习记录吗？此操作不可恢复。')) return;
        ctx.api.reset().then(function () {
          ctx.ui.toast('学习记录已清空');
          ctx.reload();
        });
      });
    }
  });

})(window);