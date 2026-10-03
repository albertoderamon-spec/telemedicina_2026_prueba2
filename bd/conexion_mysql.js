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
