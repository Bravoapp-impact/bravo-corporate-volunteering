-- =============================================
-- BRAVO! MVP DATABASE SCHEMA
-- =============================================

-- Companies table
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  access_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('super_admin', 'hr_admin', 'employee')),
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Experiences table
CREATE TABLE public.experiences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  association_name TEXT,
  city TEXT,
  address TEXT,
  category TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Experience-Companies many-to-many
CREATE TABLE public.experience_companies (
  experience_id UUID NOT NULL REFERENCES public.experiences(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  PRIMARY KEY (experience_id, company_id)
);

-- Experience Dates
CREATE TABLE public.experience_dates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  experience_id UUID NOT NULL REFERENCES public.experiences(id) ON DELETE CASCADE,
  start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  max_participants INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  experience_date_id UUID NOT NULL REFERENCES public.experience_dates(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, experience_date_id)
);

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Get user's company_id
CREATE OR REPLACE FUNCTION public.get_user_company_id(user_uuid UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id FROM public.profiles WHERE id = user_uuid;
$$;

-- Get user's role
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = user_uuid;
$$;

-- Check if user is super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = user_uuid AND role = 'super_admin');
$$;

-- Check if user is hr_admin or super_admin
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = user_uuid AND role IN ('super_admin', 'hr_admin'));
$$;

-- Check experience availability (confirmed bookings < max_participants)
CREATE OR REPLACE FUNCTION public.is_experience_date_available(exp_date_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (
    SELECT COUNT(*) FROM public.bookings 
    WHERE experience_date_id = exp_date_id AND status = 'confirmed'
  ) < (
    SELECT max_participants FROM public.experience_dates WHERE id = exp_date_id
  );
$$;

-- Check if booking can be cancelled (event > 48h from now)
CREATE OR REPLACE FUNCTION public.is_booking_cancellable(booking_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.bookings b
    JOIN public.experience_dates ed ON b.experience_date_id = ed.id
    WHERE b.id = booking_uuid AND ed.start_datetime > (now() + interval '48 hours')
  );
$$;

-- Get confirmed bookings count for an experience date
CREATE OR REPLACE FUNCTION public.get_confirmed_bookings_count(exp_date_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER FROM public.bookings 
  WHERE experience_date_id = exp_date_id AND status = 'confirmed';
$$;

-- =============================================
-- ENABLE RLS
-- =============================================

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================

-- COMPANIES policies
-- Only super_admin can see all companies
CREATE POLICY "Super admins can view all companies"
  ON public.companies FOR SELECT
  USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins can manage companies"
  ON public.companies FOR ALL
  USING (public.is_super_admin(auth.uid()));

-- PROFILES policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Admins can view company profiles"
  ON public.profiles FOR SELECT
  USING (
    public.is_admin(auth.uid()) AND 
    company_id = public.get_user_company_id(auth.uid())
  );

CREATE POLICY "Super admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND role = 'employee'); -- Can't change own role to admin

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- EXPERIENCES policies
CREATE POLICY "Employees can view published experiences for their company"
  ON public.experiences FOR SELECT
  USING (
    status = 'published' AND
    EXISTS (
      SELECT 1 FROM public.experience_companies ec
      WHERE ec.experience_id = id
      AND ec.company_id = public.get_user_company_id(auth.uid())
    )
  );

CREATE POLICY "Admins can view all experiences"
  ON public.experiences FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage experiences"
  ON public.experiences FOR ALL
  USING (public.is_admin(auth.uid()));

-- EXPERIENCE_COMPANIES policies
CREATE POLICY "Employees can view experience_companies for their company"
  ON public.experience_companies FOR SELECT
  USING (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Admins can manage experience_companies"
  ON public.experience_companies FOR ALL
  USING (public.is_admin(auth.uid()));

-- EXPERIENCE_DATES policies
CREATE POLICY "Employees can view experience dates for their company experiences"
  ON public.experience_dates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.experiences e
      JOIN public.experience_companies ec ON e.id = ec.experience_id
      WHERE e.id = experience_id
      AND e.status = 'published'
      AND ec.company_id = public.get_user_company_id(auth.uid())
    )
  );

CREATE POLICY "Admins can view all experience dates"
  ON public.experience_dates FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage experience dates"
  ON public.experience_dates FOR ALL
  USING (public.is_admin(auth.uid()));

-- BOOKINGS policies
CREATE POLICY "Users can view own bookings"
  ON public.bookings FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "HR can view company bookings"
  ON public.bookings FOR SELECT
  USING (
    public.is_admin(auth.uid()) AND
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = user_id
      AND p.company_id = public.get_user_company_id(auth.uid())
    )
  );

CREATE POLICY "Users can create bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    public.is_experience_date_available(experience_date_id) AND
    EXISTS (
      SELECT 1 FROM public.experience_dates ed
      JOIN public.experiences e ON ed.experience_id = e.id
      JOIN public.experience_companies ec ON e.id = ec.experience_id
      WHERE ed.id = experience_date_id
      AND e.status = 'published'
      AND ec.company_id = public.get_user_company_id(auth.uid())
    )
  );

CREATE POLICY "Users can cancel own bookings if allowed"
  ON public.bookings FOR UPDATE
  USING (user_id = auth.uid() AND public.is_booking_cancellable(id))
  WITH CHECK (user_id = auth.uid() AND status = 'cancelled');

-- =============================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role, company_id)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'employee'),
    (NEW.raw_user_meta_data->>'company_id')::uuid
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_profiles_company_id ON public.profiles(company_id);
CREATE INDEX idx_experience_companies_company_id ON public.experience_companies(company_id);
CREATE INDEX idx_experience_dates_experience_id ON public.experience_dates(experience_id);
CREATE INDEX idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX idx_bookings_experience_date_id ON public.bookings(experience_date_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);