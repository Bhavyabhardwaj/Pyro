import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "../../lib/utils";

const gradientPairs = [
  "from-cyan-200/80 via-sky-400/50 to-indigo-500/80",
  "from-emerald-200/80 via-teal-400/55 to-cyan-500/80",
  "from-rose-200/80 via-pink-400/55 to-fuchsia-500/80",
  "from-amber-200/80 via-orange-400/55 to-rose-500/80",
  "from-violet-200/80 via-indigo-400/55 to-sky-500/80",
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

  if (normalizedSrc && !hasError) {
    return (
      <div className={cn("group relative", className)}>
        <img
          src={normalizedSrc}
          alt={name}
          onError={() => setHasError(true)}
          className={cn(
            "rounded-xl object-cover shadow-[0_10px_24px_rgba(0,0,0,0.35)] transition-all duration-200 group-hover:brightness-105",
            sizeMap[size],
          )}
        />
        <AnimatePresence mode="popLayout">
          {showStatus && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={cn(
              "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-zinc-950 transition-colors duration-300",
                isOnline ? "bg-[#23a559]" : "bg-zinc-500",
              )}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className={cn("group relative", className)}>
      <div
        className={cn(
          "flex items-center justify-center rounded-xl border border-white/12 bg-linear-to-br text-xs font-semibold text-white shadow-[0_12px_28px_rgba(0,0,0,0.3)] transition group-hover:brightness-105",
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
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={cn(
              "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-zinc-950 transition-colors duration-300",
              isOnline ? "bg-[#23a559]" : "bg-zinc-500",
            )}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
