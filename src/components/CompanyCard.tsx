import type { Company } from "@/types/database";
import Image from "next/image";
import Link from "next/link";

interface CompanyCardProps {
  company: Company;
  jobCount?: number;
}

export function CompanyCard({ company, jobCount }: CompanyCardProps) {
  return (
    <Link href={`/companies/${company.slug}`} className="block group">
      <article className="card p-6 transition-all hover:shadow-md hover:border-[rgb(var(--primary))]/50">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            {company.logo_url ? (
              <Image
                src={company.logo_url}
                alt={`${company.name} logo`}
                width={64}
                height={64}
                className="rounded-xl object-contain bg-[rgb(var(--muted))]"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-[rgb(var(--muted))] flex items-center justify-center text-xl font-bold text-[rgb(var(--muted-foreground))]">
                {company.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg group-hover:text-[rgb(var(--primary))] transition-colors truncate">
                {company.name}
              </h3>
              {company.is_verified && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 text-[rgb(var(--primary))] flex-shrink-0"
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

            {company.description && (
              <p className="mt-2 text-sm text-[rgb(var(--muted-foreground))] line-clamp-2">
                {company.description}
              </p>
            )}

            <div className="flex items-center gap-4 mt-3">
              {jobCount !== undefined && (
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
                  <span>
                    {jobCount} {jobCount === 1 ? "job" : "jobs"}
                  </span>
                </div>
              )}

              {company.website && (
                <div className="flex items-center gap-1 text-sm text-[rgb(var(--muted-foreground))]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M19.902 4.098a3.75 3.75 0 0 0-5.304 0l-4.5 4.5a3.75 3.75 0 0 0 1.035 6.037.75.75 0 0 1-.646 1.353 5.25 5.25 0 0 1-1.449-8.45l4.5-4.5a5.25 5.25 0 1 1 7.424 7.424l-1.757 1.757a.75.75 0 1 1-1.06-1.06l1.757-1.757a3.75 3.75 0 0 0 0-5.304Zm-7.389 4.267a.75.75 0 0 1 1-.353 5.25 5.25 0 0 1 1.449 8.45l-4.5 4.5a5.25 5.25 0 1 1-7.424-7.424l1.757-1.757a.75.75 0 1 1 1.06 1.06l-1.757 1.757a3.75 3.75 0 1 0 5.304 5.304l4.5-4.5a3.75 3.75 0 0 0-1.035-6.037.75.75 0 0 1-.353-1Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="truncate max-w-[150px]">
                    {company.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

export function CompanyCardSkeleton() {
  return (
    <div className="card p-6">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-xl skeleton" />
        <div className="flex-1 min-w-0">
          <div className="h-6 w-48 skeleton rounded mb-2" />
          <div className="h-4 w-full skeleton rounded mb-1" />
          <div className="h-4 w-3/4 skeleton rounded mb-3" />
          <div className="flex items-center gap-4">
            <div className="h-4 w-20 skeleton rounded" />
            <div className="h-4 w-32 skeleton rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CompanyCardSkeletonList({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CompanyCardSkeleton key={i} />
      ))}
    </div>
  );
}
