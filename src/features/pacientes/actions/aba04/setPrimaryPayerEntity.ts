import { z } from 'zod';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { Database } from '@/types/supabase';
import { normalizeDocNumber, normalizeText } from '@/features/pacientes/schemas/aba04AdminFinanceiro.schema';
import { recordPatientTimelineEvent } from './recordPatientTimelineEvent';
import { ensureSession, isTenantMissingError, makeActionError, safeUserId } from './shared';
import { upsertAdminFinancialProfile } from './profileHelpers';

type BillingEntityRow = Database['public']['Tables']['billing_entities']['Row'];
type RelatedPersonRow = Database['public']['Tables']['patient_related_persons']['Row'];

type RelatedPersonInsert = Database['public']['Tables']['patient_related_persons']['Insert'];
type RelatedPersonUpdate = Database['public']['Tables']['patient_related_persons']['Update'];

const patientIdSchema = z.string().uuid();
const entityIdSchema = z.string().uuid();

async function upsertPayerRelatedPerson(
  supabase: ReturnType<typeof getSupabaseClient>,
  patientId: string,
  entity: BillingEntityRow,
  userId: string | null,
) {
  const name = normalizeText(entity.name) ?? entity.name;
  const cpf = normalizeDocNumber(entity.doc_number);

  let existing: RelatedPersonRow | null = null;

  if (cpf) {
    const { data, error } = await supabase
      .from('patient_related_persons')
      .select('*')
      .eq('patient_id', patientId)
      .eq('cpf', cpf)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) {
      if (isTenantMissingError(error)) {
        console.error('[patients] tenant_id ausente', error);
        throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
      }
      throw new Error(error.message);
    }

    existing = data as RelatedPersonRow | null;
  }

  if (!existing) {
    const { data, error } = await supabase
      .from('patient_related_persons')
      .select('*')
      .eq('patient_id', patientId)
      .eq('role_type', 'Pagador')
      .ilike('name', name)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) {
      if (isTenantMissingError(error)) {
        console.error('[patients] tenant_id ausente', error);
        throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
      }
      throw new Error(error.message);
    }

    existing = data as RelatedPersonRow | null;
  }

  if (existing) {
    const updatePayload: RelatedPersonUpdate = {
      name,
      cpf: cpf ?? existing.cpf,
      role_type: 'Pagador',
      is_payer: true,
      updated_by: userId,
    };

    const { data, error } = await supabase
      .from('patient_related_persons')
      .update(updatePayload)
      .eq('id', existing.id)
      .select('*')
      .maybeSingle();

    if (error) {
      if (isTenantMissingError(error)) {
        console.error('[patients] tenant_id ausente', error);
        throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
      }
      throw new Error(error.message);
    }

    return (data ?? existing) as RelatedPersonRow;
  }

  const insertPayload: RelatedPersonInsert = {
    patient_id: patientId,
    name,
    cpf: cpf ?? null,
    role_type: 'Pagador',
    is_payer: true,
    created_by: userId ?? undefined,
    updated_by: userId ?? undefined,
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
    throw new Error('Falha ao criar pagador PF na rede de apoio');
  }

  return data as RelatedPersonRow;
}

export async function setPrimaryPayerEntity(patientId: string, billingEntityId: string) {
  const parsedPatientId = patientIdSchema.safeParse(patientId);
  if (!parsedPatientId.success) {
    throw new Error('ID do paciente invalido (esperado UUID)');
  }

  const parsedEntityId = entityIdSchema.safeParse(billingEntityId);
  if (!parsedEntityId.success) {
    throw new Error('ID da entidade pagadora invalido');
  }

  const supabase = getSupabaseClient();
  const session = await ensureSession(supabase);
  const userId = safeUserId(session);

  const { data: entity, error: entityError } = await supabase
    .from('billing_entities')
    .select('*')
    .eq('id', parsedEntityId.data)
    .is('deleted_at', null)
    .maybeSingle();

  if (entityError) {
    if (isTenantMissingError(entityError)) {
      console.error('[patients] tenant_id ausente', entityError);
      throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
    }
    throw new Error(entityError.message);
  }

  if (!entity) {
    throw new Error('Pagador nao encontrado');
  }

  let relatedPersonId: string | null = null;

  if (entity.kind === 'person') {
    const relatedPerson = await upsertPayerRelatedPerson(supabase, parsedPatientId.data, entity, userId);
    relatedPersonId = relatedPerson.id;
  }

  const updatedProfile = await upsertAdminFinancialProfile(
    supabase,
    parsedPatientId.data,
    {
      primary_payer_entity_id: entity.id,
      primary_payer_related_person_id: relatedPersonId,
    },
    userId,
  );

  await recordPatientTimelineEvent(parsedPatientId.data, {
    event_type: 'primary_payer_changed',
    event_category: 'billing',
    title: 'Pagador principal atualizado',
    payload: {
      billing_entity_id: entity.id,
      kind: entity.kind,
      related_person_id: relatedPersonId,
    },
  });

  return { profile: updatedProfile, payer: entity, relatedPersonId };
}
