-- Create enum types for access requests
CREATE TYPE public.access_request_type AS ENUM (
  'employee_needs_code',
  'company_lead', 
  'association_lead',
  'individual_waitlist'
);

CREATE TYPE public.access_request_status AS ENUM (
  'pending',
  'contacted',
  'closed'
);

-- Create access_requests table
CREATE TABLE public.access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_type access_request_type NOT NULL,
  status access_request_status NOT NULL DEFAULT 'pending',
  
  -- Common fields
  first_name text,
  last_name text,
  email text NOT NULL,
  phone text,
  city text,
  message text,
  
  -- Organization-specific fields
  company_name text,
  association_name text,
  role_in_company text,
  
  -- Metadata
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  notes text
);

-- Trigger for updated_at
CREATE TRIGGER update_access_requests_updated_at
  BEFORE UPDATE ON public.access_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (public form, no auth required)
CREATE POLICY "Anyone can insert access requests"
  ON public.access_requests FOR INSERT
  WITH CHECK (true);

-- Only Super Admin can view/modify
CREATE POLICY "Super admin can manage access requests"
  ON public.access_requests FOR ALL
  USING (is_super_admin(auth.uid()));