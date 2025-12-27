import { z } from 'zod';
import type { Database } from '@/types/supabase';
import { getSupabaseClient } from '@/lib/supabase/client';
import {
  onboardingChecklistUpdateSchema,
  type OnboardingChecklistItemInput,
} from '@/features/pacientes/schemas/aba04AdminFinanceiro.schema';
import { recordPatientTimelineEvent } from './recordPatientTimelineEvent';
import { ensureSession, isTenantMissingError, makeActionError, safeUserId } from './shared';
import { upsertAdminFinancialProfile } from './profileHelpers';

const patientIdSchema = z.string().uuid();

type ChecklistRow = Database['public']['Tables']['patient_onboarding_checklist']['Row'];

function buildItemPayload(item: OnboardingChecklistItemInput, userId: string | null) {
  const isCompleted = Boolean(item.is_completed);
  const completedAt = isCompleted ? item.completed_at ?? new Date().toISOString() : null;
  const completedByUserId = isCompleted ? item.completed_by_user_id ?? userId : null;

  return {
    item_code: item.item_code,
    item_description: item.item_description ?? null,
    is_completed: isCompleted,
    completed_at: completedAt,
    completed_by_user_id: completedByUserId,
    completed_by_label: item.completed_by_label ?? null,
    document_id: item.document_id ?? null,
  };
}

export async function updateOnboardingChecklist(patientId: string, payload: OnboardingChecklistItemInput[]) {
  const parsedPatientId = patientIdSchema.safeParse(patientId);
  if (!parsedPatientId.success) {
    throw new Error('ID do paciente invalido (esperado UUID)');
  }

  const parsedItems = onboardingChecklistUpdateSchema.parse(payload);
  const supabase = getSupabaseClient();
  const session = await ensureSession(supabase);
  const userId = safeUserId(session);

  const { data: existingRows, error: existingError } = await supabase
    .from('patient_onboarding_checklist')
    .select('*')
    .eq('patient_id', parsedPatientId.data)
    .is('deleted_at', null);

  if (existingError) {
    if (isTenantMissingError(existingError)) {
      console.error('[patients] tenant_id ausente', existingError);
      throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
    }
    throw new Error(existingError.message);
  }

  const existingMap = new Map((existingRows ?? []).map((row) => [row.item_code, row]));
  const updatedRows: ChecklistRow[] = [];

  for (const item of parsedItems) {
    const payloadBase = buildItemPayload(item, userId);
    const existing = existingMap.get(item.item_code);

    if (existing) {
      const { data, error } = await supabase
        .from('patient_onboarding_checklist')
        .update({
          ...payloadBase,
          updated_by: userId,
        })
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

      if (data) {
        updatedRows.push(data as ChecklistRow);
      }
    } else {
      const { data, error } = await supabase
        .from('patient_onboarding_checklist')
        .insert({
          patient_id: parsedPatientId.data,
          ...payloadBase,
          created_by: userId ?? undefined,
          updated_by: userId ?? undefined,
        })
        .select('*')
        .maybeSingle();

      if (error) {
        if (isTenantMissingError(error)) {
          console.error('[patients] tenant_id ausente', error);
          throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
        }
        throw new Error(error.message);
      }

      if (data) {
        updatedRows.push(data as ChecklistRow);
      }
    }
  }

  const untouchedRows = (existingRows ?? []).filter((row) => !parsedItems.some((item) => item.item_code === row.item_code));
  const combinedRows = [...updatedRows, ...untouchedRows];
  const allCompleted = combinedRows.length > 0 && combinedRows.every((item) => item.is_completed);

  await upsertAdminFinancialProfile(
    supabase,
    parsedPatientId.data,
    { checklist_complete: allCompleted },
    userId,
  );

  await recordPatientTimelineEvent(parsedPatientId.data, {
    event_type: 'checklist_updated',
    event_category: 'checklist',
    title: 'Checklist atualizado',
    payload: {
      total: combinedRows.length,
      completed: combinedRows.filter((item) => item.is_completed).length,
    },
  });

  return combinedRows;
}
