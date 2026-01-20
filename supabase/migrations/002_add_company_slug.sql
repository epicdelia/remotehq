-- Migration: 002_add_company_slug
-- Description: Add slug field to companies table for URL-friendly company profiles

-- Add slug column to companies table
ALTER TABLE companies ADD COLUMN IF NOT EXISTS slug VARCHAR(255);

-- Create unique index on slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_companies_slug ON companies(slug);

-- Function to generate slug from company name
CREATE OR REPLACE FUNCTION generate_company_slug(company_name TEXT)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Convert to lowercase, replace spaces with hyphens, remove special characters
    base_slug := lower(trim(company_name));
    base_slug := regexp_replace(base_slug, '[^a-z0-9\s-]', '', 'g');
    base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
    base_slug := regexp_replace(base_slug, '-+', '-', 'g');
    base_slug := trim(both '-' from base_slug);

    final_slug := base_slug;

    -- Check for uniqueness and append number if needed
    WHILE EXISTS (SELECT 1 FROM companies WHERE slug = final_slug) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter::text;
    END LOOP;

    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Update existing companies with generated slugs
UPDATE companies
SET slug = generate_company_slug(name)
WHERE slug IS NULL;

-- Make slug NOT NULL after populating existing records
ALTER TABLE companies ALTER COLUMN slug SET NOT NULL;

-- Trigger to auto-generate slug on insert if not provided
CREATE OR REPLACE FUNCTION set_company_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := generate_company_slug(NEW.name);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_company_slug
    BEFORE INSERT ON companies
    FOR EACH ROW
    EXECUTE FUNCTION set_company_slug();
