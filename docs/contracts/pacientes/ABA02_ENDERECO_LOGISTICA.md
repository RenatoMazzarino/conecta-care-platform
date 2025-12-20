# Contrato da Aba: Endereco & Logistica

## 0) Metadados

- Modulo: Pacientes
- Aba: ABA02 — Endereco & Logistica
- Versao: 0.3
- Status: Em revisao
- Ultima atualizacao: 2025-12-20
- Governanca:
  - O legado e referencia de **cobertura/estrutura**. O schema novo segue as decisoes deste contrato.
  - Divergencias/excecoes ao legado sao permitidas quando decididas e justificadas aqui.
- Referencias:
  - `AGENT.md`
  - `docs/contracts/_templates/CONTRACT_TEMPLATE.md`
  - `docs/contracts/pacientes/ABA01_DADOS_PESSOAIS.md`
  - `docs/architecture/decisions/ADR-004-ui-dynamics-standard.md`
  - `docs/repo_antigo/schema_current.sql`
  - `docs/contracts/pacientes/ABA02_LEGACY_FIELD_LIST.md`
  - `docs/contracts/pacientes/ABA02_LEGACY_TO_CANONICAL_MAP.md`
  - `html/modelo_final_aparencia_pagina_do_paciente.htm`
  - `docs/runbooks/auditoria-endpoint.md`

Fonte do legado (anexos obrigatorios):

- Campos completos de `legacy.patient_addresses` e `legacy.patient_domiciles`: `docs/contracts/pacientes/ABA02_LEGACY_FIELD_LIST.md`.
- Mapa legado -> canonico (100%): `docs/contracts/pacientes/ABA02_LEGACY_TO_CANONICAL_MAP.md`.

Padrao de nomenclatura:

- Legado: sempre com prefixo `legacy.*`.
- Canonico: sempre com prefixo `public.*`.

## 1) Objetivo da Aba

- Registrar e manter **enderecos multiplos** do paciente com regra de **endereco primario**.
- Capturar informacoes de **logistica/acesso** e **estrutura da residencia** para planejamento de atendimento e cobertura.

Perfis tipicos:

- atendimento/recepcao (cadastro)
- enfermagem/operacoes (consulta e logistica)
- administrativo (correcoes)

## 2) Estrutura de UI (Cards e Campos)

- UI segue o padrao Dynamics (command bar + record header + abas), conforme ADR-004.

### A1) Endereco (localizacao)

Cards/secoes:

- **Endereco (Localizacao)**
- **Geolocalizacao (Mapa)**
- **Auditoria (interno)**

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
| Endereco | Origem do CEP | `public.patient_addresses.address_source` | `text` | `string` | Sim | `manual` | ver Secao 6 (address_source) | select | Manual/BrasilAPI/Outro. |
| Geolocalizacao | Latitude | `public.patient_addresses.latitude` | `numeric` | `number \| null` | Nao | `NULL` | range valido (-90..90) | — | Latitude do endereco. |
| Geolocalizacao | Longitude | `public.patient_addresses.longitude` | `numeric` | `number \| null` | Nao | `NULL` | range valido (-180..180) | — | Longitude do endereco. |
| Auditoria | Criado em | `public.patient_addresses.created_at` | `timestamptz` | `string` | Sim | `now()` | — | — | Timestamp de criacao. |
| Auditoria | Atualizado em | `public.patient_addresses.updated_at` | `timestamptz` | `string` | Sim | `now()` | — | — | Timestamp de atualizacao. |
| Auditoria | Criado por | `public.patient_addresses.created_by` | `uuid` | `string \| null` | Nao | `NULL` | — | — | Usuario criador. |
| Auditoria | Atualizado por | `public.patient_addresses.updated_by` | `uuid` | `string \| null` | Nao | `NULL` | — | — | Usuario atualizador. |
| Auditoria | Deletado em | `public.patient_addresses.deleted_at` | `timestamptz` | `string \| null` | Nao | `NULL` | — | — | Soft delete. |

### A2) Logistica & Estrutura (acesso + residencia)

Cards/secoes:

- **Logistica & Acesso**
- **Estrutura da Residencia**
- **Auditoria (interno)**

Tabela padrao por campo (obrigatoria):

| Card | Campo (label UI) | Nome tecnico (schema.table.column) | Tipo PG | Tipo TS | Obrigatorio | Default | Validacoes | Mascara | Descricao curta |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Logistica & Acesso | Horario permitido de visita | `public.patient_address_logistics.allowed_visit_hours` | `text` | `string \| null` | Nao | `NULL` | trim; max 120 | — | Ex.: 08:00-18:00. |
| Logistica & Acesso | Tempo estimado (min) | `public.patient_address_logistics.travel_time_min` | `integer` | `number \| null` | Nao | `NULL` | >= 0 | — | ETA em minutos (opcional/derivado). |
| Logistica & Acesso | Distancia (km) | `public.patient_address_logistics.distance_km` | `numeric` | `number \| null` | Nao | `NULL` | >= 0 | — | Distancia estimada (opcional/derivado). |
| Logistica & Acesso | Notas de deslocamento | `public.patient_address_logistics.travel_notes` | `text` | `string \| null` | Nao | `NULL` | trim; max 500 | — | Observacoes de deslocamento. |
| Logistica & Acesso | Condicoes de acesso | `public.patient_address_logistics.access_conditions` | `text` | `string \| null` | Nao | `NULL` | trim; max 200 | — | Observacoes gerais de acesso. |
| Logistica & Acesso | Procedimento de entrada | `public.patient_address_logistics.entry_procedure` | `text` | `string \| null` | Nao | `NULL` | trim; max 200 | — | Ex.: ligar na portaria. |
| Logistica & Acesso | Identificacao no portao | `public.patient_address_logistics.gate_identification` | `text` | `string \| null` | Nao | `NULL` | trim; max 120 | — | Ex.: interfone, senha. |
| Logistica & Acesso | Estacionamento (geral) | `public.patient_address_logistics.parking` | `text` | `string \| null` | Nao | `NULL` | trim; max 120 | — | Vaga, rua, estacionamento. |
| Logistica & Acesso | Estacionamento da equipe | `public.patient_address_logistics.team_parking` | `text` | `string \| null` | Nao | `NULL` | trim; max 120 | — | Instrucao especifica para equipe. |
| Logistica & Acesso | Acesso de ambulancia | `public.patient_address_logistics.ambulance_access` | `text` | `string \| null` | Nao | `NULL` | ver Secao 6 (ambulance_access) | select | Facilidade de acesso. |
| Logistica & Acesso | Risco de acesso noturno | `public.patient_address_logistics.night_access_risk` | `text` | `string \| null` | Nao | `NULL` | ver Secao 6 (night_access_risk) | select | Risco no periodo noturno. |
| Logistica & Acesso | Tipo de area de risco | `public.patient_address_logistics.area_risk_type` | `text` | `string \| null` | Nao | `NULL` | ver Secao 6 (area_risk_type) | select | Ex.: urbana, rural, risco. |
| Logistica & Acesso | Zona (urbana/rural) | `public.patient_address_logistics.zone_type` | `text` | `string \| null` | Nao | `NULL` | ver Secao 6 (zone_type) | select | Classificacao da zona. |
| Logistica & Acesso | Tipo de rua | `public.patient_address_logistics.street_access_type` | `text` | `string \| null` | Nao | `NULL` | ver Secao 6 (street_access_type) | select | Rua larga/estreita etc. |
| Logistica & Acesso | Escadas externas | `public.patient_address_logistics.external_stairs` | `text` | `string \| null` | Nao | `NULL` | trim; max 120 | — | Ex.: 2 lances. |
| Logistica & Acesso | Elevador | `public.patient_address_logistics.elevator_status` | `text` | `string \| null` | Nao | `NULL` | ver Secao 6 (elevator_status) | select | Status do elevador. |
| Logistica & Acesso | Acesso cadeirante | `public.patient_address_logistics.wheelchair_access` | `text` | `string \| null` | Nao | `NULL` | ver Secao 6 (wheelchair_access) | select | Condicao de acesso. |
| Logistica & Acesso | Portaria 24h | `public.patient_address_logistics.has_24h_concierge` | `boolean` | `boolean` | Nao | `false` | — | toggle | Indica portaria 24h. |
| Logistica & Acesso | Contato portaria | `public.patient_address_logistics.concierge_contact` | `text` | `string \| null` | Nao | `NULL` | trim; max 120 | — | Telefone/ramal. |
| Logistica & Acesso | Qualidade do sinal celular | `public.patient_address_logistics.cell_signal_quality` | `text` | `string \| null` | Nao | `NULL` | ver Secao 6 (cell_signal_quality) | select | Bom/razoavel/ruim. |
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
| Estrutura | Foto fachada (URL) | `public.patient_address_logistics.facade_image_url` | `text` | `string \| null` | Nao | `NULL` | trim; max 500 | — | URL da fachada (se existir). |
| Estrutura | Observacoes gerais | `public.patient_address_logistics.general_observations` | `text` | `string \| null` | Nao | `NULL` | trim; max 5000 | — | Observacoes adicionais. |
| Auditoria | Criado em | `public.patient_address_logistics.created_at` | `timestamptz` | `string` | Sim | `now()` | — | — | Timestamp de criacao. |
| Auditoria | Atualizado em | `public.patient_address_logistics.updated_at` | `timestamptz` | `string` | Sim | `now()` | — | — | Timestamp de atualizacao. |
| Auditoria | Criado por | `public.patient_address_logistics.created_by` | `uuid` | `string \| null` | Nao | `NULL` | — | — | Usuario criador. |
| Auditoria | Atualizado por | `public.patient_address_logistics.updated_by` | `uuid` | `string \| null` | Nao | `NULL` | — | — | Usuario atualizador. |
| Auditoria | Deletado em | `public.patient_address_logistics.deleted_at` | `timestamptz` | `string \| null` | Nao | `NULL` | — | — | Soft delete. |

## 3) Modelo de Dados (Banco)

Tabela(s) envolvidas:

- `public.patient_addresses` (localizacao + identificacao do endereco)
- `public.patient_address_logistics` (acesso + estrutura da residencia)

Relacionamentos e cardinalidade:

- 1 paciente -> N enderecos (`public.patient_addresses.patient_id` -> `public.patients.id`).
- 1 endereco -> 0..1 registro de logistica (`public.patient_address_logistics.address_id` -> `public.patient_addresses.id`).

Chaves e colunas minimas:

- `public.patient_addresses.id` (uuid, PK, default `gen_random_uuid()`).
- `public.patient_addresses.patient_id` (uuid, FK -> `public.patients.id`).
- `public.patient_address_logistics.address_id` (uuid, PK + FK -> `public.patient_addresses.id`).
- `tenant_id` em ambas as tabelas (default `app_private.current_tenant_id()`).

Regras de negocio (V1):

- Enderecos sao 1:N por paciente.
- `is_primary`: **exatamente 1 endereco primario por paciente** entre registros ativos (`deleted_at IS NULL`).
- Soft delete: `deleted_at` marca endereco inativo; ao remover um primario, o app deve promover outro endereco ativo.
- CEP via BrasilAPI: `postal_code` normalizado para digitos; `address_source` registra origem.
- Campos de cobertura/escala (`distance_km`, `travel_time_min`) sao opcionais e podem ser preenchidos manualmente no V1.

Indices necessarios (minimo):

- `patient_addresses_tenant_patient_idx` em (`tenant_id`, `patient_id`).
- `patient_addresses_primary_uidx` unico parcial em (`patient_id`) onde `is_primary = true` e `deleted_at IS NULL`.
- `patient_address_logistics_tenant_address_idx` em (`tenant_id`, `address_id`).

Constraints/checks necessarios (minimo):

- CEP: check `postal_code ~ '^[0-9]{8}$'` quando nao nulo.
- UF: check `state ~ '^[A-Z]{2}$'` quando `country = 'Brasil'`.
- Enumeracoes conforme Secao 6 (podem ser check constraints ou validacoes no app).

Regras de auditoria:

- `created_at`, `updated_at` (com trigger de update).
- `created_by`, `updated_by` (preenchido pela aplicacao).
- `deleted_at` (soft delete).
- **Audit trail**: registrar eventos em `public.audit_events` (ver `docs/runbooks/auditoria-endpoint.md`).

### 3.1) Auditoria (minimo do audit trail)

- Eventos minimos: `patient_address.create`, `patient_address.update`, `patient_address.delete`, `patient_address_logistics.update`.
- Tabela sugerida: `public.audit_events` (append-only, sem update/delete).
- Payload minimo: `event`, `tenant_id`, `actor_id`, `entity`, `entity_id`, `origin`, `payload.changed_fields`.

## 4) Seguranca (RLS / Policies)

RLS:

- `public.patient_addresses`: enabled
- `public.patient_address_logistics`: enabled

Politicas (padrao por tenant):

- SELECT: `tenant_id = app_private.current_tenant_id()` **e** `deleted_at IS NULL`.
- INSERT: `tenant_id = app_private.current_tenant_id()` (via `WITH CHECK`).
- UPDATE: `tenant_id = app_private.current_tenant_id()` **e** `deleted_at IS NULL`.
- DELETE: `tenant_id = app_private.current_tenant_id()` **e** `deleted_at IS NULL`.

Observacoes:

- Operacoes devem validar que o `patient_id` pertence ao mesmo tenant.
- Para `patient_address_logistics`, garantir que `address_id` esteja dentro do tenant (join com `patient_addresses`).

## 5) Operacoes / Actions do App

Leituras necessarias:

- `getPatientAddresses(patientId)`: lista enderecos ativos + logistica (left join).
- `getPatientAddressById(addressId)`: detalhe do endereco.

Escritas necessarias:

- `createPatientAddress(patientId, payload)`.
- `updatePatientAddress(addressId, payload)`.
- `setPrimaryAddress(patientId, addressId)` (desmarca outros primarios).
- `updateAddressLogistics(addressId, payload)`.
- `softDeleteAddress(addressId)` (set `deleted_at`).

Regras de salvar/cancelar:

- Validar payload via schema (Zod) antes de persistir.
- `postal_code` deve ser normalizado para **digitos**.
- Se nao existir endereco primario para o paciente, o primeiro endereco ativo deve ser `is_primary = true`.
- Ao trocar primario, limpar `is_primary` dos demais enderecos ativos do paciente.

Integracao BrasilAPI (CEP):

- Ao informar CEP, acionar BrasilAPI e preencher `street`, `neighborhood`, `city`, `state` quando disponiveis.
- Fallback manual: se API falhar ou retornar parcial, manter campos editaveis.
- `address_source`: `brasilapi` quando origem for auto-preenchimento; `manual` quando preenchido manualmente.
- `postal_code` armazenado como 8 digitos (sem hifen).

Observacao:

- `formatted_address` pode ser gerado no app (derivado) e **nao** deve ser persistido como fonte de verdade no V1.

## 6) Mascaras e Validacoes (detalhadas)

- CEP (`postal_code`): armazenar apenas digitos; 8 digitos. Mascara `00000-000` na UI.
- UF (`state`): `^[A-Z]{2}$` quando `country = 'Brasil'`.
- `address_purpose`: `in ('atendimento','cobranca','entrega','outro')`.
- `address_source`: `in ('manual','brasilapi','outro')`.
- Enumeracoes (valores legado):
  - `ambulance_access`: `Total`, `Parcial`, `Dificil`, `Nao_acessa`, `Nao_informado`.
  - `night_access_risk`: `Baixo`, `Medio`, `Alto`, `Nao_avaliado`.
  - `area_risk_type`: `Urbana`, `Rural`, `Periurbana`, `Comunidade`, `Risco`, `Nao_informada`.
  - `zone_type`: `Urbana`, `Rural`, `Periurbana`, `Comunidade`, `Risco`, `Nao_informada`.
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
  - `cell_signal_quality`: `Bom`, `Razoavel`, `Ruim`, `Nao_informado`.

## 7) Regras de Migracao (futuro)

- Duplicados: preferir `legacy.patient_domiciles.*` quando nao nulo; fallback para `legacy.patient_addresses.*`.
- Unificacao:
  - `legacy.patient_addresses.animal_behavior` + `legacy.patient_domiciles.animals_behavior` -> `public.patient_address_logistics.animals_behavior`.
  - `legacy.patient_addresses.electric_infra` + `legacy.patient_domiciles.voltage` -> `public.patient_address_logistics.electric_voltage`.
  - `legacy.patient_addresses.backup_power` + `legacy.patient_domiciles.backup_power_source` -> `public.patient_address_logistics.backup_power_source`.
- Relacionamento: `legacy.patient_domiciles.patient_id` deve apontar para o **endereco primario** em `public.patient_addresses` (via `address_id`).
- Soft delete / primario:
  - Legado nao possui `deleted_at`; migrar como `NULL`.
  - Criar 1 endereco por paciente com `is_primary = true`.
- Campos derivados/padroes (V1):
  - `public.patient_addresses.address_label`: default `Endereco principal`.
  - `public.patient_addresses.address_purpose`: default `outro`.
  - `public.patient_addresses.address_source`: default `manual`.
  - `public.patient_addresses.country`: default `Brasil`.
  - `public.patient_address_logistics.distance_km`: `NULL` (sem origem legacy).
  - `public.patient_address_logistics.travel_time_min`: usar `legacy.patient_addresses.eta_minutes` quando existir.

## 8) Migracoes previstas

- `YYYYMMDDHHMM_pacientes_aba02_enderecos.sql`
- `YYYYMMDDHHMM_pacientes_aba02_endereco_logistica.sql`

Conteudo esperado:

- Criar tabelas `public.patient_addresses` e `public.patient_address_logistics`.
- Indices (incluindo unico parcial para primario).
- RLS e policies por tenant.
- Trigger `touch_updated_at`.
- Hooks para `audit_events` (quando aplicavel).

## 9) Definicao de Pronto (DoD)

Checklist:

- [ ] Contrato aprovado
- [ ] Migrations criadas e aplicadas
- [ ] Types TS regenerados
- [ ] Actions implementadas
- [ ] UI sem mocks, conectada ao Supabase
- [ ] RLS e policies validadas
- [ ] Testes manuais minimos documentados
- [ ] Runbook/Docs atualizados

## 10) Anexos

- Campos do legado (com duplicados): `docs/contracts/pacientes/ABA02_LEGACY_FIELD_LIST.md`.
- Mapa legado -> canonico (100%): `docs/contracts/pacientes/ABA02_LEGACY_TO_CANONICAL_MAP.md`.
