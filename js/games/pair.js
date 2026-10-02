/* ==========================================================
   玩 4 · 拖拽配对【新增】
   pointer 拖动词卡到对应插画；3 组全部配对成功即完成
   判定：全程没有放错 → ok
   ========================================================== */

(function (global) {
  'use strict';

  var G = global.GuaguaGames;

  G.register('pair', {
    label: '拖拽配对',
    needs: ['pointer'],

    render: function (ctx, g) {
      var UI = ctx.ui, esc = UI.esc;
      var trio = UI.shuffle([g.word].concat(G.distractors(g.pool, g.word, 2, UI, ctx.data)));

      var targets = '';
      trio.forEach(function (w) {
        targets += '<div class="pair-target" data-drop="' + esc(w.en) + '">' +
                     '<img src="' + esc(w.img) + '" alt="">' +
                     '<div class="pair-slot"></div>' +
                   '</div>';
      });

      var chips = '';
      UI.shuffle(trio).forEach(function (w) {
        chips += '<div class="pair-chip" data-chip="' + esc(w.en) + '">' + esc(w.en) + '</div>';
      });

      return '' +
        '<div class="q-card">' +
          '<div class="q-hint">把单词卡拖到<em>对应的图片</em>上</div>' +
          '<div class="pair-board" data-board>' +
            '<div class="pair-targets">' + targets + '</div>' +
            '<div class="pair-chips" data-tray>' + chips + '</div>' +
          '</div>' +
          '<div class="q-feedback" data-fb></div>' +
        '</div>';
    },

    mount: function (root, ctx, g, finish) {
      var UI = ctx.ui;
      var board = root.querySelector('[data-board]');
      var tray = root.querySelector('[data-tray]');
      var fb = root.querySelector('[data-fb]');
      var chips = Array.prototype.slice.call(root.querySelectorAll('[data-chip]'));
      var targets = Array.prototype.slice.call(root.querySelectorAll('[data-drop]'));

      var placed = 0;
      var mistakes = 0;
      var drag = null;

      chips.forEach(function (chip) {
        chip.addEventListener('pointerdown', function (e) {
          if (chip.classList.contains('is-placed')) return;
          e.preventDefault();
          chip.setPointerCapture(e.pointerId);
          var r = chip.getBoundingClientRect();
          drag = { chip: chip, dx: e.clientX - r.left, dy: e.clientY - r.top, w: r.width, h: r.height };
          chip.classList.add('is-drag');
        });

        chip.addEventListener('pointermove', function (e) {
          if (!drag || drag.chip !== chip) return;
          e.preventDefault();
          chip.style.transform = 'translate(' + (e.clientX - drag.dx - chip.offsetLeft) + 'px,' +
                                 (e.clientY - drag.dy - chip.offsetTop) + 'px)';
        });

        function drop(e) {
          if (!drag || drag.chip !== chip) return;
          drag = null;
          chip.classList.remove('is-drag');

          var under = document.elementFromPoint(e.clientX, e.clientY);
          var zone = under && under.closest ? under.closest('[data-drop]') : null;

          chip.style.transform = '';

          if (zone && zone.getAttribute('data-drop') === chip.getAttribute('data-chip')) {
            zone.classList.add('is-filled');
            chip.classList.add('is-placed');
            var slot = zone.querySelector('.pair-slot');
            if (slot) slot.appendChild(chip);
            placed++;
            ctx.audio.play(chip.getAttribute('data-chip'), chip.getAttribute('data-chip'));
            if (fb) { fb.className = 'q-feedback is-ok'; fb.textContent = '配对成功 ' + placed + ' / 3'; }
            if (placed >= 3) {
              if (fb) fb.textContent = mistakes === 0 ? '全部配对成功，太棒了！' : '全部配对成功！';
              UI.later(function () { finish({ ok: mistakes === 0 }); }, 900);
            }
          } else if (zone) {
            mistakes++;
            zone.classList.add('is-shake');
            UI.later(function () { zone.classList.remove('is-shake'); }, 420);
            if (fb) { fb.className = 'q-feedback is-no'; fb.textContent = '再想想，这张不是它的家哦'; }
          }
        }

        chip.addEventListener('pointerup', drop);
        chip.addEventListener('pointercancel', function () {
          drag = null;
          chip.classList.remove('is-drag');
          chip.style.transform = '';
        });
      });

      /* 触屏滚动会打断拖动，这里禁用棋盘内滚动 */
      board.addEventListener('touchmove', function (e) {
        if (drag) e.preventDefault();
      }, { passive: false });
      if (tray) tray.addEventListener('contextmenu', function (e) { e.preventDefault(); });

      if (fb) { fb.className = 'q-feedback'; fb.textContent = '拖一拖，试试看'; }
    }
  });

})(window);