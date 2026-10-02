/* ==========================================================
   瓜瓜英语 · 音频层
   见 .design-contract.md §8

   解析顺序（每一层失败自动降级到下一层）：
     1. 真人配音 mp3 —— assets/audio/<键>.mp3，需在 assets/audio/manifest.js 登记
     2. 浏览器语音合成 —— js/speech.js（Web Speech Synthesis）
     3. 静默失败 —— 返回 'none'，视图层给出文字提示

   同时向上层暴露麦克风跟读能力（三级降级），视图只需调用 GuaguaAudio。
   ========================================================== */

(function (global) {
  'use strict';

  var Speech = global.GuaguaSpeech;
  var MANIFEST = global.GUAGUA_AUDIO_MANIFEST || { en: {}, sen: {} };

  var WORD_DIR = 'assets/audio/en/';
  var SEN_DIR = 'assets/audio/sen/';

  var currentEl = null;

  /* ---------------- 清单查询 ---------------- */

  function manifestFor(kind) {
    var m = MANIFEST[kind];
    return m && typeof m === 'object' ? m : {};
  }

  function fileForWord(key) {
    var f = manifestFor('en')[key];
    return f ? WORD_DIR + f : null;
  }

  function fileForSentence(text) {
    var f = manifestFor('sen')[text];
    return f ? SEN_DIR + f : null;
  }

  /** 单词是否有真人配音 */
  function source(key) {
    return fileForWord(key) ? 'real' : 'tts';
  }

  /** 真人配音覆盖率（家长中心用） */
  function coverage() {
    var words = global.GUAGUA_DATA.allWords();
    var real = 0;
    words.forEach(function (w) { if (source(w.en) === 'real') real++; });
    return {
      real: real,
      total: words.length,
      percent: words.length ? Math.round((real / words.length) * 100) : 0
    };
  }

  /* ---------------- 播放 ---------------- */

  function stop() {
    if (currentEl) {
      try { currentEl.pause(); } catch (e) { /* 忽略 */ }
      currentEl = null;
    }
    if (Speech) Speech.stop();
  }

  function playFile(src) {
    return new Promise(function (resolve) {
      var el;
      try { el = new global.Audio(src); } catch (e) { return resolve(false); }

      currentEl = el;
      var settled = false;
      var guard = null;

      function finish(ok) {
        if (settled) return;
        settled = true;
        if (guard) clearTimeout(guard);
        if (currentEl === el) currentEl = null;
        resolve(ok);
      }

      el.onended = function () { finish(true); };
      // 文件缺失 / 解码失败 / 加载失败 → 交给上一层回退
      el.onerror = function () { finish(false); };
      guard = setTimeout(function () { finish(true); }, 8000);

      var p = el.play();
      if (p && typeof p.catch === 'function') {
        p.catch(function () { finish(false); });
      }
    });
  }

  function speakFallback(text, opts) {
    if (!Speech) return Promise.resolve('none');
    return Speech.speak(text, opts).then(function (ok) {
      return ok ? 'tts' : 'none';
    });
  }

  /**
   * 播放一个单词
   * @param {string} key  单词（小写），用于查清单
   * @param {string} text 交给 TTS 朗读的文本
   * @param {{rate?:number}} opts
   * @returns {Promise<'real'|'tts'|'none'>}
   */
  function play(key, text, opts) {
    stop();
    var src = fileForWord(key);
    if (!src) return speakFallback(text || key, opts);
    return playFile(src).then(function (ok) {
      return ok ? 'real' : speakFallback(text || key, opts);
    });
  }

  /**
   * 播放一句英文
   * @returns {Promise<'real'|'tts'|'none'>}
   */
  function playSentence(text, opts) {
    stop();
    opts = opts || {};
    var o = { rate: opts.rate || 0.78, pitch: opts.pitch || 1.06 };
    var src = fileForSentence(text);
    if (!src) return speakFallback(text, o);
    return playFile(src).then(function (ok) {
      return ok ? 'real' : speakFallback(text, o);
    });
  }

  /** 预加载真人配音文件，避免首次播放延迟（只预热已登记的） */
  function preload(keys) {
    keys.forEach(function (k) {
      var src = fileForWord(k);
      if (!src) return;
      try { new global.Audio(src).preload = 'auto'; } catch (e) { /* 忽略 */ }
    });
  }

  /* ---------------- 麦克风跟读（透传 speech.js） ---------------- */

  var mic = {
    mode: function () { return Speech ? Speech.mode() : 'manual'; },
    canRecognize: function () { return Speech ? Speech.canRecognize() : false; },
    canRecord: function () { return Speech ? Speech.canRecord() : false; },
    recognize: function (t) { return Speech ? Speech.recognize(t) : Promise.resolve({ ok: false, reason: 'unsupported' }); },
    record: function (ms) { return Speech ? Speech.record(ms) : Promise.resolve({ ok: false, reason: 'unsupported' }); },
    evaluate: function (spoken, target) {
      return Speech ? Speech.evaluate(spoken, target) : { score: 0, level: 'try' };
    },
    release: function (url) { if (Speech) Speech.release(url); }
  };

  global.GuaguaAudio = {
    play: play,
    playSentence: playSentence,
    source: source,
    coverage: coverage,
    preload: preload,
    stop: stop,
    mic: mic,
    ttsSupported: !!(Speech && Speech.supported)
  };

})(window);