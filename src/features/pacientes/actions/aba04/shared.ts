import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import {
  ensureSession,
  isTenantMissingError,
  makeActionError,
  safeUserId,
  resolveBoolean,
  isDevBypassEnabled,
} from '../aba03/shared';

export {
  ensureSession,
  isTenantMissingError,
  makeActionError,
  safeUserId,
  resolveBoolean,
  isDevBypassEnabled,
};

export function cleanPayload<T extends Record<string, unknown>>(payload: T): Partial<T> {
  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined)) as Partial<T>;
}

export type SupabaseClientType = SupabaseClient<Database>;
