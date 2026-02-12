-- Story 3.1: Invite code generation & management

-- 1. Create invite_status enum
CREATE TYPE public.invite_status AS ENUM ('unused', 'claimed');

-- 2. Create invite_codes table
CREATE TABLE public.invite_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sensei_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE CONSTRAINT invite_codes_code_format
    CHECK (length(code) = 8 AND code ~ '^[a-z0-9]+$'),
  shareable_url TEXT NOT NULL,
  status public.invite_status NOT NULL DEFAULT 'unused',
  claimed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Note: The UNIQUE constraint on `code` automatically creates a btree index.
-- This index is used by the claim flow (Story 3.2) for lookups by code value.
-- No additional idx_invite_codes_code needed.

-- 3. Indexes
CREATE INDEX idx_invite_codes_sensei_id ON public.invite_codes(sensei_id);

-- 4. Auto-update trigger (reuses existing function from profiles migration)
CREATE TRIGGER invite_codes_updated_at
  BEFORE UPDATE ON public.invite_codes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 5. Enable RLS
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies

-- Senseis can see their own invite codes (with claimer profile join via application layer)
CREATE POLICY invite_codes_select_own_sensei ON public.invite_codes
  FOR SELECT USING (sensei_id = auth.uid());

-- Any authenticated user can SELECT invite codes.
-- Required for the claim flow (Story 3.2) — learner visits /invite/{slug}-{code}
-- and needs to read the code record to display sensei info and claim it.
-- RLS returns the full row; application layer controls what is displayed.
CREATE POLICY invite_codes_select_authenticated ON public.invite_codes
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Admin/platform_admin can read all invite codes (for moderation).
-- Note: Currently redundant with invite_codes_select_authenticated (any authenticated
-- user can SELECT). Added explicitly for forward-compatibility — if the broad
-- policy is later restricted, this ensures admin access continues without migration.
CREATE POLICY invite_codes_select_admin ON public.invite_codes
  FOR SELECT USING (
    public.get_user_role() IN ('admin', 'platform_admin')
  );

-- Senseis can create invite codes for themselves only
-- Role check ensures only senseis can insert, not just any authenticated user
CREATE POLICY invite_codes_insert_own_sensei ON public.invite_codes
  FOR INSERT WITH CHECK (
    sensei_id = auth.uid()
    AND public.get_user_role() = 'sensei'
  );

-- UPDATE policy: Only the claim flow (Story 3.2) updates invite codes.
-- Story 3.2 will add the UPDATE policy. No UPDATE policy in this story.

-- No DELETE policy — invite codes cannot be deleted by users.

-- 7. Helper function to generate 8-char lowercase alphanumeric codes
-- Uses gen_random_uuid() and extracts hex chars. VOLATILE because each call
-- must return a different value (gen_random_uuid() is non-deterministic).
-- Called from application layer or available for seed scripts/admin tools.
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS TEXT
LANGUAGE sql
VOLATILE
AS $$
  SELECT lower(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))
$$;

-- Restrict function execution to authenticated users only
REVOKE EXECUTE ON FUNCTION public.generate_invite_code() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.generate_invite_code() TO authenticated;
