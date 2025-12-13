# Code review

## Observações (Issues Resolved)

Este documento registra observações de revisão de código que foram identificadas e resolvidas neste PR.

### Issues Corrigidas:

- **RESOLVIDO**: O componente `src/app/pacientes/[id]/page.tsx` foi refatorado para receber `params` como objeto síncrono (`{ id: string }`), removendo completamente a dependência do hook experimental `use` do React 19 e evitando a tipagem como Promise. Agora o componente servidor passa `params` diretamente ao componente cliente `PatientPageClient`, seguindo as melhores práticas do App Router do Next.js.

- **RESOLVIDO**: Em `src/app/pacientes/page.tsx`, a ação "Novo paciente" foi corrigida para usar `router.push()` do Next.js (via `next/navigation`) em vez de `window.location.href`. A navegação agora preserva corretamente o estado da aplicação e o cache, além de manter as funcionalidades de prefetch do Next.js.
