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
  // Ojo: va la URL base del proyecto, SIN /rest/v1/ al final. El cliente de
  // Supabase le agrega solo el /rest/v1/ para la base y el /auth/v1/ para el
  // login; si la URL ya trae /rest/v1/, el magic link no funciona.
  url: "https://fohzcmgrewfhngtjkozo.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvaHpjbWdyZXdmaG5ndGprb3pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3NTY2MjEsImV4cCI6MjEwNTMzMjYyMX0.0j-GZRBYStS9kg2YIAvPg9sO0G3IgTN2TqCze2uGY-M"
};
