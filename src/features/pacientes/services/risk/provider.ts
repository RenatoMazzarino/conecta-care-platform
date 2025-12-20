import type { Json } from '@/types/supabase';
import { riskLevelOptions } from '@/features/pacientes/schemas/aba02EnderecoLogistica.schema';
import { fetchRiskCustomHttp } from '@/features/pacientes/services/risk/providers/customHttp';

export type RiskProviderId = 'none' | 'custom_http';

export type RiskInput = {
  latitude: number;
  longitude: number;
};

export type RiskResult = {
  score: number | null;
  level: (typeof riskLevelOptions)[number];
  payload: Json | null;
};

export type RiskProvider = {
  id: RiskProviderId;
  fetchRisk: (input: RiskInput) => Promise<RiskResult>;
};

export function normalizeRiskLevel(raw: string | null | undefined): (typeof riskLevelOptions)[number] {
  if (!raw) return 'unknown';
  const normalized = raw.trim().toLowerCase();
  if (normalized === 'low' || normalized === 'baixo') return 'low';
  if (normalized === 'medium' || normalized === 'medio') return 'medium';
  if (normalized === 'high' || normalized === 'alto') return 'high';
  if (riskLevelOptions.includes(normalized as (typeof riskLevelOptions)[number])) {
    return normalized as (typeof riskLevelOptions)[number];
  }
  return 'unknown';
}

export function resolveRiskProvider(): RiskProvider | null {
  const provider = (process.env.RISK_PROVIDER || 'none') as RiskProviderId;
  if (provider === 'custom_http') {
    return { id: provider, fetchRisk: fetchRiskCustomHttp };
  }
  return null;
}
