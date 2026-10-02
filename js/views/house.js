/* ==========================================================
   瓜瓜英语 · 呱呱小屋（flow）
   见 .design-contract.md §11.3
   职责：用魔石购买装扮道具，并把道具摆进小屋里
   ========================================================== */

(function (global) {
  'use strict';

  global.GuaguaApp.register('house', {
    chassis: 'flow',
    title: '呱呱小屋',
    back: 'me',

    render: function (ctx) {
      var UI = ctx.ui, API = ctx.api, DATA = ctx.data;
      var esc = UI.esc;

      var owned = API.progress.house.owned;
      var placed = API.progress.house.placed;

      /* ---- 结算条 ---- */
      var html = '' +
        '<div class="gem-bar">' +
          '<span class="gem-ico" aria-hidden="true">' +
            '<svg viewBox="0 0 24 24" width="22" height="22">' +
              '<path d="M12 2.6 21 9l-9 12.4L3 9z" fill="#7FD8FF" stroke="#3AA6E0" stroke-width="1.6"/>' +
              '<path d="M3 9h18L12 12.4z" fill="#BEEBFF"/>' +
            '</svg>' +
          '</span>' +
          '<b>' + API.progress.gems + '</b><span>颗魔石</span>' +
          '<i>完成每个环节可得魔石，满星更多</i>' +
        '</div>';

      /* ---- 小屋预览 ---- */
      html += '<div class="section-title"><span>我的小屋</span>' +
              '<span class="section-more">已拥有 ' + owned.length + ' / ' + DATA.houseItems.length + ' 件</span></div>' +
              '<div class="room">' +
                '<div class="room-wall"></div>' +
                '<div class="room-floor"></div>';

      DATA.HOUSE_SLOTS.forEach(function (slot) {
        var itemId = placed[slot.id];
        var item = itemId ? DATA.getHouseItem(itemId) : null;
        html += '<div class="room-slot slot-' + esc(slot.id) + '">' +
                  (item
                    ? '<img src="' + esc(item.img) + '" alt="' + esc(item.name) + '">'
                    : '<span class="room-empty">' + esc(slot.name) + '</span>') +
                '</div>';
      });
      html += '</div>';

      /* ---- 商店 ---- */
      html += '<div class="section-title"><span>装扮商店</span>' +
              '<span class="section-more">点一下就能买</span></div>' +
              '<div class="shop-grid">';

      DATA.houseItems.forEach(function (it) {
        var has = owned.indexOf(it.id) >= 0;
        var wearing = placed[it.slot] === it.id;
        html += '' +
          '<button class="shop-card' + (has ? ' is-owned' : '') + (wearing ? ' is-wearing' : '') + '" ' +
            'type="button" data-item="' + esc(it.id) + '">' +
            '<img src="' + esc(it.img) + '" alt="">' +
            '<b>' + esc(it.name) + '</b>' +
            '<span class="shop-cost">' +
              (wearing ? '已摆放' : (has ? '点我摆放' : '&#9670; ' + it.cost)) +
            '</span>' +
          '</button>';
      });
      html += '</div><div style="height:var(--s-4)"></div>';

      return html;
    },

    mount: function (root, ctx) {
      Array.prototype.forEach.call(root.querySelectorAll('[data-item]'), function (el) {
        el.addEventListener('click', function () {
          var id = el.getAttribute('data-item');
          var item = ctx.data.getHouseItem(id);
          if (!item) return;

          var owned = ctx.api.progress.house.owned;

          if (owned.indexOf(id) >= 0) {
            ctx.api.placeHouseItem(id, item.slot).then(function () {
              ctx.ui.toast('已把「' + item.name + '」摆好啦');
              ctx.reload();
            });
            return;
          }

          if (ctx.api.progress.gems < item.cost) {
            ctx.ui.toast('魔石还不够，先去完成一个环节吧', 2200);
            return;
          }

          ctx.api.buyHouseItem(id).then(function (res) {
            if (!res.ok) { ctx.ui.toast('购买失败，请稍后再试'); return; }
            ctx.ui.toast('买到「' + item.name + '」啦！');
            ctx.ui.confetti(14);
            ctx.reload();
          });
        });
      });
    }
  });

})(window);