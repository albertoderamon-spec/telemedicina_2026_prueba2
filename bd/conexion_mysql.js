/*
const { createClient } = require('@supabase/supabase-js');

// Configuración con las credenciales de tu proyecto en Supabase
const SUPABASE_URL = 'https://niudvlqdmmtwjtwsxhzo.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'sb_secret_ftPy8JwqZ3mZSsIeYJtjgg_HdXxCKyg';

// Validación previa del formato de la URL
if (!SUPABASE_URL || !SUPABASE_URL.startsWith('http')) {
  console.error('Error: SUPABASE_URL no es válida o está vacía:', SUPABASE_URL);
  process.exit(1);
}

const conexion = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

module.exports = conexion;
*/
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://niudvlqdmmtwjtwsxhzo.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'sb_secret_ftPy8JwqZ3mZSsIeYJtjgg_HdXxCKyg';



console.log('================================');
console.log('DIAGNOSTICO SUPABASE');
console.log('================================');

console.log('URL completa:', SUPABASE_URL);

try {
  const proyecto = SUPABASE_URL
    .replace('https://', '')
    .replace('.supabase.co', '');

  console.log('ID Proyecto:', proyecto);
} catch (e) {
  console.log('No se pudo extraer el ID del proyecto');
}

console.log('Longitud clave:',
  SUPABASE_SERVICE_ROLE_KEY
    ? SUPABASE_SERVICE_ROLE_KEY.length
    : 0
);

console.log(
  'Prefijo clave:',
  SUPABASE_SERVICE_ROLE_KEY
    ? SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)
    : 'VACIA'
);

console.log(
  'URL valida:',
  SUPABASE_URL &&
  SUPABASE_URL.startsWith('https://')
);

console.log(
  'KEY definida:',
  !!SUPABASE_SERVICE_ROLE_KEY
);

const conexion = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
);

async function testConexion() {

  console.log('--------------------------------');
  console.log('PROBANDO CONEXION');
  console.log('--------------------------------');

  try {

    const { data, error } =
      await conexion
        .from('categorias')
        .select('*')
        .limit(1);

    if (error) {

      console.log('ERROR SUPABASE:');
      console.log(error);

      console.log('message:', error.message);
      console.log('details:', error.details);
      console.log('hint:', error.hint);
      console.log('code:', error.code);

    } else {

      console.log('Conexion correcta');
      console.log('Datos:', data);

    }

  } catch (err) {

    console.log('EXCEPCION');
    console.log(err);

  }
}

testConexion();

module.exports = conexion;
