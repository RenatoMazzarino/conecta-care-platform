-- CONTRATO: docs/contracts/pacientes/ABA01_DADOS_PESSOAIS.md
-- Objetivo: suportar tenant_id vindo do JWT de forma "produção-first".
-- Ordem de resolução:
-- 1) auth.jwt()->>'tenant_id'
-- 2) auth.jwt()->'app_metadata'->>'tenant_id' (padrão comum do Supabase)
-- 3) current_setting('app.tenant_id', true) (cenários controlados)

create schema if not exists app_private;

create or replace function app_private.current_tenant_id()
returns uuid
language plpgsql
stable
as $$
declare
  jwt_tenant_id text;
  jwt_app_metadata_tenant_id text;
  setting_tenant_id text;
begin
  jwt_tenant_id := auth.jwt()->>'tenant_id';
  if jwt_tenant_id is not null and jwt_tenant_id <> '' then
    return jwt_tenant_id::uuid;
  end if;

  jwt_app_metadata_tenant_id := auth.jwt()->'app_metadata'->>'tenant_id';
  if jwt_app_metadata_tenant_id is not null and jwt_app_metadata_tenant_id <> '' then
    return jwt_app_metadata_tenant_id::uuid;
  end if;

  setting_tenant_id := current_setting('app.tenant_id', true);
  if setting_tenant_id is not null and setting_tenant_id <> '' then
    return setting_tenant_id::uuid;
  end if;

  raise exception 'tenant_id ausente (defina auth.jwt()->>tenant_id, auth.jwt()->app_metadata.tenant_id ou current_setting(app.tenant_id))'
    using errcode = '22023';
end;
$$;

