-- Story 2.5: Add org/team columns and expand RLS policies

-- 1. Add nullable columns for future multi-tenancy (no FK — tables created in Epic 7/12)
ALTER TABLE public.profiles ADD COLUMN org_id UUID;
ALTER TABLE public.profiles ADD COLUMN team_id UUID;

-- 2. Drop existing overly-simple SELECT policy
DROP POLICY IF EXISTS profiles_select_own ON public.profiles;

-- 3. New SELECT policies (PostgreSQL OR's multiple SELECT policies — access if ANY returns true)

-- Users can read their own full profile
CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Any authenticated user can see sensei profiles (for discovery/listing)
-- NOTE: RLS is ROW-level only. This returns the FULL row including date_of_birth (PII).
-- Application layer MUST select only public columns: id, display_name, avatar_url, topics, role
-- SECURITY: date_of_birth exposure accepted for Phase 1 — mitigate with a restricted VIEW in a future security story
CREATE POLICY profiles_select_sensei ON public.profiles
  FOR SELECT USING (
    role = 'sensei'
    AND auth.uid() IS NOT NULL
  );

-- Helper function: read current user's role without triggering RLS recursion
-- SECURITY DEFINER bypasses RLS so this can query profiles directly
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS public.user_role
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;

-- Restrict get_user_role() to authenticated only (SECURITY DEFINER — minimize attack surface)
REVOKE EXECUTE ON FUNCTION public.get_user_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;

-- Admin and platform_admin can read all profiles
CREATE POLICY profiles_select_admin ON public.profiles
  FOR SELECT USING (
    public.get_user_role() IN ('admin', 'platform_admin')
  );

-- 4. UPDATE policy: keep existing profiles_update_own (users update own profile only)
-- Already exists from migration 20260210034001 — no change needed

-- 5. No INSERT policy — profiles created only via handle_new_user() SECURITY DEFINER trigger
-- 6. No DELETE policy — profile deletion not supported in Phase 1
