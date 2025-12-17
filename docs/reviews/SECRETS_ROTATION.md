# Plano de Rotação de Segredos — Supabase / Conecta Care

Data: 2025-12-17

Contexto: foram encontrados arquivos `.env.local` e `.env.local.local` com valores reais na máquina local. Embora o `.gitignore` já impeça novos commits de `.env*`, recomenda-se rotacionar as chaves que podem ter ficado expostas em histórico/artefatos.

Escopo: chaves do Supabase (ANON e SERVICE ROLE). Nunca commitá-las novamente.

Checklist de rotação (plano operacional):

1) Supabase — Rotacionar chaves do projeto
   - Acesse o projeto no Supabase → Settings → API.
   - Use a opção de **Reset** para: `anon` e `service_role`.
   - Copie as novas chaves e mantenha em local seguro (gestor de segredos).

2) Atualizar ambientes (sem commit de segredos)
   - Produção (ex.: Vercel): atualize as envs no dashboard de Environment Variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY` (server-only)
   - Desenvolvimento local: atualize seu `.env.local` (ou `.env.local.local`).

3) Revisar tokens e sessões
   - Faça logout/login no ambiente para renovar JWTs.
   - Se houver scripts/cache com tokens antigos, invalide-os.

4) Prevenção contínua
   - `.gitignore` mantém a regra para ignorar `.env*` e permitir somente `*.example`.
   - CI possui job de link-check em `docs/` (não expõe segredos, mas reforça higiene documental).
   - Evite usar segredos em variáveis `NEXT_PUBLIC_*` (expostas no browser).

Referências:
- docs/runbooks/env.md
- .github/workflows/ci.yml (job docs_links)
