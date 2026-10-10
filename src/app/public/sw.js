/* ============================================================
   FILE: public/sw.js   (NEW)   - the service worker
   What it does:
   - Keeps the app's files (scripts, styles, icons) on the phone, so the app
     opens fast and still opens with a weak or no signal.
   - Pages: always asks the internet first; with no internet it shows the copy
     saved the last time the page was opened, or public/offline.html.
   - It never touches Firebase (sign-in and the leads data). The leads are kept
     on the phone by Firestore itself (see lib/firebase.ts).
   To make every phone drop its old copies, change VERSION and deploy.
   ============================================================ */

const VERSION = "gfi-v1";
const STATIC_CACHE = `${VERSION}-static`;
const PAGE_CACHE = `${VERSION}-pages`;
const OFFLINE_URL = "/offline.html";

const PRECACHE = [OFFLINE_URL, "/icons/icon-192.png", "/icons/icon-512.png", "/icons/apple-touch-icon.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) => Promise.all(names.filter((n) => !n.startsWith(VERSION)).map((n) => caches.delete(n))))
      .then(() => self.clients.claim()),
  );
});

/** Files whose name changes with every build: safe to keep forever. */
function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    /\.(?:png|jpg|jpeg|svg|ico|webp|woff2?)$/.test(url.pathname)
  );
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(STATIC_CACHE);
    cache.put(request, response.clone());
  }
  return response;
}

async function pageNetworkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok && response.type === "basic") {
      const cache = await caches.open(PAGE_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const saved = await caches.match(request, { ignoreSearch: true });
    return saved || (await caches.match(OFFLINE_URL)) || Response.error();
  }
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  // Firebase, Google sign-in and every other site: leave them alone
  if (url.origin !== self.location.origin) return;

  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Next.js page data fetched while you move between pages: let it go to the network.
  // With no internet, Next.js then loads the whole page, which is answered below.
  if (request.headers.get("RSC") === "1" || url.searchParams.has("_rsc")) return;

  if (request.mode === "navigate") {
    event.respondWith(pageNetworkFirst(request));
  }
});