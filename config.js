/* ---------------------------------------------------------------------------
   Configuración de Supabase
   ---------------------------------------------------------------------------
   Pegá acá la URL y la "anon key" (clave pública) de tu proyecto de Supabase.
   Las encontrás en: Supabase → tu proyecto → Project Settings → API.

   La anon key es pública por diseño: no es un secreto. Lo que protege tus
   datos es la Row Level Security (RLS) de la tabla, que hace que cada usuario
   solo pueda leer y escribir su propia fila. Ver SETUP.md.

   Si dejás estos valores vacíos, la app funciona exactamente como antes:
   todo se guarda solo en localStorage, sin login y sin nube.
--------------------------------------------------------------------------- */
window.SUPABASE_CONFIG = {
  url: "",      // ej: "https://abcdefghijklmnop.supabase.co"
  anonKey: ""   // ej: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
};
