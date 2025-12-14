import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseAccessToken = process.env.NEXT_PUBLIC_SUPABASE_ACCESS_TOKEN;

let client: SupabaseClient<Database> | null = null;

export function getSupabaseClient(): SupabaseClient<Database> {
  if (client) return client;

  if (!supabaseUrl) {
    throw new Error(
      '[supabase] Missing env var NEXT_PUBLIC_SUPABASE_URL. Create a local env file (ex.: .env.local) and set it.',
    );
  }

  if (!supabaseAnonKey) {
    throw new Error(
      '[supabase] Missing env var NEXT_PUBLIC_SUPABASE_ANON_KEY. Create a local env file (ex.: .env.local) and set it.',
    );
  }

  client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      fetch: (input, init) => {
        if (!supabaseAccessToken) return fetch(input, init);

        const headers = new Headers(init?.headers);
        headers.set('Authorization', `Bearer ${supabaseAccessToken}`);

        return fetch(input, { ...init, headers });
      },
    },
  });
  return client;
}
