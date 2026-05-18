import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Code2, Sparkles, TerminalSquare } from "lucide-react";
import { Button } from "../components/ui/button";
import { PageTransition } from "../components/ui/PageTransition";
import { LandingNavbar } from "../components/landing/LandingNavbar";
import { ChatPreview } from "../components/landing/ChatPreview";
import { FeatureGrid } from "../components/landing/FeatureGrid";
import { RealtimeShowcase } from "../components/landing/RealtimeShowcase";

const stats = ["Focused rooms", "Live presence", "Quiet history"];

export default function LandingPage() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <LandingNavbar />

        <main>
          <section className="relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_8%,rgba(34,211,238,0.16),transparent_30%),radial-gradient(circle_at_78%_12%,rgba(168,85,247,0.10),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.05),transparent_36%)]" />
            <div className="absolute left-1/2 top-16 h-px w-[72rem] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/18 to-transparent" />
            <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 pt-16 sm:px-6 sm:pb-20 sm:pt-20 lg:grid-cols-[0.88fr_1.12fr] lg:px-8 lg:pb-24 lg:pt-24">
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-zinc-300"
                >
                  <Sparkles className="h-3.5 w-3.5 text-cyan-200" />
                  Realtime collaboration without the noise
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 }}
                  className="mt-7 max-w-4xl text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-[4.75rem]"
                >
                  Every message exactly where it belongs.
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.16 }}
                  className="mt-6 max-w-2xl text-base leading-8 text-zinc-400 sm:text-lg"
                >
                  Rooms that stay focused. Conversations that feel alive.
                  Communication built for teams that move fast.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.24 }}
                  className="mt-8 flex flex-col gap-3 sm:flex-row"
                >
                  <Button asChild size="lg">
                    <Link to="/register">
                      Enter Pyro
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="secondary" size="lg">
                    <Link to="/login">Sign in</Link>
                  </Button>
                </motion.div>

                <div className="mt-9 flex flex-wrap gap-3">
                  {stats.map((stat) => (
                    <span
                      key={stat}
                      className="rounded-full border border-white/[0.08] bg-white/[0.035] px-4 py-2 text-xs text-zinc-400"
                    >
                      {stat}
                    </span>
                  ))}
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.97, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.18, duration: 0.48 }}
              >
                <ChatPreview />
              </motion.div>
            </div>
          </section>

          <FeatureGrid />

          <RealtimeShowcase />

          <section id="developers" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
              <div className="lg:sticky lg:top-24">
                <p className="text-sm font-medium text-cyan-200">
                  Developer-friendly foundation
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
                  Built clean. Felt instantly.
                </h2>
              </div>
              <div className="grid gap-4">
              {[
                ["Typed API layer", "Frontend types mirror the backend response contract."],
                ["Context auth", "Session state stays simple and clear for protected routes."],
                ["Composable UI", "Landing, auth, and chat pieces are split into reusable components."],
              ].map(([title, copy], index) => (
                <div
                  key={title}
                  className="rounded-2xl border border-white/[0.08] bg-zinc-900/40 p-5 sm:p-6"
                >
                  {index === 0 ? (
                    <Code2 className="h-5 w-5 text-zinc-300" />
                  ) : (
                    <TerminalSquare className="h-5 w-5 text-zinc-300" />
                  )}
                  <h3 className="mt-5 text-lg font-medium text-white">
                    {title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-500">
                    {copy}
                  </p>
                </div>
              ))}
              </div>
            </div>
          </section>

          <section className="px-4 pb-12 sm:px-6 sm:pb-16 lg:px-8">
            <div className="relative mx-auto grid max-w-7xl gap-8 overflow-hidden rounded-[2rem] border border-white/[0.08] bg-zinc-900/50 p-8 shadow-2xl shadow-black/30 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
              <motion.div
                className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-300/10 blur-3xl"
                animate={{ opacity: [0.35, 0.8, 0.35], scale: [1, 1.08, 1] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="absolute bottom-6 right-10 hidden h-24 w-56 rounded-3xl border border-white/[0.08] bg-white/[0.035] lg:block">
                <div className="absolute left-4 top-4 h-2 w-2 rounded-full bg-emerald-300" />
                <div className="absolute left-8 top-4 h-2 w-20 rounded-full bg-white/10" />
                <div className="absolute left-4 top-10 h-2 w-36 rounded-full bg-white/10" />
                <div className="absolute left-4 top-16 h-2 w-24 rounded-full bg-cyan-200/20" />
              </div>
              <div>
              <h2 className="max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Start where the conversation catches fire.
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-7 text-zinc-400">
                A quieter way to gather people, momentum, and context in one
                place.
              </p>
              </div>
              <Button asChild className="mt-7">
                <Link to="/register">
                  Create your room
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </section>
        </main>
      </div>
    </PageTransition>
  );
}
