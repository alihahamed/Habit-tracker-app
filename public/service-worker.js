// 1. Import Workbox from Google's CDN
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

// This is a good practice to ensure the new service worker activates immediately
workbox.core.skipWaiting();
workbox.core.clientsClaim();

// 2. Pre-caching (for the main app shell)
// Workbox will automatically cache these files on install.
// The 'revision' property helps Workbox know when to update a file if it changes.
workbox.precaching.precacheAndRoute([
  { url: '/', revision: '1' },
  { url: '/styles.css', revision: '1' },
  { url: '/script.js', revision: '1' },
  { url: '/manifest.json', revision: '1' } // <-- ADD THIS LINE
]);

// 3. Runtime Caching Strategies
// This is where Workbox really shines. We can set up different rules for different types of files.

// Strategy for CSS, JS, and other static assets: StaleWhileRevalidate
// Fast, and keeps assets up-to-date in the background.
workbox.routing.registerRoute(
  ({ request }) => request.destination === 'style' || request.destination === 'script',
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'static-resources',
  })
);

// Strategy for images: CacheFirst
// Once an image is cached, it's served from the cache. Good for performance.
workbox.routing.registerRoute(
  ({ request }) => request.destination === 'image',
  new workbox.strategies.CacheFirst({
    cacheName: 'images',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 60, // Max 60 images
        maxAgeSeconds: 30 * 24 * 60 * 60, // Cache for 30 Days
      }),
    ],
  })
);

// Strategy for pages (HTML): NetworkFirst
// Ensures users get the latest page, but provides an offline fallback from the cache.
workbox.routing.registerRoute(
  ({ request }) => request.destination === 'document',
  new workbox.strategies.NetworkFirst({
    cacheName: 'pages',
  })
);