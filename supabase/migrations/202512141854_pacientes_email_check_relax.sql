-- CONTRATO: docs/contracts/pacientes/ABA01_DADOS_PESSOAIS.md
-- Objetivo: manter CHECK simples no banco; validação forte fica no app (Zod).

DO $$
DECLARE
  constraint_name text;
BEGIN
  IF to_regclass('public.patients') IS NULL THEN
    RAISE NOTICE 'public.patients não existe; pulando ajuste de CHECK de e-mail.';
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'patients' AND column_name = 'email'
  ) THEN
    RAISE NOTICE 'public.patients.email não existe; pulando ajuste de CHECK de e-mail.';
    RETURN;
  END IF;

  -- Drop do nome canônico, se já existir (idempotente).
  EXECUTE 'ALTER TABLE public.patients DROP CONSTRAINT IF EXISTS patients_email_format_chk';

  -- Drop qualquer CHECK de e-mail já existente (defensivo).
  FOR constraint_name IN
    SELECT con.conname
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
    WHERE con.contype = 'c'
      AND nsp.nspname = 'public'
      AND rel.relname = 'patients'
      AND pg_get_constraintdef(con.oid) ~* '\\memail\\M'
  LOOP
    EXECUTE format('ALTER TABLE public.patients DROP CONSTRAINT IF EXISTS %I', constraint_name);
  END LOOP;

  -- Recria um CHECK canônico mais tolerante (sem regex frágil).
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
    WHERE con.contype = 'c'
      AND nsp.nspname = 'public'
      AND rel.relname = 'patients'
      AND con.conname = 'patients_email_format_chk'
  ) THEN
    EXECUTE $sql$
      ALTER TABLE public.patients
      ADD CONSTRAINT patients_email_format_chk
      CHECK (
        email IS NULL OR (
          position('@' in email) > 1
          AND position('.' in split_part(email, '@', 2)) > 1
        )
      );
    $sql$;
  END IF;
END $$;
