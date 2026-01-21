-- Add brand_context JSONB column to brands table for rich brand information
ALTER TABLE public.brands ADD COLUMN IF NOT EXISTS brand_context jsonb DEFAULT '{}'::jsonb;

-- Add visual_analysis JSONB column to custom_moodboards for AI-extracted visual data
ALTER TABLE public.custom_moodboards ADD COLUMN IF NOT EXISTS visual_analysis jsonb DEFAULT NULL;

-- Add a comment explaining the structure of brand_context
COMMENT ON COLUMN public.brands.brand_context IS 'Stores rich brand context including mission, values, tone_of_voice, visual_style guidelines, and target_audience';

-- Add a comment explaining the structure of visual_analysis
COMMENT ON COLUMN public.custom_moodboards.visual_analysis IS 'AI-analyzed visual elements including dominant_colors, key_elements, lighting_quality, textures, emotional_tone, and suggested_props';