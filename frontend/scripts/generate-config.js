// Genera frontend/js/config.js a partir de variables de entorno.
// Se corre automaticamente en el build de Vercel (ver package.json).
// No requiere ninguna dependencia externa (Node puro), asi el build es instantaneo.

const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    '\n⚠️  Faltan las variables de entorno SUPABASE_URL y/o SUPABASE_ANON_KEY.\n' +
    '   El sitio se va a generar igual, pero no va a poder conectarse a Supabase\n' +
    '   hasta que las configures en Project Settings -> Environment Variables (Vercel)\n' +
    '   o en un archivo .env local (ver .env.example).\n'
  );
}

const contenido = `// ARCHIVO GENERADO AUTOMATICAMENTE por scripts/generate-config.js -- no editar a mano.
// Los valores salen de las variables de entorno SUPABASE_URL y SUPABASE_ANON_KEY.
window.SUPABASE_CONFIG = {
  url: ${JSON.stringify(SUPABASE_URL)},
  anonKey: ${JSON.stringify(SUPABASE_ANON_KEY)},
};
`;

const destino = path.join(__dirname, '..', 'js', 'config.js');
fs.writeFileSync(destino, contenido, 'utf8');
console.log(`config.js generado en ${destino}`);
