-- CONTRATO: docs/contracts/pacientes/ABA01_DADOS_PESSOAIS.md
-- Alinhamento final do schema da Aba 01 (Dados Pessoais) às decisões canônicas do contrato.
-- Importante: migration incremental (não reescreve migrations já aplicadas) e defensiva para não quebrar `supabase db reset`.

-- 1) Foto: `photo_url` (legado) -> `photo_path` (canônico)
DO $$
BEGIN
  IF to_regclass('public.patients') IS NULL THEN
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'patients'
      AND column_name = 'photo_url'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'patients'
      AND column_name = 'photo_path'
  ) THEN
    EXECUTE 'alter table public.patients rename column photo_url to photo_path';
  ELSIF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'patients'
      AND column_name = 'photo_url'
  ) AND EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'patients'
      AND column_name = 'photo_path'
  ) THEN
    EXECUTE 'update public.patients set photo_path = photo_url where photo_path is null and photo_url is not null';

    BEGIN
      EXECUTE 'alter table public.patients drop column photo_url';
    EXCEPTION
      WHEN others THEN
        NULL;
    END;
  END IF;
END $$;

-- 2) Naturalidade (Brasil): `place_of_birth*` (legado) -> `birth_place` + `naturalness_*` (canônico)
DO $$
BEGIN
  IF to_regclass('public.patients') IS NULL THEN
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'patients'
      AND column_name = 'place_of_birth'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'patients'
      AND column_name = 'birth_place'
  ) THEN
    EXECUTE 'alter table public.patients rename column place_of_birth to birth_place';
  ELSIF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'patients'
      AND column_name = 'place_of_birth'
  ) AND EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'patients'
      AND column_name = 'birth_place'
  ) THEN
    EXECUTE 'update public.patients set birth_place = place_of_birth where birth_place is null and place_of_birth is not null';

    BEGIN
      EXECUTE 'alter table public.patients drop column place_of_birth';
    EXCEPTION
      WHEN others THEN
        NULL;
    END;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'patients'
      AND column_name = 'place_of_birth_city'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'patients'
      AND column_name = 'naturalness_city'
  ) THEN
    EXECUTE 'alter table public.patients rename column place_of_birth_city to naturalness_city';
  ELSIF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'patients'
      AND column_name = 'place_of_birth_city'
  ) AND EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'patients'
      AND column_name = 'naturalness_city'
  ) THEN
    EXECUTE 'update public.patients set naturalness_city = place_of_birth_city where naturalness_city is null and place_of_birth_city is not null';

    BEGIN
      EXECUTE 'alter table public.patients drop column place_of_birth_city';
    EXCEPTION
      WHEN others THEN
        NULL;
    END;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'patients'
      AND column_name = 'place_of_birth_state'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'patients'
      AND column_name = 'naturalness_state'
  ) THEN
    EXECUTE 'alter table public.patients rename column place_of_birth_state to naturalness_state';
  ELSIF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'patients'
      AND column_name = 'place_of_birth_state'
  ) AND EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'patients'
      AND column_name = 'naturalness_state'
  ) THEN
    EXECUTE 'update public.patients set naturalness_state = place_of_birth_state where naturalness_state is null and place_of_birth_state is not null';

    BEGIN
      EXECUTE 'alter table public.patients drop column place_of_birth_state';
    EXCEPTION
      WHEN others THEN
        NULL;
    END;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'patients'
      AND column_name = 'place_of_birth_country'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'patients'
      AND column_name = 'naturalness_country'
  ) THEN
    EXECUTE 'alter table public.patients rename column place_of_birth_country to naturalness_country';
  ELSIF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'patients'
      AND column_name = 'place_of_birth_country'
  ) AND EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'patients'
      AND column_name = 'naturalness_country'
  ) THEN
    EXECUTE 'update public.patients set naturalness_country = place_of_birth_country where naturalness_country is null and place_of_birth_country is not null';

    BEGIN
      EXECUTE 'alter table public.patients drop column place_of_birth_country';
    EXCEPTION
      WHEN others THEN
        NULL;
    END;
  END IF;

  -- Compat: versões antigas do contrato usaram `naturalness` (texto livre). Se existir, mapear para `naturalness_city`.
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'patients'
      AND column_name = 'naturalness'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'patients'
      AND column_name = 'naturalness_city'
  ) THEN
    EXECUTE 'alter table public.patients rename column naturalness to naturalness_city';
  END IF;
END $$;

-- 3) Validação documental: manter apenas `doc_validation_method` (remover `document_validation_method`)
DO $$
BEGIN
  IF to_regclass('public.patients') IS NULL THEN
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'patients'
      AND column_name = 'document_validation_method'
  ) THEN
    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'patients'
        AND column_name = 'doc_validation_method'
    ) THEN
      EXECUTE 'alter table public.patients add column doc_validation_method text null';
    END IF;

    EXECUTE 'update public.patients set doc_validation_method = document_validation_method where doc_validation_method is null and document_validation_method is not null';

    BEGIN
      EXECUTE 'alter table public.patients drop column document_validation_method';
    EXCEPTION
      WHEN others THEN
        NULL;
    END;
  END IF;
END $$;

-- 4) Defaults canônicos do status (sempre)
DO $$
BEGIN
  IF to_regclass('public.patients') IS NULL THEN
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'patients'
      AND column_name = 'is_active'
  ) THEN
    EXECUTE 'alter table public.patients alter column is_active set default false';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'patients'
      AND column_name = 'record_status'
  ) THEN
    EXECUTE 'alter table public.patients alter column record_status set default ''draft''';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'patients'
      AND column_name = 'onboarding_step'
  ) THEN
    EXECUTE 'alter table public.patients alter column onboarding_step set default 1';
  END IF;
END $$;

-- `cpf_status`: default canônico é `unknown` (até validação no app)
DO $$
BEGIN
  IF to_regclass('public.patients') IS NULL THEN
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'patients'
      AND column_name = 'cpf_status'
  ) THEN
    EXECUTE 'alter table public.patients alter column cpf_status set default ''unknown''';
    EXECUTE 'update public.patients set cpf_status = ''unknown'' where cpf is null and cpf_status = ''valid''';
  END IF;
END $$;

-- 5) CHECK `doc_validation_status` inclui 'Pendente' (dropar e recriar constraint canônica)
DO $$
DECLARE
  constraint_name record;
BEGIN
  IF to_regclass('public.patients') IS NULL THEN
    RETURN;
  END IF;

  FOR constraint_name IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.patients'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%doc_validation_status%'
  LOOP
    EXECUTE format('alter table public.patients drop constraint if exists %I', constraint_name.conname);
  END LOOP;
END $$;

DO $$
BEGIN
  IF to_regclass('public.patients') IS NULL THEN
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'patients'
      AND column_name = 'doc_validation_status'
  ) AND NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.patients'::regclass
      AND conname = 'patients_doc_validation_status_check'
  ) THEN
    EXECUTE $sql$
      ALTER TABLE public.patients
        ADD CONSTRAINT patients_doc_validation_status_check
        CHECK (
          doc_validation_status IS NULL
          OR doc_validation_status IN ('Pendente', 'Nao Validado', 'Validado', 'Inconsistente', 'Em Analise')
        )
    $sql$;
  END IF;
END $$;

-- 6) CHECK regra 2 fases: `record_status` x `is_active` (dropar e recriar constraint canônica)
DO $$
DECLARE
  constraint_name record;
BEGIN
  IF to_regclass('public.patients') IS NULL THEN
    RETURN;
  END IF;

  FOR constraint_name IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.patients'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%record_status%'
      AND pg_get_constraintdef(oid) ILIKE '%is_active%'
  LOOP
    EXECUTE format('alter table public.patients drop constraint if exists %I', constraint_name.conname);
  END LOOP;
END $$;

DO $$
BEGIN
  IF to_regclass('public.patients') IS NULL THEN
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'patients'
      AND column_name = 'is_active'
  ) AND EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'patients'
      AND column_name = 'record_status'
  ) AND NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.patients'::regclass
      AND conname = 'patients_record_status_phase_check'
  ) THEN
    EXECUTE $sql$
      ALTER TABLE public.patients
        ADD CONSTRAINT patients_record_status_phase_check
        CHECK (
          (is_active = false AND record_status IN ('draft', 'onboarding'))
          OR
          (is_active = true AND record_status IN ('active', 'inactive', 'deceased', 'discharged', 'pending_financial'))
        )
    $sql$;
  END IF;
END $$;

-- 7) CPF unique por tenant (remover unique global em cpf, se existir) + garantir unique parcial canônica
DO $$
DECLARE
  constraint_name record;
BEGIN
  IF to_regclass('public.patients') IS NULL THEN
    RETURN;
  END IF;

  FOR constraint_name IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.patients'::regclass
      AND contype = 'u'
      AND pg_get_constraintdef(oid) ILIKE '%cpf%'
      AND pg_get_constraintdef(oid) NOT ILIKE '%tenant_id%'
  LOOP
    EXECUTE format('alter table public.patients drop constraint if exists %I', constraint_name.conname);
  END LOOP;
END $$;

DO $$
DECLARE
  index_name record;
BEGIN
  IF to_regclass('public.patients') IS NULL THEN
    RETURN;
  END IF;

  FOR index_name IN
    SELECT indexname
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'patients'
      AND indexdef ILIKE '%unique%'
      AND indexdef ILIKE '%cpf%'
      AND indexdef NOT ILIKE '%tenant_id%'
  LOOP
    EXECUTE format('drop index if exists public.%I', index_name.indexname);
  END LOOP;
END $$;

DO $$
BEGIN
  IF to_regclass('public.patients') IS NULL THEN
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'patients'
      AND column_name = 'tenant_id'
  ) AND EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'patients'
      AND column_name = 'cpf'
  ) AND to_regclass('public.patients_tenant_cpf_uidx') IS NULL THEN
    EXECUTE $sql$
      CREATE UNIQUE INDEX patients_tenant_cpf_uidx
        ON public.patients (tenant_id, cpf)
        WHERE cpf IS NOT NULL
    $sql$;
  END IF;
END $$;

-- 8) Limpeza defensiva: se ainda existir constraint/índice mencionando `photo_url` ou `place_of_birth*`, dropar (deve ser vazio após renomes).
DO $$
DECLARE
  constraint_name record;
BEGIN
  IF to_regclass('public.patients') IS NULL THEN
    RETURN;
  END IF;

  FOR constraint_name IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.patients'::regclass
      AND (
        pg_get_constraintdef(oid) ILIKE '%photo_url%'
        OR pg_get_constraintdef(oid) ILIKE '%place_of_birth%'
      )
  LOOP
    EXECUTE format('alter table public.patients drop constraint if exists %I', constraint_name.conname);
  END LOOP;
END $$;

DO $$
DECLARE
  index_name record;
BEGIN
  IF to_regclass('public.patients') IS NULL THEN
    RETURN;
  END IF;

  FOR index_name IN
    SELECT indexname
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'patients'
      AND (
        indexdef ILIKE '%photo_url%'
        OR indexdef ILIKE '%place_of_birth%'
      )
  LOOP
    EXECUTE format('drop index if exists public.%I', index_name.indexname);
  END LOOP;
END $$;
