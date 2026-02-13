
-- Fix 1: Restrict email_logs INSERT to service role only (edge functions bypass RLS)
DROP POLICY IF EXISTS "Admins can insert email_logs" ON public.email_logs;
DROP POLICY IF EXISTS "Service role can insert email_logs" ON public.email_logs;
CREATE POLICY "Service role can insert email_logs"
  ON public.email_logs FOR INSERT
  WITH CHECK (false);

-- Fix 2: Add CHECK constraints on access_requests for input validation
ALTER TABLE public.access_requests
  ADD CONSTRAINT access_requests_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  ADD CONSTRAINT access_requests_email_length CHECK (char_length(email) <= 255),
  ADD CONSTRAINT access_requests_first_name_length CHECK (first_name IS NULL OR char_length(first_name) <= 100),
  ADD CONSTRAINT access_requests_last_name_length CHECK (last_name IS NULL OR char_length(last_name) <= 100),
  ADD CONSTRAINT access_requests_phone_length CHECK (phone IS NULL OR char_length(phone) <= 30),
  ADD CONSTRAINT access_requests_city_length CHECK (city IS NULL OR char_length(city) <= 100),
  ADD CONSTRAINT access_requests_company_name_length CHECK (company_name IS NULL OR char_length(company_name) <= 200),
  ADD CONSTRAINT access_requests_association_name_length CHECK (association_name IS NULL OR char_length(association_name) <= 200),
  ADD CONSTRAINT access_requests_role_length CHECK (role_in_company IS NULL OR char_length(role_in_company) <= 100),
  ADD CONSTRAINT access_requests_message_length CHECK (message IS NULL OR char_length(message) <= 1000);
