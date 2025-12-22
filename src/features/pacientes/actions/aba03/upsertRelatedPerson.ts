import { z } from 'zod';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { Database } from '@/types/supabase';
import {
  relatedPersonUpsertSchema,
  normalizeEmail,
  normalizePhone,
  normalizeText,
  type RelatedPersonUpsertInput,
} from '@/features/pacientes/schemas/aba03RedeApoio.schema';
import { ensureSession, isTenantMissingError, makeActionError, resolveBoolean, safeUserId } from './shared';

type RelatedPersonInsert = Database['public']['Tables']['patient_related_persons']['Insert'];
type RelatedPersonUpdate = Database['public']['Tables']['patient_related_persons']['Update'];
type RelatedPersonRow = Database['public']['Tables']['patient_related_persons']['Row'];

const patientIdSchema = z.string().uuid();

function cleanPayload<T extends Record<string, unknown>>(payload: T): Partial<T> {
  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined)) as Partial<T>;
}

export async function upsertRelatedPerson(
  patientId: string,
  payload: RelatedPersonUpsertInput,
): Promise<Record<string, unknown>> {
  const parsedPatientId = patientIdSchema.safeParse(patientId);
  if (!parsedPatientId.success) {
    throw new Error('ID do paciente invalido (esperado UUID)');
  }

  const parsed = relatedPersonUpsertSchema.parse(payload);

  const supabase = getSupabaseClient();
  const session = await ensureSession(supabase);
  const userId = safeUserId(session);

  const normalized: Omit<RelatedPersonInsert, 'patient_id' | 'created_by'> = {
    name: normalizeText(parsed.name) ?? parsed.name,
    relationship_degree: normalizeText(parsed.relationship_degree) ?? parsed.relationship_degree,
    contact_type: parsed.contact_type,
    phone_primary: normalizePhone(parsed.phone_primary) ?? null,
    phone_secondary: normalizePhone(parsed.phone_secondary) ?? null,
    email: normalizeEmail(parsed.email) ?? null,
    contact_time_preference: parsed.contact_time_preference ?? null,
    preferred_contact: parsed.preferred_contact ?? null,
    is_legal_guardian: resolveBoolean(parsed.is_legal_guardian),
    is_emergency_contact: resolveBoolean(parsed.is_emergency_contact),
    is_financial_responsible: resolveBoolean(parsed.is_financial_responsible),
    can_authorize_clinical: resolveBoolean(parsed.can_authorize_clinical),
    can_authorize_financial: resolveBoolean(parsed.can_authorize_financial),
    is_main_contact: resolveBoolean(parsed.is_main_contact),
    lives_with_patient: parsed.lives_with_patient ?? null,
    visit_frequency: normalizeText(parsed.visit_frequency),
    access_to_home: resolveBoolean(parsed.access_to_home),
    cpf: normalizeText(parsed.cpf),
    rg: normalizeText(parsed.rg),
    rg_issuer: normalizeText(parsed.rg_issuer),
    rg_state: normalizeText(parsed.rg_state),
    birth_date: parsed.birth_date ?? null,
    address_full: normalizeText(parsed.address_full),
    address_street: normalizeText(parsed.address_street),
    address_number: normalizeText(parsed.address_number),
    address_city: normalizeText(parsed.address_city),
    address_state: normalizeText(parsed.address_state),
    address_summary: normalizeText(parsed.address_summary),
    relation_description: normalizeText(parsed.relation_description),
    allow_clinical_updates: resolveBoolean(parsed.allow_clinical_updates, true),
    allow_admin_notif: resolveBoolean(parsed.allow_admin_notif, true),
    block_marketing: resolveBoolean(parsed.block_marketing),
    observations: normalizeText(parsed.observations),
    observacoes_lgpd: normalizeText(parsed.observacoes_lgpd),
    updated_by: userId,
  };

  let row: RelatedPersonRow | null = null;

  if (parsed.id) {
    const updatePayload: RelatedPersonUpdate = cleanPayload(normalized);
    const { data, error } = await supabase
      .from('patient_related_persons')
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
      throw new Error('Contato nao encontrado');
    }

    row = data;
  } else {
    const insertPayload: RelatedPersonInsert = {
      ...normalized,
      patient_id: parsedPatientId.data,
      created_by: userId,
    };
    const { data, error } = await supabase
      .from('patient_related_persons')
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
      throw new Error('Falha ao criar contato');
    }

    row = data;
  }

  if (row && parsed.is_main_contact) {
    const { error: mainContactError } = await supabase
      .from('patient_related_persons')
      .update({ is_main_contact: false })
      .eq('patient_id', parsedPatientId.data)
      .is('deleted_at', null)
      .neq('id', row.id);
    if (mainContactError) {
      if (isTenantMissingError(mainContactError)) {
        console.error('[patients] tenant_id ausente', mainContactError);
        throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
      }
      throw new Error(mainContactError.message);
    }
  }

  if (row && parsed.is_legal_guardian) {
    const { error: guardianError } = await supabase
      .from('patient_related_persons')
      .update({ is_legal_guardian: false })
      .eq('patient_id', parsedPatientId.data)
      .is('deleted_at', null)
      .neq('id', row.id);
    if (guardianError) {
      if (isTenantMissingError(guardianError)) {
        console.error('[patients] tenant_id ausente', guardianError);
        throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
      }
      throw new Error(guardianError.message);
    }
  }

  return row;
}
