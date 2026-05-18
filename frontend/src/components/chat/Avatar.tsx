import { cn } from "../../lib/utils";

const gradientPairs = [
  "from-cyan-300/70 via-sky-400/40 to-indigo-500/70",
  "from-emerald-300/70 via-teal-400/45 to-cyan-500/70",
  "from-rose-300/70 via-pink-400/45 to-fuchsia-500/70",
  "from-amber-300/70 via-orange-400/45 to-rose-500/70",
  "from-violet-300/70 via-indigo-400/45 to-sky-500/70",
];

const sizeMap = {
  sm: "h-8 w-8",
  md: "h-9 w-9",
  lg: "h-12 w-12",
};

function getGradient(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % gradientPairs.length;
  return gradientPairs[index];
}

export function Avatar({
  name,
  src,
  className,
  size = "md",
  showStatus,
  isOnline,
}: {
  name: string;
  src?: string | null;
  className?: string;
  size?: "sm" | "md" | "lg";
  showStatus?: boolean;
  isOnline?: boolean;
}) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (src) {
    return (
      <div className={cn("relative", className)}>
        <img
          src={src}
          alt={name}
          className={cn("rounded-xl object-cover", sizeMap[size])}
        />
        {showStatus && (
          <span
            className={cn(
              "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border border-zinc-950",
              isOnline ? "bg-emerald-400" : "bg-zinc-600",
            )}
          />
        )}
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "flex items-center justify-center rounded-xl border border-white/10 bg-linear-to-br text-xs font-semibold text-white shadow-[0_12px_30px_rgba(0,0,0,0.25)]",
          sizeMap[size],
          getGradient(name),
        )}
      >
        {initials || "P"}
      </div>
      {showStatus && (
        <span
          className={cn(
            "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border border-zinc-950",
            isOnline ? "bg-emerald-400" : "bg-zinc-600",
          )}
        />
      )}
    </div>
  );
}
