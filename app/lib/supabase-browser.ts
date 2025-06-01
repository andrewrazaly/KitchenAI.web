'use client';

import { createClient } from '@supabase/supabase-js';

// Create a single instance of the Supabase client to be used throughout the application
let supabaseInstance: ReturnType<typeof createClient> | null = null;

export function createClientBrowser() {
  if (supabaseInstance) return supabaseInstance;
  
  supabaseInstance = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      },
      global: {
        headers: {
          'X-Client-Info': 'kitchenai'
        }
      }
    }
  );
  
  return supabaseInstance;
} 