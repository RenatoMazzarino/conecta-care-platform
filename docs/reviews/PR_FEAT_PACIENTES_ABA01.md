# Revisão do PR: Feat/pacientes-aba01-dados-pessoais

## Resumo
- Contrato da aba está na versão 0.3 e marcado como **Aprovado**.
- Migrations alinham `public.patients` ao legado: renomeios, novos campos (marketing, consentimento de foto, perfil) e checks de domínio/índices.
- Types do Supabase foram regenerados para refletir o schema estendido de `public.patients`.

## Evidências
- Contrato: `docs/contracts/pacientes/ABA01_DADOS_PESSOAIS.md` (versão 0.3, status Aprovado, atualizado em 2025-12-13).
- Migração principal: `supabase/migrations/202512130704_pacientes_aba01_dados_pessoais_extend_legado.sql` cobre renomeios, defaults, checks e índices de `record_status`/`onboarding_step`.
- Tipos: `src/types/supabase.ts` inclui os campos novos (`marketing_*`, `photo_consent*`, `communication_preferences`, `record_status`, etc.) nas definições de `public.patients`.

## Observações e pendências
- Checklist do PR ainda precisa ser marcado (lint, typecheck, build, testes manuais).
- UI ainda depende de mocks conforme referências do contrato; necessário conferir integração após geração de types.
- Confirmar se há seeds/RLS alinhados ao novo `record_status` + `is_active` (migrados, mas falta validar em runtime).
