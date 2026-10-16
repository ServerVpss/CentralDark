/* Instinto Superior: fallback PUBLICO; nunca armazena sessao, API, HUD ou respostas privadas.
 * Contrato: SOURCE_OFFLINE_SHELL != AUTHENTICATED_OFFLINE_APP != RUNTIME_PROVEN.
 */
const CACHE_NAMESPACE = "centraldark-instinto-offline-shell-";
const SHELL_CACHE = CACHE_NAMESPACE + "v1";
const OFFLINE_PAGE = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      cache.add(new Request(OFFLINE_PAGE, { cache: "reload" }))
    )
  );
  // Nao usar skipWaiting: preservar outras sessoes e seus controladores.
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys
        .filter((key) => key.startsWith(CACHE_NAMESPACE) && key !== SHELL_CACHE)
        .map((key) => caches.delete(key)))
    )
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || request.mode !== "navigate") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname !== "/") return;
  event.respondWith(
    fetch(request).catch(async () => {
      const cached = await caches.open(SHELL_CACHE);
      return (await cached.match(OFFLINE_PAGE)) || Response.error();
    })
  );
  // Nao armazenar respostas HTTP, cookies, HTML autenticado ou payloads.
  // /auth, /cockpit, /sala-controle, /api e demais rotas nao sao interceptadas.
});
