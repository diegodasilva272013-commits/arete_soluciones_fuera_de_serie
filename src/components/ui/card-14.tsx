"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface PerspectiveFlipCardProps {
  className?: string;
  front: React.ReactNode;
  back: React.ReactNode;
  h?: string;
  w?: string;
}

/**
 * Card 14 - Perspective Real Estate Card (Final Fix)
 * Uses standard rounded-2xl border radius and optimized 3D depth.
 * Removed overflow-hidden from faces to allow Z-translation to work correctly.
 */
export function PerspectiveFlipCard({
  className,
  front,
  back,
  h = "h-[500px]",
  w = "w-[360px]",
}: PerspectiveFlipCardProps) {
  return (
    <div className={cn("group/p-card [perspective:2000px]", h, w, className)}>
      <div
        className={cn(
          "relative h-full w-full transition-all duration-700 [transform-style:preserve-3d] group-hover/p-card:[transform:rotateY(180deg)]",
          "rounded-2xl",
        )}
      >
        {/* Front Face: Property Overview */}
        <div className="absolute inset-0 size-full rounded-2xl border bg-card text-card-foreground [transform-style:preserve-3d] [backface-visibility:hidden]">
          <div className="size-full [transform-style:preserve-3d] p-3">
            {front}
          </div>
        </div>

        {/* Back Face: Property Specs */}
        <div className="absolute inset-0 size-full rounded-2xl border bg-card text-card-foreground [transform-style:preserve-3d] [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div className="size-full [transform-style:preserve-3d] p-8 text-center flex flex-col items-center justify-center">
            {back}
          </div>
        </div>
      </div>
    </div>
  );
}
