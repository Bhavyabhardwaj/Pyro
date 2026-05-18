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
        "relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-zinc-950 shadow-lg shadow-cyan-950/30",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(103,232,249,0.32),transparent_46%)]" />
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="relative h-5 w-5 text-white"
        fill="none"
      >
        <path
          d="M12.2 3.5c2.3 2.3 4.9 5 4.9 8.9 0 4.2-2.5 7.1-5.4 7.1-3 0-5.1-2.2-5.1-5.3 0-2.2 1.1-4.1 3-5.7-.1 1.7.7 3 2 3.8 1.9-2.3.1-5.5.6-8.8Z"
          className="fill-cyan-100"
        />
        <path
          d="M12 20c2.7-.4 4.5-2.7 4.5-5.7 0-1.4-.3-2.6-.9-3.7"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          className="text-white/70"
        />
      </svg>
    </div>
  );
}
