const C='catatan-akun-v3';
self.addEventListener('install',e=>e.waitUntil(caches.open(C).then(c=>c.addAll(['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png'])).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C&&x!=='prefs').map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==location.origin)return;
e.respondWith(fetch(e.request,{cache:'no-cache'}).then(r=>{const c=r.clone();caches.open(C).then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match('index.html'))))});
async function remind(){const c=await caches.open('prefs'),r=await c.match('prefs.json');if(!r)return;const p=await r.json();if(!p.rem||!p.rem.on)return;
const n=new Date(),[h,m]=p.rem.time.split(':').map(Number),d=new Date(n);d.setHours(h,m,0,0);d.setDate(d.getDate()-((n.getDay()-p.rem.day+7)%7));if(d>n)d.setDate(d.getDate()-7);
if((p.lb||0)>=d.getTime()||(p.nt||0)>=d.getTime())return;
await self.registration.showNotification('Waktunya backup',{body:'Buka Catatan Akun, menu titik tiga, lalu Backup terenkripsi.',tag:'backup',icon:'icon-192.png'});
p.nt=d.getTime();await c.put('prefs.json',new Response(JSON.stringify(p)))}
self.addEventListener('periodicsync',e=>{if(e.tag==='backup-reminder')e.waitUntil(remind())});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(clients.matchAll({type:'window'}).then(l=>l.length?l[0].focus():clients.openWindow('./index.html')))});
