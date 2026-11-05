"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

const placeholder = "/images/studio-unavailable.svg";

export default function FacilityImage({ src, alt, ...props }: Omit<ImageProps, "src" | "onError" | "unoptimized"> & { src?: string }) {
  const source = src?.trim() || "";
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const validSource = /^https?:\/\//i.test(source) || (source.startsWith("/") && !source.startsWith("//"));
  const unavailable = !validSource || failedSource === source;

  return (
    <Image
      {...props}
      src={unavailable ? placeholder : source}
      alt={unavailable ? `${alt} — image unavailable` : alt}
      unoptimized
      onError={unavailable ? undefined : () => setFailedSource(source)}
    />
  );
}
