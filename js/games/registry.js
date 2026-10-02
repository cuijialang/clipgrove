/* ==========================================================
   瓜瓜英语 · 玩法引擎注册表
   见 .design-contract.md §11.2

   玩法不是视图：它由宿主视图 play 统一挂载与判定，
   游戏自身禁止触碰导航 / 顶栏 / 底栏。

   GuaguaGames.register(id, {
     label,                       // 玩法名（顶栏与步骤名）
     needs: ['audio'|'mic'|'pointer'],
     render(ctx, g) -> html,      // g = { word, pool, unit, index, total, mode, extra }
     mount(rootEl, ctx, g, finish)// 完成后必须调用 finish({ ok, say })
   })
   ========================================================== */

(function (global) {
  'use strict';

  var games = {};
  var order = [];

  function register(id, def) {
    games[id] = def;
    order.push(id);
  }

  function get(id) { return games[id]; }

  function list() {
    return order.map(function (id) {
      return { id: id, label: games[id].label, needs: games[id].needs || [] };
    });
  }

  /** 取 n 个干扰词：优先本单元，不足时从全局词表补齐 */
  function distractors(pool, word, n, UI, DATA) {
    var out = (pool || []).filter(function (w) { return w.en !== word.en; });
    if (out.length < n) {
      DATA.allWords().forEach(function (w) {
        if (w.en !== word.en && out.indexOf(w) < 0) out.push(w);
      });
    }
    return UI.shuffle(out).slice(0, n);
  }

  /** 取 n 个「首字母不同」的干扰词（自然拼读用） */
  function distractorsOtherLetter(pool, word, n, UI, DATA) {
    var L = word.en.charAt(0).toLowerCase();
    var out = (pool || []).filter(function (w) {
      return w.en !== word.en && w.en.charAt(0).toLowerCase() !== L;
    });
    DATA.allWords().forEach(function (w) {
      if (w.en !== word.en && w.en.charAt(0).toLowerCase() !== L && out.indexOf(w) < 0) out.push(w);
    });
    return UI.shuffle(out).slice(0, n);
  }

  /** 小喇叭图标（音频按钮统一使用） */
  var SPEAKER_SVG = '' +
    '<span class="sound-ico" aria-hidden="true">' +
      '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#fff" ' +
        'stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4z"/>' +
        '<path d="M15.6 9.2a4.1 4.1 0 0 1 0 5.6M18.3 6.6a7.7 7.7 0 0 1 0 10.8"/>' +
      '</svg>' +
    '</span>';

  global.GuaguaGames = {
    register: register,
    get: get,
    list: list,
    distractors: distractors,
    distractorsOtherLetter: distractorsOtherLetter,
    SPEAKER_SVG: SPEAKER_SVG,
    games: games
  };

})(window);
