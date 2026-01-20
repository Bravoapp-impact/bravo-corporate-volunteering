-- Add company_id to experience_dates table
ALTER TABLE public.experience_dates 
ADD COLUMN company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX idx_experience_dates_company_id ON public.experience_dates(company_id);

-- Update RLS policy for employees to only see dates for their company
DROP POLICY IF EXISTS "Employees can view experience dates for their company experienc" ON public.experience_dates;

CREATE POLICY "Employees can view experience dates for their company"
ON public.experience_dates
FOR SELECT
USING (
  company_id = get_user_company_id(auth.uid())
  AND EXISTS (
    SELECT 1 FROM experiences e
    JOIN experience_companies ec ON e.id = ec.experience_id
    WHERE e.id = experience_dates.experience_id
    AND e.status = 'published'
    AND ec.company_id = get_user_company_id(auth.uid())
  )
);

-- Update the booking insert policy to check company_id on experience_dates
DROP POLICY IF EXISTS "Users can create bookings" ON public.bookings;

CREATE POLICY "Users can create bookings"
ON public.bookings
FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  AND is_experience_date_available(experience_date_id)
  AND EXISTS (
    SELECT 1 FROM experience_dates ed
    JOIN experiences e ON ed.experience_id = e.id
    WHERE ed.id = bookings.experience_date_id
    AND e.status = 'published'
    AND ed.company_id = get_user_company_id(auth.uid())
  )
);