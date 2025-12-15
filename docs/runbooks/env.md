# Runbook — Variáveis de Ambiente (.env) e política de segredos

Este projeto usa Next.js. Por padrão, o Next **carrega arquivos `.env*` a partir da raiz do projeto** (onde está o `package.json`).  
Por isso, **não movemos** `.env` para outras pastas — isso quebra o carregamento automático.

## Arquivos de exemplo (commitáveis)
- `.env.example`: template mínimo e genérico.
- `.env.local.local.example`: exemplo para Supabase local.
- `.env.local.online.example`: exemplo para Supabase remoto.

> Nunca coloque segredos nos arquivos `.env*.example`.

## Variáveis usadas no projeto
### Públicas (vão para o browser)
Estas variáveis ficam disponíveis no código client-side (por isso começam com `NEXT_PUBLIC_`).

- `NEXT_PUBLIC_SUPABASE_URL` (**obrigatória**): URL do projeto Supabase (local ou remoto).
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (**obrigatória**): chave `anon` (publishable).
- `NEXT_PUBLIC_SUPABASE_DEV_ACCESS_TOKEN` (**DEV ONLY / opcional**):
  - Token para **desenvolvimento local** quando você precisa simular um usuário/tenant sem UI de login.
  - É **opt-in** e só é usado quando `NODE_ENV=development`.
  - **Não use em produção.** Se essa env estiver definida em produção por engano, o app deve ignorar e emitir `console.warn`.

### Server-only (NUNCA expor no browser)
- `SUPABASE_SERVICE_ROLE_KEY` (opcional, mas sensível):
  - Só pode ser usado em código **server-side** (Route Handlers / Server Actions / scripts).
  - Nunca use em `client components`.

## Política enterprise (obrigatória)
- **Nunca commitar** `.env`, `.env.local`, `.env.*.local`, `.env.production*` etc.
  - O `.gitignore` já cobre `.env*` e só permite commit de `*.example`.
- **Segredos não podem** estar em `NEXT_PUBLIC_*` (porque isso é exposto no bundle do browser).
- Use arquivos locais por ambiente:
  - `.env.local`: padrão para desenvolvimento local.
  - `.env.development.local`: específico do ambiente de desenvolvimento.
  - `.env.production.local`: específico de produção (no deploy/hosting).

## DEV ONLY — como habilitar o bypass local (tenant)
1) Defina no seu `.env.local` (ou `.env.local.local`) o `NEXT_PUBLIC_SUPABASE_DEV_ACCESS_TOKEN`.
2) Reinicie o `npm run dev` para o Next recarregar as env vars.

