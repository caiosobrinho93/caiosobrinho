const CACHE_NAME = "nexus-vault-cache-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/icon.svg",
];

// Instalação: Cacheia a estrutura base e o ícone
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Ativação: Limpa caches antigos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interceptação de requisições: Cache First para assets, Network First para o resto
self.addEventListener("fetch", (event) => {
  // Ignora requisições de APIs externas (Supabase), internas (/api) ou do Chrome Extensions
  if (
    event.request.url.includes("/api/") ||
    event.request.url.includes("supabase.co") ||
    !event.request.url.startsWith(self.location.origin) ||
    event.request.method !== "GET"
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Retorna do cache se encontrar
        return cachedResponse;
      }

      return fetch(event.request)
        .then((response) => {
          // Cacheia de forma dinâmica apenas assets estáticos seguros
          if (
            response.status === 200 &&
            (event.request.destination === "document" ||
              event.request.destination === "script" ||
              event.request.destination === "style" ||
              event.request.destination === "image")
          ) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback se estiver completamente offline e for navegação de página
          if (event.request.mode === "navigate") {
            return caches.match("/");
          }
        });
    })
  );
});
