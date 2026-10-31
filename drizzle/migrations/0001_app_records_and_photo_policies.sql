CREATE TABLE public.app_records (
  collection text NOT NULL CHECK (collection IN ('properties','enquiries','zones','agents','sales','activity')),
  id text NOT NULL,
  data jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (collection, id)
);
GRANT SELECT, INSERT ON public.app_records TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_records TO authenticated;
GRANT ALL ON public.app_records TO service_role;
ALTER TABLE public.app_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads zones and public listings" ON public.app_records
  FOR SELECT TO anon, authenticated
  USING (collection = 'zones' OR (collection = 'properties' AND data->>'status' IN ('Published','Reserved','Sold','Rented')));

CREATE POLICY "Visitors submit enquiries" ON public.app_records
  FOR INSERT TO anon, authenticated
  WITH CHECK (collection = 'enquiries' AND data->>'status' = 'New');

CREATE POLICY "Admins manage all records" ON public.app_records
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins upload property photos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'property-photos' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update property photos" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'property-photos' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete property photos" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'property-photos' AND public.has_role(auth.uid(), 'admin'));