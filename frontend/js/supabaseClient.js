if (!window.supabase) {
  throw new Error('La libreria de Supabase no cargo. Revisa el script CDN en index.html.');
}

const { url, anonKey } = window.SUPABASE_CONFIG;

if (!url || url.includes('TU-PROYECTO') || !anonKey || anonKey.includes('TU_ANON_KEY')) {
  console.warn(
    'Falta configurar las variables de entorno SUPABASE_URL y SUPABASE_ANON_KEY.'
  );
}

const supabaseClient = window.supabase.createClient(url, anonKey);
