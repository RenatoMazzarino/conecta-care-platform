import { z } from 'zod';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { Database } from '@/types/supabase';
import {
  careTeamMemberSchema,
  normalizeEmail,
  normalizePhone,
  normalizeText,
  type CareTeamMemberInput,
} from '@/features/pacientes/schemas/aba03RedeApoio.schema';
import { ensureSession, isTenantMissingError, makeActionError, safeUserId } from './shared';

type CareTeamInsert = Database['public']['Tables']['care_team_members']['Insert'];
type CareTeamUpdate = Database['public']['Tables']['care_team_members']['Update'];
type CareTeamRow = Database['public']['Tables']['care_team_members']['Row'];

const patientIdSchema = z.string().uuid();

function cleanPayload<T extends Record<string, unknown>>(payload: T): Partial<T> {
  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined)) as Partial<T>;
}

export async function upsertCareTeamMember(patientId: string, payload: CareTeamMemberInput) {
  const parsedPatientId = patientIdSchema.safeParse(patientId);
  if (!parsedPatientId.success) {
    throw new Error('ID do paciente invalido (esperado UUID)');
  }

  const parsed = careTeamMemberSchema.parse(payload);

  const supabase = getSupabaseClient();
  const session = await ensureSession(supabase);
  const userId = safeUserId(session);

  const normalized: Omit<CareTeamInsert, 'patient_id' | 'created_by'> = {
    professional_id: parsed.professional_id ?? null,
    profissional_nome: normalizeText(parsed.profissional_nome),
    role_in_case: normalizeText(parsed.role_in_case) ?? parsed.role_in_case,
    status: parsed.status ?? 'Ativo',
    regime: parsed.regime ?? null,
    contact_email: normalizeEmail(parsed.contact_email),
    contact_phone: normalizePhone(parsed.contact_phone),
    notes: normalizeText(parsed.notes),
    updated_by: userId,
  };

  if (parsed.id) {
    const updatePayload: CareTeamUpdate = cleanPayload(normalized);
    const { data, error } = await supabase
      .from('care_team_members')
      .update(updatePayload)
      .eq('id', parsed.id)
      .eq('patient_id', parsedPatientId.data)
      .is('deleted_at', null)
      .select('*')
      .maybeSingle();

    if (error) {
      if (isTenantMissingError(error)) {
        console.error('[patients] tenant_id ausente', error);
        throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
      }
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error('Profissional nao encontrado');
    }

    return data as CareTeamRow;
  }

  const insertPayload: CareTeamInsert = {
    ...normalized,
    patient_id: parsedPatientId.data,
    created_by: userId,
  };
  const { data, error } = await supabase
    .from('care_team_members')
    .insert(insertPayload)
    .select('*')
    .maybeSingle();

  if (error) {
    if (isTenantMissingError(error)) {
      console.error('[patients] tenant_id ausente', error);
      throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
    }
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('Falha ao criar profissional');
  }

  return data as CareTeamRow;
}
