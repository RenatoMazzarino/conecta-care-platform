import { z } from 'zod';
import type { Database } from '@/types/supabase';
import { getSupabaseClient } from '@/lib/supabase/client';
import { ensureSession, isTenantMissingError, makeActionError, safeUserId } from '../aba03/shared';
import { createGedSecureLink } from './createGedSecureLink';

const patientIdSchema = z.string().uuid();
const documentIdsSchema = z.array(z.string().uuid()).min(1);

export type GedOriginalRequestRow = Database['public']['Tables']['ged_original_requests']['Row'];
export type GedOriginalRequestItemRow = Database['public']['Tables']['ged_original_request_items']['Row'];

type GedOriginalRequestItem = GedOriginalRequestItemRow & {
  document?: Pick<Database['public']['Tables']['patient_documents']['Row'], 'id' | 'title' | 'domain_type' | 'subcategory' | 'category' | 'uploaded_at'> | null;
  link?: Database['public']['Tables']['document_secure_links']['Row'] | null;
};

export type GedOriginalRequestWithItems = GedOriginalRequestRow & {
  items?: GedOriginalRequestItem[] | null;
};

export async function createGedOriginalRequest(patientId: string, documentIds: string[]) {
  const parsedPatientId = patientIdSchema.safeParse(patientId);
  if (!parsedPatientId.success) {
    throw new Error('ID do paciente invalido (esperado UUID)');
  }

  const parsedDocs = documentIdsSchema.safeParse(documentIds);
  if (!parsedDocs.success) {
    throw new Error('Lista de documentos invalida');
  }

  const supabase = getSupabaseClient();
  const session = await ensureSession(supabase);
  const userId = safeUserId(session);
  if (!userId) {
    throw new Error('Usuario nao autenticado');
  }

  const { data: request, error: requestError } = await supabase
    .from('ged_original_requests')
    .insert({
      patient_id: parsedPatientId.data,
      requested_by_user_id: userId,
      status: 'open',
    })
    .select('*')
    .maybeSingle();

  if (requestError) {
    if (isTenantMissingError(requestError)) {
      console.error('[patients] tenant_id ausente', requestError);
      throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
    }
    throw new Error(requestError.message);
  }

  if (!request) {
    throw new Error('Falha ao criar requisicao de original');
  }

  const { data: items, error: itemsError } = await supabase
    .from('ged_original_request_items')
    .insert(
      parsedDocs.data.map((docId) => ({
        request_id: request.id,
        document_id: docId,
        status: 'open',
      })),
    )
    .select('*');

  if (itemsError) {
    if (isTenantMissingError(itemsError)) {
      console.error('[patients] tenant_id ausente', itemsError);
      throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
    }
    throw new Error(itemsError.message);
  }

  const issued: Array<{ documentId: string; linkId: string; token: string }> = [];

  for (const item of items ?? []) {
    try {
      const link = await createGedSecureLink(item.document_id, undefined, request.id);
      await supabase
        .from('ged_original_request_items')
        .update({
          secure_link_id: link.linkId,
          status: 'issued',
        })
        .eq('id', item.id);
      issued.push({ documentId: item.document_id, linkId: link.linkId, token: link.token });
    } catch (error) {
      console.error('[ged] falha ao gerar link seguro', error);
    }
  }

  await supabase
    .from('ged_original_requests')
    .update({ status: issued.length > 0 ? 'in_progress' : 'open' })
    .eq('id', request.id);

  return {
    request,
    issued,
  };
}

export async function listGedOriginalRequests(patientId: string) {
  const parsedPatientId = patientIdSchema.safeParse(patientId);
  if (!parsedPatientId.success) {
    throw new Error('ID do paciente invalido (esperado UUID)');
  }

  const supabase = getSupabaseClient();
  await ensureSession(supabase);

  const { data, error } = await supabase
    .from('ged_original_requests')
    .select(
      [
        '*',
        'items:ged_original_request_items(*, document:patient_documents(id, title, domain_type, subcategory, uploaded_at), link:document_secure_links(*))',
      ].join(','),
    )
    .eq('patient_id', parsedPatientId.data)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .returns<GedOriginalRequestWithItems[]>();

  if (error) {
    if (isTenantMissingError(error)) {
      console.error('[patients] tenant_id ausente', error);
      throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
    }
    throw new Error(error.message);
  }

  return data ?? [];
}
