-- Migration: stop anon / authenticated from calling two trigger functions over the REST API.
--
-- Supabase security advisors 0028 (anon) and 0029 (authenticated) flag:
--   public.handle_new_user()   -- AFTER INSERT trigger on auth.users; creates the profile row
--   public.rls_auto_enable()   -- event trigger; enables RLS on any new public table
-- Both are SECURITY DEFINER, and EXECUTE on a function is granted to PUBLIC by default, so any
-- visitor (anon) or signed-in user (authenticated) can reach them at /rest/v1/rpc/<name>. These are
-- a table trigger and an event trigger; nothing should ever call them directly.
--
-- Fix (the advisor's first option): revoke EXECUTE from PUBLIC -- the source of the grant -- and,
-- for clarity, from the two API roles by name.
--   * It does NOT touch the triggers. PostgreSQL fires a trigger whether or not the triggering role
--     holds EXECUTE on the trigger function, and both functions are SECURITY DEFINER so they run as
--     their owner. Verified on a local Postgres 16: after this revoke, a low-privilege role is denied
--     a direct call ("permission denied for function ..."), yet its INSERT still fires the trigger and
--     the definer writes the protected row. So signup keeps creating profiles.
--   * SECURITY INVOKER (the advisor's other option) is not usable here: handle_new_user must write a
--     profile for a brand-new user, and rls_auto_enable must ALTER new tables; both need definer rights.
--   * The functions stay in public and stay SECURITY DEFINER; only who may CALL them changes.
--
-- rls_auto_enable() is not defined by any migration in this repo -- it exists only in the live
-- database (see the note the owner was given). The revoke is therefore guarded so this migration is
-- safe on a database built from the repo alone, where that function may be absent.
--
-- Idempotent: revoking a privilege a role does not hold is a no-op. One transaction.

begin;

-- handle_new_user() is created by 20261024120000_create_user_accounts.sql, so it is always present.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- rls_auto_enable() only in the live DB: revoke only if it is there.
do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    execute 'revoke execute on function public.rls_auto_enable() from public, anon, authenticated';
  end if;
end $$;

commit;

-- Check (run after): both should report the function is no longer executable by anon/authenticated.
-- The Supabase security advisors 0028 and 0029 should then show 0 findings.
--   select p.proname,
--          has_function_privilege('anon', p.oid, 'execute')          as anon_can_exec,
--          has_function_privilege('authenticated', p.oid, 'execute') as auth_can_exec
--   from pg_proc p join pg_namespace n on n.oid = p.pronamespace
--   where n.nspname = 'public' and p.proname in ('handle_new_user','rls_auto_enable');
