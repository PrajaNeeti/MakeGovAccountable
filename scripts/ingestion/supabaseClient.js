const fs = require('fs');
const path = require('path');

function getSupabaseClient() {
  let supabaseModule;
  try {
    supabaseModule = require('@supabase/supabase-js');
  } catch (e) {
    const frontendSupabasePath = path.join(__dirname, '..', '..', 'frontend', 'node_modules', '@supabase', 'supabase-js');
    supabaseModule = require(frontendSupabasePath);
  }

  const { createClient } = supabaseModule;

  let url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  let key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    const envPath = path.join(__dirname, '..', '..', 'frontend', '.env.local');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split('\n').forEach(line => {
        const [k, v] = line.split('=');
        if (k && v) {
          if (k.trim() === 'NEXT_PUBLIC_SUPABASE_URL') url = v.trim();
          if (k.trim() === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') key = v.trim();
        }
      });
    }
  }

  if (!url || !key) {
    throw new Error('Supabase URL and Key must be provided in environment or frontend/.env.local');
  }

  return createClient(url, key);
}

module.exports = { getSupabaseClient };
