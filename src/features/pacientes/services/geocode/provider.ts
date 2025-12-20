import type { Json } from '@/types/supabase';
import { geocodeProviderOptions } from '@/features/pacientes/schemas/aba02EnderecoLogistica.schema';
import { geocodeWithGoogle } from '@/features/pacientes/services/geocode/providers/google';
import { geocodeWithMapbox } from '@/features/pacientes/services/geocode/providers/mapbox';
import { geocodeWithOsm } from '@/features/pacientes/services/geocode/providers/osm';

export type GeocodeProviderId = (typeof geocodeProviderOptions)[number];

export type GeocodeInput = {
  street?: string | null;
  number?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
};

export type GeocodeResult = {
  latitude: number;
  longitude: number;
  precision?: string | null;
  placeId?: string | null;
  payload?: Json | null;
};

export type GeocodeProvider = {
  id: GeocodeProviderId;
  geocode: (input: GeocodeInput) => Promise<GeocodeResult>;
};

export function resolveGeocodeProvider(): GeocodeProvider | null {
  const provider = (process.env.GEOCODE_PROVIDER || 'osm') as GeocodeProviderId;
  if (provider === 'none') return null;

  switch (provider) {
    case 'google':
      return { id: provider, geocode: geocodeWithGoogle };
    case 'mapbox':
      return { id: provider, geocode: geocodeWithMapbox };
    case 'osm':
    default:
      return { id: 'osm', geocode: geocodeWithOsm };
  }
}
