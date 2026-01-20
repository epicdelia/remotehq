import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type {
  Database,
  JobWithCompany,
  Company,
  Category,
  JobAlert,
  JobType,
  InsertTables,
  UpdateTables,
} from "@/types/database";

// Lazy-loaded Supabase client singleton
let supabaseInstance: SupabaseClient<Database> | null = null;

function getSupabaseClient(): SupabaseClient<Database> {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required"
    );
  }

  supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey);
  return supabaseInstance;
}

// Export the lazy-loaded client getter
export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get(_, prop) {
    const client = getSupabaseClient();
    const value = client[prop as keyof SupabaseClient<Database>];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});

// Query options for job listings
export interface JobQueryOptions {
  limit?: number;
  offset?: number;
  category?: string;
  jobType?: JobType;
  location?: string;
  search?: string;
  featuredOnly?: boolean;
  companyId?: string;
  salaryMin?: number;
  salaryMax?: number;
}

// ============================================
// JOB QUERY HELPERS
// ============================================

export async function getJobs(options: JobQueryOptions = {}): Promise<JobWithCompany[]> {
  const {
    limit = 20,
    offset = 0,
    category,
    jobType,
    location,
    search,
    featuredOnly,
    companyId,
    salaryMin,
    salaryMax,
  } = options;

  let query = supabase
    .from("jobs")
    .select("*, company:companies(*)")
    .eq("is_active", true)
    .order("is_featured", { ascending: false })
    .order("posted_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (category) {
    query = query.eq("category", category);
  }

  if (jobType) {
    query = query.eq("job_type", jobType);
  }

  if (location) {
    query = query.ilike("location", `%${location}%`);
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }

  if (featuredOnly) {
    query = query.eq("is_featured", true);
  }

  if (companyId) {
    query = query.eq("company_id", companyId);
  }

  if (salaryMin !== undefined) {
    query = query.gte("salary_max", salaryMin);
  }

  if (salaryMax !== undefined) {
    query = query.lte("salary_min", salaryMax);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch jobs: ${error.message}`);
  }

  return (data as JobWithCompany[]) ?? [];
}

export async function getJobById(id: string): Promise<JobWithCompany | null> {
  const { data, error } = await supabase
    .from("jobs")
    .select("*, company:companies(*)")
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Failed to fetch job: ${error.message}`);
  }

  return data as JobWithCompany;
}

export async function getFeaturedJobs(limit = 6): Promise<JobWithCompany[]> {
  return getJobs({ limit, featuredOnly: true });
}

export async function getJobCount(options: Omit<JobQueryOptions, "limit" | "offset"> = {}): Promise<number> {
  const { category, jobType, location, search, featuredOnly, companyId, salaryMin, salaryMax } = options;

  let query = supabase
    .from("jobs")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  if (category) {
    query = query.eq("category", category);
  }

  if (jobType) {
    query = query.eq("job_type", jobType);
  }

  if (location) {
    query = query.ilike("location", `%${location}%`);
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }

  if (featuredOnly) {
    query = query.eq("is_featured", true);
  }

  if (companyId) {
    query = query.eq("company_id", companyId);
  }

  if (salaryMin !== undefined) {
    query = query.gte("salary_max", salaryMin);
  }

  if (salaryMax !== undefined) {
    query = query.lte("salary_min", salaryMax);
  }

  const { count, error } = await query;

  if (error) {
    throw new Error(`Failed to count jobs: ${error.message}`);
  }

  return count ?? 0;
}

// ============================================
// COMPANY QUERY HELPERS
// ============================================

export async function getCompanies(limit = 50, offset = 0): Promise<Company[]> {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .order("name")
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error(`Failed to fetch companies: ${error.message}`);
  }

  return data ?? [];
}

export async function getCompanyById(id: string): Promise<Company | null> {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Failed to fetch company: ${error.message}`);
  }

  return data;
}

export async function getVerifiedCompanies(limit = 50): Promise<Company[]> {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("is_verified", true)
    .order("name")
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch verified companies: ${error.message}`);
  }

  return data ?? [];
}

export async function getCompanyBySlug(slug: string): Promise<Company | null> {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Failed to fetch company: ${error.message}`);
  }

  return data;
}

export interface CompanyWithJobCount extends Company {
  job_count: number;
}

export async function getCompaniesWithJobCount(limit = 50, offset = 0): Promise<CompanyWithJobCount[]> {
  const { data, error } = await supabase
    .from("companies")
    .select("*, jobs!inner(id)")
    .order("name")
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error(`Failed to fetch companies: ${error.message}`);
  }

  // Count jobs for each company
  const companiesWithCount = (data ?? []).map((company) => {
    const { jobs, ...companyData } = company as Company & { jobs: { id: string }[] };
    return {
      ...companyData,
      job_count: jobs?.length ?? 0,
    };
  });

  return companiesWithCount;
}

export async function getCompanyCount(): Promise<number> {
  const { count, error } = await supabase
    .from("companies")
    .select("*", { count: "exact", head: true });

  if (error) {
    throw new Error(`Failed to count companies: ${error.message}`);
  }

  return count ?? 0;
}

export async function getJobsByCompanySlug(slug: string, limit = 20): Promise<JobWithCompany[]> {
  // First get the company by slug
  const company = await getCompanyBySlug(slug);
  if (!company) {
    return [];
  }

  return getJobs({ companyId: company.id, limit });
}

// ============================================
// CATEGORY QUERY HELPERS
// ============================================

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  if (error) {
    throw new Error(`Failed to fetch categories: ${error.message}`);
  }

  return data ?? [];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Failed to fetch category: ${error.message}`);
  }

  return data;
}

// ============================================
// JOB ALERT QUERY HELPERS
// ============================================

export async function createJobAlert(
  alert: InsertTables<"job_alerts">
): Promise<JobAlert> {
  const { data, error } = await supabase
    .from("job_alerts")
    .insert(alert as never)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create job alert: ${error.message}`);
  }

  return data as JobAlert;
}

export async function getJobAlertsByEmail(email: string): Promise<JobAlert[]> {
  const { data, error } = await supabase
    .from("job_alerts")
    .select("*")
    .eq("email", email)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch job alerts: ${error.message}`);
  }

  return data ?? [];
}

export async function updateJobAlert(
  id: string,
  updates: UpdateTables<"job_alerts">
): Promise<JobAlert> {
  const { data, error } = await supabase
    .from("job_alerts")
    .update(updates as never)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update job alert: ${error.message}`);
  }

  return data as JobAlert;
}

export async function deleteJobAlert(id: string): Promise<void> {
  const { error } = await supabase
    .from("job_alerts")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to delete job alert: ${error.message}`);
  }
}

export async function deactivateJobAlert(id: string): Promise<JobAlert> {
  return updateJobAlert(id, { is_active: false });
}
