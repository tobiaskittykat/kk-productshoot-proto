-- Create table for scraped products
CREATE TABLE public.scraped_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  external_id TEXT NOT NULL,
  name TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  full_url TEXT NOT NULL,
  category TEXT DEFAULT 'product',
  collection TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, external_id)
);

-- Enable RLS
ALTER TABLE public.scraped_products ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own scraped products"
  ON public.scraped_products FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scraped products"
  ON public.scraped_products FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own scraped products"
  ON public.scraped_products FOR DELETE
  USING (auth.uid() = user_id);