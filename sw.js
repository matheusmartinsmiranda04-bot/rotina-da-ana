/* Rotina da Ana — service worker: guarda os arquivos do app para funcionar offline.
   Ao publicar uma nova versão, aumente o número em CACHE. Dados pessoais NUNCA passam por aqui
   (ficam no localStorage do navegador). */
const CACHE = 'rotina-da-ana-v1';
const SHELL = [
  './', './index.html', './css/app.css', './manifest.webmanifest',
  './js/core.js', './js/store.js', './js/charts.js', './js/art.js', './js/editors.js', './js/app.js',
  './js/views/inicio.js', './js/views/calendario.js', './js/views/tarefas.js', './js/views/eventos.js',
  './js/views/treinos.js', './js/views/alimentacao.js', './js/views/relatorios.js', './js/views/configuracoes.js',
  './icons/icon.svg', './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // o arquivo de dados iniciais é pessoal: nunca vai para o cache
  if (url.pathname.includes('/dados-iniciais/')) return;
  if (url.origin === location.origin) {
    // rede primeiro (pega atualizações), cache como reserva offline
    e.respondWith(fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('./index.html'))));
  } else if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    // fontes: cache primeiro
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res; }).catch(() => new Response('', { status: 503 }))));
  }
});
