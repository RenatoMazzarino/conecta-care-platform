# ABA02 — Legacy Field List (legacy.patient_addresses + legacy.patient_domiciles)

Fonte: `docs/repo_antigo/schema_current.sql`

## Legend

- Categoria: endereco | logistica | estrutura | auditoria | outro
- Duplicado: quando o mesmo conceito aparece na outra tabela

## legacy.patient_addresses

|Coluna (legacy.*)|Tipo (legado)|Categoria|Duplicado|Observacao|
|---|---|---|---|---|
|`legacy.patient_addresses.patient_id`|`uuid`|outro|Sim|Tambem em `legacy.patient_domiciles.patient_id`.|
|`legacy.patient_addresses.street`|`text`|endereco|Nao||
|`legacy.patient_addresses.number`|`text`|endereco|Nao||
|`legacy.patient_addresses.neighborhood`|`text`|endereco|Nao||
|`legacy.patient_addresses.city`|`text`|endereco|Nao||
|`legacy.patient_addresses.state`|`text`|endereco|Nao||
|`legacy.patient_addresses.zip_code`|`text`|endereco|Nao||
|`legacy.patient_addresses.complement`|`text`|endereco|Nao||
|`legacy.patient_addresses.reference_point`|`text`|endereco|Nao||
|`legacy.patient_addresses.zone_type`|`text`|logistica|Nao||
|`legacy.patient_addresses.facade_image_url`|`text`|estrutura|Nao||
|`legacy.patient_addresses.allowed_visit_hours`|`text`|logistica|Nao||
|`legacy.patient_addresses.travel_notes`|`text`|logistica|Nao||
|`legacy.patient_addresses.eta_minutes`|`integer`|logistica|Nao||
|`legacy.patient_addresses.property_type`|`text`|estrutura|Nao||
|`legacy.patient_addresses.condo_name`|`text`|estrutura|Nao||
|`legacy.patient_addresses.block_tower`|`text`|estrutura|Nao||
|`legacy.patient_addresses.floor_number`|`integer`|estrutura|Nao||
|`legacy.patient_addresses.unit_number`|`text`|estrutura|Nao||
|`legacy.patient_addresses.elevator_status`|`text`|logistica|Nao||
|`legacy.patient_addresses.wheelchair_access`|`text`|logistica|Nao||
|`legacy.patient_addresses.street_access_type`|`text`|logistica|Nao||
|`legacy.patient_addresses.external_stairs`|`text`|logistica|Nao||
|`legacy.patient_addresses.has_24h_concierge`|`boolean`|logistica|Nao||
|`legacy.patient_addresses.concierge_contact`|`text`|logistica|Nao||
|`legacy.patient_addresses.area_risk_type`|`text`|logistica|Nao||
|`legacy.patient_addresses.cell_signal_quality`|`text`|logistica|Nao||
|`legacy.patient_addresses.power_outlets_desc`|`text`|estrutura|Nao||
|`legacy.patient_addresses.equipment_space`|`text`|estrutura|Nao||
|`legacy.patient_addresses.geo_latitude`|`numeric`|endereco|Nao|Geolocalizacao.|
|`legacy.patient_addresses.geo_longitude`|`numeric`|endereco|Nao|Geolocalizacao.|
|`legacy.patient_addresses.ambulance_access`|`text`|logistica|Sim|Duplicado com `legacy.patient_domiciles.ambulance_access`.|
|`legacy.patient_addresses.parking`|`text`|logistica|Nao||
|`legacy.patient_addresses.entry_procedure`|`text`|logistica|Sim|Duplicado com `legacy.patient_domiciles.entry_procedure`.|
|`legacy.patient_addresses.night_access_risk`|`text`|logistica|Sim|Duplicado com `legacy.patient_domiciles.night_access_risk`.|
|`legacy.patient_addresses.has_wifi`|`boolean`|estrutura|Sim|Duplicado com `legacy.patient_domiciles.has_wifi`.|
|`legacy.patient_addresses.has_smokers`|`boolean`|estrutura|Sim|Duplicado com `legacy.patient_domiciles.has_smokers`.|
|`legacy.patient_addresses.animal_behavior`|`text`|estrutura|Sim|Duplicado com `legacy.patient_domiciles.animals_behavior` (nome diferente).|
|`legacy.patient_addresses.bed_type`|`text`|estrutura|Sim|Duplicado com `legacy.patient_domiciles.bed_type`.|
|`legacy.patient_addresses.mattress_type`|`text`|estrutura|Sim|Duplicado com `legacy.patient_domiciles.mattress_type`.|
|`legacy.patient_addresses.electric_infra`|`text`|estrutura|Nao||
|`legacy.patient_addresses.backup_power`|`text`|estrutura|Nao||
|`legacy.patient_addresses.water_source`|`text`|estrutura|Sim|Duplicado com `legacy.patient_domiciles.water_source`.|
|`legacy.patient_addresses.adapted_bathroom`|`boolean`|estrutura|Nao||
|`legacy.patient_addresses.pets_description`|`text`|estrutura|Sim|Duplicado com `legacy.patient_domiciles.pets_description`.|
|`legacy.patient_addresses.backup_power_desc`|`text`|estrutura|Nao||
|`legacy.patient_addresses.general_observations`|`text`|estrutura|Sim|Duplicado com `legacy.patient_domiciles.general_observations`.|

## legacy.patient_domiciles

|Coluna (legacy.*)|Tipo (legado)|Categoria|Duplicado|Observacao|
|---|---|---|---|---|
|`legacy.patient_domiciles.patient_id`|`uuid`|outro|Sim|Tambem em `legacy.patient_addresses.patient_id`.|
|`legacy.patient_domiciles.ambulance_access`|`text`|logistica|Sim|Duplicado com `legacy.patient_addresses.ambulance_access`.|
|`legacy.patient_domiciles.team_parking`|`text`|logistica|Nao||
|`legacy.patient_domiciles.night_access_risk`|`text`|logistica|Sim|Duplicado com `legacy.patient_addresses.night_access_risk`.|
|`legacy.patient_domiciles.gate_identification`|`text`|logistica|Nao||
|`legacy.patient_domiciles.entry_procedure`|`text`|logistica|Sim|Duplicado com `legacy.patient_addresses.entry_procedure`.|
|`legacy.patient_domiciles.ventilation`|`text`|estrutura|Nao||
|`legacy.patient_domiciles.lighting_quality`|`text`|estrutura|Nao||
|`legacy.patient_domiciles.noise_level`|`text`|estrutura|Nao||
|`legacy.patient_domiciles.bed_type`|`text`|estrutura|Sim|Duplicado com `legacy.patient_addresses.bed_type`.|
|`legacy.patient_domiciles.mattress_type`|`text`|estrutura|Sim|Duplicado com `legacy.patient_addresses.mattress_type`.|
|`legacy.patient_domiciles.voltage`|`text`|estrutura|Nao||
|`legacy.patient_domiciles.backup_power_source`|`text`|estrutura|Nao||
|`legacy.patient_domiciles.has_wifi`|`boolean`|estrutura|Sim|Duplicado com `legacy.patient_addresses.has_wifi`.|
|`legacy.patient_domiciles.water_source`|`text`|estrutura|Sim|Duplicado com `legacy.patient_addresses.water_source`.|
|`legacy.patient_domiciles.has_smokers`|`boolean`|estrutura|Sim|Duplicado com `legacy.patient_addresses.has_smokers`.|
|`legacy.patient_domiciles.hygiene_conditions`|`text`|estrutura|Nao||
|`legacy.patient_domiciles.pets_description`|`text`|estrutura|Sim|Duplicado com `legacy.patient_addresses.pets_description`.|
|`legacy.patient_domiciles.animals_behavior`|`text`|estrutura|Sim|Duplicado com `legacy.patient_addresses.animal_behavior` (nome diferente).|
|`legacy.patient_domiciles.general_observations`|`text`|estrutura|Sim|Duplicado com `legacy.patient_addresses.general_observations`.|
|`legacy.patient_domiciles.created_at`|`timestamptz`|auditoria|Nao||
|`legacy.patient_domiciles.updated_at`|`timestamptz`|auditoria|Nao||
