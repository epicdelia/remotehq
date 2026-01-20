import type { JobWithCompany } from "@/types/database";
import Image from "next/image";
import Link from "next/link";

interface JobCardProps {
  job: JobWithCompany;
}

function formatSalary(min: number | null, max: number | null): string | null {
  if (!min && !max) return null;

  const format = (n: number) => {
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
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

function formatJobType(type: string): string {
  return type
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("-");
}

export function JobCard({ job }: JobCardProps) {
  const salary = formatSalary(job.salary_min, job.salary_max);

  return (
    <Link href={`/jobs/${job.id}`} className="block group">
      <article
        className={`card p-6 transition-all hover:shadow-md hover:border-[rgb(var(--primary))]/50 ${
          job.is_featured ? "ring-2 ring-[rgb(var(--accent))]/50" : ""
        }`}
      >
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            {job.company.logo_url ? (
              <Image
                src={job.company.logo_url}
                alt={`${job.company.name} logo`}
                width={56}
                height={56}
                className="rounded-lg object-contain bg-[rgb(var(--muted))]"
              />
            ) : (
              <div className="w-14 h-14 rounded-lg bg-[rgb(var(--muted))] flex items-center justify-center text-lg font-semibold text-[rgb(var(--muted-foreground))]">
                {job.company.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-lg group-hover:text-[rgb(var(--primary))] transition-colors truncate">
                  {job.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[rgb(var(--muted-foreground))]">
                    {job.company.name}
                  </span>
                  {job.company.is_verified && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-4 h-4 text-[rgb(var(--primary))]"
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
              </div>

              <div className="flex flex-col items-end gap-1">
                {job.is_featured && (
                  <span className="featured-badge">Featured</span>
                )}
                <span className="text-xs text-[rgb(var(--muted-foreground))]">
                  {formatDate(job.posted_at)}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-3">
              {salary && (
                <div className="flex items-center gap-1 text-sm font-medium text-green-600 dark:text-green-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4"
                  >
                    <path d="M12 7.5a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z" />
                    <path
                      fillRule="evenodd"
                      d="M1.5 4.875C1.5 3.839 2.34 3 3.375 3h17.25c1.035 0 1.875.84 1.875 1.875v9.75c0 1.036-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 0 1 1.5 14.625v-9.75ZM8.25 9.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM18.75 9a.75.75 0 0 0-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 0 0 .75-.75V9.75a.75.75 0 0 0-.75-.75h-.008ZM4.5 9.75A.75.75 0 0 1 5.25 9h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H5.25a.75.75 0 0 1-.75-.75V9.75Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {salary}
                </div>
              )}

              {job.location && (
                <div className="flex items-center gap-1 text-sm text-[rgb(var(--muted-foreground))]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {job.location}
                </div>
              )}

              <div className="flex items-center gap-1 text-sm text-[rgb(var(--muted-foreground))]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.5 5.25a3 3 0 0 1 3-3h3a3 3 0 0 1 3 3v.205c.933.085 1.857.197 2.774.334 1.454.218 2.476 1.483 2.476 2.917v3.033c0 1.211-.734 2.352-1.936 2.752A24.726 24.726 0 0 1 12 15.75c-2.73 0-5.357-.442-7.814-1.259-1.202-.4-1.936-1.541-1.936-2.752V8.706c0-1.434 1.022-2.7 2.476-2.917A48.814 48.814 0 0 1 7.5 5.455V5.25Zm7.5 0v.09a49.488 49.488 0 0 0-6 0v-.09a1.5 1.5 0 0 1 1.5-1.5h3a1.5 1.5 0 0 1 1.5 1.5Zm-3 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                    clipRule="evenodd"
                  />
                  <path d="M3 18.4v-2.796a4.3 4.3 0 0 0 .713.31A26.226 26.226 0 0 0 12 17.25c2.892 0 5.68-.468 8.287-1.335.252-.084.49-.189.713-.311V18.4c0 1.452-1.047 2.728-2.523 2.923-2.12.282-4.282.427-6.477.427a49.19 49.19 0 0 1-6.477-.427C4.047 21.128 3 19.852 3 18.4Z" />
                </svg>
                {formatJobType(job.job_type)}
              </div>
            </div>

            {job.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {job.tags.slice(0, 4).map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
                {job.tags.length > 4 && (
                  <span className="tag">+{job.tags.length - 4}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
