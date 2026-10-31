CREATE POLICY "Admins read property photos" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'property-photos' AND public.has_role(auth.uid(), 'admin'));