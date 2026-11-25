import webpush from 'web-push';
import {read, write, validSubscription} from './store.mjs';
const body=process.argv[2];
if(!body) throw new Error('Uso: npm run send -- "Mensaje para tus usuarios"');
webpush.setVapidDetails(process.env.VAPID_SUBJECT,process.env.VAPID_PUBLIC_KEY,process.env.VAPID_PRIVATE_KEY);
const subscriptions=read();
let sent=0, expired=0, failed=0;
for(const [key,subscription] of Object.entries(subscriptions)) {
  if(!validSubscription(subscription)) {failed++;continue;}
  try {
    await webpush.sendNotification(subscription,JSON.stringify({title:'Recetario Fácil',body:body.slice(0,500)}),{TTL:3600,timeout:10_000});sent++;
  } catch(error) {
    if(error.statusCode===404 || error.statusCode===410) {
      // Read the latest state to avoid overwriting concurrent subscriptions.
      const current=read();delete current[key];write(current);expired++;
    } else {failed++;console.error('Error de entrega:',error.statusCode || error.code || 'desconocido');}
  }
}
console.log({enviados:sent,caducados:expired,fallidos:failed});
if(failed)process.exitCode=1;
