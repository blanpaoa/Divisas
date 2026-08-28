// Configuración de Supabase utilizando variables de entorno
// Se leen desde process.env (en entornos con bundler o servidor)
// o desde propiedades globales de window (window.SUPABASE_URL, window.SUPABASE_ANON_KEY, window.ENV).

(function () {
  const getEnv = (key) => {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
    if (typeof window !== 'undefined') {
      if (window.ENV && window.ENV[key]) return window.ENV[key];
      if (window[key]) return window[key];
    }
    return '';
  };

  window.SUPABASE_CONFIG = {
    url: getEnv('SUPABASE_URL') || getEnv('VITE_SUPABASE_URL') || getEnv('NEXT_PUBLIC_SUPABASE_URL'),
    anonKey: getEnv('SUPABASE_ANON_KEY') || getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  };
})();