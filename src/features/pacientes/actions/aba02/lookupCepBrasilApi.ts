import { normalizePostalCode } from '@/features/pacientes/schemas/aba02EnderecoLogistica.schema';
import type { Json } from '@/types/supabase';

export type CepLookupResult = {
  postal_code: string;
  street: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  payload: Json;
};

export async function lookupCepBrasilApi(cep: string): Promise<CepLookupResult> {
  const normalized = normalizePostalCode(cep) ?? '';
  if (normalized.length !== 8) {
    throw new Error('CEP invalido');
  }

  const response = await fetch(`https://brasilapi.com.br/api/cep/v1/${normalized}`);
  if (!response.ok) {
    throw new Error('CEP nao encontrado');
  }

  const data = (await response.json()) as {
    cep?: string;
    street?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    service?: string;
  };

  const payload: Json = {
    cep: data.cep ?? normalized,
    street: data.street ?? null,
    neighborhood: data.neighborhood ?? null,
    city: data.city ?? null,
    state: data.state ?? null,
    service: data.service ?? 'brasilapi',
  };

  return {
    postal_code: normalized,
    street: data.street ?? null,
    neighborhood: data.neighborhood ?? null,
    city: data.city ?? null,
    state: data.state ?? null,
    payload,
  };
}
