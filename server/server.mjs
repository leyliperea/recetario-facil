import webpush from 'web-push';
import {createServer} from 'node:http';
import {id, read, write, validSubscription} from './store.mjs';
const origin = process.env.ALLOWED_ORIGIN;
const publicKey = process.env.VAPID_PUBLIC_KEY;
if (!origin || !publicKey) throw new Error('Configura ALLOWED_ORIGIN y VAPID_PUBLIC_KEY en .env');
webpush.setVapidDetails(process.env.VAPID_SUBJECT, publicKey, process.env.VAPID_PRIVATE_KEY);
const testCooldown = new Map();
const rate = new Map();
setInterval(() => rate.clear(), 60_000).unref();
createServer(async (req,res) => {
  res.setHeader('Cache-Control','no-store');
  res.setHeader('Content-Type','application/json');
  res.setHeader('Vary','Origin');
  const reply = (code, data) => {res.writeHead(code);res.end(JSON.stringify(data));};
  if (req.method==='GET' && req.url==='/health') return reply(200,{ok:true});
  if (req.headers.origin !== origin) return reply(403,{error:'Origen no permitido'});
  res.setHeader('Access-Control-Allow-Origin',origin);
  res.setHeader('Access-Control-Allow-Methods','GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  if(req.method==='OPTIONS') {res.writeHead(204);return res.end();}
  if(req.method==='GET' && req.url==='/vapid-public-key') return reply(200,{publicKey});
  if(req.method!=='POST' || !['/subscriptions','/push-test'].includes(req.url)) return reply(404,{error:'Ruta no encontrada'});
  if(!req.headers['content-type']?.startsWith('application/json')) return reply(415,{error:'Se requiere JSON'});
  const ip=req.socket.remoteAddress;
  const count=(rate.get(ip)||0)+1;rate.set(ip,count);
  if(count>30) return reply(429,{error:'Intenta más tarde'});
  try {
    let body='';
    for await(const chunk of req) {body+=chunk;if(Buffer.byteLength(body)>4096)return reply(413,{error:'Solicitud demasiado grande'});}
    const {subscription}=JSON.parse(body);
    if(!validSubscription(subscription)) return reply(400,{error:'Suscripción inválida'});
    const key=id(subscription);
    if(req.url==='/push-test') {
      const now=Date.now();
      for(const [entry,time] of testCooldown) if(now-time>60000) testCooldown.delete(entry);
      if(testCooldown.has(key)) return reply(429,{error:'Espera un minuto antes de probar de nuevo'});
      testCooldown.set(key,now);
      setTimeout(async()=>{
        try { await webpush.sendNotification(subscription, JSON.stringify({title:'Recetario Fácil',body:'¡Tu mensaje push llegó desde el servidor! Ya puedes volver a cocinar.'}), {TTL:120,timeout:10000}); }
        catch(error) { console.warn('No se pudo entregar la prueba push:',error.statusCode || error.code || 'error'); }
      },10000);
      return reply(202,{ok:true,delay:10});
    }
    const data=read();
    if(!data[key] && Object.keys(data).length>=1000) return reply(503,{error:'Límite de suscripciones alcanzado'});
    data[key]={endpoint:subscription.endpoint,keys:subscription.keys};write(data);
    reply(200,{ok:true});
  } catch { reply(400,{error:'No se pudo guardar la suscripción'}); }
}).listen(Number(process.env.PORT)||3000,()=>console.log('Servidor push iniciado'));
