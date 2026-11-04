
"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Studio categories
const studioCategories = [
  "Photo Studio",
  "Film Stage",
  "Podcast Lounge",
  "Music Suite",
  "Workshop",
];

// Common label style
const labelClass =
  "mb-2 block text-sm font-bold uppercase tracking-wide text-gray-500";

// Common input style
const inputClass =
  "h-12 w-full rounded-2xl border-gray-200 bg-white px-5 text-base text-gray-900 placeholder:text-gray-400 focus-visible:border-green-500 focus-visible:ring-green-500/20";

export default function AddFacilityForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("");

  // Handle form submission
  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Get form values
    const facility = Object.fromEntries(formData.entries());

    // Convert number values
    const newFacility = {
      name: String(facility.name ?? "").trim(),
      category: String(facility.category ?? "").trim(),
      image: String(facility.image ?? "").trim(),
      location: String(facility.location ?? "").trim(),
      pricePerHour: Number(facility.pricePerHour),
      capacity: Number(facility.capacity),
      securityDeposit: Number(facility.securityDeposit),
      description: String(facility.description ?? "").trim(),
    };

    // Simple validation
    if (!newFacility.category) {
      toast.error("Please select a studio category");
      return;
    }

    if (
      !Number.isFinite(newFacility.pricePerHour) ||
      newFacility.pricePerHour <= 0 ||
      !Number.isInteger(newFacility.capacity) ||
      newFacility.capacity <= 0 ||
      !Number.isFinite(newFacility.securityDeposit) ||
      newFacility.securityDeposit < 0
    ) {
      toast.error("Please enter valid numbers");
      return;
    }

    try {
      setLoading(true);

      const session = await authClient.getSession();
      if (session.error) throw new Error("Unable to verify your sign-in");
      if (!session.data) {
        router.replace("/login?next=%2Fdashboard%2Fadd-facility");
        return;
      }

      // POST data to Express.js backend
      const response = await fetch(
        "http://localhost:4000/facilities",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newFacility),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add facility");
      }

      const data = await response.json();

      console.log("New Facility:", newFacility);
      console.log("Server Response:", data);

      if (data.acknowledged || data.insertedId) {
        toast.success("Studio added successfully!", {
          description:
            "Your studio has been added to the platform.",
        });

        // Reset form
        form.reset();
        setCategory("");
      } else {
        toast.error("Studio could not be saved");
      }
    } catch (error) {
      console.error("Error:", error);

      toast.error("Something went wrong!", {
        description: "Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f8f9fb] px-5 py-10 md:px-10 lg:px-14">

      {/* Page Heading */}
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-[#111827] md:text-4xl">
          Add New Studio
        </h1>

        <p className="mt-3 text-base text-gray-500 md:text-lg">
          List your creative studio for others to book
        </p>
      </div>

      {/* Form Card */}
      <div className="w-full rounded-[30px] border border-gray-200/70 bg-white p-6 md:p-10 lg:p-12">

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-2">

            {/* Studio Name */}
            <div>
              <Label htmlFor="name" className={labelClass}>
                Studio Name *
              </Label>

              <Input
                id="name"
                name="name"
                type="text"
                required
                minLength={3}
                maxLength={120}
                placeholder="e.g. Creative Photography Studio"
                className={inputClass}
              />
            </div>

            {/* Studio Category */}
            <div>
              <Label htmlFor="category" className={labelClass}>
                Studio Category *
              </Label>

              <Select
                name="category"
                value={category}
                onValueChange={(value) => setCategory(value ?? "")}
                required
              >
                <SelectTrigger
                  id="category"
                  className={inputClass}
                >
                  <SelectValue
                    placeholder="Select Studio Category"
                  />
                </SelectTrigger>

                <SelectContent>
                  {studioCategories.map((item) => (
                    <SelectItem
                      key={item}
                      value={item}
                    >
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Image URL */}
            <div>
              <Label htmlFor="image" className={labelClass}>
                Image URL *
              </Label>

              <Input
                id="image"
                name="image"
                type="url"
                required
                placeholder="https://example.com/studio.jpg"
                className={inputClass}
              />
            </div>

            {/* Location */}
            <div>
              <Label htmlFor="location" className={labelClass}>
                Location *
              </Label>

              <Input
                id="location"
                name="location"
                type="text"
                required
                placeholder="e.g. Gulshan, Dhaka"
                className={inputClass}
              />
            </div>

            {/* Hourly Price */}
            <div>
              <Label
                htmlFor="pricePerHour"
                className={labelClass}
              >
                Price Per Hour ($) *
              </Label>

              <Input
                id="pricePerHour"
                name="pricePerHour"
                type="number"
                required
                min="0.01"
                step="0.01"
                placeholder="50"
                className={inputClass}
              />
            </div>

            {/* Capacity */}
            <div>
              <Label
                htmlFor="capacity"
                className={labelClass}
              >
                Maximum Capacity *
              </Label>

              <Input
                id="capacity"
                name="capacity"
                type="number"
                required
                min="1"
                step="1"
                placeholder="10"
                className={inputClass}
              />
            </div>

            {/* Security Deposit */}
            <div className="md:col-span-2">
              <Label
                htmlFor="securityDeposit"
                className={labelClass}
              >
                Security Deposit ($) *
              </Label>

              <Input
                id="securityDeposit"
                name="securityDeposit"
                type="number"
                required
                min="0"
                step="0.01"
                placeholder="100"
                className={inputClass}
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <Label
                htmlFor="description"
                className={labelClass}
              >
                Description *
              </Label>

              <Textarea
                id="description"
                name="description"
                required
                minLength={10}
                rows={5}
                placeholder="Describe your studio, equipment, and facilities..."
                className="min-h-[145px] resize-y rounded-2xl border-gray-200 px-5 py-4 text-base focus-visible:border-green-500 focus-visible:ring-green-500/20"
              />
            </div>

          </div>

          {/* Submit Button */}
          <div className="mt-12">
            <Button
              type="submit"
              disabled={loading}
              className="h-13 w-full rounded-2xl bg-green-600 px-12 text-lg font-bold text-white shadow-lg shadow-green-100 transition-all hover:bg-green-700 sm:w-auto"
            >
              {loading ? "Adding Studio..." : "Add Studio"}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}
