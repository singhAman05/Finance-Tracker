import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL_PROD;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY_PROD;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY_PROD;

if (!supabaseUrl || !supabaseServiceRole) {
  throw new Error('FATAL: SUPABASE_URL_PROD and SUPABASE_SERVICE_ROLE_KEY_PROD must be set.');
}

/**
 * Admin client — uses service role key (bypasses RLS).
 * ONLY use for operations that require elevated privileges:
 *   - User creation/lookup during authentication
 *   - System-level operations
 * All user-scoped queries MUST use `supabase` instead.
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole, {
  auth: { persistSession: false, autoRefreshToken: false },
});

/**
 * Standard client — uses anon key when available, falls back to service role.
 * All user-scoped queries MUST include a `.eq('client_id', userId)` filter.
 * This ensures that even if RLS policies change, queries remain scoped.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey || supabaseServiceRole, {
  auth: { persistSession: false, autoRefreshToken: false },
});
