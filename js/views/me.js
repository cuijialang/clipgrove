/* ==========================================================
   瓜瓜英语 · 我的（tab）
   见 .design-contract.md §6
   职责：本周成就 / 打卡条 / 能力分析 / 家长中心入口
   ========================================================== */

(function (global) {
  'use strict';

  var DAYS = ['一', '二', '三', '四', '五', '六', '日'];

  function icon(paths) {
    return '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" ' +
           'stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' + paths + '</svg>';
  }

  var ICO_PARENT = icon('<path d="M12 3.2 19 6v5.6c0 4.4-2.9 7.4-7 9.2-4.1-1.8-7-4.8-7-9.2V6z"/>' +
                        '<path d="M9.2 12.2 11.3 14.4 15 10.6"/>');
  var ICO_RESET = icon('<path d="M4.5 7h15"/><path d="M9.4 7V4.6h5.2V7"/>' +
                       '<path d="M6.8 7l.9 12.4h8.6L17.2 7"/>');
  var ICO_ABOUT = icon('<circle cx="12" cy="12" r="8.6"/><path d="M12 11v5.6M12 7.9v.1"/>');

  global.GuaguaApp.register('me', {
    chassis: 'tab',
    title: '我的',
    back: 'home',

    render: function (ctx) {
      var UI = ctx.ui, API = ctx.api, DATA = ctx.data;
      var esc = UI.esc;

      var profile = DATA.profile;
      var report = API.buildReport();

      var html = '' +
        '<div class="me-head">' +
          '<img class="me-avatar" src="' + esc(profile.avatar) + '" alt="">' +
          '<div class="me-info">' +
            '<div class="me-name">' + esc(profile.name) + '</div>' +
            '<div class="me-sub">' + profile.age + ' 岁 · ' + esc(profile.level) +
              ' · 连续打卡 ' + profile.streakDays + ' 天</div>' +
          '</div>' +
          '<span class="hello-badges">' +
            '<span class="badge badge-gem">&#9670; ' + report.gems + '</span>' +
            '<span class="badge">勋章 ' + report.badges + '/' + report.totalBadges + '</span>' +
          '</span>' +
        '</div>';

      html += '' +
        '<div class="achieve-row">' +
          '<div class="achieve-card">' +
            '<div class="achieve-num">' + report.gems + '</div>' +
            '<div class="achieve-label">我的魔石</div>' +
          '</div>' +
          '<div class="achieve-card">' +
            '<div class="achieve-num">' + report.stagesDone + '/' + report.stagesTotal + '</div>' +
            '<div class="achieve-label">完成环节</div>' +
          '</div>' +
          '<div class="achieve-card">' +
            '<div class="achieve-num">' + report.badges + '/' + report.totalBadges + '</div>' +
            '<div class="achieve-label">成长勋章</div>' +
          '</div>' +
        '</div>';

      /* ---- 养成入口 ---- */
      html += '<div class="section-title"><span>我的养成</span>' +
              '<span class="section-more">边玩边攒</span></div>' +
              '<div class="grow-grid">' +
                '<button class="grow-tile" type="button" data-go="house">' +
                  '<img src="' + esc(DATA.houseItems[0].img) + '" alt="">' +
                  '<b>呱呱小屋</b><span>已拥有 ' + API.progress.house.owned.length + ' 件</span>' +
                '</button>' +
                '<button class="grow-tile" type="button" data-go="badges">' +
                  '<img src="' + esc(DATA.units[0].ico) + '" alt="">' +
                  '<b>成长勋章</b><span>' + report.badges + ' / ' + report.totalBadges + ' 已获得</span>' +
                '</button>' +
                '<button class="grow-tile" type="button" data-go="wrongbook">' +
                  '<img src="' + esc(DATA.units[2].ico) + '" alt="">' +
                  '<b>错词本</b><span>' + report.wrongCount + ' 个待攻克</span>' +
                '</button>' +
              '</div>';

      /* ---- 本周打卡 ---- */
      html += '<div class="section-title"><span>本周打卡</span>' +
              '<span class="section-more">' + report.weekDone + '/' + report.weekTarget + ' 天</span></div>' +
              '<div class="streak-strip">';
      for (var d = 0; d < 7; d++) {
        html += '<div class="streak-day' + (d < report.weekDone ? ' is-on' : '') + '">' +
                  '<i>' + DAYS[d] + '</i></div>';
      }
      html += '</div>';

      /* ---- 能力分析 ---- */
      var abilities = [
        { name: '听力', val: report.listening },
        { name: '口语', val: report.speaking },
        { name: '阅读', val: report.reading },
        { name: '书写', val: report.writing }
      ];
      html += '<div class="section-title"><span>能力分析</span>' +
              '<span class="section-more">根据练习估算</span></div>';
      abilities.forEach(function (a) {
        html += '' +
          '<div class="ability-row">' +
            '<div class="ability-name">' + a.name + '</div>' +
            '<div class="ability-bar"><i data-fill="' + UI.clamp(a.val, 0, 100) + '"></i></div>' +
            '<div class="ability-val">' + a.val + '</div>' +
          '</div>';
      });

      /* ---- 菜单 ---- */
      html += '' +
        '<div class="menu-list">' +
          '<button class="menu-row" type="button" data-act="parent">' +
            '<span class="menu-ico">' + ICO_PARENT + '</span>' +
            '<span class="menu-label">家长中心</span>' +
            '<span class="menu-arrow">&#8250;</span>' +
          '</button>' +
          '<button class="menu-row" type="button" data-act="reset">' +
            '<span class="menu-ico">' + ICO_RESET + '</span>' +
            '<span class="menu-label">清空学习记录</span>' +
            '<span class="menu-arrow">&#8250;</span>' +
          '</button>' +
          '<button class="menu-row" type="button" data-act="about">' +
            '<span class="menu-ico">' + ICO_ABOUT + '</span>' +
            '<span class="menu-label">关于瓜瓜英语</span>' +
            '<span class="menu-arrow">&#8250;</span>' +
          '</button>' +
        '</div>';

      return html;
    },

    mount: function (root, ctx) {
      /* 养成入口：呱呱小屋 / 成长勋章 / 错词本 */
      Array.prototype.forEach.call(root.querySelectorAll('[data-go]'), function (el) {
        el.addEventListener('click', function () {
          ctx.go(el.getAttribute('data-go'));
        });
      });

      root.querySelector('[data-act="parent"]').addEventListener('click', function () {
        ctx.go('parent');
      });

      root.querySelector('[data-act="reset"]').addEventListener('click', function () {
        if (!global.confirm('确定要清空全部学习记录吗？此操作不可恢复。')) return;
        ctx.api.reset().then(function () {
          ctx.ui.toast('学习记录已清空');
          ctx.reload();
        });
      });

      root.querySelector('[data-act="about"]').addEventListener('click', function () {
        ctx.ui.toast('瓜瓜英语 · 高保真交互原型 · 公版素材自建', 2600);
      });
    }
  });

})(window);