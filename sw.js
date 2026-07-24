// Self-unregistering service worker.
// Previous sw.js used SPA fallback (serving index.html for all navigations),
// which broke standalone entry points like demo.html.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', async () => {
  await self.registration.unregister();
  const keys = await caches.keys();
  await Promise.all(keys.map(k => caches.delete(k)));
});
