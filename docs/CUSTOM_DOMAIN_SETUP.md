# Guía Oficial: Configuración de Dominio Personalizado y OAuth para PointC IDE

Esta guía detalla paso a paso cómo vincular el subdominio **`pointc.aldiaai.cloud`** (adquirido en **Hostinger**) con tu proyecto de **Firebase (`pointc-e9618`)**, aprovisionar certificados SSL automáticos y autorizar las credenciales de OAuth para que el inicio de sesión muestre tu marca en lugar de `pointc-e9618.firebaseapp.com`.

---

## Datos del Proyecto PointC

* **Dominio Personalizado:** `pointc.aldiaai.cloud`
* **Dominio Raíz:** `aldiaai.cloud`
* **Host / Subdominio:** `pointc`
* **ID del Proyecto Firebase:** `pointc-e9618`
* **Destino de Firebase Hosting:** `pointc-e9618.firebaseapp.com`
* **Ruta del Callback OAuth:** `https://pointc.aldiaai.cloud/__/auth/handler`

---

## Paso 1: Configurar el Subdominio en Hostinger (hPanel)

1. Inicia sesión en tu cuenta de [Hostinger hPanel](https://hpanel.hostinger.com/).
2. Ve a la sección **Dominios** y selecciona **`aldiaai.cloud`**.
3. En el menú de navegación izquierdo, haz clic en **DNS / Servidores de nombres** (o **Zona DNS**).
4. En el panel **Administrar registros DNS**, añade el registro:
   * **Tipo:** `CNAME`
   * **Nombre / Host:** `pointc` *(Hostinger completará automáticamente `pointc.aldiaai.cloud`)*
   * **Apunta a / Objeto (Target):**
     ```text
     pointc-e9618.firebaseapp.com
     ```
   * **TTL:** `14400` (o el valor predeterminado).
5. Haz clic en **Agregar registro**.

> **Nota si Firebase te solicita registro TXT de verificación:**
> Si Firebase Hosting te pide verificar la titularidad antes de emitir el certificado SSL:
> * **Tipo:** `TXT`
> * **Nombre:** `pointc`
> * **Valor:** El código que te muestre Firebase (ejemplo: `hosting-site-verification=...`)
> * Haz clic en **Agregar registro**.

---

## Paso 2: Vincular el Subdominio en Firebase Console

1. Abre la [Consola de Firebase Hosting (pointc-e9618)](https://console.firebase.google.com/project/pointc-e9618/hosting).
2. Haz clic en **Agregar dominio personalizado** (*Add custom domain*).
3. Introduce:
   ```text
   pointc.aldiaai.cloud
   ```
4. Mantén activada la casilla para emisión automática de certificado SSL gratuito.
5. Firebase comprobará el registro CNAME en Hostinger y aprovisionará el certificado TLS/SSL (suele tardar entre 15 y 45 minutos).

### 2.1. Añadir a Dominios Autorizados de Firebase Authentication
1. Entra a [Firebase Console > Authentication > Settings](https://console.firebase.google.com/project/pointc-e9618/authentication/settings).
2. Ve a la pestaña **Dominios autorizados** (*Authorized domains*).
3. Haz clic en **Agregar dominio** y añade los siguientes:
   * `pointc.aldiaai.cloud`
   * `aldiaai.cloud`
   * `ais-dev-a77b4siqajywkslc5ht6q4-448037827973.us-west2.run.app`
   * `ais-pre-a77b4siqajywkslc5ht6q4-448037827973.us-west2.run.app`

---

## Paso 3: Configurar Google Cloud Console (OAuth 2.0)

Para que Google permita el inicio de sesión OAuth desde `pointc.aldiaai.cloud`:

1. Ingresa a [Google Cloud Console - Credenciales](https://console.cloud.google.com/apis/credentials?project=pointc-e9618).
2. Asegúrate de tener seleccionado el proyecto **`pointc-e9618`**.
3. En la sección **IDs de cliente de OAuth 2.0**, haz clic en tu cliente web:
   * ID actual: `404624033459-...` (creado para web).
4. En la sección **Orígenes autorizados de JavaScript** (*Authorized JavaScript origins*):
   * Añade:
     ```text
     https://pointc.aldiaai.cloud
     https://aldiaai.cloud
     ```
5. En la sección **URIs de redireccionamiento autorizados** (*Authorized redirect URIs*):
   * Añade:
     ```text
     https://pointc.aldiaai.cloud/__/auth/handler
     ```
6. Haz clic en **Guardar**.

### 3.1. Pantalla de consentimiento de OAuth
1. En Google Cloud Console, ve a **APIs y servicios** > **Pantalla de consentimiento de OAuth**.
2. En **Dominios autorizados**, registra:
   ```text
   aldiaai.cloud
   ```
3. Verifica el nombre de la app (`PointC IDE`) y el correo de asistencia.

---

## Paso 4: Estado en PointC IDE

El archivo `firebase-applet-config.json` ya ha sido configurado con tu dominio:

```json
{
  "projectId": "pointc-e9618",
  "appId": "1:404624033459:web:36a31dc5fd61d6195312c6",
  "apiKey": "AIzaSyD2H2LWBud_Pbhfb8U1U0AXNG0gYnxERew",
  "authDomain": "pointc.aldiaai.cloud",
  "firestoreDatabaseId": "(default)",
  "storageBucket": "pointc-e9618.firebasestorage.app",
  "messagingSenderId": "404624033459",
  "measurementId": "G-KJBP3NG1YR"
}
```

---

## Comprobación y Verificación

1. Cuando la propagación DNS en Hostinger termine y Firebase emita el SSL:
2. Al pulsar **Iniciar Sesión con Google** en PointC, la ventana emergente indicará:
   `Acceder a PointC IDE en pointc.aldiaai.cloud`.
3. El handshake se completará limpiamente sin errores de dominio no autorizado.
