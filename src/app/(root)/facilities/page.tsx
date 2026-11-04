import AllFacilities from "@/components/AllFacilities";
import Link from "next/link";

export default function Page() {
  return (
    <main className="mx-auto min-h-[50vh] max-w-7xl px-4 py-16">
      <h1 className="text-3xl font-bold">All Facilities</h1>
      <p className="mt-4 text-muted-foreground">Facility listings are coming soon. No studios are available to browse yet.</p>
      <Link href="/" className="mt-6 inline-block text-primary underline">
        Back to home
      </Link>
      <AllFacilities></AllFacilities>
    </main>
  );
}
