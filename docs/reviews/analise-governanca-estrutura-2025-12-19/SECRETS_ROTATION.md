# Plano de Rotação e Resposta a Segredos — Conecta Care

Status: ATUAL — guia operacional.
Data: 2025-12-18

Este documento define o processo de rotação de segredos e resposta a incidentes de exposição. O objetivo é reduzir risco operacional e garantir rastreabilidade.

## Escopo

- Supabase: chaves `anon`, `service_role` e (quando aplicável) JWT Secret.
- Provedores externos: Google Cloud, Vercel/hosting, SMTP, OAuth, webhooks (quando usados).
- Segredos locais e de CI/CD (GitHub Actions).

## Quando rotacionar

- Vazamento confirmado ou suspeito.
- Troca de pessoa com acesso administrativo.
- Auditoria periódica (ex.: trimestral para ambientes críticos).
- Antes de release com mudança de permissões de acesso.

## Checklist por provedor

### 1) Supabase (obrigatório)

**Onde rotacionar:** Supabase Dashboard → Settings → API

#### Passos

1) Rotacione as chaves **anon** e **service_role** (Reset).
2) Se houver suspeita de vazamento de JWT secret: rotacione o **JWT Secret** (impacta todas as sessões).
3) Atualize os ambientes:
   - Produção (ex.: Vercel): atualizar `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
   - Staging/Homologação: mesmas variáveis.
   - Local: atualizar `.env.local` (ou `.env.local.local`).
4) Revogue sessões antigas (logout/login obrigatório).

#### Como validar

- `npm run verify` local.
- Autenticar no app e acessar `/pacientes` e `/pacientes/[id]`.
- Confirmar requests no Supabase (logs) sem erro 401/403.

### 2) Google Cloud (se aplicável)

**Onde rotacionar:** GCP Console → IAM & Admin → Service Accounts → Keys

#### Passos

1) Criar nova key para a service account.
2) Atualizar segredo onde estiver armazenado (ex.: GitHub Actions, Vercel, Secret Manager).
3) Revogar a key antiga após validação.

#### Como validar

- Rodar o workflow/serviço que usa a credencial.
- Checar logs do serviço por falhas de autenticação.

### 3) Vercel/Hosting (se aplicável)

**Onde rotacionar:** Dashboard do provedor (Environment Variables)

#### Passos

1) Atualizar secrets de produção e preview.
2) Forçar novo deploy para garantir carregamento de variáveis.

#### Como validar

- Abrir app publicado e executar fluxo básico (login + paciente).

### 4) OAuth/SMTP/Webhooks (se aplicável)

**Onde rotacionar:** Dashboard do provedor correspondente (Google, Microsoft, SendGrid, etc.)

#### Passos

1) Rotacionar client secret / API key.
2) Atualizar variáveis no ambiente.
3) Revogar segredos antigos.

#### Como validar

- Executar fluxo que dependa da integração (login OAuth, envio de e-mail, webhook).

## Resposta a incidente de segredo (sem reescrever histórico)
>
> Não reescreva histórico Git sem autorização explícita.

1) **Contenção imediata**
   - Revogar/rotacionar o segredo exposto.
   - Bloquear tokens/sessões associados.
2) **Erradicação**
   - Remover o segredo do repositório/artefatos.
   - Adicionar regra de prevenção (gitleaks allowlist/baseline **somente se necessário**).
3) **Recuperação**
   - Validar os serviços afetados.
   - Monitorar logs por erro/abuso.
4) **Post‑mortem**
   - Registrar causa raiz, impacto e ações preventivas.
   - Atualizar runbooks e o `OPEN_TODO.md` se necessário.

Referência operacional: `docs/runbooks/security-incident-response.md`.

## Prevenção contínua (gate forte)

- CI executa secret scanning (gitleaks) em PR e push.
- Configuração: `.gitleaks.toml`.
- Runbook: `docs/runbooks/security-secrets-scanning.md`.

## Evidências de varredura local

- 2025-12-18: varredura manual com `rg` para padrões comuns (`SUPABASE_`, `service_role`, `api_key`, `BEGIN PRIVATE KEY`, `JWT`, etc.). Resultado: nenhum segredo encontrado no repo.
