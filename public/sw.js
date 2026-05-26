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

// Interceptação de requisições: Network First para documentos (Páginas), Cache First para assets
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

  // Lógica Network First para páginas HTML/Navegação
  if (event.request.mode === "navigate" || event.request.destination === "document") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // Se estiver offline, retorna do cache
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Fallback para a raiz se não achar a página no cache
            return caches.match("/");
          });
        })
    );
    return;
  }

  // Lógica Cache First para assets estáticos (scripts, CSS, imagens, fontes)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((response) => {
          // Cacheia de forma dinâmica apenas assets válidos
          if (
            response.status === 200 &&
            (event.request.destination === "script" ||
              event.request.destination === "style" ||
              event.request.destination === "image" ||
              event.request.destination === "font")
          ) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        });
    })
  );
});
