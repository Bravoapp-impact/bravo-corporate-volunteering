-- Drop overly permissive policy for associations
DROP POLICY IF EXISTS "Authenticated users can view associations" ON public.associations;

-- Create a more restrictive policy that hides contact details for regular users
-- Only admins and association admins for their own association can see full details
-- Regular users only see public info (name, description, logo_url, website, status)

-- Create a public view for associations that excludes contact info
CREATE OR REPLACE VIEW public.associations_public
WITH (security_invoker=on) AS
SELECT 
  id,
  name,
  description,
  website,
  logo_url,
  status,
  address,
  created_at,
  updated_at
FROM public.associations;

-- Allow authenticated users to view the public view
-- (Note: RLS on base table still applies via security_invoker)