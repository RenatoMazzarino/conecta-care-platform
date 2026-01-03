import type { Json } from '@/types/supabase';

export interface TimestampRequest {
  documentHash: string;
  fileName?: string | null;
  mimeType?: string | null;
}

export interface TimestampReceipt {
  provider: string;
  issued_at: string;
  receipt_payload: Json;
}

export interface TimestampProvider {
  id: string;
  stamp(request: TimestampRequest): Promise<TimestampReceipt>;
}

function buildReceipt(request: TimestampRequest, source: string): TimestampReceipt {
  const issuedAt = new Date().toISOString();
  const requestId = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return {
    provider: 'SERPRO',
    issued_at: issuedAt,
    receipt_payload: {
      provider: 'SERPRO',
      issued_at: issuedAt,
      document_hash: request.documentHash,
      request_id: requestId,
      source,
    },
  };
}

const devProvider: TimestampProvider = {
  id: 'dev',
  async stamp(request) {
    return buildReceipt(request, 'server-time');
  },
};

const serproProvider: TimestampProvider = {
  id: 'serpro',
  async stamp(request) {
    const endpoint = process.env.NEXT_PUBLIC_GED_TSA_SERPRO_ENDPOINT;
    if (!endpoint) {
      return buildReceipt(request, 'server-time');
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ document_hash: request.documentHash }),
    });

    if (!response.ok) {
      const fallback = await response.text().catch(() => null);
      throw new Error(fallback || 'Falha ao chamar TSA SERPRO');
    }

    const payload = (await response.json().catch(() => null)) as Json | null;
    const issuedAt = new Date().toISOString();

    return {
      provider: 'SERPRO',
      issued_at: issuedAt,
      receipt_payload:
        payload ??
        ({
          provider: 'SERPRO',
          issued_at: issuedAt,
          document_hash: request.documentHash,
          source: 'serpro',
        } as Json),
    };
  },
};

export function resolveTimestampProvider(): TimestampProvider {
  const hasSandbox = Boolean(process.env.NEXT_PUBLIC_GED_TSA_SERPRO_ENDPOINT);
  if (process.env.NODE_ENV === 'development' && !hasSandbox) {
    return devProvider;
  }
  return serproProvider;
}
