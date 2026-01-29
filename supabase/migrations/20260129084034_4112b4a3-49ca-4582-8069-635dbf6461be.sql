-- Add integrity_analysis column to generated_images
ALTER TABLE public.generated_images 
ADD COLUMN IF NOT EXISTS integrity_analysis JSONB DEFAULT NULL;

-- Add index for efficient querying of un-analyzed images
CREATE INDEX IF NOT EXISTS idx_generated_images_integrity_analysis 
ON public.generated_images ((integrity_analysis IS NULL))
WHERE integrity_analysis IS NULL;