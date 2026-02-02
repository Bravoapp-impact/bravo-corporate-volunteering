-- Allow authenticated users to view association public info (name, logo)
CREATE POLICY "Authenticated users can view associations" 
  ON public.associations 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);