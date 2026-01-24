-- Fix infinite recursion in RLS on public.profiles by removing any dependency on public.profiles
-- inside helper functions used by policies.
--
-- Approach:
-- 1) Introduce a dedicated mapping table public.user_tenants (user_id -> company_id/association_id)
-- 2) Backfill from public.profiles
-- 3) Keep it in sync via triggers on public.profiles
-- 4) Rewrite get_user_company_id/get_user_association_id to read from user_tenants (NOT profiles)

-- 1) Mapping table
CREATE TABLE IF NOT EXISTS public.user_tenants (
  user_id uuid PRIMARY KEY,
  company_id uuid NULL,
  association_id uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_tenants ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view own tenant mapping" ON public.user_tenants;
CREATE POLICY "Users can view own tenant mapping"
ON public.user_tenants
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Super admins can manage tenant mappings" ON public.user_tenants;
CREATE POLICY "Super admins can manage tenant mappings"
ON public.user_tenants
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- 2) Backfill
INSERT INTO public.user_tenants (user_id, company_id, association_id)
SELECT p.id, p.company_id, p.association_id
FROM public.profiles p
ON CONFLICT (user_id)
DO UPDATE SET
  company_id = EXCLUDED.company_id,
  association_id = EXCLUDED.association_id,
  updated_at = now();

-- 3) Sync trigger from profiles
CREATE OR REPLACE FUNCTION public.sync_user_tenants_from_profiles()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_tenants (user_id, company_id, association_id)
  VALUES (NEW.id, NEW.company_id, NEW.association_id)
  ON CONFLICT (user_id)
  DO UPDATE SET
    company_id = EXCLUDED.company_id,
    association_id = EXCLUDED.association_id,
    updated_at = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_user_tenants_from_profiles_ins ON public.profiles;
CREATE TRIGGER sync_user_tenants_from_profiles_ins
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.sync_user_tenants_from_profiles();

DROP TRIGGER IF EXISTS sync_user_tenants_from_profiles_upd ON public.profiles;
CREATE TRIGGER sync_user_tenants_from_profiles_upd
AFTER UPDATE OF company_id, association_id ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.sync_user_tenants_from_profiles();

-- Keep updated_at fresh on user_tenants
DROP TRIGGER IF EXISTS update_user_tenants_updated_at ON public.user_tenants;
CREATE TRIGGER update_user_tenants_updated_at
BEFORE UPDATE ON public.user_tenants
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 4) Rewrite helpers to read from user_tenants (no references to public.profiles)

CREATE OR REPLACE FUNCTION public.get_user_company_id(user_uuid uuid)
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
DECLARE
  result uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;

  -- Prevent arbitrary lookups from the client. Policies call this with auth.uid().
  IF user_uuid <> auth.uid() AND NOT has_role(auth.uid(), 'super_admin'::app_role) THEN
    RETURN NULL;
  END IF;

  SELECT ut.company_id
    INTO result
  FROM public.user_tenants ut
  WHERE ut.user_id = user_uuid;

  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_association_id(user_uuid uuid)
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
DECLARE
  result uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;

  -- Prevent arbitrary lookups from the client. Policies call this with auth.uid().
  IF user_uuid <> auth.uid() AND NOT has_role(auth.uid(), 'super_admin'::app_role) THEN
    RETURN NULL;
  END IF;

  SELECT ut.association_id
    INTO result
  FROM public.user_tenants ut
  WHERE ut.user_id = user_uuid;

  RETURN result;
END;
$$;

-- 5) Ensure new users also populate user_tenants (in case some environments rely only on handle_new_user)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text;
  v_company_id uuid;
  v_association_id uuid;
BEGIN
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'employee');
  v_company_id := (NEW.raw_user_meta_data->>'company_id')::uuid;
  v_association_id := (NEW.raw_user_meta_data->>'association_id')::uuid;

  -- Inserisci profilo (legacy fields kept for compatibility)
  INSERT INTO public.profiles (id, email, first_name, last_name, role, company_id, association_id)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    v_role,
    v_company_id,
    v_association_id
  );

  -- Inserisci ruolo in user_roles
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, v_role::app_role)
  ON CONFLICT DO NOTHING;

  -- Inserisci tenant mapping
  INSERT INTO public.user_tenants (user_id, company_id, association_id)
  VALUES (NEW.id, v_company_id, v_association_id)
  ON CONFLICT (user_id)
  DO UPDATE SET
    company_id = EXCLUDED.company_id,
    association_id = EXCLUDED.association_id,
    updated_at = now();

  RETURN NEW;
END;
$$;
