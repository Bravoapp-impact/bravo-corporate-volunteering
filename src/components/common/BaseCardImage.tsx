import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BaseCardImageProps {
  imageUrl: string | null;
  alt: string;
  aspectRatio?: "square" | "video" | "portrait";
  fallbackEmoji?: string;
  badge?: ReactNode;
  badgePosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  className?: string;
  imageClassName?: string;
}

const aspectRatioClasses = {
  square: "aspect-square",
  video: "aspect-video",
  portrait: "aspect-[3/4]",
};

const badgePositionClasses = {
  "top-left": "top-3 left-3",
  "top-right": "top-3 right-3",
  "bottom-left": "bottom-3 left-3",
  "bottom-right": "bottom-3 right-3",
};

export function BaseCardImage({
  imageUrl,
  alt,
  aspectRatio = "square",
  fallbackEmoji = "🤝",
  badge,
  badgePosition = "top-left",
  className,
  imageClassName,
}: BaseCardImageProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-muted rounded-2xl",
        aspectRatioClasses[aspectRatio],
        className
      )}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={alt}
          className={cn(
            "w-full h-full object-cover transition-transform duration-300 group-hover:scale-105",
            imageClassName
          )}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-muted">
          <span className="text-4xl">{fallbackEmoji}</span>
        </div>
      )}

      {badge && (
        <div className={cn("absolute", badgePositionClasses[badgePosition])}>
          {badge}
        </div>
      )}
    </div>
  );
}
