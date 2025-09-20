const CACHE_NAME = 'greenledger-v1';
const OFFLINE_CACHE = 'greenledger-offline-v1';

const STATIC_ASSETS = [
  '/',
  '/qr',
  '/verify',
  '/manifest.json',
  '/greenledger-logo.svg'
];

const VERIFICATION_CACHE = 'verification-cache-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS)),
      caches.open(OFFLINE_CACHE).then(cache => cache.add('/offline.html'))
    ])
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheName.startsWith('greenledger-')) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Handle verification requests
  if (request.url.includes('/api/verify/')) {
    event.respondWith(handleVerificationRequest(request));
    return;
  }
  
  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }
  
  // Handle other requests
  event.respondWith(
    caches.match(request).then(response => {
      return response || fetch(request).catch(() => {
        return caches.match('/offline.html');
      });
    })
  );
});

async function handleVerificationRequest(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(VERIFICATION_CACHE);
    cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response(JSON.stringify({
      error: 'Offline - verification unavailable',
      offline: true
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handleNavigationRequest(request) {
  try {
    return await fetch(request);
  } catch (error) {
    const cache = await caches.open(CACHE_NAME);
    return cache.match('/') || cache.match('/offline.html');
  }
}