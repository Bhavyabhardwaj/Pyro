import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export function Surface({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-zinc-950/70 shadow-2xl shadow-black/30",
        className,
      )}
      {...props}
    />
  );
}

export function PyroMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative flex h-7.5 w-7.5 items-center justify-center overflow-hidden rounded-md border border-white/[0.08] bg-[#161615] shadow-md transition-all duration-300 hover:border-white/15 hover:shadow-[0_0_12px_rgba(141,162,170,0.08)]",
        className,
      )}
    >
      {/* Soft monochrome accent highlight inside the container */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.06),transparent_65%)]" />
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="relative h-[13px] w-[13px] text-[#e8e8e5]"
        fill="none"
      >
        {/* Terminal chevron prompt */}
        <path
          d="M11.5 5.5l4 4-4 4"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Terminal vertical cursor block on left */}
        <rect x="5.5" y="5" width="2.2" height="14" rx="0.5" fill="currentColor" />
        {/* Terminal horizontal cursor block on bottom right */}
        <rect x="11.5" y="16.5" width="5.5" height="2" rx="0.5" fill="currentColor" />
      </svg>
    </div>
  );
}
