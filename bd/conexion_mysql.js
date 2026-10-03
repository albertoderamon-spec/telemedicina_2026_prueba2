

// ===============================
// CONFIGURACIÓN  SUPERBASE
// ===============================
const SUPABASE_URL = 'https://fcxosritwrpjrklbquog.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'sb_secret_jCT1FxWKK2qYQRLqNWglvg_cyWW0yX9';

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    realtime: {
      transport: WebSocket
    }
  }
);
