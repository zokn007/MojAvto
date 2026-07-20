const CACHE_VERSION='mojavto-local-1.6.0';
const ASSETS=['./','./index.html','./manifest.json','./cloud-sync.js','./update-manager.js','./version.json','./mojavto-icon.jpeg','./peugeot-508-sw.jpg','./dg-smart-apps.png','./icon.png','./icon.svg'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE_VERSION).then(cache=>Promise.allSettled(ASSETS.map(asset=>cache.add(asset)))).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE_VERSION).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET') return;
 const url=new URL(event.request.url);
 if(url.origin!==self.location.origin) return;
 const isNavigation=event.request.mode==='navigate';
 const isFresh=/\/(index\.html|version\.json|sw\.js|update-manager\.js)$/.test(url.pathname)||isNavigation;
 if(isFresh){event.respondWith(fetch(event.request,{cache:'no-store'}).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE_VERSION).then(cache=>cache.put(event.request,copy));}return response;}).catch(()=>caches.match(event.request).then(cached=>cached||caches.match('./index.html'))));return;}
 event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE_VERSION).then(cache=>cache.put(event.request,copy));}return response;})));
});
self.addEventListener('message',event=>{if(event.data&&event.data.type==='SKIP_WAITING')self.skipWaiting();});
