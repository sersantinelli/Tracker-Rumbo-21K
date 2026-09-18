# Rumbo a los 21K — puesta en marcha

Esta app es un solo `index.html` (HTML/CSS/JS vanilla, sin build step) más un
`config.js` con las credenciales de Supabase. Se puede publicar tal cual en
GitHub Pages.

Todo lo que registrás se guarda **primero en el navegador** (localStorage) y
además, si configurás Supabase, se copia a la nube con guardado automático.
Si no configurás nada, la app funciona igual que siempre: local, sin login y
sin nube.

Índice:

1. [Crear el proyecto en Supabase](#1-crear-el-proyecto-en-supabase-gratis)
2. [Crear la tabla y las políticas de RLS](#2-crear-la-tabla-y-las-políticas-de-rls)
3. [Habilitar el login por magic link](#3-habilitar-el-login-por-magic-link)
4. [Pegar la URL y la anon key en el código](#4-pegar-la-url-y-la-anon-key-en-el-código)
5. [Publicar en GitHub Pages](#5-publicar-en-github-pages)
6. [Probar que funciona](#6-probar-que-funciona)
7. [Cómo funciona la sincronización](#7-cómo-funciona-la-sincronización-resumen)
8. [Problemas frecuentes](#8-problemas-frecuentes)

---

## 1. Crear el proyecto en Supabase (gratis)

1. Entrá a <https://supabase.com> y hacé **Start your project** / **Sign in**
   (podés entrar con tu cuenta de GitHub).
2. **New project**. Completá:
   - **Name**: `tracker-21k` (o el que quieras).
   - **Database password**: generá una y guardala. (No la vas a necesitar para
     esta app, pero Supabase la pide.)
   - **Region**: la más cercana, por ejemplo *South America (São Paulo)*.
3. **Create new project** y esperá 1-2 minutos a que termine de provisionar.

El plan gratuito alcanza y sobra: esta app guarda **una sola fila por usuario**.

---

## 2. Crear la tabla y las políticas de RLS

En el menú lateral del proyecto: **SQL Editor** → **New query**. Pegá todo
esto y apretá **Run**:

```sql
-- Una fila por usuario. config / log / weights son los mismos objetos JSON
-- que la app venía guardando en localStorage.
create table if not exists public.tracker_data (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  config     jsonb       not null default '{}'::jsonb,   -- fecha de inicio + días de running
  log        jsonb       not null default '{}'::jsonb,   -- { "2026-03-14": { state, km, min }, ... }
  weights    jsonb       not null default '[]'::jsonb,   -- [ { "date": "...", "kg": 78.4 }, ... ]
  updated_at timestamptz not null default now()          -- lo escribe la app en cada guardado
);

-- Row Level Security: sin esto, cualquiera con la anon key leería todo.
alter table public.tracker_data enable row level security;

-- Cada usuario solo ve y toca SU fila (auth.uid() = el user_id de la fila).
create policy "tracker_data_select_own" on public.tracker_data
  for select using (auth.uid() = user_id);

create policy "tracker_data_insert_own" on public.tracker_data
  for insert with check (auth.uid() = user_id);

create policy "tracker_data_update_own" on public.tracker_data
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "tracker_data_delete_own" on public.tracker_data
  for delete using (auth.uid() = user_id);
```

Hacen falta las políticas de `insert` **y** de `update` porque la app guarda con
un `upsert` (inserta la primera vez, actualiza las siguientes).

Para verificar: **Table Editor** → tiene que aparecer `tracker_data`, vacía, con
el cartelito de **RLS enabled**.

---

## 3. Habilitar el login por magic link

1. **Authentication** → **Providers** → **Email**: dejalo **habilitado** y
   **desactivá** *Confirm password* / cualquier cosa de contraseña si aparece.
   El magic link (OTP por email) viene activado por defecto con el provider de
   email; alcanza con no tocar nada más.
2. **Authentication** → **URL Configuration**:
   - **Site URL**: la URL final de tu app en GitHub Pages, por ejemplo
     `https://tu-usuario.github.io/tracker-21k/`.
   - **Redirect URLs**: agregá esa misma URL y, si querés probar en tu
     compu, también `http://localhost:8080/` (o el puerto que uses).
   Si esta URL no está en la lista, el enlace del email te va a rebotar.
3. (Opcional) **Authentication** → **Users** → **Add user** si querés crearte
   el usuario a mano. No hace falta: la primera vez que pidas el enlace, el
   usuario se crea solo.

**Sobre el correo**: el servidor de mails que viene incluido tiene un límite
bajo (unos pocos emails por hora) y a veces cae en spam. Para uso personal
alcanza. Si te molesta, en **Authentication** → **Emails** / **SMTP Settings**
podés enchufar tu propio SMTP (Resend, Brevo, Gmail, etc.).

---

## 4. Pegar la URL y la anon key en el código

En Supabase: **Project Settings** (el engranaje) → **API**. Copiá:

- **Project URL** → algo como `https://abcdefghijklmnop.supabase.co`
- **anon public** (también aparece como *publishable key*) → el texto largo que
  empieza con `eyJ...` o con `sb_publishable_...`

Pegalos en **`config.js`**, en la raíz del repo:

```js
window.SUPABASE_CONFIG = {
  url: "https://abcdefghijklmnop.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
};
```

> ⚠️ Usá la **anon key**, nunca la `service_role`. La anon key es pública por
> diseño (viaja al navegador); lo que protege tus datos es la RLS del paso 2.
> La `service_role` se saltea la RLS: si la publicás, cualquiera puede leer y
> borrar todo.

Si dejás `url` o `anonKey` vacíos, la app arranca en **modo local**: sin
pantalla de login y sin nube, exactamente como la versión original.

---

## 5. Publicar en GitHub Pages

Los archivos que tenés que subir son tres: `index.html`, `config.js` y
(opcional) este `SETUP.md`.

**Desde la web de GitHub:**

1. <https://github.com/new> → nombre del repo (ej. `tracker-21k`) →
   **Public** → **Create repository**.
2. En el repo vacío: **uploading an existing file** → arrastrá `index.html` y
   `config.js` → **Commit changes**.
3. **Settings** → **Pages** → en **Build and deployment**:
   - **Source**: `Deploy from a branch`
   - **Branch**: `main` y carpeta `/ (root)` → **Save**.
4. Esperá 1-2 minutos y recargá esa misma pantalla: te va a mostrar la URL
   (`https://tu-usuario.github.io/tracker-21k/`).

**Desde la terminal**, si preferís:

```bash
git init
git add index.html config.js SETUP.md
git commit -m "Tracker 21K con guardado en Supabase"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/tracker-21k.git
git push -u origin main
# y después activás Pages en Settings → Pages, como arriba
```

Cuando tengas la URL definitiva, **volvé al paso 3** y asegurate de que esté
cargada en *Site URL* y en *Redirect URLs*.

**En el iPhone**: abrí la URL en Safari → botón compartir → *Agregar a inicio*.
Queda como app, a pantalla completa, igual que antes.

---

## 6. Probar que funciona

1. Abrí la app: tiene que aparecer la pantalla de login azul y dorada.
2. Escribí tu email → **Enviarme el enlace**.
3. Abrí el mail y tocá el enlace **en el mismo dispositivo**. Volvés a la app
   ya logueado y la pantalla de login desaparece.
4. Marcá un día cualquiera y esperá un par de segundos. En **Ajustes del plan**
   → *Guardado en la nube* tiene que decir **"Guardado en la nube."** con el
   puntito verde.
5. En Supabase, **Table Editor** → `tracker_data`: tiene que haber una fila con
   tu `user_id` y el JSON adentro.
6. Abrí la misma URL en otro dispositivo, entrá con el mismo email y tenés que
   ver el mismo progreso.

---

## 7. Cómo funciona la sincronización (resumen)

- **localStorage manda mientras usás la app.** Cada cambio (día, peso, ajustes)
  se guarda primero local, igual que antes. La nube va después.
- **Subida con debounce de 1,5 s**: si tocás varias cosas seguidas se manda una
  sola escritura, no una por clic.
- **Al arrancar**, si hay sesión, la app compara la columna `updated_at` de la
  fila remota con la marca local (`hm_tracker_updated_at_v1`):
  - no hay fila en la nube → sube lo que haya en el dispositivo (primer sync);
  - la nube es más nueva → baja esos datos y pisa localStorage;
  - el dispositivo es más nuevo → sube lo local.
- **Si falla la red o Supabase, no pasa nada**: el dato ya está guardado local,
  la acción nunca se bloquea, el estado queda como pendiente y se reintenta
  solo (5 s, 15 s, 30 s, 60 s, y de nuevo apenas vuelve la conexión).
- **Sin credenciales, sin librería o sin sesión** ("Seguir sin cuenta"), la app
  funciona 100% en modo local.
- El **backup manual** (`Descargar backup` / `Restaurar backup`) sigue estando
  como red de seguridad extra, y el recordatorio a los 7 días también.

Un detalle a tener en cuenta: la resolución de conflictos es *el último
guardado gana*, no hay merge. Si editás en dos dispositivos que estuvieron
offline al mismo tiempo, queda la versión del que sincronizó último.

---

## 8. Problemas frecuentes

| Síntoma | Qué mirar |
|---|---|
| No aparece la pantalla de login | `config.js` está vacío o mal pegado, o el CDN de `supabase-js` no cargó. Abrí la consola del navegador: la app avisa con `[sync] ...` y sigue en modo local. |
| El enlace del email da "requested path is invalid" | La URL de la app no está en **Authentication → URL Configuration → Redirect URLs** (paso 3). |
| No llega el mail | Fijate en spam y en el límite del mailer de Supabase (**Authentication → Rate Limits**). Si lo vas a usar seguido, configurá tu propio SMTP. |
| Dice "Sin conexión con la nube" | Estás offline o la tabla/políticas no están creadas. Tus datos están a salvo en el dispositivo; se reintenta solo. Revisá la consola para ver el error exacto de Supabase. |
| `new row violates row-level security policy` | Faltan las políticas de `insert`/`update` del paso 2, o las creaste sobre otra tabla. |
| Abrí en otro dispositivo y no veo nada | Fijate que sea el **mismo email** y que el primer dispositivo haya llegado a decir "Guardado en la nube." |
| Quiero empezar de cero en la nube | En Supabase, **Table Editor** → `tracker_data` → borrá tu fila. Después, desde el dispositivo que tenga los datos buenos, hacé cualquier cambio: se vuelve a subir todo. |
