import type { Database } from '@/types/supabase';
import { cleanPayload, isTenantMissingError, makeActionError, type SupabaseClientType } from './shared';

type AdminFinancialProfileRow = Database['public']['Tables']['patient_admin_financial_profile']['Row'];
type AdminFinancialProfileInsert = Database['public']['Tables']['patient_admin_financial_profile']['Insert'];
type AdminFinancialProfileUpdate = Database['public']['Tables']['patient_admin_financial_profile']['Update'];

export async function upsertAdminFinancialProfile(
  supabase: SupabaseClientType,
  patientId: string,
  payload: AdminFinancialProfileUpdate,
  userId: string | null,
): Promise<AdminFinancialProfileRow> {
  const updatePayload: AdminFinancialProfileUpdate = cleanPayload({
    ...payload,
    updated_by: userId,
  });

  const { data: updated, error: updateError } = await supabase
    .from('patient_admin_financial_profile')
    .update(updatePayload)
    .eq('patient_id', patientId)
    .is('deleted_at', null)
    .select('*')
    .maybeSingle();

  if (updateError) {
    if (isTenantMissingError(updateError)) {
      console.error('[patients] tenant_id ausente', updateError);
      throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
    }
    throw new Error(updateError.message);
  }

  if (updated) {
    return updated as AdminFinancialProfileRow;
  }

  const insertPayload: AdminFinancialProfileInsert = {
    ...payload,
    patient_id: patientId,
    created_by: userId ?? undefined,
    updated_by: userId ?? undefined,
  };

  const { data: inserted, error: insertError } = await supabase
    .from('patient_admin_financial_profile')
    .insert(insertPayload)
    .select('*')
    .maybeSingle();

  if (insertError) {
    if (isTenantMissingError(insertError)) {
      console.error('[patients] tenant_id ausente', insertError);
      throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
    }
    throw new Error(insertError.message);
  }

  if (!inserted) {
    throw new Error('Falha ao criar perfil administrativo/financeiro');
  }

  return inserted as AdminFinancialProfileRow;
}
