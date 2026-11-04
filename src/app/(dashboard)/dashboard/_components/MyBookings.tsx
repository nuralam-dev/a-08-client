"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  FaArrowRight,
  FaCalendarDays,
  FaClock,
  FaEnvelope,
  FaRotateRight,
  FaUser,
  FaUsers,
} from "react-icons/fa6";

import { Card, CardContent } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import type { Booking } from "@/types/booking";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// Convert 24-hour time to 12-hour time
function formatTime(time: string) {
  const [hours, minutes] = time.split(":").map(Number);

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return time;
  }

  const period = hours >= 12 ? "PM" : "AM";
  const hour = hours % 12 || 12;

  return `${hour}:${String(minutes).padStart(2, "0")} ${period}`;
}

// Format date without timezone shifting
function formatDate(date: string) {
  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchBookings() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/facilities/booking`, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch bookings");
        }

        const data: unknown = await response.json();

        // Handle both an array and a single booking object
        if (Array.isArray(data)) {
          setBookings(data as Booking[]);
        } else if (data !== null && typeof data === "object" && "_id" in data) {
          setBookings([data as Booking]);
        } else {
          throw new Error("Unexpected booking response");
        }
      } catch (error) {
        if (controller.signal.aborted) return;

        console.error("Booking error:", error);
        setError("Unable to load bookings. Please try again.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchBookings();

    return () => controller.abort();
  }, [refreshKey]);

  return (
    <section className="w-full">
      {/* Page Heading */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">My Bookings</h1>

        <p className="mt-2 text-slate-500">
          View and manage your studio reservations
        </p>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid gap-6 lg:grid-cols-2">
          {[1, 2, 3, 4].map((item) => (
            <Card key={item} className="p-6">
              <Skeleton className="h-7 w-1/2" />
              <Skeleton className="mt-5 h-5 w-full" />
              <Skeleton className="mt-4 h-5 w-3/4" />
              <Skeleton className="mt-4 h-5 w-2/3" />
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <Card>
          <CardContent className="py-14 text-center">
            <h2 className="text-xl font-semibold">Something went wrong</h2>

            <p className="mt-2 text-slate-500">{error}</p>

            <Button
              className="mt-6 bg-green-600 hover:bg-green-700"
              onClick={() => setRefreshKey((value) => value + 1)}
            >
              <FaRotateRight />
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !error && bookings.length === 0 && (
        <Card className="rounded-2xl">
          <CardContent className="flex min-h-[350px] flex-col items-center justify-center text-center">
            <FaCalendarDays className="mb-5 text-5xl text-slate-400" />

            <h2 className="text-xl font-semibold text-slate-800">
              No bookings yet
            </h2>

            <p className="mt-2 text-slate-500">
              Start by exploring our creative studios
            </p>

            <Button className="mt-6 bg-green-600 hover:bg-green-700">
              <Link href="/facilities">
                Browse Facilities
                <FaArrowRight />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Booking Cards */}
      {!loading && !error && bookings.length > 0 && (
        <>
          <p className="mb-5 text-sm text-slate-500">
            Total Bookings: {bookings.length}
          </p>

          <div className="grid gap-6 lg:grid-cols-2">
            {bookings.map((booking) => (
              <Card
                key={booking._id}
                className="rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <CardContent className="space-y-6 p-6">
                  {/* Card Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-xl font-bold text-slate-900">
                      Studio Reservation
                    </h2>

                    <Badge
                      variant="secondary"
                      className="bg-green-50 text-green-700"
                    >
                      {formatDate(booking.date)}
                    </Badge>
                  </div>

                  {/* Booking Information */}
                  <div className="space-y-4 text-sm">
                    <div className="flex items-center gap-3">
                      <FaUser className="text-green-600" />
                      <span className="text-slate-600">{booking.name}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <FaEnvelope className="text-green-600" />
                      <span className="break-all text-slate-600">
                        {booking.email}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <FaCalendarDays className="text-green-600" />
                      <span className="text-slate-600">
                        {formatDate(booking.date)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <FaClock className="text-green-600" />
                      <span className="text-slate-600">
                        {formatTime(booking.startTime)}
                        {" - "}
                        {formatTime(booking.endTime)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <FaUsers className="text-green-600" />
                      <span className="text-slate-600">
                        {booking.guests}{" "}
                        {booking.guests === 1 ? "Guest" : "Guests"}
                      </span>
                    </div>
                  </div>

                  {/* Booking ID */}
                  <div className="border-t pt-4">
                    <p className="break-all text-xs text-slate-400">
                      Booking ID: {booking._id}
                    </p>
                  </div>

                  {/* Facility Details Link */}
                  <Button
                    variant="outline"
                    className="w-full border-green-600 text-green-700 hover:bg-green-50"
                  >
                    <Link href={`/facilities/${booking.facilityId}`}>
                      View Studio
                      <FaArrowRight />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
