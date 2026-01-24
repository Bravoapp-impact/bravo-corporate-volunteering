-- =====================================================
-- STEP 1: Creare la tabella access_codes
-- =====================================================

CREATE TABLE public.access_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('company', 'association')),
  entity_id UUID NOT NULL,
  assigned_role TEXT NOT NULL DEFAULT 'employee' CHECK (assigned_role IN ('employee', 'hr_admin', 'association_admin')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  max_uses INTEGER, -- NULL = illimitato
  expires_at TIMESTAMP WITH TIME ZONE, -- NULL = mai
  use_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indice per ricerche veloci sul codice
CREATE INDEX idx_access_codes_code ON public.access_codes(code);
CREATE INDEX idx_access_codes_entity ON public.access_codes(entity_type, entity_id);

-- Trigger per updated_at
CREATE TRIGGER update_access_codes_updated_at
  BEFORE UPDATE ON public.access_codes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.access_codes ENABLE ROW LEVEL SECURITY;

-- Super admin full access
CREATE POLICY "Super admin full access on access_codes"
  ON public.access_codes
  FOR ALL
  USING (is_super_admin(auth.uid()));

-- =====================================================
-- STEP 2: Aggiungere association_id a profiles
-- =====================================================

ALTER TABLE public.profiles 
  ADD COLUMN association_id UUID REFERENCES public.associations(id) ON DELETE SET NULL;

-- Indice per ricerche veloci
CREATE INDEX idx_profiles_association_id ON public.profiles(association_id);

-- =====================================================
-- STEP 3: Migrare i codici esistenti da companies
-- =====================================================

INSERT INTO public.access_codes (code, entity_type, entity_id, assigned_role, is_active)
SELECT 
  access_code,
  'company',
  id,
  'employee',
  true
FROM public.companies
WHERE access_code IS NOT NULL;

-- =====================================================
-- STEP 4: Rimuovere access_code da companies
-- =====================================================

ALTER TABLE public.companies DROP COLUMN access_code;

-- =====================================================
-- STEP 5: Funzioni helper
-- =====================================================

-- Funzione per validare un codice e restituire le informazioni
CREATE OR REPLACE FUNCTION public.validate_access_code(p_code TEXT)
RETURNS TABLE(
  entity_type TEXT,
  entity_id UUID,
  entity_name TEXT,
  assigned_role TEXT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_access_code RECORD;
BEGIN
  -- Trova il codice
  SELECT * INTO v_access_code
  FROM public.access_codes ac
  WHERE ac.code = p_code
    AND ac.is_active = true
    AND (ac.max_uses IS NULL OR ac.use_count < ac.max_uses)
    AND (ac.expires_at IS NULL OR ac.expires_at > now());
    
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Restituisci le informazioni in base al tipo di entità
  IF v_access_code.entity_type = 'company' THEN
    RETURN QUERY
    SELECT 
      v_access_code.entity_type,
      v_access_code.entity_id,
      c.name,
      v_access_code.assigned_role
    FROM public.companies c
    WHERE c.id = v_access_code.entity_id;
  ELSIF v_access_code.entity_type = 'association' THEN
    RETURN QUERY
    SELECT 
      v_access_code.entity_type,
      v_access_code.entity_id,
      a.name,
      v_access_code.assigned_role
    FROM public.associations a
    WHERE a.id = v_access_code.entity_id;
  END IF;
END;
$$;

-- Funzione per incrementare il contatore utilizzi
CREATE OR REPLACE FUNCTION public.increment_access_code_usage(p_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.access_codes
  SET use_count = use_count + 1
  WHERE code = p_code
    AND is_active = true
    AND (max_uses IS NULL OR use_count < max_uses)
    AND (expires_at IS NULL OR expires_at > now());
    
  RETURN FOUND;
END;
$$;

-- Funzione per verificare se un utente è association_admin
CREATE OR REPLACE FUNCTION public.is_association_admin(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_uuid AND role = 'association_admin'
  );
$$;

-- Funzione per ottenere l'association_id di un utente
CREATE OR REPLACE FUNCTION public.get_user_association_id(user_uuid UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT association_id FROM public.profiles WHERE id = user_uuid;
$$;

-- =====================================================
-- STEP 6: Aggiornare la funzione handle_new_user
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role, company_id, association_id)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'employee'),
    (NEW.raw_user_meta_data->>'company_id')::uuid,
    (NEW.raw_user_meta_data->>'association_id')::uuid
  );
  RETURN NEW;
END;
$$;

-- =====================================================
-- STEP 7: Policies RLS per association_admin
-- =====================================================

-- Association admin può vedere le esperienze della propria associazione
CREATE POLICY "Association admin can view own association experiences"
  ON public.experiences
  FOR SELECT
  USING (
    is_association_admin(auth.uid()) 
    AND association_id = get_user_association_id(auth.uid())
  );

-- Association admin può modificare le esperienze della propria associazione
CREATE POLICY "Association admin can update own association experiences"
  ON public.experiences
  FOR UPDATE
  USING (
    is_association_admin(auth.uid()) 
    AND association_id = get_user_association_id(auth.uid())
  )
  WITH CHECK (
    is_association_admin(auth.uid()) 
    AND association_id = get_user_association_id(auth.uid())
  );

-- Association admin può creare esperienze per la propria associazione
CREATE POLICY "Association admin can insert own association experiences"
  ON public.experiences
  FOR INSERT
  WITH CHECK (
    is_association_admin(auth.uid()) 
    AND association_id = get_user_association_id(auth.uid())
  );

-- Association admin può cancellare esperienze della propria associazione
CREATE POLICY "Association admin can delete own association experiences"
  ON public.experiences
  FOR DELETE
  USING (
    is_association_admin(auth.uid()) 
    AND association_id = get_user_association_id(auth.uid())
  );

-- Association admin può vedere le date delle proprie esperienze
CREATE POLICY "Association admin can view own experience dates"
  ON public.experience_dates
  FOR SELECT
  USING (
    is_association_admin(auth.uid()) 
    AND EXISTS (
      SELECT 1 FROM public.experiences e
      WHERE e.id = experience_dates.experience_id
        AND e.association_id = get_user_association_id(auth.uid())
    )
  );

-- Association admin può gestire le date delle proprie esperienze
CREATE POLICY "Association admin can manage own experience dates"
  ON public.experience_dates
  FOR ALL
  USING (
    is_association_admin(auth.uid()) 
    AND EXISTS (
      SELECT 1 FROM public.experiences e
      WHERE e.id = experience_dates.experience_id
        AND e.association_id = get_user_association_id(auth.uid())
    )
  )
  WITH CHECK (
    is_association_admin(auth.uid()) 
    AND EXISTS (
      SELECT 1 FROM public.experiences e
      WHERE e.id = experience_dates.experience_id
        AND e.association_id = get_user_association_id(auth.uid())
    )
  );

-- Association admin può vedere le prenotazioni delle proprie esperienze
CREATE POLICY "Association admin can view bookings for own experiences"
  ON public.bookings
  FOR SELECT
  USING (
    is_association_admin(auth.uid()) 
    AND EXISTS (
      SELECT 1 FROM public.experience_dates ed
      JOIN public.experiences e ON e.id = ed.experience_id
      WHERE ed.id = bookings.experience_date_id
        AND e.association_id = get_user_association_id(auth.uid())
    )
  );

-- Association admin può vedere i profili dei partecipanti alle proprie esperienze
CREATE POLICY "Association admin can view participants profiles"
  ON public.profiles
  FOR SELECT
  USING (
    is_association_admin(auth.uid()) 
    AND EXISTS (
      SELECT 1 FROM public.bookings b
      JOIN public.experience_dates ed ON ed.id = b.experience_date_id
      JOIN public.experiences e ON e.id = ed.experience_id
      WHERE b.user_id = profiles.id
        AND e.association_id = get_user_association_id(auth.uid())
    )
  );

-- Association admin può vedere la propria associazione
CREATE POLICY "Association admin can view own association"
  ON public.associations
  FOR SELECT
  USING (
    is_association_admin(auth.uid()) 
    AND id = get_user_association_id(auth.uid())
  );

-- Association admin può modificare la propria associazione
CREATE POLICY "Association admin can update own association"
  ON public.associations
  FOR UPDATE
  USING (
    is_association_admin(auth.uid()) 
    AND id = get_user_association_id(auth.uid())
  )
  WITH CHECK (
    is_association_admin(auth.uid()) 
    AND id = get_user_association_id(auth.uid())
  );