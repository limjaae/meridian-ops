import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gvptaqxqvvurqojpvjnt.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2cHRhcXhxdnZ1cnFvanB2am50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzNzkzOTIsImV4cCI6MjEwMDk1NTM5Mn0.ZSVu-2vL42m8xvaM0SNvJ2hLwLsqNui7fjz51BF0kyk';

export function getSupabaseClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  });
}
