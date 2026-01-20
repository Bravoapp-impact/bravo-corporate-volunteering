-- Delete existing categories (user confirmed they're empty)
DELETE FROM categories;

-- Insert 11 new categories with SDG mappings
INSERT INTO public.categories (name, description, default_sdgs) VALUES
  ('Gastronomia e cucina', 'Attività culinarie e di preparazione pasti per chi ne ha bisogno', ARRAY['sdg_2', 'sdg_3', 'sdg_12']),
  ('Arte e creatività', 'Laboratori artistici, pittura, disegno e espressione creativa', ARRAY['sdg_4', 'sdg_10', 'sdg_11']),
  ('Teatro e performance', 'Attività teatrali, recitazione e performance artistiche', ARRAY['sdg_4', 'sdg_10', 'sdg_16']),
  ('Artigianato e manualità', 'Lavori manuali, falegnameria, sartoria e attività artigianali', ARRAY['sdg_4', 'sdg_8', 'sdg_12']),
  ('Animali e pet therapy', 'Cura degli animali e attività di pet therapy', ARRAY['sdg_3', 'sdg_15']),
  ('Orti e apicoltura', 'Coltivazione, orti urbani e cura delle api', ARRAY['sdg_2', 'sdg_11', 'sdg_15']),
  ('Natura e ambiente', 'Pulizia ambientale, riforestazione e tutela del territorio', ARRAY['sdg_11', 'sdg_13', 'sdg_15']),
  ('Sport e movimento', 'Attività sportive e motorie inclusive', ARRAY['sdg_3', 'sdg_10']),
  ('Educazione e doposcuola', 'Supporto scolastico, tutoraggio e formazione', ARRAY['sdg_1', 'sdg_4', 'sdg_10']),
  ('Compagnia e socialità', 'Visite agli anziani, compagnia e socializzazione', ARRAY['sdg_3', 'sdg_10', 'sdg_11']),
  ('Cultura e territorio', 'Valorizzazione del patrimonio culturale e storico locale', ARRAY['sdg_4', 'sdg_11', 'sdg_16']);

-- Add secondary_tags column to experiences table
ALTER TABLE public.experiences ADD COLUMN IF NOT EXISTS secondary_tags TEXT[] DEFAULT NULL;