import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import { ensureSession, makeActionError, safeUserId } from '../aba03/shared';

const gedBucket = process.env.NEXT_PUBLIC_SUPABASE_GED_BUCKET || 'ged-documents';
const defaultTtlProdHours = 72;
const defaultTtlDevHours = 24 * 7;

export function resolveGedBucket() {
  return gedBucket;
}

export function resolveSecureLinkTtlHours() {
  const override = process.env.NEXT_PUBLIC_GED_SECURE_LINK_TTL_HOURS;
  if (override) {
    const parsed = Number.parseInt(override, 10);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return process.env.NODE_ENV === 'development' ? defaultTtlDevHours : defaultTtlProdHours;
}

export function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export function extractFileExtension(name: string) {
  const lastDot = name.lastIndexOf('.');
  if (lastDot === -1) return null;
  const ext = name.slice(lastDot + 1).trim();
  return ext ? ext.toLowerCase() : null;
}

export function isDicomFile(fileName: string, mimeType?: string | null) {
  if (mimeType && mimeType.toLowerCase().includes('dicom')) return true;
  const ext = extractFileExtension(fileName);
  return ext === 'dcm';
}

export function buildOriginalStoragePath(
  tenantId: string,
  patientId: string,
  documentId: string,
  version: number,
  fileName: string,
) {
  const safeName = sanitizeFileName(fileName);
  const fileId = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${tenantId}/${patientId}/${documentId}/v${version}/${fileId}-${safeName}`;
}

export function buildArtifactStoragePath(tenantId: string, patientId: string, documentId: string, artifactId: string) {
  return `${tenantId}/${patientId}/${documentId}/artifacts/${artifactId}`;
}

export function buildImportZipPath(tenantId: string, jobId: string, fileName: string) {
  const safeName = sanitizeFileName(fileName);
  return `${tenantId}/imports/${jobId}/source/${safeName}`;
}

export function buildImportItemPath(tenantId: string, jobId: string, itemId: string, fileName: string) {
  const safeName = sanitizeFileName(fileName);
  return `${tenantId}/imports/${jobId}/items/${itemId}/${safeName}`;
}

export async function computeSha256Hex(buffer: ArrayBuffer | ArrayBufferView) {
  const view = buffer instanceof ArrayBuffer ? new Uint8Array(buffer) : new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  const copy = new Uint8Array(view.length);
  copy.set(view);
  const hashBuffer = await crypto.subtle.digest('SHA-256', copy);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export async function resolveTenantId(
  supabase: SupabaseClient<Database>,
  patientId?: string | null,
) {
  const session = await ensureSession(supabase);
  const userId = safeUserId(session);
  const appMetadata = session?.user?.app_metadata as Record<string, unknown> | undefined;
  const userMetadata = session?.user?.user_metadata as Record<string, unknown> | undefined;
  const tenantFromSession =
    (appMetadata?.tenant_id as string | undefined) ?? (userMetadata?.tenant_id as string | undefined) ?? null;

  if (tenantFromSession) {
    return { tenantId: tenantFromSession, userId };
  }

  if (patientId) {
    const { data, error } = await supabase.from('patients').select('tenant_id').eq('id', patientId).maybeSingle();
    if (error) {
      throw new Error(error.message);
    }
    if (data?.tenant_id) {
      return { tenantId: data.tenant_id, userId };
    }
  }

  throw makeActionError('TENANT_MISSING', 'Tenant nao identificado para GED');
}

export function resolveAccessToken(session: { access_token?: string | null } | null) {
  if (session?.access_token) return session.access_token;
  const devToken =
    process.env.NEXT_PUBLIC_SUPABASE_DEV_ACCESS_TOKEN || process.env.NEXT_PUBLIC_SUPABASE_ACCESS_TOKEN;
  if (process.env.NODE_ENV === 'development' && devToken) {
    return devToken;
  }
  return null;
}
