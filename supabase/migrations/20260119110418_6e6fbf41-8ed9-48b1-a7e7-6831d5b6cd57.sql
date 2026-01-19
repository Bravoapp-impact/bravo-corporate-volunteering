-- Drop existing restrictive INSERT policy
DROP POLICY IF EXISTS "Users can create bookings" ON public.bookings;

-- Create new PERMISSIVE INSERT policy (default is PERMISSIVE)
CREATE POLICY "Users can create bookings" 
ON public.bookings 
FOR INSERT 
TO authenticated
WITH CHECK (
  (user_id = auth.uid()) 
  AND is_experience_date_available(experience_date_id) 
  AND (EXISTS ( 
    SELECT 1
    FROM experience_dates ed
    JOIN experiences e ON ed.experience_id = e.id
    JOIN experience_companies ec ON e.id = ec.experience_id
    WHERE ed.id = bookings.experience_date_id 
    AND e.status = 'published'
    AND ec.company_id = get_user_company_id(auth.uid())
  ))
);