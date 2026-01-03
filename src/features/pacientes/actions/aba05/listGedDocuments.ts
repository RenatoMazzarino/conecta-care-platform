import { z } from 'zod';
import { getSupabaseClient } from '@/lib/supabase/client';
import {
  gedCategoryOptions,
  gedDocDomainOptions,
  gedDocOriginOptions,
  gedDocSourceOptions,
  gedDocStatusEnumOptions,
  gedDocTypeOptions,
} from '@/features/pacientes/schemas/aba05Ged.schema';
import { ensureSession, isTenantMissingError, makeActionError } from '../aba03/shared';

const patientIdSchema = z.string().uuid();

export const gedFiltersSchema = z.object({
  category: z.enum(gedCategoryOptions).optional(),
  doc_domain: z.enum(gedDocDomainOptions).optional(),
  doc_type: z.enum(gedDocTypeOptions).optional(),
  doc_source: z.enum(gedDocSourceOptions).optional(),
  doc_origin: z.enum(gedDocOriginOptions).optional(),
  doc_status: z.enum(gedDocStatusEnumOptions).optional(),
  search: z.string().trim().min(1).optional(),
  folder_id: z.string().uuid().optional(),
  global_search: z.boolean().optional(),
  include_archived: z.boolean().optional(),
});

export type GedDocumentFilters = z.infer<typeof gedFiltersSchema>;

export async function listGedDocuments(patientId: string, filters?: GedDocumentFilters) {
  const parsed = patientIdSchema.safeParse(patientId);
  if (!parsed.success) {
    throw new Error('ID do paciente invalido (esperado UUID)');
  }

  const parsedFilters = gedFiltersSchema.safeParse(filters ?? {});
  if (!parsedFilters.success) {
    throw new Error('Filtros GED invalidos');
  }

  const supabase = getSupabaseClient();
  await ensureSession(supabase);

  let query = supabase
    .from('patient_documents')
    .select('*, folder:patient_ged_folders(id, name, path, parent_id)')
    .eq('patient_id', parsed.data)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false });

  const applied = parsedFilters.data;

  const globalSearch = applied?.global_search ?? false;
  const includeArchived = applied?.include_archived ?? false;
  const folderId = applied?.folder_id ?? null;

  if (!globalSearch && folderId) {
    const { data: folder, error: folderError } = await supabase
      .from('patient_ged_folders')
      .select('id, path')
      .eq('id', folderId)
      .is('deleted_at', null)
      .maybeSingle();

    if (folderError) {
      if (isTenantMissingError(folderError)) {
        console.error('[patients] tenant_id ausente', folderError);
        throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
      }
      throw new Error(folderError.message);
    }

    if (folder?.path) {
      const { data: folderRows, error: folderRowsError } = await supabase
        .from('patient_ged_folders')
        .select('id')
        .eq('patient_id', parsed.data)
        .is('deleted_at', null)
        .or(`path.eq.${folder.path},path.like.${folder.path}.%`);

      if (folderRowsError) {
        if (isTenantMissingError(folderRowsError)) {
          console.error('[patients] tenant_id ausente', folderRowsError);
          throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
        }
        throw new Error(folderRowsError.message);
      }

      const folderIds = (folderRows ?? []).map((row) => row.id).filter(Boolean);
      if (folderIds.length > 0) {
        query = query.in('folder_id', folderIds);
      } else {
        query = query.eq('folder_id', folderId);
      }
    }
  }

  if (applied?.category) {
    query = query.eq('category', applied.category);
  }
  if (applied?.doc_domain) {
    query = query.eq('domain_type', applied.doc_domain);
  }
  if (applied?.doc_type) {
    query = query.eq('subcategory', applied.doc_type);
  }
  if (applied?.doc_source) {
    query = query.eq('source_module', applied.doc_source);
  }
  if (applied?.doc_origin) {
    query = query.eq('origin_module', applied.doc_origin);
  }
  if (applied?.doc_status) {
    query = query.eq('document_status', applied.doc_status);
  } else if (!includeArchived) {
    query = query.neq('document_status', 'Arquivado');
  }
  if (applied?.search) {
    const search = applied.search.replace(/%/g, '\\%').replace(/_/g, '\\_');
    query = query.or(
      [
        `title.ilike.%${search}%`,
        `original_file_name.ilike.%${search}%`,
        `file_name.ilike.%${search}%`,
      ].join(','),
    );
  }

  const { data, error } = await query;

  if (error) {
    if (isTenantMissingError(error)) {
      console.error('[patients] tenant_id ausente', error);
      throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
    }
    throw new Error(error.message);
  }

  return data ?? [];
}
