-- Migration: capture the rls_auto_enable() event trigger that already lives in the database.
--
-- Why this exists: the live project has an event trigger, `ensure_rls`, that runs
-- public.rls_auto_enable() after every CREATE TABLE in `public` and turns Row Level Security on for
-- the new table. It is a safety net: a table shipped without RLS would quietly be world-readable, and
-- nothing would announce it. No migration in this repo defined it, so a rebuild from the repo would
-- silently lose it. This migration writes it down so the repo can recreate it exactly.
--
-- The function body and the event-trigger definition are copied verbatim from the live object
-- (function owner postgres, event `ddl_command_end`, tags CREATE TABLE / CREATE TABLE AS / SELECT INTO).
-- Because it only records what is already there, you do NOT need to run it against the live database
-- (running it is harmless: create-or-replace redefines the same function, and the event trigger is
-- dropped and recreated identically). It matters for a fresh rebuild.
--
-- Like the other trigger function, it is SECURITY DEFINER (it must ALTER new tables), so EXECUTE is
-- revoked from the API roles here too (advisors 0028/0029). Creating an event trigger needs the
-- postgres role; the Supabase SQL editor runs as postgres.
--
-- Idempotent: create-or-replace, guarded revoke, drop-if-exists before create. One transaction.

begin;

create or replace function public.rls_auto_enable()
returns event_trigger
language plpgsql
security definer
set search_path to 'pg_catalog'
as $function$
DECLARE
  cmd record;
  tbl name;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        SELECT c.relname INTO tbl FROM pg_catalog.pg_class c WHERE c.oid = cmd.objid;
        EXECUTE format('alter table if exists %I.%I enable row level security', cmd.schema_name, tbl);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$function$;

-- It is a trigger function; no API role should call it over REST.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

-- The event trigger that drives it. Named `ensure_rls`, exactly as in the live database.
drop event trigger if exists ensure_rls;
create event trigger ensure_rls
  on ddl_command_end
  when tag in ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
  execute function public.rls_auto_enable();

commit;

-- Check (run after): the event trigger is present and enabled, and the API roles cannot call it.
--   select evtname, evtenabled,
--          has_function_privilege('anon','public.rls_auto_enable()','execute')          as anon_can_exec,
--          has_function_privilege('authenticated','public.rls_auto_enable()','execute') as auth_can_exec
--   from pg_event_trigger where evtname = 'ensure_rls';
