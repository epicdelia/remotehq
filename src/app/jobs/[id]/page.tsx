import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { getJobById, getJobs } from "@/lib/supabase";
import { ThemeToggle, JobCard, JobCardSkeletonList } from "@/components";
import { ShareButtons } from "@/components/ShareButtons";
import type { JobWithCompany } from "@/types/database";

interface JobPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: JobPageProps): Promise<Metadata> {
  const { id } = await params;
  const job = await getJobById(id);

  if (!job) {
    return {
      title: "Job Not Found - Remote Jobs",
    };
  }

  const salary = formatSalaryRange(job.salary_min, job.salary_max);
  const description = `${job.title} at ${job.company.name}${salary ? ` - ${salary}` : ""}. ${job.location || "Remote"}. Apply now on Remote Jobs.`;

  return {
    title: `${job.title} at ${job.company.name} - Remote Jobs`,
    description,
    openGraph: {
      title: `${job.title} at ${job.company.name}`,
      description,
      type: "website",
      siteName: "Remote Jobs",
    },
    twitter: {
      card: "summary_large_image",
      title: `${job.title} at ${job.company.name}`,
      description,
    },
  };
}

function formatSalaryRange(min: number | null, max: number | null): string | null {
  if (!min && !max) return null;

  const format = (n: number) => {
    if (n >= 1000000) {
      return `$${(n / 1000000).toFixed(1)}M`;
    }
    if (n >= 1000) {
      return `$${(n / 1000).toFixed(0)}k`;
    }
    return `$${n.toLocaleString()}`;
  };

  if (min && max) {
    return `${format(min)} - ${format(max)}`;
  }
  if (min) {
    return `${format(min)}+`;
  }
  if (max) {
    return `Up to ${format(max)}`;
  }
  return null;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatJobType(type: string): string {
  return type
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("-");
}

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-[rgb(var(--background))]/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-[rgb(var(--primary))]">
              <path fillRule="evenodd" d="M7.5 5.25a3 3 0 0 1 3-3h3a3 3 0 0 1 3 3v.205c.933.085 1.857.197 2.774.334 1.454.218 2.476 1.483 2.476 2.917v3.033c0 1.211-.734 2.352-1.936 2.752A24.726 24.726 0 0 1 12 15.75c-2.73 0-5.357-.442-7.814-1.259-1.202-.4-1.936-1.541-1.936-2.752V8.706c0-1.434 1.022-2.7 2.476-2.917A48.814 48.814 0 0 1 7.5 5.455V5.25Zm7.5 0v.09a49.488 49.488 0 0 0-6 0v-.09a1.5 1.5 0 0 1 1.5-1.5h3a1.5 1.5 0 0 1 1.5 1.5Zm-3 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
              <path d="M3 18.4v-2.796a4.3 4.3 0 0 0 .713.31A26.226 26.226 0 0 0 12 17.25c2.892 0 5.68-.468 8.287-1.335.252-.084.49-.189.713-.311V18.4c0 1.452-1.047 2.728-2.523 2.923-2.12.282-4.282.427-6.477.427a49.19 49.19 0 0 1-6.477-.427C4.047 21.128 3 19.852 3 18.4Z" />
            </svg>
            <span className="text-xl font-bold">Remote Jobs</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/post-job" className="btn-primary hidden sm:inline-flex">
              Post a Job
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}

function CompanySidebar({ company, applyUrl }: { company: JobWithCompany["company"]; applyUrl: string }) {
  return (
    <aside className="lg:w-80 flex-shrink-0">
      <div className="card p-6 lg:sticky lg:top-24">
        <div className="flex flex-col items-center text-center">
          {company.logo_url ? (
            <Image
              src={company.logo_url}
              alt={`${company.name} logo`}
              width={80}
              height={80}
              className="rounded-xl object-contain bg-[rgb(var(--muted))]"
            />
          ) : (
            <div className="w-20 h-20 rounded-xl bg-[rgb(var(--muted))] flex items-center justify-center text-2xl font-bold text-[rgb(var(--muted-foreground))]">
              {company.name.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="mt-4">
            <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
              {company.name}
              {company.is_verified && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 text-[rgb(var(--primary))]"
                  aria-label="Verified company"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </h3>
          </div>

          {company.description && (
            <p className="mt-2 text-sm text-[rgb(var(--muted-foreground))]">
              {company.description}
            </p>
          )}

          {company.website && (
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 text-sm text-[rgb(var(--primary))] hover:underline flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M19.902 4.098a3.75 3.75 0 0 0-5.304 0l-4.5 4.5a3.75 3.75 0 0 0 1.035 6.037.75.75 0 0 1-.646 1.353 5.25 5.25 0 0 1-1.449-8.45l4.5-4.5a5.25 5.25 0 1 1 7.424 7.424l-1.757 1.757a.75.75 0 1 1-1.06-1.06l1.757-1.757a3.75 3.75 0 0 0 0-5.304Zm-7.389 4.267a.75.75 0 0 1 1-.353 5.25 5.25 0 0 1 1.449 8.45l-4.5 4.5a5.25 5.25 0 1 1-7.424-7.424l1.757-1.757a.75.75 0 1 1 1.06 1.06l-1.757 1.757a3.75 3.75 0 1 0 5.304 5.304l4.5-4.5a3.75 3.75 0 0 0-1.035-6.037.75.75 0 0 1-.353-1Z" clipRule="evenodd" />
              </svg>
              Visit Website
            </a>
          )}
        </div>

        <div className="mt-6 pt-6 border-t">
          <a
            href={applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary w-full justify-center text-center py-3 text-base font-semibold"
          >
            Apply Now
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-2">
              <path fillRule="evenodd" d="M8.25 3.75H19.5a.75.75 0 0 1 .75.75v11.25a.75.75 0 0 1-1.5 0V6.31L5.03 20.03a.75.75 0 0 1-1.06-1.06L17.69 5.25H8.25a.75.75 0 0 1 0-1.5Z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
      </div>
    </aside>
  );
}

function SalaryBenefitsSection({ job }: { job: JobWithCompany }) {
  const salary = formatSalaryRange(job.salary_min, job.salary_max);

  return (
    <div className="card p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">Compensation & Details</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {salary && (
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-green-600 dark:text-green-400">
                <path d="M12 7.5a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z" />
                <path fillRule="evenodd" d="M1.5 4.875C1.5 3.839 2.34 3 3.375 3h17.25c1.035 0 1.875.84 1.875 1.875v9.75c0 1.036-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 0 1 1.5 14.625v-9.75ZM8.25 9.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM18.75 9a.75.75 0 0 0-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 0 0 .75-.75V9.75a.75.75 0 0 0-.75-.75h-.008ZM4.5 9.75A.75.75 0 0 1 5.25 9h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H5.25a.75.75 0 0 1-.75-.75V9.75Z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-[rgb(var(--muted-foreground))]">Salary Range</p>
              <p className="font-semibold text-green-600 dark:text-green-400">{salary}</p>
            </div>
          </div>
        )}

        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-[rgb(var(--primary))]/10">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[rgb(var(--primary))]">
              <path fillRule="evenodd" d="M7.5 5.25a3 3 0 0 1 3-3h3a3 3 0 0 1 3 3v.205c.933.085 1.857.197 2.774.334 1.454.218 2.476 1.483 2.476 2.917v3.033c0 1.211-.734 2.352-1.936 2.752A24.726 24.726 0 0 1 12 15.75c-2.73 0-5.357-.442-7.814-1.259-1.202-.4-1.936-1.541-1.936-2.752V8.706c0-1.434 1.022-2.7 2.476-2.917A48.814 48.814 0 0 1 7.5 5.455V5.25Zm7.5 0v.09a49.488 49.488 0 0 0-6 0v-.09a1.5 1.5 0 0 1 1.5-1.5h3a1.5 1.5 0 0 1 1.5 1.5Zm-3 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
              <path d="M3 18.4v-2.796a4.3 4.3 0 0 0 .713.31A26.226 26.226 0 0 0 12 17.25c2.892 0 5.68-.468 8.287-1.335.252-.084.49-.189.713-.311V18.4c0 1.452-1.047 2.728-2.523 2.923-2.12.282-4.282.427-6.477.427a49.19 49.19 0 0 1-6.477-.427C4.047 21.128 3 19.852 3 18.4Z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">Job Type</p>
            <p className="font-semibold">{formatJobType(job.job_type)}</p>
          </div>
        </div>

        {job.location && (
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[rgb(var(--primary))]/10">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[rgb(var(--primary))]">
                <path fillRule="evenodd" d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-[rgb(var(--muted-foreground))]">Location</p>
              <p className="font-semibold">{job.location}</p>
            </div>
          </div>
        )}

        {job.category && (
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[rgb(var(--primary))]/10">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[rgb(var(--primary))]">
                <path fillRule="evenodd" d="M5.25 2.25a3 3 0 0 0-3 3v4.318a3 3 0 0 0 .879 2.121l9.58 9.581c.92.92 2.39 1.186 3.548.428a18.849 18.849 0 0 0 5.441-5.44c.758-1.16.492-2.629-.428-3.548l-9.58-9.581a3 3 0 0 0-2.122-.879H5.25ZM6.375 7.5a1.125 1.125 0 1 0 0-2.25 1.125 1.125 0 0 0 0 2.25Z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-[rgb(var(--muted-foreground))]">Category</p>
              <p className="font-semibold">{job.category}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function JobDescription({ description }: { description: string }) {
  // Simple markdown-like rendering for common patterns
  const renderMarkdown = (text: string) => {
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];
    let listItems: string[] = [];

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="list-disc list-inside space-y-1 mb-4">
            {listItems.map((item, idx) => (
              <li key={idx} className="text-[rgb(var(--foreground))]">{item}</li>
            ))}
          </ul>
        );
        listItems = [];
      }
    };

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();

      // Handle headers
      if (trimmedLine.startsWith("### ")) {
        flushList();
        elements.push(
          <h4 key={index} className="text-lg font-semibold mt-6 mb-2">{trimmedLine.slice(4)}</h4>
        );
        return;
      }
      if (trimmedLine.startsWith("## ")) {
        flushList();
        elements.push(
          <h3 key={index} className="text-xl font-semibold mt-6 mb-3">{trimmedLine.slice(3)}</h3>
        );
        return;
      }
      if (trimmedLine.startsWith("# ")) {
        flushList();
        elements.push(
          <h2 key={index} className="text-2xl font-bold mt-6 mb-3">{trimmedLine.slice(2)}</h2>
        );
        return;
      }

      // Handle list items
      if (trimmedLine.startsWith("- ") || trimmedLine.startsWith("* ") || /^\d+\.\s/.test(trimmedLine)) {
        const content = trimmedLine.replace(/^[-*]\s/, "").replace(/^\d+\.\s/, "");
        listItems.push(content);
        return;
      }

      // Handle empty lines
      if (trimmedLine === "") {
        flushList();
        return;
      }

      // Handle regular paragraphs
      flushList();
      // Process inline formatting
      const processedLine = trimmedLine
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.+?)\*/g, "<em>$1</em>")
        .replace(/`(.+?)`/g, '<code class="px-1 py-0.5 bg-[rgb(var(--muted))] rounded text-sm">$1</code>');

      elements.push(
        <p
          key={index}
          className="mb-4 text-[rgb(var(--foreground))]"
          dangerouslySetInnerHTML={{ __html: processedLine }}
        />
      );
    });

    flushList();
    return elements;
  };

  return (
    <div className="card p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">Job Description</h2>
      <div className="prose prose-sm max-w-none dark:prose-invert">
        {renderMarkdown(description)}
      </div>
    </div>
  );
}

async function RelatedJobs({ currentJob }: { currentJob: JobWithCompany }) {
  // Find related jobs by category, excluding the current job
  const relatedJobs = await getJobs({
    category: currentJob.category ?? undefined,
    limit: 4,
  });

  // Filter out the current job
  const filteredJobs = relatedJobs.filter((job) => job.id !== currentJob.id).slice(0, 3);

  if (filteredJobs.length === 0) {
    return null;
  }

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold mb-6">Related Jobs</h2>
      <div className="space-y-4">
        {filteredJobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </section>
  );
}

export default async function JobDetailPage({ params }: JobPageProps) {
  const { id } = await params;
  const job = await getJobById(id);

  if (!job) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Breadcrumb and Job Header */}
        <div className="bg-gradient-to-br from-[rgb(var(--primary))]/5 via-transparent to-[rgb(var(--accent))]/5 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <nav className="mb-6">
              <ol className="flex items-center gap-2 text-sm text-[rgb(var(--muted-foreground))]">
                <li>
                  <Link href="/" className="hover:text-[rgb(var(--primary))]">
                    Jobs
                  </Link>
                </li>
                <li>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z" clipRule="evenodd" />
                  </svg>
                </li>
                <li className="truncate">{job.title}</li>
              </ol>
            </nav>

            {/* Job Header */}
            <div className="flex items-start gap-4">
              {job.company.logo_url ? (
                <Image
                  src={job.company.logo_url}
                  alt={`${job.company.name} logo`}
                  width={64}
                  height={64}
                  className="rounded-xl object-contain bg-[rgb(var(--muted))] hidden sm:block"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-[rgb(var(--muted))] items-center justify-center text-xl font-bold text-[rgb(var(--muted-foreground))] hidden sm:flex">
                  {job.company.name.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {job.is_featured && (
                    <span className="featured-badge">Featured</span>
                  )}
                  <span className="text-sm text-[rgb(var(--muted-foreground))]">
                    Posted {formatDate(job.posted_at)}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold mb-2">{job.title}</h1>

                <div className="flex items-center gap-2 text-[rgb(var(--muted-foreground))]">
                  <span className="font-medium">{job.company.name}</span>
                  {job.company.is_verified && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5 text-[rgb(var(--primary))]"
                      aria-label="Verified company"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>

                {job.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {job.tags.map((tag) => (
                      <span key={tag} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Column */}
            <div className="flex-1 min-w-0">
              <SalaryBenefitsSection job={job} />
              <JobDescription description={job.description} />

              {/* Share Section */}
              <div className="card p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Share this Job</h2>
                <ShareButtons job={job} />
              </div>

              {/* Mobile Apply Button */}
              <div className="lg:hidden mb-6">
                <a
                  href={job.apply_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full justify-center text-center py-3 text-base font-semibold"
                >
                  Apply Now
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-2">
                    <path fillRule="evenodd" d="M8.25 3.75H19.5a.75.75 0 0 1 .75.75v11.25a.75.75 0 0 1-1.5 0V6.31L5.03 20.03a.75.75 0 0 1-1.06-1.06L17.69 5.25H8.25a.75.75 0 0 1 0-1.5Z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>

              {/* Related Jobs */}
              <Suspense fallback={<JobCardSkeletonList count={3} />}>
                <RelatedJobs currentJob={job} />
              </Suspense>
            </div>

            {/* Sidebar */}
            <div className="hidden lg:block">
              <CompanySidebar company={job.company} applyUrl={job.apply_url} />
            </div>
          </div>
        </div>
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
