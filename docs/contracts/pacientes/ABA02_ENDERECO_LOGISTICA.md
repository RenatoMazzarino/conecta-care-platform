# Contrato da Aba: Endereco & Logistica

## 0) Metadados

- Modulo: Pacientes
- Aba: ABA02 — Endereco & Logistica
- Versao: 0.1
- Status: Em revisao
- Ultima atualizacao: 2025-12-20
- Referencias:
  - `AGENT.md`
  - `docs/contracts/_templates/CONTRACT_TEMPLATE.md`
  - `docs/contracts/pacientes/ABA01_DADOS_PESSOAIS.md`
  - `docs/repo_antigo/schema_current.sql`
  - `html/modelo_final_aparencia_pagina_do_paciente.htm`
  - `src/app/pacientes/[id]/PatientPageClient.tsx`
  - `src/components/patient/EnderecoLogisticaTab.tsx`

## 1) Objetivo da Aba

- Registrar e manter **enderecos multiplos** do paciente com um endereco primario.
- Capturar informacoes de **logistica/acesso** e **estrutura da residencia** para planejamento de atendimento e cobertura.

Perfis tipicos:

- atendimento/recepcao (cadastro)
- enfermagem/operacoes (consulta e logistica)
- administrativo (correcoes)

## 2) Estrutura de UI (Cards e Campos)

Cards/secoes propostas:

1. **Endereco (Localizacao)**
   - Campos basicos do endereco + identificacao (label/purpose) + CEP.

1. **Geolocalizacao (Mapa)**
   - Latitude/longitude e status de geocoding (quando houver).

1. **Logistica & Acesso**
   - Acesso ao local, estacionamento, portaria, riscos e horario de visita.

1. **Estrutura da Residencia**
   - Condicoes do domicilio (cama, energia, agua, higiene, fumantes, etc.).

Tabela padrao por campo (obrigatoria):

| Card | Campo (label UI) | Nome tecnico (schema.table.column) | Tipo PG | Tipo TS | Obrigatorio | Default | Validacoes | Mascara | Descricao curta |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Endereco | Identificador do endereco | `public.patient_addresses.address_label` | `text` | `string` | Sim | — | trim; max 120 | — | Ex.: Casa, Residencia, Atendimento. |
| Endereco | Finalidade | `public.patient_addresses.address_purpose` | `text` | `string` | Sim | — | ver Secao 6 (address_purpose) | select | Tipo/finalidade do endereco. |
| Endereco | Endereco primario | `public.patient_addresses.is_primary` | `boolean` | `boolean` | Sim | `false` | regra de unicidade por paciente (ativos) | toggle | Apenas um primario entre enderecos ativos. |
| Endereco | CEP | `public.patient_addresses.postal_code` | `text` | `string` | Sim | — | apenas digitos (8) | `00000-000` | CEP normalizado (sem hifen). |
| Endereco | Logradouro | `public.patient_addresses.street` | `text` | `string` | Sim | — | trim; max 200 | — | Rua/Avenida. |
| Endereco | Numero | `public.patient_addresses.number` | `text` | `string` | Sim | — | trim; max 20 | — | Numero do imovel. |
| Endereco | Complemento | `public.patient_addresses.complement` | `text` | `string \| null` | Nao | `NULL` | trim; max 120 | — | Complemento. |
| Endereco | Bairro | `public.patient_addresses.neighborhood` | `text` | `string` | Sim | — | trim; max 120 | — | Bairro. |
| Endereco | Cidade | `public.patient_addresses.city` | `text` | `string` | Sim | — | trim; max 120 | — | Cidade. |
| Endereco | UF | `public.patient_addresses.state` | `text` | `string` | Sim | — | ver Secao 6 (UF) | `UF` | Sigla do estado. |
| Endereco | Pais | `public.patient_addresses.country` | `text` | `string` | Sim | `Brasil` | trim; max 80 | — | Pais do endereco. |
| Endereco | Ponto de referencia | `public.patient_addresses.reference_point` | `text` | `string \| null` | Nao | `NULL` | trim; max 200 | — | Referencia de localizacao. |
| Endereco | Origem do CEP | `public.patient_addresses.address_source` | `text` | `string \| null` | Nao | `NULL` | ver Secao 6 (address_source) | — | Manual/BrasilAPI/Outro. |
| Geolocalizacao | Latitude | `public.patient_addresses.latitude` | `numeric` | `number \| null` | Nao | `NULL` | range valido (-90..90) | — | Latitude do endereco. |
| Geolocalizacao | Longitude | `public.patient_addresses.longitude` | `numeric` | `number \| null` | Nao | `NULL` | range valido (-180..180) | — | Longitude do endereco. |
| Logistica & Acesso | Horario permitido de visita | `public.patient_address_logistics.allowed_visit_hours` | `text` | `string \| null` | Nao | `NULL` | trim; max 120 | — | Ex.: 08:00-18:00. |
| Logistica & Acesso | Tempo estimado (min) | `public.patient_address_logistics.travel_time_min` | `integer` | `number \| null` | Nao | `NULL` | >= 0 | — | ETA em minutos (opcional/derivado). |
| Logistica & Acesso | Distancia (km) | `public.patient_address_logistics.distance_km` | `numeric` | `number \| null` | Nao | `NULL` | >= 0 | — | Distancia estimada (opcional/derivado). |
| Logistica & Acesso | Notas de deslocamento | `public.patient_address_logistics.travel_notes` | `text` | `string \| null` | Nao | `NULL` | trim; max 500 | — | Observacoes de deslocamento. |
| Logistica & Acesso | Condicoes de acesso | `public.patient_address_logistics.access_conditions` | `text` | `string \| null` | Nao | `NULL` | trim; max 200 | — | Acesso geral ao local. |
| Logistica & Acesso | Procedimento de entrada | `public.patient_address_logistics.entry_procedure` | `text` | `string \| null` | Nao | `NULL` | trim; max 200 | — | Ex.: ligar na portaria. |
| Logistica & Acesso | Identificacao no portao | `public.patient_address_logistics.gate_identification` | `text` | `string \| null` | Nao | `NULL` | trim; max 120 | — | Ex.: interfone, senha. |
| Logistica & Acesso | Estacionamento | `public.patient_address_logistics.parking` | `text` | `string \| null` | Nao | `NULL` | trim; max 120 | — | Vaga, rua, estacionamento. |
| Logistica & Acesso | Acesso de ambulancia | `public.patient_address_logistics.ambulance_access` | `text` | `string \| null` | Nao | `NULL` | ver Secao 6 (ambulance_access) | select | Facilidade de acesso. |
| Logistica & Acesso | Risco de acesso noturno | `public.patient_address_logistics.night_access_risk` | `text` | `string \| null` | Nao | `NULL` | ver Secao 6 (night_access_risk) | select | Risco no periodo noturno. |
| Logistica & Acesso | Tipo de area de risco | `public.patient_address_logistics.area_risk_type` | `text` | `string \| null` | Nao | `NULL` | ver Secao 6 (area_risk_type) | select | Ex.: urbana, rural, risco. |
| Logistica & Acesso | Tipo de rua | `public.patient_address_logistics.street_access_type` | `text` | `string \| null` | Nao | `NULL` | ver Secao 6 (street_access_type) | select | Rua larga/estreita etc. |
| Logistica & Acesso | Escadas externas | `public.patient_address_logistics.external_stairs` | `text` | `string \| null` | Nao | `NULL` | trim; max 120 | — | Ex.: 2 lances. |
| Logistica & Acesso | Elevador | `public.patient_address_logistics.elevator_status` | `text` | `string \| null` | Nao | `NULL` | ver Secao 6 (elevator_status) | select | Status do elevador. |
| Logistica & Acesso | Acesso cadeirante | `public.patient_address_logistics.wheelchair_access` | `text` | `string \| null` | Nao | `NULL` | ver Secao 6 (wheelchair_access) | select | Condicao de acesso. |
| Logistica & Acesso | Portaria 24h | `public.patient_address_logistics.has_24h_concierge` | `boolean` | `boolean` | Nao | `false` | — | toggle | Indica portaria 24h. |
| Logistica & Acesso | Contato portaria | `public.patient_address_logistics.concierge_contact` | `text` | `string \| null` | Nao | `NULL` | trim; max 120 | — | Telefone/ramal. |
| Estrutura | Tipo de imovel | `public.patient_address_logistics.property_type` | `text` | `string \| null` | Nao | `NULL` | ver Secao 6 (property_type) | select | Casa, apto, ILPI etc. |
| Estrutura | Nome do condominio | `public.patient_address_logistics.condo_name` | `text` | `string \| null` | Nao | `NULL` | trim; max 120 | — | Nome do condominio. |
| Estrutura | Bloco/Torre | `public.patient_address_logistics.block_tower` | `text` | `string \| null` | Nao | `NULL` | trim; max 60 | — | Bloco/torre. |
| Estrutura | Andar | `public.patient_address_logistics.floor_number` | `integer` | `number \| null` | Nao | `NULL` | >= 0 | — | Andar do imovel. |
| Estrutura | Unidade | `public.patient_address_logistics.unit_number` | `text` | `string \| null` | Nao | `NULL` | trim; max 40 | — | Apartamento/casa. |
| Estrutura | Tipo de cama | `public.patient_address_logistics.bed_type` | `text` | `string \| null` | Nao | `NULL` | ver Secao 6 (bed_type) | select | Tipo de cama. |
| Estrutura | Tipo de colchao | `public.patient_address_logistics.mattress_type` | `text` | `string \| null` | Nao | `NULL` | ver Secao 6 (mattress_type) | select | Tipo de colchao. |
| Estrutura | Banheiro adaptado | `public.patient_address_logistics.adapted_bathroom` | `boolean` | `boolean` | Nao | `false` | — | toggle | Indica adaptacao. |
| Estrutura | Tensao eletrica | `public.patient_address_logistics.electric_voltage` | `text` | `string \| null` | Nao | `NULL` | ver Secao 6 (electric_voltage) | select | 110/220/bivolt. |
| Estrutura | Fonte de energia reserva | `public.patient_address_logistics.backup_power_source` | `text` | `string \| null` | Nao | `NULL` | ver Secao 6 (backup_power_source) | select | Gerador/nobreak etc. |
| Estrutura | Descricao energia reserva | `public.patient_address_logistics.backup_power_desc` | `text` | `string \| null` | Nao | `NULL` | trim; max 200 | — | Detalhes adicionais. |
| Estrutura | Fonte de agua | `public.patient_address_logistics.water_source` | `text` | `string \| null` | Nao | `NULL` | ver Secao 6 (water_source) | select | Rede publica/poco etc. |
| Estrutura | Possui wifi | `public.patient_address_logistics.has_wifi` | `boolean` | `boolean` | Nao | `false` | — | toggle | Disponibilidade de wifi. |
| Estrutura | Possui fumantes | `public.patient_address_logistics.has_smokers` | `boolean` | `boolean` | Nao | `false` | — | toggle | Indica fumantes no local. |
| Estrutura | Comportamento dos animais | `public.patient_address_logistics.animals_behavior` | `text` | `string \| null` | Nao | `NULL` | ver Secao 6 (animals_behavior) | select | Doces, bravos etc. |
| Estrutura | Descricao de pets | `public.patient_address_logistics.pets_description` | `text` | `string \| null` | Nao | `NULL` | trim; max 200 | — | Detalhes sobre pets. |
| Estrutura | Ventilacao | `public.patient_address_logistics.ventilation` | `text` | `string \| null` | Nao | `NULL` | trim; max 120 | — | Condicao de ventilacao. |
| Estrutura | Iluminacao | `public.patient_address_logistics.lighting_quality` | `text` | `string \| null` | Nao | `NULL` | trim; max 120 | — | Qualidade da iluminacao. |
| Estrutura | Nivel de ruido | `public.patient_address_logistics.noise_level` | `text` | `string \| null` | Nao | `NULL` | trim; max 120 | — | Nivel de ruido. |
| Estrutura | Condicoes de higiene | `public.patient_address_logistics.hygiene_conditions` | `text` | `string \| null` | Nao | `NULL` | trim; max 120 | — | Condicoes gerais. |
| Estrutura | Espaco para equipamentos | `public.patient_address_logistics.equipment_space` | `text` | `string \| null` | Nao | `NULL` | ver Secao 6 (equipment_space) | select | Adequado/restrito. |
| Estrutura | Tomadas disponiveis | `public.patient_address_logistics.power_outlets_desc` | `text` | `string \| null` | Nao | `NULL` | trim; max 200 | — | Descricao de tomadas. |
| Estrutura | Observacoes gerais | `public.patient_address_logistics.general_observations` | `text` | `string \| null` | Nao | `NULL` | trim; max 5000 | — | Observacoes adicionais. |
| Estrutura | Foto fachada (URL) | `public.patient_address_logistics.facade_image_url` | `text` | `string \| null` | Nao | `NULL` | trim; max 500 | — | URL da fachada (se existir). |
| Auditoria | Criado em | `public.patient_addresses.created_at` | `timestamptz` | `string` | Sim | `now()` | — | — | Timestamp de criacao. |
| Auditoria | Atualizado em | `public.patient_addresses.updated_at` | `timestamptz` | `string` | Sim | `now()` | — | — | Timestamp de atualizacao. |
| Auditoria | Criado por | `public.patient_addresses.created_by` | `uuid` | `string \| null` | Nao | `NULL` | — | — | Usuario criador. |
| Auditoria | Atualizado por | `public.patient_addresses.updated_by` | `uuid` | `string \| null` | Nao | `NULL` | — | — | Usuario atualizador. |
| Auditoria | Deletado em | `public.patient_addresses.deleted_at` | `timestamptz` | `string \| null` | Nao | `NULL` | — | — | Soft delete. |

## 3) Modelo de Dados (Banco)

Tabela(s) envolvidas:

- `public.patient_addresses`
- `public.patient_address_logistics`

Chaves:

- `public.patient_addresses.id` (uuid, PK, default `gen_random_uuid()`)
- `public.patient_addresses.patient_id` (uuid, FK -> `public.patients.id`)
- `public.patient_address_logistics.address_id` (uuid, FK -> `public.patient_addresses.id`)
- `tenant_id` em ambas as tabelas (default `app_private.current_tenant_id()`)

Indices necessarios (minimo):

- `patient_addresses_tenant_patient_idx` em (`tenant_id`, `patient_id`)
- `patient_addresses_primary_uidx` unico parcial em (`patient_id`) onde `is_primary = true` e `deleted_at IS NULL`
- `patient_address_logistics_tenant_address_idx` em (`tenant_id`, `address_id`)

Regras de auditoria:

- `created_at`, `updated_at` (com trigger de update)
- `created_by`, `updated_by`
- `deleted_at` (soft delete)
- **Audit trail**: registrar alteracoes relevantes em trilha de auditoria (evento/log). Implementacao detalhada fica para migrations, mas e requisito do contrato.

### 3.1) Compatibilidade com legado (mapa)

- `patient_addresses.zip_code` -> `patient_addresses.postal_code`
- `patient_addresses.street` -> `patient_addresses.street`
- `patient_addresses.number` -> `patient_addresses.number`
- `patient_addresses.neighborhood` -> `patient_addresses.neighborhood`
- `patient_addresses.city` -> `patient_addresses.city`
- `patient_addresses.state` -> `patient_addresses.state`
- `patient_addresses.reference_point` -> `patient_addresses.reference_point`
- `patient_addresses.geo_latitude`/`geo_longitude` -> `patient_addresses.latitude`/`longitude`
- `patient_addresses.eta_minutes` -> `patient_address_logistics.travel_time_min`
- `patient_addresses.travel_notes` -> `patient_address_logistics.travel_notes`
- `patient_addresses.property_type` -> `patient_address_logistics.property_type`
- `patient_addresses.elevator_status` -> `patient_address_logistics.elevator_status`
- `patient_addresses.wheelchair_access` -> `patient_address_logistics.wheelchair_access`
- `patient_addresses.street_access_type` -> `patient_address_logistics.street_access_type`
- `patient_addresses.area_risk_type` -> `patient_address_logistics.area_risk_type`
- `patient_addresses.night_access_risk` -> `patient_address_logistics.night_access_risk`
- `patient_addresses.cell_signal_quality` -> `patient_address_logistics.cell_signal_quality`
- `patient_addresses.electric_infra` -> `patient_address_logistics.electric_voltage`
- `patient_addresses.backup_power` -> `patient_address_logistics.backup_power_source`
- `patient_addresses.general_observations` -> `patient_address_logistics.general_observations`
- `patient_domiciles.voltage` -> `patient_address_logistics.electric_voltage`
- `patient_domiciles.backup_power_source` -> `patient_address_logistics.backup_power_source`
- `patient_domiciles.hygiene_conditions` -> `patient_address_logistics.hygiene_conditions`

## 4) Seguranca (RLS / Policies)

RLS:

- `public.patient_addresses`: enabled
- `public.patient_address_logistics`: enabled

Politicas (padrao):

- SELECT: `tenant_id = app_private.current_tenant_id()`
- INSERT: `tenant_id = app_private.current_tenant_id()`
- UPDATE: `tenant_id = app_private.current_tenant_id()`
- DELETE: `tenant_id = app_private.current_tenant_id()`

Observacao:

- Operacoes devem validar que o `patient_id` pertence ao mesmo tenant.

## 5) Operacoes / Actions do App

Leituras necessarias:

- `getPatientAddresses(patientId)` -> lista enderecos (ativos) + logistica (quando existir)
- `getPatientAddressById(addressId)` -> detalhe do endereco

Escritas necessarias:

- `createPatientAddress(patientId, payload)`
- `updatePatientAddress(addressId, payload)`
- `setPrimaryAddress(patientId, addressId)` (desmarca outros primarios)
- `updateAddressLogistics(addressId, payload)`

Regras de salvar/cancelar:

- Validar payload via schema Zod antes de persistir.
- `postal_code` deve ser normalizado para digitos.
- Atualizar `updated_at` automaticamente via trigger.

Integracao BrasilAPI (CEP):

- Ao informar CEP, acionar BrasilAPI e preencher `street`, `neighborhood`, `city`, `state` quando disponiveis.
- Fallback manual: se API falhar ou retornar parcial, manter campos editaveis.
- `address_source` deve registrar `brasilapi` quando a origem for auto-preenchimento.

Impactos de cobertura/escala:

- `distance_km` e `travel_time_min` sao campos derivados (podem ser preenchidos manualmente no V1).
- Integracao automatica com geocoding/roteirizacao fica fora do V1.

## 6) Mascaras e Validacoes (detalhadas)

- CEP (`postal_code`): armazenar apenas digitos; 8 digitos. Mascara `00000-000` na UI.
- UF (`state`): `^[A-Z]{2}$` quando `country = 'Brasil'`.
- `address_purpose`: `in ('atendimento','cobranca','entrega','outro')`.
- `address_source`: `in ('manual','brasilapi','outro')`.
- Enumeracoes (valores legado):
  - `ambulance_access`: `Total`, `Parcial`, `Dificil`, `Nao_acessa`, `Nao_informado`.
  - `night_access_risk`: `Baixo`, `Medio`, `Alto`, `Nao_avaliado`.
  - `area_risk_type`: `Urbana`, `Rural`, `Periurbana`, `Comunidade`, `Risco`, `Nao_informada`.
  - `street_access_type`: `Rua_larga`, `Rua_estreita`, `Rua_sem_saida`, `Viela`, `Nao_informado`.
  - `elevator_status`: `Nao_tem`, `Tem_nao_comporta_maca`, `Tem_comporta_maca`, `Nao_informado`.
  - `wheelchair_access`: `Livre`, `Com_restricao`, `Incompativel`, `Nao_avaliado`.
  - `property_type`: `Casa`, `Apartamento`, `Chacara_Sitio`, `ILPI`, `Pensao`, `Comercial`, `Outro`, `Nao_informado`.
  - `bed_type`: `Hospitalar`, `Articulada`, `Comum`, `Colchao_no_chao`, `Outro`, `Nao_informado`.
  - `mattress_type`: `Pneumatico`, `Viscoelastico`, `Espuma_comum`, `Mola`, `Outro`, `Nao_informado`.
  - `backup_power_source`: `Nenhuma`, `Gerador`, `Nobreak`, `Outros`, `Nao_informado`.
  - `electric_voltage`: `110`, `220`, `Bivolt`, `Nao_informada`.
  - `animals_behavior`: `Doces`, `Bravos`, `Necessitam_contencao`, `Nao_informado`.
  - `water_source`: `Rede_publica`, `Poco_artesiano`, `Cisterna`, `Outro`, `Nao_informado`.
  - `equipment_space`: `Adequado`, `Restrito`, `Critico`, `Nao_avaliado`.

## 7) Migracoes previstas

- `YYYYMMDDHHMM_pacientes_aba02_enderecos.sql`
- `YYYYMMDDHHMM_pacientes_aba02_endereco_logistica.sql`

Conteudo esperado:

- Criar tabelas `public.patient_addresses` e `public.patient_address_logistics`.
- Indices (incluindo unico parcial para primario).
- RLS e policies por tenant.
- Trigger `touch_updated_at`.

## 8) Definicao de Pronto (DoD)

Checklist:

- [ ] Contrato aprovado
- [ ] Migrations criadas e aplicadas
- [ ] Types TS regenerados
- [ ] Actions implementadas
- [ ] UI sem mocks, conectada ao Supabase
- [ ] RLS e policies validadas
- [ ] Testes manuais minimos documentados
- [ ] Runbook/Docs atualizados
