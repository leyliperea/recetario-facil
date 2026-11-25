# Servidor push de Recetario Fácil

GitHub Pages aloja la PWA. Este proceso Node se ejecuta en otro alojamiento con HTTPS y disco persistente. No está desplegado automáticamente por subir estos archivos.

## Configurar

1. Instala Node 22 o posterior. En esta carpeta ejecuta `npm install`.
2. Copia `.env.example` a `.env` y ejecuta `npm run keys` una sola vez.
3. Copia publicKey y privateKey a las variables correspondientes en `.env`. Cambia VAPID_SUBJECT por tu correo de contacto (`mailto:...`). Conserva las claves entre reinicios.
4. Mantén `ALLOWED_ORIGIN=https://leyliperea.github.io`. Para una prueba local, usa el origen exacto donde sirves la PWA, por ejemplo `http://localhost:8000`.
5. Ejecuta `npm start`. Publica el proceso detrás de HTTPS y conserva DATA_DIR en un volumen persistente. Usa una sola instancia del proceso con este almacenamiento JSON.
6. En el archivo público `push-config.js` escribe la URL HTTPS del servidor en RECETARIO_PUSH_API. Publica ese cambio en GitHub.
7. Abre la PWA y pulsa Activar push. Acepta el permiso. Si estaba bloqueado, habilítalo desde los permisos del sitio.
8. Desde una consola privada del servidor ejecuta `npm run send -- "Hoy tenemos una nueva idea para cocinar"`.

## Comprobar

- Suscríbete y cierra la ventana de la PWA, dejando el sistema y el servicio push del navegador disponibles.
- Ejecuta el envío desde el servidor. Comprueba el aviso del sistema y pulsa Ver compras.
- Usa Desactivar push y comprueba que los siguientes envíos ya no llegan a ese dispositivo.
- No se garantiza la entrega si el sistema impide actividad en segundo plano, el navegador se ha detenido completamente o no hay conectividad. El TTL de los mensajes es una hora.

El script de envío informa cuántos mensajes aceptó el proveedor, cuántas suscripciones caducaron y cuántos fallaron; esto no confirma que el usuario haya leído el aviso. Las suscripciones 404/410 se eliminan al enviar. Desactivar push invalida la suscripción en el navegador; su registro se limpia cuando el proveedor la reporta caducada.

No subas `.env`, claves privadas ni `data/` a GitHub. No hay una ruta pública para enviar avisos: el envío es un comando privado del administrador. No añadas el backend ni las suscripciones a la caché de la PWA. La lista local de compras no se envía al servidor; el push es un aviso de novedades y no modifica su distintivo.

Los registros de suscripción se limitan a 1000 y las solicitudes se limitan por conexión. Para uso público a gran escala, sustituye el almacenamiento JSON por una base de datos y añade controles de abuso en el alojamiento.
