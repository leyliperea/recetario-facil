// No automatic permission requests and no simulated background delivery.
(() => {
  const status = document.querySelector('#notification-status');
  const enable = document.querySelector('#enable-notifications');
  const test = document.querySelector('#test-notification');
  const badge = document.querySelector('#enable-badge');
  const supported = 'Notification' in window && 'serviceWorker' in navigator && window.isSecureContext;
  let badgeEnabled = true;
  try { badgeEnabled = localStorage.getItem('rf-badge') !== 'false'; } catch {}
  badge.checked = badgeEnabled;
  const pending = () => shopping.filter(item => !item.done).length;
  function updateStatus(message) {
    status.textContent = message || (!supported ? 'Las notificaciones requieren un navegador compatible y HTTPS o localhost.' :
      Notification.permission === 'granted' ? 'Notificaciones permitidas. Puedes enviar una prueba.' :
      Notification.permission === 'denied' ? 'Notificaciones bloqueadas. Abre el recetario en el navegador, pulsa el icono junto a la dirección y cambia Notificaciones a Permitir. Después vuelve aquí y pulsa Revisar avisos.' :
      'Activa las notificaciones para probar un aviso de compras.');
    enable.disabled = !supported || Notification.permission !== 'default';
    test.disabled = !supported || Notification.permission !== 'granted';
  }
  async function updateBadge() {
    if (!('setAppBadge' in navigator)) return;
    try {
      await navigator.setAppBadge(badgeEnabled ? pending() : 0);
    } catch (error) { console.warn('No se pudo actualizar el distintivo', error); }
  }
  badge.disabled = !('setAppBadge' in navigator);
  badge.addEventListener('change', () => {
    badgeEnabled = badge.checked;
    try { localStorage.setItem('rf-badge', String(badgeEnabled)); } catch {}
    updateBadge();
  });
  enable.addEventListener('click', async () => {
    try {
      await Notification.requestPermission();
      updateStatus();
      window.dispatchEvent(new Event('notification-permission-updated'));
    } catch { updateStatus('No se pudo solicitar el permiso. Revisa la configuración del navegador.'); }
  });
  test.addEventListener('click', async () => {
    if (!supported || Notification.permission !== 'granted') return updateStatus();
    test.disabled = true;
    try {
      const registration = await navigator.serviceWorker.ready;
      const count = pending();
      await registration.showNotification('Recetario Fácil · Lista de compras', {
        body: count ? `Tienes ${count} ingrediente${count === 1 ? '' : 's'} pendiente${count === 1 ? '' : 's'} por comprar.` : 'Tu lista de compras está al día.',
        icon: new URL('icon-192.png', registration.scope).href,
        tag: 'recetario-shopping',
        actions: [{action:'open-shopping', title:'Ver compras'}, {action:'dismiss', title:'Cerrar'}]
      });
      updateStatus('Aviso enviado al sistema. Si no aparece, revisa las notificaciones del navegador y No molestar.');
    } catch { updateStatus('No se pudo mostrar el aviso. Recarga la página y revisa los permisos.'); }
    finally { test.disabled = !supported || Notification.permission !== 'granted'; }
  });
  function showShopping() { openToolPage('shopping'); }
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', event => {
      if (event.data?.type === 'OPEN_SHOPPING') showShopping();
    });
  }
  if (new URLSearchParams(location.search).get('vista') === 'compras') showShopping();
  window.addEventListener('shopping-updated', updateBadge);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') { updateBadge(); updateStatus(); }
  });
  document.querySelector('#check-notifications').addEventListener('click', async () => {
    updateStatus();
    if (!supported) return;
    if (Notification.permission !== 'granted') return;
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      updateStatus(registration?.active ? 'Permiso permitido y aplicación preparada. Pulsa Probar notificación. Si Windows no muestra el aviso, revisa Configuración → Sistema → Notificaciones y desactiva No molestar.' : 'La aplicación todavía se está preparando. Conéctate a internet y vuelve a abrirla.');
    } catch { updateStatus('No se pudo comprobar la aplicación. Vuelve a abrirla con internet.'); }
  });
  window.addEventListener('focus', () => updateStatus());
  window.addEventListener('notification-permission-updated', () => updateStatus());
  updateStatus();
  updateBadge();
})();
