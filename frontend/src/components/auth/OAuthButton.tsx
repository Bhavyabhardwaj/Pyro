import { motion } from "framer-motion";
import type { OAuthProvider } from "./oauth-providers";

export function OAuthButton({
  provider,
  onClick,
}: {
  provider: OAuthProvider;
  onClick: (provider: OAuthProvider) => void;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.985 }}
      onClick={() => onClick(provider)}
      className="group relative flex h-12 w-full items-center justify-center overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.035] px-4 text-sm font-medium text-zinc-200 shadow-sm shadow-black/20 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.06] hover:text-white"
    >
      <span
        className={`absolute inset-x-8 top-0 h-px bg-gradient-to-r ${provider.accent} opacity-0 transition-opacity duration-200 group-hover:opacity-100`}
      />
      <span className="absolute inset-0 bg-gradient-to-b from-white/[0.045] to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
      <span className="relative flex items-center gap-3">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg border border-white/10 bg-zinc-950/80">
          <span className="text-[11px] font-semibold text-white">
            {provider.mark}
          </span>
        </span>
        {provider.label}
      </span>
    </motion.button>
  );
}
