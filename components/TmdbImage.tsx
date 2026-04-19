"use client";

import { useMemo, useState } from "react";
import { Film } from "lucide-react";
import { getImageUrl } from "@/lib/api";
import Image from "next/image";

interface TmdbImageProps {
  path?: string;
  alt: string;
  size?: string;
  className: string;
  fallbackClassName?: string;
  iconSize?: number;
}

export default function TmdbImage({
  path,
  alt,
  size = "w500",
  className,
  fallbackClassName,
  iconSize = 48,
}: TmdbImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const src = useMemo(() => (path ? getImageUrl(path, size) : null), [path, size]);

  const failed = !!src && failedSrc === src;

  if (!src || failed) {
    return (
      <div className={fallbackClassName ?? "w-full h-full bg-gray-800 flex items-center justify-center"}>
        <Film className="text-gray-600" size={iconSize} strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={500}
      height={750}
      unoptimized
      className={className}
      draggable={false}
      onError={() => setFailedSrc(src)}
    />
  );
}
