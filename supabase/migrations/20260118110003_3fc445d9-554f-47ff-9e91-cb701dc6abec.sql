-- Add SDGs column to experiences table
ALTER TABLE public.experiences 
ADD COLUMN sdgs text[] DEFAULT '{}';

-- Add volunteer hours and beneficiaries count to experience_dates table
ALTER TABLE public.experience_dates 
ADD COLUMN volunteer_hours decimal DEFAULT 0,
ADD COLUMN beneficiaries_count integer;