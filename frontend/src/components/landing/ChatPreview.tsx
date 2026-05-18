import { motion } from "framer-motion";
import { CheckCheck, Hash, Lock, Radio, Send, Users } from "lucide-react";
import { Surface } from "../ui/surface";

const rooms = [
  { name: "design-review", count: 12 },
  { name: "engineering", count: 6 },
  { name: "launch-room", count: 3 },
];
const messages = [
  {
    name: "Aarav",
    tone: "bg-cyan-300",
    text: "Shipping the composer polish. The hover states feel much tighter now.",
    time: "09:41",
  },
  {
    name: "Mira",
    tone: "bg-violet-300",
    text: "Room sync landed instantly on my side.",
    time: "09:42",
  },
  {
    name: "Dev",
    tone: "bg-emerald-300",
    text: "Auth guard and socket join are stable.",
    time: "09:43",
  },
];

export function ChatPreview() {
  return (
    <Surface className="relative overflow-hidden p-2.5 shadow-[0_32px_120px_rgba(0,0,0,0.55)]">
      <motion.div
        className="absolute -right-24 -top-24 h-60 w-60 rounded-full bg-cyan-300/10 blur-3xl"
        animate={{ opacity: [0.45, 0.85, 0.45], scale: [1, 1.08, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-x-20 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/60 to-transparent" />
      <div className="grid min-h-[438px] grid-cols-[106px_1fr] overflow-hidden rounded-[1.35rem] border border-white/[0.08] bg-zinc-950/90 sm:grid-cols-[174px_1fr]">
        <aside className="border-r border-white/[0.08] bg-white/[0.025] p-3">
          <div className="mb-5 flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
            <div className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-300/80" />
          </div>

          <div className="mb-4 hidden rounded-2xl border border-white/[0.08] bg-zinc-950/70 p-3 sm:block">
            <div className="flex items-center gap-2 text-xs font-medium text-white">
              <Users className="h-3.5 w-3.5 text-cyan-200" />
              Pyro Team
            </div>
            <div className="mt-3 h-1.5 rounded-full bg-white/[0.06]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "72%" }}
                transition={{ delay: 0.45, duration: 0.8 }}
                className="h-full rounded-full bg-cyan-200/80"
              />
            </div>
          </div>

          <div className="space-y-2">
            {rooms.map((room, index) => (
              <motion.div
                key={room.name}
                initial={{ opacity: 0, x: -10 }}
                animate={
                  index === 0
                    ? {
                        opacity: 1,
                        x: 0,
                        boxShadow: [
                          "0 0 0 rgba(103,232,249,0)",
                          "0 0 34px rgba(103,232,249,0.12)",
                          "0 0 0 rgba(103,232,249,0)",
                        ],
                      }
                    : { opacity: 1, x: 0 }
                }
                transition={
                  index === 0
                    ? { duration: 3.5, repeat: Infinity }
                    : { delay: 0.15 + index * 0.08 }
                }
                className={
                  index === 0
                    ? "flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.08] px-3 py-2 text-xs text-white"
                    : "flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-zinc-500"
                }
              >
                <Hash className="h-3.5 w-3.5" />
                <span className="hidden truncate sm:block">{room.name}</span>
                <span className="ml-auto hidden text-[10px] text-zinc-600 sm:block">
                  {room.count}
                </span>
              </motion.div>
            ))}
          </div>
        </aside>

        <main className="flex min-w-0 flex-col">
          <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-white">
                <Hash className="h-4 w-4 text-zinc-500" />
                design-review
              </div>
              <p className="mt-1 text-xs text-zinc-500">
                8 online, synced live
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs text-emerald-200">
              <Radio className="h-3.5 w-3.5" />
              Live
            </div>
          </div>

          <div className="flex-1 space-y-4 px-4 py-5">
            {messages.map((message, index) => (
              <motion.div
                key={message.name}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + index * 0.12 }}
                className="flex gap-3"
              >
                <div
                  className={`mt-1 h-8 w-8 shrink-0 rounded-xl ${message.tone}`}
                />
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-medium text-white">
                      {message.name}
                    </span>
                    <span className="text-xs text-zinc-600">
                      {message.time}
                    </span>
                  </div>
                  <p className="mt-1 rounded-2xl rounded-tl-md border border-white/[0.08] bg-white/[0.052] px-4 py-3 text-sm leading-6 text-zinc-300 shadow-lg shadow-black/15">
                    {message.text}
                  </p>
                </div>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.82 }}
              className="ml-11 flex items-center gap-2 text-xs text-zinc-600"
            >
              <CheckCheck className="h-3.5 w-3.5 text-emerald-200" />
              delivered to 8 online members
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: [0, 1, 1, 0], y: [10, 0, 0, 4] }}
              transition={{
                delay: 1.2,
                duration: 4.5,
                repeat: Infinity,
                repeatDelay: 1.2,
              }}
              className="ml-11 inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-500"
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-200" />
              Mira is typing
            </motion.div>
          </div>

          <div className="border-t border-white/[0.08] p-3">
            <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-zinc-900/80 px-4 py-3 text-sm text-zinc-500">
              <Lock className="h-4 w-4" />
              Message #design-review
              <Send className="ml-auto h-4 w-4 text-zinc-300" />
            </div>
          </div>
        </main>
      </div>
    </Surface>
  );
}
