/* ==========================================================
   瓜瓜英语 · API 层（全部为本地 stub，不发起任何真实网络请求）
   见 .design-contract.md §7 与 §11.3

   设计取舍：原型是「离线优先」，渲染走同步快照 GuaguaAPI.progress，
   写入走 Promise（模拟未来后端的异步落盘）。
   接真后端时只需替换本文件，视图层无需改动。

   存储兼容：key 仍为 guagua_progress_v2；load() 按字段逐项兜底，
   v1 时期写入的旧数据（learned/units/rhymes/stories/settings）不会丢失。
   ========================================================== */

(function (global) {
  'use strict';

  var DATA = global.GUAGUA_DATA;
  var KEY = 'guagua_progress_v2';

  function defaultProgress() {
    return {
      /* ---- v1 字段，保留 ---- */
      learned: [],          // 已学单词（en）
      units: {},            // { unitId: { stars, best, plays } }
      rhymes: [],           // 已听儿歌 id
      stories: [],          // 已读绘本 id
      settings: { dailyLimitOn: true },

      /* ---- v3 新增（§11.3） ---- */
      gems: 0,              // 魔石余额（可消费）
      gemsTotal: 0,         // 累计获得的魔石（用于勋章）
      speak: 0,             // 跟读完成次数（用于勋章）
      wrong: {},            // 错词本 { en: 次数 }
      stages: {},           // { unitId: { warm,learn,practice,review,apply } }
      lessons: [],          // 逐课报告 [{ unitId, stage, game, score, total, stars, at }]
      house: { owned: [], placed: {} },  // 已购道具 / { slotId: itemId }
      badges: []            // 已获勋章 id
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
          : d.settings,

        gems: typeof p.gems === 'number' ? p.gems : d.gems,
        gemsTotal: typeof p.gemsTotal === 'number' ? p.gemsTotal : d.gemsTotal,
        speak: typeof p.speak === 'number' ? p.speak : d.speak,
        wrong: p.wrong && typeof p.wrong === 'object' ? p.wrong : d.wrong,
        stages: p.stages && typeof p.stages === 'object' ? p.stages : d.stages,
        lessons: Array.isArray(p.lessons) ? p.lessons : d.lessons,
        house: p.house && typeof p.house === 'object'
          ? { owned: Array.isArray(p.house.owned) ? p.house.owned : [],
              placed: p.house.placed && typeof p.house.placed === 'object' ? p.house.placed : {} }
          : d.house,
        badges: Array.isArray(p.badges) ? p.badges : d.badges
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

  /* ---------------- 派生数据（v1 保留） ---------------- */

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

  /* ---------------- 五环节进度（§11.1） ---------------- */

  function stageRecord(unitId) {
    var s = progress.stages[unitId] || {};
    var out = {};
    DATA.STAGES.forEach(function (st) { out[st.id] = !!s[st.id]; });
    return out;
  }

  /** 该单元已完成的环节数 */
  function stageDoneCount(unitId) {
    var r = stageRecord(unitId);
    var n = 0;
    DATA.STAGES.forEach(function (st) { if (r[st.id]) n++; });
    return n;
  }

  /** 全站累计完成的环节数（勋章用） */
  function totalStageDone() {
    var n = 0;
    for (var id in progress.stages) {
      if (Object.prototype.hasOwnProperty.call(progress.stages, id)) n += stageDoneCount(id);
    }
    return n;
  }

  /** 单元整体百分比：五个环节权重相同 */
  function unitPercent(unitId) {
    return Math.round((stageDoneCount(unitId) / DATA.STAGES.length) * 100);
  }

  /** 下一个待完成环节（都完成则返回终点标记） */
  function nextStage(unitId) {
    var r = stageRecord(unitId);
    for (var i = 0; i < DATA.STAGES.length; i++) {
      if (!r[DATA.STAGES[i].id]) return DATA.STAGES[i];
    }
    return { id: 'done', name: '已完成', view: 'result', desc: '全部完成' };
  }

  /* ---------------- 错词本（§11.3） ---------------- */

  function wrongList() {
    var out = [];
    for (var en in progress.wrong) {
      if (Object.prototype.hasOwnProperty.call(progress.wrong, en)) {
        var w = DATA.findWord(en);
        if (w) out.push({ word: w, count: progress.wrong[en] });
      }
    }
    out.sort(function (a, b) { return b.count - a.count; });
    return out;
  }

  /* ---------------- 成长勋章（§11.3，规则在此实现） ---------------- */

  function badgeValue(rule) {
    switch (rule) {
      case 'stages':   return totalStageDone();
      case 'learned':  return progress.learned.length;
      case 'star3':    return totalStars() >= 3 ? 1 : 0;
      case 'speak':    return progress.speak;
      case 'rhymes':   return progress.rhymes.length;
      case 'stories':  return progress.stories.length;
      case 'gems':     return progress.gemsTotal;
      case 'perfect':  return progress.lessons.some(function (l) {
                         return l.total > 0 && l.score >= l.total;
                       }) ? 1 : 0;
      case 'house':    return progress.house.owned.length;
      case 'streak':   return DATA.profile.streakDays;
      case 'y1':       return DATA.unitsByLevel('Y1').filter(function (u) {
                         return stageRecord(u.id).practice;
                       }).length;
      default:         return 0;
    }
  }

  /** 全部勋章 + 是否已获得（earned 为实时判定，不依赖落盘） */
  function badges() {
    return DATA.badges.map(function (b) {
      var val = badgeValue(b.rule);
      return {
        id: b.id, name: b.name, desc: b.desc, rule: b.rule,
        c1: b.c1, c2: b.c2,
        need: b.need,
        value: Math.min(val, b.need),
        earned: val >= b.need
      };
    });
  }

  function earnedBadges() {
    return badges().filter(function (b) { return b.earned; });
  }

  /* ---------------- 报告（mock 基线 + 真实进度修正） ---------------- */

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
    r.gems = progress.gems;
    r.gemsTotal = progress.gemsTotal;
    r.badges = earnedBadges().length;
    r.totalBadges = DATA.badges.length;
    r.stagesDone = totalStageDone();
    r.stagesTotal = DATA.units.length * DATA.STAGES.length;
    r.wrongCount = wrongList().length;
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

    /* v3 */
    stageRecord: stageRecord,
    stageDoneCount: stageDoneCount,
    unitPercent: unitPercent,
    nextStage: nextStage,
    wrongList: wrongList,
    badges: badges,
    earnedBadges: earnedBadges,

    getUnits: function () { return Promise.resolve(DATA.units); },
    getRhymes: function () { return Promise.resolve(DATA.rhymes); },
    getStories: function () { return Promise.resolve(DATA.stories); },
    getProfile: function () { return Promise.resolve(DATA.profile); },
    getReport: function () { return Promise.resolve(buildReport()); },
    getLessons: function () { return Promise.resolve(progress.lessons.slice().reverse()); },

    /** 标记单词已学 */
    markLearned: function (word) {
      if (pushUnique(progress.learned, word)) return persist();
      return Promise.resolve(false);
    },

    /** 记一次错（错词本 +1） */
    markWrong: function (word) {
      progress.wrong[word] = (progress.wrong[word] || 0) + 1;
      return persist();
    },

    /** 错词答对：把累计错误次数减一，归零即移出错词本 */
    clearWrong: function (word) {
      if (!progress.wrong[word]) return Promise.resolve(false);
      progress.wrong[word] -= 1;
      if (progress.wrong[word] <= 0) delete progress.wrong[word];
      return persist();
    },

    /** 记一次跟读完成（勋章用） */
    markSpeak: function () {
      progress.speak += 1;
      return persist();
    },

    /** 记一次闯关结果（沿用 v1 语义） */
    recordQuiz: function (unitId, result) {
      var rec = progress.units[unitId] || { stars: 0, best: 0, plays: 0 };
      rec.stars = Math.max(rec.stars, result.stars || 0);
      rec.best = Math.max(rec.best, result.score || 0);
      rec.plays += 1;
      progress.units[unitId] = rec;
      return persist();
    },

    /** 标记某单元某环节完成，并写入逐课报告 */
    completeStage: function (unitId, stageId, result) {
      if (!progress.stages[unitId]) progress.stages[unitId] = {};
      progress.stages[unitId][stageId] = true;

      var res = result || {};
      progress.lessons.push({
        unitId: unitId,
        stage: stageId,
        game: res.game || '',
        score: res.score || 0,
        total: res.total || 0,
        stars: res.stars || 0,
        at: Date.now()
      });
      /* 只保留最近 60 条，避免 localStorage 无限增长 */
      if (progress.lessons.length > 60) {
        progress.lessons = progress.lessons.slice(progress.lessons.length - 60);
      }
      return persist();
    },

    /** 加魔石 */
    addGems: function (n) {
      var v = Math.max(0, n || 0);
      progress.gems += v;
      progress.gemsTotal += v;
      return persist();
    },

    /** 买小屋道具（魔石不足则拒绝） */
    buyHouseItem: function (id) {
      var item = DATA.getHouseItem(id);
      if (!item) return Promise.resolve({ ok: false, reason: 'notfound' });
      if (progress.house.owned.indexOf(id) >= 0) return Promise.resolve({ ok: false, reason: 'owned' });
      if (progress.gems < item.cost) return Promise.resolve({ ok: false, reason: 'poor' });

      progress.gems -= item.cost;
      progress.house.owned.push(id);
      progress.house.placed[item.slot] = id;   // 买到即自动摆上，降低操作成本
      return persist().then(function () { return { ok: true }; });
    },

    /** 摆放已购道具（同一 slot 只保留一件） */
    placeHouseItem: function (itemId, slotId) {
      if (progress.house.owned.indexOf(itemId) < 0) {
        return Promise.resolve({ ok: false, reason: 'notowned' });
      }
      progress.house.placed[slotId] = itemId;
      return persist().then(function () { return { ok: true }; });
    },

    markRhymeHeard: function (id) {
      if (pushUnique(progress.rhymes, id)) return persist();
      return Promise.resolve(false);
    },

    markStoryRead: function (id) {
      if (pushUnique(progress.stories, id)) return persist();
      return Promise.resolve(false);
    },

    /** 把实时判定达成的勋章补记进 progress.badges，返回本次新获得的勋章 */
    syncBadges: function () {
      var fresh = [];
      earnedBadges().forEach(function (b) {
        if (progress.badges.indexOf(b.id) < 0) {
          progress.badges.push(b.id);
          fresh.push(b);
        }
      });
      if (fresh.length) persist();
      return Promise.resolve(fresh);
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
