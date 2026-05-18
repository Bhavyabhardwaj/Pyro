import { motion } from "framer-motion";
import { Check, Radio, SendHorizontal } from "lucide-react";

const nodes = [
  { label: "Mira", x: "12%", y: "22%", delay: 0 },
  { label: "Aarav", x: "72%", y: "18%", delay: 0.25 },
  { label: "Dev", x: "18%", y: "74%", delay: 0.5 },
  { label: "Nia", x: "78%", y: "70%", delay: 0.75 },
];

export function RealtimeShowcase() {
  return (
    <section
      id="realtime"
      className="relative overflow-hidden border-y border-white/[0.08] bg-white/[0.018]"
    >
      <div className="absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-cyan-200/40 to-transparent" />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:px-8">
        <div>
          <p className="text-sm font-medium text-cyan-200">
            Realtime communication showcase
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            A room that breathes with the team.
          </h2>
          <p className="mt-5 max-w-md text-sm leading-7 text-zinc-500">
            Presence, delivery, and momentum move quietly in the background.
          </p>
        </div>

        <div className="relative min-h-[430px] overflow-hidden rounded-[2rem] border border-white/[0.08] bg-zinc-950/80 p-5 shadow-2xl shadow-black/30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(34,211,238,0.14),transparent_32%)]" />
          <div className="absolute inset-10 rounded-full border border-white/[0.06]" />
          <div className="absolute inset-20 rounded-full border border-white/[0.05]" />

          {nodes.map((node) => (
            <motion.div
              key={node.label}
              className="absolute z-10"
              style={{ left: node.x, top: node.y }}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: node.delay }}
            >
              <div className="rounded-2xl border border-white/[0.08] bg-zinc-900/90 px-4 py-3 shadow-xl shadow-black/30">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-300" />
                  <span className="text-sm font-medium text-white">
                    {node.label}
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-500">received</p>
              </div>
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            className="absolute left-1/2 top-1/2 z-20 w-[min(84%,380px)] -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-white">
                  <Radio className="h-4 w-4 text-cyan-200" />
                  launch-room
                </div>
                <p className="mt-1 text-xs text-zinc-500">4 active clients</p>
              </div>
              <Check className="h-4 w-4 text-emerald-200" />
            </div>
            <div className="mt-5 rounded-2xl border border-white/[0.08] bg-zinc-950/80 px-4 py-3 text-sm text-zinc-300">
              Deploy notes are live. Reviewing now.
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500">
              <SendHorizontal className="h-3.5 w-3.5" />
              delivered live
            </div>
          </motion.div>

          <motion.div
            className="absolute left-[18%] top-[36%] h-px w-[64%] origin-left bg-gradient-to-r from-cyan-200/0 via-cyan-200/70 to-cyan-200/0"
            initial={{ scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
          <motion.div
            className="absolute left-[24%] top-[64%] h-px w-[52%] origin-left bg-gradient-to-r from-cyan-200/0 via-cyan-200/55 to-cyan-200/0"
            initial={{ scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 1.1, ease: "easeOut" }}
          />
        </div>
      </div>
    </section>
  );
}
