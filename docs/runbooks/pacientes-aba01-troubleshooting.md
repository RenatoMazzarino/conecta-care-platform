# Troubleshooting — Aba 01 (Pacientes · Dados Pessoais)

Este documento registra os **erros encontrados** durante o desenvolvimento/integração da Aba 01 (Dados Pessoais) e **o que foi feito para corrigir**, para facilitar manutenção e futuras validações.

> Importante: este log é focado em **dev local** (Windows + Supabase local) e em erros reais vistos no navegador/console.
> Não contém chaves/segredos. Nunca commite `.env*` reais.

## Contexto
- App: Next.js App Router (`/pacientes/[id]`)
- Banco: Supabase local com **RLS + multi-tenant** (`tenant_id` + `app_private.current_tenant_id()`)
- Tipos canônicos: `src/types/supabase.ts`

## 1) Warning “Invalid source map…” no dev (Turbopack)
**Sintoma**
- Console/terminal mostrava mensagens do tipo:
  - `Invalid source map. Only conformant source maps can be used...`
  - apontando para `.next/dev/server/chunks/ssr/...`

**Causa**
- Warning do Node/Next ao usar Turbopack no dev: alguns sourcemaps gerados não são “conformant”.
- Não é bug do `page.tsx`, mas polui o console e dificulta debug.

**Correção**
- Mantivemos o dev “padrão” com sourcemaps e criamos um modo opcional “clean”:
  - `npm run dev` (padrão): `next dev` (com sourcemaps)
  - `npm run dev:clean`: `next dev --disable-source-maps` (quando o console ficar barulhento)

**Como validar**
- Rode `npm run dev:clean`. Os warnings devem sumir (ou reduzir drasticamente).

## 2) Erro do Next 16: `params` é Promise (rota dinâmica)
**Sintoma**
- Erro:
  - `Route "/pacientes/[id]" used params.id. params is a Promise and must be unwrapped...`

**Causa**
- No Next 16, o `params` pode ser assíncrono em rotas dinâmicas e precisa ser “unwrapped”.

**Correção**
- `src/app/pacientes/[id]/page.tsx` virou `async` e passou a fazer `await params` antes de acessar `id`.

**Como validar**
- Acesse `/pacientes/<uuid>` e confira que o erro de `params` não aparece mais.

## 3) “Invalid uuid” ao abrir `/pacientes/1`
**Sintoma**
- Na Aba 01 aparecia:
  - `Erro ao carregar`
  - `[{ "validation": "uuid", ... "message": "Invalid uuid" }]`

**Causa**
- O campo `public.patients.id` é `uuid`. Portanto, `/pacientes/1` nunca vai funcionar.
- O erro era um `ZodError` “cru” vazando para a UI.

**Correção**
- Melhoramos a validação do `patientId` e a mensagem de erro:
  - `src/features/pacientes/actions/getPatientById.ts`
  - `src/features/pacientes/actions/updatePatientDadosPessoais.ts`
  - Mensagem padronizada: **“ID do paciente inválido (esperado UUID)”**

**Como validar**
- Abra propositalmente `/pacientes/1` e confira que aparece a mensagem clara.
- Abra um UUID real (ver seção “Dados de teste”) e confira que carrega.

## 4) Warning de “hydration mismatch” no dev (extensões)
**Sintoma**
- Warning no console do browser:
  - `A tree hydrated but some attributes ... didn't match the client properties`
- Exemplo típico: atributos injetados no `<body>` por extensões (ex.: Grammarly).

**Causa**
- Extensões podem modificar o HTML antes da hidratação do React, causando mismatch.

**Correção**
- Não “calamos” esse warning globalmente no app.
- Para confirmar se é extensão (e não bug do app), teste em navegador limpo:
  - Use uma janela anônima **sem extensões** (ou um perfil novo do Chrome/Edge).
  - Desative extensões que injetam atributos no DOM (ex.: Grammarly) e recarregue a página.

**Como validar**
- Em navegador limpo, o warning deve desaparecer.

## 5) Seed de 2 pacientes para teste (aba sem mocks)
**Objetivo**
- Garantir IDs estáveis para testar a rota `/pacientes/[id]` com dados reais.

**O que foi feito**
- Criado seed local em `supabase/seed.sql` com 2 pacientes completos (campos compatíveis com constraints e contrato):
  - Lucas Mauricio Souza → `2ea4508e-4615-4ff0-9d55-68ef15d5dadb`
  - Jair Roberto Cunha da Silva → `f42bcd9e-a4f1-4bdf-8390-a5224f55d953`

**Como aplicar**
- `supabase db reset --yes`
  - Isso reaplica migrations e executa `supabase/seed.sql` (se o `db.seed.sql_paths` estiver habilitado no `supabase/config.toml`).

**URLs**
- Se o app estiver em `http://localhost:3000`:
  - `http://localhost:3000/pacientes/2ea4508e-4615-4ff0-9d55-68ef15d5dadb`
  - `http://localhost:3000/pacientes/f42bcd9e-a4f1-4bdf-8390-a5224f55d953`

## 6) CHECK de e-mail (banco): regra simples para evitar falso negativo
**Sintoma**
- Inserir paciente com `email` não-nulo falhava com:
  - `violates check constraint "patients_email_format_chk"`

**Decisão**
- Regra **simples** no banco; validação forte fica no app (Zod).

**Correção**
- Nova migration incremental padronizando um CHECK tolerante:
  - `supabase/migrations/202512141854_pacientes_email_check_relax.sql`
  - CHECK canônico:
    - `email IS NULL OR (position('@' in email) > 1 AND position('.' in split_part(email, '@', 2)) > 1)`

**Como validar**
- Após `supabase db reset --yes`, estes exemplos devem ser aceitos:
  - `a@b.com`, `nome.sobrenome@empresa.com.br`
- E estes devem ser rejeitados:
  - `a@b`, `@b.com`, `a@.com`

## 7) Erro “tenant_id ausente…” ao carregar paciente (RLS + multi-tenant)
**Sintoma**
- Request PostgREST falhava com `400` e a UI mostrava:
  - `tenant_id ausente (defina auth.jwt()->>tenant_id ou current_setting(app.tenant_id))`

**Causa**
- O banco exige um `tenant_id` via:
  - claim `tenant_id` no JWT (`auth.jwt()->>'tenant_id'`) **ou**
  - `current_setting('app.tenant_id', true)`
- No dev, usando só `anon key`, não existe JWT com `tenant_id`, então a função `app_private.current_tenant_id()` lança exceção.

**Correção (DEV LOCAL)**
1) O client Supabase passou a aceitar um token opcional para dev:
   - `src/lib/supabase/client.ts`
   - Se existir `NEXT_PUBLIC_SUPABASE_DEV_ACCESS_TOKEN` **e** `NODE_ENV=development`, ele injeta `Authorization: Bearer <token>` nas requests.
   - Em produção, esse bypass é ignorado e emite `console.warn` (para evitar ativação acidental).
2) Documentação de exemplo:
   - `.env.local.local.example` ganhou `NEXT_PUBLIC_SUPABASE_DEV_ACCESS_TOKEN=__COLOQUE_AQUI__`

**Importante (segurança)**
- Isso é **apenas para dev local**. Não use/defina `NEXT_PUBLIC_SUPABASE_DEV_ACCESS_TOKEN` em ambientes online.
- `.env.local` / `.env.local.local` são arquivos locais e não devem ser commitados (o repo já ignora `.env*`).

**Como validar**
- Após ajustar `.env.local`/`.env.local.local`, reinicie `npm run dev` e recarregue `/pacientes/<uuid>`.

## 8) Tela sem rolagem vertical (scroll travado)
**Sintoma**
- Página carregava, mas não havia scroll vertical (conteúdo “travado”).

**Causa**
- CSS global bloqueava scroll:
  - `src/app/globals.css` tinha `overflow: hidden` em `html, body`.

**Correção**
- `src/app/globals.css`:
  - removeu `overflow: hidden` do `html, body`
  - adicionou `overflow-y: auto` e `overflow-x: hidden` no `body`

**Como validar**
- Recarregue a página e teste a rolagem vertical.

## Checklist rápido de validação (local)
1) `supabase status` (confira URL/ports)
2) `supabase db reset --yes`
3) `npm run dev`
4) Abrir uma URL de paciente do seed (seção 5)
5) Editar alguns campos e salvar (Aba 01)
