import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { PageTransition } from "../components/ui/PageTransition";
import { LandingNavbar } from "../components/landing/LandingNavbar";
import { ChatPreview } from "../components/landing/ChatPreview";

const fade = { initial: { opacity: 0 }, animate: { opacity: 1 } };

export default function LandingPage() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-[var(--bg-charcoal)] text-[var(--text-primary)] antialiased">
        <LandingNavbar />

        <main className="relative overflow-hidden">
          {/* Layered atmospheric depth — two overlapping radials */}
          <div className="absolute inset-x-0 top-0 h-[700px] pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_55%_-5%,rgba(242,242,239,0.022),transparent)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_70%_10%,rgba(242,242,239,0.012),transparent)]" />
          </div>

          {/* ─── Hero ─── */}
          <section className="mx-auto max-w-5xl px-6 pt-16 pb-10 sm:pt-24 sm:pb-14">
            <div className="grid gap-8 lg:grid-cols-[1.05fr_1.95fr] lg:items-center">

              {/* Left — Text */}
              <div className="flex flex-col items-start">
                <motion.span
                  {...fade}
                  transition={{ duration: 0.35 }}
                  className="rounded-full border border-[var(--border-muted)] bg-white/[0.01] px-2.5 py-[3px] text-[8px] font-mono tracking-[0.14em] text-[#4a4a45] uppercase select-none"
                >
                  v1.0.0
                </motion.span>

                <motion.h1
                  {...fade}
                  transition={{ duration: 0.4, delay: 0.04 }}
                  className="mt-6 text-[26px] sm:text-[38px] font-medium tracking-[-0.03em] leading-[1.12] text-[#e8e8e5]"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  A quiet space for
                  <br />
                  team communication.
                </motion.h1>

                <motion.p
                  {...fade}
                  transition={{ duration: 0.4, delay: 0.08 }}
                  className="mt-4 max-w-[300px] text-[13px] leading-[1.6] text-[#8a8a84] font-light"
                >
                  Rooms, direct messages, and files — in one focused place. No noise, no extra layers.
                </motion.p>

                <motion.div
                  {...fade}
                  transition={{ duration: 0.35, delay: 0.12 }}
                  className="mt-8 flex items-center gap-5"
                >
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#e8e8e5] px-4 py-[6px] text-[11px] font-medium tracking-[-0.01em] text-[var(--bg-charcoal)] transition duration-150 hover:bg-[#d4d4d1]"
                  >
                    Get started
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                  <Link
                    to="/login"
                    className="text-[11px] font-normal text-[#5a5a55] transition duration-150 hover:text-[#a8a8a2]"
                  >
                    Sign in
                  </Link>
                </motion.div>
              </div>

              {/* Right — Product UI with atmospheric backing */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="relative"
              >
                {/* Soft backlight behind the preview */}
                <div className="absolute -inset-8 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(242,242,239,0.008),transparent)] pointer-events-none" />
                <div className="relative">
                  <ChatPreview />
                </div>
              </motion.div>

            </div>
          </section>

          {/* ─── Features ─── */}
          <section id="features" className="mx-auto max-w-5xl px-6 pt-12 pb-11 border-t border-[var(--border-muted)]">
            <div className="grid gap-10 sm:grid-cols-[1.45fr_1fr]">

              {/* Lead feature */}
              <div className="sm:border-r sm:border-[var(--border-muted)] sm:pr-10">
                <span className="text-[8px] font-mono tracking-[0.16em] text-[#3d3d39] uppercase">01</span>
                <h3
                  className="mt-3 text-[15px] font-medium tracking-[-0.02em] text-[#e8e8e5] leading-snug"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Conversation stays lightweight.
                </h3>
                <p className="mt-3 max-w-[380px] text-[12.5px] leading-[1.7] text-[#8a8a84] font-light">
                  Channels and direct messages share one unified system. Switch between group rooms and private conversations without losing context or momentum.
                </p>
                <div className="mt-6 flex items-center gap-2 text-[9px] text-[#3d3d39] font-mono tracking-wide">
                  <span className="h-[5px] w-[5px] rounded-full bg-emerald-500/60" />
                  Synced in realtime
                </div>
              </div>

              {/* Secondary features */}
              <div className="space-y-8">
                <div>
                  <span className="text-[8px] font-mono tracking-[0.16em] text-[#3d3d39] uppercase">02</span>
                  <h3
                    className="mt-2.5 text-[13px] font-medium tracking-[-0.015em] text-[#d4d4d1]"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    Files persist naturally.
                  </h3>
                  <p className="mt-1.5 max-w-[280px] text-[12px] leading-[1.7] text-[#6f6f69] font-light">
                    Images, documents, and exports save permanently. Review them inline with real downloads.
                  </p>
                </div>

                <div>
                  <span className="text-[8px] font-mono tracking-[0.16em] text-[#3d3d39] uppercase">03</span>
                  <h3
                    className="mt-2.5 text-[13px] font-medium tracking-[-0.015em] text-[#d4d4d1]"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    Presence updates quietly.
                  </h3>
                  <p className="mt-1.5 max-w-[280px] text-[12px] leading-[1.7] text-[#6f6f69] font-light">
                    Typing indicators and online states refresh without interrupting focus.
                  </p>
                </div>
              </div>

            </div>
          </section>

          {/* ─── Daily Utility ─── */}
          <section id="developers" className="mx-auto max-w-5xl px-6 pt-9 pb-11 border-t border-[var(--border-muted)]">
            <div className="grid gap-6 sm:grid-cols-[0.75fr_2.25fr]">
              <div>
                <span className="text-[8px] font-mono tracking-[0.16em] text-[#3d3d39] uppercase">Details</span>
                <h2
                  className="mt-2.5 text-[15px] font-medium tracking-[-0.02em] leading-snug text-[#e8e8e5]"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Designed for daily use.
                </h2>
              </div>
              <div className="grid gap-8 sm:grid-cols-2">
                <div>
                  <h4 className="text-[12px] font-medium text-[#c4c4c0] tracking-[-0.01em]">Tactile interaction</h4>
                  <p className="mt-1.5 max-w-[260px] text-[11.5px] leading-[1.65] text-[#6f6f69] font-light">
                    Hover states, scroll anchoring, and transitions feel native across every surface.
                  </p>
                </div>
                <div>
                  <h4 className="text-[12px] font-medium text-[#c4c4c0] tracking-[-0.01em]">Continuous sync</h4>
                  <p className="mt-1.5 max-w-[260px] text-[11.5px] leading-[1.65] text-[#6f6f69] font-light">
                    Unread badges and typing queues stay current without manual refresh.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ─── CTA ─── */}
          <section className="mx-auto max-w-5xl px-6 pt-3 pb-8">
            <div className="rounded-2xl border border-[var(--border-muted)] bg-[rgba(22,22,21,0.15)] px-8 py-7 sm:px-10 text-left">
              <h2
                className="text-[17px] sm:text-[21px] font-medium tracking-[-0.025em] leading-[1.2] text-[#e8e8e5]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Start where the conversation matters.
              </h2>
              <p className="mt-2 max-w-sm text-[12px] leading-[1.6] text-[#6f6f69] font-light">
                Focused rooms, persistent context, calm collaboration.
              </p>
              <div className="mt-5">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#e8e8e5] px-4 py-[6px] text-[11px] font-medium tracking-[-0.01em] text-[var(--bg-charcoal)] transition duration-150 hover:bg-[#d4d4d1]"
                >
                  Open your workspace
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </section>

          {/* ─── Footer ─── */}
          <footer className="mx-auto max-w-5xl px-6 py-5 flex items-center justify-between text-[9px] text-[#3d3d39] border-t border-[var(--border-muted)]">
            <span>&copy; {new Date().getFullYear()} Pyro</span>
            <span className="font-mono tracking-[0.12em] uppercase text-[8px]">Designed for focus</span>
          </footer>
        </main>
      </div>
    </PageTransition>
  );
}
