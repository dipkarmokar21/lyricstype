import { createClient } from '@supabase/supabase-js';
import env from './env.js';

let supabase = null;

if (env.supabase.url && env.supabase.serviceKey) {
  supabase = createClient(env.supabase.url, env.supabase.serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
} else {
  console.warn('[WARN] SUPABASE_URL or SUPABASE_SERVICE_KEY is missing. Database queries will fail until configured in .env.');
}

export default supabase;
