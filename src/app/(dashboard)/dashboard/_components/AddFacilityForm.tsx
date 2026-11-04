
"use client";

import { useState, type FormEvent } from "react";
import { FaPlus, FaTrash } from "react-icons/fa6";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const categories = [
  "Photo Studio",
  "Film Stage",
  "Podcast Lounge",
  "Music Suite",
  "Workshop",
];

const amenitiesOptions = [
  "Wi-Fi",
  "Air Conditioning",
  "Lighting Equipment",
  "Parking",
  "Soundproofing",
  "Changing Room",
];

interface AddFacilityFormProps {
  currentUser?: {
    name: string;
    email: string;
  } | null;
}

export default function AddFacilityForm({
  currentUser,
}: AddFacilityFormProps) {
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");
  const [location, setLocation] = useState("");
  const [pricePerHour, setPricePerHour] = useState("");
  const [securityDeposit, setSecurityDeposit] = useState("");
  const [capacity, setCapacity] = useState("");
  const [description, setDescription] = useState("");

  const [timeSlot, setTimeSlot] = useState("");
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);

  // Add a time slot
  const addTimeSlot = () => {
    const slot = timeSlot.trim();

    if (!slot) {
      toast.error("Please enter a time slot");
      return;
    }

    if (timeSlots.includes(slot)) {
      toast.error("This time slot already exists");
      return;
    }

    setTimeSlots([...timeSlots, slot]);
    setTimeSlot("");
  };

  // Remove a time slot
  const removeTimeSlot = (slot: string) => {
    setTimeSlots(timeSlots.filter((item) => item !== slot));
  };

  // Select or remove amenities
  const handleAmenity = (
    amenity: string,
    checked: boolean
  ) => {
    if (checked) {
      setAmenities([...amenities, amenity]);
    } else {
      setAmenities(amenities.filter((item) => item !== amenity));
    }
  };

  // Submit facility to backend
  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!category) {
      toast.error("Please select a studio category");
      return;
    }

    if (timeSlots.length === 0) {
      toast.error("Add at least one time slot");
      return;
    }

    const hourlyRate = Number(pricePerHour);
    const deposit = Number(securityDeposit);
    const maxCapacity = Number(capacity);

    if (
      !Number.isFinite(hourlyRate) ||
      hourlyRate <= 0 ||
      !Number.isFinite(deposit) ||
      deposit < 0 ||
      !Number.isInteger(maxCapacity) ||
      maxCapacity <= 0
    ) {
      toast.error("Please enter valid numbers");
      return;
    }

    const facilityData = {
      name: name.trim(),
      category,
      image: image.trim(),
      location: location.trim(),
      pricePerHour: hourlyRate,
      securityDeposit: deposit,
      capacity: maxCapacity,
      availableTimeSlots: timeSlots,
      amenities,
      description: description.trim(),
    };

    try {
      setLoading(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/facilities`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(facilityData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add studio");
      }

      toast.success("Studio added successfully!");

      // Reset the form
      setName("");
      setCategory("");
      setImage("");
      setLocation("");
      setPricePerHour("");
      setSecurityDeposit("");
      setCapacity("");
      setDescription("");
      setTimeSlot("");
      setTimeSlots([]);
      setAmenities([]);
    } catch (error) {
      console.error(error);
      toast.error("Failed to add studio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mt-8 rounded-3xl border border-slate-200 bg-white shadow-none">
      <CardContent className="p-6 md:p-9">
        <form onSubmit={handleSubmit} className="space-y-7">

          {/* Two-column form */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

            {/* Studio Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-semibold uppercase text-slate-500">
                Studio Name *
              </Label>
              <Input
                id="name"
                placeholder="e.g. Creative Photo Studio"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-11"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-slate-500">
                Studio Category *
              </Label>
              <Select value={category} onValueChange={(value) => setCategory(value ?? "")}>
                <SelectTrigger className="h-11 w-full">
                  <SelectValue placeholder="Select Studio Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Image URL */}
            <div className="space-y-2">
              <Label htmlFor="image" className="text-xs font-semibold uppercase text-slate-500">
                Image URL *
              </Label>
              <Input
                id="image"
                type="url"
                placeholder="https://example.com/studio.jpg"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                required
                className="h-11"
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-xs font-semibold uppercase text-slate-500">
                Location *
              </Label>
              <Input
                id="location"
                placeholder="e.g. Gulshan, Dhaka"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="h-11"
              />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price" className="text-xs font-semibold uppercase text-slate-500">
                Price Per Hour ($) *
              </Label>
              <Input
                id="price"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="50"
                value={pricePerHour}
                onChange={(e) => setPricePerHour(e.target.value)}
                required
                className="h-11"
              />
            </div>

            {/* Capacity */}
            <div className="space-y-2">
              <Label htmlFor="capacity" className="text-xs font-semibold uppercase text-slate-500">
                Maximum Capacity *
              </Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                step="1"
                placeholder="10"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                required
                className="h-11"
              />
            </div>

            {/* Deposit */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="deposit" className="text-xs font-semibold uppercase text-slate-500">
                Security Deposit ($) *
              </Label>
              <Input
                id="deposit"
                type="number"
                min="0"
                step="0.01"
                placeholder="100"
                value={securityDeposit}
                onChange={(e) => setSecurityDeposit(e.target.value)}
                required
                className="h-11"
              />
            </div>
          </div>

          {/* Available Time Slots */}
          <div className="space-y-3">
            <Label htmlFor="timeSlot" className="text-xs font-semibold uppercase text-slate-500">
              Available Time Slots *
            </Label>

            <div className="flex gap-2">
              <Input
                id="timeSlot"
                placeholder="e.g. 08:00 AM - 09:00 AM"
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="h-11"
              />

              <Button
                type="button"
                onClick={addTimeSlot}
                className="h-11 bg-green-600 px-4 hover:bg-green-700"
                aria-label="Add time slot"
              >
                <FaPlus />
              </Button>
            </div>

            {/* Added Slots */}
            <div className="flex flex-wrap gap-2">
              {timeSlots.map((slot) => (
                <div
                  key={slot}
                  className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700"
                >
                  {slot}

                  <button
                    type="button"
                    onClick={() => removeTimeSlot(slot)}
                    aria-label={`Remove ${slot}`}
                    className="text-red-500"
                  >
                    <FaTrash size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Amenities */}
          <div className="space-y-4">
            <Label className="text-xs font-semibold uppercase text-slate-500">
              Studio Amenities
            </Label>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {amenitiesOptions.map((amenity) => (
                <div
                  key={amenity}
                  className="flex items-center gap-2"
                >
                  <Checkbox
                    id={amenity}
                    checked={amenities.includes(amenity)}
                    onCheckedChange={(checked) =>
                      handleAmenity(amenity, checked === true)
                    }
                  />

                  <Label
                    htmlFor={amenity}
                    className="text-sm font-normal"
                  >
                    {amenity}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Owner Information */}
          {currentUser && (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ownerName">Owner Name</Label>
                <Input
                  id="ownerName"
                  value={currentUser.name}
                  readOnly
                  className="bg-slate-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownerEmail">Owner Email</Label>
                <Input
                  id="ownerEmail"
                  value={currentUser.email}
                  readOnly
                  className="bg-slate-50"
                />
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-xs font-semibold uppercase text-slate-500">
              Description *
            </Label>
            <Textarea
              id="description"
              placeholder="Describe your studio..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              required
              className="resize-none"
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading}
            className="h-12 min-w-48 bg-green-600 px-8 font-semibold hover:bg-green-700"
          >
            {loading ? "Adding Studio..." : "Add Studio"}
          </Button>

        </form>
      </CardContent>
    </Card>
  );
}
