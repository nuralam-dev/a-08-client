
"use client";

import { useEffect, useState } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import FacilityCard from "@/components/FacilityCard";
import { Input } from "@/components/ui/input";
import type { Facility } from "@/types/facility";

const API_URL = "/api/backend";

export default function AllFacilities() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function getFacilities() {
      try {
        const response = await fetch(
          `${API_URL}/facilities`
        );

        if (!response.ok) {
          throw new Error("Failed to load facilities");
        }

        const data: Facility[] = await response.json();

        setFacilities(data);
      } catch (error) {
        console.error("Error fetching facilities:", error);
        setError("Unable to load facilities. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    getFacilities();
  }, []);

  // Filter facilities by name, category, or location
  const filteredFacilities = facilities.filter((facility) => {
    const searchText = search.toLowerCase();

    return (
      facility.name.toLowerCase().includes(searchText) ||
      facility.category.toLowerCase().includes(searchText) ||
      facility.location.toLowerCase().includes(searchText)
    );
  });

  return (
    <section className="min-h-screen bg-slate-50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Page Heading */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
            All Facilities
          </h1>

          <p className="mt-3 text-slate-500">
            Explore creative studios and find the perfect space
            for your next project.
          </p>
        </div>

        {/* Search Section */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <p className="font-medium text-slate-600">
            {loading
              ? "Loading facilities..."
              : `Showing ${filteredFacilities.length} of ${facilities.length} facilities`}
          </p>

          <div className="relative w-full sm:max-w-sm">
            <FaMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

            <Input
              type="text"
              placeholder="Search facilities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 rounded-xl bg-white pl-11"
            />
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse overflow-hidden rounded-2xl border bg-white"
              >
                <div className="h-56 bg-slate-200" />

                <div className="space-y-4 p-5">
                  <div className="h-6 w-3/4 rounded bg-slate-200" />
                  <div className="h-4 w-1/2 rounded bg-slate-200" />
                  <div className="h-4 w-2/3 rounded bg-slate-200" />
                  <div className="h-11 rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border bg-white p-12 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* All Facilities Grid */}
        {!loading && !error && filteredFacilities.length > 0 && (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {filteredFacilities.map((facility) => (
              <FacilityCard
                key={facility._id}
                facility={facility}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredFacilities.length === 0 && (
          <div className="rounded-2xl border bg-white p-12 text-center">
            <h2 className="text-xl font-semibold text-slate-800">
              No facilities found
            </h2>

            <p className="mt-2 text-slate-500">
              Try searching for another studio or location.
            </p>
          </div>
        )}

      </div>
    </section>
  );
}
