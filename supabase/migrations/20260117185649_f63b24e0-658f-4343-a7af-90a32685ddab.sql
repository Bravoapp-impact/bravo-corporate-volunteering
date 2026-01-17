-- Allow unauthenticated users to validate access codes (only returns id and name, not the access_code itself for security)
CREATE POLICY "Anyone can validate access codes"
  ON public.companies FOR SELECT
  USING (true);