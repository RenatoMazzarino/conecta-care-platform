


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "app_private";


ALTER SCHEMA "app_private" OWNER TO "postgres";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."admission_type_enum" AS ENUM (
    'Internacao_Domiciliar',
    'Cuidados_Paliativos',
    'Assistencia_Ventilatoria',
    'Reabilitacao',
    'Procedimento_Pontual',
    'Outro'
);


ALTER TYPE "public"."admission_type_enum" OWNER TO "postgres";


CREATE TYPE "public"."audit_action_type" AS ENUM (
    'LOGIN',
    'LOGOUT',
    'VIEW',
    'CREATE',
    'UPDATE',
    'DELETE',
    'EXPORT',
    'PRINT',
    'SYSTEM_JOB'
);


ALTER TYPE "public"."audit_action_type" OWNER TO "postgres";


CREATE TYPE "public"."billing_model_type" AS ENUM (
    'Mensalidade',
    'Diaria',
    'Plantao_12h',
    'Plantao_24h',
    'Visita',
    'Pacote_Fechado',
    'Outro'
);


ALTER TYPE "public"."billing_model_type" OWNER TO "postgres";


CREATE TYPE "public"."billing_periodicity_type" AS ENUM (
    'Mensal',
    'Quinzenal',
    'Semanal',
    'Por_Evento'
);


ALTER TYPE "public"."billing_periodicity_type" OWNER TO "postgres";


CREATE TYPE "public"."care_team_regime" AS ENUM (
    'Fixo',
    'Plantão',
    'Sobreaviso',
    'Cobertura'
);


ALTER TYPE "public"."care_team_regime" OWNER TO "postgres";


CREATE TYPE "public"."care_team_role" AS ENUM (
    'Enfermeiro Ref.',
    'Médico Resp.',
    'Técnico',
    'Fisio',
    'Nutri',
    'Psicólogo',
    'Outro'
);


ALTER TYPE "public"."care_team_role" OWNER TO "postgres";


CREATE TYPE "public"."complexity_level" AS ENUM (
    'Baixa',
    'Media',
    'Alta',
    'Critica'
);


ALTER TYPE "public"."complexity_level" OWNER TO "postgres";


CREATE TYPE "public"."contract_category_enum" AS ENUM (
    'Particular_Premium',
    'Convenio_Padrao',
    'Judicial',
    'SUS',
    'Cortesia'
);


ALTER TYPE "public"."contract_category_enum" OWNER TO "postgres";


CREATE TYPE "public"."cpf_status_type" AS ENUM (
    'Nao Validado',
    'Regular',
    'Pendente de Regularizacao',
    'Suspenso',
    'Cancelado',
    'Titular Falecido',
    'Nulo'
);


ALTER TYPE "public"."cpf_status_type" OWNER TO "postgres";


CREATE TYPE "public"."doc_category" AS ENUM (
    'Identificacao',
    'Juridico',
    'Financeiro',
    'Clinico',
    'Consentimento',
    'Outros'
);


ALTER TYPE "public"."doc_category" OWNER TO "postgres";


CREATE TYPE "public"."doc_domain" AS ENUM (
    'Administrativo',
    'Clinico',
    'Misto'
);


ALTER TYPE "public"."doc_domain" OWNER TO "postgres";


CREATE TYPE "public"."doc_origin_enum" AS ENUM (
    'Ficha_Documentos',
    'Ficha_Administrativo',
    'Ficha_Financeiro',
    'Prontuario',
    'PortalPaciente',
    'Importacao',
    'Outro'
);


ALTER TYPE "public"."doc_origin_enum" OWNER TO "postgres";


CREATE TYPE "public"."doc_source" AS ENUM (
    'Ficha',
    'Prontuario',
    'Portal',
    'Importacao',
    'Email'
);


ALTER TYPE "public"."doc_source" OWNER TO "postgres";


CREATE TYPE "public"."doc_status" AS ENUM (
    'Ativo',
    'Substituido',
    'Arquivado',
    'Rascunho'
);


ALTER TYPE "public"."doc_status" OWNER TO "postgres";


CREATE TYPE "public"."doc_status_enum" AS ENUM (
    'Ativo',
    'Substituido',
    'Arquivado',
    'Rascunho',
    'ExcluidoLogicamente'
);


ALTER TYPE "public"."doc_status_enum" OWNER TO "postgres";


CREATE TYPE "public"."invoice_delivery_type" AS ENUM (
    'Email',
    'Portal',
    'WhatsApp',
    'Correio',
    'Nao_Envia'
);


ALTER TYPE "public"."invoice_delivery_type" OWNER TO "postgres";


CREATE TYPE "public"."ledger_entry_type" AS ENUM (
    'Cobranca_Recorrente',
    'Insumo_Extra',
    'Ajuste_Credito',
    'Ajuste_Debito',
    'Pagamento_Recebido'
);


ALTER TYPE "public"."ledger_entry_type" OWNER TO "postgres";


CREATE TYPE "public"."ledger_status_type" AS ENUM (
    'Aberto',
    'Pago',
    'Parcial',
    'Vencido',
    'Cancelado',
    'Em_Contestacao'
);


ALTER TYPE "public"."ledger_status_type" OWNER TO "postgres";


CREATE TYPE "public"."oxygen_delivery" AS ENUM (
    'Cateter',
    'Mascara',
    'Venturi',
    'Tenda',
    'VNI',
    'TQT'
);


ALTER TYPE "public"."oxygen_delivery" OWNER TO "postgres";


CREATE TYPE "public"."oxygen_mode" AS ENUM (
    'Cilindro',
    'Concentrador',
    'Rede',
    'Liquido'
);


ALTER TYPE "public"."oxygen_mode" OWNER TO "postgres";


CREATE TYPE "public"."payment_method_type" AS ENUM (
    'Boleto',
    'Pix',
    'Transferencia',
    'Debito_Automatico',
    'Cartao_Credito',
    'Dinheiro',
    'Outro'
);


ALTER TYPE "public"."payment_method_type" OWNER TO "postgres";


CREATE TYPE "public"."relatedness_role" AS ENUM (
    'Familiar',
    'Cuidador',
    'Vizinho',
    'Síndico/Zelador',
    'Amigo',
    'Outro'
);


ALTER TYPE "public"."relatedness_role" OWNER TO "postgres";


CREATE TYPE "public"."renewal_type_enum" AS ENUM (
    'Automatica',
    'Periodo_Fixo',
    'Por_Laudo',
    'Judicial'
);


ALTER TYPE "public"."renewal_type_enum" OWNER TO "postgres";


CREATE TYPE "public"."risk_level" AS ENUM (
    'Baixo',
    'Moderado',
    'Alto'
);


ALTER TYPE "public"."risk_level" OWNER TO "postgres";


CREATE TYPE "public"."scale_model_enum" AS ENUM (
    '12x36',
    '24x48',
    'Visita',
    'Plantao_Avulso',
    'Semanal_5x2',
    'Outro'
);


ALTER TYPE "public"."scale_model_enum" OWNER TO "postgres";


CREATE TYPE "public"."shift_modality_enum" AS ENUM (
    'Continuo',
    'Alternado',
    'Sob_Aviso'
);


ALTER TYPE "public"."shift_modality_enum" OWNER TO "postgres";


CREATE TYPE "public"."shift_status_enum" AS ENUM (
    'scheduled',
    'published',
    'assigned',
    'in_progress',
    'completed',
    'canceled',
    'critical'
);


ALTER TYPE "public"."shift_status_enum" OWNER TO "postgres";


CREATE TYPE "public"."signature_type_enum" AS ENUM (
    'Nenhuma',
    'EletronicaSimples',
    'EletronicaAvancada',
    'ICPBrasil',
    'CarimboTempo'
);


ALTER TYPE "public"."signature_type_enum" OWNER TO "postgres";


CREATE TYPE "public"."storage_provider_enum" AS ENUM (
    'Local',
    'S3',
    'GCS',
    'Supabase',
    'Outro'
);


ALTER TYPE "public"."storage_provider_enum" OWNER TO "postgres";


CREATE TYPE "public"."timeline_event_tone" AS ENUM (
    'default',
    'success',
    'warning',
    'critical'
);


ALTER TYPE "public"."timeline_event_tone" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "app_private"."current_tenant_id"() RETURNS "uuid"
    LANGUAGE "plpgsql" STABLE
    AS $$
BEGIN
  RETURN NULL; -- Substituir por auth.jwt() -> 'tenant_id'
END;
$$;


ALTER FUNCTION "app_private"."current_tenant_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "app_private"."touch_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "app_private"."touch_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."_create_audit_trigger"("tbl" "text", "trg" "text") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
begin
  execute format('drop trigger if exists %I on public.%I', trg, tbl);
  execute format('create trigger %I after insert or update or delete on public.%I for each row execute function public.log_patient_change()', trg, tbl);
end;
$$;


ALTER FUNCTION "public"."_create_audit_trigger"("tbl" "text", "trg" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_audit_trigger"("p_schema" "text", "p_table" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  EXECUTE format('DROP TRIGGER IF EXISTS audit_trigger ON %I.%I;', p_schema, p_table);
  EXECUTE format('CREATE TRIGGER audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON %I.%I
    FOR EACH ROW EXECUTE FUNCTION public.log_row_change();', p_schema, p_table);
END;
$$;


ALTER FUNCTION "public"."create_audit_trigger"("p_schema" "text", "p_table" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_executive_kpis"("start_date" "date", "end_date" "date") RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    total_shifts integer;
    completed_shifts integer;
    missed_shifts integer;
    
    total_revenue numeric(10,2);
    total_cost numeric(10,2);
    
    top_furo_professional text;
    top_furo_count integer;
    
    most_profitable_patient text;
    patient_profit numeric(10,2);
BEGIN
    -- 1. CÁLCULO DE COBERTURA E FUROS
    SELECT 
        count(*),
        count(*) FILTER (WHERE status = 'completed'),
        count(*) FILTER (WHERE status IN ('missed', 'canceled'))
    INTO total_shifts, completed_shifts, missed_shifts
    FROM shifts
    WHERE start_time >= start_date::timestamptz 
      AND start_time <= end_date::timestamptz;

    -- 2. RENTABILIDADE (Receita Estimada - Custo Real)
    -- Receita: Soma do valor unitário do serviço dos plantões realizados
    -- Custo: Soma do payout_value (quanto pagamos ao técnico)
    SELECT 
        COALESCE(SUM(s.unit_price), 0),
        COALESCE(SUM(sh.payout_value), 0)
    INTO total_revenue, total_cost
    FROM shifts sh
    JOIN patient_services s ON sh.service_id = s.id
    WHERE sh.status = 'completed'
      AND sh.start_time >= start_date::timestamptz 
      AND sh.start_time <= end_date::timestamptz;

    -- 3. CAMPEÃO DE FUROS (Quem mais faltou?)
    SELECT 
        p.full_name, count(*)
    INTO top_furo_professional, top_furo_count
    FROM shifts sh
    JOIN professional_profiles p ON sh.professional_id = p.user_id
    WHERE sh.status = 'missed'
      AND sh.start_time >= start_date::timestamptz 
      AND sh.start_time <= end_date::timestamptz
    GROUP BY p.full_name
    ORDER BY count(*) DESC
    LIMIT 1;

    -- 4. PACIENTE MAIS RENTÁVEL
    -- (Simplificado: Receita Bruta por enquanto)
    SELECT 
        pa.full_name, SUM(s.unit_price)
    INTO most_profitable_patient, patient_profit
    FROM shifts sh
    JOIN patient_services s ON sh.service_id = s.id
    JOIN patients pa ON sh.patient_id = pa.id
    WHERE sh.status = 'completed'
      AND sh.start_time >= start_date::timestamptz 
      AND sh.start_time <= end_date::timestamptz
    GROUP BY pa.full_name
    ORDER BY SUM(s.unit_price) DESC
    LIMIT 1;

    -- RETORNO JSON ESTRUTURADO
    RETURN json_build_object(
        'coverage', json_build_object(
            'total', total_shifts,
            'completed', completed_shifts,
            'missed', missed_shifts,
            'rate', CASE WHEN total_shifts > 0 THEN ROUND((completed_shifts::numeric / total_shifts) * 100, 1) ELSE 0 END
        ),
        'finance', json_build_object(
            'revenue', total_revenue,
            'cost', total_cost,
            'profit', total_revenue - total_cost,
            'margin', CASE WHEN total_revenue > 0 THEN ROUND(((total_revenue - total_cost) / total_revenue) * 100, 1) ELSE 0 END
        ),
        'alerts', json_build_object(
            'top_absent_pro', top_furo_professional,
            'top_absent_count', top_furo_count,
            'top_patient', most_profitable_patient,
            'top_patient_value', patient_profit
        )
    );
END;
$$;


ALTER FUNCTION "public"."get_executive_kpis"("start_date" "date", "end_date" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.user_profiles (auth_user_id, email, name, role)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'name', 
    COALESCE(new.raw_user_meta_data->>'role', 'viewer')
  )
  ON CONFLICT (auth_user_id) DO NOTHING;
  RETURN new;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_patient_change"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
  v_action text;
  v_payload jsonb;
  v_patient_id uuid;
  v_entity_id uuid;
begin
  if (TG_OP = 'INSERT') then
    v_action := 'CREATE';
    v_payload := to_jsonb(NEW);
  elsif (TG_OP = 'UPDATE') then
    v_action := 'UPDATE';
    v_payload := jsonb_build_object('before', to_jsonb(OLD),'after', to_jsonb(NEW));
  elsif (TG_OP = 'DELETE') then
    v_action := 'DELETE';
    v_payload := to_jsonb(OLD);
  end if;

  case TG_TABLE_NAME
    when 'patients' then v_patient_id := coalesce(NEW.id, OLD.id);
    when 'patient_addresses' then v_patient_id := coalesce(NEW.patient_id, OLD.patient_id);
    when 'patient_clinical_profiles' then v_patient_id := coalesce(NEW.patient_id, OLD.patient_id);
    when 'patient_financial_profiles' then v_patient_id := coalesce(NEW.patient_id, OLD.patient_id);
    when 'patient_administrative_profiles' then v_patient_id := coalesce(NEW.patient_id, OLD.patient_id);
    when 'patient_documents' then v_patient_id := coalesce(NEW.patient_id, OLD.patient_id);
    when 'patient_inventory' then v_patient_id := coalesce(NEW.patient_id, OLD.patient_id);
    when 'shifts' then v_patient_id := coalesce(NEW.patient_id, OLD.patient_id);
    when 'patient_schedule_settings' then v_patient_id := coalesce(NEW.patient_id, OLD.patient_id);
    when 'care_team_members' then v_patient_id := coalesce(NEW.patient_id, OLD.patient_id);
    when 'patient_emergency_contacts' then v_patient_id := coalesce(NEW.patient_id, OLD.patient_id);
    when 'patient_services' then v_patient_id := coalesce(NEW.patient_id, OLD.patient_id);
    when 'patient_medications' then v_patient_id := coalesce(NEW.patient_id, OLD.patient_id);
    when 'patient_household_members' then v_patient_id := coalesce(NEW.patient_id, OLD.patient_id);
    when 'patient_domiciles' then v_patient_id := coalesce(NEW.patient_id, OLD.patient_id);
    else v_patient_id := null;
  end case;

  begin
    v_entity_id := coalesce(NEW.id, OLD.id)::uuid;
  exception when others then
    v_entity_id := null;
  end;

  begin
    insert into public.system_audit_logs (entity_table, entity_id, parent_patient_id, action, changes)
    values (TG_TABLE_NAME, v_entity_id, v_patient_id, v_action::text::public.audit_action_type, v_payload);
  exception when others then
    perform pg_notify('audit_error', json_build_object('table',TG_TABLE_NAME,'error',sqlerrm)::text);
  end;

  if (TG_OP = 'DELETE') then
    return OLD;
  else
    return NEW;
  end if;
end;
$$;


ALTER FUNCTION "public"."log_patient_change"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_row_change"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_actor uuid;
  v_action public.audit_action_type := NULL; -- detected enum
  v_entity_id uuid := NULL;
  v_changes jsonb;
  v_tenant uuid := NULL;
BEGIN
  -- actor: try auth.uid(), fallback to jwt sub
  BEGIN
    v_actor := NULL;
    BEGIN
      v_actor := (SELECT auth.uid());
    EXCEPTION WHEN OTHERS THEN
      v_actor := NULL;
    END;
    IF v_actor IS NULL THEN
      BEGIN
        v_actor := (auth.jwt() ->> 'sub')::uuid;
      EXCEPTION WHEN OTHERS THEN
        v_actor := NULL;
      END;
    END IF;
  END;

  -- action: cast TG_OP to detected enum type
  BEGIN
    v_action := TG_OP::text::public.audit_action_type;
  EXCEPTION WHEN OTHERS THEN
    v_action := NULL;
  END;

  -- entity id
  IF TG_OP = 'DELETE' THEN
    BEGIN
      v_entity_id := (OLD.id)::uuid;
    EXCEPTION WHEN OTHERS THEN
      v_entity_id := NULL;
    END;
    v_changes := jsonb_build_object('old', to_jsonb(OLD));
  ELSE
    BEGIN
      v_entity_id := (NEW.id)::uuid;
    EXCEPTION WHEN OTHERS THEN
      v_entity_id := NULL;
    END;
    v_changes := jsonb_build_object('new', to_jsonb(NEW));
  END IF;

  -- tenant: prefer NEW.tenant_id, else session setting
  BEGIN
    IF TG_OP = 'DELETE' THEN
      v_tenant := NULL;
      BEGIN
        v_tenant := (OLD.tenant_id)::uuid;
      EXCEPTION WHEN OTHERS THEN
        v_tenant := NULL;
      END;
    ELSE
      BEGIN
        v_tenant := (NEW.tenant_id)::uuid;
      EXCEPTION WHEN OTHERS THEN
        v_tenant := NULL;
      END;
    END IF;
    IF v_tenant IS NULL THEN
      BEGIN
        v_tenant := current_setting('app.current_tenant', true)::uuid;
      EXCEPTION WHEN OTHERS THEN
        v_tenant := NULL;
      END;
    END IF;
  END;

  -- Attempt to insert into existing audit table
  BEGIN
    INSERT INTO public.system_audit_logs(
      tenant_id, actor_id, ip_address, user_agent, action, entity_table, entity_id, changes, reason, route_path, created_at
    )
    VALUES (
      v_tenant, v_actor, NULL, NULL, v_action, TG_TABLE_NAME, v_entity_id, v_changes, NULL, NULL, now()
    );
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO public.system_audit_errors(context, payload, err)
    VALUES (TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME || ' ' || TG_OP,
      jsonb_build_object('old', CASE WHEN OLD IS NULL THEN NULL ELSE to_jsonb(OLD) END, 'new', CASE WHEN NEW IS NULL THEN NULL ELSE to_jsonb(NEW) END),
      SQLERRM
    );
    PERFORM pg_notify('audit_error', json_build_object('table', TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME, 'op', TG_OP, 'err', SQLERRM)::text);
  END;

  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."log_row_change"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_patient_guardian_flag"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_patient_id UUID;
    v_count INTEGER;
    v_pending INTEGER;
    v_status TEXT;
BEGIN
    -- CORREÇÃO: Pega o ID correto dependendo se é INSERT/UPDATE (NEW) ou DELETE (OLD)
    v_patient_id := COALESCE(NEW.patient_id, OLD.patient_id);

    -- Conta quantos responsáveis legais existem para este paciente
    SELECT COUNT(*) INTO v_count
    FROM public.patient_related_persons
    WHERE patient_id = v_patient_id AND is_legal_guardian = true;

    -- Verifica se algum tem dados incompletos
    SELECT COUNT(*) INTO v_pending
    FROM public.patient_related_persons
    WHERE patient_id = v_patient_id 
      AND is_legal_guardian = true 
      AND (cpf IS NULL OR phone_primary IS NULL);

    -- Define o status
    IF v_count > 0 THEN
        IF v_pending > 0 THEN
            v_status := 'Cadastro Pendente';
        ELSE
            v_status := 'Cadastro OK';
        END IF;
        
        UPDATE public.patients 
        SET has_legal_guardian = TRUE, 
            legal_guardian_status = v_status
        WHERE id = v_patient_id;
    ELSE
        -- Se apagou o último responsável
        UPDATE public.patients 
        SET has_legal_guardian = FALSE, 
            legal_guardian_status = 'Nao possui'
        WHERE id = v_patient_id;
    END IF;

    -- Retorna NEW para Insert/Update ou OLD para Delete (necessário para trigger)
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$;


ALTER FUNCTION "public"."update_patient_guardian_flag"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."billing_batches" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" DEFAULT "app_private"."current_tenant_id"(),
    "contractor_id" "uuid" NOT NULL,
    "competence_month" "date" NOT NULL,
    "status" "text" DEFAULT 'open'::"text",
    "total_amount" numeric(10,2) DEFAULT 0,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "billing_batches_status_check" CHECK (("status" = ANY (ARRAY['open'::"text", 'closed'::"text", 'invoiced'::"text", 'paid'::"text"])))
);


ALTER TABLE "public"."billing_batches" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."care_team_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "patient_id" "uuid" NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "professional_id" "uuid" NOT NULL,
    "user_profile_id" "uuid",
    "role_in_case" "public"."care_team_role" NOT NULL,
    "is_reference_professional" boolean DEFAULT false,
    "regime" "public"."care_team_regime" DEFAULT 'Fixo'::"public"."care_team_regime",
    "work_window_summary" "text",
    "status" "text" DEFAULT 'Ativo'::"text" NOT NULL,
    "start_date" "date" DEFAULT CURRENT_DATE,
    "end_date" "date",
    "contact_info_override" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "professional_category" "text",
    "is_technical_responsible" boolean DEFAULT false,
    "is_family_focal_point" boolean DEFAULT false,
    "contact_email" "text",
    "contact_phone" "text",
    "work_window" "text",
    "employment_type" "text",
    "internal_extension" "text",
    "corporate_cell" "text",
    "profissional_nome" "text",
    CONSTRAINT "care_team_members_professional_category_check" CHECK ((("professional_category" = ANY (ARRAY['Medico'::"text", 'Enfermeiro'::"text", 'TecnicoEnfermagem'::"text", 'Fisioterapeuta'::"text", 'Nutricionista'::"text", 'Psicologo'::"text", 'AssistenteSocial'::"text", 'Cuidador'::"text", 'Fonoaudiologo'::"text", 'TerapeutaOcupacional'::"text", 'Outro'::"text"])) OR ("professional_category" IS NULL))),
    CONSTRAINT "check_employment" CHECK ((("employment_type" = ANY (ARRAY['CLT'::"text", 'PJ'::"text", 'Cooperado'::"text", 'Terceirizado'::"text", 'Autonomo'::"text", 'Outro'::"text"])) OR ("employment_type" IS NULL))),
    CONSTRAINT "check_employment_type" CHECK ((("employment_type" = ANY (ARRAY['CLT'::"text", 'PJ'::"text", 'Cooperado'::"text", 'Terceirizado'::"text", 'Autonomo'::"text", 'Outro'::"text"])) OR ("employment_type" IS NULL))),
    CONSTRAINT "check_prof_category" CHECK ((("professional_category" = ANY (ARRAY['Medico'::"text", 'Enfermeiro'::"text", 'TecEnf'::"text", 'Fisio'::"text", 'Fono'::"text", 'Nutri'::"text", 'Psicologo'::"text", 'Terapeuta'::"text", 'Cuidador'::"text", 'Outro'::"text"])) OR ("professional_category" IS NULL))),
    CONSTRAINT "check_professional_category" CHECK ((("professional_category" = ANY (ARRAY['Medico'::"text", 'Enfermeiro'::"text", 'TecEnf'::"text", 'Fisio'::"text", 'Fono'::"text", 'Nutri'::"text", 'Psicologo'::"text", 'Terapeuta'::"text", 'Cuidador'::"text", 'Outro'::"text"])) OR ("professional_category" IS NULL))),
    CONSTRAINT "check_status_vinculo" CHECK ((("status" = ANY (ARRAY['Ativo'::"text", 'Afastado'::"text", 'Encerrado'::"text", 'Standby'::"text"])) OR ("status" IS NULL))),
    CONSTRAINT "check_team_status" CHECK ((("status" = ANY (ARRAY['Ativo'::"text", 'Afastado'::"text", 'Encerrado'::"text", 'Standby'::"text"])) OR ("status" IS NULL)))
);


ALTER TABLE "public"."care_team_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."contractors" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" DEFAULT "app_private"."current_tenant_id"(),
    "name" "text" NOT NULL,
    "commercial_name" "text",
    "document_number" "text",
    "type" "text" NOT NULL,
    "billing_due_days" integer DEFAULT 30,
    "integration_code" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "contractors_type_check" CHECK (("type" = ANY (ARRAY['health_plan'::"text", 'public_entity'::"text", 'private_individual'::"text"])))
);


ALTER TABLE "public"."contractors" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."financial_ledger_entries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "patient_id" "uuid" NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "entry_type" "text" NOT NULL,
    "description" "text" NOT NULL,
    "amount_due" numeric NOT NULL,
    "amount_paid" numeric DEFAULT 0,
    "due_date" "date" NOT NULL,
    "paid_at" timestamp with time zone,
    "status" "text" DEFAULT 'pending'::"text",
    "invoice_number" "text",
    "payment_method" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "reference_period" "date",
    CONSTRAINT "check_ledger_status" CHECK (("status" = ANY (ARRAY['Aberto'::"text", 'Pago'::"text", 'Parcial'::"text", 'Vencido'::"text", 'Cancelado'::"text", 'Em_Contestacao'::"text"]))),
    CONSTRAINT "check_ledger_type" CHECK (("entry_type" = ANY (ARRAY['Cobranca_Recorrente'::"text", 'Insumo_Extra'::"text", 'Ajuste_Credito'::"text", 'Ajuste_Debito'::"text", 'Pagamento_Recebido'::"text"])))
);


ALTER TABLE "public"."financial_ledger_entries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."financial_records" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" DEFAULT "app_private"."current_tenant_id"(),
    "billing_batch_id" "uuid",
    "contractor_id" "uuid",
    "type" "text" NOT NULL,
    "amount" numeric(10,2) NOT NULL,
    "due_date" "date" NOT NULL,
    "payment_date" "date",
    "status" "text" DEFAULT 'pending'::"text",
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "patient_id" "uuid",
    CONSTRAINT "financial_records_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'paid'::"text", 'overdue'::"text", 'canceled'::"text"]))),
    CONSTRAINT "financial_records_type_check" CHECK (("type" = ANY (ARRAY['receivable'::"text", 'payable'::"text"])))
);


ALTER TABLE "public"."financial_records" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."integration_configs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" DEFAULT "app_private"."current_tenant_id"(),
    "provider" "text" NOT NULL,
    "environment" "text" DEFAULT 'sandbox'::"text",
    "api_key" "text",
    "api_secret" "text",
    "webhook_url" "text",
    "is_active" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "integration_configs_environment_check" CHECK (("environment" = ANY (ARRAY['sandbox'::"text", 'production'::"text"]))),
    CONSTRAINT "integration_configs_provider_check" CHECK (("provider" = ANY (ARRAY['conta_azul'::"text", 'pagar_me'::"text", 'celcoin'::"text", 'asaas'::"text"])))
);


ALTER TABLE "public"."integration_configs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."inventory_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" DEFAULT "app_private"."current_tenant_id"(),
    "name" "text" NOT NULL,
    "sku" "text",
    "category" "text",
    "is_trackable" boolean DEFAULT false,
    "unit_of_measure" "text",
    "brand" "text",
    "model" "text",
    "description" "text",
    "min_stock_level" integer DEFAULT 10
);


ALTER TABLE "public"."inventory_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."inventory_movements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "item_id" "uuid" NOT NULL,
    "patient_id" "uuid",
    "movement_type" "text" NOT NULL,
    "quantity" numeric NOT NULL,
    "related_asset_id" "uuid",
    "performed_by" "uuid",
    "performed_at" timestamp with time zone DEFAULT "now"(),
    "notes" "text"
);


ALTER TABLE "public"."inventory_movements" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."patient_addresses" (
    "patient_id" "uuid" NOT NULL,
    "street" "text" NOT NULL,
    "number" "text" NOT NULL,
    "neighborhood" "text" NOT NULL,
    "city" "text" NOT NULL,
    "state" "text" NOT NULL,
    "zip_code" "text",
    "complement" "text",
    "reference_point" "text",
    "zone_type" "text",
    "facade_image_url" "text",
    "allowed_visit_hours" "text",
    "travel_notes" "text",
    "eta_minutes" integer,
    "property_type" "text",
    "condo_name" "text",
    "block_tower" "text",
    "floor_number" integer,
    "unit_number" "text",
    "elevator_status" "text",
    "wheelchair_access" "text",
    "street_access_type" "text",
    "external_stairs" "text",
    "has_24h_concierge" boolean DEFAULT false,
    "concierge_contact" "text",
    "area_risk_type" "text",
    "cell_signal_quality" "text",
    "power_outlets_desc" "text",
    "equipment_space" "text",
    "geo_latitude" numeric,
    "geo_longitude" numeric,
    "ambulance_access" "text",
    "parking" "text",
    "entry_procedure" "text",
    "night_access_risk" "text",
    "has_wifi" boolean DEFAULT false,
    "has_smokers" boolean DEFAULT false,
    "animal_behavior" "text",
    "bed_type" "text",
    "mattress_type" "text",
    "electric_infra" "text",
    "backup_power" "text",
    "water_source" "text",
    "adapted_bathroom" boolean DEFAULT false,
    "pets_description" "text",
    "backup_power_desc" "text",
    "general_observations" "text",
    CONSTRAINT "check_ambulance_access" CHECK ((("ambulance_access" = ANY (ARRAY['Total'::"text", 'Parcial'::"text", 'Dificil'::"text", 'Nao_acessa'::"text", 'Nao_informado'::"text"])) OR ("ambulance_access" IS NULL))),
    CONSTRAINT "check_animal_behavior" CHECK ((("animal_behavior" = ANY (ARRAY['Doces'::"text", 'Bravos'::"text", 'Necessitam_contencao'::"text", 'Nao_informado'::"text"])) OR ("animal_behavior" IS NULL))),
    CONSTRAINT "check_backup_power" CHECK ((("backup_power" = ANY (ARRAY['Nenhuma'::"text", 'Gerador'::"text", 'Nobreak'::"text", 'Outros'::"text", 'Nao_informado'::"text"])) OR ("backup_power" IS NULL))),
    CONSTRAINT "check_bed_type" CHECK ((("bed_type" = ANY (ARRAY['Hospitalar'::"text", 'Articulada'::"text", 'Comum'::"text", 'Colchao_no_chao'::"text", 'Outro'::"text", 'Nao_informado'::"text"])) OR ("bed_type" IS NULL))),
    CONSTRAINT "check_cell_signal" CHECK ((("cell_signal_quality" = ANY (ARRAY['Bom'::"text", 'Razoavel'::"text", 'Ruim'::"text", 'Nao_informado'::"text"])) OR ("cell_signal_quality" IS NULL))),
    CONSTRAINT "check_electric_infra" CHECK ((("electric_infra" = ANY (ARRAY['110'::"text", '220'::"text", 'Bivolt'::"text", 'Nao_informada'::"text"])) OR ("electric_infra" IS NULL))),
    CONSTRAINT "check_elevator_status" CHECK ((("elevator_status" = ANY (ARRAY['Nao_tem'::"text", 'Tem_nao_comporta_maca'::"text", 'Tem_comporta_maca'::"text", 'Nao_informado'::"text"])) OR ("elevator_status" IS NULL))),
    CONSTRAINT "check_equipment_space" CHECK ((("equipment_space" = ANY (ARRAY['Adequado'::"text", 'Restrito'::"text", 'Critico'::"text", 'Nao_avaliado'::"text"])) OR ("equipment_space" IS NULL))),
    CONSTRAINT "check_mattress_type" CHECK ((("mattress_type" = ANY (ARRAY['Pneumatico'::"text", 'Viscoelastico'::"text", 'Espuma_comum'::"text", 'Mola'::"text", 'Outro'::"text", 'Nao_informado'::"text"])) OR ("mattress_type" IS NULL))),
    CONSTRAINT "check_night_access_risk" CHECK ((("night_access_risk" = ANY (ARRAY['Baixo'::"text", 'Medio'::"text", 'Alto'::"text", 'Nao_avaliado'::"text"])) OR ("night_access_risk" IS NULL))),
    CONSTRAINT "check_property_type" CHECK ((("property_type" = ANY (ARRAY['Casa'::"text", 'Apartamento'::"text", 'Chacara_Sitio'::"text", 'ILPI'::"text", 'Pensão'::"text", 'Comercial'::"text", 'Outro'::"text", 'Nao_informado'::"text"])) OR ("property_type" IS NULL))),
    CONSTRAINT "check_state_format" CHECK ((("state" ~ '^[A-Z]{2}$'::"text") OR ("state" IS NULL))),
    CONSTRAINT "check_street_access_type" CHECK ((("street_access_type" = ANY (ARRAY['Rua_larga'::"text", 'Rua_estreita'::"text", 'Rua_sem_saida'::"text", 'Viela'::"text", 'Nao_informado'::"text"])) OR ("street_access_type" IS NULL))),
    CONSTRAINT "check_water_source" CHECK ((("water_source" = ANY (ARRAY['Rede_publica'::"text", 'Poco_artesiano'::"text", 'Cisterna'::"text", 'Outro'::"text", 'Nao_informado'::"text"])) OR ("water_source" IS NULL))),
    CONSTRAINT "check_wheelchair_access" CHECK ((("wheelchair_access" = ANY (ARRAY['Livre'::"text", 'Com_restricao'::"text", 'Incompativel'::"text", 'Nao_avaliado'::"text"])) OR ("wheelchair_access" IS NULL))),
    CONSTRAINT "check_zone_type" CHECK ((("zone_type" = ANY (ARRAY['Urbana'::"text", 'Rural'::"text", 'Periurbana'::"text", 'Comunidade'::"text", 'Risco'::"text", 'Nao_informada'::"text"])) OR ("zone_type" IS NULL))),
    CONSTRAINT "patient_addresses_zone_type_check" CHECK (("zone_type" = ANY (ARRAY['Urbana'::"text", 'Rural'::"text", 'Comunidade'::"text", 'Risco'::"text"])))
);


ALTER TABLE "public"."patient_addresses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."patient_admin_info" (
    "patient_id" "uuid" NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'Ativo'::"text",
    "admission_type" "text",
    "complexity" "text",
    "service_package" "text",
    "start_date" "date",
    "end_date" "date",
    "supervisor_id" "uuid",
    "escalista_id" "uuid",
    "nurse_responsible_id" "uuid",
    "frequency" "text",
    "operation_area" "text",
    "admission_source" "text",
    "contract_id" "text",
    "notes_internal" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "demand_origin" "text",
    "primary_payer_type" "text",
    "contract_start_date" "date",
    "contract_end_date" "date",
    "renewal_type" "public"."renewal_type_enum",
    "external_contract_id" "text",
    "authorization_number" "text",
    "judicial_case_number" "text",
    "status_reason" "text",
    "status_changed_at" timestamp with time zone,
    "commercial_responsible_id" "uuid",
    "contract_manager_id" "uuid",
    "scale_rule_start_date" "date",
    "scale_rule_end_date" "date",
    "scale_mode" "text",
    "scale_notes" "text",
    "chk_contract_ok" boolean DEFAULT false,
    "chk_contract_at" "date",
    "chk_contract_by" "text",
    "chk_consent_ok" boolean DEFAULT false,
    "chk_consent_at" "date",
    "chk_consent_by" "text",
    "chk_medical_report_ok" boolean DEFAULT false,
    "chk_medical_report_at" "date",
    "chk_medical_report_by" "text",
    "chk_legal_docs_ok" boolean DEFAULT false,
    "chk_financial_docs_ok" boolean DEFAULT false,
    "chk_judicial_ok" boolean DEFAULT false,
    "checklist_notes" "text",
    "effective_discharge_date" "date",
    "service_package_description" "text",
    "demand_origin_description" "text",
    "official_letter_number" "text",
    "contract_status_reason" "text",
    "admin_notes" "text",
    "cost_center_id" "text",
    "erp_case_code" "text",
    "contract_category" "public"."contract_category_enum",
    "acquisition_channel" "text",
    "payer_admin_contact_id" "uuid",
    "primary_payer_description" "text",
    "scale_model" "public"."scale_model_enum",
    "shift_modality" "public"."shift_modality_enum",
    "base_professional_category" "text",
    "quantity_per_shift" integer DEFAULT 1,
    "weekly_hours_expected" numeric,
    "day_shift_start" time without time zone,
    "night_shift_start" time without time zone,
    "includes_weekends" boolean DEFAULT true,
    "holiday_rule" "text",
    "auto_generate_scale" boolean DEFAULT false,
    "chk_address_proof_ok" boolean DEFAULT false,
    "chk_legal_guardian_docs_ok" boolean DEFAULT false,
    "chk_financial_responsible_docs_ok" boolean DEFAULT false,
    "checklist_complete" boolean DEFAULT false,
    "checklist_notes_detailed" "text",
    "service_package_name" "text",
    "contract_status_enum" "text",
    "primary_payer_related_person_id" "uuid",
    "primary_payer_legal_entity_id" "uuid",
    "chk_address_proof_at" timestamp with time zone,
    "chk_address_proof_by" "uuid",
    "chk_legal_guardian_docs_at" timestamp with time zone,
    "chk_legal_guardian_docs_by" "uuid",
    "chk_financial_responsible_docs_at" timestamp with time zone,
    "chk_financial_responsible_docs_by" "uuid",
    "chk_other_docs_ok" boolean DEFAULT false,
    "chk_other_docs_desc" "text",
    "chk_other_docs_at" timestamp with time zone,
    "chk_other_docs_by" "uuid",
    "day_shift_end" time without time zone,
    "night_shift_end" time without time zone,
    "reference_location_id" "uuid",
    "chk_contract_doc_id" "uuid",
    "chk_consent_doc_id" "uuid",
    "chk_medical_report_doc_id" "uuid",
    "chk_address_proof_doc_id" "uuid",
    "chk_legal_docs_doc_id" "uuid",
    "chk_financial_docs_doc_id" "uuid",
    "chk_judicial_doc_id" "uuid",
    "payer_admin_contact_description" "text",
    "chk_judicial_at" timestamp with time zone,
    "chk_judicial_by" "uuid",
    CONSTRAINT "check_base_prof" CHECK ((("base_professional_category" = ANY (ARRAY['Medico'::"text", 'Enfermeiro'::"text", 'TecEnf'::"text", 'Fisio'::"text", 'Fono'::"text", 'Nutri'::"text", 'Psicologo'::"text", 'Terapeuta'::"text", 'Cuidador'::"text"])) OR ("base_professional_category" IS NULL))),
    CONSTRAINT "check_contract_status" CHECK ((("contract_status_enum" = ANY (ARRAY['Proposta'::"text", 'Em_Implantacao'::"text", 'Ativo'::"text", 'Suspenso'::"text", 'Encerrado'::"text", 'Cancelado'::"text", 'Recusado'::"text"])) OR ("contract_status_enum" IS NULL))),
    CONSTRAINT "check_payer_type" CHECK ((("primary_payer_type" = ANY (ARRAY['Operadora'::"text", 'PessoaFisica'::"text", 'Empresa'::"text", 'OrgaoPublico'::"text", 'Outro'::"text"])) OR ("primary_payer_type" IS NULL)))
);


ALTER TABLE "public"."patient_admin_info" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."patient_administrative_profiles" (
    "patient_id" "uuid" NOT NULL,
    "admission_date" "date" DEFAULT CURRENT_DATE,
    "discharge_prediction_date" "date",
    "discharge_date" "date",
    "admission_type" "text",
    "service_package_name" "text",
    "contract_number" "text",
    "contract_status" "text" DEFAULT 'active'::"text",
    "technical_supervisor_name" "text",
    "administrative_contact_name" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "patient_administrative_profiles_admission_type_check" CHECK (("admission_type" = ANY (ARRAY['home_care'::"text", 'paliativo'::"text", 'procedimento_pontual'::"text", 'reabilitacao'::"text"]))),
    CONSTRAINT "patient_administrative_profiles_contract_status_check" CHECK (("contract_status" = ANY (ARRAY['active'::"text", 'suspended'::"text", 'expired'::"text", 'negotiating'::"text"])))
);


ALTER TABLE "public"."patient_administrative_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."patient_allergies" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "patient_id" "uuid" NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "allergen" "text" NOT NULL,
    "reaction" "text",
    "severity" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."patient_allergies" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."patient_assigned_assets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "patient_id" "uuid" NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "item_id" "uuid" NOT NULL,
    "serial_number" "text",
    "asset_tag" "text",
    "assigned_at" "date" DEFAULT CURRENT_DATE,
    "status" "text" DEFAULT 'Em Uso'::"text",
    "location_in_home" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."patient_assigned_assets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."patient_civil_documents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "patient_id" "uuid" NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "doc_type" "text" NOT NULL,
    "doc_number" "text" NOT NULL,
    "issuer" "text",
    "issued_at" "date",
    "valid_until" "date",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "issuer_country" "text" DEFAULT 'Brasil'::"text",
    CONSTRAINT "check_doc_type" CHECK (("doc_type" = ANY (ARRAY['Passaporte'::"text", 'RNE'::"text", 'CNH'::"text", 'Outro'::"text"])))
);


ALTER TABLE "public"."patient_civil_documents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."patient_clinical_profiles" (
    "patient_id" "uuid" NOT NULL,
    "complexity_level" "text",
    "clinical_tags" "text"[],
    "diagnosis_main" "text",
    "allergies" "text"[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "diagnosis_secondary" "text"[],
    "risk_braden" integer DEFAULT 0,
    "risk_morse" integer DEFAULT 0,
    "fall_risk" "text",
    "oxygen_usage" boolean DEFAULT false,
    "oxygen_flow" "text",
    "oxygen_equipment" "text",
    "clinical_summary_note" "text",
    CONSTRAINT "patient_clinical_profiles_complexity_level_check" CHECK (("complexity_level" = ANY (ARRAY['low'::"text", 'medium'::"text", 'high'::"text", 'critical'::"text"]))),
    CONSTRAINT "patient_clinical_profiles_fall_risk_check" CHECK (("fall_risk" = ANY (ARRAY['Baixo'::"text", 'Moderado'::"text", 'Alto'::"text"])))
);


ALTER TABLE "public"."patient_clinical_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."patient_clinical_summaries" (
    "patient_id" "uuid" NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "summary" "jsonb" DEFAULT '{}'::"jsonb",
    "meta" "jsonb" DEFAULT '{}'::"jsonb",
    "primary_diagnosis_cid" "text",
    "primary_diagnosis_description" "text",
    "complexity_level" "public"."complexity_level" DEFAULT 'Media'::"public"."complexity_level",
    "clinical_summary_text" "text",
    "blood_type" "text",
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "last_clinical_update_at" timestamp with time zone DEFAULT "now"(),
    "reference_professional_id" "uuid"
);


ALTER TABLE "public"."patient_clinical_summaries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."patient_consumables_stock" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "patient_id" "uuid" NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "item_id" "uuid" NOT NULL,
    "current_quantity" numeric DEFAULT 0 NOT NULL,
    "min_quantity_threshold" numeric DEFAULT 0,
    "avg_daily_consumption" numeric,
    "last_replenishment_at" "date",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."patient_consumables_stock" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."patient_devices" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "patient_id" "uuid" NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "device_type" "text" NOT NULL,
    "description" "text",
    "installed_at" "date",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."patient_devices" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."patient_document_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "document_id" "uuid" NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "happened_at" timestamp with time zone DEFAULT "now"(),
    "user_id" "uuid",
    "action" "text" NOT NULL,
    "details" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."patient_document_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."patient_documents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "patient_id" "uuid" NOT NULL,
    "file_name" "text" NOT NULL,
    "file_path" "text" NOT NULL,
    "file_size_bytes" bigint,
    "mime_type" "text",
    "title" "text" NOT NULL,
    "category" "text" NOT NULL,
    "description" "text",
    "tags" "text"[],
    "is_verified" boolean DEFAULT false,
    "verified_at" timestamp with time zone,
    "verified_by" "uuid",
    "expires_at" "date",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "domain_type" "public"."doc_domain" DEFAULT 'Administrativo'::"public"."doc_domain",
    "subcategory" "text",
    "source_module" "public"."doc_source" DEFAULT 'Ficha'::"public"."doc_source",
    "file_name_original" "text",
    "file_extension" "text",
    "file_hash" "text",
    "version" integer DEFAULT 1,
    "contract_id" "text",
    "financial_record_id" "uuid",
    "clinical_event_id" "uuid",
    "is_visible_clinical" boolean DEFAULT true,
    "is_visible_admin" boolean DEFAULT true,
    "is_confidential" boolean DEFAULT false,
    "min_role_level" "text",
    "status" "public"."doc_status" DEFAULT 'Ativo'::"public"."doc_status",
    "last_updated_by" "uuid",
    "last_updated_at" timestamp with time zone DEFAULT "now"(),
    "internal_notes" "text",
    "external_ref" "text",
    "storage_provider" "public"."storage_provider_enum" DEFAULT 'Supabase'::"public"."storage_provider_enum",
    "storage_path" "text",
    "original_file_name" "text",
    "previous_document_id" "uuid",
    "origin_module" "public"."doc_origin_enum" DEFAULT 'Ficha_Documentos'::"public"."doc_origin_enum",
    "admin_contract_id" "text",
    "finance_entry_id" "uuid",
    "clinical_visit_id" "uuid",
    "clinical_evolution_id" "uuid",
    "prescription_id" "uuid",
    "related_object_id" "uuid",
    "clinical_visible" boolean DEFAULT true,
    "admin_fin_visible" boolean DEFAULT true,
    "min_access_role" "text" DEFAULT 'Basico'::"text",
    "document_status" "public"."doc_status_enum" DEFAULT 'Ativo'::"public"."doc_status_enum",
    "uploaded_by" "uuid",
    "deleted_at" timestamp with time zone,
    "deleted_by" "uuid",
    "signature_type" "public"."signature_type_enum" DEFAULT 'Nenhuma'::"public"."signature_type_enum",
    "signature_date" timestamp with time zone,
    "signature_summary" "text",
    "external_signature_id" "text",
    "public_notes" "text",
    "signed_at" timestamp with time zone,
    "signers_summary" "text",
    "uploaded_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "extension" "text",
    "tenant_id" "uuid",
    CONSTRAINT "patient_documents_category_check" CHECK (("category" = ANY (ARRAY['identity'::"text", 'legal'::"text", 'financial'::"text", 'clinical'::"text", 'consent'::"text", 'other'::"text"])))
);


ALTER TABLE "public"."patient_documents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."patient_domiciles" (
    "patient_id" "uuid" NOT NULL,
    "ambulance_access" "text",
    "team_parking" "text",
    "night_access_risk" "text" DEFAULT 'Baixo'::"text",
    "gate_identification" "text",
    "entry_procedure" "text",
    "ventilation" "text",
    "lighting_quality" "text",
    "noise_level" "text",
    "bed_type" "text",
    "mattress_type" "text",
    "voltage" "text",
    "backup_power_source" "text",
    "has_wifi" boolean DEFAULT false,
    "water_source" "text",
    "has_smokers" boolean DEFAULT false,
    "hygiene_conditions" "text" DEFAULT 'Boa'::"text",
    "pets_description" "text",
    "animals_behavior" "text",
    "general_observations" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "patient_domiciles_night_access_risk_check" CHECK (("night_access_risk" = ANY (ARRAY['Baixo'::"text", 'Médio'::"text", 'Alto'::"text"])))
);


ALTER TABLE "public"."patient_domiciles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."patient_financial_profiles" (
    "patient_id" "uuid" NOT NULL,
    "bond_type" "text",
    "insurer_name" "text",
    "plan_name" "text",
    "insurance_card_number" "text",
    "insurance_card_validity" "date",
    "monthly_fee" numeric(10,2) DEFAULT 0,
    "billing_due_day" integer,
    "payment_method" "text",
    "financial_responsible_name" "text",
    "financial_responsible_contact" "text",
    "billing_status" "text" DEFAULT 'active'::"text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "card_holder_name" "text",
    "grace_period_days" integer DEFAULT 0,
    "payment_terms" "text",
    "billing_model" "text",
    "billing_base_value" numeric,
    "billing_periodicity" "text",
    "copay_percent" numeric,
    "readjustment_index" "text",
    "readjustment_month" integer,
    "late_fee_percent" numeric DEFAULT 0,
    "daily_interest_percent" numeric DEFAULT 0,
    "discount_early_payment" numeric DEFAULT 0,
    "discount_days_limit" integer,
    "payer_relation" "text",
    "billing_email_list" "text",
    "billing_phone" "text",
    "invoice_delivery_method" "text",
    "tenant_id" "uuid",
    "payer_type" "text",
    "payer_name" "text",
    "payer_doc_type" "text",
    "payer_doc_number" "text",
    "billing_cep" "text",
    "billing_street" "text",
    "billing_number" "text",
    "billing_neighborhood" "text",
    "billing_city" "text",
    "billing_state" "text",
    "due_day" integer,
    "responsible_related_person_id" "uuid",
    "receiving_account_info" "text",
    CONSTRAINT "check_billing_model" CHECK ((("billing_model" = ANY (ARRAY['Mensalidade'::"text", 'Diaria'::"text", 'Plantao_12h'::"text", 'Plantao_24h'::"text", 'Visita'::"text", 'Pacote_Fechado'::"text", 'Outro'::"text"])) OR ("billing_model" IS NULL))),
    CONSTRAINT "check_delivery_method" CHECK ((("invoice_delivery_method" = ANY (ARRAY['Email'::"text", 'Portal'::"text", 'WhatsApp'::"text", 'Correio'::"text", 'Nao_Envia'::"text"])) OR ("invoice_delivery_method" IS NULL))),
    CONSTRAINT "check_payment_method" CHECK ((("payment_method" = ANY (ARRAY['Boleto'::"text", 'Pix'::"text", 'Transferencia'::"text", 'Debito_Automatico'::"text", 'Cartao_Credito'::"text", 'Dinheiro'::"text", 'Outro'::"text"])) OR ("payment_method" IS NULL))),
    CONSTRAINT "patient_financial_profiles_billing_due_day_check" CHECK ((("billing_due_day" >= 1) AND ("billing_due_day" <= 31))),
    CONSTRAINT "patient_financial_profiles_billing_status_check" CHECK (("billing_status" = ANY (ARRAY['active'::"text", 'suspended'::"text", 'defaulting'::"text"]))),
    CONSTRAINT "patient_financial_profiles_bond_type_check" CHECK (("bond_type" = ANY (ARRAY['Plano de Saúde'::"text", 'Particular'::"text", 'Convênio'::"text", 'Público'::"text"])))
);


ALTER TABLE "public"."patient_financial_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."patient_household_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "patient_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "role" "text" NOT NULL,
    "type" "text" NOT NULL,
    "schedule_note" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "patient_household_members_type_check" CHECK (("type" = ANY (ARRAY['resident'::"text", 'caregiver'::"text"])))
);


ALTER TABLE "public"."patient_household_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."patient_inventory" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "patient_id" "uuid" NOT NULL,
    "item_id" "uuid" NOT NULL,
    "current_quantity" integer DEFAULT 0 NOT NULL,
    "location_note" "text",
    "serial_number" "text",
    "installed_at" timestamp with time zone DEFAULT "now"(),
    "status" "text" DEFAULT 'active'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "patient_inventory_current_quantity_check" CHECK (("current_quantity" >= 0)),
    CONSTRAINT "patient_inventory_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'returned'::"text", 'maintenance'::"text", 'consumed'::"text"])))
);


ALTER TABLE "public"."patient_inventory" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."patient_medications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "patient_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "dosage" "text",
    "frequency" "text",
    "route" "text",
    "is_critical" boolean DEFAULT false,
    "status" "text" DEFAULT 'active'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "patient_medications_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'suspended'::"text", 'discontinued'::"text"])))
);


ALTER TABLE "public"."patient_medications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."patient_oxygen_therapy" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "patient_id" "uuid" NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "is_active" boolean DEFAULT false,
    "flow_rate_liters" numeric,
    "delivery_interface" "public"."oxygen_delivery",
    "source_mode" "public"."oxygen_mode",
    "usage_regime" "text",
    "started_at" "date",
    "notes" "text",
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."patient_oxygen_therapy" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."patient_related_persons" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "patient_id" "uuid" NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "relationship_degree" "text",
    "role_type" "public"."relatedness_role" DEFAULT 'Familiar'::"public"."relatedness_role",
    "is_legal_guardian" boolean DEFAULT false,
    "is_financial_responsible" boolean DEFAULT false,
    "is_emergency_contact" boolean DEFAULT false,
    "lives_with_patient" "text" DEFAULT false,
    "visit_frequency" "text",
    "access_to_home" boolean DEFAULT false,
    "can_authorize_clinical" boolean DEFAULT false,
    "can_authorize_financial" boolean DEFAULT false,
    "phone_primary" "text",
    "phone_secondary" "text",
    "email" "text",
    "contact_time_preference" "text",
    "priority_order" integer DEFAULT 99,
    "cpf" "text",
    "rg" "text",
    "address_full" "text",
    "allow_clinical_updates" boolean DEFAULT true,
    "allow_admin_notif" boolean DEFAULT true,
    "block_marketing" boolean DEFAULT false,
    "observations" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "is_whatsapp" boolean DEFAULT false,
    "birth_date" "date",
    "rg_issuer" "text",
    "rg_state" "text",
    "address_street" "text",
    "address_number" "text",
    "address_city" "text",
    "address_state" "text",
    "contact_type" "text" NOT NULL,
    "is_main_contact" boolean DEFAULT false,
    "relation_description" "text",
    "preferred_contact" "text",
    "address_summary" "text",
    "observacoes_lgpd" "text",
    CONSTRAINT "check_contact_time_preference" CHECK ((("contact_time_preference" = ANY (ARRAY['Manha'::"text", 'Tarde'::"text", 'Noite'::"text", 'QualquerHorario'::"text"])) OR ("contact_time_preference" IS NULL))),
    CONSTRAINT "check_contact_type" CHECK ((("contact_type" = ANY (ARRAY['ResponsavelLegal'::"text", 'ResponsavelFinanceiro'::"text", 'ContatoEmergencia24h'::"text", 'Familiar'::"text", 'Cuidador'::"text", 'Vizinho'::"text", 'Sindico'::"text", 'Zelador'::"text", 'Amigo'::"text", 'Outro'::"text"])) OR ("contact_type" IS NULL))),
    CONSTRAINT "check_contact_window" CHECK ((("contact_time_preference" = ANY (ARRAY['Manha'::"text", 'Tarde'::"text", 'Noite'::"text", 'Comercial'::"text", 'Qualquer Horario'::"text"])) OR ("contact_time_preference" IS NULL))),
    CONSTRAINT "check_lives_with" CHECK ((("lives_with_patient" = ANY (ARRAY['Sim'::"text", 'Nao'::"text", 'VisitaFrequente'::"text", 'VisitaEventual'::"text"])) OR ("lives_with_patient" IS NULL))),
    CONSTRAINT "check_pref_contact" CHECK ((("preferred_contact" = ANY (ARRAY['whatsapp'::"text", 'phone'::"text", 'sms'::"text", 'email'::"text", 'other'::"text"])) OR ("preferred_contact" IS NULL))),
    CONSTRAINT "check_preferred_contact" CHECK ((("preferred_contact" = ANY (ARRAY['WhatsApp'::"text", 'Telefone'::"text", 'SMS'::"text", 'Email'::"text", 'Outro'::"text"])) OR ("preferred_contact" IS NULL)))
);


ALTER TABLE "public"."patient_related_persons" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."patient_risk_scores" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "patient_id" "uuid" NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "scale_name" "text" NOT NULL,
    "score_value" integer NOT NULL,
    "risk_level" "public"."risk_level",
    "assessed_at" timestamp with time zone DEFAULT "now"(),
    "assessed_by" "uuid",
    "notes" "text"
);


ALTER TABLE "public"."patient_risk_scores" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."patient_schedule_settings" (
    "patient_id" "uuid" NOT NULL,
    "scheme_type" "text" DEFAULT '12x36'::"text",
    "day_start_time" time without time zone DEFAULT '07:00:00'::time without time zone,
    "night_start_time" time without time zone DEFAULT '19:00:00'::time without time zone,
    "professionals_per_shift" integer DEFAULT 1,
    "required_role" "text" DEFAULT 'technician'::"text",
    "auto_generate" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "patient_schedule_settings_required_role_check" CHECK (("required_role" = ANY (ARRAY['caregiver'::"text", 'technician'::"text", 'nurse'::"text"]))),
    CONSTRAINT "patient_schedule_settings_scheme_type_check" CHECK (("scheme_type" = ANY (ARRAY['12x36'::"text", '24x48'::"text", 'daily_12h'::"text", 'daily_24h'::"text", 'custom'::"text"])))
);


ALTER TABLE "public"."patient_schedule_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."patient_services" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "patient_id" "uuid" NOT NULL,
    "contractor_id" "uuid" NOT NULL,
    "service_name" "text" NOT NULL,
    "service_code" "text",
    "unit_price" numeric(10,2) DEFAULT 0 NOT NULL,
    "frequency" "text",
    "authorized_quantity" integer,
    "valid_from" "date",
    "valid_until" "date",
    "status" "text" DEFAULT 'active'::"text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."patient_services" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."patients" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" DEFAULT "app_private"."current_tenant_id"(),
    "full_name" "text" NOT NULL,
    "cpf" "text",
    "date_of_birth" "date",
    "gender" "text",
    "primary_contractor_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "mother_name" "text",
    "social_name" "text",
    "gender_identity" "text",
    "civil_status" "text",
    "nationality" "text" DEFAULT 'Brasileira'::"text",
    "place_of_birth" "text",
    "preferred_language" "text" DEFAULT 'Português'::"text",
    "rg" "text",
    "rg_issuer" "text",
    "cns" "text",
    "communication_preferences" "jsonb" DEFAULT '{"sms": true, "email": true, "whatsapp": true}'::"jsonb",
    "salutation" "text",
    "pronouns" "text",
    "photo_consent" boolean DEFAULT false,
    "cpf_status" "text" DEFAULT 'valid'::"text",
    "national_id" "text",
    "document_validation_method" "text",
    "external_ids" "jsonb",
    "mobile_phone" "text",
    "mobile_phone_verified" boolean DEFAULT false,
    "secondary_phone" "text",
    "secondary_phone_type" "text",
    "email" "text",
    "email_verified" boolean DEFAULT false,
    "pref_contact_method" "text",
    "accept_sms" boolean DEFAULT true,
    "accept_email" boolean DEFAULT true,
    "block_marketing" boolean DEFAULT false,
    "record_status" "text" DEFAULT 'active'::"text",
    "onboarding_step" integer DEFAULT 1,
    "nickname" "text",
    "education_level" "text",
    "profession" "text",
    "race_color" "text",
    "is_pcd" boolean DEFAULT false,
    "place_of_birth_city" "text",
    "place_of_birth_state" "text",
    "place_of_birth_country" "text" DEFAULT 'Brasil'::"text",
    "rg_issuer_state" "text",
    "rg_issued_at" "date",
    "doc_validation_status" "text" DEFAULT 'Pendente'::"text",
    "doc_validated_at" timestamp with time zone,
    "doc_validated_by" "uuid",
    "doc_validation_method" "text",
    "contact_time_preference" "text",
    "contact_notes" "text",
    "marketing_consented_at" timestamp with time zone,
    "marketing_consent_source" "text",
    "marketing_consent_ip" "inet",
    "father_name" "text",
    "photo_consent_date" timestamp with time zone,
    "doc_validation_source" "text",
    "marketing_consent_status" "text" DEFAULT 'pending'::"text",
    "marketing_consent_history" "text",
    "has_legal_guardian" boolean DEFAULT false,
    "legal_guardian_status" "text" DEFAULT 'Nao possui'::"text",
    CONSTRAINT "check_contact_time" CHECK (("contact_time_preference" = ANY (ARRAY['Manha'::"text", 'Tarde'::"text", 'Noite'::"text", 'Comercial'::"text", 'Qualquer Horario'::"text"]))),
    CONSTRAINT "check_cpf_format" CHECK ((("cpf" IS NULL) OR ("cpf" ~ '^[0-9]{11}$'::"text"))),
    CONSTRAINT "check_doc_validation" CHECK (("doc_validation_status" = ANY (ARRAY['Pendente'::"text", 'Nao Validado'::"text", 'Validado'::"text", 'Inconsistente'::"text", 'Em Analise'::"text"]))),
    CONSTRAINT "check_education_level" CHECK (("education_level" = ANY (ARRAY['Nao Alfabetizado'::"text", 'Fundamental Incompleto'::"text", 'Fundamental Completo'::"text", 'Medio Incompleto'::"text", 'Medio Completo'::"text", 'Superior Incompleto'::"text", 'Superior Completo'::"text", 'Pos Graduacao'::"text", 'Mestrado/Doutorado'::"text", 'Nao Informado'::"text"]))),
    CONSTRAINT "check_gender_identity" CHECK (("gender_identity" = ANY (ARRAY['Cisgenero'::"text", 'Transgenero'::"text", 'Nao Binario'::"text", 'Outro'::"text", 'Prefiro nao informar'::"text"]))),
    CONSTRAINT "check_guardian_status" CHECK (("legal_guardian_status" = ANY (ARRAY['Nao possui'::"text", 'Cadastro Pendente'::"text", 'Cadastro OK'::"text"]))),
    CONSTRAINT "check_marketing_source" CHECK ((("marketing_consent_source" = ANY (ARRAY['Portal Administrativo (Edicao Manual)'::"text", 'Formulario Web'::"text", 'Assinatura Digital'::"text", 'Importacao de Legado'::"text", 'Solicitacao Verbal'::"text"])) OR ("marketing_consent_source" IS NULL))),
    CONSTRAINT "check_marketing_status" CHECK (("marketing_consent_status" = ANY (ARRAY['pending'::"text", 'accepted'::"text", 'rejected'::"text"]))),
    CONSTRAINT "check_pronouns" CHECK (("pronouns" = ANY (ARRAY['Ele/Dele'::"text", 'Ela/Dela'::"text", 'Elu/Delu'::"text", 'Outro'::"text"]))),
    CONSTRAINT "check_race_color" CHECK (("race_color" = ANY (ARRAY['Branca'::"text", 'Preta'::"text", 'Parda'::"text", 'Amarela'::"text", 'Indigena'::"text", 'Nao declarado'::"text"]))),
    CONSTRAINT "check_rg_state" CHECK (("rg_issuer_state" ~* '^[A-Z]{2}$'::"text")),
    CONSTRAINT "patients_cpf_status_check" CHECK (("cpf_status" = ANY (ARRAY['valid'::"text", 'invalid'::"text", 'unknown'::"text"]))),
    CONSTRAINT "patients_pref_contact_method_check" CHECK (("pref_contact_method" = ANY (ARRAY['whatsapp'::"text", 'phone'::"text", 'email'::"text"]))),
    CONSTRAINT "patients_record_status_check" CHECK (("record_status" = ANY (ARRAY['draft'::"text", 'onboarding'::"text", 'active'::"text", 'inactive'::"text", 'deceased'::"text", 'discharged'::"text", 'pending_financial'::"text"]))),
    CONSTRAINT "pref_contact_method_check" CHECK (("pref_contact_method" = ANY (ARRAY['whatsapp'::"text", 'phone'::"text", 'sms'::"text", 'email'::"text", 'other'::"text"])))
);


ALTER TABLE "public"."patients" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."professional_profiles" (
    "user_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "full_name" "text" NOT NULL,
    "social_name" "text",
    "cpf" "text",
    "email" "text",
    "contact_phone" "text",
    "role" "text" NOT NULL,
    "professional_license" "text",
    "bond_type" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "pix_key" "text",
    "pix_key_type" "text",
    "bank_account_info" "jsonb",
    "payment_provider_id" "text",
    CONSTRAINT "professional_profiles_bond_type_check" CHECK (("bond_type" = ANY (ARRAY['clt'::"text", 'pj'::"text", 'cooperative'::"text", 'freelancer'::"text"]))),
    CONSTRAINT "professional_profiles_role_check" CHECK (("role" = ANY (ARRAY['nurse'::"text", 'technician'::"text", 'caregiver'::"text", 'physio'::"text", 'medic'::"text", 'coordinator'::"text"])))
);


ALTER TABLE "public"."professional_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."professionals" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid",
    "full_name" "text" NOT NULL,
    "registry_code" "text",
    "specialties" "text"[] DEFAULT ARRAY[]::"text"[],
    "phone" "text",
    "email" "text",
    "avatar_url" "text",
    "notes" "text",
    "employment_type" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."professionals" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."services" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "code" "text",
    "category" "text",
    "default_duration_minutes" integer,
    "unit_measure" "text" DEFAULT 'unidade'::"text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "services_category_check" CHECK (("category" = ANY (ARRAY['shift'::"text", 'visit'::"text", 'procedure'::"text", 'equipment'::"text", 'other'::"text"])))
);


ALTER TABLE "public"."services" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."shift_candidates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "shift_id" "uuid" NOT NULL,
    "professional_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text",
    "bid_amount" numeric(10,2),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "shift_candidates_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'rejected'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."shift_candidates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."shift_disputes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "shift_id" "uuid" NOT NULL,
    "opened_by" "uuid",
    "reason_category" "text" NOT NULL,
    "description" "text" NOT NULL,
    "status" "text" DEFAULT 'open'::"text",
    "resolution_notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "resolved_at" timestamp with time zone,
    CONSTRAINT "shift_disputes_status_check" CHECK (("status" = ANY (ARRAY['open'::"text", 'investigating'::"text", 'resolved_paid'::"text", 'resolved_refunded'::"text"])))
);


ALTER TABLE "public"."shift_disputes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."shift_internal_notes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "shift_id" "uuid" NOT NULL,
    "message" "text" NOT NULL,
    "author_name" "text",
    "is_read" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."shift_internal_notes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."shift_timeline_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "shift_id" "uuid" NOT NULL,
    "event_time" timestamp with time zone DEFAULT "now"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "icon_name" "text",
    "tone" "text" DEFAULT 'default'::"text",
    "metadata" "jsonb",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "shift_timeline_events_tone_check" CHECK (("tone" = ANY (ARRAY['default'::"text", 'success'::"text", 'warning'::"text", 'critical'::"text"])))
);


ALTER TABLE "public"."shift_timeline_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."shifts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" DEFAULT "app_private"."current_tenant_id"(),
    "patient_id" "uuid" NOT NULL,
    "professional_id" "uuid",
    "service_id" "uuid" NOT NULL,
    "start_time" timestamp with time zone NOT NULL,
    "end_time" timestamp with time zone NOT NULL,
    "duration_minutes" integer GENERATED ALWAYS AS ((EXTRACT(epoch FROM ("end_time" - "start_time")) / (60)::numeric)) STORED,
    "status" "text" DEFAULT 'scheduled'::"text" NOT NULL,
    "check_in_time" timestamp with time zone,
    "check_out_time" timestamp with time zone,
    "gps_lat" double precision,
    "gps_lng" double precision,
    "billing_batch_id" "uuid",
    "is_billable" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "shift_type" "text" DEFAULT 'day'::"text",
    "caution_note" "text",
    "candidate_count" integer DEFAULT 0,
    "is_critical" boolean DEFAULT false,
    "location_type" "text" DEFAULT 'home'::"text",
    "location_notes" "text",
    "contractor_id" "uuid",
    "financial_status" "text" DEFAULT 'pending'::"text",
    "payout_value" numeric(10,2),
    "payout_transaction_id" "text",
    CONSTRAINT "shifts_financial_status_check" CHECK (("financial_status" = ANY (ARRAY['pending'::"text", 'authorized'::"text", 'paid'::"text", 'disputed'::"text", 'canceled'::"text"]))),
    CONSTRAINT "shifts_location_type_check" CHECK (("location_type" = ANY (ARRAY['home'::"text", 'hospital'::"text", 'school'::"text", 'other'::"text"]))),
    CONSTRAINT "shifts_shift_type_check" CHECK (("shift_type" = ANY (ARRAY['day'::"text", 'night'::"text", '24h'::"text"]))),
    CONSTRAINT "shifts_status_check" CHECK (("status" = ANY (ARRAY['scheduled'::"text", 'confirmed'::"text", 'in_progress'::"text", 'completed'::"text", 'canceled'::"text", 'missed'::"text"])))
);


ALTER TABLE "public"."shifts" OWNER TO "postgres";


COMMENT ON COLUMN "public"."shifts"."professional_id" IS 'Link para public.professional_profiles(user_id)';



CREATE TABLE IF NOT EXISTS "public"."system_audit_errors" (
    "id" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "context" "text",
    "payload" "jsonb",
    "err" "text"
);


ALTER TABLE "public"."system_audit_errors" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."system_audit_errors_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."system_audit_errors_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."system_audit_errors_id_seq" OWNED BY "public"."system_audit_errors"."id";



CREATE TABLE IF NOT EXISTS "public"."system_audit_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid",
    "actor_id" "uuid",
    "ip_address" "text",
    "user_agent" "text",
    "action" "public"."audit_action_type" NOT NULL,
    "entity_table" "text" NOT NULL,
    "entity_id" "uuid",
    "changes" "jsonb",
    "reason" "text",
    "route_path" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "parent_patient_id" "uuid"
);


ALTER TABLE "public"."system_audit_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tenants" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "cnpj" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."tenants" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "auth_user_id" "uuid",
    "email" "text",
    "name" "text",
    "phone" "text",
    "role" "text" DEFAULT 'viewer'::"text",
    "tenant_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_profiles" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."view_patient_legal_guardian_summary" AS
 SELECT "p"."id" AS "patient_id",
    "pr"."id" AS "related_person_id",
    "pr"."name" AS "responsavellegalnome",
    "pr"."relationship_degree" AS "responsavellegalparentesco",
    "pr"."phone_primary" AS "responsavellegaltelefoneprincipal",
        CASE
            WHEN ("pr"."id" IS NOT NULL) THEN true
            ELSE false
        END AS "hasresponsavellegal"
   FROM ("public"."patients" "p"
     LEFT JOIN LATERAL ( SELECT "pr_inner"."id",
            "pr_inner"."patient_id",
            "pr_inner"."tenant_id",
            "pr_inner"."name",
            "pr_inner"."relationship_degree",
            "pr_inner"."role_type",
            "pr_inner"."is_legal_guardian",
            "pr_inner"."is_financial_responsible",
            "pr_inner"."is_emergency_contact",
            "pr_inner"."lives_with_patient",
            "pr_inner"."visit_frequency",
            "pr_inner"."access_to_home",
            "pr_inner"."can_authorize_clinical",
            "pr_inner"."can_authorize_financial",
            "pr_inner"."phone_primary",
            "pr_inner"."phone_secondary",
            "pr_inner"."email",
            "pr_inner"."contact_time_preference",
            "pr_inner"."priority_order",
            "pr_inner"."cpf",
            "pr_inner"."rg",
            "pr_inner"."address_full",
            "pr_inner"."allow_clinical_updates",
            "pr_inner"."allow_admin_notif",
            "pr_inner"."block_marketing",
            "pr_inner"."observations",
            "pr_inner"."created_at",
            "pr_inner"."updated_at",
            "pr_inner"."is_whatsapp",
            "pr_inner"."birth_date",
            "pr_inner"."rg_issuer",
            "pr_inner"."rg_state",
            "pr_inner"."address_street",
            "pr_inner"."address_number",
            "pr_inner"."address_city",
            "pr_inner"."address_state",
            "pr_inner"."contact_type",
            "pr_inner"."is_main_contact",
            "pr_inner"."relation_description",
            "pr_inner"."preferred_contact",
            "pr_inner"."address_summary",
            "pr_inner"."observacoes_lgpd"
           FROM "public"."patient_related_persons" "pr_inner"
          WHERE (("pr_inner"."patient_id" = "p"."id") AND ("pr_inner"."is_legal_guardian" = true))
          ORDER BY COALESCE("pr_inner"."priority_order", 1), "pr_inner"."created_at"
         LIMIT 1) "pr" ON (true));


ALTER VIEW "public"."view_patient_legal_guardian_summary" OWNER TO "postgres";


ALTER TABLE ONLY "public"."system_audit_errors" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."system_audit_errors_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."billing_batches"
    ADD CONSTRAINT "billing_batches_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."care_team_members"
    ADD CONSTRAINT "care_team_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contractors"
    ADD CONSTRAINT "contractors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."financial_ledger_entries"
    ADD CONSTRAINT "financial_ledger_entries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."financial_records"
    ADD CONSTRAINT "financial_records_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."integration_configs"
    ADD CONSTRAINT "integration_configs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."inventory_items"
    ADD CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."inventory_movements"
    ADD CONSTRAINT "inventory_movements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."patient_addresses"
    ADD CONSTRAINT "patient_addresses_pkey" PRIMARY KEY ("patient_id");



ALTER TABLE ONLY "public"."patient_admin_info"
    ADD CONSTRAINT "patient_admin_info_pkey" PRIMARY KEY ("patient_id");



ALTER TABLE ONLY "public"."patient_administrative_profiles"
    ADD CONSTRAINT "patient_administrative_profiles_pkey" PRIMARY KEY ("patient_id");



ALTER TABLE ONLY "public"."patient_allergies"
    ADD CONSTRAINT "patient_allergies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."patient_assigned_assets"
    ADD CONSTRAINT "patient_assigned_assets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."patient_civil_documents"
    ADD CONSTRAINT "patient_civil_documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."patient_clinical_profiles"
    ADD CONSTRAINT "patient_clinical_profiles_pkey" PRIMARY KEY ("patient_id");



ALTER TABLE ONLY "public"."patient_clinical_summaries"
    ADD CONSTRAINT "patient_clinical_summaries_pkey" PRIMARY KEY ("patient_id");



ALTER TABLE ONLY "public"."patient_consumables_stock"
    ADD CONSTRAINT "patient_consumables_stock_patient_id_item_id_key" UNIQUE ("patient_id", "item_id");



ALTER TABLE ONLY "public"."patient_consumables_stock"
    ADD CONSTRAINT "patient_consumables_stock_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."patient_devices"
    ADD CONSTRAINT "patient_devices_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."patient_document_logs"
    ADD CONSTRAINT "patient_document_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."patient_documents"
    ADD CONSTRAINT "patient_documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."patient_domiciles"
    ADD CONSTRAINT "patient_domiciles_pkey" PRIMARY KEY ("patient_id");



ALTER TABLE ONLY "public"."patient_financial_profiles"
    ADD CONSTRAINT "patient_financial_profiles_pkey" PRIMARY KEY ("patient_id");



ALTER TABLE ONLY "public"."patient_household_members"
    ADD CONSTRAINT "patient_household_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."patient_inventory"
    ADD CONSTRAINT "patient_inventory_patient_id_item_id_serial_number_key" UNIQUE ("patient_id", "item_id", "serial_number");



ALTER TABLE ONLY "public"."patient_inventory"
    ADD CONSTRAINT "patient_inventory_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."patient_medications"
    ADD CONSTRAINT "patient_medications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."patient_oxygen_therapy"
    ADD CONSTRAINT "patient_oxygen_therapy_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."patient_related_persons"
    ADD CONSTRAINT "patient_related_persons_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."patient_risk_scores"
    ADD CONSTRAINT "patient_risk_scores_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."patient_schedule_settings"
    ADD CONSTRAINT "patient_schedule_settings_pkey" PRIMARY KEY ("patient_id");



ALTER TABLE ONLY "public"."patient_services"
    ADD CONSTRAINT "patient_services_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."patients"
    ADD CONSTRAINT "patients_cpf_key" UNIQUE ("cpf");



ALTER TABLE ONLY "public"."patients"
    ADD CONSTRAINT "patients_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."professional_profiles"
    ADD CONSTRAINT "professional_profiles_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."professionals"
    ADD CONSTRAINT "professionals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."services"
    ADD CONSTRAINT "services_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."shift_candidates"
    ADD CONSTRAINT "shift_candidates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."shift_candidates"
    ADD CONSTRAINT "shift_candidates_shift_id_professional_id_key" UNIQUE ("shift_id", "professional_id");



ALTER TABLE ONLY "public"."shift_disputes"
    ADD CONSTRAINT "shift_disputes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."shift_internal_notes"
    ADD CONSTRAINT "shift_internal_notes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."shift_timeline_events"
    ADD CONSTRAINT "shift_timeline_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."shifts"
    ADD CONSTRAINT "shifts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."system_audit_errors"
    ADD CONSTRAINT "system_audit_errors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."system_audit_logs"
    ADD CONSTRAINT "system_audit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tenants"
    ADD CONSTRAINT "tenants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_auth_user_id_key" UNIQUE ("auth_user_id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_audit_actor" ON "public"."system_audit_logs" USING "btree" ("actor_id");



CREATE INDEX "idx_audit_created_at" ON "public"."system_audit_logs" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_audit_entity" ON "public"."system_audit_logs" USING "btree" ("entity_table", "entity_id");



CREATE INDEX "idx_audit_logs_actor_id" ON "public"."system_audit_logs" USING "btree" ("actor_id");



CREATE INDEX "idx_audit_logs_created_at" ON "public"."system_audit_logs" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_audit_logs_entity_table" ON "public"."system_audit_logs" USING "btree" ("entity_table");



CREATE INDEX "idx_audit_parent_patient" ON "public"."system_audit_logs" USING "btree" ("parent_patient_id");



CREATE INDEX "idx_care_team_members_user_patient_dates" ON "public"."care_team_members" USING "btree" ("user_profile_id", "patient_id", "start_date", "end_date");



CREATE INDEX "idx_civil_docs_patient" ON "public"."patient_civil_documents" USING "btree" ("patient_id");



CREATE INDEX "idx_docs_category" ON "public"."patient_documents" USING "btree" ("category");



CREATE INDEX "idx_docs_created" ON "public"."patient_documents" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_docs_domain" ON "public"."patient_documents" USING "btree" ("domain_type");



CREATE INDEX "idx_docs_origin" ON "public"."patient_documents" USING "btree" ("origin_module");



CREATE INDEX "idx_docs_status" ON "public"."patient_documents" USING "btree" ("document_status");



CREATE INDEX "idx_financial_patient" ON "public"."financial_records" USING "btree" ("patient_id");



CREATE INDEX "idx_ledger_patient" ON "public"."financial_ledger_entries" USING "btree" ("patient_id");



CREATE INDEX "idx_ledger_status" ON "public"."financial_ledger_entries" USING "btree" ("status");



CREATE INDEX "idx_patient_admin_info_contract_id" ON "public"."patient_admin_info" USING "btree" ("contract_id");



CREATE INDEX "idx_patient_admin_info_contract_status_enum" ON "public"."patient_admin_info" USING "btree" ("contract_status_enum");



CREATE INDEX "idx_patient_admin_info_patient_id" ON "public"."patient_admin_info" USING "btree" ("patient_id");



CREATE INDEX "idx_patient_admin_info_primary_payer_related_person_id" ON "public"."patient_admin_info" USING "btree" ("primary_payer_related_person_id");



CREATE INDEX "idx_patient_documents_patient_cat_dom" ON "public"."patient_documents" USING "btree" ("patient_id", "category", "domain_type");



CREATE INDEX "idx_patient_documents_patient_created_at" ON "public"."patient_documents" USING "btree" ("patient_id", "created_at" DESC);



CREATE INDEX "idx_patient_documents_patient_status" ON "public"."patient_documents" USING "btree" ("patient_id", "status");



CREATE INDEX "idx_patient_documents_tags_gin" ON "public"."patient_documents" USING "gin" ("tags");



CREATE INDEX "idx_patient_related_persons_patient_guardian_priority_created" ON "public"."patient_related_persons" USING "btree" ("patient_id", "is_legal_guardian", "priority_order", "created_at");



CREATE INDEX "idx_patient_related_persons_patient_id" ON "public"."patient_related_persons" USING "btree" ("patient_id");



CREATE UNIQUE INDEX "idx_patients_cpf_tenant" ON "public"."patients" USING "btree" ("cpf", "tenant_id") WHERE ("cpf" IS NOT NULL);



CREATE INDEX "idx_professionals_name" ON "public"."professional_profiles" USING "btree" ("full_name");



CREATE INDEX "idx_professionals_role" ON "public"."professional_profiles" USING "btree" ("role");



CREATE INDEX "idx_related_guardian" ON "public"."patient_related_persons" USING "btree" ("patient_id", "is_legal_guardian");



CREATE INDEX "idx_related_patient" ON "public"."patient_related_persons" USING "btree" ("patient_id");



CREATE INDEX "idx_shift_candidates_shift" ON "public"."shift_candidates" USING "btree" ("shift_id");



CREATE INDEX "idx_shift_timeline_order" ON "public"."shift_timeline_events" USING "btree" ("shift_id", "event_time" DESC);



CREATE INDEX "idx_shifts_billing" ON "public"."shifts" USING "btree" ("billing_batch_id");



CREATE INDEX "idx_shifts_dashboard_filter" ON "public"."shifts" USING "btree" ("start_time", "end_time", "shift_type");



CREATE INDEX "idx_shifts_quota_check" ON "public"."shifts" USING "btree" ("patient_id", "service_id", "status");



CREATE INDEX "idx_shifts_timeline" ON "public"."shifts" USING "btree" ("start_time", "end_time");



CREATE INDEX "idx_team_patient" ON "public"."care_team_members" USING "btree" ("patient_id");



CREATE OR REPLACE TRIGGER "audit_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."patient_addresses" FOR EACH ROW EXECUTE FUNCTION "public"."log_row_change"();



CREATE OR REPLACE TRIGGER "audit_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."patient_administrative_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."log_row_change"();



CREATE OR REPLACE TRIGGER "audit_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."patient_clinical_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."log_row_change"();



CREATE OR REPLACE TRIGGER "audit_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."patient_documents" FOR EACH ROW EXECUTE FUNCTION "public"."log_row_change"();



CREATE OR REPLACE TRIGGER "audit_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."patient_domiciles" FOR EACH ROW EXECUTE FUNCTION "public"."log_row_change"();



CREATE OR REPLACE TRIGGER "audit_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."patient_financial_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."log_row_change"();



CREATE OR REPLACE TRIGGER "audit_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."patient_household_members" FOR EACH ROW EXECUTE FUNCTION "public"."log_row_change"();



CREATE OR REPLACE TRIGGER "audit_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."patient_inventory" FOR EACH ROW EXECUTE FUNCTION "public"."log_row_change"();



CREATE OR REPLACE TRIGGER "audit_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."patient_medications" FOR EACH ROW EXECUTE FUNCTION "public"."log_row_change"();



CREATE OR REPLACE TRIGGER "audit_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."patient_schedule_settings" FOR EACH ROW EXECUTE FUNCTION "public"."log_row_change"();



CREATE OR REPLACE TRIGGER "audit_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."patient_services" FOR EACH ROW EXECUTE FUNCTION "public"."log_row_change"();



CREATE OR REPLACE TRIGGER "audit_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."patients" FOR EACH ROW EXECUTE FUNCTION "public"."log_row_change"();



CREATE OR REPLACE TRIGGER "audit_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."shifts" FOR EACH ROW EXECUTE FUNCTION "public"."log_row_change"();



CREATE OR REPLACE TRIGGER "trg_audit_addresses" AFTER INSERT OR DELETE OR UPDATE ON "public"."patient_addresses" FOR EACH ROW EXECUTE FUNCTION "public"."log_patient_change"();



CREATE OR REPLACE TRIGGER "trg_audit_admin" AFTER INSERT OR DELETE OR UPDATE ON "public"."patient_administrative_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."log_patient_change"();



CREATE OR REPLACE TRIGGER "trg_audit_clinical" AFTER INSERT OR DELETE OR UPDATE ON "public"."patient_clinical_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."log_patient_change"();



CREATE OR REPLACE TRIGGER "trg_audit_docs" AFTER INSERT OR DELETE OR UPDATE ON "public"."patient_documents" FOR EACH ROW EXECUTE FUNCTION "public"."log_patient_change"();



CREATE OR REPLACE TRIGGER "trg_audit_domiciles" AFTER INSERT OR DELETE OR UPDATE ON "public"."patient_domiciles" FOR EACH ROW EXECUTE FUNCTION "public"."log_patient_change"();



CREATE OR REPLACE TRIGGER "trg_audit_financial" AFTER INSERT OR DELETE OR UPDATE ON "public"."patient_financial_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."log_patient_change"();



CREATE OR REPLACE TRIGGER "trg_audit_household" AFTER INSERT OR DELETE OR UPDATE ON "public"."patient_household_members" FOR EACH ROW EXECUTE FUNCTION "public"."log_patient_change"();



CREATE OR REPLACE TRIGGER "trg_audit_inventory" AFTER INSERT OR DELETE OR UPDATE ON "public"."patient_inventory" FOR EACH ROW EXECUTE FUNCTION "public"."log_patient_change"();



CREATE OR REPLACE TRIGGER "trg_audit_medications" AFTER INSERT OR DELETE OR UPDATE ON "public"."patient_medications" FOR EACH ROW EXECUTE FUNCTION "public"."log_patient_change"();



CREATE OR REPLACE TRIGGER "trg_audit_patient_addresses" AFTER INSERT OR DELETE OR UPDATE ON "public"."patient_addresses" FOR EACH ROW EXECUTE FUNCTION "public"."log_patient_change"();



CREATE OR REPLACE TRIGGER "trg_audit_patient_administrative_profiles" AFTER INSERT OR DELETE OR UPDATE ON "public"."patient_administrative_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."log_patient_change"();



CREATE OR REPLACE TRIGGER "trg_audit_patient_clinical_profiles" AFTER INSERT OR DELETE OR UPDATE ON "public"."patient_clinical_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."log_patient_change"();



CREATE OR REPLACE TRIGGER "trg_audit_patient_documents" AFTER INSERT OR DELETE OR UPDATE ON "public"."patient_documents" FOR EACH ROW EXECUTE FUNCTION "public"."log_patient_change"();



CREATE OR REPLACE TRIGGER "trg_audit_patient_domiciles" AFTER INSERT OR DELETE OR UPDATE ON "public"."patient_domiciles" FOR EACH ROW EXECUTE FUNCTION "public"."log_patient_change"();



CREATE OR REPLACE TRIGGER "trg_audit_patient_financial_profiles" AFTER INSERT OR DELETE OR UPDATE ON "public"."patient_financial_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."log_patient_change"();



CREATE OR REPLACE TRIGGER "trg_audit_patient_household_members" AFTER INSERT OR DELETE OR UPDATE ON "public"."patient_household_members" FOR EACH ROW EXECUTE FUNCTION "public"."log_patient_change"();



CREATE OR REPLACE TRIGGER "trg_audit_patient_inventory" AFTER INSERT OR DELETE OR UPDATE ON "public"."patient_inventory" FOR EACH ROW EXECUTE FUNCTION "public"."log_patient_change"();



CREATE OR REPLACE TRIGGER "trg_audit_patient_medications" AFTER INSERT OR DELETE OR UPDATE ON "public"."patient_medications" FOR EACH ROW EXECUTE FUNCTION "public"."log_patient_change"();



CREATE OR REPLACE TRIGGER "trg_audit_patient_schedule_settings" AFTER INSERT OR DELETE OR UPDATE ON "public"."patient_schedule_settings" FOR EACH ROW EXECUTE FUNCTION "public"."log_patient_change"();



CREATE OR REPLACE TRIGGER "trg_audit_patient_services" AFTER INSERT OR DELETE OR UPDATE ON "public"."patient_services" FOR EACH ROW EXECUTE FUNCTION "public"."log_patient_change"();



CREATE OR REPLACE TRIGGER "trg_audit_patients" AFTER INSERT OR DELETE OR UPDATE ON "public"."patients" FOR EACH ROW EXECUTE FUNCTION "public"."log_patient_change"();



CREATE OR REPLACE TRIGGER "trg_audit_sched_settings" AFTER INSERT OR DELETE OR UPDATE ON "public"."patient_schedule_settings" FOR EACH ROW EXECUTE FUNCTION "public"."log_patient_change"();



CREATE OR REPLACE TRIGGER "trg_audit_services" AFTER INSERT OR DELETE OR UPDATE ON "public"."patient_services" FOR EACH ROW EXECUTE FUNCTION "public"."log_patient_change"();



CREATE OR REPLACE TRIGGER "trg_audit_shifts" AFTER INSERT OR DELETE OR UPDATE ON "public"."shifts" FOR EACH ROW EXECUTE FUNCTION "public"."log_patient_change"();



CREATE OR REPLACE TRIGGER "trg_touch_admin_profile" BEFORE UPDATE ON "public"."patient_administrative_profiles" FOR EACH ROW EXECUTE FUNCTION "app_private"."touch_updated_at"();



CREATE OR REPLACE TRIGGER "trg_touch_batches" BEFORE UPDATE ON "public"."billing_batches" FOR EACH ROW EXECUTE FUNCTION "app_private"."touch_updated_at"();



CREATE OR REPLACE TRIGGER "trg_touch_contractors" BEFORE UPDATE ON "public"."contractors" FOR EACH ROW EXECUTE FUNCTION "app_private"."touch_updated_at"();



CREATE OR REPLACE TRIGGER "trg_touch_docs" BEFORE UPDATE ON "public"."patient_documents" FOR EACH ROW EXECUTE FUNCTION "app_private"."touch_updated_at"();



CREATE OR REPLACE TRIGGER "trg_touch_financial_profiles" BEFORE UPDATE ON "public"."patient_financial_profiles" FOR EACH ROW EXECUTE FUNCTION "app_private"."touch_updated_at"();



CREATE OR REPLACE TRIGGER "trg_touch_patients" BEFORE UPDATE ON "public"."patients" FOR EACH ROW EXECUTE FUNCTION "app_private"."touch_updated_at"();



CREATE OR REPLACE TRIGGER "trg_touch_professionals" BEFORE UPDATE ON "public"."professional_profiles" FOR EACH ROW EXECUTE FUNCTION "app_private"."touch_updated_at"();



CREATE OR REPLACE TRIGGER "trg_touch_schedule_settings" BEFORE UPDATE ON "public"."patient_schedule_settings" FOR EACH ROW EXECUTE FUNCTION "app_private"."touch_updated_at"();



CREATE OR REPLACE TRIGGER "trg_touch_shifts" BEFORE UPDATE ON "public"."shifts" FOR EACH ROW EXECUTE FUNCTION "app_private"."touch_updated_at"();



CREATE OR REPLACE TRIGGER "trg_update_guardian" AFTER INSERT OR DELETE OR UPDATE ON "public"."patient_related_persons" FOR EACH ROW EXECUTE FUNCTION "public"."update_patient_guardian_flag"();



ALTER TABLE ONLY "public"."billing_batches"
    ADD CONSTRAINT "billing_batches_contractor_id_fkey" FOREIGN KEY ("contractor_id") REFERENCES "public"."contractors"("id");



ALTER TABLE ONLY "public"."care_team_members"
    ADD CONSTRAINT "care_team_members_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."care_team_members"
    ADD CONSTRAINT "care_team_members_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "public"."professionals"("id");



ALTER TABLE ONLY "public"."care_team_members"
    ADD CONSTRAINT "care_team_members_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."care_team_members"
    ADD CONSTRAINT "care_team_members_user_profile_id_fkey" FOREIGN KEY ("user_profile_id") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."financial_ledger_entries"
    ADD CONSTRAINT "financial_ledger_entries_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."financial_ledger_entries"
    ADD CONSTRAINT "financial_ledger_entries_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."financial_records"
    ADD CONSTRAINT "financial_records_billing_batch_id_fkey" FOREIGN KEY ("billing_batch_id") REFERENCES "public"."billing_batches"("id");



ALTER TABLE ONLY "public"."financial_records"
    ADD CONSTRAINT "financial_records_contractor_id_fkey" FOREIGN KEY ("contractor_id") REFERENCES "public"."contractors"("id");



ALTER TABLE ONLY "public"."financial_records"
    ADD CONSTRAINT "financial_records_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."patient_admin_info"
    ADD CONSTRAINT "fk_payer_admin_contact" FOREIGN KEY ("payer_admin_contact_id") REFERENCES "public"."patient_related_persons"("id");



ALTER TABLE ONLY "public"."patient_admin_info"
    ADD CONSTRAINT "fk_primary_payer_person" FOREIGN KEY ("primary_payer_related_person_id") REFERENCES "public"."patient_related_persons"("id");



ALTER TABLE ONLY "public"."inventory_movements"
    ADD CONSTRAINT "inventory_movements_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "public"."inventory_items"("id");



ALTER TABLE ONLY "public"."inventory_movements"
    ADD CONSTRAINT "inventory_movements_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id");



ALTER TABLE ONLY "public"."inventory_movements"
    ADD CONSTRAINT "inventory_movements_performed_by_fkey" FOREIGN KEY ("performed_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."inventory_movements"
    ADD CONSTRAINT "inventory_movements_related_asset_id_fkey" FOREIGN KEY ("related_asset_id") REFERENCES "public"."patient_assigned_assets"("id");



ALTER TABLE ONLY "public"."inventory_movements"
    ADD CONSTRAINT "inventory_movements_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."patient_addresses"
    ADD CONSTRAINT "patient_addresses_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."patient_admin_info"
    ADD CONSTRAINT "patient_admin_info_chk_address_proof_by_fkey" FOREIGN KEY ("chk_address_proof_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."patient_admin_info"
    ADD CONSTRAINT "patient_admin_info_chk_address_proof_doc_id_fkey" FOREIGN KEY ("chk_address_proof_doc_id") REFERENCES "public"."patient_documents"("id");



ALTER TABLE ONLY "public"."patient_admin_info"
    ADD CONSTRAINT "patient_admin_info_chk_consent_doc_id_fkey" FOREIGN KEY ("chk_consent_doc_id") REFERENCES "public"."patient_documents"("id");



ALTER TABLE ONLY "public"."patient_admin_info"
    ADD CONSTRAINT "patient_admin_info_chk_contract_doc_id_fkey" FOREIGN KEY ("chk_contract_doc_id") REFERENCES "public"."patient_documents"("id");



ALTER TABLE ONLY "public"."patient_admin_info"
    ADD CONSTRAINT "patient_admin_info_chk_financial_docs_doc_id_fkey" FOREIGN KEY ("chk_financial_docs_doc_id") REFERENCES "public"."patient_documents"("id");



ALTER TABLE ONLY "public"."patient_admin_info"
    ADD CONSTRAINT "patient_admin_info_chk_financial_responsible_docs_by_fkey" FOREIGN KEY ("chk_financial_responsible_docs_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."patient_admin_info"
    ADD CONSTRAINT "patient_admin_info_chk_judicial_by_fkey" FOREIGN KEY ("chk_judicial_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."patient_admin_info"
    ADD CONSTRAINT "patient_admin_info_chk_judicial_doc_id_fkey" FOREIGN KEY ("chk_judicial_doc_id") REFERENCES "public"."patient_documents"("id");



ALTER TABLE ONLY "public"."patient_admin_info"
    ADD CONSTRAINT "patient_admin_info_chk_legal_docs_doc_id_fkey" FOREIGN KEY ("chk_legal_docs_doc_id") REFERENCES "public"."patient_documents"("id");



ALTER TABLE ONLY "public"."patient_admin_info"
    ADD CONSTRAINT "patient_admin_info_chk_legal_guardian_docs_by_fkey" FOREIGN KEY ("chk_legal_guardian_docs_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."patient_admin_info"
    ADD CONSTRAINT "patient_admin_info_chk_medical_report_doc_id_fkey" FOREIGN KEY ("chk_medical_report_doc_id") REFERENCES "public"."patient_documents"("id");



ALTER TABLE ONLY "public"."patient_admin_info"
    ADD CONSTRAINT "patient_admin_info_chk_other_docs_by_fkey" FOREIGN KEY ("chk_other_docs_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."patient_admin_info"
    ADD CONSTRAINT "patient_admin_info_commercial_responsible_id_fkey" FOREIGN KEY ("commercial_responsible_id") REFERENCES "public"."user_profiles"("auth_user_id");



ALTER TABLE ONLY "public"."patient_admin_info"
    ADD CONSTRAINT "patient_admin_info_contract_manager_id_fkey" FOREIGN KEY ("contract_manager_id") REFERENCES "public"."user_profiles"("auth_user_id");



ALTER TABLE ONLY "public"."patient_admin_info"
    ADD CONSTRAINT "patient_admin_info_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."patient_admin_info"
    ADD CONSTRAINT "patient_admin_info_payer_admin_contact_id_fkey" FOREIGN KEY ("payer_admin_contact_id") REFERENCES "public"."patient_related_persons"("id");



ALTER TABLE ONLY "public"."patient_admin_info"
    ADD CONSTRAINT "patient_admin_info_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."patient_administrative_profiles"
    ADD CONSTRAINT "patient_administrative_profiles_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."patient_allergies"
    ADD CONSTRAINT "patient_allergies_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."patient_allergies"
    ADD CONSTRAINT "patient_allergies_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."patient_assigned_assets"
    ADD CONSTRAINT "patient_assigned_assets_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "public"."inventory_items"("id");



ALTER TABLE ONLY "public"."patient_assigned_assets"
    ADD CONSTRAINT "patient_assigned_assets_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."patient_assigned_assets"
    ADD CONSTRAINT "patient_assigned_assets_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."patient_civil_documents"
    ADD CONSTRAINT "patient_civil_documents_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."patient_civil_documents"
    ADD CONSTRAINT "patient_civil_documents_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."patient_clinical_profiles"
    ADD CONSTRAINT "patient_clinical_profiles_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."patient_clinical_summaries"
    ADD CONSTRAINT "patient_clinical_summaries_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."patient_clinical_summaries"
    ADD CONSTRAINT "patient_clinical_summaries_reference_professional_id_fkey" FOREIGN KEY ("reference_professional_id") REFERENCES "public"."professionals"("id");



ALTER TABLE ONLY "public"."patient_clinical_summaries"
    ADD CONSTRAINT "patient_clinical_summaries_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."patient_consumables_stock"
    ADD CONSTRAINT "patient_consumables_stock_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "public"."inventory_items"("id");



ALTER TABLE ONLY "public"."patient_consumables_stock"
    ADD CONSTRAINT "patient_consumables_stock_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."patient_consumables_stock"
    ADD CONSTRAINT "patient_consumables_stock_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."patient_devices"
    ADD CONSTRAINT "patient_devices_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."patient_devices"
    ADD CONSTRAINT "patient_devices_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."patient_document_logs"
    ADD CONSTRAINT "patient_document_logs_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."patient_documents"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."patient_document_logs"
    ADD CONSTRAINT "patient_document_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."patient_document_logs"
    ADD CONSTRAINT "patient_document_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."patient_documents"
    ADD CONSTRAINT "patient_documents_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."patient_documents"
    ADD CONSTRAINT "patient_documents_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."patient_documents"
    ADD CONSTRAINT "patient_documents_finance_entry_id_fkey" FOREIGN KEY ("finance_entry_id") REFERENCES "public"."financial_ledger_entries"("id");



ALTER TABLE ONLY "public"."patient_documents"
    ADD CONSTRAINT "patient_documents_last_updated_by_fkey" FOREIGN KEY ("last_updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."patient_documents"
    ADD CONSTRAINT "patient_documents_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."patient_documents"
    ADD CONSTRAINT "patient_documents_previous_document_id_fkey" FOREIGN KEY ("previous_document_id") REFERENCES "public"."patient_documents"("id");



ALTER TABLE ONLY "public"."patient_documents"
    ADD CONSTRAINT "patient_documents_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."patient_documents"
    ADD CONSTRAINT "patient_documents_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."patient_documents"
    ADD CONSTRAINT "patient_documents_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."patient_domiciles"
    ADD CONSTRAINT "patient_domiciles_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."patient_financial_profiles"
    ADD CONSTRAINT "patient_financial_profiles_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."patient_financial_profiles"
    ADD CONSTRAINT "patient_financial_profiles_responsible_related_person_id_fkey" FOREIGN KEY ("responsible_related_person_id") REFERENCES "public"."patient_related_persons"("id");



ALTER TABLE ONLY "public"."patient_financial_profiles"
    ADD CONSTRAINT "patient_financial_profiles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."patient_household_members"
    ADD CONSTRAINT "patient_household_members_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."patient_inventory"
    ADD CONSTRAINT "patient_inventory_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "public"."inventory_items"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."patient_inventory"
    ADD CONSTRAINT "patient_inventory_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."patient_medications"
    ADD CONSTRAINT "patient_medications_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."patient_oxygen_therapy"
    ADD CONSTRAINT "patient_oxygen_therapy_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."patient_oxygen_therapy"
    ADD CONSTRAINT "patient_oxygen_therapy_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."patient_related_persons"
    ADD CONSTRAINT "patient_related_persons_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."patient_related_persons"
    ADD CONSTRAINT "patient_related_persons_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."patient_risk_scores"
    ADD CONSTRAINT "patient_risk_scores_assessed_by_fkey" FOREIGN KEY ("assessed_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."patient_risk_scores"
    ADD CONSTRAINT "patient_risk_scores_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."patient_risk_scores"
    ADD CONSTRAINT "patient_risk_scores_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."patient_schedule_settings"
    ADD CONSTRAINT "patient_schedule_settings_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."patient_services"
    ADD CONSTRAINT "patient_services_contractor_id_fkey" FOREIGN KEY ("contractor_id") REFERENCES "public"."contractors"("id");



ALTER TABLE ONLY "public"."patient_services"
    ADD CONSTRAINT "patient_services_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id");



ALTER TABLE ONLY "public"."patients"
    ADD CONSTRAINT "patients_doc_validated_by_fkey" FOREIGN KEY ("doc_validated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."patients"
    ADD CONSTRAINT "patients_primary_contractor_id_fkey" FOREIGN KEY ("primary_contractor_id") REFERENCES "public"."contractors"("id");



ALTER TABLE ONLY "public"."professionals"
    ADD CONSTRAINT "professionals_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."shift_candidates"
    ADD CONSTRAINT "shift_candidates_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "public"."professional_profiles"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."shift_candidates"
    ADD CONSTRAINT "shift_candidates_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "public"."shifts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."shift_disputes"
    ADD CONSTRAINT "shift_disputes_opened_by_fkey" FOREIGN KEY ("opened_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."shift_disputes"
    ADD CONSTRAINT "shift_disputes_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "public"."shifts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."shift_internal_notes"
    ADD CONSTRAINT "shift_internal_notes_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "public"."shifts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."shift_timeline_events"
    ADD CONSTRAINT "shift_timeline_events_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."shift_timeline_events"
    ADD CONSTRAINT "shift_timeline_events_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "public"."shifts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."shifts"
    ADD CONSTRAINT "shifts_billing_batch_id_fkey" FOREIGN KEY ("billing_batch_id") REFERENCES "public"."billing_batches"("id");



ALTER TABLE ONLY "public"."shifts"
    ADD CONSTRAINT "shifts_contractor_id_fkey" FOREIGN KEY ("contractor_id") REFERENCES "public"."contractors"("id");



ALTER TABLE ONLY "public"."shifts"
    ADD CONSTRAINT "shifts_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id");



ALTER TABLE ONLY "public"."shifts"
    ADD CONSTRAINT "shifts_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "public"."professional_profiles"("user_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."shifts"
    ADD CONSTRAINT "shifts_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."patient_services"("id");



ALTER TABLE ONLY "public"."system_audit_logs"
    ADD CONSTRAINT "system_audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_auth_user_id_fkey" FOREIGN KEY ("auth_user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE SET NULL;



CREATE POLICY "Admins read tenant profiles" ON "public"."user_profiles" FOR SELECT USING (("tenant_id" IN ( SELECT "user_profiles_1"."tenant_id"
   FROM "public"."user_profiles" "user_profiles_1"
  WHERE ("user_profiles_1"."auth_user_id" = "auth"."uid"()))));



CREATE POLICY "Audit: Admin Read" ON "public"."system_audit_logs" FOR SELECT USING (true);



CREATE POLICY "Audit: Insert Only" ON "public"."system_audit_logs" FOR INSERT WITH CHECK (true);



CREATE POLICY "Authenticated: Full Access" ON "public"."billing_batches" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Authenticated: Full Access" ON "public"."contractors" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Authenticated: Full Access" ON "public"."financial_records" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Authenticated: Full Access" ON "public"."integration_configs" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Authenticated: Full Access" ON "public"."inventory_items" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Authenticated: Full Access" ON "public"."patient_addresses" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Authenticated: Full Access" ON "public"."patient_administrative_profiles" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Authenticated: Full Access" ON "public"."patient_clinical_profiles" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Authenticated: Full Access" ON "public"."patient_domiciles" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Authenticated: Full Access" ON "public"."patient_financial_profiles" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Authenticated: Full Access" ON "public"."patient_household_members" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Authenticated: Full Access" ON "public"."patient_inventory" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Authenticated: Full Access" ON "public"."patient_medications" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Authenticated: Full Access" ON "public"."patient_schedule_settings" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Authenticated: Full Access" ON "public"."patient_services" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Authenticated: Full Access" ON "public"."patients" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Authenticated: Full Access" ON "public"."professional_profiles" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Authenticated: Full Access" ON "public"."services" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Authenticated: Full Access" ON "public"."shift_candidates" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Authenticated: Full Access" ON "public"."shift_disputes" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Authenticated: Full Access" ON "public"."shift_internal_notes" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Authenticated: Full Access" ON "public"."shift_timeline_events" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Authenticated: Full Access" ON "public"."shifts" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Authenticated: Full Access" ON "public"."system_audit_logs" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Authenticated: Full Access" ON "public"."tenants" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Dev: Full Access Admin Profile" ON "public"."patient_administrative_profiles" USING (true) WITH CHECK (true);



CREATE POLICY "Dev: Full Access Candidates" ON "public"."shift_candidates" USING (true) WITH CHECK (true);



CREATE POLICY "Dev: Full Access Clinical" ON "public"."patient_clinical_profiles" USING (true) WITH CHECK (true);



CREATE POLICY "Dev: Full Access Disputes" ON "public"."shift_disputes" USING (true) WITH CHECK (true);



CREATE POLICY "Dev: Full Access Domicile" ON "public"."patient_domiciles" USING (true) WITH CHECK (true);



CREATE POLICY "Dev: Full Access Financial" ON "public"."patient_financial_profiles" USING (true) WITH CHECK (true);



CREATE POLICY "Dev: Full Access Household" ON "public"."patient_household_members" USING (true) WITH CHECK (true);



CREATE POLICY "Dev: Full Access Integrations" ON "public"."integration_configs" USING (true) WITH CHECK (true);



CREATE POLICY "Dev: Full Access Inventory" ON "public"."inventory_items" USING (true) WITH CHECK (true);



CREATE POLICY "Dev: Full Access Meds" ON "public"."patient_medications" USING (true) WITH CHECK (true);



CREATE POLICY "Dev: Full Access Notes" ON "public"."shift_internal_notes" USING (true) WITH CHECK (true);



CREATE POLICY "Dev: Full Access Patient Inv" ON "public"."patient_inventory" USING (true) WITH CHECK (true);



CREATE POLICY "Dev: Full Access Professionals" ON "public"."professional_profiles" USING (true) WITH CHECK (true);



CREATE POLICY "Dev: Full Access Schedule Settings" ON "public"."patient_schedule_settings" USING (true) WITH CHECK (true);



CREATE POLICY "Dev: Full Access Services" ON "public"."services" USING (true) WITH CHECK (true);



CREATE POLICY "Dev: Full Access Timeline" ON "public"."shift_timeline_events" USING (true) WITH CHECK (true);



CREATE POLICY "Prod: Tenant Isolation Read" ON "public"."patients" FOR SELECT USING (("tenant_id" = (("auth"."jwt"() ->> 'tenant_id'::"text"))::"uuid"));



CREATE POLICY "Prod: Tenant Isolation Write" ON "public"."patients" FOR INSERT WITH CHECK (("tenant_id" = (("auth"."jwt"() ->> 'tenant_id'::"text"))::"uuid"));



CREATE POLICY "Tenant Isolation Insert" ON "public"."patient_documents" FOR INSERT WITH CHECK ((("tenant_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'tenant_id'::"text"))::"uuid") OR ("auth"."role"() = 'service_role'::"text")));



CREATE POLICY "Tenant Isolation Modify" ON "public"."patient_documents" FOR UPDATE USING ((("tenant_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'tenant_id'::"text"))::"uuid") OR ("auth"."role"() = 'service_role'::"text")));



CREATE POLICY "Tenant Isolation Select" ON "public"."patient_documents" FOR SELECT USING ((("tenant_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'tenant_id'::"text"))::"uuid") OR ("auth"."role"() = 'service_role'::"text")));



CREATE POLICY "Users can read own profile" ON "public"."user_profiles" FOR SELECT USING (("auth_user_id" = "auth"."uid"()));



CREATE POLICY "admin_info_all" ON "public"."patient_admin_info" USING ((("tenant_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'tenant_id'::"text"))::"uuid") OR ("auth"."role"() = 'service_role'::"text")));



CREATE POLICY "admin_info_select" ON "public"."patient_admin_info" FOR SELECT USING ((("tenant_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'tenant_id'::"text"))::"uuid") OR ("auth"."role"() = 'service_role'::"text")));



CREATE POLICY "allergies_all" ON "public"."patient_allergies" USING ((("tenant_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'tenant_id'::"text"))::"uuid") OR ("auth"."role"() = 'service_role'::"text")));



ALTER TABLE "public"."billing_batches" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "care_team_all" ON "public"."care_team_members" USING ((("tenant_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'tenant_id'::"text"))::"uuid") OR ("auth"."role"() = 'service_role'::"text")));



ALTER TABLE "public"."care_team_members" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "care_team_select" ON "public"."care_team_members" FOR SELECT USING ((("tenant_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'tenant_id'::"text"))::"uuid") OR ("auth"."role"() = 'service_role'::"text")));



CREATE POLICY "civil_docs_all" ON "public"."patient_civil_documents" USING ((("tenant_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'tenant_id'::"text"))::"uuid") OR ("auth"."role"() = 'service_role'::"text")));



CREATE POLICY "civil_docs_delete_tenant" ON "public"."patient_civil_documents" FOR DELETE USING (("tenant_id" = ( SELECT "auth"."uid"() AS "uid"
   FROM "auth"."users"
  WHERE ("users"."id" = "auth"."uid"()))));



CREATE POLICY "civil_docs_policy" ON "public"."patient_civil_documents" USING ((("tenant_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'tenant_id'::"text"))::"uuid") OR ("auth"."role"() = 'service_role'::"text")));



CREATE POLICY "civil_docs_select_tenant" ON "public"."patient_civil_documents" FOR SELECT USING ((("tenant_id" = ("current_setting"('request.jwt.claim.tenant_id'::"text", true))::"uuid") OR ("auth"."role"() = 'service_role'::"text")));



CREATE POLICY "civil_docs_update_tenant" ON "public"."patient_civil_documents" FOR UPDATE USING (("tenant_id" = ( SELECT "auth"."uid"() AS "uid"
   FROM "auth"."users"
  WHERE ("users"."id" = "auth"."uid"()))));



CREATE POLICY "civil_docs_upsert_tenant" ON "public"."patient_civil_documents" USING ((("tenant_id" = ("current_setting"('request.jwt.claim.tenant_id'::"text", true))::"uuid") OR ("auth"."role"() = 'service_role'::"text"))) WITH CHECK ((("tenant_id" = ("current_setting"('request.jwt.claim.tenant_id'::"text", true))::"uuid") OR ("auth"."role"() = 'service_role'::"text")));



CREATE POLICY "clinical_summary_all" ON "public"."patient_clinical_summaries" USING ((("tenant_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'tenant_id'::"text"))::"uuid") OR ("auth"."role"() = 'service_role'::"text")));



CREATE POLICY "clinical_summary_select" ON "public"."patient_clinical_summaries" FOR SELECT USING ((("tenant_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'tenant_id'::"text"))::"uuid") OR ("auth"."role"() = 'service_role'::"text")));



ALTER TABLE "public"."contractors" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "devices_all" ON "public"."patient_devices" USING ((("tenant_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'tenant_id'::"text"))::"uuid") OR ("auth"."role"() = 'service_role'::"text")));



CREATE POLICY "doc_logs_insert" ON "public"."patient_document_logs" FOR INSERT WITH CHECK ((("tenant_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'tenant_id'::"text"))::"uuid") OR ("auth"."role"() = 'service_role'::"text")));



CREATE POLICY "doc_logs_select" ON "public"."patient_document_logs" FOR SELECT USING ((("tenant_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'tenant_id'::"text"))::"uuid") OR ("auth"."role"() = 'service_role'::"text")));



CREATE POLICY "fin_profile_all" ON "public"."patient_financial_profiles" USING ((("tenant_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'tenant_id'::"text"))::"uuid") OR ("auth"."role"() = 'service_role'::"text")));



ALTER TABLE "public"."financial_ledger_entries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."financial_records" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."integration_configs" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "inv_assets_all" ON "public"."patient_assigned_assets" USING ((("tenant_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'tenant_id'::"text"))::"uuid") OR ("auth"."role"() = 'service_role'::"text")));



CREATE POLICY "inv_items_select" ON "public"."inventory_items" FOR SELECT USING ((("tenant_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'tenant_id'::"text"))::"uuid") OR ("auth"."role"() = 'service_role'::"text")));



CREATE POLICY "inv_move_all" ON "public"."inventory_movements" USING ((("tenant_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'tenant_id'::"text"))::"uuid") OR ("auth"."role"() = 'service_role'::"text")));



CREATE POLICY "inv_stock_all" ON "public"."patient_consumables_stock" USING ((("tenant_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'tenant_id'::"text"))::"uuid") OR ("auth"."role"() = 'service_role'::"text")));



ALTER TABLE "public"."inventory_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."inventory_movements" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "ledger_all" ON "public"."financial_ledger_entries" USING ((("tenant_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'tenant_id'::"text"))::"uuid") OR ("auth"."role"() = 'service_role'::"text")));



CREATE POLICY "ledger_select" ON "public"."financial_ledger_entries" FOR SELECT USING ((("tenant_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'tenant_id'::"text"))::"uuid") OR ("auth"."role"() = 'service_role'::"text")));



CREATE POLICY "oxygen_all" ON "public"."patient_oxygen_therapy" USING ((("tenant_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'tenant_id'::"text"))::"uuid") OR ("auth"."role"() = 'service_role'::"text")));



ALTER TABLE "public"."patient_addresses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."patient_admin_info" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."patient_administrative_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."patient_allergies" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."patient_assigned_assets" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."patient_civil_documents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."patient_clinical_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."patient_clinical_summaries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."patient_consumables_stock" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."patient_devices" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."patient_document_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."patient_documents" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "patient_documents_insert_authenticated" ON "public"."patient_documents" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "patient_documents_select_authenticated" ON "public"."patient_documents" FOR SELECT TO "authenticated" USING ((("is_visible_admin" = true) OR (("is_visible_clinical" = true) AND (EXISTS ( SELECT 1
   FROM ("public"."user_profiles" "up"
     JOIN "public"."care_team_members" "cm" ON (("cm"."user_profile_id" = "up"."id")))
  WHERE (("up"."auth_user_id" = "auth"."uid"()) AND ("cm"."patient_id" = "patient_documents"."patient_id") AND (("cm"."start_date" IS NULL) OR ("cm"."start_date" <= "now"())) AND (("cm"."end_date" IS NULL) OR ("cm"."end_date" >= "now"()))))))));



CREATE POLICY "patient_documents_update_authenticated" ON "public"."patient_documents" FOR UPDATE TO "authenticated" USING ((("is_visible_admin" = true) OR (("is_visible_clinical" = true) AND (EXISTS ( SELECT 1
   FROM ("public"."user_profiles" "up"
     JOIN "public"."care_team_members" "cm" ON (("cm"."user_profile_id" = "up"."id")))
  WHERE (("up"."auth_user_id" = "auth"."uid"()) AND ("cm"."patient_id" = "patient_documents"."patient_id") AND (("cm"."start_date" IS NULL) OR ("cm"."start_date" <= "now"())) AND (("cm"."end_date" IS NULL) OR ("cm"."end_date" >= "now"())))))))) WITH CHECK ((("is_visible_admin" = true) OR (("is_visible_clinical" = true) AND (EXISTS ( SELECT 1
   FROM ("public"."user_profiles" "up"
     JOIN "public"."care_team_members" "cm" ON (("cm"."user_profile_id" = "up"."id")))
  WHERE (("up"."auth_user_id" = "auth"."uid"()) AND ("cm"."patient_id" = "patient_documents"."patient_id") AND (("cm"."start_date" IS NULL) OR ("cm"."start_date" <= "now"())) AND (("cm"."end_date" IS NULL) OR ("cm"."end_date" >= "now"()))))))));



ALTER TABLE "public"."patient_domiciles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."patient_financial_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."patient_household_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."patient_inventory" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."patient_medications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."patient_oxygen_therapy" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."patient_related_persons" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."patient_risk_scores" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."patient_schedule_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."patient_services" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."patients" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."professional_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."professionals" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "professionals_read_tenant" ON "public"."professionals" FOR SELECT USING ((("tenant_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'tenant_id'::"text"))::"uuid") OR ("auth"."role"() = 'service_role'::"text")));



CREATE POLICY "related_persons_all" ON "public"."patient_related_persons" USING ((("tenant_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'tenant_id'::"text"))::"uuid") OR ("auth"."role"() = 'service_role'::"text")));



CREATE POLICY "related_persons_authenticated_any" ON "public"."patient_related_persons" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "related_persons_select" ON "public"."patient_related_persons" FOR SELECT USING ((("tenant_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'tenant_id'::"text"))::"uuid") OR ("auth"."role"() = 'service_role'::"text")));



CREATE POLICY "risks_all" ON "public"."patient_risk_scores" USING ((("tenant_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'tenant_id'::"text"))::"uuid") OR ("auth"."role"() = 'service_role'::"text")));



ALTER TABLE "public"."services" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."shift_candidates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."shift_disputes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."shift_internal_notes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."shift_timeline_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."shifts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."system_audit_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tenants" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_profiles" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."_create_audit_trigger"("tbl" "text", "trg" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."_create_audit_trigger"("tbl" "text", "trg" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_create_audit_trigger"("tbl" "text", "trg" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."create_audit_trigger"("p_schema" "text", "p_table" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."create_audit_trigger"("p_schema" "text", "p_table" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_audit_trigger"("p_schema" "text", "p_table" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_executive_kpis"("start_date" "date", "end_date" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."get_executive_kpis"("start_date" "date", "end_date" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_executive_kpis"("start_date" "date", "end_date" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."log_patient_change"() TO "anon";
GRANT ALL ON FUNCTION "public"."log_patient_change"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_patient_change"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."log_row_change"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."log_row_change"() TO "anon";
GRANT ALL ON FUNCTION "public"."log_row_change"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_patient_guardian_flag"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_patient_guardian_flag"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_patient_guardian_flag"() TO "service_role";


















GRANT ALL ON TABLE "public"."billing_batches" TO "anon";
GRANT ALL ON TABLE "public"."billing_batches" TO "authenticated";
GRANT ALL ON TABLE "public"."billing_batches" TO "service_role";



GRANT ALL ON TABLE "public"."care_team_members" TO "anon";
GRANT ALL ON TABLE "public"."care_team_members" TO "authenticated";
GRANT ALL ON TABLE "public"."care_team_members" TO "service_role";



GRANT ALL ON TABLE "public"."contractors" TO "anon";
GRANT ALL ON TABLE "public"."contractors" TO "authenticated";
GRANT ALL ON TABLE "public"."contractors" TO "service_role";



GRANT ALL ON TABLE "public"."financial_ledger_entries" TO "anon";
GRANT ALL ON TABLE "public"."financial_ledger_entries" TO "authenticated";
GRANT ALL ON TABLE "public"."financial_ledger_entries" TO "service_role";



GRANT ALL ON TABLE "public"."financial_records" TO "anon";
GRANT ALL ON TABLE "public"."financial_records" TO "authenticated";
GRANT ALL ON TABLE "public"."financial_records" TO "service_role";



GRANT ALL ON TABLE "public"."integration_configs" TO "anon";
GRANT ALL ON TABLE "public"."integration_configs" TO "authenticated";
GRANT ALL ON TABLE "public"."integration_configs" TO "service_role";



GRANT ALL ON TABLE "public"."inventory_items" TO "anon";
GRANT ALL ON TABLE "public"."inventory_items" TO "authenticated";
GRANT ALL ON TABLE "public"."inventory_items" TO "service_role";



GRANT ALL ON TABLE "public"."inventory_movements" TO "anon";
GRANT ALL ON TABLE "public"."inventory_movements" TO "authenticated";
GRANT ALL ON TABLE "public"."inventory_movements" TO "service_role";



GRANT ALL ON TABLE "public"."patient_addresses" TO "anon";
GRANT ALL ON TABLE "public"."patient_addresses" TO "authenticated";
GRANT ALL ON TABLE "public"."patient_addresses" TO "service_role";



GRANT ALL ON TABLE "public"."patient_admin_info" TO "anon";
GRANT ALL ON TABLE "public"."patient_admin_info" TO "authenticated";
GRANT ALL ON TABLE "public"."patient_admin_info" TO "service_role";



GRANT ALL ON TABLE "public"."patient_administrative_profiles" TO "anon";
GRANT ALL ON TABLE "public"."patient_administrative_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."patient_administrative_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."patient_allergies" TO "anon";
GRANT ALL ON TABLE "public"."patient_allergies" TO "authenticated";
GRANT ALL ON TABLE "public"."patient_allergies" TO "service_role";



GRANT ALL ON TABLE "public"."patient_assigned_assets" TO "anon";
GRANT ALL ON TABLE "public"."patient_assigned_assets" TO "authenticated";
GRANT ALL ON TABLE "public"."patient_assigned_assets" TO "service_role";



GRANT ALL ON TABLE "public"."patient_civil_documents" TO "anon";
GRANT ALL ON TABLE "public"."patient_civil_documents" TO "authenticated";
GRANT ALL ON TABLE "public"."patient_civil_documents" TO "service_role";



GRANT ALL ON TABLE "public"."patient_clinical_profiles" TO "anon";
GRANT ALL ON TABLE "public"."patient_clinical_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."patient_clinical_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."patient_clinical_summaries" TO "anon";
GRANT ALL ON TABLE "public"."patient_clinical_summaries" TO "authenticated";
GRANT ALL ON TABLE "public"."patient_clinical_summaries" TO "service_role";



GRANT ALL ON TABLE "public"."patient_consumables_stock" TO "anon";
GRANT ALL ON TABLE "public"."patient_consumables_stock" TO "authenticated";
GRANT ALL ON TABLE "public"."patient_consumables_stock" TO "service_role";



GRANT ALL ON TABLE "public"."patient_devices" TO "anon";
GRANT ALL ON TABLE "public"."patient_devices" TO "authenticated";
GRANT ALL ON TABLE "public"."patient_devices" TO "service_role";



GRANT ALL ON TABLE "public"."patient_document_logs" TO "anon";
GRANT ALL ON TABLE "public"."patient_document_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."patient_document_logs" TO "service_role";



GRANT ALL ON TABLE "public"."patient_documents" TO "anon";
GRANT ALL ON TABLE "public"."patient_documents" TO "authenticated";
GRANT ALL ON TABLE "public"."patient_documents" TO "service_role";



GRANT ALL ON TABLE "public"."patient_domiciles" TO "anon";
GRANT ALL ON TABLE "public"."patient_domiciles" TO "authenticated";
GRANT ALL ON TABLE "public"."patient_domiciles" TO "service_role";



GRANT ALL ON TABLE "public"."patient_financial_profiles" TO "anon";
GRANT ALL ON TABLE "public"."patient_financial_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."patient_financial_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."patient_household_members" TO "anon";
GRANT ALL ON TABLE "public"."patient_household_members" TO "authenticated";
GRANT ALL ON TABLE "public"."patient_household_members" TO "service_role";



GRANT ALL ON TABLE "public"."patient_inventory" TO "anon";
GRANT ALL ON TABLE "public"."patient_inventory" TO "authenticated";
GRANT ALL ON TABLE "public"."patient_inventory" TO "service_role";



GRANT ALL ON TABLE "public"."patient_medications" TO "anon";
GRANT ALL ON TABLE "public"."patient_medications" TO "authenticated";
GRANT ALL ON TABLE "public"."patient_medications" TO "service_role";



GRANT ALL ON TABLE "public"."patient_oxygen_therapy" TO "anon";
GRANT ALL ON TABLE "public"."patient_oxygen_therapy" TO "authenticated";
GRANT ALL ON TABLE "public"."patient_oxygen_therapy" TO "service_role";



GRANT ALL ON TABLE "public"."patient_related_persons" TO "anon";
GRANT ALL ON TABLE "public"."patient_related_persons" TO "authenticated";
GRANT ALL ON TABLE "public"."patient_related_persons" TO "service_role";



GRANT ALL ON TABLE "public"."patient_risk_scores" TO "anon";
GRANT ALL ON TABLE "public"."patient_risk_scores" TO "authenticated";
GRANT ALL ON TABLE "public"."patient_risk_scores" TO "service_role";



GRANT ALL ON TABLE "public"."patient_schedule_settings" TO "anon";
GRANT ALL ON TABLE "public"."patient_schedule_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."patient_schedule_settings" TO "service_role";



GRANT ALL ON TABLE "public"."patient_services" TO "anon";
GRANT ALL ON TABLE "public"."patient_services" TO "authenticated";
GRANT ALL ON TABLE "public"."patient_services" TO "service_role";



GRANT ALL ON TABLE "public"."patients" TO "anon";
GRANT ALL ON TABLE "public"."patients" TO "authenticated";
GRANT ALL ON TABLE "public"."patients" TO "service_role";



GRANT ALL ON TABLE "public"."professional_profiles" TO "anon";
GRANT ALL ON TABLE "public"."professional_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."professional_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."professionals" TO "anon";
GRANT ALL ON TABLE "public"."professionals" TO "authenticated";
GRANT ALL ON TABLE "public"."professionals" TO "service_role";



GRANT ALL ON TABLE "public"."services" TO "anon";
GRANT ALL ON TABLE "public"."services" TO "authenticated";
GRANT ALL ON TABLE "public"."services" TO "service_role";



GRANT ALL ON TABLE "public"."shift_candidates" TO "anon";
GRANT ALL ON TABLE "public"."shift_candidates" TO "authenticated";
GRANT ALL ON TABLE "public"."shift_candidates" TO "service_role";



GRANT ALL ON TABLE "public"."shift_disputes" TO "anon";
GRANT ALL ON TABLE "public"."shift_disputes" TO "authenticated";
GRANT ALL ON TABLE "public"."shift_disputes" TO "service_role";



GRANT ALL ON TABLE "public"."shift_internal_notes" TO "anon";
GRANT ALL ON TABLE "public"."shift_internal_notes" TO "authenticated";
GRANT ALL ON TABLE "public"."shift_internal_notes" TO "service_role";



GRANT ALL ON TABLE "public"."shift_timeline_events" TO "anon";
GRANT ALL ON TABLE "public"."shift_timeline_events" TO "authenticated";
GRANT ALL ON TABLE "public"."shift_timeline_events" TO "service_role";



GRANT ALL ON TABLE "public"."shifts" TO "anon";
GRANT ALL ON TABLE "public"."shifts" TO "authenticated";
GRANT ALL ON TABLE "public"."shifts" TO "service_role";



GRANT ALL ON TABLE "public"."system_audit_errors" TO "anon";
GRANT ALL ON TABLE "public"."system_audit_errors" TO "authenticated";
GRANT ALL ON TABLE "public"."system_audit_errors" TO "service_role";



GRANT ALL ON SEQUENCE "public"."system_audit_errors_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."system_audit_errors_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."system_audit_errors_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."system_audit_logs" TO "anon";
GRANT ALL ON TABLE "public"."system_audit_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."system_audit_logs" TO "service_role";



GRANT ALL ON TABLE "public"."tenants" TO "anon";
GRANT ALL ON TABLE "public"."tenants" TO "authenticated";
GRANT ALL ON TABLE "public"."tenants" TO "service_role";



GRANT ALL ON TABLE "public"."user_profiles" TO "anon";
GRANT ALL ON TABLE "public"."user_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."view_patient_legal_guardian_summary" TO "anon";
GRANT ALL ON TABLE "public"."view_patient_legal_guardian_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."view_patient_legal_guardian_summary" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































