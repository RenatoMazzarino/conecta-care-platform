import type { RiskInput, RiskResult } from '@/features/pacientes/services/risk/provider';
import { normalizeRiskLevel } from '@/features/pacientes/services/risk/provider';

export async function fetchRiskCustomHttp(input: RiskInput): Promise<RiskResult> {
  const apiUrl = process.env.RISK_API_URL;
  const apiKey = process.env.RISK_API_KEY;

  if (!apiUrl || !apiKey) {
    throw new Error('RISK_API_URL ou RISK_API_KEY nao configurado');
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ latitude: input.latitude, longitude: input.longitude }),
  });

  if (!response.ok) {
    throw new Error('Falha ao consultar ranking de risco');
  }

  const data = (await response.json()) as {
    risk_score?: number | string | null;
    risk_level?: string | null;
    score?: number | string | null;
    level?: string | null;
  };

  const scoreRaw = data.risk_score ?? data.score ?? null;
  const score = scoreRaw != null && scoreRaw !== '' ? Number(scoreRaw) : null;
  const level = normalizeRiskLevel(data.risk_level ?? data.level ?? null);

  return {
    score: Number.isFinite(score ?? NaN) ? score : null,
    level,
    payload: {
      risk_score: score,
      risk_level: level,
    },
  };
}
