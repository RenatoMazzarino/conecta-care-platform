-- CONTRATO: docs/contracts/pacientes/ABA02_ENDERECO_LOGISTICA.md
-- PR: TBD
-- EVIDENCIA: docs/contracts/pacientes/README.md
-- DESCRICAO: cria tabelas de endereco/logistica e integra CEP/geocode/risco

create table public.patient_addresses (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null default app_private.current_tenant_id(),
  patient_id uuid not null references public.patients(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid null,
  updated_by uuid null,
  deleted_at timestamptz null,
  address_label text not null default 'Endereco principal',
  address_purpose text not null default 'outro',
  is_primary boolean not null default false,
  postal_code text not null,
  street text not null,
  number text not null,
  complement text null,
  neighborhood text not null,
  city text not null,
  state text not null,
  country text not null default 'Brasil',
  reference_point text null,
  address_source text not null default 'manual',
  latitude numeric null,
  longitude numeric null,
  cep_last_lookup_at timestamptz null,
  cep_last_lookup_source text null,
  cep_lookup_payload jsonb null,
  geocode_status text null,
  geocode_provider text null,
  geocode_refreshed_at timestamptz null,
  geocode_cache_until timestamptz null,
  geocode_precision text null,
  geocode_place_id text null,
  geocode_payload jsonb null,
  geocode_error_message text null,
  risk_status text null,
  risk_provider text null,
  risk_score numeric null,
  risk_level text null,
  risk_refreshed_at timestamptz null,
  risk_cache_until timestamptz null,
  risk_payload jsonb null,
  risk_error_message text null,
  constraint patient_addresses_postal_code_chk check (postal_code ~ '^[0-9]{8}$'),
  constraint patient_addresses_state_chk check (country <> 'Brasil' or state ~ '^[A-Z]{2}$'),
  constraint patient_addresses_address_purpose_chk check (
    address_purpose in ('atendimento', 'cobranca', 'entrega', 'outro')
  ),
  constraint patient_addresses_address_source_chk check (
    address_source in ('manual', 'brasilapi', 'outro')
  ),
  constraint patient_addresses_cep_lookup_source_chk check (
    cep_last_lookup_source is null or cep_last_lookup_source in ('brasilapi', 'manual')
  ),
  constraint patient_addresses_geocode_status_chk check (
    geocode_status is null or geocode_status in ('pending', 'success', 'failed', 'not_configured')
  ),
  constraint patient_addresses_geocode_provider_chk check (
    geocode_provider is null or geocode_provider in ('google', 'mapbox', 'osm', 'none')
  ),
  constraint patient_addresses_risk_status_chk check (
    risk_status is null or risk_status in ('success', 'failed', 'not_configured')
  ),
  constraint patient_addresses_risk_level_chk check (
    risk_level is null or risk_level in ('low', 'medium', 'high', 'unknown')
  )
);

create index patient_addresses_tenant_id_idx on public.patient_addresses (tenant_id);
create index patient_addresses_tenant_patient_idx on public.patient_addresses (tenant_id, patient_id);
create unique index patient_addresses_primary_uidx on public.patient_addresses (patient_id)
  where is_primary = true and deleted_at is null;

select app_private.set_updated_at_trigger('public.patient_addresses'::regclass);

alter table public.patient_addresses enable row level security;

create policy patient_addresses_select_tenant on public.patient_addresses
  for select
  using (tenant_id = app_private.current_tenant_id() and deleted_at is null);

create policy patient_addresses_insert_tenant on public.patient_addresses
  for insert
  with check (tenant_id = app_private.current_tenant_id());

create policy patient_addresses_update_tenant on public.patient_addresses
  for update
  using (tenant_id = app_private.current_tenant_id() and deleted_at is null)
  with check (tenant_id = app_private.current_tenant_id());

create policy patient_addresses_delete_tenant on public.patient_addresses
  for delete
  using (tenant_id = app_private.current_tenant_id() and deleted_at is null);

create table public.patient_address_logistics (
  address_id uuid primary key references public.patient_addresses(id) on delete cascade,
  tenant_id uuid not null default app_private.current_tenant_id(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid null,
  updated_by uuid null,
  deleted_at timestamptz null,
  allowed_visit_hours text null,
  travel_time_min integer null,
  distance_km numeric null,
  travel_notes text null,
  access_conditions text null,
  entry_procedure text null,
  gate_identification text null,
  parking text null,
  team_parking text null,
  ambulance_access text null,
  night_access_risk text null,
  area_risk_type text null,
  zone_type text null,
  street_access_type text null,
  external_stairs text null,
  elevator_status text null,
  wheelchair_access text null,
  has_24h_concierge boolean not null default false,
  concierge_contact text null,
  cell_signal_quality text null,
  property_type text null,
  condo_name text null,
  block_tower text null,
  floor_number integer null,
  unit_number text null,
  bed_type text null,
  mattress_type text null,
  adapted_bathroom boolean not null default false,
  electric_voltage text null,
  backup_power_source text null,
  backup_power_desc text null,
  water_source text null,
  has_wifi boolean not null default false,
  has_smokers boolean not null default false,
  animals_behavior text null,
  pets_description text null,
  ventilation text null,
  lighting_quality text null,
  noise_level text null,
  hygiene_conditions text null,
  equipment_space text null,
  power_outlets_desc text null,
  facade_image_url text null,
  general_observations text null,
  constraint patient_address_logistics_travel_time_chk check (travel_time_min is null or travel_time_min >= 0),
  constraint patient_address_logistics_distance_chk check (distance_km is null or distance_km >= 0),
  constraint patient_address_logistics_floor_chk check (floor_number is null or floor_number >= 0),
  constraint patient_address_logistics_ambulance_access_chk check (
    ambulance_access is null
    or ambulance_access in ('Total', 'Parcial', 'Dificil', 'Nao_acessa', 'Nao_informado')
  ),
  constraint patient_address_logistics_night_access_risk_chk check (
    night_access_risk is null
    or night_access_risk in ('Baixo', 'Medio', 'Alto', 'Nao_avaliado')
  ),
  constraint patient_address_logistics_area_risk_type_chk check (
    area_risk_type is null
    or area_risk_type in ('Urbana', 'Rural', 'Periurbana', 'Comunidade', 'Risco', 'Nao_informada')
  ),
  constraint patient_address_logistics_zone_type_chk check (
    zone_type is null
    or zone_type in ('Urbana', 'Rural', 'Periurbana', 'Comunidade', 'Risco', 'Nao_informada')
  ),
  constraint patient_address_logistics_street_access_type_chk check (
    street_access_type is null
    or street_access_type in ('Rua_larga', 'Rua_estreita', 'Rua_sem_saida', 'Viela', 'Nao_informado')
  ),
  constraint patient_address_logistics_elevator_status_chk check (
    elevator_status is null
    or elevator_status in ('Nao_tem', 'Tem_nao_comporta_maca', 'Tem_comporta_maca', 'Nao_informado')
  ),
  constraint patient_address_logistics_wheelchair_access_chk check (
    wheelchair_access is null
    or wheelchair_access in ('Livre', 'Com_restricao', 'Incompativel', 'Nao_avaliado')
  ),
  constraint patient_address_logistics_property_type_chk check (
    property_type is null
    or property_type in ('Casa', 'Apartamento', 'Chacara_Sitio', 'ILPI', 'Pensao', 'Comercial', 'Outro', 'Nao_informado')
  ),
  constraint patient_address_logistics_bed_type_chk check (
    bed_type is null
    or bed_type in ('Hospitalar', 'Articulada', 'Comum', 'Colchao_no_chao', 'Outro', 'Nao_informado')
  ),
  constraint patient_address_logistics_mattress_type_chk check (
    mattress_type is null
    or mattress_type in ('Pneumatico', 'Viscoelastico', 'Espuma_comum', 'Mola', 'Outro', 'Nao_informado')
  ),
  constraint patient_address_logistics_backup_power_source_chk check (
    backup_power_source is null
    or backup_power_source in ('Nenhuma', 'Gerador', 'Nobreak', 'Outros', 'Nao_informado')
  ),
  constraint patient_address_logistics_electric_voltage_chk check (
    electric_voltage is null
    or electric_voltage in ('110', '220', 'Bivolt', 'Nao_informada')
  ),
  constraint patient_address_logistics_animals_behavior_chk check (
    animals_behavior is null
    or animals_behavior in ('Doces', 'Bravos', 'Necessitam_contencao', 'Nao_informado')
  ),
  constraint patient_address_logistics_water_source_chk check (
    water_source is null
    or water_source in ('Rede_publica', 'Poco_artesiano', 'Cisterna', 'Outro', 'Nao_informado')
  ),
  constraint patient_address_logistics_equipment_space_chk check (
    equipment_space is null
    or equipment_space in ('Adequado', 'Restrito', 'Critico', 'Nao_avaliado')
  ),
  constraint patient_address_logistics_cell_signal_quality_chk check (
    cell_signal_quality is null
    or cell_signal_quality in ('Bom', 'Razoavel', 'Ruim', 'Nao_informado')
  )
);

create index patient_address_logistics_tenant_address_idx on public.patient_address_logistics (tenant_id, address_id);

select app_private.set_updated_at_trigger('public.patient_address_logistics'::regclass);

alter table public.patient_address_logistics enable row level security;

create policy patient_address_logistics_select_tenant on public.patient_address_logistics
  for select
  using (
    tenant_id = app_private.current_tenant_id()
    and deleted_at is null
    and exists (
      select 1
      from public.patient_addresses pa
      where pa.id = patient_address_logistics.address_id
        and pa.tenant_id = app_private.current_tenant_id()
        and pa.deleted_at is null
    )
  );

create policy patient_address_logistics_insert_tenant on public.patient_address_logistics
  for insert
  with check (
    tenant_id = app_private.current_tenant_id()
    and exists (
      select 1
      from public.patient_addresses pa
      where pa.id = patient_address_logistics.address_id
        and pa.tenant_id = app_private.current_tenant_id()
        and pa.deleted_at is null
    )
  );

create policy patient_address_logistics_update_tenant on public.patient_address_logistics
  for update
  using (
    tenant_id = app_private.current_tenant_id()
    and deleted_at is null
    and exists (
      select 1
      from public.patient_addresses pa
      where pa.id = patient_address_logistics.address_id
        and pa.tenant_id = app_private.current_tenant_id()
        and pa.deleted_at is null
    )
  )
  with check (tenant_id = app_private.current_tenant_id());

create policy patient_address_logistics_delete_tenant on public.patient_address_logistics
  for delete
  using (
    tenant_id = app_private.current_tenant_id()
    and deleted_at is null
    and exists (
      select 1
      from public.patient_addresses pa
      where pa.id = patient_address_logistics.address_id
        and pa.tenant_id = app_private.current_tenant_id()
        and pa.deleted_at is null
    )
  );
