"""Escribe avisos push desde la terminal: py enviar.py (Windows) o python3 enviar.py."""
import getpass
import json
import socket
import sys
import urllib.error
import urllib.request

API = "https://recetario-push.onrender.com"
ORIGIN = "https://leyliperea.github.io"

def request(path, password, payload=None):
    headers = {"Origin": ORIGIN, "Authorization": "Bearer " + password}
    data = None
    if payload is not None:
        data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        headers["Content-Type"] = "application/json; charset=utf-8"
    req = urllib.request.Request(API + path, data=data, headers=headers,
                                 method="POST" if data is not None else "GET")
    try:
        with urllib.request.urlopen(req, timeout=120) as response:
            return json.load(response)
    except urllib.error.HTTPError as error:
        try:
            detail = json.loads(error.read()).get("error", "Solicitud rechazada")
        except (ValueError, UnicodeError):
            detail = "Error HTTP " + str(error.code)
        raise RuntimeError(detail) from None
    except (TimeoutError, socket.timeout):
        raise RuntimeError("Se agotó el tiempo. Si estabas enviando, no repitas sin comprobar si llegó el aviso.") from None
    except urllib.error.URLError:
        raise RuntimeError("No se pudo conectar. Revisa tu conexión y vuelve a intentarlo.") from None
    except (ValueError, UnicodeError):
        raise RuntimeError("El servidor está despertando. Espera un minuto y vuelve a iniciar.") from None

def main():
    print("RECETARIO FÁCIL — Enviar notificaciones")
    print("La contraseña se introduce una sola vez y no se guarda.")
    if not sys.stdin.isatty():
        print("Abre una terminal interactiva y ejecuta este archivo directamente.")
        return 1
    password = getpass.getpass("Contraseña de administrador de Render: ")
    if len(password) < 16:
        print("Usa el valor de ADMIN_PASSWORD en Render.")
        return 1
    print("Conectando… Puede tardar un minuto si el servidor estaba en reposo.")
    try:
        state = request("/admin/status", password)
    except RuntimeError as error:
        print(error)
        return 1
    print("Dispositivos suscritos:", state["subscribers"])
    print("Escribe tu mensaje y pulsa Enter para enviarlo a TODOS los suscritos.")
    print("Escribe /usuarios para consultar el conteo o /salir para terminar.\n")
    while True:
        message = input("Mensaje > ").strip()
        if message.lower() == "/salir":
            break
        if not message:
            continue
        try:
            if message.lower() == "/usuarios":
                print("Dispositivos suscritos:", request("/admin/status", password)["subscribers"])
                continue
            if len(message) > 500:
                print("El mensaje debe tener como máximo 500 caracteres.")
                continue
            print("Enviando…")
            result = request("/admin/send", password, {"title": "Recetario Fácil", "body": message})
            print("Aceptados por el servicio push:", result["accepted"],
                  "| Caducados:", result["expired"], "| Fallidos:", result["failed"])
            print("La aceptación no confirma que Windows haya mostrado el aviso.\n")
        except RuntimeError as error:
            print(error, "\n")
    return 0

if __name__ == "__main__":
    try:
        sys.exit(main())
    except (KeyboardInterrupt, EOFError):
        print("\nPrograma cerrado.")
