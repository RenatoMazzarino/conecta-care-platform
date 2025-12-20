'use client';

import {
  makeStyles,
  tokens,
  Button,
  Field,
  Input,
  Select,
  Textarea,
  Checkbox,
  Spinner,
  Toaster,
  Toast,
  ToastTitle,
  useId,
  useToastController,
} from '@fluentui/react-components';
import {
  ArrowClockwiseRegular,
  LocationRegular,
  MapRegular,
  ShareRegular,
  VehicleCarRegular,
} from '@fluentui/react-icons';
import { forwardRef, useCallback, useEffect, useMemo, useImperativeHandle, useState } from 'react';
import { lookupCepBrasilApi } from '@/features/pacientes/actions/aba02/lookupCepBrasilApi';
import { getPatientAddresses } from '@/features/pacientes/actions/aba02/getPatientAddresses';
import { savePatientAddress } from '@/features/pacientes/actions/aba02/savePatientAddress';
import { refreshAddressGeocode } from '@/features/pacientes/actions/aba02/refreshAddressGeocode';
import { refreshAddressRisk } from '@/features/pacientes/actions/aba02/refreshAddressRisk';
import type {
  PatientAddressRow,
  PatientAddressLogisticsRow,
  PatientAddressWithLogistics,
} from '@/features/pacientes/actions/aba02/getPatientAddresses';
import {
  patientAddressUpsertSchema,
  patientAddressLogisticsSchema,
  type PatientAddressUpsert,
  type PatientAddressLogistics,
  addressPurposeOptions,
  addressSourceOptions,
  cepLookupSourceOptions,
  geocodeStatusOptions,
  geocodeProviderOptions,
  riskStatusOptions,
  riskLevelOptions,
  ambulanceAccessOptions,
  nightAccessRiskOptions,
  areaRiskTypeOptions,
  zoneTypeOptions,
  streetAccessTypeOptions,
  elevatorStatusOptions,
  wheelchairAccessOptions,
  propertyTypeOptions,
  bedTypeOptions,
  mattressTypeOptions,
  backupPowerSourceOptions,
  electricVoltageOptions,
  animalsBehaviorOptions,
  waterSourceOptions,
  equipmentSpaceOptions,
  cellSignalQualityOptions,
} from '@/features/pacientes/schemas/aba02EnderecoLogistica.schema';

const useStyles = makeStyles({
  container: {
    padding: '0 0 32px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '16px',
    alignItems: 'start',
    '@media (min-width: 1280px)': {
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    },
  },
  leftCol: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '16px',
    gridColumn: '1 / -1',
    '@media (min-width: 1280px)': {
      gridColumn: 'span 2',
    },
  },
  rightCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    gridColumn: '1 / -1',
    '@media (min-width: 1280px)': {
      gridColumn: 'span 1',
    },
  },
  card: {
    backgroundColor: '#ffffff',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: '6px',
    boxShadow: '0 1px 2px rgba(0,0,0,.08)',
    overflow: 'hidden',
  },
  cardSpan: {
    gridColumn: '1 / -1',
  },
  cardHeader: {
    padding: '14px 16px',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
    flexWrap: 'wrap',
  },
  cardTitle: {
    fontSize: '12px',
    letterSpacing: '.6px',
    textTransform: 'uppercase',
    fontWeight: 900,
    color: tokens.colorNeutralForeground1,
  },
  cardBody: {
    padding: '14px 16px',
  },
  definitionList: {
    display: 'grid',
    gridTemplateColumns: '180px 1fr',
    rowGap: '10px',
    columnGap: '12px',
    margin: 0,
    '& dt': {
      color: tokens.colorNeutralForeground3,
      fontSize: '12px',
      margin: 0,
    },
    '& dd': {
      margin: 0,
      fontWeight: tokens.fontWeightSemibold,
      fontSize: '12.5px',
      overflowWrap: 'anywhere',
      color: tokens.colorNeutralForeground1,
    },
    '@media (max-width: 480px)': {
      gridTemplateColumns: '140px 1fr',
    },
  },
  readOnlyGrid: {
    display: 'grid',
    gap: '16px',
    gridTemplateColumns: '1fr',
    '@media (min-width: 768px)': {
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    },
  },
  addressSelect: {
    minWidth: '220px',
  },
  fieldGroup: {
    display: 'grid',
    gap: '16px',
    gridTemplateColumns: '1fr',
    '@media (min-width: 640px)': {
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
  },
  fieldGroupThree: {
    display: 'grid',
    gap: '16px',
    gridTemplateColumns: '1fr',
    '@media (min-width: 640px)': {
      gridTemplateColumns: 'repeat(3, 1fr)',
    },
  },
  inlineActions: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  addressSwitcher: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '12px',
  },
  addressOption: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  },
  tag: {
    borderRadius: '999px',
    padding: '2px 8px',
    fontSize: '10px',
    lineHeight: 1.1,
    fontWeight: 700,
    backgroundColor: tokens.colorNeutralBackground2,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    color: tokens.colorNeutralForeground3,
    textTransform: 'uppercase',
    letterSpacing: '.3px',
  },
  riskBadge: {
    cursor: 'default',
    borderRadius: '999px',
    padding: '2px 10px',
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '.4px',
  },
  riskMeta: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground3,
  },
  note: {
    margin: 0,
    color: tokens.colorNeutralForeground3,
    fontSize: '12px',
  },
  link: {
    color: '#005a9e',
    fontWeight: 700,
  },
});

interface EnderecoLogisticaTabProps {
  patientId: string;
  patientName?: string | null;
  onStatusChange?: (status: { isEditing: boolean; isSaving: boolean }) => void;
  onAddressSummary?: (summary: { city?: string | null; state?: string | null }) => void;
}

export interface EnderecoLogisticaTabHandle {
  startEdit: () => void;
  cancelEdit: () => void;
  reload: () => void;
  save: () => void;
}

function asInputValue(value: string | number | null | undefined) {
  if (value == null) return '';
  return String(value);
}

type ReadOnlyItem = { label: string; value: string };

type AddressLike = {
  address_label?: string | null;
  address_purpose?: string | null;
  is_primary?: boolean | null;
  postal_code?: string | null;
  street?: string | null;
  number?: string | null;
  complement?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  reference_point?: string | null;
};

function formatText(value: unknown) {
  if (value === null || value === undefined) return '—';
  const text = String(value).trim();
  return text.length ? text : '—';
}

function formatBoolean(value: boolean | null | undefined) {
  if (value === null || value === undefined) return '—';
  return value ? 'Sim' : 'Nao';
}

function formatAddressLine(address?: AddressLike | null) {
  if (!address) return '—';
  const segments: string[] = [];
  const streetLine = [address.street, address.number].filter(Boolean).join(', ');
  if (streetLine) segments.push(streetLine);
  if (address.complement) segments.push(String(address.complement));
  if (address.neighborhood) segments.push(String(address.neighborhood));
  const cityUf = [address.city, address.state].filter(Boolean).join('/');
  if (cityUf) segments.push(cityUf);
  if (address.postal_code) segments.push(`CEP ${formatPostalCode(address.postal_code)}`);
  return segments.length ? segments.join(' · ') : '—';
}

function ReadOnlyRow({ label, value }: ReadOnlyItem) {
  return (
    <div style={{ display: 'contents' }}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function formatPostalCode(value?: string | null) {
  if (!value) return '—';
  const digits = value.replace(/\D/g, '');
  if (digits.length === 8) {
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  }
  return value;
}

function formatDateTime(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('pt-BR');
}

function formatStatus(value?: string | null) {
  switch (value) {
    case 'success':
      return 'Sucesso';
    case 'failed':
      return 'Falhou';
    case 'pending':
      return 'Pendente';
    case 'not_configured':
      return 'Nao configurado';
    default:
      return '—';
  }
}

function formatRiskLevel(value?: string | null) {
  switch (value) {
    case 'low':
      return 'Baixo';
    case 'medium':
      return 'Medio';
    case 'high':
      return 'Alto';
    case 'unknown':
      return 'Desconhecido';
    default:
      return '—';
  }
}

function asOptionOrNull<const Options extends readonly string[]>(
  value: string | null | undefined,
  options: Options,
): Options[number] | null {
  if (!value) return null;
  if ((options as readonly string[]).includes(value)) return value as Options[number];
  return null;
}

function buildAddressDraft(address?: PatientAddressRow | null): PatientAddressUpsert {
  return {
    address_label: address?.address_label ?? 'Endereco principal',
    address_purpose: asOptionOrNull(address?.address_purpose, addressPurposeOptions) ?? 'outro',
    is_primary: address?.is_primary ?? true,
    postal_code: address?.postal_code ?? '',
    street: address?.street ?? '',
    number: address?.number ?? '',
    complement: address?.complement ?? null,
    neighborhood: address?.neighborhood ?? '',
    city: address?.city ?? '',
    state: address?.state ?? '',
    country: address?.country ?? 'Brasil',
    reference_point: address?.reference_point ?? null,
    address_source: asOptionOrNull(address?.address_source, addressSourceOptions) ?? 'manual',
    latitude: address?.latitude ?? null,
    longitude: address?.longitude ?? null,
    cep_last_lookup_at: address?.cep_last_lookup_at ?? null,
    cep_last_lookup_source: asOptionOrNull(address?.cep_last_lookup_source, cepLookupSourceOptions),
    cep_lookup_payload: address?.cep_lookup_payload ?? null,
    geocode_status: asOptionOrNull(address?.geocode_status, geocodeStatusOptions),
    geocode_provider: asOptionOrNull(address?.geocode_provider, geocodeProviderOptions),
    geocode_refreshed_at: address?.geocode_refreshed_at ?? null,
    geocode_cache_until: address?.geocode_cache_until ?? null,
    geocode_precision: address?.geocode_precision ?? null,
    geocode_place_id: address?.geocode_place_id ?? null,
    geocode_payload: address?.geocode_payload ?? null,
    geocode_error_message: address?.geocode_error_message ?? null,
    risk_status: asOptionOrNull(address?.risk_status, riskStatusOptions),
    risk_provider: address?.risk_provider ?? null,
    risk_score: address?.risk_score ?? null,
    risk_level: asOptionOrNull(address?.risk_level, riskLevelOptions),
    risk_refreshed_at: address?.risk_refreshed_at ?? null,
    risk_cache_until: address?.risk_cache_until ?? null,
    risk_payload: address?.risk_payload ?? null,
    risk_error_message: address?.risk_error_message ?? null,
  };
}

function buildLogisticsDraft(logistics?: PatientAddressLogisticsRow | null): PatientAddressLogistics {
  return {
    allowed_visit_hours: logistics?.allowed_visit_hours ?? null,
    travel_time_min: logistics?.travel_time_min ?? null,
    distance_km: logistics?.distance_km ?? null,
    travel_notes: logistics?.travel_notes ?? null,
    access_conditions: logistics?.access_conditions ?? null,
    entry_procedure: logistics?.entry_procedure ?? null,
    gate_identification: logistics?.gate_identification ?? null,
    parking: logistics?.parking ?? null,
    team_parking: logistics?.team_parking ?? null,
    ambulance_access: asOptionOrNull(logistics?.ambulance_access, ambulanceAccessOptions),
    night_access_risk: asOptionOrNull(logistics?.night_access_risk, nightAccessRiskOptions),
    area_risk_type: asOptionOrNull(logistics?.area_risk_type, areaRiskTypeOptions),
    zone_type: asOptionOrNull(logistics?.zone_type, zoneTypeOptions),
    street_access_type: asOptionOrNull(logistics?.street_access_type, streetAccessTypeOptions),
    external_stairs: logistics?.external_stairs ?? null,
    elevator_status: asOptionOrNull(logistics?.elevator_status, elevatorStatusOptions),
    wheelchair_access: asOptionOrNull(logistics?.wheelchair_access, wheelchairAccessOptions),
    has_24h_concierge: logistics?.has_24h_concierge ?? false,
    concierge_contact: logistics?.concierge_contact ?? null,
    cell_signal_quality: asOptionOrNull(logistics?.cell_signal_quality, cellSignalQualityOptions),
    property_type: asOptionOrNull(logistics?.property_type, propertyTypeOptions),
    condo_name: logistics?.condo_name ?? null,
    block_tower: logistics?.block_tower ?? null,
    floor_number: logistics?.floor_number ?? null,
    unit_number: logistics?.unit_number ?? null,
    bed_type: asOptionOrNull(logistics?.bed_type, bedTypeOptions),
    mattress_type: asOptionOrNull(logistics?.mattress_type, mattressTypeOptions),
    adapted_bathroom: logistics?.adapted_bathroom ?? false,
    electric_voltage: asOptionOrNull(logistics?.electric_voltage, electricVoltageOptions),
    backup_power_source: asOptionOrNull(logistics?.backup_power_source, backupPowerSourceOptions),
    backup_power_desc: logistics?.backup_power_desc ?? null,
    water_source: asOptionOrNull(logistics?.water_source, waterSourceOptions),
    has_wifi: logistics?.has_wifi ?? false,
    has_smokers: logistics?.has_smokers ?? false,
    animals_behavior: asOptionOrNull(logistics?.animals_behavior, animalsBehaviorOptions),
    pets_description: logistics?.pets_description ?? null,
    ventilation: logistics?.ventilation ?? null,
    lighting_quality: logistics?.lighting_quality ?? null,
    noise_level: logistics?.noise_level ?? null,
    hygiene_conditions: logistics?.hygiene_conditions ?? null,
    equipment_space: asOptionOrNull(logistics?.equipment_space, equipmentSpaceOptions),
    power_outlets_desc: logistics?.power_outlets_desc ?? null,
    facade_image_url: logistics?.facade_image_url ?? null,
    general_observations: logistics?.general_observations ?? null,
  };
}

function getErrorFor(fieldErrors: Record<string, string>, field: string) {
  return fieldErrors[field];
}

export const EnderecoLogisticaTab = forwardRef<EnderecoLogisticaTabHandle, EnderecoLogisticaTabProps>(
  function EnderecoLogisticaTab({ patientId, patientName, onStatusChange, onAddressSummary }, ref) {
    const styles = useStyles();
    const toasterId = useId('endereco-logistica-toaster');
    const { dispatchToast } = useToastController(toasterId);
    const [addresses, setAddresses] = useState<PatientAddressWithLogistics[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [currentAddress, setCurrentAddress] = useState<PatientAddressWithLogistics | null>(null);
    const [draftAddress, setDraftAddress] = useState<PatientAddressUpsert | null>(null);
    const [draftLogistics, setDraftLogistics] = useState<PatientAddressLogistics | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [saveError, setSaveError] = useState<string | null>(null);
    const [cepLoading, setCepLoading] = useState(false);
    const [geocodeLoading, setGeocodeLoading] = useState(false);
    const [riskLoading, setRiskLoading] = useState(false);

    const addressOptions = useMemo(() => {
      return addresses.map((address) => ({
        id: address.id,
        label: address.address_label ?? 'Endereco',
        location: [address.city, address.state].filter(Boolean).join('/'),
        isPrimary: address.is_primary,
      }));
    }, [addresses]);

    const reload = useCallback(async () => {
      setIsLoading(true);
      setLoadError(null);
      setSaveError(null);

      try {
        const loaded = await getPatientAddresses(patientId);
        setAddresses(loaded);

        const primary = loaded.find((item) => item.is_primary) ?? loaded[0] ?? null;
        setSelectedAddressId(primary?.id ?? null);
        setCurrentAddress(primary ?? null);
        setDraftAddress(buildAddressDraft(primary));
        setDraftLogistics(buildLogisticsDraft(primary?.logistics ?? null));
        onAddressSummary?.({ city: primary?.city, state: primary?.state });
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : 'Falha ao carregar enderecos');
      } finally {
        setIsLoading(false);
      }
    }, [onAddressSummary, patientId]);

    useEffect(() => {
      void reload();
    }, [reload]);

    useEffect(() => {
      onStatusChange?.({ isEditing, isSaving });
    }, [isEditing, isSaving, onStatusChange]);

    const handleStartEdit = useCallback(() => {
      setIsEditing(true);
      setSaveError(null);
      setFieldErrors({});
    }, []);

    const handleCancelEdit = useCallback(() => {
      setIsEditing(false);
      setSaveError(null);
      setFieldErrors({});
      setDraftAddress(buildAddressDraft(currentAddress));
      setDraftLogistics(buildLogisticsDraft(currentAddress?.logistics ?? null));
    }, [currentAddress]);

    const updateAddressState = (patch: Partial<PatientAddressUpsert>) => {
      setCurrentAddress((prev) => (prev ? { ...prev, ...(patch as Partial<PatientAddressRow>) } : prev));
      setDraftAddress((prev) => (prev ? { ...prev, ...patch } : prev));
      setAddresses((prev) =>
        prev.map((addr) => (addr.id === selectedAddressId ? { ...addr, ...(patch as Partial<PatientAddressRow>) } : addr)),
      );
    };

    const handleSave = useCallback(async () => {
      if (!draftAddress || !draftLogistics) return;

      setSaveError(null);
      setFieldErrors({});

      const addressInput = {
        ...draftAddress,
        cep_last_lookup_source: draftAddress.cep_last_lookup_source ?? 'manual',
        address_source: draftAddress.address_source ?? 'manual',
      };

      const parsedAddress = patientAddressUpsertSchema.safeParse(addressInput);
      const parsedLogistics = patientAddressLogisticsSchema.safeParse(draftLogistics);

      if (!parsedAddress.success || !parsedLogistics.success) {
        const nextErrors: Record<string, string> = {};
        if (!parsedAddress.success) {
          const flattened = parsedAddress.error.flatten().fieldErrors;
          for (const [key, messages] of Object.entries(flattened)) {
            if (messages?.[0]) nextErrors[key] = messages[0];
          }
        }
        if (!parsedLogistics.success) {
          const flattened = parsedLogistics.error.flatten().fieldErrors;
          for (const [key, messages] of Object.entries(flattened)) {
            if (messages?.[0]) nextErrors[key] = messages[0];
          }
        }
        setFieldErrors(nextErrors);
        return;
      }

      setIsSaving(true);
      try {
        const saved = await savePatientAddress(patientId, selectedAddressId, parsedAddress.data, parsedLogistics.data);
        setCurrentAddress(saved);
        setDraftAddress(buildAddressDraft(saved));
        setDraftLogistics(buildLogisticsDraft(saved.logistics ?? null));
        setSelectedAddressId(saved.id);
        setAddresses((prev) => {
          const exists = prev.some((addr) => addr.id === saved.id);
          if (!exists) return [saved, ...prev];
          return prev.map((addr) => (addr.id === saved.id ? saved : addr));
        });
        onAddressSummary?.({ city: saved.city, state: saved.state });
        setIsEditing(false);
        dispatchToast(
          <Toast>
            <ToastTitle>Endereco atualizado</ToastTitle>
          </Toast>,
          { intent: 'success' },
        );
      } catch (error) {
        setSaveError(error instanceof Error ? error.message : 'Falha ao salvar');
      } finally {
        setIsSaving(false);
      }
    }, [
      dispatchToast,
      draftAddress,
      draftLogistics,
      onAddressSummary,
      patientId,
      selectedAddressId,
    ]);

    useImperativeHandle(
      ref,
      () => ({
        startEdit: () => handleStartEdit(),
        cancelEdit: () => handleCancelEdit(),
        reload: () => void reload(),
        save: () => void handleSave(),
      }),
      [handleCancelEdit, handleSave, handleStartEdit, reload],
    );

    const handleAddressChange = useCallback((patch: Partial<PatientAddressUpsert>) => {
      setDraftAddress((prev) => (prev ? { ...prev, ...patch } : prev));
    }, []);

    const handleLogisticsChange = (patch: Partial<PatientAddressLogistics>) => {
      setDraftLogistics((prev) => (prev ? { ...prev, ...patch } : prev));
    };

    const handleSelectAddress = (nextId: string) => {
      if (isEditing) return;
      const selected = addresses.find((item) => item.id === nextId) ?? null;
      setSelectedAddressId(selected?.id ?? null);
      setCurrentAddress(selected);
      setDraftAddress(buildAddressDraft(selected));
      setDraftLogistics(buildLogisticsDraft(selected?.logistics ?? null));
      onAddressSummary?.({ city: selected?.city, state: selected?.state });
    };

    const handleAddAddress = () => {
      if (isEditing) return;
      setSelectedAddressId(null);
      setCurrentAddress(null);
      setDraftAddress(buildAddressDraft(null));
      setDraftLogistics(buildLogisticsDraft(null));
      setIsEditing(true);
    };

    const handleSetPrimary = useCallback(() => {
      if (!selectedAddressId || !draftAddress) return;
      if (!isEditing) {
        handleStartEdit();
      }
      handleAddressChange({ is_primary: true });
      setCurrentAddress((prev) => (prev ? { ...prev, is_primary: true } : prev));
      setAddresses((prev) =>
        prev.map((addr) => ({
          ...addr,
          is_primary: addr.id === selectedAddressId,
        })),
      );
      dispatchToast(
        <Toast>
          <ToastTitle>Endereço marcado como primário</ToastTitle>
        </Toast>,
        { intent: 'info' },
      );
    }, [dispatchToast, draftAddress, handleAddressChange, handleStartEdit, isEditing, selectedAddressId]);

    const handleCepLookup = async () => {
      if (!draftAddress) return;
      setCepLoading(true);
      try {
        const result = await lookupCepBrasilApi(draftAddress.postal_code);
        setDraftAddress((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            postal_code: result.postal_code,
            street: result.street ?? prev.street,
            neighborhood: result.neighborhood ?? prev.neighborhood,
            city: result.city ?? prev.city,
            state: result.state ?? prev.state,
            address_source: 'brasilapi',
            cep_last_lookup_source: 'brasilapi',
            cep_last_lookup_at: new Date().toISOString(),
            cep_lookup_payload: result.payload,
          };
        });
        dispatchToast(
          <Toast>
            <ToastTitle>CEP localizado</ToastTitle>
          </Toast>,
          { intent: 'success' },
        );
      } catch (error) {
        dispatchToast(
          <Toast>
            <ToastTitle>{error instanceof Error ? error.message : 'Falha ao buscar CEP'}</ToastTitle>
          </Toast>,
          { intent: 'error' },
        );
      } finally {
        setCepLoading(false);
      }
    };

    const handleRefreshGeocode = async () => {
      if (!selectedAddressId) {
        dispatchToast(
          <Toast>
            <ToastTitle>Salve o endereco antes de atualizar o geocode</ToastTitle>
          </Toast>,
          { intent: 'warning' },
        );
        return;
      }
      setGeocodeLoading(true);
      try {
        const result = await refreshAddressGeocode(selectedAddressId, true);
        updateAddressState({
          geocode_status: asOptionOrNull(result.status, geocodeStatusOptions),
          geocode_provider: asOptionOrNull(result.provider, geocodeProviderOptions),
          geocode_refreshed_at: result.refreshedAt,
          geocode_cache_until: result.cacheUntil,
          latitude: result.latitude,
          longitude: result.longitude,
          geocode_error_message: result.errorMessage,
        });
        dispatchToast(
          <Toast>
            <ToastTitle>Geocode atualizado</ToastTitle>
          </Toast>,
          { intent: 'success' },
        );
      } catch (error) {
        dispatchToast(
          <Toast>
            <ToastTitle>{error instanceof Error ? error.message : 'Falha ao atualizar geocode'}</ToastTitle>
          </Toast>,
          { intent: 'error' },
        );
      } finally {
        setGeocodeLoading(false);
      }
    };

    const handleRefreshRisk = async () => {
      if (!selectedAddressId) {
        dispatchToast(
          <Toast>
            <ToastTitle>Salve o endereco antes de atualizar o risco</ToastTitle>
          </Toast>,
          { intent: 'warning' },
        );
        return;
      }
      setRiskLoading(true);
      try {
        const result = await refreshAddressRisk(selectedAddressId, true);
        updateAddressState({
          risk_status: asOptionOrNull(result.status, riskStatusOptions),
          risk_provider: result.provider,
          risk_refreshed_at: result.refreshedAt,
          risk_cache_until: result.cacheUntil,
          risk_score: result.score,
          risk_level: asOptionOrNull(result.level, riskLevelOptions),
          risk_error_message: result.errorMessage,
        });
        dispatchToast(
          <Toast>
            <ToastTitle>Ranking de risco atualizado</ToastTitle>
          </Toast>,
          { intent: 'success' },
        );
      } catch (error) {
        dispatchToast(
          <Toast>
            <ToastTitle>{error instanceof Error ? error.message : 'Falha ao atualizar risco'}</ToastTitle>
          </Toast>,
          { intent: 'error' },
        );
      } finally {
        setRiskLoading(false);
      }
    };

    const handleShareLocation = async () => {
      if (!draftAddress) return;
      const cityUf = draftAddress.city && draftAddress.state ? `${draftAddress.city}/${draftAddress.state}` : draftAddress.city;
      const formattedAddress = `${draftAddress.street}, ${draftAddress.number}`;
      const parts = [
        patientName ? `Paciente: ${patientName}` : null,
        formattedAddress,
        cityUf,
        `CEP: ${formatPostalCode(draftAddress.postal_code)}`,
        mapsUrl ? `Google Maps: ${mapsUrl}` : null,
        wazeUrl ? `Waze: ${wazeUrl}` : null,
        draftAddress.latitude != null && draftAddress.longitude != null
          ? `Coordenadas: ${draftAddress.latitude}, ${draftAddress.longitude}`
          : null,
      ].filter(Boolean) as string[];

      const text = parts.join('\n');
      const clipboardPayload = mapsUrl ?? moovitUrl ?? wazeUrl ?? text;
      const clipboardMessage = mapsUrl || moovitUrl || wazeUrl ? 'Link copiado para o clipboard' : 'Informação copiada para o clipboard';

      try {
        if (navigator.share) {
          await navigator.share({ text: clipboardPayload });
          return;
        }
        await navigator.clipboard.writeText(clipboardPayload);
        dispatchToast(
          <Toast>
            <ToastTitle>{clipboardMessage}</ToastTitle>
          </Toast>,
          { intent: 'success' },
        );
      } catch (error) {
        dispatchToast(
          <Toast>
            <ToastTitle>{error instanceof Error ? error.message : 'Falha ao compartilhar'}</ToastTitle>
          </Toast>,
          { intent: 'error' },
        );
      }
    };

    if (isLoading) {
      return (
        <div className={styles.container}>
          <Spinner label="Carregando endereco..." />
        </div>
      );
    }

    if (loadError) {
      return (
        <div className={styles.container}>
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>Erro ao carregar</div>
              <Button appearance="primary" icon={<ArrowClockwiseRegular />} onClick={() => void reload()}>
                Tentar novamente
              </Button>
            </div>
            <div className={styles.cardBody}>
              <p className={styles.note}>{loadError}</p>
            </div>
          </section>
        </div>
      );
    }

    if (!addresses.length && !isEditing) {
      return (
        <div className={styles.container}>
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>Nenhum endereco cadastrado</div>
              <Button appearance="primary" onClick={handleAddAddress}>
                Adicionar endereco
              </Button>
            </div>
          </section>
        </div>
      );
    }

    if (!draftAddress || !draftLogistics) {
      return (
        <div className={styles.container}>
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>Endereco nao disponivel</div>
              <Button appearance="primary" onClick={handleAddAddress}>
                Adicionar endereco
              </Button>
            </div>
          </section>
        </div>
      );
    }

    const hasCoords = draftAddress.latitude != null && draftAddress.longitude != null;
    const mapsUrl = hasCoords ? `https://www.google.com/maps?q=${draftAddress.latitude},${draftAddress.longitude}` : null;
    const wazeUrl = hasCoords
      ? `https://waze.com/ul?ll=${draftAddress.latitude},${draftAddress.longitude}&navigate=yes`
      : null;
    const moovitUrl = hasCoords
      ? `https://moovitapp.com/?lat=${draftAddress.latitude}&lng=${draftAddress.longitude}`
      : null;
    const showRiskBadge = draftAddress.risk_level != null;
    const riskBadgeColors: Record<string, { background: string; color: string }> = {
      low: { background: '#dff6dd', color: '#107c10' },
      medium: { background: '#fff4ce', color: '#c15b00' },
      high: { background: '#fbe5e7', color: '#a4262c' },
      unknown: { background: '#f3f2f1', color: '#605e5c' },
    };
    const riskBadgeKey = draftAddress.risk_level ?? 'unknown';
    const riskBadgeStyle = riskBadgeColors[riskBadgeKey] ?? riskBadgeColors.unknown;
    const riskBadgeText = showRiskBadge ? formatRiskLevel(riskBadgeKey) : '—';
    const riskUpdatedAtText = formatDateTime(draftAddress.risk_refreshed_at);

    const readOnlyAddress = currentAddress ?? draftAddress;
    const readOnlyLogistics = currentAddress?.logistics ?? draftLogistics;

    const addressRows: ReadOnlyItem[] = [
      { label: 'Identificador', value: formatText(readOnlyAddress.address_label) },
      { label: 'Finalidade', value: formatText(readOnlyAddress.address_purpose) },
      { label: 'Endereco primario', value: formatBoolean(readOnlyAddress.is_primary) },
      { label: 'Endereco formatado', value: formatAddressLine(readOnlyAddress) },
      { label: 'CEP', value: formatPostalCode(readOnlyAddress.postal_code) },
      { label: 'Logradouro', value: formatText(readOnlyAddress.street) },
      { label: 'Numero', value: formatText(readOnlyAddress.number) },
      { label: 'Complemento', value: formatText(readOnlyAddress.complement) },
      { label: 'Bairro', value: formatText(readOnlyAddress.neighborhood) },
      { label: 'Cidade', value: formatText(readOnlyAddress.city) },
      { label: 'UF', value: formatText(readOnlyAddress.state) },
      { label: 'Pais', value: formatText(readOnlyAddress.country) },
      { label: 'Ponto de referencia', value: formatText(readOnlyAddress.reference_point) },
    ];

    const logisticsRows: ReadOnlyItem[] = [
      { label: 'Horario de visita', value: formatText(readOnlyLogistics.allowed_visit_hours) },
      { label: 'Tempo estimado (min)', value: formatText(readOnlyLogistics.travel_time_min) },
      { label: 'Distancia (km)', value: formatText(readOnlyLogistics.distance_km) },
      { label: 'Notas de deslocamento', value: formatText(readOnlyLogistics.travel_notes) },
      { label: 'Condicoes de acesso', value: formatText(readOnlyLogistics.access_conditions) },
      { label: 'Procedimento de entrada', value: formatText(readOnlyLogistics.entry_procedure) },
      { label: 'Identificacao no portao', value: formatText(readOnlyLogistics.gate_identification) },
      { label: 'Estacionamento', value: formatText(readOnlyLogistics.parking) },
      { label: 'Estacionamento equipe', value: formatText(readOnlyLogistics.team_parking) },
      { label: 'Acesso ambulancia', value: formatText(readOnlyLogistics.ambulance_access) },
      { label: 'Risco noturno', value: formatText(readOnlyLogistics.night_access_risk) },
      { label: 'Tipo area de risco', value: formatText(readOnlyLogistics.area_risk_type) },
      { label: 'Zona', value: formatText(readOnlyLogistics.zone_type) },
      { label: 'Tipo de rua', value: formatText(readOnlyLogistics.street_access_type) },
      { label: 'Escadas externas', value: formatText(readOnlyLogistics.external_stairs) },
      { label: 'Elevador', value: formatText(readOnlyLogistics.elevator_status) },
      { label: 'Acesso cadeirante', value: formatText(readOnlyLogistics.wheelchair_access) },
      { label: 'Portaria 24h', value: formatBoolean(readOnlyLogistics.has_24h_concierge) },
      { label: 'Contato portaria', value: formatText(readOnlyLogistics.concierge_contact) },
      { label: 'Sinal celular', value: formatText(readOnlyLogistics.cell_signal_quality) },
    ];

    const structureRows: ReadOnlyItem[] = [
      { label: 'Tipo de imovel', value: formatText(readOnlyLogistics.property_type) },
      { label: 'Condominio', value: formatText(readOnlyLogistics.condo_name) },
      { label: 'Bloco/Torre', value: formatText(readOnlyLogistics.block_tower) },
      { label: 'Andar', value: formatText(readOnlyLogistics.floor_number) },
      { label: 'Unidade', value: formatText(readOnlyLogistics.unit_number) },
      { label: 'Tipo de cama', value: formatText(readOnlyLogistics.bed_type) },
      { label: 'Tipo de colchao', value: formatText(readOnlyLogistics.mattress_type) },
      { label: 'Banheiro adaptado', value: formatBoolean(readOnlyLogistics.adapted_bathroom) },
      { label: 'Tensao eletrica', value: formatText(readOnlyLogistics.electric_voltage) },
      { label: 'Energia reserva', value: formatText(readOnlyLogistics.backup_power_source) },
      { label: 'Detalhes energia', value: formatText(readOnlyLogistics.backup_power_desc) },
      { label: 'Fonte de agua', value: formatText(readOnlyLogistics.water_source) },
      { label: 'Wifi', value: formatBoolean(readOnlyLogistics.has_wifi) },
      { label: 'Fumantes', value: formatBoolean(readOnlyLogistics.has_smokers) },
      { label: 'Comportamento animais', value: formatText(readOnlyLogistics.animals_behavior) },
      { label: 'Descricao pets', value: formatText(readOnlyLogistics.pets_description) },
      { label: 'Ventilacao', value: formatText(readOnlyLogistics.ventilation) },
      { label: 'Iluminacao', value: formatText(readOnlyLogistics.lighting_quality) },
      { label: 'Nivel de ruido', value: formatText(readOnlyLogistics.noise_level) },
      { label: 'Condicoes de higiene', value: formatText(readOnlyLogistics.hygiene_conditions) },
      { label: 'Espaco equipamento', value: formatText(readOnlyLogistics.equipment_space) },
      { label: 'Tomadas disponiveis', value: formatText(readOnlyLogistics.power_outlets_desc) },
      { label: 'URL fachada', value: formatText(readOnlyLogistics.facade_image_url) },
      { label: 'Observacoes gerais', value: formatText(readOnlyLogistics.general_observations) },
    ];

    const renderReadOnlyList = (rows: ReadOnlyItem[]) => (
      <dl className={styles.definitionList}>
        {rows.map((row) => (
          <ReadOnlyRow key={row.label} label={row.label} value={row.value} />
        ))}
      </dl>
    );

    const renderReadOnlyColumns = (rows: ReadOnlyItem[]) => {
      const mid = Math.ceil(rows.length / 2);
      const left = rows.slice(0, mid);
      const right = rows.slice(mid);
      return (
        <div className={styles.readOnlyGrid}>
          {renderReadOnlyList(left)}
          {right.length ? renderReadOnlyList(right) : null}
        </div>
      );
    };

    return (
      <div className={styles.container}>
        <Toaster toasterId={toasterId} />
        <div className={styles.grid}>
          <div className={styles.leftCol}>
            <section className={`${styles.card} ${styles.cardSpan}`}>
              <div className={styles.cardHeader}>
                <div>
                  <div className={styles.cardTitle}>Endereco</div>
                  {addressOptions.length > 1 && (
                    <Select
                      className={styles.addressSelect}
                      size="small"
                      value={selectedAddressId ?? ''}
                      disabled={isEditing}
                      onChange={(e) => handleSelectAddress(e.currentTarget.value)}
                    >
                      {addressOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.location ? `${option.label} · ${option.location}` : option.label}
                        </option>
                      ))}
                    </Select>
                  )}
                </div>
                <div className={styles.inlineActions}>
                  {!isEditing && (
                    <Button appearance="outline" size="small" onClick={handleAddAddress}>
                      Novo endereco
                    </Button>
                  )}
                  {isEditing && (
                    <Button appearance="subtle" size="small" onClick={handleCepLookup} disabled={cepLoading}>
                      {cepLoading ? 'Buscando...' : 'Buscar CEP'}
                    </Button>
                  )}
                  {addressOptions.length > 1 && (
                    <Button
                      appearance="outline"
                      size="small"
                      onClick={handleSetPrimary}
                      disabled={(draftAddress?.is_primary ?? false) || !selectedAddressId}
                    >
                      Definir como primário
                    </Button>
                  )}
                </div>
              </div>
              <div className={styles.cardBody}>
                {!isEditing && addressOptions.length > 1 && (
                  <div className={styles.addressSwitcher}>
                    {addressOptions.map((option) => {
                      const location = option.location;
                      const label = [option.label, location].filter(Boolean).join(' - ');
                      const isSelected = option.id === selectedAddressId;
                      return (
                        <Button
                          key={option.id}
                          size="small"
                          appearance={isSelected ? 'primary' : 'outline'}
                          onClick={() => handleSelectAddress(option.id)}
                        >
                          <span className={styles.addressOption}>
                            <span>{label}</span>
                            {option.isPrimary && <span className={styles.tag}>Primario</span>}
                          </span>
                        </Button>
                      );
                    })}
                  </div>
                )}

                {isEditing ? (
                  <>
                    <div className={styles.fieldGroupThree}>
                      <Field
                        label="Identificador"
                        validationState={getErrorFor(fieldErrors, 'address_label') ? 'error' : undefined}
                        validationMessage={getErrorFor(fieldErrors, 'address_label')}
                      >
                        <Input
                          value={draftAddress.address_label}
                          onChange={(e) => handleAddressChange({ address_label: e.target.value })}
                        />
                      </Field>
                      <Field
                        label="Finalidade"
                        validationState={getErrorFor(fieldErrors, 'address_purpose') ? 'error' : undefined}
                        validationMessage={getErrorFor(fieldErrors, 'address_purpose')}
                      >
                        <Select
                          value={draftAddress.address_purpose}
                          onChange={(e) =>
                            handleAddressChange({
                              address_purpose: e.currentTarget.value as PatientAddressUpsert['address_purpose'],
                            })
                          }
                        >
                          {addressPurposeOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </Select>
                      </Field>
                      <Field label="Endereco primario">
                        <Checkbox
                          label="Primario"
                          checked={draftAddress.is_primary ?? false}
                          onChange={(_, data) => handleAddressChange({ is_primary: data.checked === true })}
                        />
                      </Field>
                    </div>

                    <div className={styles.fieldGroupThree} style={{ marginTop: '16px' }}>
                      <Field
                        label="CEP"
                        required
                        validationState={getErrorFor(fieldErrors, 'postal_code') ? 'error' : undefined}
                        validationMessage={getErrorFor(fieldErrors, 'postal_code')}
                      >
                        <Input
                          value={draftAddress.postal_code}
                          onChange={(e) => handleAddressChange({ postal_code: e.target.value })}
                          placeholder="00000-000"
                          contentBefore={<LocationRegular />}
                        />
                      </Field>
                      <Field
                        label="Logradouro"
                        required
                        validationState={getErrorFor(fieldErrors, 'street') ? 'error' : undefined}
                        validationMessage={getErrorFor(fieldErrors, 'street')}
                      >
                        <Input
                          value={draftAddress.street}
                          onChange={(e) => handleAddressChange({ street: e.target.value })}
                        />
                      </Field>
                      <Field
                        label="Numero"
                        required
                        validationState={getErrorFor(fieldErrors, 'number') ? 'error' : undefined}
                        validationMessage={getErrorFor(fieldErrors, 'number')}
                      >
                        <Input
                          value={draftAddress.number}
                          onChange={(e) => handleAddressChange({ number: e.target.value })}
                        />
                      </Field>
                    </div>

                    <div className={styles.fieldGroup} style={{ marginTop: '16px' }}>
                      <Field label="Complemento">
                        <Input
                          value={asInputValue(draftAddress.complement)}
                          onChange={(e) => handleAddressChange({ complement: e.target.value })}
                        />
                      </Field>
                      <Field
                        label="Bairro"
                        required
                        validationState={getErrorFor(fieldErrors, 'neighborhood') ? 'error' : undefined}
                        validationMessage={getErrorFor(fieldErrors, 'neighborhood')}
                      >
                        <Input
                          value={draftAddress.neighborhood}
                          onChange={(e) => handleAddressChange({ neighborhood: e.target.value })}
                        />
                      </Field>
                      <Field
                        label="Cidade"
                        required
                        validationState={getErrorFor(fieldErrors, 'city') ? 'error' : undefined}
                        validationMessage={getErrorFor(fieldErrors, 'city')}
                      >
                        <Input value={draftAddress.city} onChange={(e) => handleAddressChange({ city: e.target.value })} />
                      </Field>
                      <Field
                        label="UF"
                        required
                        validationState={getErrorFor(fieldErrors, 'state') ? 'error' : undefined}
                        validationMessage={getErrorFor(fieldErrors, 'state')}
                      >
                        <Input
                          value={draftAddress.state}
                          onChange={(e) => handleAddressChange({ state: e.target.value })}
                          placeholder="UF"
                        />
                      </Field>
                      <Field label="Pais">
                        <Input value={draftAddress.country ?? ''} onChange={(e) => handleAddressChange({ country: e.target.value })} />
                      </Field>
                      <Field label="Ponto de referencia">
                        <Input
                          value={asInputValue(draftAddress.reference_point)}
                          onChange={(e) => handleAddressChange({ reference_point: e.target.value })}
                          contentBefore={<MapRegular />}
                        />
                      </Field>
                    </div>
                  </>
                ) : (
                  renderReadOnlyList(addressRows)
                )}
              </div>
            </section>

            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>Logistica & acesso</div>
              </div>
              <div className={styles.cardBody}>
                {isEditing ? (
                  <div className={styles.fieldGroup}>
                    <Field label="Horario de visita">
                      <Input
                        value={asInputValue(draftLogistics.allowed_visit_hours)}
                        disabled={!isEditing}
                        onChange={(e) => handleLogisticsChange({ allowed_visit_hours: e.target.value })}
                      />
                    </Field>
                    <Field label="Tempo estimado (min)">
                      <Input
                        type="number"
                        value={asInputValue(draftLogistics.travel_time_min)}
                        disabled={!isEditing}
                        onChange={(e) =>
                          handleLogisticsChange({
                            travel_time_min: e.target.value === '' ? null : Number(e.target.value),
                          })
                        }
                      />
                    </Field>
                    <Field label="Distancia (km)">
                      <Input
                        type="number"
                        value={asInputValue(draftLogistics.distance_km)}
                        disabled={!isEditing}
                        onChange={(e) =>
                          handleLogisticsChange({
                            distance_km: e.target.value === '' ? null : Number(e.target.value),
                          })
                        }
                      />
                    </Field>
                    <Field label="Notas de deslocamento">
                      <Input
                        value={asInputValue(draftLogistics.travel_notes)}
                        disabled={!isEditing}
                        onChange={(e) => handleLogisticsChange({ travel_notes: e.target.value })}
                      />
                    </Field>
                    <Field label="Condicoes de acesso">
                      <Input
                        value={asInputValue(draftLogistics.access_conditions)}
                        disabled={!isEditing}
                        onChange={(e) => handleLogisticsChange({ access_conditions: e.target.value })}
                      />
                    </Field>
                    <Field label="Procedimento de entrada">
                      <Input
                        value={asInputValue(draftLogistics.entry_procedure)}
                        disabled={!isEditing}
                        onChange={(e) => handleLogisticsChange({ entry_procedure: e.target.value })}
                      />
                    </Field>
                    <Field label="Identificacao no portao">
                      <Input
                        value={asInputValue(draftLogistics.gate_identification)}
                        disabled={!isEditing}
                        onChange={(e) => handleLogisticsChange({ gate_identification: e.target.value })}
                      />
                    </Field>
                    <Field label="Estacionamento">
                      <Input
                        value={asInputValue(draftLogistics.parking)}
                        disabled={!isEditing}
                        onChange={(e) => handleLogisticsChange({ parking: e.target.value })}
                      />
                    </Field>
                    <Field label="Estacionamento equipe">
                      <Input
                        value={asInputValue(draftLogistics.team_parking)}
                        disabled={!isEditing}
                        onChange={(e) => handleLogisticsChange({ team_parking: e.target.value })}
                      />
                    </Field>
                    <Field label="Acesso ambulancia">
                      <Select
                        value={draftLogistics.ambulance_access ?? ''}
                        disabled={!isEditing}
                        onChange={(e) =>
                          handleLogisticsChange({
                            ambulance_access: (e.currentTarget.value === ''
                              ? null
                              : e.currentTarget.value) as PatientAddressLogistics['ambulance_access'],
                          })
                        }
                      >
                        <option value="">Nao informado</option>
                        {ambulanceAccessOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="Risco noturno">
                      <Select
                        value={draftLogistics.night_access_risk ?? ''}
                        disabled={!isEditing}
                        onChange={(e) =>
                          handleLogisticsChange({
                            night_access_risk: (e.currentTarget.value === ''
                              ? null
                              : e.currentTarget.value) as PatientAddressLogistics['night_access_risk'],
                          })
                        }
                      >
                        <option value="">Nao informado</option>
                        {nightAccessRiskOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="Tipo area de risco">
                      <Select
                        value={draftLogistics.area_risk_type ?? ''}
                        disabled={!isEditing}
                        onChange={(e) =>
                          handleLogisticsChange({
                            area_risk_type: (e.currentTarget.value === ''
                              ? null
                              : e.currentTarget.value) as PatientAddressLogistics['area_risk_type'],
                          })
                        }
                      >
                        <option value="">Nao informado</option>
                        {areaRiskTypeOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="Zona">
                      <Select
                        value={draftLogistics.zone_type ?? ''}
                        disabled={!isEditing}
                        onChange={(e) =>
                          handleLogisticsChange({
                            zone_type: (e.currentTarget.value === ''
                              ? null
                              : e.currentTarget.value) as PatientAddressLogistics['zone_type'],
                          })
                        }
                      >
                        <option value="">Nao informado</option>
                        {zoneTypeOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="Tipo de rua">
                      <Select
                        value={draftLogistics.street_access_type ?? ''}
                        disabled={!isEditing}
                        onChange={(e) =>
                          handleLogisticsChange({
                            street_access_type: (e.currentTarget.value === ''
                              ? null
                              : e.currentTarget.value) as PatientAddressLogistics['street_access_type'],
                          })
                        }
                      >
                        <option value="">Nao informado</option>
                        {streetAccessTypeOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="Escadas externas">
                      <Input
                        value={asInputValue(draftLogistics.external_stairs)}
                        disabled={!isEditing}
                        onChange={(e) => handleLogisticsChange({ external_stairs: e.target.value })}
                      />
                    </Field>
                    <Field label="Elevador">
                      <Select
                        value={draftLogistics.elevator_status ?? ''}
                        disabled={!isEditing}
                        onChange={(e) =>
                          handleLogisticsChange({
                            elevator_status: (e.currentTarget.value === ''
                              ? null
                              : e.currentTarget.value) as PatientAddressLogistics['elevator_status'],
                          })
                        }
                      >
                        <option value="">Nao informado</option>
                        {elevatorStatusOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="Acesso cadeirante">
                      <Select
                        value={draftLogistics.wheelchair_access ?? ''}
                        disabled={!isEditing}
                        onChange={(e) =>
                          handleLogisticsChange({
                            wheelchair_access: (e.currentTarget.value === ''
                              ? null
                              : e.currentTarget.value) as PatientAddressLogistics['wheelchair_access'],
                          })
                        }
                      >
                        <option value="">Nao informado</option>
                        {wheelchairAccessOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="Portaria 24h">
                      <Checkbox
                        label="Sim"
                        checked={draftLogistics.has_24h_concierge ?? false}
                        disabled={!isEditing}
                        onChange={(_, data) => handleLogisticsChange({ has_24h_concierge: data.checked === true })}
                      />
                    </Field>
                    <Field label="Contato portaria">
                      <Input
                        value={asInputValue(draftLogistics.concierge_contact)}
                        disabled={!isEditing}
                        onChange={(e) => handleLogisticsChange({ concierge_contact: e.target.value })}
                      />
                    </Field>
                    <Field label="Sinal celular">
                      <Select
                        value={draftLogistics.cell_signal_quality ?? ''}
                        disabled={!isEditing}
                        onChange={(e) =>
                          handleLogisticsChange({
                            cell_signal_quality: (e.currentTarget.value === ''
                              ? null
                              : e.currentTarget.value) as PatientAddressLogistics['cell_signal_quality'],
                          })
                        }
                      >
                        <option value="">Nao informado</option>
                        {cellSignalQualityOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </Select>
                    </Field>
                  </div>
                ) : (
                  renderReadOnlyColumns(logisticsRows)
                )}
              </div>
            </section>

            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>Estrutura da residencia</div>
              </div>
              <div className={styles.cardBody}>
                {isEditing ? (
                  <div className={styles.fieldGroup}>
                    <Field label="Tipo de imovel">
                      <Select
                        value={draftLogistics.property_type ?? ''}
                        disabled={!isEditing}
                        onChange={(e) =>
                          handleLogisticsChange({
                            property_type: (e.currentTarget.value === ''
                              ? null
                              : e.currentTarget.value) as PatientAddressLogistics['property_type'],
                          })
                        }
                      >
                        <option value="">Nao informado</option>
                        {propertyTypeOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="Condominio">
                      <Input
                        value={asInputValue(draftLogistics.condo_name)}
                        disabled={!isEditing}
                        onChange={(e) => handleLogisticsChange({ condo_name: e.target.value })}
                      />
                    </Field>
                    <Field label="Bloco/Torre">
                      <Input
                        value={asInputValue(draftLogistics.block_tower)}
                        disabled={!isEditing}
                        onChange={(e) => handleLogisticsChange({ block_tower: e.target.value })}
                      />
                    </Field>
                    <Field label="Andar">
                      <Input
                        type="number"
                        value={asInputValue(draftLogistics.floor_number)}
                        disabled={!isEditing}
                        onChange={(e) =>
                          handleLogisticsChange({
                            floor_number: e.target.value === '' ? null : Number(e.target.value),
                          })
                        }
                      />
                    </Field>
                    <Field label="Unidade">
                      <Input
                        value={asInputValue(draftLogistics.unit_number)}
                        disabled={!isEditing}
                        onChange={(e) => handleLogisticsChange({ unit_number: e.target.value })}
                      />
                    </Field>
                    <Field label="Tipo de cama">
                      <Select
                        value={draftLogistics.bed_type ?? ''}
                        disabled={!isEditing}
                        onChange={(e) =>
                          handleLogisticsChange({
                            bed_type: (e.currentTarget.value === ''
                              ? null
                              : e.currentTarget.value) as PatientAddressLogistics['bed_type'],
                          })
                        }
                      >
                        <option value="">Nao informado</option>
                        {bedTypeOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="Tipo de colchao">
                      <Select
                        value={draftLogistics.mattress_type ?? ''}
                        disabled={!isEditing}
                        onChange={(e) =>
                          handleLogisticsChange({
                            mattress_type: (e.currentTarget.value === ''
                              ? null
                              : e.currentTarget.value) as PatientAddressLogistics['mattress_type'],
                          })
                        }
                      >
                        <option value="">Nao informado</option>
                        {mattressTypeOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="Banheiro adaptado">
                      <Checkbox
                        label="Sim"
                        checked={draftLogistics.adapted_bathroom ?? false}
                        disabled={!isEditing}
                        onChange={(_, data) => handleLogisticsChange({ adapted_bathroom: data.checked === true })}
                      />
                    </Field>
                    <Field label="Tensao eletrica">
                      <Select
                        value={draftLogistics.electric_voltage ?? ''}
                        disabled={!isEditing}
                        onChange={(e) =>
                          handleLogisticsChange({
                            electric_voltage: (e.currentTarget.value === ''
                              ? null
                              : e.currentTarget.value) as PatientAddressLogistics['electric_voltage'],
                          })
                        }
                      >
                        <option value="">Nao informado</option>
                        {electricVoltageOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="Energia reserva">
                      <Select
                        value={draftLogistics.backup_power_source ?? ''}
                        disabled={!isEditing}
                        onChange={(e) =>
                          handleLogisticsChange({
                            backup_power_source: (e.currentTarget.value === ''
                              ? null
                              : e.currentTarget.value) as PatientAddressLogistics['backup_power_source'],
                          })
                        }
                      >
                        <option value="">Nao informado</option>
                        {backupPowerSourceOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="Detalhes energia">
                      <Input
                        value={asInputValue(draftLogistics.backup_power_desc)}
                        disabled={!isEditing}
                        onChange={(e) => handleLogisticsChange({ backup_power_desc: e.target.value })}
                      />
                    </Field>
                    <Field label="Fonte de agua">
                      <Select
                        value={draftLogistics.water_source ?? ''}
                        disabled={!isEditing}
                        onChange={(e) =>
                          handleLogisticsChange({
                            water_source: (e.currentTarget.value === ''
                              ? null
                              : e.currentTarget.value) as PatientAddressLogistics['water_source'],
                          })
                        }
                      >
                        <option value="">Nao informado</option>
                        {waterSourceOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="Wifi">
                      <Checkbox
                        label="Sim"
                        checked={draftLogistics.has_wifi ?? false}
                        disabled={!isEditing}
                        onChange={(_, data) => handleLogisticsChange({ has_wifi: data.checked === true })}
                      />
                    </Field>
                    <Field label="Fumantes">
                      <Checkbox
                        label="Sim"
                        checked={draftLogistics.has_smokers ?? false}
                        disabled={!isEditing}
                        onChange={(_, data) => handleLogisticsChange({ has_smokers: data.checked === true })}
                      />
                    </Field>
                    <Field label="Comportamento animais">
                      <Select
                        value={draftLogistics.animals_behavior ?? ''}
                        disabled={!isEditing}
                        onChange={(e) =>
                          handleLogisticsChange({
                            animals_behavior: (e.currentTarget.value === ''
                              ? null
                              : e.currentTarget.value) as PatientAddressLogistics['animals_behavior'],
                          })
                        }
                      >
                        <option value="">Nao informado</option>
                        {animalsBehaviorOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="Descricao pets">
                      <Input
                        value={asInputValue(draftLogistics.pets_description)}
                        disabled={!isEditing}
                        onChange={(e) => handleLogisticsChange({ pets_description: e.target.value })}
                      />
                    </Field>
                    <Field label="Ventilacao">
                      <Input
                        value={asInputValue(draftLogistics.ventilation)}
                        disabled={!isEditing}
                        onChange={(e) => handleLogisticsChange({ ventilation: e.target.value })}
                      />
                    </Field>
                    <Field label="Iluminacao">
                      <Input
                        value={asInputValue(draftLogistics.lighting_quality)}
                        disabled={!isEditing}
                        onChange={(e) => handleLogisticsChange({ lighting_quality: e.target.value })}
                      />
                    </Field>
                    <Field label="Nivel de ruido">
                      <Input
                        value={asInputValue(draftLogistics.noise_level)}
                        disabled={!isEditing}
                        onChange={(e) => handleLogisticsChange({ noise_level: e.target.value })}
                      />
                    </Field>
                    <Field label="Condicoes de higiene">
                      <Input
                        value={asInputValue(draftLogistics.hygiene_conditions)}
                        disabled={!isEditing}
                        onChange={(e) => handleLogisticsChange({ hygiene_conditions: e.target.value })}
                      />
                    </Field>
                    <Field label="Espaco equipamento">
                      <Select
                        value={draftLogistics.equipment_space ?? ''}
                        disabled={!isEditing}
                        onChange={(e) =>
                          handleLogisticsChange({
                            equipment_space: (e.currentTarget.value === ''
                              ? null
                              : e.currentTarget.value) as PatientAddressLogistics['equipment_space'],
                          })
                        }
                      >
                        <option value="">Nao informado</option>
                        {equipmentSpaceOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="Tomadas disponiveis">
                      <Input
                        value={asInputValue(draftLogistics.power_outlets_desc)}
                        disabled={!isEditing}
                        onChange={(e) => handleLogisticsChange({ power_outlets_desc: e.target.value })}
                      />
                    </Field>
                    <Field label="URL fachada">
                      <Input
                        value={asInputValue(draftLogistics.facade_image_url)}
                        disabled={!isEditing}
                        onChange={(e) => handleLogisticsChange({ facade_image_url: e.target.value })}
                      />
                    </Field>
                    <Field label="Observacoes gerais">
                      <Textarea
                        value={asInputValue(draftLogistics.general_observations)}
                        disabled={!isEditing}
                        onChange={(e) => handleLogisticsChange({ general_observations: e.target.value })}
                        rows={3}
                      />
                    </Field>
                  </div>
                ) : (
                  renderReadOnlyColumns(structureRows)
                )}
              </div>
            </section>
          </div>

          <aside className={styles.rightCol}>
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <div className={styles.cardTitle}>Integracoes</div>
                  <div className={styles.riskMeta}>Última atualização: {riskUpdatedAtText}</div>
                </div>
                <div className={styles.inlineActions}>
                  {isEditing && (
                    <>
                      <Button appearance="outline" size="small" onClick={handleRefreshGeocode} disabled={geocodeLoading}>
                        {geocodeLoading ? 'Atualizando...' : 'Atualizar geocode'}
                      </Button>
                      <Button appearance="outline" size="small" onClick={handleRefreshRisk} disabled={riskLoading}>
                        {riskLoading ? 'Atualizando...' : 'Atualizar risco'}
                      </Button>
                    </>
                  )}
                </div>
                {showRiskBadge && (
                  <span className={styles.riskBadge} style={riskBadgeStyle}>
                    {riskBadgeText}
                  </span>
                )}
              </div>
              <div className={styles.cardBody}>
                {renderReadOnlyList([
                  { label: 'CEP', value: formatPostalCode(draftAddress.postal_code) },
                  { label: 'Ultima consulta CEP', value: formatDateTime(draftAddress.cep_last_lookup_at) },
                  { label: 'Origem CEP', value: formatText(draftAddress.cep_last_lookup_source) },
                ])}
                <hr style={{ border: 0, borderTop: `1px solid ${tokens.colorNeutralStroke2}`, margin: '12px 0' }} />
                {renderReadOnlyList([
                  { label: 'Geocode', value: formatStatus(draftAddress.geocode_status) },
                  { label: 'Ultima atualizacao', value: formatDateTime(draftAddress.geocode_refreshed_at) },
                  { label: 'Provider', value: formatText(draftAddress.geocode_provider) },
                  { label: 'Erro geocode', value: formatText(draftAddress.geocode_error_message) },
                ])}
                <hr style={{ border: 0, borderTop: `1px solid ${tokens.colorNeutralStroke2}`, margin: '12px 0' }} />
                {renderReadOnlyList([
                  { label: 'Risco', value: formatRiskLevel(draftAddress.risk_level) },
                  { label: 'Score', value: formatText(draftAddress.risk_score) },
                  { label: 'Status', value: formatStatus(draftAddress.risk_status) },
                  { label: 'Ultima atualizacao', value: formatDateTime(draftAddress.risk_refreshed_at) },
                  { label: 'Provider', value: formatText(draftAddress.risk_provider) },
                  { label: 'Erro risco', value: formatText(draftAddress.risk_error_message) },
                ])}
              </div>
            </section>

            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>Localizacao</div>
                <Button
                  appearance="outline"
                  size="small"
                  as="a"
                  href={moovitUrl ?? undefined}
                  target="_blank"
                  rel="noreferrer"
                  disabled={!moovitUrl}
                >
                  Abrir no Moovit
                </Button>
                <Button appearance="outline" size="small" icon={<ShareRegular />} onClick={handleShareLocation}>
                  Compartilhar localizacao
                </Button>
              </div>
              <div className={styles.cardBody}>
                {renderReadOnlyList([
                  { label: 'Latitude', value: formatText(draftAddress.latitude) },
                  { label: 'Longitude', value: formatText(draftAddress.longitude) },
                ])}
                {mapsUrl && (
                  <p className={styles.note}>
                    <a className={styles.link} href={mapsUrl} target="_blank" rel="noreferrer">
                      Abrir no Google Maps
                    </a>
                  </p>
                )}
                {wazeUrl && (
                  <p className={styles.note}>
                    <a className={styles.link} href={wazeUrl} target="_blank" rel="noreferrer">
                      Abrir no Waze
                    </a>
                  </p>
                )}
                {!mapsUrl && (
                  <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: tokens.colorNeutralForeground3 }}>
                    <VehicleCarRegular />
                    <span>Geocode necessario para links de mapa.</span>
                  </div>
                )}
              </div>
            </section>

            {saveError && (
              <section className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitle}>Falha ao salvar</div>
                </div>
                <div className={styles.cardBody}>
                  <p className={styles.note}>{saveError}</p>
                </div>
              </section>
            )}
          </aside>
        </div>
      </div>
    );
  },
);
