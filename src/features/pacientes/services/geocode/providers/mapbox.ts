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

export async function geocodeWithMapbox(input: GeocodeInput): Promise<GeocodeResult> {
  const token = process.env.GEOCODE_MAPBOX_TOKEN;
  if (!token) {
    throw new Error('GEOCODE_MAPBOX_TOKEN nao configurado');
  }

  const query = buildQuery(input);
  if (!query) {
    throw new Error('Endereco insuficiente para geocode');
  }

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    query,
  )}.json?limit=1&access_token=${token}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Falha ao consultar geocode (Mapbox)');
  }

  const data = (await response.json()) as {
    features?: Array<{ center?: [number, number]; place_name?: string; id?: string }>;
  };

  const feature = data.features?.[0];
  const center = feature?.center;
  if (!center || center.length < 2) {
    throw new Error('Geocode nao encontrado');
  }

  const [longitude, latitude] = center;

  return {
    latitude,
    longitude,
    precision: 'mapbox',
    placeId: feature?.id ?? null,
    payload: {
      place_name: feature?.place_name ?? null,
    },
  };
}
