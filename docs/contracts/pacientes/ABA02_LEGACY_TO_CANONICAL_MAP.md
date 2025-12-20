# ABA02 — Legacy -> Canonical Map (100%)

Fonte principal: `db/snapshots_legado/conectacare-2025-11-29.sql` (schema).
Referencia secundaria: `docs/repo_antigo/schema_current.sql`.

## Regras gerais

- Prefixos: legado como `legacy.*`, canonico como `public.*`.
- Canonico se divide em:
  - `public.patient_addresses` (localizacao + identificacao do endereco)
  - `public.patient_address_logistics` (acesso + estrutura da residencia)
- Campos canonicos que **nao existem no legado** (ex.: `address_label`, `address_purpose`, `is_primary`, `address_source`, `country`, `tenant_id`, `created_by`, `updated_by`, `deleted_at`) devem ser preenchidos por default/app na fase de migracao.

## Precedencia para duplicados

Quando o mesmo conceito existir nas duas tabelas legadas:

1) Preferir `legacy.patient_domiciles.*` quando **nao nulo**.
2) Fallback para `legacy.patient_addresses.*` quando o valor em domiciles estiver nulo/ausente.
3) Registrar em audit trail quando ocorrer override (se aplicavel).

Duplicados abrangidos por esta regra:

- `ambulance_access`
- `night_access_risk`
- `entry_procedure`
- `bed_type`
- `mattress_type`
- `has_wifi`
- `water_source`
- `has_smokers`
- `pets_description`
- `general_observations`
- `animal_behavior` (legacy) + `animals_behavior` (legacy)

## Tabela de mapeamento (100%)

|Origem (legacy.*)|Destino canonico (public.*)|Conversao/normalizacao|Precedencia|
|---|---|---|---|
|`legacy.patient_addresses.patient_id`|`public.patient_addresses.patient_id`|FK para paciente.|—|
|`legacy.patient_addresses.street`|`public.patient_addresses.street`|Trim.|—|
|`legacy.patient_addresses.number`|`public.patient_addresses.number`|Trim.|—|
|`legacy.patient_addresses.neighborhood`|`public.patient_addresses.neighborhood`|Trim.|—|
|`legacy.patient_addresses.city`|`public.patient_addresses.city`|Trim.|—|
|`legacy.patient_addresses.state`|`public.patient_addresses.state`|Uppercase; regex UF.|—|
|`legacy.patient_addresses.zip_code`|`public.patient_addresses.postal_code`|Digitos apenas (8).|—|
|`legacy.patient_addresses.complement`|`public.patient_addresses.complement`|Trim.|—|
|`legacy.patient_addresses.reference_point`|`public.patient_addresses.reference_point`|Trim.|—|
|`legacy.patient_addresses.geo_latitude`|`public.patient_addresses.latitude`|Numeric.|—|
|`legacy.patient_addresses.geo_longitude`|`public.patient_addresses.longitude`|Numeric.|—|
|`legacy.patient_addresses.zone_type`|`public.patient_address_logistics.zone_type`|Normalizar: `Urbana`, `Rural`, `Periurbana`, `Comunidade`, `Risco`, `Nao_informada`.|—|
|`legacy.patient_addresses.facade_image_url`|`public.patient_address_logistics.facade_image_url`|Trim.|—|
|`legacy.patient_addresses.allowed_visit_hours`|`public.patient_address_logistics.allowed_visit_hours`|Trim.|—|
|`legacy.patient_addresses.travel_notes`|`public.patient_address_logistics.travel_notes`|Trim.|—|
|`legacy.patient_addresses.eta_minutes`|`public.patient_address_logistics.travel_time_min`|Integer >= 0.|—|
|`legacy.patient_addresses.property_type`|`public.patient_address_logistics.property_type`|Normalizar enum (ver contrato).|—|
|`legacy.patient_addresses.condo_name`|`public.patient_address_logistics.condo_name`|Trim.|—|
|`legacy.patient_addresses.block_tower`|`public.patient_address_logistics.block_tower`|Trim.|—|
|`legacy.patient_addresses.floor_number`|`public.patient_address_logistics.floor_number`|Integer >= 0.|—|
|`legacy.patient_addresses.unit_number`|`public.patient_address_logistics.unit_number`|Trim.|—|
|`legacy.patient_addresses.elevator_status`|`public.patient_address_logistics.elevator_status`|Normalizar enum.|—|
|`legacy.patient_addresses.wheelchair_access`|`public.patient_address_logistics.wheelchair_access`|Normalizar enum.|—|
|`legacy.patient_addresses.street_access_type`|`public.patient_address_logistics.street_access_type`|Normalizar enum.|—|
|`legacy.patient_addresses.external_stairs`|`public.patient_address_logistics.external_stairs`|Trim.|—|
|`legacy.patient_addresses.has_24h_concierge`|`public.patient_address_logistics.has_24h_concierge`|Boolean.|—|
|`legacy.patient_addresses.concierge_contact`|`public.patient_address_logistics.concierge_contact`|Trim.|—|
|`legacy.patient_addresses.area_risk_type`|`public.patient_address_logistics.area_risk_type`|Normalizar enum.|—|
|`legacy.patient_addresses.cell_signal_quality`|`public.patient_address_logistics.cell_signal_quality`|Normalizar enum.|—|
|`legacy.patient_addresses.power_outlets_desc`|`public.patient_address_logistics.power_outlets_desc`|Trim.|—|
|`legacy.patient_addresses.equipment_space`|`public.patient_address_logistics.equipment_space`|Normalizar enum.|—|
|`legacy.patient_addresses.ambulance_access`|`public.patient_address_logistics.ambulance_access`|Normalizar enum.|Preferir `legacy.patient_domiciles.ambulance_access` quando existir.|
|`legacy.patient_addresses.parking`|`public.patient_address_logistics.parking`|Trim.|—|
|`legacy.patient_addresses.entry_procedure`|`public.patient_address_logistics.entry_procedure`|Trim.|Preferir `legacy.patient_domiciles.entry_procedure` quando existir.|
|`legacy.patient_addresses.night_access_risk`|`public.patient_address_logistics.night_access_risk`|Normalizar enum.|Preferir `legacy.patient_domiciles.night_access_risk` quando existir.|
|`legacy.patient_addresses.has_wifi`|`public.patient_address_logistics.has_wifi`|Boolean.|Preferir `legacy.patient_domiciles.has_wifi` quando existir.|
|`legacy.patient_addresses.has_smokers`|`public.patient_address_logistics.has_smokers`|Boolean.|Preferir `legacy.patient_domiciles.has_smokers` quando existir.|
|`legacy.patient_addresses.animal_behavior`|`public.patient_address_logistics.animals_behavior`|Normalizar enum; unificar com `animals_behavior`.|Preferir `legacy.patient_domiciles.animals_behavior` quando existir.|
|`legacy.patient_addresses.bed_type`|`public.patient_address_logistics.bed_type`|Normalizar enum.|Preferir `legacy.patient_domiciles.bed_type` quando existir.|
|`legacy.patient_addresses.mattress_type`|`public.patient_address_logistics.mattress_type`|Normalizar enum.|Preferir `legacy.patient_domiciles.mattress_type` quando existir.|
|`legacy.patient_addresses.electric_infra`|`public.patient_address_logistics.electric_voltage`|Normalizar enum.|Preferir `legacy.patient_domiciles.voltage` quando existir.|
|`legacy.patient_addresses.backup_power`|`public.patient_address_logistics.backup_power_source`|Normalizar enum.|Preferir `legacy.patient_domiciles.backup_power_source` quando existir.|
|`legacy.patient_addresses.water_source`|`public.patient_address_logistics.water_source`|Normalizar enum.|Preferir `legacy.patient_domiciles.water_source` quando existir.|
|`legacy.patient_addresses.adapted_bathroom`|`public.patient_address_logistics.adapted_bathroom`|Boolean.|—|
|`legacy.patient_addresses.pets_description`|`public.patient_address_logistics.pets_description`|Trim.|Preferir `legacy.patient_domiciles.pets_description` quando existir.|
|`legacy.patient_addresses.backup_power_desc`|`public.patient_address_logistics.backup_power_desc`|Trim.|—|
|`legacy.patient_addresses.general_observations`|`public.patient_address_logistics.general_observations`|Trim.|Preferir `legacy.patient_domiciles.general_observations` quando existir.|
|`legacy.patient_domiciles.patient_id`|`public.patient_address_logistics.address_id`|Criar/usar endereco primario e vincular `address_id`.|—|
|`legacy.patient_domiciles.ambulance_access`|`public.patient_address_logistics.ambulance_access`|Normalizar enum.|Preferencia 1 (domiciles).|
|`legacy.patient_domiciles.team_parking`|`public.patient_address_logistics.team_parking`|Trim; **nao** colapsar em `parking`.|—|
|`legacy.patient_domiciles.night_access_risk`|`public.patient_address_logistics.night_access_risk`|Normalizar enum.|Preferencia 1 (domiciles).|
|`legacy.patient_domiciles.gate_identification`|`public.patient_address_logistics.gate_identification`|Trim.|—|
|`legacy.patient_domiciles.entry_procedure`|`public.patient_address_logistics.entry_procedure`|Trim.|Preferencia 1 (domiciles).|
|`legacy.patient_domiciles.ventilation`|`public.patient_address_logistics.ventilation`|Trim.|—|
|`legacy.patient_domiciles.lighting_quality`|`public.patient_address_logistics.lighting_quality`|Trim.|—|
|`legacy.patient_domiciles.noise_level`|`public.patient_address_logistics.noise_level`|Trim.|—|
|`legacy.patient_domiciles.bed_type`|`public.patient_address_logistics.bed_type`|Normalizar enum.|Preferencia 1 (domiciles).|
|`legacy.patient_domiciles.mattress_type`|`public.patient_address_logistics.mattress_type`|Normalizar enum.|Preferencia 1 (domiciles).|
|`legacy.patient_domiciles.voltage`|`public.patient_address_logistics.electric_voltage`|Normalizar enum.|Preferencia 1 (domiciles).|
|`legacy.patient_domiciles.backup_power_source`|`public.patient_address_logistics.backup_power_source`|Normalizar enum.|Preferencia 1 (domiciles).|
|`legacy.patient_domiciles.has_wifi`|`public.patient_address_logistics.has_wifi`|Boolean.|Preferencia 1 (domiciles).|
|`legacy.patient_domiciles.water_source`|`public.patient_address_logistics.water_source`|Normalizar enum.|Preferencia 1 (domiciles).|
|`legacy.patient_domiciles.has_smokers`|`public.patient_address_logistics.has_smokers`|Boolean.|Preferencia 1 (domiciles).|
|`legacy.patient_domiciles.hygiene_conditions`|`public.patient_address_logistics.hygiene_conditions`|Trim.|—|
|`legacy.patient_domiciles.pets_description`|`public.patient_address_logistics.pets_description`|Trim.|Preferencia 1 (domiciles).|
|`legacy.patient_domiciles.animals_behavior`|`public.patient_address_logistics.animals_behavior`|Normalizar enum; unificar com `animal_behavior`.|Preferencia 1 (domiciles).|
|`legacy.patient_domiciles.general_observations`|`public.patient_address_logistics.general_observations`|Trim.|Preferencia 1 (domiciles).|
|`legacy.patient_domiciles.created_at`|`public.patient_address_logistics.created_at`|Backfill quando existir.|—|
|`legacy.patient_domiciles.updated_at`|`public.patient_address_logistics.updated_at`|Backfill quando existir.|—|
