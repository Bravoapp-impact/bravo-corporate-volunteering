-- Super admin can update any profile
CREATE POLICY "Super admins can update all profiles"
ON public.profiles
FOR UPDATE
USING (is_super_admin(auth.uid()))
WITH CHECK (is_super_admin(auth.uid()));

-- Super admin can delete any profile
CREATE POLICY "Super admins can delete all profiles"
ON public.profiles
FOR DELETE
USING (is_super_admin(auth.uid()));