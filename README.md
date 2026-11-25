# Recetario Fácil

PWA de recetas sencillas con buscador, categorías, favoritos y lista de compras.

## Funciones

- Seis accesos con iconos: búsqueda, favoritos, compras, receta al azar, apariencia y modo oscuro.
- Temas lila, verde y durazno, texto grande y preferencias guardadas en el navegador.
- Seis recetas con ingredientes e instrucciones.
- Instalación como PWA y caché sin conexión después de la primera visita. Las imágenes externas requieren haber sido cargadas antes.
- Definición experimental de widget de Windows; necesita instalación y pruebas en un entorno compatible.

## Probar localmente

Ejecuta `python -m http.server 8000` desde esta carpeta y abre http://localhost:8000.

## GitHub Pages

En Settings → Pages selecciona Deploy from a branch, rama `main` y carpeta `/ (root)`, y guarda.

## Datos

Los favoritos, compras y preferencias se guardan solo en el navegador actual. No hay servidor, cuentas ni sincronización entre dispositivos.

## Pendiente

- Compartir recetas como imagen.
- Verificar la instalación del widget en Windows.


## Notificaciones y push

La sección Avisos de compras permite notificaciones locales de prueba y el distintivo de ingredientes pendientes. Los controles de push reciben avisos enviados por un servidor, incluso sin tener abierta la ventana de la app cuando el sistema permite su entrega.

El backend Node y la guía están en [server/README.md](server/README.md). Para habilitar los controles push hay que desplegar ese servidor, configurar sus claves VAPID privadas y poner su URL en `push-config.js`. No hay un servidor push activo incluido en GitHub Pages. La solicitud de permiso ocurre únicamente al pulsar un botón.
