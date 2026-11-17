const CACHE_NAME = "jm-cashout-v1";
const APP_ROOT = new URL("./", self.registration.scope).href;
const APP_SHELL = [
  APP_ROOT,
  new URL("manifest.webmanifest", APP_ROOT).href,
  new URL("icons/jm-cashout.svg", APP_ROOT).href,
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((cacheName) => cacheName.startsWith("jm-cashout-") && cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName)),
      ),
    ),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const cachedResponse = response.clone();
          event.waitUntil(
            caches.open(CACHE_NAME).then((cache) => cache.put(request, cachedResponse)),
          );
          return response;
        })
        .catch(async () => {
          const cachedPage = await caches.match(request);
          if (cachedPage) return cachedPage;

          const appShell = await caches.match(APP_ROOT);
          if (appShell) return appShell;
          throw new Error("No hay una copia sin conexión de la aplicación.");
        }),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(request).then((response) => {
        if (response.ok) {
          const cachedResponse = response.clone();
          event.waitUntil(
            caches.open(CACHE_NAME).then((cache) => cache.put(request, cachedResponse)),
          );
        }
        return response;
      });
    }),
  );
});
