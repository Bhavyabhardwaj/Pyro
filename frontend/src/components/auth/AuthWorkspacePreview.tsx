import { motion } from "framer-motion";
import { Hash, Radio, SendHorizontal } from "lucide-react";

const previewMessages = [
  ["Mira", "Welcome flow looks ready.", "bg-violet-300"],
  ["Aarav", "Realtime room joined.", "bg-cyan-300"],
  ["Dev", "Auth session restored.", "bg-emerald-300"],
];

export function AuthWorkspacePreview() {
  return (
    <div className="relative mt-10 min-h-[360px] overflow-hidden rounded-[2rem] border border-white/[0.08] bg-zinc-950/80 p-4 shadow-2xl shadow-black/30">
      <motion.div
        className="absolute -right-12 top-8 h-44 w-44 rounded-full bg-cyan-300/10 blur-3xl"
        animate={{ opacity: [0.4, 0.9, 0.4], scale: [1, 1.12, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-8 top-8 h-24 w-24 rounded-full bg-violet-300/10 blur-2xl"
        animate={{ x: [0, 18, 0], opacity: [0.35, 0.65, 0.35] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl border border-white/[0.08] bg-white/[0.045] p-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-white">
              <Hash className="h-4 w-4 text-zinc-500" />
              onboarding
            </div>
            <p className="mt-1 text-xs text-zinc-500">4 members online</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs text-emerald-200">
              <Radio className="h-3.5 w-3.5" />
              Live
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {previewMessages.map(([name, text, tone], index) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, x: index % 2 === 0 ? -14 : 14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.18 + index * 0.12 }}
              className="flex gap-3"
            >
              <div className={`mt-1 h-8 w-8 rounded-xl ${tone}`} />
              <div>
                <div className="text-xs font-medium text-zinc-300">{name}</div>
                <div className="mt-1 rounded-2xl rounded-tl-md border border-white/[0.08] bg-zinc-950/70 px-3 py-2 text-sm text-zinc-400">
                  {text}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: [0, -4, 0] }}
        transition={{
          opacity: { delay: 0.65 },
          y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
        }}
        className="absolute bottom-4 left-4 right-4 flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-zinc-900/95 px-4 py-3 text-sm text-zinc-500"
      >
        Message #onboarding
        <SendHorizontal className="ml-auto h-4 w-4 text-zinc-300" />
      </motion.div>
    </div>
  );
}
