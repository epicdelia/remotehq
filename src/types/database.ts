// Database type definitions for Supabase
// These types mirror the database schema defined in supabase/migrations/001_initial_schema.sql

export type JobType = 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship';

export type AlertFrequency = 'instant' | 'daily' | 'weekly';

export interface Company {
  id: string;
  name: string;
  logo_url: string | null;
  website: string | null;
  description: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  created_at: string;
}

export interface Job {
  id: string;
  company_id: string;
  title: string;
  description: string;
  salary_min: number | null;
  salary_max: number | null;
  location: string | null;
  job_type: JobType;
  category: string | null;
  tags: string[];
  apply_url: string;
  is_featured: boolean;
  is_active: boolean;
  posted_at: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface JobWithCompany extends Job {
  company: Company;
}

export interface JobAlertFilters {
  keywords?: string;
  job_types?: JobType[];
  categories?: string[];
  locations?: string[];
  salary_min?: number;
}

export interface JobAlert {
  id: string;
  email: string;
  filters: JobAlertFilters;
  frequency: AlertFrequency;
  is_active: boolean;
  last_sent_at: string | null;
  created_at: string;
  updated_at: string;
}

// Insert types for creating new records
export type CompanyInsert = Omit<Company, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type CategoryInsert = Omit<Category, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

export type JobInsert = Omit<Job, 'id' | 'created_at' | 'updated_at' | 'posted_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
  posted_at?: string;
};

export type JobAlertInsert = Omit<JobAlert, 'id' | 'created_at' | 'updated_at' | 'last_sent_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
  last_sent_at?: string;
};

// Update types for modifying existing records
export type CompanyUpdate = Partial<Omit<Company, 'id' | 'created_at' | 'updated_at'>>;
export type CategoryUpdate = Partial<Omit<Category, 'id' | 'created_at'>>;
export type JobUpdate = Partial<Omit<Job, 'id' | 'created_at' | 'updated_at'>>;
export type JobAlertUpdate = Partial<Omit<JobAlert, 'id' | 'created_at' | 'updated_at'>>;

// Database schema type for Supabase client
export interface Database {
  public: {
    Tables: {
      companies: {
        Row: Company;
        Insert: CompanyInsert;
        Update: CompanyUpdate;
        Relationships: [];
      };
      categories: {
        Row: Category;
        Insert: CategoryInsert;
        Update: CategoryUpdate;
        Relationships: [];
      };
      jobs: {
        Row: Job;
        Insert: JobInsert;
        Update: JobUpdate;
        Relationships: [
          {
            foreignKeyName: "jobs_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          }
        ];
      };
      job_alerts: {
        Row: JobAlert;
        Insert: JobAlertInsert;
        Update: JobAlertUpdate;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      job_type: JobType;
      alert_frequency: AlertFrequency;
    };
    CompositeTypes: Record<string, never>;
  };
}

// Type helpers for table operations
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
