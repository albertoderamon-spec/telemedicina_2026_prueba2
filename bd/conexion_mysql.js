const { createClient } = require('@supabase/supabase-js');

// 1. Carga las credenciales desde las variables de entorno de tu servidor
// Asegúrate de que coincidan exactamente con las del dashboard de Supabase
const SUPABASE_URL = 'https://fcxosritwrpjrklbquog.supabase.co';
const SUPABASE_KEY = 'sb_publishable_OJU7bXAfy3DTbhCauRxu7A_lRICJZM6';

// 2. Validación previa del formato de la URL
if (!SUPABASE_URL || !SUPABASE_URL.startsWith('https://')) {
  console.error('Error: SUPABASE_URL no es válida, debe empezar con https://');
  process.exit(1);
}

if (!SUPABASE_KEY) {
  console.error('Error: La API Key de Supabase está vacía o no se ha cargado.');
  process.exit(1);
}

// 3. Inicialización del cliente
const conexion = createClient(SUPABASE_URL, SUPABASE_KEY);

module.exports = conexion;
