-- New SKU grouping table for multi-angle products
CREATE TABLE public.product_skus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
  sku_code TEXT,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'product',
  description JSONB,
  composite_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_skus ENABLE ROW LEVEL SECURITY;

-- RLS policies for product_skus
CREATE POLICY "Users can view own SKUs" ON public.product_skus
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own SKUs" ON public.product_skus
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own SKUs" ON public.product_skus
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own SKUs" ON public.product_skus
  FOR DELETE USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE TRIGGER update_product_skus_updated_at
  BEFORE UPDATE ON public.product_skus
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Link existing products to SKUs
ALTER TABLE public.scraped_products 
ADD COLUMN sku_id UUID REFERENCES public.product_skus(id) ON DELETE SET NULL,
ADD COLUMN angle TEXT;