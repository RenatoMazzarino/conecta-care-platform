# ABA02 — Legacy Field List (patient_addresses + patient_domiciles)

Fonte: `docs/repo_antigo/schema_current.sql`

## Legend

- Categoria: endereco | logistica | estrutura | auditoria | outro

## public.patient_addresses

| Coluna | Tipo (legado) | Categoria | Observacao |
| --- | --- | --- | --- |
| `patient_id` | `"uuid"` | outro | FK para paciente |
| `street` | `"text"` | endereco |  |
| `number` | `"text"` | endereco |  |
| `neighborhood` | `"text"` | endereco |  |
| `city` | `"text"` | endereco |  |
| `state` | `"text"` | endereco |  |
| `zip_code` | `"text"` | endereco |  |
| `complement` | `"text"` | endereco |  |
| `reference_point` | `"text"` | endereco |  |
| `zone_type` | `"text"` | logistica |  |
| `facade_image_url` | `"text"` | logistica |  |
| `allowed_visit_hours` | `"text"` | logistica |  |
| `travel_notes` | `"text"` | logistica |  |
| `eta_minutes` | `integer` | logistica |  |
| `property_type` | `"text"` | estrutura |  |
| `condo_name` | `"text"` | estrutura |  |
| `block_tower` | `"text"` | estrutura |  |
| `floor_number` | `integer` | estrutura |  |
| `unit_number` | `"text"` | estrutura |  |
| `elevator_status` | `"text"` | logistica |  |
| `wheelchair_access` | `"text"` | logistica |  |
| `street_access_type` | `"text"` | logistica |  |
| `external_stairs` | `"text"` | logistica |  |
| `has_24h_concierge` | `boolean` | logistica |  |
| `concierge_contact` | `"text"` | logistica |  |
| `area_risk_type` | `"text"` | logistica |  |
| `cell_signal_quality` | `"text"` | logistica |  |
| `power_outlets_desc` | `"text"` | logistica |  |
| `equipment_space` | `"text"` | logistica |  |
| `geo_latitude` | `numeric` | endereco | geolocalizacao |
| `geo_longitude` | `numeric` | endereco | geolocalizacao |
| `ambulance_access` | `"text"` | logistica |  |
| `parking` | `"text"` | logistica |  |
| `entry_procedure` | `"text"` | logistica |  |
| `night_access_risk` | `"text"` | logistica |  |
| `has_wifi` | `boolean` | estrutura |  |
| `has_smokers` | `boolean` | estrutura |  |
| `animal_behavior` | `"text"` | estrutura |  |
| `bed_type` | `"text"` | estrutura |  |
| `mattress_type` | `"text"` | estrutura |  |
| `electric_infra` | `"text"` | estrutura |  |
| `backup_power` | `"text"` | estrutura |  |
| `water_source` | `"text"` | estrutura |  |
| `adapted_bathroom` | `boolean` | estrutura |  |
| `pets_description` | `"text"` | estrutura |  |
| `backup_power_desc` | `"text"` | logistica |  |
| `general_observations` | `"text"` | estrutura |  |

## public.patient_domiciles

| Coluna | Tipo (legado) | Categoria | Observacao |
| --- | --- | --- | --- |
| `patient_id` | `"uuid"` | outro | FK para paciente |
| `ambulance_access` | `"text"` | logistica |  |
| `team_parking` | `"text"` | logistica |  |
| `night_access_risk` | `"text"` | logistica |  |
| `gate_identification` | `"text"` | logistica |  |
| `entry_procedure` | `"text"` | logistica |  |
| `ventilation` | `"text"` | estrutura |  |
| `lighting_quality` | `"text"` | estrutura |  |
| `noise_level` | `"text"` | estrutura |  |
| `bed_type` | `"text"` | estrutura |  |
| `mattress_type` | `"text"` | estrutura |  |
| `voltage` | `"text"` | estrutura |  |
| `backup_power_source` | `"text"` | estrutura |  |
| `has_wifi` | `boolean` | estrutura |  |
| `water_source` | `"text"` | estrutura |  |
| `has_smokers` | `boolean` | estrutura |  |
| `hygiene_conditions` | `"text"` | estrutura |  |
| `pets_description` | `"text"` | estrutura |  |
| `animals_behavior` | `"text"` | estrutura |  |
| `general_observations` | `"text"` | estrutura |  |
| `created_at` | `timestamp with time zone` | auditoria |  |
| `updated_at` | `timestamp with time zone` | auditoria |  |

