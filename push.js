(() => {
  const status = document.querySelector('#push-status');
  const subscribe = document.querySelector('#subscribe-push');
  const testPush = document.querySelector('#test-push');
  const unsubscribe = document.querySelector('#unsubscribe-push');
  const base = (window.RECETARIO_PUSH_API || '').replace(/\/$/, '');
  const supported = isSecureContext && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  function message(text) { status.textContent = text; }
  function keyBytes(key) {
    const value = atob(key.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4-key.length%4)%4));
    return Uint8Array.from(value, c => c.charCodeAt(0));
  }
  async function api(path, body) {
    const response = await fetch(base + path, {method: body ? 'POST' : 'GET', cache:'no-store', headers:body ? {'Content-Type':'application/json'} : {}, body:body ? JSON.stringify(body) : undefined});
    if (!response.ok) throw new Error('No se pudo contactar el servidor push.');
    return response.json();
  }
  subscribe.disabled = !supported || !base;
  testPush.disabled = !supported || !base;
  unsubscribe.disabled = !supported;
  message(!supported ? 'Este navegador no admite mensajes push.' : !base ? 'El envío push estará disponible cuando se conecte el servidor.' : 'Activa push para recibir novedades del recetario aunque no lo tengas abierto.');
  subscribe.addEventListener('click', async () => {
    subscribe.disabled = true;
    try {
      // Ask from the click, before network requests consume user activation.
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') throw new Error('Permite las notificaciones en los ajustes del sitio para activar push.');
      const {publicKey} = await api('/vapid-public-key');
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();
      if (subscription && btoa(String.fromCharCode(...new Uint8Array(subscription.options.applicationServerKey))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'') !== publicKey) {
        throw new Error('La suscripción usa otra clave. Desactiva push y vuelve a activarlo.');
      }
      subscription ||= await registration.pushManager.subscribe({userVisibleOnly:true, applicationServerKey:keyBytes(publicKey)});
      await api('/subscriptions', {subscription:subscription.toJSON()});
      message('Push activado. Puedes cerrar el recetario y recibir los avisos enviados desde el servidor.');
    } catch (error) { message(error.message || 'No se pudo activar push. Inténtalo de nuevo.'); }
    finally { subscribe.disabled = !supported || !base; }
  });
  testPush.addEventListener('click', async () => {
    testPush.disabled = true;
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (!subscription || Notification.permission !== 'granted') throw new Error('Primero pulsa Activar push y permite las notificaciones.');
      message('Conectando con el servidor. Si estaba en reposo, puede tardar un minuto…');
      await api('/push-test', {subscription:subscription.toJSON()});
      message('Prueba solicitada. Cierra la ventana del recetario: el servidor enviará el aviso en 10 segundos.');
    } catch(error) { message(error.message || 'No se pudo solicitar la prueba push.'); }
    finally { testPush.disabled = !supported || !base; }
  });
  unsubscribe.addEventListener('click', async () => {
    unsubscribe.disabled = true;
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription && !await subscription.unsubscribe()) throw new Error('No se pudo cancelar la suscripción.');
      message('Push desactivado en este dispositivo.');
    } catch { message('No se pudo desactivar push. Inténtalo de nuevo.'); }
    finally { unsubscribe.disabled = !supported; }
  });
})();
