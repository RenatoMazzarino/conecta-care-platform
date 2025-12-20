import { z } from 'zod';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { Database } from '@/types/supabase';

export type PatientAddressRow = Database['public']['Tables']['patient_addresses']['Row'];
export type PatientAddressLogisticsRow = Database['public']['Tables']['patient_address_logistics']['Row'];
export type PatientAddressWithLogistics = PatientAddressRow & { logistics: PatientAddressLogisticsRow | null };

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

function extractLogistics(row: {
  patient_address_logistics?: PatientAddressLogisticsRow | PatientAddressLogisticsRow[] | null;
}): PatientAddressLogisticsRow | null {
  const value = row.patient_address_logistics;
  if (!value) return null;
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

export async function getPatientAddresses(patientId: string): Promise<PatientAddressWithLogistics[]> {
  const parsed = patientIdSchema.safeParse(patientId);
  if (!parsed.success) {
    throw new Error('ID do paciente invalido (esperado UUID)');
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
    throw makeActionError('UNAUTHENTICATED', 'Faca login para acessar');
  }

  const { data, error } = await supabase
    .from('patient_addresses')
    .select('*, patient_address_logistics(*)')
    .eq('patient_id', parsed.data)
    .is('deleted_at', null)
    .order('is_primary', { ascending: false })
    .order('created_at', { ascending: true });

  if (error) {
    if (isTenantMissingError(error)) {
      console.error('[patients] tenant_id ausente', error);
      throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
    }
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => {
    const { patient_address_logistics, ...rest } = row as PatientAddressRow & {
      patient_address_logistics?: PatientAddressLogisticsRow | PatientAddressLogisticsRow[] | null;
    };
    return {
      ...rest,
      logistics: extractLogistics({ patient_address_logistics }),
    };
  });
}
