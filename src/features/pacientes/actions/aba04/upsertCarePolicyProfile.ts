import { z } from 'zod';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { Database } from '@/types/supabase';
import {
  carePolicyProfileSchema,
  type CarePolicyProfileInput,
  normalizeText,
} from '@/features/pacientes/schemas/aba04AdminFinanceiro.schema';
import { normalizePolicyRuleSet, type PolicyRuleSet } from '@/features/pacientes/services/aba04/policyEngine';
import { cleanPayload, ensureSession, isTenantMissingError, makeActionError, safeUserId } from './shared';

const idSchema = z.string().uuid();

type CarePolicyProfileRow = Database['public']['Tables']['care_policy_profiles']['Row'];
type CarePolicyProfileInsert = Database['public']['Tables']['care_policy_profiles']['Insert'];
type CarePolicyProfileUpdate = Database['public']['Tables']['care_policy_profiles']['Update'];

export async function upsertCarePolicyProfile(payload: CarePolicyProfileInput): Promise<CarePolicyProfileRow> {
  const parsed = carePolicyProfileSchema.parse(payload);
  const supabase = getSupabaseClient();
  const session = await ensureSession(supabase);
  const userId = safeUserId(session);

  const normalizedRuleSet = normalizePolicyRuleSet(parsed.rule_set as PolicyRuleSet);

  if (parsed.id) {
    const parsedId = idSchema.safeParse(parsed.id);
    if (!parsedId.success) {
      throw new Error('ID do perfil invalido');
    }

    const { data: existing, error: loadError } = await supabase
      .from('care_policy_profiles')
      .select('*')
      .eq('id', parsedId.data)
      .maybeSingle();

    if (loadError) {
      if (isTenantMissingError(loadError)) {
        console.error('[patients] tenant_id ausente', loadError);
        throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
      }
      throw new Error(loadError.message);
    }

    if (!existing) {
      throw new Error('Perfil de politica nao encontrado');
    }

    const nextVersion = parsed.version ?? (existing.version ?? 1) + 1;

    const updatePayload: CarePolicyProfileUpdate = cleanPayload({
      name: normalizeText(parsed.name) ?? parsed.name,
      description: normalizeText(parsed.description),
      rule_set: normalizedRuleSet,
      is_default: parsed.is_default ?? existing.is_default,
      version: nextVersion,
      updated_by: userId,
    });

    const { data, error } = await supabase
      .from('care_policy_profiles')
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
      throw new Error('Falha ao atualizar perfil');
    }

    if (data.is_default) {
      await supabase.from('care_policy_profiles').update({ is_default: false }).eq('tenant_id', data.tenant_id).neq('id', data.id);
    }

    return data as CarePolicyProfileRow;
  }

  const insertPayload: CarePolicyProfileInsert = {
    name: normalizeText(parsed.name) ?? parsed.name,
    description: normalizeText(parsed.description),
    rule_set: normalizedRuleSet,
    is_default: parsed.is_default ?? false,
    version: parsed.version ?? 1,
    created_by: userId ?? undefined,
    updated_by: userId ?? undefined,
  };

  const { data, error } = await supabase
    .from('care_policy_profiles')
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
    throw new Error('Falha ao criar perfil');
  }

  if (data.is_default) {
    await supabase.from('care_policy_profiles').update({ is_default: false }).eq('tenant_id', data.tenant_id).neq('id', data.id);
  }

  return data as CarePolicyProfileRow;
}
