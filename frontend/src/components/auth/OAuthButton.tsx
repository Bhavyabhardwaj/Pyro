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
      whileTap={{ scale: 0.99 }}
      onClick={() => onClick(provider)}
      className="group relative flex h-11 w-full items-center justify-center overflow-hidden rounded-xl border border-white/[0.04] bg-[#1a1a19] px-4 text-[13px] font-medium text-[#c4c4c0] shadow-sm shadow-black/10 transition-all duration-300 hover:border-white/10 hover:bg-[#222221] hover:text-[#e8e8e5]"
    >
      <span
        className={`absolute inset-x-8 top-0 h-px bg-gradient-to-r ${provider.accent} opacity-0 transition-opacity duration-300 group-hover:opacity-60`}
      />
      <span className="absolute inset-0 bg-gradient-to-b from-white/[0.015] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <span className="relative flex items-center gap-3">
        <span className="flex h-5.5 w-5.5 items-center justify-center rounded-md border border-white/[0.03] bg-[#111110]">
          <span className="text-[10px] font-semibold text-[#e8e8e5]">
            {provider.mark}
          </span>
        </span>
        {provider.label}
      </span>
    </motion.button>
  );
}
