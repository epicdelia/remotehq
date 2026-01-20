"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition, useEffect, useCallback } from "react";
import type { Category, JobType } from "@/types/database";

const JOB_TYPES: { value: JobType; label: string }[] = [
  { value: "full-time", label: "Full-Time" },
  { value: "part-time", label: "Part-Time" },
  { value: "contract", label: "Contract" },
  { value: "freelance", label: "Freelance" },
  { value: "internship", label: "Internship" },
];

interface JobFiltersProps {
  categories: Category[];
}

export function JobFilters({ categories }: JobFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [jobType, setJobType] = useState(searchParams.get("jobType") ?? "");
  const [location, setLocation] = useState(searchParams.get("location") ?? "");
  const [salaryMin, setSalaryMin] = useState(searchParams.get("salaryMin") ?? "");
  const [salaryMax, setSalaryMax] = useState(searchParams.get("salaryMax") ?? "");

  const hasFilters =
    search || category || jobType || location || salaryMin || salaryMax;

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams();

    if (search.trim()) params.set("search", search.trim());
    if (category) params.set("category", category);
    if (jobType) params.set("jobType", jobType);
    if (location.trim()) params.set("location", location.trim());
    if (salaryMin) params.set("salaryMin", salaryMin);
    if (salaryMax) params.set("salaryMax", salaryMax);

    startTransition(() => {
      router.push(`/?${params.toString()}`);
    });
  }, [search, category, jobType, location, salaryMin, salaryMax, router]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      applyFilters();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, applyFilters]);

  const handleFilterChange = () => {
    applyFilters();
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setJobType("");
    setLocation("");
    setSalaryMin("");
    setSalaryMax("");
    startTransition(() => {
      router.push("/");
    });
  };

  return (
    <div className="card p-4 space-y-4">
      {/* Search Input */}
      <div>
        <label htmlFor="search" className="block text-sm font-medium mb-1.5">
          Search
        </label>
        <div className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--muted-foreground))]"
          >
            <path
              fillRule="evenodd"
              d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z"
              clipRule="evenodd"
            />
          </svg>
          <input
            id="search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Job title, company, keywords..."
            className="input pl-9"
            disabled={isPending}
          />
        </div>
      </div>

      {/* Category Filter */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium mb-1.5">
          Category
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            handleFilterChange();
          }}
          className="input"
          disabled={isPending}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Job Type Filter */}
      <div>
        <label htmlFor="jobType" className="block text-sm font-medium mb-1.5">
          Job Type
        </label>
        <select
          id="jobType"
          value={jobType}
          onChange={(e) => {
            setJobType(e.target.value);
            handleFilterChange();
          }}
          className="input"
          disabled={isPending}
        >
          <option value="">All Types</option>
          {JOB_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Location Filter */}
      <div>
        <label htmlFor="location" className="block text-sm font-medium mb-1.5">
          Location / Timezone
        </label>
        <input
          id="location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          onBlur={handleFilterChange}
          onKeyDown={(e) => e.key === "Enter" && handleFilterChange()}
          placeholder="e.g. US, Europe, UTC-5..."
          className="input"
          disabled={isPending}
        />
      </div>

      {/* Salary Range Filter */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          Salary Range (USD/year)
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            value={salaryMin}
            onChange={(e) => setSalaryMin(e.target.value)}
            onBlur={handleFilterChange}
            onKeyDown={(e) => e.key === "Enter" && handleFilterChange()}
            placeholder="Min"
            className="input flex-1"
            min="0"
            step="1000"
            disabled={isPending}
          />
          <span className="flex items-center text-[rgb(var(--muted-foreground))]">
            -
          </span>
          <input
            type="number"
            value={salaryMax}
            onChange={(e) => setSalaryMax(e.target.value)}
            onBlur={handleFilterChange}
            onKeyDown={(e) => e.key === "Enter" && handleFilterChange()}
            placeholder="Max"
            className="input flex-1"
            min="0"
            step="1000"
            disabled={isPending}
          />
        </div>
      </div>

      {/* Clear Filters Button */}
      {hasFilters && (
        <button
          onClick={clearFilters}
          disabled={isPending}
          className="btn-secondary w-full"
        >
          {isPending ? (
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="m4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4 mr-2"
              >
                <path
                  fillRule="evenodd"
                  d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z"
                  clipRule="evenodd"
                />
              </svg>
              Clear All Filters
            </>
          )}
        </button>
      )}
    </div>
  );
}
