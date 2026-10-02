/* ==========================================================
   瓜瓜英语 · 语音模块
   ----------------------------------------------------------
   发音：浏览器内置语音合成（Web Speech Synthesis），免费、无需联网音频资源。
   跟读：三级降级策略，保证任何设备都有可用体验
         A 级 recognize —— 系统语音识别，真实评测打分
         B 级 record    —— 录音回放，孩子自己对比
         C 级 manual    —— 无麦克风权限时，听→读→自评
   注意：浏览器只允许在「安全上下文」下使用麦克风，
        即 https:// 或 http://localhost。手机通过局域网 IP 以
        http:// 访问时，会自动降级到 C 级。
   ========================================================== */

(function (global) {
  'use strict';

  var SR = global.SpeechRecognition || global.webkitSpeechRecognition;
  var synth = global.speechSynthesis;

  var enVoices = [];
  var voiceTimer = null;

  var PREFERRED = ['samantha', 'zira', 'aria', 'jenny', 'google us english', 'microsoft aria'];

  function refreshVoices() {
    if (!synth) return;
    try {
      var all = synth.getVoices() || [];
      enVoices = all.filter(function (v) { return /^en/i.test(v.lang || ''); });
    } catch (e) {
      enVoices = [];
    }
  }

  if (synth) {
    refreshVoices();
    if (typeof synth.addEventListener === 'function') {
      synth.addEventListener('voiceschanged', refreshVoices);
    } else {
      synth.onvoiceschanged = refreshVoices;
    }
    // 部分浏览器首次 getVoices() 返回空，稍后重试几轮
    voiceTimer = setInterval(function () {
      refreshVoices();
      if (enVoices.length) clearInterval(voiceTimer);
    }, 400);
    setTimeout(function () { clearInterval(voiceTimer); }, 4000);
  }

  function bestVoice() {
    if (!enVoices.length) refreshVoices();
    if (!enVoices.length) return null;
    var us = enVoices.filter(function (v) { return /^en[-_]US/i.test(v.lang || ''); });
    var pool = us.length ? us : enVoices;
    for (var i = 0; i < PREFERRED.length; i++) {
      for (var j = 0; j < pool.length; j++) {
        if ((pool[j].name || '').toLowerCase().indexOf(PREFERRED[i]) >= 0) return pool[j];
      }
    }
    return pool[0];
  }

  /* ---------------- 发音 ---------------- */
  function speak(text, opts) {
    opts = opts || {};
    return new Promise(function (resolve) {
      if (!synth || !text) return resolve(false);

      var settled = false;
      var guard = null;
      function finish(ok) {
        if (settled) return;
        settled = true;
        if (guard) clearTimeout(guard);
        resolve(ok);
      }

      try { synth.cancel(); } catch (e) { /* 忽略 */ }

      var u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      var v = bestVoice();
      if (v) u.voice = v;
      u.rate = opts.rate || 0.82;   // 儿童语速放慢
      u.pitch = opts.pitch || 1.06;
      u.volume = 1;
      u.onend = function () { finish(true); };
      u.onerror = function () { finish(false); };

      // 兜底：部分浏览器 onend 不触发，按文本长度估算
      guard = setTimeout(function () { finish(true); }, Math.max(2200, text.length * 300));

      // cancel() 后立刻 speak 有概率被吞掉，延后一帧
      setTimeout(function () {
        try { synth.speak(u); } catch (e) { finish(false); }
      }, 60);
    });
  }

  function stop() {
    if (synth) { try { synth.cancel(); } catch (e) { /* 忽略 */ } }
  }

  /* ---------------- 能力探测 ---------------- */
  function secure() {
    return global.isSecureContext !== false;
  }

  function canRecognize() {
    return !!SR && secure();
  }

  function canRecord() {
    return secure() &&
      !!(global.MediaRecorder && global.navigator &&
         global.navigator.mediaDevices &&
         global.navigator.mediaDevices.getUserMedia);
  }

  /** 'recognize' | 'record' | 'manual' */
  function mode() {
    if (canRecognize()) return 'recognize';
    if (canRecord()) return 'record';
    return 'manual';
  }

  /* ---------------- 跟读：语音识别 ---------------- */
  function recognize(timeout) {
    return new Promise(function (resolve) {
      if (!canRecognize()) return resolve({ ok: false, reason: 'unsupported' });

      var rec;
      try {
        rec = new SR();
      } catch (e) {
        return resolve({ ok: false, reason: 'unsupported' });
      }

      rec.lang = 'en-US';
      rec.interimResults = false;
      rec.maxAlternatives = 3;
      rec.continuous = false;

      var settled = false;
      var timer = null;
      function finish(res) {
        if (settled) return;
        settled = true;
        if (timer) clearTimeout(timer);
        try { rec.abort(); } catch (e) { /* 忽略 */ }
        resolve(res);
      }

      timer = setTimeout(function () { finish({ ok: false, reason: 'timeout' }); }, timeout || 7000);

      rec.onresult = function (e) {
        var alts = e.results && e.results[0];
        var list = [];
        if (alts) {
          for (var i = 0; i < alts.length; i++) {
            list.push((alts[i].transcript || '').trim());
          }
        }
        finish({ ok: true, transcript: list[0] || '', all: list });
      };
      rec.onerror = function (e) { finish({ ok: false, reason: (e && e.error) || 'error' }); };
      rec.onend = function () { finish({ ok: false, reason: 'no-speech' }); };

      try {
        rec.start();
      } catch (e) {
        finish({ ok: false, reason: 'start-failed' });
      }
    });
  }

  /* ---------------- 跟读：录音回放 ---------------- */
  function stopTracks(stream) {
    try {
      stream.getTracks().forEach(function (t) { t.stop(); });
    } catch (e) { /* 忽略 */ }
  }

  function record(ms) {
    return new Promise(function (resolve) {
      if (!canRecord()) return resolve({ ok: false, reason: 'unsupported' });

      global.navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
        var chunks = [];
        var mr;
        try {
          mr = new global.MediaRecorder(stream);
        } catch (e) {
          stopTracks(stream);
          return resolve({ ok: false, reason: 'unsupported' });
        }

        mr.ondataavailable = function (e) {
          if (e.data && e.data.size) chunks.push(e.data);
        };
        mr.onstop = function () {
          stopTracks(stream);
          try {
            var type = chunks[0] ? chunks[0].type : 'audio/webm';
            var blob = new Blob(chunks, { type: type });
            resolve({ ok: true, url: URL.createObjectURL(blob) });
          } catch (e) {
            resolve({ ok: false, reason: 'encode-failed' });
          }
        };

        try {
          mr.start();
        } catch (e) {
          stopTracks(stream);
          return resolve({ ok: false, reason: 'start-failed' });
        }

        setTimeout(function () {
          try { if (mr.state !== 'inactive') mr.stop(); } catch (e) { /* 忽略 */ }
        }, ms || 2200);

      }).catch(function (err) {
        resolve({ ok: false, reason: (err && err.name) || 'denied' });
      });
    });
  }

  /** 录音回放结束后释放 blob，避免内存泄漏 */
  function release(url) {
    if (url) { try { URL.revokeObjectURL(url); } catch (e) { /* 忽略 */ } }
  }

  /* ---------------- 跟读结果比对 ---------------- */
  function normalize(s) {
    return String(s || '')
      .toLowerCase()
      .replace(/[^a-z\s']/g, ' ')
      .split(/\s+/)
      .filter(Boolean);
  }

  function levenshtein(a, b) {
    var m = a.length, n = b.length;
    if (!m) return n;
    if (!n) return m;
    var prev = [];
    var cur = [];
    var i, j;
    for (j = 0; j <= n; j++) prev[j] = j;
    for (i = 1; i <= m; i++) {
      cur[0] = i;
      for (j = 1; j <= n; j++) {
        var cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      }
      for (j = 0; j <= n; j++) prev[j] = cur[j];
    }
    return prev[n];
  }

  function similarity(a, b) {
    var max = Math.max(a.length, b.length);
    if (!max) return 0;
    return 1 - levenshtein(a, b) / max;
  }

  /**
   * 比对孩子读的内容与目标单词
   * @returns {{score:number, level:'perfect'|'close'|'try'}}
   */
  function evaluate(spoken, target) {
    var t = normalize(target);
    if (!t.length) return { score: 0, level: 'try' };

    var saidWordSets = normalize(spoken);
    var best = 0;

    for (var i = 0; i < t.length; i++) {
      var targetWord = t[i];
      // 逐词找最相似的一个
      for (var j = 0; j < saidWordSets.length; j++) {
        if (saidWordSets[j] === targetWord) { best = Math.max(best, 1); continue; }
        var sim = similarity(saidWordSets[j], targetWord);
        if (sim >= 0.7) best = Math.max(best, sim * 0.9);
      }
    }

    if (!saidWordSets.length) return { score: 0, level: 'try' };
    if (best >= 0.99) return { score: 1, level: 'perfect' };
    if (best >= 0.6) return { score: best, level: 'close' };
    return { score: best, level: 'try' };
  }

  global.GuaguaSpeech = {
    speak: speak,
    stop: stop,
    mode: mode,
    canRecognize: canRecognize,
    canRecord: canRecord,
    recognize: recognize,
    record: record,
    release: release,
    evaluate: evaluate,
    supported: !!synth
  };

})(window);