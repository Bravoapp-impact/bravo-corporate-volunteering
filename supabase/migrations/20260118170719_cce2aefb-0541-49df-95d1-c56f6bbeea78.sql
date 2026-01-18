-- ==============================================
-- 0. CREATE HELPER FUNCTION FOR UPDATED_AT
-- ==============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ==============================================
-- 1. CREATE CITIES TABLE
-- ==============================================
CREATE TABLE public.cities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  province TEXT,
  region TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(name)
);

ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin full access on cities"
ON public.cities FOR ALL
USING (public.get_user_role(auth.uid()) = 'super_admin');

CREATE POLICY "Authenticated users can view cities"
ON public.cities FOR SELECT TO authenticated
USING (true);

CREATE TRIGGER update_cities_updated_at
BEFORE UPDATE ON public.cities
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==============================================
-- 2. CREATE CATEGORIES TABLE
-- ==============================================
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  default_sdgs TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(name)
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin full access on categories"
ON public.categories FOR ALL
USING (public.get_user_role(auth.uid()) = 'super_admin');

CREATE POLICY "Authenticated users can view categories"
ON public.categories FOR SELECT TO authenticated
USING (true);

CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==============================================
-- 3. CREATE ASSOCIATIONS TABLE
-- ==============================================
CREATE TABLE public.associations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  website TEXT,
  address TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'archived')),
  internal_notes TEXT,
  partnership_start_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(name)
);

ALTER TABLE public.associations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin full access on associations"
ON public.associations FOR ALL
USING (public.get_user_role(auth.uid()) = 'super_admin');

CREATE POLICY "Authenticated users can view associations"
ON public.associations FOR SELECT TO authenticated
USING (true);

CREATE TRIGGER update_associations_updated_at
BEFORE UPDATE ON public.associations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==============================================
-- 4. CREATE ASSOCIATION_CITIES (N:N relationship)
-- ==============================================
CREATE TABLE public.association_cities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  association_id UUID NOT NULL REFERENCES public.associations(id) ON DELETE CASCADE,
  city_id UUID NOT NULL REFERENCES public.cities(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(association_id, city_id)
);

ALTER TABLE public.association_cities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin full access on association_cities"
ON public.association_cities FOR ALL
USING (public.get_user_role(auth.uid()) = 'super_admin');

CREATE POLICY "Authenticated users can view association_cities"
ON public.association_cities FOR SELECT TO authenticated
USING (true);

-- ==============================================
-- 5. ADD FOREIGN KEYS TO EXPERIENCES TABLE
-- ==============================================
ALTER TABLE public.experiences 
ADD COLUMN association_id UUID REFERENCES public.associations(id) ON DELETE RESTRICT,
ADD COLUMN city_id UUID REFERENCES public.cities(id) ON DELETE RESTRICT,
ADD COLUMN category_id UUID REFERENCES public.categories(id) ON DELETE RESTRICT;

-- ==============================================
-- 6. MIGRATE EXISTING DATA
-- ==============================================
INSERT INTO public.cities (name)
SELECT DISTINCT TRIM(city) 
FROM public.experiences 
WHERE city IS NOT NULL AND TRIM(city) != ''
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.categories (name)
SELECT DISTINCT TRIM(category) 
FROM public.experiences 
WHERE category IS NOT NULL AND TRIM(category) != ''
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.associations (name)
SELECT DISTINCT TRIM(association_name) 
FROM public.experiences 
WHERE association_name IS NOT NULL AND TRIM(association_name) != ''
ON CONFLICT (name) DO NOTHING;

UPDATE public.experiences e
SET city_id = c.id
FROM public.cities c
WHERE TRIM(e.city) = c.name AND e.city IS NOT NULL;

UPDATE public.experiences e
SET category_id = cat.id
FROM public.categories cat
WHERE TRIM(e.category) = cat.name AND e.category IS NOT NULL;

UPDATE public.experiences e
SET association_id = a.id
FROM public.associations a
WHERE TRIM(e.association_name) = a.name AND e.association_name IS NOT NULL;