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
    .select('*')
    .eq('patient_id', parsed.data)
    .is('deleted_at', null)
    .order('uploaded_at', { ascending: false });

  const applied = parsedFilters.data;

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
  }
  if (applied?.search) {
    query = query.ilike('title', `%${applied.search}%`);
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
