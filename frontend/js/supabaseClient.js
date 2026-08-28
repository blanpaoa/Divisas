if (!window.supabase) {
  throw new Error('La librería de Supabase no cargó. Revisa el script CDN en index.html.');
}

const { url, anonKey } = window.SUPABASE_CONFIG || {};

var supabaseClient = null;

if (!url || url.includes('TU-PROYECTO') || !anonKey || anonKey.includes('TU_ANON_KEY')) {
  console.warn(
    '⚠️ Falta configurar las variables de entorno SUPABASE_URL y SUPABASE_ANON_KEY en Vercel o archivo .env.'
  );
} else {
  try {
    supabaseClient = window.supabase.createClient(url, anonKey);
  } catch (error) {
    console.error('Error al crear el cliente de Supabase:', error);
  }
}

window.supabaseClient = supabaseClient;

