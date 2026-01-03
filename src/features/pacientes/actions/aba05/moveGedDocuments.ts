import { z } from 'zod';
import type { Json } from '@/types/supabase';
import { getSupabaseClient } from '@/lib/supabase/client';
import { ensureSession, isTenantMissingError, makeActionError, safeUserId } from '../aba03/shared';

const documentIdsSchema = z.array(z.string().uuid()).min(1);
const folderIdSchema = z.string().uuid().nullable();

export async function moveGedDocuments(documentIds: string[], folderId: string | null) {
  const parsedDocs = documentIdsSchema.safeParse(documentIds);
  if (!parsedDocs.success) {
    throw new Error('IDs invalidos para mover documentos');
  }

  const parsedFolder = folderIdSchema.safeParse(folderId ?? null);
  if (!parsedFolder.success) {
    throw new Error('Pasta destino invalida');
  }

  const supabase = getSupabaseClient();
  const session = await ensureSession(supabase);
  const userId = safeUserId(session);
  const now = new Date().toISOString();

  const { data: existing, error: fetchError } = await supabase
    .from('patient_documents')
    .select('id, folder_id')
    .in('id', parsedDocs.data)
    .is('deleted_at', null);

  if (fetchError) {
    if (isTenantMissingError(fetchError)) {
      console.error('[patients] tenant_id ausente', fetchError);
      throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
    }
    throw new Error(fetchError.message);
  }

  const { data: updated, error: updateError } = await supabase
    .from('patient_documents')
    .update({
      folder_id: parsedFolder.data,
      updated_by: userId,
      last_updated_by: userId,
      last_updated_at: now,
    })
    .in('id', parsedDocs.data)
    .is('deleted_at', null)
    .select('id');

  if (updateError) {
    if (isTenantMissingError(updateError)) {
      console.error('[patients] tenant_id ausente', updateError);
      throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
    }
    throw new Error(updateError.message);
  }

  const updatedIds = (updated ?? []).map((row) => row.id).filter(Boolean);
  if (updatedIds.length > 0) {
    const originMap = new Map((existing ?? []).map((row) => [row.id, row.folder_id]));
    const logRows = updatedIds.map((id) => ({
      document_id: id,
      action: 'move_folder',
      user_id: userId,
      details: {
        from_folder_id: originMap.get(id) ?? null,
        to_folder_id: parsedFolder.data,
      } as Json,
    }));

    const { error: logError } = await supabase.from('patient_document_logs').insert(logRows);
    if (logError) {
      if (isTenantMissingError(logError)) {
        console.error('[patients] tenant_id ausente', logError);
        throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
      }
      throw new Error(logError.message);
    }
  }

  return { moved: updatedIds.length };
}
