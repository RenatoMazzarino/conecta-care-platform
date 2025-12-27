export interface SignatureRequest {
  patientId: string;
  title: string;
  provider?: string | null;
  externalId?: string | null;
}

export interface SignatureResponse {
  provider: string;
  envelope_id: string;
  status: 'sent' | 'signed' | 'voided';
  sent_at: string;
}

export interface SignatureProvider {
  name: string;
  sendContract(payload: SignatureRequest): Promise<SignatureResponse>;
}

function buildEnvelopeId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const fallbackProvider: SignatureProvider = {
  name: 'manual',
  async sendContract(payload) {
    return {
      provider: payload.provider ?? 'manual',
      envelope_id: payload.externalId ?? buildEnvelopeId(),
      status: 'sent',
      sent_at: new Date().toISOString(),
    };
  },
};

export function resolveSignatureProvider(provider?: string | null): SignatureProvider {
  if (!provider || provider === 'manual') {
    return fallbackProvider;
  }

  return {
    name: provider,
    async sendContract(payload) {
      return {
        provider,
        envelope_id: payload.externalId ?? buildEnvelopeId(),
        status: 'sent',
        sent_at: new Date().toISOString(),
      };
    },
  };
}
