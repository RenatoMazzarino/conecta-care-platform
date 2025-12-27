export interface BillingExportRequest {
  patientId: string;
  provider?: string | null;
  reference?: string | null;
}

export interface BillingExportResponse {
  provider: string;
  export_id: string;
  status: 'queued' | 'sent' | 'failed';
  requested_at: string;
}

export interface BillingReconcileRequest {
  patientId: string;
  provider?: string | null;
  reference?: string | null;
}

export interface BillingReconcileResponse {
  provider: string;
  reconciliation_id: string;
  status: 'queued' | 'completed' | 'failed';
  requested_at: string;
}

export interface BillingIntegrationProvider {
  name: string;
  sendExport(payload: BillingExportRequest): Promise<BillingExportResponse>;
  reconcileStatus(payload: BillingReconcileRequest): Promise<BillingReconcileResponse>;
}

function buildOperationId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const fallbackProvider: BillingIntegrationProvider = {
  name: 'manual',
  async sendExport(payload) {
    void payload;
    return {
      provider: payload.provider ?? 'manual',
      export_id: buildOperationId(),
      status: 'queued',
      requested_at: new Date().toISOString(),
    };
  },
  async reconcileStatus(payload) {
    void payload;
    return {
      provider: payload.provider ?? 'manual',
      reconciliation_id: payload.reference ?? buildOperationId(),
      status: 'queued',
      requested_at: new Date().toISOString(),
    };
  },
};

export function resolveBillingIntegrationProvider(provider?: string | null): BillingIntegrationProvider {
  if (!provider || provider === 'manual') {
    return fallbackProvider;
  }

  return {
    name: provider,
    async sendExport(payload) {
      void payload;
      return {
        provider,
        export_id: buildOperationId(),
        status: 'queued',
        requested_at: new Date().toISOString(),
      };
    },
    async reconcileStatus(payload) {
      void payload;
      return {
        provider,
        reconciliation_id: payload.reference ?? buildOperationId(),
        status: 'queued',
        requested_at: new Date().toISOString(),
      };
    },
  };
}
