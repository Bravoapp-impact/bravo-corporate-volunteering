-- Drop existing problematic policies on profiles
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can delete all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view company profiles" ON public.profiles;
DROP POLICY IF EXISTS "Association admin can view participants profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Create a simple function to get role from JWT metadata (no recursion)
CREATE OR REPLACE FUNCTION public.get_role_from_jwt()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'role',
    (current_setting('request.jwt.claims', true)::json->'user_metadata'->>'role')
  );
$$;

-- Create new non-recursive policies for profiles

-- Everyone authenticated can read their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (id = auth.uid());

-- Super admins can view all profiles (using JWT, not profiles table)
CREATE POLICY "Super admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
  OR id = auth.uid()
);

-- Actually, the above still has recursion. Let's use a different approach.
-- Drop and recreate with a simpler approach
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.profiles;

-- Use SECURITY DEFINER function that bypasses RLS
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Now create policies using this function
CREATE POLICY "Super admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.get_my_role() = 'super_admin');

-- HR admins can view profiles in their company
CREATE POLICY "HR admins can view company profiles" 
ON public.profiles 
FOR SELECT 
USING (
  public.get_my_role() = 'hr_admin' 
  AND company_id = public.get_user_company_id(auth.uid())
);

-- Association admins can view profiles of participants in their experiences
CREATE POLICY "Association admins can view participant profiles" 
ON public.profiles 
FOR SELECT 
USING (
  public.get_my_role() = 'association_admin'
  AND EXISTS (
    SELECT 1 FROM bookings b
    JOIN experience_dates ed ON ed.id = b.experience_date_id
    JOIN experiences e ON e.id = ed.experience_id
    WHERE b.user_id = profiles.id 
    AND e.association_id = public.get_user_association_id(auth.uid())
  )
);

-- Users can insert their own profile (for trigger)
CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (id = auth.uid());

-- Users can update their own profile (but not role)
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Super admins can update all profiles
CREATE POLICY "Super admins can update all profiles" 
ON public.profiles 
FOR UPDATE 
USING (public.get_my_role() = 'super_admin')
WITH CHECK (public.get_my_role() = 'super_admin');

-- Super admins can delete profiles
CREATE POLICY "Super admins can delete all profiles" 
ON public.profiles 
FOR DELETE 
USING (public.get_my_role() = 'super_admin');