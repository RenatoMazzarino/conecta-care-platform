import { z } from 'zod';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { Database } from '@/types/supabase';

export type PatientRow = Database['public']['Tables']['patients']['Row'];

const patientIdSchema = z.string().uuid();

export async function getPatientById(patientId: string): Promise<PatientRow> {
  const parsed = patientIdSchema.safeParse(patientId);
  if (!parsed.success) {
    throw new Error('ID do paciente inválido (esperado UUID)');
  }
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', parsed.data)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('Paciente não encontrado');
  }

  return data;
}
