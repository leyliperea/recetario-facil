const CACHE='recetario-v12-push';const CORE=['./','./index.html','./app.js?v=12','./notifications.js?v=12','./push-config.js?v=12','./push.js?v=12','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png','./widgets/recipe-template.json','./widgets/recipe-data.json','./widgets/widget-preview.svg'];self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('recetario-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;e.respondWith(fetch(e.request).then(r=>{if(r.ok||r.type==='opaque'){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy))}return r}).catch(()=>caches.match(e.request).then(r=>r||(e.request.mode==='navigate'?caches.match('./index.html'):Response.error()))))});

// Windows PWA widgets API is available only on supported Edge/Windows installations.
async function renderRecipeWidget(widget, requestedIndex) {
  if (!self.widgets || !widget) return;
  const [templateResponse, dataResponse] = await Promise.all([
    fetch(new URL('widgets/recipe-template.json', self.registration.scope)),
    fetch(new URL('widgets/recipe-data.json', self.registration.scope))
  ]);
  if (!templateResponse.ok || !dataResponse.ok) throw new Error('No se pudo cargar el widget');
  const template = await templateResponse.text();
  const base = await dataResponse.json();
  const ideas = [base,
    {id:2,name:'Ensalada fresca con garbanzos',category:'Comidas',time:15,servings:2,summary:'Garbanzos cocidos, pepino, jitomate y lechuga con limón.'},
    {id:3,name:'Pasta cremosa con champiñones',category:'Comidas',time:30,servings:2,summary:'Pasta, champiñones, crema y ajo. Una comida fácil para compartir.'},
    {id:4,name:'Tostadas de aguacate',category:'Desayunos',time:10,servings:2,summary:'Pan integral, aguacate y jitomate. Listas en unos minutos.'},
    {id:5,name:'Quesadillas de champiñones',category:'Cenas',time:20,servings:2,summary:'Tortillas de maíz, queso Oaxaca y champiñones salteados.'},
    {id:6,name:'Vasitos de yogur con fruta',category:'Postres',time:10,servings:2,summary:'Yogur natural con fresas, plátano y una capa de granola.'}
  ];
  const stateCache = await caches.open(CACHE);
  const key = new URL('widgets/current-recipe', self.registration.scope).href;
  const previous = await stateCache.match(key);
  const savedIndex = previous ? Number(await previous.text()) : 0;
  const index = requestedIndex === 'next' ? (savedIndex + 1) % ideas.length : savedIndex;
  await self.widgets.updateByTag('recetario-ideas', {template, data:JSON.stringify(ideas[index])});
  await stateCache.put(key, new Response(String(index)));
}
self.addEventListener('widgetinstall', e => e.waitUntil(renderRecipeWidget(e.widget)));
self.addEventListener('widgetresume', e => e.waitUntil(renderRecipeWidget(e.widget)));
self.addEventListener('activate', e => {
  if (self.widgets) e.waitUntil(self.widgets.getByTag('recetario-ideas').then(w => renderRecipeWidget(w)));
});
self.addEventListener('widgetclick', e => {
  if (!self.widgets) return;
  if (e.action === 'next-recipe') e.waitUntil(self.widgets.getByTag('recetario-ideas').then(w => renderRecipeWidget(w, 'next')));
  if (e.action === 'open-recipe') e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    const state = await cache.match(new URL('widgets/current-recipe', self.registration.scope).href);
    const index = state ? Number(await state.text()) : 0;
    return self.clients.openWindow(new URL('?receta=' + (index + 1), self.registration.scope).href);
  })());
});

self.addEventListener('message', event => {
 if(event.data?.type!=='WIDGET_DIAGNOSTIC'||!event.ports[0])return;
 event.waitUntil((async()=>{
  const result={version:CACHE,apiDisponible:'widgets' in self};
  try{
   if(result.apiDisponible){
    const widget=await self.widgets.getByTag('recetario-ideas');
    result.widgetDetectado=!!widget;
    if(widget){result.instalable=widget.installable;result.instancias=widget.instances?.length;result.nombre=widget.definition?.name;result.etiqueta=widget.definition?.tag;}
   }
  }catch(error){result.error=String(error);}
  event.ports[0].postMessage(result);
 })());
});
// Persistent notification actions, including opening an installed PWA.
self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'dismiss') return;
  event.waitUntil((async () => {
    const url = new URL('?vista=compras', self.registration.scope).href;
    const windows = await self.clients.matchAll({type:'window', includeUncontrolled:true});
    for (const client of windows) {
      if (client.url.startsWith(self.registration.scope) && 'focus' in client) {
        client.postMessage({type:'OPEN_SHOPPING'});
        await client.focus();
        return;
      }
    }
    await self.clients.openWindow(url);
  })());
});


// Always display a visible notification, even for an empty or malformed payload.
self.addEventListener('push', event => {
  event.waitUntil((async () => {
    let data = {};
    try { data = event.data?.json() || {}; }
    catch { data = {body:event.data?.text()}; }
    if (!data || typeof data !== 'object') data = {};
    await self.registration.showNotification(
      typeof data.title === 'string' ? data.title.slice(0,100) : 'Recetario Fácil', {
        body:typeof data.body === 'string' ? data.body.slice(0,500) : 'Hay novedades en tu recetario. Abre la aplicación para verlas.',
        icon:new URL('icon-192.png', self.registration.scope).href,
        tag:'recetario-push',
        actions:[{action:'open-shopping',title:'Ver compras'},{action:'dismiss',title:'Cerrar'}]
      });
  })());
});
