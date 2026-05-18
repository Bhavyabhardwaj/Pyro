import { cn } from "../../lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-white/[0.06] shadow-inner shadow-white/[0.02]",
        className,
      )}
    />
  );
}
