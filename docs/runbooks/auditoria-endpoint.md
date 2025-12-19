# Runbook — Endpoint Unificado de Auditoria

Status: ATUAL — operacional.

## Objetivo / quando usar

Definir e operar o endpoint unificado de auditoria que registra eventos de Pacientes, Escalas, GED e administrativos por tenant.

## Pré-requisitos

- Acesso ao Supabase (migrations + políticas RLS).
- Acesso ao repositório para atualizar contrato/runbooks.
- Taxonomia de eventos definida (mínimo inicial).

## Passo a passo (implementação e operação)

1) **Definir taxonomia de eventos**
   - Ex.: `patient.update`, `document.upload`, `schedule.checkin`, `schedule.checkout`.
   - Registrar no contrato do módulo e no backlog.
2) **Criar tabela de auditoria** (migration)
   - Tabela sugerida: `public.audit_events`.
   - Colunas mínimas: `id`, `tenant_id`, `actor_id`, `actor_role`, `event`, `entity`, `entity_id`, `origin`, `payload`, `created_at`.
   - Índices por `tenant_id`, `entity_id`, `created_at`.
3) **Aplicar RLS**
   - SELECT/INSERT filtrando por `tenant_id`.
   - Proibir updates/deletes diretos (auditoria é append-only).
4) **Criar endpoint**
   - Rota sugerida: `POST /api/audit/events`.
   - Validação de payload (Zod/JSON Schema).
   - Rate limit por tenant/actor.
5) **Integrar nos fluxos críticos**
   - Pacientes: update, upload de documento, consentimentos.
   - Escalas: create, approve, checkin, checkout.

## Payload mínimo (exemplo)

```json
{
  "event": "patient.update",
  "tenant_id": "<uuid>",
  "actor_id": "<uuid>",
  "actor_role": "admin",
  "entity": "patient",
  "entity_id": "<uuid>",
  "origin": "web",
  "payload": { "changed_fields": ["email", "phone"] }
}
```

## Como validar sucesso

- Inserir evento de teste com tenant válido.
- Consultar `audit_events` filtrando por `tenant_id` e `entity_id`.
- Confirmar que RLS bloqueia tenants diferentes.

## Rollback / mitigação

- Se o endpoint falhar, desabilite a rota e monitore impacto.
- Reverter a migration apenas se não houver uso em produção (append-only).

## Logs e rastreabilidade

- Tabela `public.audit_events`.
- Logs do endpoint (API/observabilidade).
- Evidências em contratos e runbooks do módulo.

## Troubleshooting

- **403/401**: validar sessão, JWT e `tenant_id`.
- **Payload inválido**: revisar schema e campos obrigatórios.
- **Eventos duplicados**: usar idempotency key por request (quando aplicável).

## Segurança e compliance (o que NÃO fazer)

- Não registrar dados sensíveis desnecessários no payload.
- Não permitir updates/deletes diretos em `audit_events`.
- Não aceitar `tenant_id` fornecido pelo cliente sem validação do JWT.

## Evidências

- Adicionar links de PR/migrations quando implementado.
