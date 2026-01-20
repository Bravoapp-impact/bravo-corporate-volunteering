-- Tighten HR Admin visibility: HR should NOT see other companies' experiences/dates.
-- We keep employee-level company isolation for SELECT, and reserve full access to Super Admin.

BEGIN;

-- EXPERIENCES
DROP POLICY IF EXISTS "Admins can view all experiences" ON public.experiences;
CREATE POLICY "Admins can view all experiences"
ON public.experiences
FOR SELECT
USING (public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage experiences" ON public.experiences;
CREATE POLICY "Admins can manage experiences"
ON public.experiences
FOR ALL
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));

-- EXPERIENCE DATES
DROP POLICY IF EXISTS "Admins can view all experience dates" ON public.experience_dates;
CREATE POLICY "Admins can view all experience dates"
ON public.experience_dates
FOR SELECT
USING (public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage experience dates" ON public.experience_dates;
CREATE POLICY "Admins can manage experience dates"
ON public.experience_dates
FOR ALL
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));

-- EXPERIENCE_COMPANIES (assignments)
DROP POLICY IF EXISTS "Admins can manage experience_companies" ON public.experience_companies;
CREATE POLICY "Admins can manage experience_companies"
ON public.experience_companies
FOR ALL
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));

COMMIT;