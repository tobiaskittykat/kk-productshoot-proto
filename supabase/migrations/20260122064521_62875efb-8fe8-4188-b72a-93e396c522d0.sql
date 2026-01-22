-- Add product_reference_ids column to saved_concepts for persisting product selections
ALTER TABLE saved_concepts 
ADD COLUMN product_reference_ids text[] DEFAULT '{}';