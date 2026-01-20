-- Remote Jobs Database Schema
-- Migration: 001_initial_schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- COMPANIES TABLE
-- ============================================
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    logo_url TEXT,
    website VARCHAR(500),
    description TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for company name searches
CREATE INDEX idx_companies_name ON companies(name);
CREATE INDEX idx_companies_is_verified ON companies(is_verified);

-- ============================================
-- CATEGORIES TABLE
-- ============================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for category slug lookups
CREATE INDEX idx_categories_slug ON categories(slug);

-- ============================================
-- JOBS TABLE
-- ============================================
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    salary_min INTEGER,
    salary_max INTEGER,
    location VARCHAR(255),
    job_type VARCHAR(50) NOT NULL CHECK (job_type IN ('full-time', 'part-time', 'contract', 'freelance', 'internship')),
    category VARCHAR(100),
    tags TEXT[] DEFAULT '{}',
    apply_url VARCHAR(500) NOT NULL,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    posted_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for frequently queried columns
CREATE INDEX idx_jobs_company_id ON jobs(company_id);
CREATE INDEX idx_jobs_is_active ON jobs(is_active);
CREATE INDEX idx_jobs_is_featured ON jobs(is_featured);
CREATE INDEX idx_jobs_posted_at ON jobs(posted_at DESC);
CREATE INDEX idx_jobs_expires_at ON jobs(expires_at);
CREATE INDEX idx_jobs_job_type ON jobs(job_type);
CREATE INDEX idx_jobs_category ON jobs(category);
CREATE INDEX idx_jobs_location ON jobs(location);

-- Composite index for common query patterns
CREATE INDEX idx_jobs_active_featured ON jobs(is_active, is_featured, posted_at DESC);

-- GIN index for tags array searching
CREATE INDEX idx_jobs_tags ON jobs USING GIN(tags);

-- Full-text search index on title and description
CREATE INDEX idx_jobs_search ON jobs USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- ============================================
-- JOB ALERTS TABLE
-- ============================================
CREATE TABLE job_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    filters JSONB DEFAULT '{}',
    frequency VARCHAR(20) NOT NULL DEFAULT 'daily' CHECK (frequency IN ('instant', 'daily', 'weekly')),
    is_active BOOLEAN DEFAULT TRUE,
    last_sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for job alerts
CREATE INDEX idx_job_alerts_email ON job_alerts(email);
CREATE INDEX idx_job_alerts_is_active ON job_alerts(is_active);
CREATE INDEX idx_job_alerts_frequency ON job_alerts(frequency);

-- GIN index for JSONB filters
CREATE INDEX idx_job_alerts_filters ON job_alerts USING GIN(filters);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_alerts ENABLE ROW LEVEL SECURITY;

-- Companies: Public read access
CREATE POLICY "Companies are viewable by everyone"
    ON companies FOR SELECT
    USING (true);

-- Categories: Public read access
CREATE POLICY "Categories are viewable by everyone"
    ON categories FOR SELECT
    USING (true);

-- Jobs: Public read access to active jobs only
CREATE POLICY "Active jobs are viewable by everyone"
    ON jobs FOR SELECT
    USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));

-- Job Alerts: Users can only view their own alerts (by email)
-- Note: In production, you'd want to use auth.email() for authenticated users
CREATE POLICY "Users can view their own job alerts"
    ON job_alerts FOR SELECT
    USING (true); -- Adjust based on auth strategy

CREATE POLICY "Users can insert their own job alerts"
    ON job_alerts FOR INSERT
    WITH CHECK (true); -- Adjust based on auth strategy

CREATE POLICY "Users can update their own job alerts"
    ON job_alerts FOR UPDATE
    USING (true); -- Adjust based on auth strategy

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
    BEFORE UPDATE ON jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_alerts_updated_at
    BEFORE UPDATE ON job_alerts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED DATA: Default Categories
-- ============================================
INSERT INTO categories (name, slug, icon) VALUES
    ('Engineering', 'engineering', 'code'),
    ('Design', 'design', 'palette'),
    ('Marketing', 'marketing', 'megaphone'),
    ('Sales', 'sales', 'chart'),
    ('Customer Support', 'customer-support', 'headset'),
    ('Product', 'product', 'box'),
    ('Data', 'data', 'database'),
    ('Finance', 'finance', 'dollar'),
    ('Human Resources', 'human-resources', 'users'),
    ('Operations', 'operations', 'settings'),
    ('Legal', 'legal', 'scale'),
    ('Writing', 'writing', 'pen'),
    ('DevOps', 'devops', 'server'),
    ('QA', 'qa', 'check'),
    ('Other', 'other', 'more');
