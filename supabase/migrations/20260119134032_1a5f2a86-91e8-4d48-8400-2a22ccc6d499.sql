-- Create a SECURITY DEFINER function to validate access codes securely
-- This prevents exposing the access_code column through direct table queries
CREATE OR REPLACE FUNCTION public.validate_company_access_code(code TEXT)
RETURNS TABLE(id UUID, name TEXT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT companies.id, companies.name 
  FROM public.companies 
  WHERE companies.access_code = code;
$$;

-- Remove the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Anyone can validate access codes" ON public.companies;