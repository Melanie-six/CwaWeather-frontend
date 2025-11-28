// 1. 修改版本號 (這是關鍵，改了瀏覽器才會更新)
const CACHE_NAME = 'candy-weather-v2'; 

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192x192.png',
  './icon-512x512.png',
  './body-bg.png' 
];

self.addEventListener('install', (event) => {
  // 強制立即接管頁面 (跳過等待)
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

// 新增：Activate 事件 (用來刪除舊的快取 v1)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // 如果發現快取名稱不是現在的版本 (v2)，就把它刪掉
          if (cacheName !== CACHE_NAME) {
            console.log('刪除舊快取:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // 讓新的 SW 立即接管所有頁面
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // API 請求通常不建議快取 (因為天氣會變)，或者要用不同的策略
  // 這裡簡單判斷：如果是 API 網址，就不要讀快取，直接聯網
  if (event.request.url.includes('/api/')) {
      return; // 直接回傳 undefined，讓瀏覽器走預設網路請求
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});