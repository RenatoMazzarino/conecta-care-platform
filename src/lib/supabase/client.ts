import { createClient, type SupabaseClient, type SupabaseClientOptions } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// Aceita tanto NEXT_PUBLIC_SUPABASE_DEV_ACCESS_TOKEN quanto NEXT_PUBLIC_SUPABASE_ACCESS_TOKEN
const supabaseDevAccessToken =
  process.env.NEXT_PUBLIC_SUPABASE_DEV_ACCESS_TOKEN || process.env.NEXT_PUBLIC_SUPABASE_ACCESS_TOKEN;
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

  const options: SupabaseClientOptions<'public'> = {};

  // Só injetamos o fetch customizado se realmente precisarmos usar o token de dev.
  if (supabaseDevAccessToken && isDevelopment) {
    options.global = {
      fetch: (input, init) => {
        // Captura o fetch nativo do ambiente (navegador ou Node)
        // Usamos 'globalThis' para ser compatível com ambos
        const nativeFetch = globalThis.fetch;

        const requestUrl =
          typeof input === 'string' ? input : 'url' in input ? input.url : String(input);
        
        // Se não for uma chamada REST, passa direto
        if (!requestUrl.includes('/rest/v1')) {
          return nativeFetch(input, init);
        }

        const headers = new Headers(init?.headers);
        const currentAuth = headers.get('Authorization');
        
        // Se já tem auth específica (ex: usuário logado), respeita ela
        if (currentAuth && currentAuth !== `Bearer ${supabaseAnonKey}`) {
          return nativeFetch(input, init);
        }

        // Injeta o token de dev
        headers.set('Authorization', `Bearer ${supabaseDevAccessToken}`);

        return nativeFetch(input, { ...init, headers });
      },
    };
  } else if (supabaseDevAccessToken && !isDevelopment && !didWarnDevTokenInProd) {
    didWarnDevTokenInProd = true;
    console.warn(
      '[supabase] NEXT_PUBLIC_SUPABASE_DEV_ACCESS_TOKEN is set but NODE_ENV is not development. Ignoring it.',
    );
  }

  client = createClient<Database>(supabaseUrl, supabaseAnonKey, options);
  return client;
}
