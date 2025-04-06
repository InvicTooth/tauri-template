/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;
export { };
import { build, files, version } from '$service-worker';
import { syncWithServer } from './lib/stores/sync-queue.js';

// Create a unique cache name for this deployment
const CACHE = `cache-${version}`;

const ASSETS = [
  ...build, // the app itself
  ...files  // everything in `static`
];

self.onmessage = (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING')
    self.skipWaiting()
};

self.oninstall = event => {
  // Create a new cache and add all files to it
  async function addFilesToCache() {
    const cache = await caches.open(CACHE);
    await cache.addAll(ASSETS);
  }

  event.waitUntil(addFilesToCache());
};

self.onactivate = event => {
  // Remove previous cached data from disk
  async function deleteOldCaches() {
    for (const key of await caches.keys()) {
      if (key !== CACHE) await caches.delete(key);
    }
  }

  event.waitUntil(deleteOldCaches());
};

self.onfetch = event => {
  // ignore POST requests etc
  if (event.request.method !== 'GET') return;

  async function respond() {
    const url = new URL(event.request.url);
    const cache = await caches.open(CACHE);

    // `build`/`files` can always be served from the cache
    if (ASSETS.includes(url.pathname)) {
      const response = await cache.match(url.pathname);

      if (response) {
        return response;
      }
    }

    // for everything else, try the network first, but
    // fall back to the cache if we're offline
    try {
      const response = await fetch(event.request);

      // if we're offline, fetch can return a value that is not a Response
      // instead of throwing - and we can't pass this non-Response to respondWith
      if (!(response instanceof Response)) {
        throw new Error('invalid response from fetch');
      }

      if (response.status === 200) {
        cache.put(event.request, response.clone());
      }

      return response;
    } catch (err) {
      const response = await cache.match(event.request);

      if (response) {
        return response;
      }

      // if there's no cache, then just error out
      // as there is nothing we can do to respond to this request
      throw err;
    }
  }

  event.respondWith(respond());
};

self.onpush = event => {
  const data = event.data?.json() || { title: '🔔 새 알림', body: '뭔가 도착했어요.', url: '/' };

  self.registration.showNotification(data.title, {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    data: { url: data.url },
  });

  // Broadcast to app
  self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then(clients => {
    for (const client of clients) {
      client.postMessage({ type: 'NEW_NOTIFICATION', payload: data });
    }
  });
};

self.onnotificationclick = event => {
  event.notification.close();

  const urlToOpen = event.notification?.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }

      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
};

self.addEventListener('sync', (event: any) => {
  console.log('[SW] 📦 sync event received:', event.tag);
  switch (event.tag) {
    case 'sync-queue':
      event.waitUntil(syncWithServer());
      break;
    default:
      console.warn('[SW] Unknown sync event:', event.tag);
      break;
  }
});

self.addEventListener('periodicsync', (event: any) => {
  console.log('[SW] 📦 periodicsync event received:', event.tag);
  switch (event.tag) {
    case 'periodic-sync-queue':
      event.waitUntil(syncWithServer());
      break;
    default:
      console.warn('[SW] Unknown periodic sync event:', event.tag);
      break;
  }
});
