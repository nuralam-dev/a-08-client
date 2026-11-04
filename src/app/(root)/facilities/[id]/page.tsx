import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Users, ShieldCheck } from "lucide-react";
import type { Facility } from "@/types/facility";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default async function FacilityDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // The individual facility endpoint currently returns placeholder text.
  // Resolve the selected studio from the working collection endpoint.
  const response = await fetch(`${API_URL}/facilities`, { cache: "no-store" });
  if (!response.ok) throw new Error("Unable to load studio details");

  const facilities: Facility[] = await response.json();
  const facility = facilities.find((item) => item._id === id);
  if (!facility) notFound();

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link href="/facilities" className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-green-700">
          <ArrowLeft className="size-4" aria-hidden="true" /> Back to facilities
        </Link>
        <div className="mb-8">
          <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">{facility.category}</span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">{facility.name}</h1>
          <p className="mt-4 flex items-center gap-2 text-slate-500"><MapPin className="size-4 shrink-0" aria-hidden="true" />{facility.location}</p>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-slate-200 sm:aspect-[2/1]">
          <Image src={facility.image} alt={facility.name} fill unoptimized loading="eager" sizes="(max-width: 1152px) 100vw, 1152px" className="object-cover" />
        </div>
        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_340px]">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8" aria-labelledby="about-studio">
            <h2 id="about-studio" className="text-2xl font-bold text-slate-900">About this studio</h2>
            <p className="mt-4 whitespace-pre-line leading-relaxed text-slate-600">{facility.description}</p>
            <div className="mt-8 flex items-center gap-4 border-t border-slate-100 pt-6">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-green-50 text-green-700"><Users className="size-5" aria-hidden="true" /></span>
              <div><p className="font-semibold text-slate-900">Up to {facility.capacity} people</p><p className="mt-1 text-sm text-slate-500">Maximum studio capacity</p></div>
            </div>
          </section>
          <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" aria-label="Studio pricing">
            <p className="text-sm text-slate-500">Hourly rate</p>
            <p className="mt-2 text-4xl font-bold tracking-tight text-slate-900">${facility.pricePerHour}<span className="text-base font-normal text-slate-500"> / hour</span></p>
            <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-5 text-sm">
              <span className="flex items-center gap-2 text-slate-600"><ShieldCheck className="size-4 text-green-600" aria-hidden="true" />Security deposit</span>
              <span className="font-semibold text-slate-900">${facility.securityDeposit}</span>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-slate-500">Explore more studios to find the right space for your next project.</p>
            <Link href="/facilities" className="mt-6 flex min-h-12 items-center justify-center rounded-full bg-green-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-green-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green-600">Browse all studios</Link>
          </aside>
        </div>
      </div>
    </main>
  );
}
