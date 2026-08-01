-- att-gate: server-side @att.com enforcement.
-- Run in the att-gate project's SQL editor (Task 2 of the rollout plan),
-- then enable: Dashboard → Authentication → Hooks → Before User Created
--            → Postgres function → public.hook_restrict_signup_domain
--
-- D2 escape hatch: add specific external emails to the allowlist array.

create or replace function public.hook_restrict_signup_domain(event jsonb)
returns jsonb
language plpgsql
security definer
as $$
declare
  em text := lower(coalesce(event->'user'->>'email', ''));
  allowlist text[] := array[]::text[];  -- e.g. array['analyst@firm.com']
begin
  if em like '%@att.com' or em = any(allowlist) then
    return '{}'::jsonb;
  end if;
  return jsonb_build_object(
    'error', jsonb_build_object(
      'http_code', 403,
      'message', 'Only @att.com email addresses are authorized'
    )
  );
end;
$$;

grant execute on function public.hook_restrict_signup_domain to supabase_auth_admin;
revoke execute on function public.hook_restrict_signup_domain from authenticated, anon, public;

-- ---------------------------------------------------------------------------
-- FALLBACK ONLY: if "Before User Created" hooks are not offered on this
-- project tier, run this trigger instead. Do not run both.
-- ---------------------------------------------------------------------------
-- create or replace function public.enforce_att_domain()
-- returns trigger language plpgsql security definer as $$
-- begin
--   if lower(new.email) not like '%@att.com' then
--     raise exception 'Only @att.com email addresses are authorized';
--   end if;
--   return new;
-- end; $$;
--
-- create trigger enforce_att_domain_trg
--   before insert on auth.users
--   for each row execute function public.enforce_att_domain();
