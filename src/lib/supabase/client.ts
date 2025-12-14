import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseDevAccessToken = process.env.NEXT_PUBLIC_SUPABASE_DEV_ACCESS_TOKEN;
const isDevelopment = process.env.NODE_ENV === 'development';

let didWarnDevTokenInProd = false;

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
        if (!supabaseDevAccessToken) return fetch(input, init);

        if (!isDevelopment) {
          if (!didWarnDevTokenInProd) {
            didWarnDevTokenInProd = true;
            console.warn(
              '[supabase] NEXT_PUBLIC_SUPABASE_DEV_ACCESS_TOKEN is set but NODE_ENV is not development. Ignoring it.',
            );
          }
          return fetch(input, init);
        }

        const requestUrl =
          typeof input === 'string' ? input : 'url' in input ? input.url : String(input);
        if (!requestUrl.includes('/rest/v1')) {
          return fetch(input, init);
        }

        const headers = new Headers(init?.headers);
        const currentAuth = headers.get('Authorization');
        if (currentAuth && currentAuth !== `Bearer ${supabaseAnonKey}`) {
          return fetch(input, init);
        }
        headers.set('Authorization', `Bearer ${supabaseDevAccessToken}`);

        return fetch(input, { ...init, headers });
      },
    },
  });
  return client;
}
