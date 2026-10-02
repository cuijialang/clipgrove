/* ==========================================================
   瓜瓜英语 · API 层（全部为本地 stub，不发起任何真实网络请求）
   见 .design-contract.md §7

   设计取舍：原型是「离线优先」，渲染走同步快照 GuaguaAPI.progress，
   写入走 Promise（模拟未来后端的异步落盘）。
   接真后端时只需替换本文件，视图层无需改动。
   ========================================================== */

(function (global) {
  'use strict';

  var DATA = global.GUAGUA_DATA;
  var KEY = 'guagua_progress_v2';

  function defaultProgress() {
    return {
      learned: [],          // 已学单词（en）
      units: {},            // { unitId: { stars, best, plays } }
      rhymes: [],           // 已听儿歌 id
      stories: [],          // 已读绘本 id
      settings: { dailyLimitOn: true }
    };
  }

  function load() {
    try {
      var raw = global.localStorage.getItem(KEY);
      if (!raw) return defaultProgress();
      var p = JSON.parse(raw) || {};
      var d = defaultProgress();
      return {
        learned: Array.isArray(p.learned) ? p.learned : d.learned,
        units: p.units && typeof p.units === 'object' ? p.units : d.units,
        rhymes: Array.isArray(p.rhymes) ? p.rhymes : d.rhymes,
        stories: Array.isArray(p.stories) ? p.stories : d.stories,
        settings: p.settings && typeof p.settings === 'object'
          ? Object.assign(d.settings, p.settings)
          : d.settings
      };
    } catch (e) {
      return defaultProgress();
    }
  }

  var progress = load();

  function persist() {
    return new Promise(function (resolve) {
      try {
        global.localStorage.setItem(KEY, JSON.stringify(progress));
        resolve(true);
      } catch (e) {
        resolve(false);
      }
    });
  }

  function pushUnique(arr, v) {
    if (arr.indexOf(v) < 0) { arr.push(v); return true; }
    return false;
  }

  /* ---------------- 派生数据 ---------------- */

  function unitRecord(id) {
    var r = progress.units[id];
    return { stars: (r && r.stars) || 0, best: (r && r.best) || 0, plays: (r && r.plays) || 0 };
  }

  function totalStars() {
    var sum = 0;
    for (var id in progress.units) {
      if (Object.prototype.hasOwnProperty.call(progress.units, id)) {
        sum += (progress.units[id].stars || 0);
      }
    }
    return sum;
  }

  function totalWords() {
    return DATA.allWords().length;
  }

  /** 单元掌握度 = 该单元已学单词比例 */
  function mastery() {
    return DATA.units.map(function (u) {
      var n = 0;
      u.words.forEach(function (w) { if (progress.learned.indexOf(w.en) >= 0) n++; });
      return {
        unitId: u.id,
        titleZh: u.titleZh,
        percent: Math.round((n / u.words.length) * 100)
      };
    });
  }

  /** 报告 = mock 基线 + 真实进度修正 */
  function buildReport() {
    var r = JSON.parse(JSON.stringify(DATA.report));
    var learnedRatio = totalWords() ? progress.learned.length / totalWords() : 0;
    r.listening = Math.min(99, Math.round(r.listening * 0.6 + learnedRatio * 100 * 0.4));
    r.reading = Math.round(r.reading * 0.5 + learnedRatio * 100 * 0.5);
    r.wordsLearned = progress.learned.length;
    r.totalWords = totalWords();
    r.stars = totalStars();
    r.rhymesHeard = progress.rhymes.length;
    r.totalRhymes = DATA.rhymes.length;
    r.storiesRead = progress.stories.length;
    r.totalStories = DATA.stories.length;
    return r;
  }

  /* ---------------- 对外接口 ---------------- */

  var GuaguaAPI = {
    /** 同步快照，供视图渲染 */
    progress: progress,

    unitRecord: unitRecord,
    totalStars: totalStars,
    totalWords: totalWords,
    mastery: mastery,
    buildReport: buildReport,

    getUnits: function () { return Promise.resolve(DATA.units); },
    getRhymes: function () { return Promise.resolve(DATA.rhymes); },
    getStories: function () { return Promise.resolve(DATA.stories); },
    getProfile: function () { return Promise.resolve(DATA.profile); },
    getReport: function () { return Promise.resolve(buildReport()); },

    /** 标记单词已学 */
    markLearned: function (word) {
      if (pushUnique(progress.learned, word)) return persist();
      return Promise.resolve(false);
    },

    /** 记录一次闯关结果 */
    recordQuiz: function (unitId, result) {
      var rec = progress.units[unitId] || { stars: 0, best: 0, plays: 0 };
      rec.stars = Math.max(rec.stars, result.stars || 0);
      rec.best = Math.max(rec.best, result.score || 0);
      rec.plays += 1;
      progress.units[unitId] = rec;
      return persist();
    },

    markRhymeHeard: function (id) {
      if (pushUnique(progress.rhymes, id)) return persist();
      return Promise.resolve(false);
    },

    markStoryRead: function (id) {
      if (pushUnique(progress.stories, id)) return persist();
      return Promise.resolve(false);
    },

    setSetting: function (key, value) {
      progress.settings[key] = value;
      return persist();
    },

    reset: function () {
      progress = defaultProgress();
      GuaguaAPI.progress = progress;
      return persist();
    }
  };

  global.GuaguaAPI = GuaguaAPI;

})(window);