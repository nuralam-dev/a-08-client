"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Facility } from "@/types/facility";
import { CalendarDays, Loader2, ShieldCheck } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const money = (amount: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    amount,
  );

export default function BookingForm({ facility }: { facility: Facility }) {
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const minutes = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };
  const duration =
    startTime && endTime ? (minutes(endTime) - minutes(startTime)) / 60 : 0;
  const validDuration = duration > 0;
  const subtotal = validDuration ? duration * facility.pricePerHour : 0;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setError("");
    const start = new Date(`${date}T${startTime}`);
    if (
      !Number.isFinite(start.getTime()) ||
      start <= new Date() ||
      !validDuration
    ) {
      setError(
        "Choose a future date and start time, with an end time after the start time.",
      );
      return;
    }
    const form = event.currentTarget;
    const fields = new FormData(form);
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/facilities/booking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          facilityId: facility._id,
          name: String(fields.get("name") ?? "").trim(),
          email: String(fields.get("email") ?? "").trim(),
          date,
          startTime,
          endTime,
          guests: Number(fields.get("guests")),
        }),
      });
      if (response.status === 404 || response.status === 405) {
        throw new Error(
          "Online booking is not available yet. Please try again later.",
        );
      }
      if (response.status === 409)
        throw new Error(
          "This time slot is unavailable. Please choose another time.",
        );
      if (!response.ok)
        throw new Error("Your booking could not be saved. Please try again.");
      const result = await response.json();
      if (!result.insertedId && !result._id && !result.booking?._id) {
        throw new Error(
          "The server did not confirm your booking. Please try again.",
        );
      }
      toast.success("Booking request saved!", {
        description: `Your request for ${facility.name} has been received.`,
      });
      form.reset();
      setDate("");
      setStartTime("");
      setEndTime("");
    } catch (cause) {
      const message =
        cause instanceof Error
          ? cause.message
          : "Unable to submit your booking. Please try again.";
      setError(message);
      toast.error("Booking was not saved", { description: message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <aside
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
      aria-labelledby="booking-title"
    >
      <p className="text-sm text-slate-500">Hourly rate</p>
      <p className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
        {money(facility.pricePerHour)}
        <span className="text-base font-normal text-slate-500"> / hour</span>
      </p>
      <h2
        id="booking-title"
        className="mt-6 flex items-center gap-2 border-t border-slate-100 pt-6 text-lg font-semibold text-slate-900"
      >
        <CalendarDays className="size-5 text-green-600" aria-hidden="true" />
        Book this studio
      </h2>
      <form
        onSubmit={handleSubmit}
        className="mt-5 space-y-4"
        aria-describedby={error ? "booking-error" : undefined}
      >
        <fieldset
          disabled={loading}
          className="min-w-0 space-y-4 disabled:opacity-60"
        >
          <div className="space-y-2">
            <Label htmlFor="booking-name">Full name</Label>
            <Input
              id="booking-name"
              name="name"
              autoComplete="name"
              required
              minLength={2}
              maxLength={120}
              placeholder="Your full name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="booking-email">Email address</Label>
            <Input
              id="booking-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="booking-date">Booking date</Label>
            <Input
              id="booking-date"
              name="date"
              type="date"
              required
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="min-w-0"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="min-w-0 space-y-2">
              <Label htmlFor="booking-start">Start time</Label>
              <Input
                id="booking-start"
                name="startTime"
                type="time"
                required
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
                className="min-w-0"
              />
            </div>
            <div className="min-w-0 space-y-2">
              <Label htmlFor="booking-end">End time</Label>
              <Input
                id="booking-end"
                name="endTime"
                type="time"
                required
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
                className="min-w-0"
              />
            </div>
          </div>
          {startTime && endTime && !validDuration && (
            <p className="text-sm text-red-600">
              End time must be after start time on the same day.
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="booking-guests">Number of guests</Label>
            <Input
              id="booking-guests"
              name="guests"
              type="number"
              required
              defaultValue={1}
              min={1}
              max={facility.capacity}
              step={1}
            />
            <p className="text-xs text-slate-500">
              Maximum {facility.capacity} guests. Times are in your local time
              zone.
            </p>
          </div>
        </fieldset>
        <div
          className="space-y-3 border-t border-slate-100 pt-4 text-sm"
          aria-live="polite"
        >
          <div className="flex justify-between gap-3 text-slate-600">
            <span>
              {validDuration
                ? `${duration.toFixed(2).replace(/\.?0+$/, "")} hours × ${money(facility.pricePerHour)}`
                : "Studio rental"}
            </span>
            <span>{validDuration ? money(subtotal) : "—"}</span>
          </div>
          <div className="flex justify-between gap-3 text-slate-600">
            <span className="flex items-center gap-1">
              <ShieldCheck className="size-4" aria-hidden="true" />
              Security deposit
            </span>
            <span>{money(facility.securityDeposit)}</span>
          </div>
          <div className="flex justify-between gap-3 border-t border-slate-100 pt-3 font-semibold text-slate-900">
            <span>Estimated total</span>
            <span>
              {validDuration ? money(subtotal + facility.securityDeposit) : "—"}
            </span>
          </div>
        </div>
        {error && (
          <p
            id="booking-error"
            role="alert"
            className="rounded-xl bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}
        <Button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-full bg-green-600 font-semibold text-white hover:bg-green-700"
        >
          {loading && (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          )}
          {loading ? "Submitting..." : "Request booking"}
        </Button>
        <p className="text-center text-xs leading-relaxed text-slate-500">
          No payment is collected here. Availability and final pricing must be
          confirmed by the studio.
        </p>
      </form>
    </aside>
  );
}
