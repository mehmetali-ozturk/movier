"use client";

import { useEffect, useMemo, useState } from "react";
import { Film } from "lucide-react";
import { getImageUrl } from "@/lib/api";

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
  const [failed, setFailed] = useState(false);
  const src = useMemo(() => (path ? getImageUrl(path, size) : null), [path, size]);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <div className={fallbackClassName ?? "w-full h-full bg-gray-800 flex items-center justify-center"}>
        <Film className="text-gray-600" size={iconSize} strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      draggable={false}
      onError={() => setFailed(true)}
    />
  );
}
