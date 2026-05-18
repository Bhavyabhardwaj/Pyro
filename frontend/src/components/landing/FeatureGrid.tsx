import { motion } from "framer-motion";
import { Boxes, MessageSquareText, ShieldCheck, Zap } from "lucide-react";

const compactFeatures = [
  {
    icon: Boxes,
    title: "Rooms stay focused",
    copy: "Context stays close. Noise stays out.",
  },
  {
    icon: ShieldCheck,
    title: "Private by design",
    copy: "Your workspace opens only for the people inside it.",
  },
  {
    icon: MessageSquareText,
    title: "Easy to read",
    copy: "People, pace, and messages fall into place.",
  },
];

export function FeatureGrid() {
  return (
    <section
      id="features"
      className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
    >
      <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
        <div>
          <p className="text-sm font-medium text-cyan-200">Built for flow</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Communication that stays focused.
          </h2>
        </div>
        <p className="max-w-xl text-sm leading-7 text-zinc-500 lg:justify-self-end">
          Built for teams that need momentum, not another wall of channels.
        </p>
      </div>

      <div className="mt-10 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <motion.article
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          className="relative min-h-[330px] overflow-hidden rounded-3xl border border-white/[0.08] bg-zinc-900/55 p-6 shadow-2xl shadow-black/25 sm:p-8"
        >
          <div className="absolute inset-x-16 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/50 to-transparent" />
          <div className="absolute right-0 top-0 h-52 w-52 rounded-full bg-cyan-300/10 blur-3xl" />
          <Zap className="h-6 w-6 text-cyan-100" />
          <h3 className="mt-8 max-w-lg text-2xl font-semibold tracking-tight text-white">
            Live by nature.
          </h3>
          <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-400">
            Messages move through Pyro with a quiet pulse. Fast enough to feel
            alive, calm enough to stay readable.
          </p>

          <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
            {["arrive", "spark", "sync"].map((step, index) => (
              <div
                key={step}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4"
              >
                <div className="text-xs text-zinc-600">0{index + 1}</div>
                <div className="mt-3 text-sm font-medium text-zinc-200">
                  {step}
                </div>
              </div>
            ))}
          </div>
        </motion.article>

        <div className="grid gap-4">
          {compactFeatures.map((feature, index) => (
            <motion.article
              key={feature.title}
              initial={{ opacity: 0, x: 18 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: index * 0.05 }}
              className="group rounded-2xl border border-white/[0.08] bg-white/[0.035] p-5 transition-all hover:border-white/15 hover:bg-white/[0.055]"
            >
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/[0.08] bg-zinc-950/70">
                  <feature.icon className="h-4 w-4 text-zinc-300" />
                </div>
                <div>
                  <h3 className="text-base font-medium text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-500">
                    {feature.copy}
                  </p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
