-- Allow authenticated users to view their own company
CREATE POLICY "Users can view their own company"
  ON public.companies FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    id = public.get_user_company_id(auth.uid())
  );