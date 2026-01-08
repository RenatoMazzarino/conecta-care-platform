import { z } from 'zod';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { Database } from '@/types/supabase';
import { ensureSession, isTenantMissingError, makeActionError } from '../aba03/shared';

const patientIdSchema = z.string().uuid();

type GedDocumentRow = Database['public']['Tables']['patient_documents']['Row'];
type GedSecureLink = Database['public']['Tables']['document_secure_links']['Row'];
type GedArtifact = Database['public']['Tables']['document_artifacts']['Row'];
type GedLog = Database['public']['Tables']['patient_document_logs']['Row'];
type LinkStatusLabel = 'Ativo' | 'Consumido' | 'Expirado' | 'Revogado';

type GedSecureLinkWithDocument = GedSecureLink & {
  document?: Pick<GedDocumentRow, 'id' | 'title' | 'domain_type' | 'subcategory' | 'category' | 'uploaded_at'> | null;
  computed_status?: LinkStatusLabel;
};

type GedArtifactWithDocument = GedArtifact & {
  document?: Pick<GedDocumentRow, 'id' | 'title' | 'domain_type' | 'subcategory' | 'category' | 'uploaded_at'> | null;
  log?: Pick<GedLog, 'id' | 'action' | 'happened_at' | 'user_id' | 'details'> | null;
};

function resolveLinkStatus(link: GedSecureLink, now: number): LinkStatusLabel {
  if (link.revoked_at) return 'Revogado';
  const expiresAt = link.expires_at ? new Date(link.expires_at).getTime() : null;
  if (expiresAt && expiresAt < now) return 'Expirado';
  if ((link.downloads_count ?? 0) >= (link.max_downloads ?? 1)) return 'Consumido';
  if (link.consumed_at) return 'Consumido';
  return 'Ativo';
}

export async function listGedCustodyOverview(patientId: string) {
  const parsed = patientIdSchema.safeParse(patientId);
  if (!parsed.success) {
    throw new Error('ID do paciente invalido (esperado UUID)');
  }

  const supabase = getSupabaseClient();
  await ensureSession(supabase);

  const linksPromise = supabase
    .from('document_secure_links')
    .select(
      [
        '*',
        'document:patient_documents!inner(id, title, domain_type, subcategory, category, uploaded_at)',
      ].join(','),
    )
    .eq('document.patient_id', parsed.data)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .returns<GedSecureLinkWithDocument[]>();

  const artifactsPromise = supabase
    .from('document_artifacts')
    .select(
      [
        '*',
        'document:patient_documents(id, title, domain_type, subcategory, category, uploaded_at)',
        'log:patient_document_logs(id, action, happened_at, user_id, details)',
      ].join(','),
    )
    .eq('patient_id', parsed.data)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .returns<GedArtifactWithDocument[]>();

  const downloadsPromise = supabase
    .from('patient_document_logs')
    .select('id, document:patient_documents!inner(id)', { count: 'exact', head: true })
    .eq('document.patient_id', parsed.data)
    .eq('action', 'download_artifact');

  const printsPromise = supabase
    .from('patient_document_logs')
    .select('id, document:patient_documents!inner(id)', { count: 'exact', head: true })
    .eq('document.patient_id', parsed.data)
    .eq('action', 'print');

  const [links, artifacts, downloads, prints] = await Promise.all([
    linksPromise,
    artifactsPromise,
    downloadsPromise,
    printsPromise,
  ]);

  for (const result of [links, artifacts, downloads, prints]) {
    if (result?.error) {
      if (isTenantMissingError(result.error)) {
        console.error('[patients] tenant_id ausente', result.error);
        throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
      }
      throw new Error(result.error.message);
    }
  }

  const now = Date.now();
  const linksWithStatus = (links.data ?? []).map((link) => ({
    ...link,
    computed_status: resolveLinkStatus(link, now),
  }));

  return {
    links: linksWithStatus,
    artifacts: artifacts.data ?? [],
    downloadsCount: downloads.count ?? 0,
    printsCount: prints.count ?? 0,
  };
}
