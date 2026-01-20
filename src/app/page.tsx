import { Suspense } from "react";
import { getJobs, getJobCount, getFeaturedJobs, getCategories } from "@/lib/supabase";
import { JobCard, JobCardSkeletonList, Pagination, ThemeToggle, JobFilters } from "@/components";
import type { JobType } from "@/types/database";

const JOBS_PER_PAGE = 10;

interface HomePageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    category?: string;
    jobType?: string;
    location?: string;
    salaryMin?: string;
    salaryMax?: string;
  }>;
}

function HeroSection() {
  return (
    <section className="relative py-16 px-4 bg-gradient-to-br from-[rgb(var(--primary))]/10 via-transparent to-[rgb(var(--accent))]/10">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2230%22%20height%3D%2230%22%20viewBox%3D%220%200%2030%2030%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M1.22676%200C1.91374%200%202.45351%200.539773%202.45351%201.22676C2.45351%201.91374%201.91374%202.45351%201.22676%202.45351C0.539773%202.45351%200%201.91374%200%201.22676C0%200.539773%200.539773%200%201.22676%200Z%22%20fill%3D%22rgba(0%2C0%2C0%2C0.07)%22%2F%3E%3C%2Fsvg%3E')] dark:bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2230%22%20height%3D%2230%22%20viewBox%3D%220%200%2030%2030%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M1.22676%200C1.91374%200%202.45351%200.539773%202.45351%201.22676C2.45351%201.91374%201.91374%202.45351%201.22676%202.45351C0.539773%202.45351%200%201.91374%200%201.22676C0%200.539773%200.539773%200%201.22676%200Z%22%20fill%3D%22rgba(255%2C255%2C255%2C0.07)%22%2F%3E%3C%2Fsvg%3E')]" />
      <div className="relative max-w-4xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
          Find Your Dream{" "}
          <span className="text-[rgb(var(--primary))]">Remote Job</span>
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-[rgb(var(--muted-foreground))] max-w-2xl mx-auto">
          Discover thousands of remote opportunities from top companies
          worldwide. Work from anywhere and build your career on your terms.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-[rgb(var(--muted-foreground))]">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[rgb(var(--primary))]">
              <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
            </svg>
            Verified Companies
          </div>
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[rgb(var(--primary))]">
              <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z" clipRule="evenodd" />
            </svg>
            Updated Daily
          </div>
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[rgb(var(--primary))]">
              <path fillRule="evenodd" d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
            </svg>
            100% Remote
          </div>
        </div>
      </div>
    </section>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-[rgb(var(--background))]/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="/" className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-[rgb(var(--primary))]">
              <path fillRule="evenodd" d="M7.5 5.25a3 3 0 0 1 3-3h3a3 3 0 0 1 3 3v.205c.933.085 1.857.197 2.774.334 1.454.218 2.476 1.483 2.476 2.917v3.033c0 1.211-.734 2.352-1.936 2.752A24.726 24.726 0 0 1 12 15.75c-2.73 0-5.357-.442-7.814-1.259-1.202-.4-1.936-1.541-1.936-2.752V8.706c0-1.434 1.022-2.7 2.476-2.917A48.814 48.814 0 0 1 7.5 5.455V5.25Zm7.5 0v.09a49.488 49.488 0 0 0-6 0v-.09a1.5 1.5 0 0 1 1.5-1.5h3a1.5 1.5 0 0 1 1.5 1.5Zm-3 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
              <path d="M3 18.4v-2.796a4.3 4.3 0 0 0 .713.31A26.226 26.226 0 0 0 12 17.25c2.892 0 5.68-.468 8.287-1.335.252-.084.49-.189.713-.311V18.4c0 1.452-1.047 2.728-2.523 2.923-2.12.282-4.282.427-6.477.427a49.19 49.19 0 0 1-6.477-.427C4.047 21.128 3 19.852 3 18.4Z" />
            </svg>
            <span className="text-xl font-bold">Remote Jobs</span>
          </a>
          <div className="flex items-center gap-4">
            <a href="/post-job" className="btn-primary hidden sm:inline-flex">
              Post a Job
            </a>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}

interface FeaturedJobsProps {
  jobs: Awaited<ReturnType<typeof getFeaturedJobs>>;
}

function FeaturedJobsSection({ jobs }: FeaturedJobsProps) {
  if (jobs.length === 0) return null;

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-[rgb(var(--accent))]">
            <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
          </svg>
          <h2 className="text-2xl font-bold">Featured Jobs</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </div>
    </section>
  );
}

interface JobListingsProps {
  page: number;
  search?: string;
  category?: string;
  jobType?: JobType;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
}

async function JobListings({
  page,
  search,
  category,
  jobType,
  location,
  salaryMin,
  salaryMax,
}: JobListingsProps) {
  const offset = (page - 1) * JOBS_PER_PAGE;

  const queryOptions = {
    limit: JOBS_PER_PAGE,
    offset,
    search,
    category,
    jobType,
    location,
    salaryMin,
    salaryMax,
  };

  const [jobs, totalCount] = await Promise.all([
    getJobs(queryOptions),
    getJobCount({ search, category, jobType, location, salaryMin, salaryMax }),
  ]);

  const totalPages = Math.ceil(totalCount / JOBS_PER_PAGE);
  const hasFilters = search || category || jobType || location || salaryMin || salaryMax;

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 mx-auto text-[rgb(var(--muted-foreground))]">
          <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clipRule="evenodd" />
        </svg>
        <h3 className="mt-4 text-xl font-semibold">No jobs found</h3>
        <p className="mt-2 text-[rgb(var(--muted-foreground))]">
          {hasFilters
            ? "No jobs match your filters. Try adjusting your search criteria."
            : "No jobs available at the moment. Check back soon!"}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">
          {hasFilters ? "Search Results" : "Latest Jobs"}
        </h2>
        <span className="text-[rgb(var(--muted-foreground))]">
          {totalCount.toLocaleString()} {totalCount === 1 ? "job" : "jobs"} found
        </span>
      </div>
      <div className="space-y-4">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
      <div className="mt-8">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalCount}
        />
      </div>
    </>
  );
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const search = params.search?.trim();
  const category = params.category?.trim();
  const jobType = params.jobType as JobType | undefined;
  const location = params.location?.trim();
  const salaryMin = params.salaryMin ? parseInt(params.salaryMin, 10) : undefined;
  const salaryMax = params.salaryMax ? parseInt(params.salaryMax, 10) : undefined;

  const hasFilters = search || category || jobType || location || salaryMin || salaryMax;

  const [featuredJobs, categories] = await Promise.all([
    getFeaturedJobs(4),
    getCategories(),
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />

        {!hasFilters && <FeaturedJobsSection jobs={featuredJobs} />}

        <section className="py-12 bg-[rgb(var(--muted))]/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Filters Sidebar */}
              <aside className="lg:w-72 flex-shrink-0">
                <div className="lg:sticky lg:top-24">
                  <h2 className="text-lg font-semibold mb-4">Filters</h2>
                  <Suspense fallback={<div className="card p-4 skeleton h-96" />}>
                    <JobFilters categories={categories} />
                  </Suspense>
                </div>
              </aside>

              {/* Job Listings */}
              <div className="flex-1 min-w-0">
                <Suspense fallback={<JobCardSkeletonList count={JOBS_PER_PAGE} />}>
                  <JobListings
                    page={page}
                    search={search}
                    category={category}
                    jobType={jobType}
                    location={location}
                    salaryMin={salaryMin}
                    salaryMax={salaryMax}
                  />
                </Suspense>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-[rgb(var(--primary))]">
                <path fillRule="evenodd" d="M7.5 5.25a3 3 0 0 1 3-3h3a3 3 0 0 1 3 3v.205c.933.085 1.857.197 2.774.334 1.454.218 2.476 1.483 2.476 2.917v3.033c0 1.211-.734 2.352-1.936 2.752A24.726 24.726 0 0 1 12 15.75c-2.73 0-5.357-.442-7.814-1.259-1.202-.4-1.936-1.541-1.936-2.752V8.706c0-1.434 1.022-2.7 2.476-2.917A48.814 48.814 0 0 1 7.5 5.455V5.25Zm7.5 0v.09a49.488 49.488 0 0 0-6 0v-.09a1.5 1.5 0 0 1 1.5-1.5h3a1.5 1.5 0 0 1 1.5 1.5Zm-3 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
                <path d="M3 18.4v-2.796a4.3 4.3 0 0 0 .713.31A26.226 26.226 0 0 0 12 17.25c2.892 0 5.68-.468 8.287-1.335.252-.084.49-.189.713-.311V18.4c0 1.452-1.047 2.728-2.523 2.923-2.12.282-4.282.427-6.477.427a49.19 49.19 0 0 1-6.477-.427C4.047 21.128 3 19.852 3 18.4Z" />
              </svg>
              <span className="font-semibold">Remote Jobs</span>
            </div>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              &copy; {new Date().getFullYear()} Remote Jobs. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
