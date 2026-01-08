import { z } from 'zod';
import type { Database } from '@/types/supabase';
import { getSupabaseClient } from '@/lib/supabase/client';
import { ensureSession, isTenantMissingError, makeActionError } from '../aba03/shared';
import { resolveTenantId } from './shared';

const patientIdSchema = z.string().uuid();
const folderIdSchema = z.string().uuid();
const folderNameSchema = z.string().trim().min(1).max(120);

export type GedFolderRow = Database['public']['Tables']['patient_ged_folders']['Row'];

const systemFolders = [
  { name: 'Clinico', sortOrder: 1 },
  { name: 'Administrativo', sortOrder: 2 },
  { name: 'Financeiro', sortOrder: 3 },
  { name: 'Juridico', sortOrder: 4 },
  { name: 'Comunicacao', sortOrder: 5 },
];

export async function ensurePatientGedFolders(patientId: string) {
  const parsed = patientIdSchema.safeParse(patientId);
  if (!parsed.success) {
    throw new Error('ID do paciente invalido (esperado UUID)');
  }

  const supabase = getSupabaseClient();
  await ensureSession(supabase);
  await resolveTenantId(supabase, parsed.data);

  const { data: existing, error } = await supabase
    .from('patient_ged_folders')
    .select('id, name, name_norm')
    .eq('patient_id', parsed.data)
    .eq('is_system', true)
    .is('deleted_at', null);

  if (error) {
    if (isTenantMissingError(error)) {
      console.error('[patients] tenant_id ausente', error);
      throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
    }
    throw new Error(error.message);
  }

  const existingNames = new Set(
    (existing ?? []).map((folder) => (folder.name_norm || folder.name).toLowerCase()),
  );

  const missing = systemFolders.filter((folder) => !existingNames.has(folder.name.toLowerCase()));
  if (missing.length === 0) {
    return existing ?? [];
  }

  const { data: inserted, error: insertError } = await supabase
    .from('patient_ged_folders')
    .insert(
      missing.map((folder) => ({
        patient_id: parsed.data,
        name: folder.name,
        is_system: true,
        sort_order: folder.sortOrder,
      })),
    )
    .select('*');

  if (insertError) {
    if (isTenantMissingError(insertError)) {
      console.error('[patients] tenant_id ausente', insertError);
      throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
    }
    throw new Error(insertError.message);
  }

  return [...(existing ?? []), ...(inserted ?? [])];
}

export async function listGedFolders(patientId: string) {
  const parsed = patientIdSchema.safeParse(patientId);
  if (!parsed.success) {
    throw new Error('ID do paciente invalido (esperado UUID)');
  }

  const supabase = getSupabaseClient();
  await ensureSession(supabase);

  const { data, error } = await supabase
    .from('patient_ged_folders')
    .select('*')
    .eq('patient_id', parsed.data)
    .is('deleted_at', null)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    if (isTenantMissingError(error)) {
      console.error('[patients] tenant_id ausente', error);
      throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
    }
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function createGedFolder(patientId: string, name: string, parentId?: string | null) {
  const parsedPatient = patientIdSchema.safeParse(patientId);
  if (!parsedPatient.success) {
    throw new Error('ID do paciente invalido (esperado UUID)');
  }

  const parsedName = folderNameSchema.safeParse(name);
  if (!parsedName.success) {
    throw new Error('Nome da pasta invalido');
  }

  const parsedParent = parentId ? folderIdSchema.safeParse(parentId) : null;
  if (parentId && parsedParent && !parsedParent.success) {
    throw new Error('ID da pasta pai invalido');
  }

  const supabase = getSupabaseClient();
  await ensureSession(supabase);
  await resolveTenantId(supabase, parsedPatient.data);

  const { data, error } = await supabase
    .from('patient_ged_folders')
    .insert({
      patient_id: parsedPatient.data,
      parent_id: parsedParent?.data ?? null,
      name: parsedName.data,
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

  if (!data) {
    throw new Error('Falha ao criar pasta');
  }

  return data;
}

export async function renameGedFolder(folderId: string, name: string) {
  const parsedFolder = folderIdSchema.safeParse(folderId);
  if (!parsedFolder.success) {
    throw new Error('ID da pasta invalido');
  }

  const parsedName = folderNameSchema.safeParse(name);
  if (!parsedName.success) {
    throw new Error('Nome da pasta invalido');
  }

  const supabase = getSupabaseClient();
  await ensureSession(supabase);

  const { data, error } = await supabase
    .from('patient_ged_folders')
    .update({ name: parsedName.data })
    .eq('id', parsedFolder.data)
    .is('deleted_at', null)
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
    throw new Error('Falha ao renomear pasta');
  }

  return data;
}

export async function moveGedFolder(folderId: string, newParentId: string | null) {
  const parsedFolder = folderIdSchema.safeParse(folderId);
  if (!parsedFolder.success) {
    throw new Error('ID da pasta invalido');
  }

  if (newParentId) {
    const parsedParent = folderIdSchema.safeParse(newParentId);
    if (!parsedParent.success) {
      throw new Error('ID da pasta destino invalido');
    }
  }

  const supabase = getSupabaseClient();
  await ensureSession(supabase);

  const { error } = await supabase.rpc('move_ged_folder', {
    folder_id: parsedFolder.data,
    new_parent_id: newParentId ?? null,
  });

  if (error) {
    if (isTenantMissingError(error)) {
      console.error('[patients] tenant_id ausente', error);
      throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
    }
    throw new Error(error.message);
  }

  return { ok: true };
}

export async function deleteGedFolder(folderId: string) {
  const parsedFolder = folderIdSchema.safeParse(folderId);
  if (!parsedFolder.success) {
    throw new Error('ID da pasta invalido');
  }

  const supabase = getSupabaseClient();
  await ensureSession(supabase);

  const { data: folder, error: folderError } = await supabase
    .from('patient_ged_folders')
    .select('id, is_system')
    .eq('id', parsedFolder.data)
    .is('deleted_at', null)
    .maybeSingle();

  if (folderError) {
    if (isTenantMissingError(folderError)) {
      console.error('[patients] tenant_id ausente', folderError);
      throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
    }
    throw new Error(folderError.message);
  }

  if (!folder) {
    throw new Error('Pasta nao encontrada');
  }

  if (folder.is_system) {
    throw new Error('Pastas do sistema nao podem ser removidas');
  }

  const { data: children } = await supabase
    .from('patient_ged_folders')
    .select('id')
    .eq('parent_id', folder.id)
    .is('deleted_at', null)
    .limit(1);

  if (children && children.length > 0) {
    throw new Error('Remova ou mova as subpastas antes de excluir');
  }

  const { data: docs } = await supabase
    .from('patient_documents')
    .select('id')
    .eq('folder_id', folder.id)
    .is('deleted_at', null)
    .limit(1);

  if (docs && docs.length > 0) {
    throw new Error('Mova os documentos antes de excluir a pasta');
  }

  const { error } = await supabase
    .from('patient_ged_folders')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', folder.id);

  if (error) {
    if (isTenantMissingError(error)) {
      console.error('[patients] tenant_id ausente', error);
      throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
    }
    throw new Error(error.message);
  }

  return { ok: true };
}
