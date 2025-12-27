export interface DocumentIngestionRequest {
  patientId: string;
  itemCode: string;
  title: string;
  provider?: string | null;
  documentId?: string | null;
}

export interface DocumentIngestionResponse {
  provider: string;
  ingestion_id: string;
  status: 'queued' | 'processing' | 'completed';
  requested_at: string;
}

export interface DocumentIngestionProvider {
  name: string;
  requestIngestion(payload: DocumentIngestionRequest): Promise<DocumentIngestionResponse>;
}

function buildIngestionId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const fallbackProvider: DocumentIngestionProvider = {
  name: 'manual',
  async requestIngestion(payload) {
    return {
      provider: payload.provider ?? 'manual',
      ingestion_id: payload.documentId ?? buildIngestionId(),
      status: 'queued',
      requested_at: new Date().toISOString(),
    };
  },
};

export function resolveDocumentIngestionProvider(provider?: string | null): DocumentIngestionProvider {
  if (!provider || provider === 'manual') {
    return fallbackProvider;
  }

  return {
    name: provider,
    async requestIngestion(payload) {
      return {
        provider,
        ingestion_id: payload.documentId ?? buildIngestionId(),
        status: 'queued',
        requested_at: new Date().toISOString(),
      };
    },
  };
}
