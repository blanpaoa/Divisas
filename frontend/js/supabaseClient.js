if (!window.supabase) {
  throw new Error('La libreria de Supabase no cargo. Revisa el script CDN en index.html.');
}

const { url, anonKey } = window.SUPABASE_CONFIG;

if (!url || url.includes('TU-PROYECTO') || !anonKey || anonKey.includes('TU_ANON_KEY')) {
  console.warn(
    'Falta configurar frontend/js/config.js con la URL y la anon key de tu proyecto de Supabase.'
  );
}

const supabaseClient = window.supabase.createClient(url, anonKey);
