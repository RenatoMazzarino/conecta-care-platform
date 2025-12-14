-- Base do schema (fundação do banco novo)
-- Inclui: multi-tenant (tenant_id) + helpers de updated_at (trigger)

create schema if not exists app_private;

create or replace function app_private.current_tenant_id()
returns uuid
language plpgsql
stable
as $$
declare
  jwt_tenant_id text;
  setting_tenant_id text;
begin
  jwt_tenant_id := auth.jwt()->>'tenant_id';
  if jwt_tenant_id is not null and jwt_tenant_id <> '' then
    return jwt_tenant_id::uuid;
  end if;

  setting_tenant_id := current_setting('app.tenant_id', true);
  if setting_tenant_id is not null and setting_tenant_id <> '' then
    return setting_tenant_id::uuid;
  end if;

  raise exception 'tenant_id ausente (defina auth.jwt()->>tenant_id ou current_setting(app.tenant_id))'
    using errcode = '22023';
end;
$$;

create or replace function app_private.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function app_private.set_updated_at_trigger(target_table regclass)
returns void
language plpgsql
as $$
declare
  trigger_name text;
begin
  trigger_name := format('trg_touch_%s', replace(target_table::text, '.', '_'));

  execute format('drop trigger if exists %I on %s', trigger_name, target_table);
  execute format(
    'create trigger %I before update on %s for each row execute function app_private.touch_updated_at()',
    trigger_name,
    target_table
  );
end;
$$;
