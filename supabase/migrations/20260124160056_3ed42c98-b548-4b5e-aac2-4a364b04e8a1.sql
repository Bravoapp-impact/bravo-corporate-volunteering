-- Fix 42P17 recursion chain: user_roles policy calling has_role() is self-referential
-- (policy on user_roles -> has_role() -> selects user_roles).
-- Remove that recursive policy and provide a safe SECURITY DEFINER RPC for super-admin role changes.

-- 1) Remove recursive policy
DROP POLICY IF EXISTS "Super admins can manage all roles" ON public.user_roles;

-- Keep the non-recursive read policy (ensure it's scoped to authenticated)
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 2) Provide a safe admin RPC to manage roles (bypasses RLS but enforces authorization)
CREATE OR REPLACE FUNCTION public.admin_set_user_role(p_user_id uuid, p_role public.app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'super_admin'::public.app_role) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  -- Ensure single-role model
  DELETE FROM public.user_roles WHERE user_id = p_user_id;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (p_user_id, p_role);
END;
$$;

REVOKE ALL ON FUNCTION public.admin_set_user_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_set_user_role(uuid, public.app_role) TO authenticated;
