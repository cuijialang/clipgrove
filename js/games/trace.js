/* ==========================================================
   玩 5 · 字母描红【新增】
   canvas 描出单词的首字母；覆盖率达标即完成
   覆盖率用「字母像素遮罩」与「手指轨迹」比对，不依赖具体字形数据
   ========================================================== */

(function (global) {
  'use strict';

  var G = global.GuaguaGames;

  var SIZE = 300;        // canvas 逻辑尺寸（CSS 再等比缩放）
  var GRID = 34;         // 遮罩采样网格
  var HIT = 19;          // 轨迹命中半径（逻辑像素）
  var PASS = 0.62;       // 通过阈值

  G.register('trace', {
    label: '字母描红',
    needs: ['pointer'],

    render: function (ctx, g) {
      var esc = ctx.ui.esc;
      var letter = g.word.en.charAt(0).toUpperCase();

      return '' +
        '<div class="q-card">' +
          '<div class="q-hint">用手指沿着虚线描出字母 <em>' + esc(letter) + '</em></div>' +
          '<div class="trace-wrap">' +
            '<canvas class="trace-canvas" width="' + SIZE + '" height="' + SIZE + '" data-canvas></canvas>' +
          '</div>' +
          '<div class="trace-progress">' +
            '<div class="pbar"><div class="pbar-fill" data-fill="0"></div></div>' +
            '<span class="trace-percent" data-percent>0%</span>' +
          '</div>' +
          '<div class="q-word">' + esc(g.word.en) + '</div>' +
          '<div class="q-zh">' + esc(g.word.zh) + '</div>' +
          '<div class="btn-row">' +
            '<button class="btn btn-ghost" type="button" data-act="clear">重新描</button>' +
            '<button class="btn btn-audio" type="button" data-act="replay">听发音</button>' +
          '</div>' +
          '<div class="q-feedback" data-fb></div>' +
        '</div>';
    },

    mount: function (root, ctx, g, finish) {
      var UI = ctx.ui;
      var canvas = root.querySelector('[data-canvas]');
      var c = canvas.getContext('2d');
      var fillEl = root.querySelector('.pbar-fill');
      var pctEl = root.querySelector('[data-percent]');
      var fb = root.querySelector('[data-fb]');
      var letter = g.word.en.charAt(0).toUpperCase();

      /* ---- 1. 生成字母像素遮罩 ---- */
      var mask = [];
      (function buildMask() {
        var off = document.createElement('canvas');
        off.width = SIZE;
        off.height = SIZE;
        var oc = off.getContext('2d');
        oc.fillStyle = '#000';
        oc.textAlign = 'center';
        oc.textBaseline = 'middle';
        oc.font = '900 232px "PingFang SC","Microsoft YaHei",sans-serif';
        oc.fillText(letter, SIZE / 2, SIZE / 2 + 6);

        var img = oc.getImageData(0, 0, SIZE, SIZE).data;
        var step = SIZE / GRID;
        for (var gy = 0; gy < GRID; gy++) {
          for (var gx = 0; gx < GRID; gx++) {
            var px = Math.floor(gx * step + step / 2);
            var py = Math.floor(gy * step + step / 2);
            var a = img[(py * SIZE + px) * 4 + 3];
            if (a > 120) mask.push({ x: px, y: py });
          }
        }
      })();

      /* ---- 2. 底图（虚线字母） ---- */
      var pts = [];   // 手指轨迹（逻辑坐标）

      function drawGuides() {
        c.clearRect(0, 0, SIZE, SIZE);
        c.save();
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.font = '900 232px "PingFang SC","Microsoft YaHei",sans-serif';
        c.lineWidth = 4;
        c.setLineDash([10, 12]);
        c.strokeStyle = 'rgba(43,33,54,.22)';
        c.strokeText(letter, SIZE / 2, SIZE / 2 + 6);
        c.restore();
      }

      function drawInk() {
        c.save();
        c.lineWidth = 16;
        c.lineCap = 'round';
        c.lineJoin = 'round';
        c.strokeStyle = '#FF7A45';
        c.beginPath();
        for (var i = 0; i < pts.length; i++) {
          if (i === 0) c.moveTo(pts[i].x, pts[i].y);
          else c.lineTo(pts[i].x, pts[i].y);
        }
        c.stroke();
        c.restore();
      }

      function repaint() {
        drawGuides();
        drawInk();
      }
      repaint();

      /* ---- 3. 覆盖度 ---- */
      function coverage() {
        if (!mask.length || !pts.length) return 0;
        var hit = 0;
        for (var i = 0; i < mask.length; i++) {
          var m = mask[i];
          for (var j = 0; j < pts.length; j++) {
            var dx = pts[j].x - m.x;
            var dy = pts[j].y - m.y;
            if (dx * dx + dy * dy <= HIT * HIT) { hit++; break; }
          }
        }
        return hit / mask.length;
      }

      var done = false;

      function refresh() {
        var p = coverage();
        var pct = Math.round(p * 100);
        if (fillEl) fillEl.style.width = Math.min(100, pct) + '%';
        if (pctEl) pctEl.textContent = pct + '%';

        if (!done && p >= PASS) {
          done = true;
          if (fb) { fb.className = 'q-feedback is-ok'; fb.textContent = '描得真棒！'; }
          ctx.audio.play(g.word.en, g.word.en);
          UI.confetti(10);
          UI.later(function () { finish({ ok: true }); }, 1000);
        }
      }

      /* ---- 4. 指针绘制 ---- */
      function toLocal(e) {
        var r = canvas.getBoundingClientRect();
        return {
          x: (e.clientX - r.left) * (SIZE / r.width),
          y: (e.clientY - r.top) * (SIZE / r.height)
        };
      }

      var drawing = false;

      canvas.addEventListener('pointerdown', function (e) {
        if (done) return;
        e.preventDefault();
        canvas.setPointerCapture(e.pointerId);
        drawing = true;
        pts.push(toLocal(e));
        repaint();
      });

      canvas.addEventListener('pointermove', function (e) {
        if (!drawing || done) return;
        e.preventDefault();
        pts.push(toLocal(e));
        repaint();
      });

      function stop() {
        if (!drawing) return;
        drawing = false;
        refresh();
      }
      canvas.addEventListener('pointerup', stop);
      canvas.addEventListener('pointercancel', stop);

      /* ---- 5. 按钮 ---- */
      var clearBtn = root.querySelector('[data-act="clear"]');
      if (clearBtn) {
        clearBtn.addEventListener('click', function () {
          if (done) return;
          pts = [];
          repaint();
          refresh();
        });
      }

      var rp = root.querySelector('[data-act="replay"]');
      if (rp) rp.addEventListener('click', function () { ctx.audio.play(g.word.en, g.word.en); });

      UI.later(function () { ctx.audio.play(g.word.en, g.word.en); }, 300);
    }
  });

})(window);