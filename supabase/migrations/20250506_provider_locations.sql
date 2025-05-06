
-- Create table for storing provider locations
CREATE TABLE IF NOT EXISTS public.provider_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL,
  contract_id UUID NOT NULL,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(provider_id, contract_id)
);

-- Enable row level security
ALTER TABLE public.provider_locations ENABLE ROW LEVEL SECURITY;

-- Only providers can insert/update their own location
CREATE POLICY "Providers can insert their own location" 
  ON public.provider_locations 
  FOR INSERT 
  WITH CHECK (auth.uid() = provider_id);

CREATE POLICY "Providers can update their own location" 
  ON public.provider_locations 
  FOR UPDATE 
  USING (auth.uid() = provider_id);

-- Both the provider and customer of the contract can view the location
CREATE POLICY "Providers can view their own location"
  ON public.provider_locations
  FOR SELECT
  USING (auth.uid() = provider_id);

-- Enable realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE public.provider_locations;

-- Set up RLS for contracts to make sure users can see their own contracts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'contracts' AND policyname = 'Users can view their own contracts'
  ) THEN
    CREATE POLICY "Users can view their own contracts" 
      ON public.contracts 
      FOR SELECT 
      USING (auth.uid() = customer_id OR auth.uid() = provider_id);
  END IF;
END $$;
