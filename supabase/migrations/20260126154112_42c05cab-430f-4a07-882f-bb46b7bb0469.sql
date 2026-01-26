-- ============================================
-- FIX NUCLEARE: Reset completo policies profiles
-- ============================================

-- STEP 1: Rimuovi TUTTE le policies su profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can delete all profiles" ON public.profiles;
DROP POLICY IF EXISTS "HR admins can view company profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view company profiles" ON public.profiles;
DROP POLICY IF EXISTS "Association admins can view participant profiles" ON public.profiles;

-- STEP 2: Ricrea SOLO le policies essenziali, SENZA chiamate a funzioni

-- Ogni utente può vedere il PROPRIO profilo (zero dipendenze)
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Ogni utente può modificare il PROPRIO profilo
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Per trigger creazione profilo
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- Super admin vede tutto (usa subquery diretta su user_roles, no funzioni)
CREATE POLICY "Super admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'super_admin'
  )
);

-- Super admin modifica tutto
CREATE POLICY "Super admins can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'super_admin'
  )
);

-- Super admin cancella
CREATE POLICY "Super admins can delete all profiles"
ON public.profiles
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'super_admin'
  )
);

-- HR admin vede profili della sua company (subquery diretta)
CREATE POLICY "HR admins can view company profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'hr_admin'
  )
  AND company_id = (
    SELECT ut.company_id FROM public.user_tenants ut WHERE ut.user_id = auth.uid()
  )
);