"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import type { Facility } from "@/types/facility";
import AddFacilityForm from "./AddFacilityForm";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function ManageFacilities({ scope = "mine" }: { scope?: "mine" | "all" }) {
  const returnTo = scope === "all" ? "/dashboard/manage-facilities" : "/dashboard/my-facility";
  const router = useRouter();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [editing, setEditing] = useState<Facility | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError("");
      try {
        const session = await authClient.getSession();
        if (controller.signal.aborted) return;
        if (session.error) throw new Error("Unable to verify your sign-in");
        if (!session.data) {
          router.replace(`/login?next=${encodeURIComponent(returnTo)}`);
          return;
        }
        let endpoint = `${API_URL}/facilities`;
        if (scope === "mine") {
          const email = session.data.user.email?.trim();
          if (!email) throw new Error("Your account needs an email to load your facilities.");
          endpoint += `/my?${new URLSearchParams({ email })}`;
        }
        const response = await fetch(endpoint, { signal: controller.signal, cache: "no-store" });
        if (!response.ok) throw new Error("Unable to load facilities. Please try again.");
        const data: Facility[] = await response.json();
        setFacilities(data);
      } catch (error) {
        if (!controller.signal.aborted) setError(error instanceof Error ? error.message : "Unable to load facilities.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [attempt, router, scope, returnTo]);

  async function deleteFacility(facility: Facility) {
    if (deleting || !window.confirm(`Delete "${facility.name}"? This cannot be undone.`)) return;
    setDeleting(facility._id);
    try {
      const session = await authClient.getSession();
      if (session.error) throw new Error("Unable to verify your sign-in");
      if (!session.data) {
        router.replace(`/login?next=${encodeURIComponent(returnTo)}`);
        return;
      }
      const response = await fetch(`${API_URL}/facilities/${encodeURIComponent(facility._id)}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Unable to delete studio. Please try again.");
      const result = await response.json();
      if (result.acknowledged !== true || result.deletedCount !== 1) throw new Error("Studio was not found or could not be deleted.");
      setFacilities((current) => current.filter((item) => item._id !== facility._id));
      toast.success("Studio deleted successfully!");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete studio.");
    } finally {
      setDeleting(null);
    }
  }

  if (editing) return <AddFacilityForm key={editing._id} facility={editing} returnTo={returnTo} onCancel={() => setEditing(null)} onSaved={(updated) => {
    setFacilities((current) => current.map((item) => item._id === updated._id ? updated : item));
    setEditing(null);
  }} />;

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10 md:px-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{scope === "all" ? "Manage Facilities" : "My Facilities"}</h1>
          <p className="mt-2 text-slate-500">{scope === "all" ? "View, update, and delete all studio listings." : "View, update, and delete the studios you have listed."}</p>
        </div>
        <Link href="/dashboard/add-facility" className="rounded-xl bg-green-600 px-5 py-3 font-semibold text-white">Add Studio</Link>
      </div>
      {loading ? <p role="status">Loading facilities...</p> : error ? (
        <div role="alert" className="space-y-4 rounded-2xl border bg-white p-6">
          <p>{error}</p><Button onClick={() => setAttempt((value) => value + 1)}>Try Again</Button>
        </div>
      ) : facilities.length === 0 ? <p className="rounded-2xl border bg-white p-8">No facilities yet. Add a studio to get started.</p> : (
        <div className="grid gap-5 xl:grid-cols-2">
          {facilities.map((facility) => (
            <article key={facility._id} className="rounded-2xl border bg-white p-6">
              <h2 className="text-xl font-bold text-slate-900">{facility.name}</h2>
              <p className="mt-2 text-slate-500">{facility.category} · {facility.location}</p>
              <p className="mt-2 font-semibold">${facility.pricePerHour} / hour · {facility.capacity} guests</p>
              <div className="mt-5 flex gap-3">
                <Button variant="outline" disabled={deleting !== null} onClick={() => setEditing(facility)} aria-label={`Edit ${facility.name}`}>Edit</Button>
                <Button variant="destructive" disabled={deleting !== null} onClick={() => void deleteFacility(facility)} aria-label={`Delete ${facility.name}`}>
                  {deleting === facility._id ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
