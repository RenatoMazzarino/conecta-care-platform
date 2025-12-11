# REPO_MAP

Estado atual baseado no repositório (sem suposições).

## Front-end (Next.js App Router)
- Páginas: `/` (home com cards de módulos), `/pacientes` (lista em cards), `/pacientes/[id]` (detalhe com abas).  
- Layout global: `FluentProviderWrapper` (tema claro/escuro), `Header` (launcher, busca, ações), `CommandBar` (Fluent A), `Breadcrumb`.  
- Estilo: `globals.css` com Tailwind 4, reset e lock de overflow.

## Domínio Pacientes (base da operação)
- Lista (`src/app/pacientes/page.tsx`): command bar, header de lista com contadores, filtros em abas e cards de pacientes com status/contatos/link.  
- Detalhe (`src/app/pacientes/[id]/page.tsx`): casca Fluent A completa (command bar, header de paciente, abas em linha) com seções mockadas: Dados pessoais, Endereço & logística, Rede de apoio, Administrativo, Financeiro, Clínico, Documentos (GED), Histórico & Auditoria.  
- Componentes de formulário/visualização em `src/components/patient/*`.

## Domínio Escalas (core esperado)
- Nenhuma rota/componente/serviço implementado. Sem tipos ou dados de escala.

## GED / Auditoria
- Apenas placeholders textuais na aba Documentos (GED) e Histórico & Auditoria do detalhe do paciente. Não há integrações, tipos ou storage configurado.

## Financeiro / Inventário / Clínico
- Home lista módulos, mas não há rotas ou serviços implementados. Abas “Financeiro” e “Clínico” no detalhe do paciente são estáticas/mock.

## Dados / Integrações
- Supabase: client configurado (`src/lib/supabase/client.ts`), sem uso em páginas/serviços. Env esperados: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.  
- Tipos: `src/types/patient.ts` define dados de paciente e abas.

## Segurança / Permissões / Multi-tenant
- Não há implementação de escopo de tenant, perfis ou autorização no código atual.

## Referência visual
- Comparativo canônico: `html/comparativo-fluent.html` (Opção A – Fluent clássico).

## Pastas-chave do shell Fluent A
- Páginas de referência: `src/app/pacientes/page.tsx` e `src/app/pacientes/[id]/page.tsx` (command bar + header + abas + cards).  
- Layout base: `src/components/layout/CommandBar.tsx`, `src/components/layout/Header.tsx`, `src/components/layout/Breadcrumb.tsx`.  
- Estilos globais e provider: `src/app/globals.css`, `src/components/FluentProviderWrapper.tsx`.
