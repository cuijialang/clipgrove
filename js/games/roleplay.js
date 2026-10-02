/* ==========================================================
   玩 11 · 角色扮演【新增，自创玩法】
   「模拟视频通话」多轮对话：听呱呱说，选出正确应答；
   三轮结束后进入跟读，把最后一句大声说出来
   ========================================================== */

(function (global) {
  'use strict';

  var G = global.GuaguaGames;

  G.register('roleplay', {
    label: '角色扮演',
    needs: ['audio', 'mic'],

    render: function (ctx, g) {
      var esc = ctx.ui.esc;
      var rp = pickRoleplay(ctx, g);

      return '' +
        '<div class="q-card rp-card">' +
          '<div class="rp-call">' +
            '<div class="rp-head">' +
              '<img class="rp-avatar" src="' + esc(rp.cover) + '" alt="">' +
              '<div class="rp-who"><b>呱呱</b><span data-call-status>视频通话中…</span></div>' +
              '<span class="rp-dot" aria-hidden="true"></span>' +
            '</div>' +
            '<div class="rp-stream" data-stream>' +
              '<div class="rp-empty">' + esc(rp.titleZh) + ' · 共 ' + rp.rounds.length + ' 轮对话</div>' +
            '</div>' +
          '</div>' +
          '<div class="rp-options" data-options></div>' +
          '<div class="q-feedback" data-fb>听清楚呱呱在说什么哦</div>' +
        '</div>';
    },

    mount: function (root, ctx, g, finish) {
      var UI = ctx.ui, esc = UI.esc, AUDIO = ctx.audio;
      var rp = pickRoleplay(ctx, g);
      var stream = root.querySelector('[data-stream]');
      var optBox = root.querySelector('[data-options]');
      var fb = root.querySelector('[data-fb]');
      var status = root.querySelector('[data-call-status]');

      var index = 0;
      var mistakes = 0;

      function bubble(who, text) {
        var el = document.createElement('div');
        el.className = 'rp-bubble rp-' + who;
        el.innerHTML = '<span>' + esc(text) + '</span>';
        stream.appendChild(el);
        stream.scrollTop = stream.scrollHeight;
        return el;
      }

      /* ---- 一轮对话 ---- */
      function round() {
        var r = rp.rounds[index];
        if (!r) return speakPhase();

        if (status) status.textContent = '第 ' + (index + 1) + ' / ' + rp.rounds.length + ' 轮';
        bubble('npc', r.npc);
        AUDIO.play('rp-' + rp.id + '-' + index, r.npc);

        optBox.innerHTML = '';
        UI.shuffle(r.options.slice()).forEach(function (o) {
          var b = document.createElement('button');
          b.className = 'rp-opt';
          b.type = 'button';
          b.innerHTML = '<b>' + esc(o.en) + '</b><i>' + esc(o.zh) + '</i>';
          b.addEventListener('click', function () {
            if (b.disabled) return;

            if (o.ok) {
              Array.prototype.forEach.call(optBox.querySelectorAll('.rp-opt'), function (x) { x.disabled = true; });
              b.classList.add('is-correct');
              bubble('me', o.en);
              AUDIO.play('rp-a-' + rp.id + '-' + index, o.en);
              if (fb) { fb.className = 'q-feedback is-ok'; fb.textContent = '回答得真好！'; }
              index++;
              UI.later(round, 1500);
            } else {
              mistakes++;
              b.disabled = true;
              b.classList.add('is-wrong');
              if (fb) { fb.className = 'q-feedback is-no'; fb.textContent = '这句不太合适，换一句试试'; }
            }
          });
          optBox.appendChild(b);
        });
      }

      /* ---- 跟读收尾 ---- */
      function speakPhase() {
        var last = rp.rounds[rp.rounds.length - 1];
        var line = '';
        last.options.forEach(function (o) { if (o.ok) line = o.en; });

        if (status) status.textContent = '轮到你说了';
        bubble('npc', last.npc);

        optBox.innerHTML = '' +
          '<div class="rp-speak">' +
            '<div class="q-hint">跟着大声读出这句话</div>' +
            '<div class="rp-line">' + esc(line) + '</div>' +
            '<button class="btn btn-mic btn-block" type="button" data-act="mic">开始跟读</button>' +
            '<div class="speak-status" data-status></div>' +
            '<div class="speak-heard" data-heard></div>' +
          '</div>';

        var btn = optBox.querySelector('[data-act="mic"]');
        var st = optBox.querySelector('[data-status]');
        var hd = optBox.querySelector('[data-heard]');
        var done = false;

        function live(on, text) {
          if (text != null) st.textContent = text;
          st.classList.toggle('is-live', !!on);
        }
        function wrap(ok) {
          if (done) return;
          done = true;
          if (fb) { fb.className = 'q-feedback ' + (ok ? 'is-ok' : 'is-no'); fb.textContent = ok ? '对话完成，你真棒！' : '对话结束，下次再练一次吧'; }
          if (ok) UI.confetti(16);
          UI.later(function () { finish({ ok: ok, say: ok }); }, 900);
        }

        AUDIO.play('rp-last-' + rp.id, line);

        btn.onclick = function () {
          var mode = AUDIO.mic.mode();

          if (mode === 'recognize') {
            btn.disabled = true;
            live(true, '正在听… 大声读出来');
            AUDIO.play('rp-try-' + rp.id, line).then(function () {
              return AUDIO.mic.recognize(line);
            }).then(function (res) {
              live(false, '');
              if (!res.ok) { btn.disabled = false; live(false, '没听清，再试一次吧'); return; }
              var ev = AUDIO.mic.evaluate(res.transcript || '', line);
              hd.innerHTML = '我听到：<b>' + esc(res.transcript || '…') + '</b>';
              if (ev.level === 'try') { btn.disabled = false; live(false, '再大声一点就好啦'); return; }
              wrap(true);
            });
            return;
          }

          if (mode === 'record') {
            btn.disabled = true;
            live(true, '正在录音… 请读出这句话');
            AUDIO.mic.record(2600).then(function (res) {
              live(false, '');
              if (!res.ok) { btn.disabled = false; live(false, '没有拿到麦克风权限，先跟读吧'); return; }
              live(false, '听听你自己的声音：');
              var el;
              try { el = new global.Audio(res.url); } catch (e) { return wrap(true); }
              el.onended = function () { AUDIO.mic.release(res.url); };
              el.play().catch(function () { /* 忽略 */ });
              UI.later(function () { wrap(true); }, 3000);
            });
            return;
          }

          /* 无麦克风：听 → 自评 */
          AUDIO.play('rp-manual-' + rp.id, line).then(function () {
            live(false, '跟着读三遍，读完点「我读好了」');
            btn.textContent = '我读好了';
            btn.onclick = function () { wrap(true); };
          });
        };
      }

      UI.later(round, 420);
    }
  });

  /** 按单元挑一个剧本（同一单元固定同一个，方便重复练习） */
  function pickRoleplay(ctx, g) {
    var list = ctx.data.roleplays;
    var idx = 0;
    for (var i = 0; i < ctx.data.units.length; i++) {
      if (ctx.data.units[i].id === (g.unit && g.unit.id)) { idx = i; break; }
    }
    return list[idx % list.length];
  }

})(window);