# Contrato da Aba: Dados Pessoais

## 0) Metadados
- Módulo: Pacientes
- Aba: ABA01 — Dados Pessoais
- Versão: 0.1
- Status: Aprovado
- Última atualização: 2025-12-13
- Referências:
  - `docs/repo_antigo/schema_current.sql`
  - `db/snapshots/`
  - `docs/contracts/_templates/CONTRACT_TEMPLATE.md`
  - `src/app/pacientes/[id]/page.tsx`
  - `src/app/pacientes/[id]/PatientPageClient.tsx` (UI atual ainda usa mocks)
  - `src/components/patient/DadosPessoaisTab.tsx` (layout alvo da Aba 01)
  - `src/types/patient.ts` (tipos provisórios; serão substituídos por types gerados)

## 1) Objetivo da Aba
- Capturar e manter dados civis e de contato do paciente (identificação + contato), com validações e normalização de dados (ex.: CPF e telefones), garantindo isolamento multi-tenant via `tenant_id` + RLS.
- Perfis típicos: atendimento/recepção (cadastro), coordenação/enfermagem (consulta), administrativo (correções).

## 2) Estrutura de UI (Cards e Campos)
- Layout alvo: `src/components/patient/DadosPessoaisTab.tsx`.
- Cards/seções:
  - **Foto do paciente (seção lateral)**: exibe avatar; upload/alteração de foto é opcional e não bloqueia a ABA01 (ver TODO no fim).
  - **Identificação**: dados básicos para identificação do paciente.
  - **Contato**: canais de contato do paciente.

Tabela padrão por campo (obrigatória):
| Card | Campo (label UI) | Nome técnico (schema.table.column) | Tipo PG | Tipo TS | Obrigatório | Default | Validações | Máscara | Descrição curta |
|------|-------------------|------------------------|--------|--------|-------------|---------|-----------|--------|----------------|
| Identificação | Nome completo | `public.patients.full_name` | `text` | `string` | Sim | — | trim; min 3; max 200 | — | Nome civil do paciente. |
| Identificação | Nome social | `public.patients.social_name` | `text` | `string \| null` | Não | `NULL` | trim; max 200 | — | Nome social, quando aplicável. |
| Identificação | CPF | `public.patients.cpf` | `text` | `string \| null` | Não | `NULL` | **normalizar para dígitos**; 11 dígitos; dígitos verificadores; único por `tenant_id` quando preenchido | `000.000.000-00` | Identificador fiscal do paciente. |
| Identificação | RG | `public.patients.rg` | `text` | `string \| null` | Não | `NULL` | trim; max 30 | — | Documento civil (formato livre). |
| Identificação | Órgão emissor | `public.patients.rg_issuer` | `text` | `string \| null` | Não | `NULL` | trim; max 60 | — | Órgão emissor do RG (ex.: SSP-SP). |
| Identificação | Data de nascimento | `public.patients.date_of_birth` | `date` | `string \| null` | Não | `NULL` | não pode ser futura; idade plausível (ex.: <= 130 anos) | `YYYY-MM-DD` | Data de nascimento do paciente. |
| Identificação | Sexo | `public.patients.gender` | `text` | `'M' \| 'F' \| 'Outro' \| null` | Não | `NULL` | valores permitidos: `M`, `F`, `Outro` | select | Sexo cadastral (conforme UI). |
| Identificação | Estado civil | `public.patients.civil_status` | `text` | `'solteiro' \| 'casado' \| 'divorciado' \| 'viuvo' \| 'uniao_estavel' \| null` | Não | `NULL` | valores permitidos conforme lista da UI | select | Estado civil do paciente. |
| Contato | Telefone principal | `public.patients.mobile_phone` | `text` | `string` | Sim | — | **normalizar para dígitos**; 10–11 dígitos (BR) ou 12–13 com DDI | `(00) 00000-0000` | Canal primário de contato. |
| Contato | Telefone secundário | `public.patients.secondary_phone` | `text` | `string \| null` | Não | `NULL` | normalizar para dígitos; mesmas regras do principal | `(00) 00000-0000` | Canal secundário (opcional). |
| Contato | E-mail | `public.patients.email` | `text` | `string \| null` | Não | `NULL` | trim; lowercase; max 320; regex simples | — | E-mail do paciente (opcional). |

## 3) Modelo de Dados (Banco)
Tabela(s) envolvidas:
- `public.patients` (somente colunas da ABA01 + metadados padrão).

Decisões explícitas (aprovadas):
- `mobile_phone` é **obrigatório** (`NOT NULL`).
- `gender` e `civil_status` são **TEXT + CHECK** (sem enum).

Chaves e colunas mínimas:
- PK: `public.patients.id` (`uuid`, default `gen_random_uuid()`).
- Multi-tenant:
  - `public.patients.tenant_id` (`uuid`, **NOT NULL**, default `app_private.current_tenant_id()`).
- Metadados:
  - `public.patients.created_at` (`timestamptz`, default `now()`).
  - `public.patients.updated_at` (`timestamptz`, default `now()`; atualizado via trigger `touch_updated_at`).

Índices necessários (mínimo):
- `idx_patients_tenant_id`: btree em `tenant_id`.
- `idx_patients_full_name_tenant`: btree em (`tenant_id`, `lower(full_name)`), para busca por nome por tenant.
- `idx_patients_cpf_tenant_unique`: **unique** em (`tenant_id`, `cpf`) com `WHERE cpf IS NOT NULL`.

Constraints/checks necessários (mínimo):
- CPF:
  - check `cpf` com regex `^[0-9]{11}$` quando não nulo.
  - unicidade por tenant quando não nulo.
- Telefones:
  - check `mobile_phone` e `secondary_phone` (quando não nulos) com regex de dígitos (ex.: `^[0-9]{10,13}$`).
- Email:
  - check simples quando não nulo (ex.: contém `@` e `.` após `@`) **e/ou** validação forte no app.
- Data:
  - check `date_of_birth <= current_date` quando não nulo.
- Domínios:
  - check para `gender` e `civil_status` conforme valores do contrato.

## 4) Segurança (RLS / Policies)
RLS:
- `public.patients`: **enabled**

Policies (por tenant):
- SELECT: permitir quando `tenant_id = app_private.current_tenant_id()`.
- INSERT: permitir quando `tenant_id = app_private.current_tenant_id()` (via `WITH CHECK`).
- UPDATE: permitir quando `tenant_id = app_private.current_tenant_id()` (via `USING` + `WITH CHECK`).
- DELETE: permitir quando `tenant_id = app_private.current_tenant_id()` (via `USING`).

Observação sobre `tenant_id` + `app_private.current_tenant_id()`:
- O `tenant_id` deve ser derivado do JWT (`auth.jwt()->>'tenant_id'`) e **nunca** retornar `NULL`.
- Fallback seguro recomendado: permitir override explícito via `current_setting('app.tenant_id', true)` para seeds/local, e lançar erro se ausente.

## 5) Operações / Actions do App
Leituras necessárias:
- `getPatientById(patientId)`: retorna os campos da ABA01 de `public.patients` (por tenant) + metadados úteis (`updated_at`).

Updates necessários:
- `updatePatientDadosPessoais(patientId, payload)` onde `payload` contém **apenas** campos da ABA01 (`full_name`, `social_name`, `cpf`, `rg`, `rg_issuer`, `date_of_birth`, `gender`, `civil_status`, `mobile_phone`, `secondary_phone`, `email`).
- Regras obrigatórias:
  - normalizar CPF/telefones para dígitos antes de persistir.
  - `email` em lowercase e trimmed.
  - validação do payload (ex.: `zod`) com erros claros (campo + mensagem).

Regras de salvar/cancelar:
- UI inicia em modo **view**.
- Ao clicar em **Editar**, entrar em modo **edit** com formulário.
- **Salvar** chama `updatePatientDadosPessoais`; sucesso volta para view e refetch/revalidate.
- **Cancelar** descarta alterações locais e volta para view.

Estados de UI:
- `loading`: skeleton/spinner no conteúdo da aba.
- `error`: mensagem + ação de tentar novamente.
- `success`: toast/banner “Dados pessoais atualizados”.

## 6) Máscaras e Validações (detalhadas)
CPF:
- Entrada com máscara `000.000.000-00`.
- Persistência: somente dígitos (`^[0-9]{11}$`).
- Validar dígitos verificadores no app (antes do update).

Telefone:
- Entrada com máscara `(00) 00000-0000` (aceitar `(00) 0000-0000` quando aplicável).
- Persistência: somente dígitos (aceitar 10–11 BR; opcional 12–13 com DDI).

Email:
- `trim()` + `toLowerCase()`.
- Validar formato no app; no banco manter check simples (não substituir validação do app).

Data:
- UI usa `input[type=date]` (ISO `YYYY-MM-DD`).
- Validar `<= hoje` e idade plausível.

Nome:
- `trim()`; colapsar espaços múltiplos; max 200.

## 7) Migrações previstas
Base (fundação do schema):
- Nome sugerido: `YYYYMMDDHHMM_base`
- Conteúdo esperado:
  - schema `app_private`
  - função `app_private.current_tenant_id()` (não retorna `NULL`)
  - função/trigger `touch_updated_at`

Aba 01 (somente campos desta aba):
- Nome sugerido: `YYYYMMDDHHMM_pacientes_aba01_dados_pessoais`
- Cabeçalho obrigatório na migration:
  - `-- CONTRATO: docs/contracts/pacientes/ABA01_DADOS_PESSOAIS.md`
- Conteúdo esperado:
  - criar `public.patients` com colunas da ABA01
  - constraints + índices definidos neste contrato
  - trigger de `updated_at`
  - RLS + policies por tenant

## 8) Definição de Pronto (DoD)
Checklist:
- [ ] Contrato aprovado
- [ ] Migration criada e aplicada no Supabase local
- [ ] Tipos TS regenerados
- [ ] UI sem mocks, usando Supabase
- [ ] Actions implementadas
- [ ] RLS e policies validadas
- [ ] Testes manuais (lista)
- [ ] Documentação do runbook atualizada

Testes manuais mínimos (ABA01):
- [ ] Abrir `/pacientes/[id]` e carregar dados reais do Supabase
- [ ] Entrar em modo edição, alterar campos e salvar
- [ ] Validar CPF inválido/telefone inválido/email inválido (erro de campo)
- [ ] Garantir isolamento por tenant (um tenant não lê/atualiza outro)

TODOs (não bloqueiam a ABA01):
- TODO: definir estratégia de foto do paciente (Storage + path na tabela vs coluna `photo_url`) e políticas RLS do bucket.
