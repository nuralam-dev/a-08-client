
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa6";

import FacilityCard from "./FacilityCard";
import type { Facility } from "@/types/facility";

async function getFeaturedFacilities(): Promise<Facility[]> {
  try {
    const response = await fetch(
      "http://localhost:4000/facilities",
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch facilities");
    }

    const facilities: Facility[] = await response.json();

    return facilities.slice(0, 6);
  } catch (error) {
    console.error("Error fetching facilities:", error);
    return [];
  }
}

export default async function FeaturedFacilities() {
  const facilities = await getFeaturedFacilities();

  return (
    <section className="bg-slate-50 py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Section Heading */}
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
              Featured Facilities
            </h2>

            <p className="mt-3 text-base text-slate-500">
              Discover inspiring studios for your next creative project
            </p>
          </div>

          <Link
            href="/facilities"
            className="flex items-center gap-2 font-semibold text-green-700 hover:text-green-800"
          >
            View All
            <FaArrowRight />
          </Link>
        </div>

        {/* Facilities Grid */}
        {facilities.length > 0 ? (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {facilities.map((facility) => (
              <FacilityCard
                key={facility._id}
                facility={facility}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border bg-white p-12 text-center">
            <p className="text-gray-500">
              No facilities available right now.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
