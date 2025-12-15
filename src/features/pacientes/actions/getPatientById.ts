import { z } from 'zod';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { Database } from '@/types/supabase';

export type PatientRow = Database['public']['Tables']['patients']['Row'];

const patientIdSchema = z.string().uuid();

const isDevBypassEnabled =
  process.env.NODE_ENV === 'development' && Boolean(process.env.NEXT_PUBLIC_SUPABASE_DEV_ACCESS_TOKEN);

function makeActionError(code: string, message: string): Error {
  const error = new Error(message);
  (error as unknown as { code: string }).code = code;
  return error;
}

function isTenantMissingError(error: { code?: string | null; message?: string }) {
  return error.code === '22023' || Boolean(error.message?.includes('tenant_id ausente'));
}

export async function getPatientById(patientId: string): Promise<PatientRow> {
  const parsed = patientIdSchema.safeParse(patientId);
  if (!parsed.success) {
    throw new Error('ID do paciente inválido (esperado UUID)');
  }
  const supabase = getSupabaseClient();

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  if (sessionError) {
    console.error('[auth] getSession failed', sessionError);
  }
  if (!session && !isDevBypassEnabled) {
    throw makeActionError('UNAUTHENTICATED', 'Faça login para acessar');
  }

  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', parsed.data)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) {
    if (isTenantMissingError(error)) {
      console.error('[patients] tenant_id ausente', error);
      throw makeActionError('TENANT_MISSING', 'Conta sem organização vinculada (tenant)');
    }
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('Paciente não encontrado');
  }

  return data;
}
