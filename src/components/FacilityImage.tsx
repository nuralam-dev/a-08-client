"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

const placeholder = "/images/studio-unavailable.svg";

function imageSource(value: string | string[] | undefined) {
  const images = Array.isArray(value) ? value : [value];
  for (const image of images) {
    const source = image?.trim();
    if (!source) continue;
    if (source.startsWith("/") && !source.startsWith("//") && !source.includes("\\")) return source;
    try {
      const url = new URL(source);
      if (["https:", "http:"].includes(url.protocol) && !url.username && !url.password) return url.href;
    } catch {
      // Try the next array entry, then use the local placeholder.
    }
  }
  return "";
}

export default function FacilityImage({ src, alt, ...props }: Omit<ImageProps, "src" | "onError" | "unoptimized"> & { src?: string | string[] }) {
  const source = imageSource(src);
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const unavailable = !source || failedSource === source;

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
