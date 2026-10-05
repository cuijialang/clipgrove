/* ==========================================================
   瓜瓜英语 · Service Worker
   作用：让站点成为可安装的 PWA，并支持断网打开、二次访问秒开
   策略：
     1) 安装时预缓存 App Shell（HTML / CSS / JS / 图标）
     2) 导航请求走「网络优先」，断网回退到缓存的 index.html
     3) 其余同源资源走「stale-while-revalidate」（先给缓存，再后台更新）
   注意：Service Worker 只在 https 或 localhost 下生效，file:// 打开时自动跳过
   ========================================================== */

const VERSION = 'guagua-v3-1';
const SHELL_CACHE = VERSION + '-shell';
const RUNTIME_CACHE = VERSION + '-runtime';

/* App Shell：首屏渲染必需的文件，安装时一次性预缓存 */
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/tokens.css',
  './css/base.css',
  './css/views.css',
  './js/data.js',
  './assets/audio/manifest.js',
  './js/api.js',
  './js/speech.js',
  './js/audio.js',
  './js/ui.js',
  './js/app.js',
  './js/games/registry.js',
  './js/games/listen-pick.js',
  './js/games/pick-word.js',
  './js/games/speak-word.js',
  './js/games/pair.js',
  './js/games/trace.js',
  './js/games/puzzle.js',
  './js/games/bubble.js',
  './js/games/match-line.js',
  './js/games/spot-diff.js',
  './js/games/phonics.js',
  './js/games/roleplay.js',
  './js/games/host.js',
  './js/views/home.js',
  './js/views/courses.js',
  './js/views/unit.js',
  './js/views/warm.js',
  './js/views/listen.js',
  './js/views/me.js',
  './js/views/learn.js',
  './js/views/quiz.js',
  './js/views/result.js',
  './js/views/story.js',
  './js/views/parent.js',
  './js/views/house.js',
  './js/views/badges.js',
  './js/views/wrongbook.js',
  './assets/img/app/icon-192.png',
  './assets/img/app/icon-512.png'
];

/* 逐个缓存：任何一个失败都不至于让整个安装流程崩掉 */
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(function (cache) {
      return Promise.all(
        SHELL.map(function (url) {
          return cache.add(url).catch(function () { /* 缺文件不影响安装 */ });
        })
      );
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

/* 激活时清掉旧版本缓存 */
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.map(function (key) {
          if (key !== SHELL_CACHE && key !== RUNTIME_CACHE) {
            return caches.delete(key);
          }
        })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function (event) {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; /* 跨域交给浏览器默认处理 */

  /* 导航请求：网络优先，断网回退缓存首页 */
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then(function (res) {
        const copy = res.clone();
        caches.open(SHELL_CACHE).then(function (c) { c.put('./index.html', copy); });
        return res;
      }).catch(function () {
        return caches.match('./index.html').then(function (hit) {
          return hit || caches.match('./');
        });
      })
    );
    return;
  }

  /* 其他同源资源：先给缓存，同时后台拉新（stale-while-revalidate） */
  event.respondWith(
    caches.match(req).then(function (cached) {
      const network = fetch(req).then(function (res) {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(RUNTIME_CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      }).catch(function () {
        return cached;
      });
      return cached || network;
    })
  );
});