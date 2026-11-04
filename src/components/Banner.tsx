
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import { Button } from "@/components/ui/button";

const slides = [
  {
    id: 1,
    title: "Find Your Perfect Creative Space",
    description:
      "Discover photography, podcast, and music studios for your next creative project.",
    image: "/images/studio-1.jpg",
  },
  {
    id: 2,
    title: "Create Something Extraordinary",
    description:
      "Book inspiring studios equipped with everything you need.",
    image: "/images/studio-2.jpg",
  },
  {
    id: 3,
    title: "Your Studio, Your Opportunity",
    description:
      "Share your creative space with photographers, filmmakers, and musicians.",
    image: "/images/studio-3.jpg",
  },
];

export default function Banner() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;

    const updateSlide = () => {
      setCurrent(api.selectedScrollSnap());
    };

    updateSlide();
    api.on("select", updateSlide);

    return () => {
      api.off("select", updateSlide);
    };
  }, [api]);

  return (
    <section className="w-full">
      <Carousel
        setApi={setApi}
        opts={{ loop: true }}
        className="w-full"
      >
        <CarouselContent className="ml-0">
          {slides.map((slide) => (
            <CarouselItem key={slide.id} className="pl-0">
              <div className="relative flex min-h-[460px] items-center overflow-hidden md:min-h-[580px]">

                {/* Background image */}
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  priority={slide.id === 1}
                  sizes="100vw"
                  className="object-cover"
                />

                {/* Dark overlay */}
                <div className="absolute inset-0 bg-black/60" />

                {/* Banner content */}
                <div className="relative z-10 mx-auto w-full max-w-7xl px-6 text-white md:px-12">
                  <div className="max-w-2xl space-y-6">
                    <h1 className="text-4xl font-bold leading-tight md:text-6xl">
                      {slide.title}
                    </h1>

                    <p className="max-w-xl text-base text-gray-200 md:text-lg">
                      {slide.description}
                    </p>

                    <div className="flex flex-wrap gap-3">
                      <Button  size="lg">
                        <Link href="/facilities">
                          Explore Studios
                        </Link>
                      </Button>

                      <Button
                       
                        size="lg"
                        variant="outline"
                        className="border-white bg-transparent text-white hover:bg-white hover:text-black"
                      >
                        <Link href="/add-facility">
                          List Your Studio
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>

              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Navigation buttons */}
        <CarouselPrevious className="left-4 z-20 hidden md:flex" />
        <CarouselNext className="right-4 z-20 hidden md:flex" />

        {/* Slide indicators */}
        <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => api?.scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`h-2 rounded-full transition-all ${
                current === index
                  ? "w-8 bg-white"
                  : "w-2 bg-white/50"
              }`}
            />
          ))}
        </div>
      </Carousel>
    </section>
  );
}
