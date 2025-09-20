import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://degzhbaucvhisviqefsf.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlZ3poYmF1Y3ZoaXN2aXFlZnNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NDkxNzQsImV4cCI6MjA2NjIyNTE3NH0.tCH3nXj1N8uRMohb7g_ZiMmyewILnK4pWKfkrQtpxU4"

export const supabase = createClient(supabaseUrl, supabaseKey);
