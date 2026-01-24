-- ========================================
-- FIX RICORSIONE RLS: Tabella ruoli separata
-- ========================================

-- 1. Crea enum per ruoli
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('employee', 'hr_admin', 'association_admin', 'super_admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Crea tabella user_roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- 3. Abilita RLS su user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Policy per user_roles (semplice, non ricorsiva)
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Service role can manage roles"
ON public.user_roles
FOR ALL
USING (false)
WITH CHECK (false);

-- 5. Migra ruoli esistenti da profiles a user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, role::app_role FROM public.profiles
ON CONFLICT (user_id, role) DO NOTHING;

-- 6. Crea funzione has_role che legge user_roles (SECURITY DEFINER, bypassa RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

-- 7. Ricrea funzioni helper usando user_roles invece di profiles
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(user_uuid, 'super_admin');
$$;

CREATE OR REPLACE FUNCTION public.is_admin(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(user_uuid, 'super_admin') OR public.has_role(user_uuid, 'hr_admin');
$$;

CREATE OR REPLACE FUNCTION public.is_association_admin(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(user_uuid, 'association_admin');
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text FROM public.user_roles WHERE user_id = user_uuid LIMIT 1;
$$;

-- 8. Aggiorna trigger new user per inserire anche in user_roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text;
BEGIN
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'employee');
  
  -- Inserisci profilo
  INSERT INTO public.profiles (id, email, first_name, last_name, role, company_id, association_id)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    v_role,
    (NEW.raw_user_meta_data->>'company_id')::uuid,
    (NEW.raw_user_meta_data->>'association_id')::uuid
  );
  
  -- Inserisci ruolo in user_roles
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, v_role::app_role);
  
  RETURN NEW;
END;
$$;

-- 9. Drop e ricrea policy di profiles per usare has_role (non ricorsive)
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can delete all profiles" ON public.profiles;
DROP POLICY IF EXISTS "HR admins can view company profiles" ON public.profiles;
DROP POLICY IF EXISTS "Association admins can view participant profiles" ON public.profiles;

-- Policy non ricorsive usando has_role
CREATE POLICY "Super admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update all profiles"
ON public.profiles
FOR UPDATE
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete all profiles"
ON public.profiles
FOR DELETE
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "HR admins can view company profiles"
ON public.profiles
FOR SELECT
USING (
  public.has_role(auth.uid(), 'hr_admin')
  AND company_id = public.get_user_company_id(auth.uid())
);

CREATE POLICY "Association admins can view participant profiles"
ON public.profiles
FOR SELECT
USING (
  public.has_role(auth.uid(), 'association_admin')
  AND EXISTS (
    SELECT 1 FROM bookings b
    JOIN experience_dates ed ON ed.id = b.experience_date_id
    JOIN experiences e ON e.id = ed.experience_id
    WHERE b.user_id = profiles.id
    AND e.association_id = public.get_user_association_id(auth.uid())
  )
);

-- 10. Policy per super admin su user_roles (gestione ruoli)
DROP POLICY IF EXISTS "Service role can manage roles" ON public.user_roles;

CREATE POLICY "Super admins can manage all roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));