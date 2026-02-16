-- Story 3.2: Learner claims invite code — connections table + claim flow

-- 1. Create connection_status enum
CREATE TYPE public.connection_status AS ENUM ('active', 'archived');

-- 2. Create connections table
CREATE TABLE public.connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sensei_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  learner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status public.connection_status NOT NULL DEFAULT 'active',
  connected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_interaction_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT connections_unique_pair UNIQUE (sensei_id, learner_id)
);

-- 3. Indexes
CREATE INDEX idx_connections_sensei_id ON public.connections(sensei_id);
CREATE INDEX idx_connections_learner_id ON public.connections(learner_id);

-- 4. Auto-update trigger (reuses existing function from profiles migration)
CREATE TRIGGER connections_updated_at
  BEFORE UPDATE ON public.connections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 5. Enable RLS
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies

-- Senseis see their own connections (learners connected to them)
CREATE POLICY connections_select_own_sensei ON public.connections
  FOR SELECT USING (sensei_id = auth.uid());

-- Learners see their own connections (senseis they're connected to)
CREATE POLICY connections_select_own_learner ON public.connections
  FOR SELECT USING (learner_id = auth.uid());

-- Admin/platform_admin can read all connections
CREATE POLICY connections_select_admin ON public.connections
  FOR SELECT USING (
    public.get_user_role() IN ('admin', 'platform_admin')
  );

-- NO INSERT/UPDATE/DELETE policies for regular users.
-- All mutations go through SECURITY DEFINER functions (claim_invite_code).
-- This prevents users from creating arbitrary connections.

-- 7. get_invite_details() — Public invite page data loader
-- SECURITY DEFINER bypasses RLS so anon users can view invite details.
-- Returns sensei public profile + invite status + connection state for current user.
CREATE OR REPLACE FUNCTION public.get_invite_details(code_value text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_invite public.invite_codes%ROWTYPE;
  v_sensei RECORD;
  v_user_id uuid;
  v_is_connected boolean := false;
BEGIN
  -- Find invite code
  SELECT * INTO v_invite FROM public.invite_codes WHERE code = code_value;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- Get sensei public profile
  SELECT id, display_name, avatar_url, bio, topics
  INTO v_sensei
  FROM public.profiles WHERE id = v_invite.sensei_id;

  -- Check if current user has existing connection with this sensei
  v_user_id := auth.uid();
  IF v_user_id IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM public.connections
      WHERE sensei_id = v_invite.sensei_id AND learner_id = v_user_id
    ) INTO v_is_connected;
  END IF;

  RETURN jsonb_build_object(
    'code', v_invite.code,
    'status', v_invite.status,
    'sensei_id', v_invite.sensei_id,
    'sensei_display_name', v_sensei.display_name,
    'sensei_avatar_url', v_sensei.avatar_url,
    'sensei_bio', v_sensei.bio,
    'sensei_topics', v_sensei.topics,
    'is_connected', v_is_connected
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_invite_details(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_invite_details(text) TO anon, authenticated;

-- 8. claim_invite_code() — Atomic claim + connection creation
-- SECURITY DEFINER bypasses RLS to UPDATE invite_codes and INSERT connections.
-- Validates: auth, role, code exists, code unused, no duplicate connection.
-- Returns jsonb with success or error details.
CREATE OR REPLACE FUNCTION public.claim_invite_code(code_value text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid;
  v_user_role public.user_role;
  v_invite public.invite_codes%ROWTYPE;
  v_existing_connection uuid;
  v_sensei_name text;
BEGIN
  -- 1. Verify authenticated
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('error', 'not_authenticated');
  END IF;

  -- 2. Verify learner role
  SELECT role INTO v_user_role FROM public.profiles WHERE id = v_user_id;
  IF v_user_role IS NULL OR v_user_role != 'learner' THEN
    RETURN jsonb_build_object('error', 'not_learner');
  END IF;

  -- 3. Find and lock invite code (FOR UPDATE prevents race conditions)
  SELECT * INTO v_invite FROM public.invite_codes WHERE code = code_value FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'not_found');
  END IF;

  -- 4. Check code is unused (forward-compatible if enum gains 'expired'/'revoked' etc.)
  IF v_invite.status != 'unused' THEN
    RETURN jsonb_build_object('error', 'already_claimed');
  END IF;

  -- 5. Prevent self-connection (learner claiming their own code — shouldn't happen but defensive)
  IF v_invite.sensei_id = v_user_id THEN
    RETURN jsonb_build_object('error', 'self_connection');
  END IF;

  -- 6. Check no existing connection
  SELECT id INTO v_existing_connection
  FROM public.connections
  WHERE sensei_id = v_invite.sensei_id AND learner_id = v_user_id;
  IF FOUND THEN
    RETURN jsonb_build_object('error', 'already_connected');
  END IF;

  -- 7. Claim the invite code
  UPDATE public.invite_codes
  SET status = 'claimed', claimed_by = v_user_id, claimed_at = NOW()
  WHERE id = v_invite.id;

  -- 8. Create the connection
  INSERT INTO public.connections (sensei_id, learner_id, status, connected_at)
  VALUES (v_invite.sensei_id, v_user_id, 'active', NOW());

  -- 9. Get sensei name for success response
  SELECT display_name INTO v_sensei_name FROM public.profiles WHERE id = v_invite.sensei_id;

  RETURN jsonb_build_object(
    'success', true,
    'sensei_id', v_invite.sensei_id,
    'sensei_name', v_sensei_name
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.claim_invite_code(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_invite_code(text) TO authenticated;
