import { z } from 'zod';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { Database } from '@/types/supabase';

export type PatientRow = Database['public']['Tables']['patients']['Row'];

const patientIdSchema = z.string().uuid();

export async function getPatientById(patientId: string): Promise<PatientRow> {
  const parsedPatientId = patientIdSchema.parse(patientId);
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', parsedPatientId)
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

