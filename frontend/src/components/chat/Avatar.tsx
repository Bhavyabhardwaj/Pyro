import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "../../lib/utils";

const gradientPairs = [
  "from-neutral-700/50 to-neutral-800/70",
  "from-zinc-700/50 to-zinc-800/70",
  "from-slate-700/50 to-slate-800/70",
  "from-stone-700/50 to-stone-800/70",
  "from-zinc-800/60 to-zinc-900/80",
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
  const [hasError, setHasError] = useState(false);

  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const normalizedSrc = src?.startsWith("data:") ? src.split("#")[0] : src;

  // Tiny offset adjustment for perfect positioning on circular shape
  const presenceOffsetClass = size === "sm" 
    ? "bottom-[0.5px] right-[0.5px]" 
    : size === "md" 
      ? "bottom-[1px] right-[1px]" 
      : "bottom-[1.5px] right-[1.5px]";

  if (normalizedSrc && !hasError) {
    return (
      <div className={cn("group relative shrink-0", className)}>
        <img
          src={normalizedSrc}
          alt={name}
          onError={() => setHasError(true)}
          className={cn(
            "rounded-full object-cover shadow-[0_4px_12px_rgba(0,0,0,0.25)] transition-all duration-200 group-hover:brightness-105",
            sizeMap[size],
          )}
        />
        <AnimatePresence mode="popLayout">
          {showStatus && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 450, damping: 28 }}
              className={cn(
                "absolute h-2 w-2 rounded-full border border-[#111110] transition-colors duration-300 shadow-[0_0_0_1.5px_#111110,0_0_4px_rgba(16,185,129,0.25)]",
                presenceOffsetClass,
                isOnline ? "bg-emerald-500" : "bg-neutral-500",
              )}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className={cn("group relative shrink-0", className)}>
      <div
        className={cn(
          "flex items-center justify-center rounded-full border border-white/6 bg-gradient-to-br text-[11px] font-medium tracking-wide text-neutral-200 shadow-[0_4px_12px_rgba(0,0,0,0.25)] transition group-hover:brightness-105",
          sizeMap[size],
          getGradient(name),
        )}
      >
        {initials || "P"}
      </div>
      <AnimatePresence mode="popLayout">
        {showStatus && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 450, damping: 28 }}
            className={cn(
              "absolute h-2 w-2 rounded-full border border-[#111110] transition-colors duration-300 shadow-[0_0_0_1.5px_#111110,0_0_4px_rgba(16,185,129,0.25)]",
              presenceOffsetClass,
              isOnline ? "bg-emerald-500" : "bg-neutral-500",
            )}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
