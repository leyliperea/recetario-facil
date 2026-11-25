import {mkdirSync, readFileSync, writeFileSync, renameSync} from 'node:fs';
import {resolve, join} from 'node:path';
import {createHash} from 'node:crypto';
const directory = resolve(process.env.DATA_DIR || './data');
mkdirSync(directory, {recursive:true, mode:0o700});
const file = join(directory,'subscriptions.json');
export const id = subscription => createHash('sha256').update(subscription.endpoint).digest('hex');
export function read() {
  try { return JSON.parse(readFileSync(file,'utf8')); }
  catch(error) { if(error.code === 'ENOENT') return {}; throw error; }
}
export function write(data) {
  writeFileSync(file+'.tmp', JSON.stringify(data), {mode:0o600});
  renameSync(file+'.tmp',file);
}
// Keep server-side outbound requests restricted to known browser push providers.
export function validSubscription(s) {
  try {
    const url = new URL(s.endpoint);
    const allowed = ['fcm.googleapis.com','updates.push.services.mozilla.com','web.push.apple.com'];
    const host = url.hostname;
    return url.protocol==='https:' && !url.port && !url.username && !url.password &&
      (allowed.includes(host) || host.endsWith('.notify.windows.com')) &&
      /^[A-Za-z0-9_-]{87}$/.test(s.keys?.p256dh) && /^[A-Za-z0-9_-]{22}$/.test(s.keys?.auth);
  } catch { return false; }
}
