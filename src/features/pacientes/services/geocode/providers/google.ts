import type { GeocodeInput, GeocodeResult } from '@/features/pacientes/services/geocode/provider';

function buildQuery(input: GeocodeInput) {
  const parts = [
    [input.street, input.number].filter(Boolean).join(' ').trim(),
    input.neighborhood,
    input.city,
    input.state,
    input.postalCode,
    input.country,
  ]
    .map((value) => (typeof value === 'string' ? value.trim() : value))
    .filter((value) => value && value.length > 0) as string[];

  return parts.join(', ');
}

export async function geocodeWithGoogle(input: GeocodeInput): Promise<GeocodeResult> {
  const apiKey = process.env.GEOCODE_GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error('GEOCODE_GOOGLE_API_KEY nao configurada');
  }

  const query = buildQuery(input);
  if (!query) {
    throw new Error('Endereco insuficiente para geocode');
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${apiKey}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Falha ao consultar geocode (Google)');
  }

  const data = (await response.json()) as {
    status?: string;
    results?: Array<{
      geometry?: { location?: { lat?: number; lng?: number }; location_type?: string };
      place_id?: string;
    }>;
  };

  if (data.status !== 'OK' || !data.results?.length) {
    throw new Error('Geocode nao encontrado');
  }

  const result = data.results[0];
  const latitude = result.geometry?.location?.lat;
  const longitude = result.geometry?.location?.lng;

  if (latitude == null || longitude == null) {
    throw new Error('Geocode invalido');
  }

  return {
    latitude,
    longitude,
    precision: result.geometry?.location_type ?? null,
    placeId: result.place_id ?? null,
    payload: {
      location_type: result.geometry?.location_type ?? null,
    },
  };
}
