-- Create storage bucket for company logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-logos', 'company-logos', true);

-- Policy: Anyone authenticated can view logos (public bucket)
CREATE POLICY "Company logos are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'company-logos');

-- Policy: Super admins can upload logos
CREATE POLICY "Super admins can upload company logos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'company-logos' 
  AND is_super_admin(auth.uid())
);

-- Policy: Super admins can update logos
CREATE POLICY "Super admins can update company logos"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'company-logos' 
  AND is_super_admin(auth.uid())
);

-- Policy: Super admins can delete logos
CREATE POLICY "Super admins can delete company logos"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'company-logos' 
  AND is_super_admin(auth.uid())
);