# Runbook — Resposta a Incidentes de Segurança

Status: ATUAL — operacional.

## Objetivo / quando usar

Responder de forma padronizada a incidentes de segurança (vazamento de segredos, acesso indevido, falha de RLS, perda de dados).

## Pré-requisitos

- Acesso administrativo ao repositório e ao Supabase.
- Acesso aos logs da aplicação/infra.
- Plano de rotação de segredos: [`SECRETS_ROTATION.md`](../reviews/analise-governanca-estrutura-2025-12-19/SECRETS_ROTATION.md).

## Classificação de severidade (exemplo)

- **SEV-1**: vazamento confirmado de segredos ou dados sensíveis.
- **SEV-2**: falha de controle de acesso com potencial impacto.
- **SEV-3**: incidente menor sem exposição de dados.

## Passo a passo

1) **Triagem**
   - Identificar o tipo de incidente e impacto potencial.
   - Registrar data/hora e responsáveis.
2) **Contenção**
   - Rotacionar segredos comprometidos.
   - Revogar sessões/tokens suspeitos.
   - Bloquear endpoints/credenciais afetados.
3) **Erradicação**
   - Remover causa raiz (código, configuração, policy).
   - Adicionar proteções permanentes (gitleaks, RLS, validações).
4) **Recuperação**
   - Restaurar serviços em modo seguro.
   - Validar fluxos críticos.
5) **Post‑mortem**
   - Documentar causa raiz, impacto e ações preventivas.
   - Atualizar runbooks e backlog (`OPEN_TODO.md`).

## Como validar sucesso

- Serviços críticos operacionais sem erros de autenticação.
- Logs sem tentativas de acesso indevido.
- Segredos rotacionados e atualizados em todos os ambientes.

## Rollback / mitigação

- Se uma mudança de contenção causar indisponibilidade, reverter apenas o mínimo necessário e registrar a exceção.

## Logs e rastreabilidade

- Logs do Supabase (Auth + PostgREST).
- Logs da aplicação (API/Next.js).
- Eventos de auditoria em `audit_events`.

## Troubleshooting

- **Falha após rotação**: verificar se variáveis foram atualizadas em todos os ambientes.
- **401 recorrente**: validar JWT e configuração de `tenant_id`.

## Segurança e compliance (o que NÃO fazer)

- Não reescreva histórico Git sem autorização.
- Não exponha logs sensíveis em canais públicos.
