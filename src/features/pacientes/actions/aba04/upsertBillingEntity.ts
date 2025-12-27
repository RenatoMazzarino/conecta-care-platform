import { z } from 'zod';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { Database } from '@/types/supabase';
import {
  billingEntitySchema,
  type BillingEntityInput,
  normalizeDocNumber,
  normalizeEmail,
  normalizePhone,
  normalizeText,
} from '@/features/pacientes/schemas/aba04AdminFinanceiro.schema';
import { cleanPayload, ensureSession, isTenantMissingError, makeActionError, safeUserId } from './shared';

const idSchema = z.string().uuid();

type BillingEntityRow = Database['public']['Tables']['billing_entities']['Row'];

type BillingEntityInsert = Database['public']['Tables']['billing_entities']['Insert'];

type BillingEntityUpdate = Database['public']['Tables']['billing_entities']['Update'];

function normalizePayload(payload: BillingEntityInput): BillingEntityInsert {
  return {
    id: payload.id ?? undefined,
    kind: payload.kind,
    name: normalizeText(payload.name) ?? payload.name,
    legal_name: normalizeText(payload.legal_name),
    doc_type: normalizeText(payload.doc_type),
    doc_number: normalizeDocNumber(payload.doc_number),
    contact_email: normalizeEmail(payload.contact_email),
    contact_phone: normalizePhone(payload.contact_phone),
    billing_address_cep: normalizeText(payload.billing_address_cep),
    billing_address_street: normalizeText(payload.billing_address_street),
    billing_address_number: normalizeText(payload.billing_address_number),
    billing_address_neighborhood: normalizeText(payload.billing_address_neighborhood),
    billing_address_city: normalizeText(payload.billing_address_city),
    billing_address_state: normalizeText(payload.billing_address_state),
  };
}

export async function upsertBillingEntity(payload: BillingEntityInput): Promise<BillingEntityRow> {
  const parsed = billingEntitySchema.parse(payload);
  const supabase = getSupabaseClient();
  const session = await ensureSession(supabase);
  const userId = safeUserId(session);

  const normalized = normalizePayload(parsed);
  const docNumber = normalized.doc_number ?? null;
  const docType = normalized.doc_type ?? null;

  if (docNumber) {
    if (!docType) {
      throw new Error('Tipo de documento obrigatorio para deduplicacao');
    }
    const { data: existing, error } = await supabase
      .from('billing_entities')
      .select('*')
      .eq('kind', normalized.kind)
      .eq('doc_number', docNumber)
      .eq('doc_type', docType)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) {
      if (isTenantMissingError(error)) {
        console.error('[patients] tenant_id ausente', error);
        throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
      }
      throw new Error(error.message);
    }

    if (existing && (!parsed.id || existing.id !== parsed.id)) {
      const updatePayload: BillingEntityUpdate = cleanPayload({
        ...normalized,
        updated_by: userId,
      });

      const { data: updated, error: updateError } = await supabase
        .from('billing_entities')
        .update(updatePayload)
        .eq('id', existing.id)
        .select('*')
        .maybeSingle();

      if (updateError) {
        if (isTenantMissingError(updateError)) {
          console.error('[patients] tenant_id ausente', updateError);
          throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
        }
        throw new Error(updateError.message);
      }

      return (updated ?? existing) as BillingEntityRow;
    }
  } else {
    const nameKey = normalizeText(normalized.legal_name ?? normalized.name);
    if (nameKey) {
      const { data: existing, error } = await supabase
        .from('billing_entities')
        .select('*')
        .eq('kind', normalized.kind)
        .or(`legal_name.ilike.${nameKey},name.ilike.${nameKey}`)
        .is('deleted_at', null)
        .maybeSingle();

      if (error) {
        if (isTenantMissingError(error)) {
          console.error('[patients] tenant_id ausente', error);
          throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
        }
        throw new Error(error.message);
      }

      if (existing && (!parsed.id || existing.id !== parsed.id)) {
        return existing as BillingEntityRow;
      }
    }
  }

  if (parsed.id) {
    const parsedId = idSchema.safeParse(parsed.id);
    if (!parsedId.success) {
      throw new Error('ID do pagador invalido');
    }

    const updatePayload: BillingEntityUpdate = cleanPayload({
      ...normalized,
      updated_by: userId,
    });

    const { data, error } = await supabase
      .from('billing_entities')
      .update(updatePayload)
      .eq('id', parsedId.data)
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
      throw new Error('Pagador nao encontrado');
    }

    return data as BillingEntityRow;
  }

  const insertPayload: BillingEntityInsert = {
    ...normalized,
    created_by: userId ?? undefined,
    updated_by: userId ?? undefined,
  };

  const { data, error } = await supabase
    .from('billing_entities')
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
    throw new Error('Falha ao criar pagador');
  }

  return data as BillingEntityRow;
}
