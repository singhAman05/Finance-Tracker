import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL_PROD;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY_PROD;

if (!supabaseUrl || !supabaseServiceRole) {
  throw new Error('FATAL: SUPABASE_URL_PROD and SUPABASE_SERVICE_ROLE_KEY_PROD must be set.');
}

export const supabase = createClient(supabaseUrl, supabaseServiceRole, {
  auth: { persistSession: false, autoRefreshToken: false },
});
