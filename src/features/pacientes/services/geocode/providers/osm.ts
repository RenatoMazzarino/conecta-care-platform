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

export async function geocodeWithOsm(input: GeocodeInput): Promise<GeocodeResult> {
  const query = buildQuery(input);
  if (!query) {
    throw new Error('Endereco insuficiente para geocode');
  }

  const userAgent = process.env.GEOCODE_USER_AGENT || 'ConectaCare/1.0';
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&addressdetails=1&q=${encodeURIComponent(
    query,
  )}`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': userAgent,
    },
  });

  if (!response.ok) {
    throw new Error('Falha ao consultar geocode (OSM)');
  }

  const data = (await response.json()) as Array<{
    lat?: string;
    lon?: string;
    place_id?: number;
    class?: string;
    type?: string;
    display_name?: string;
  }>;

  const first = data[0];
  if (!first?.lat || !first?.lon) {
    throw new Error('Geocode nao encontrado');
  }

  const latitude = Number(first.lat);
  const longitude = Number(first.lon);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error('Geocode invalido');
  }

  return {
    latitude,
    longitude,
    precision: [first.class, first.type].filter(Boolean).join(':') || null,
    placeId: first.place_id ? String(first.place_id) : null,
    payload: {
      display_name: first.display_name ?? null,
      class: first.class ?? null,
      type: first.type ?? null,
    },
  };
}
