-- Drop the existing unique constraint that blocks rebooking after cancellation
ALTER TABLE public.bookings DROP CONSTRAINT bookings_user_id_experience_date_id_key;

-- Create a partial unique index that only applies to confirmed bookings
-- This allows rebooking after cancellation while preventing duplicate active bookings
CREATE UNIQUE INDEX bookings_user_date_confirmed_unique 
ON public.bookings (user_id, experience_date_id) 
WHERE status = 'confirmed';