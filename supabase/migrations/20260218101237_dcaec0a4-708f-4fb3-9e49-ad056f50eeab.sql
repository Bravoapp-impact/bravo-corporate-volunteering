
-- Block direct client inserts on access_requests (force through edge function)
DROP POLICY IF EXISTS "Anyone can insert access requests" ON public.access_requests;
CREATE POLICY "Block client inserts on access_requests"
  ON public.access_requests FOR INSERT
  WITH CHECK (false);
