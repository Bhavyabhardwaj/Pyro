import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { PageTransition } from "../components/ui/PageTransition";
import { LandingNavbar } from "../components/landing/LandingNavbar";
import { ChatPreview } from "../components/landing/ChatPreview";

const fade = {
  initial: { opacity: 0, y: 4 },
  animate: { opacity: 1, y: 0 }
};

export default function LandingPage() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-[#111110] text-[#f2f2ef] antialiased select-none selection:bg-white/10 selection:text-white">
        <LandingNavbar />

        <main className="relative overflow-hidden">
          
          {/* Layered cinematic background haze — three overlapping soft radials */}
          <div className="absolute inset-x-0 top-0 h-[800px] pointer-events-none select-none">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_50%_-10%,rgba(255,255,255,0.025),transparent)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_35%_at_65%_15%,rgba(255,255,255,0.012),transparent)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.005),transparent_40%)]" />
          </div>

          {/* ─── Hero Section ─── */}
          <section className="mx-auto max-w-5xl px-6 pt-12 pb-10 sm:pt-20 sm:pb-16 relative z-10">
            <div className="grid gap-12 lg:grid-cols-[1.1fr_1.3fr] lg:items-center">

              {/* Hero Text */}
              <div className="flex flex-col items-start text-left">
                <motion.h1
                  initial="initial"
                  animate="animate"
                  variants={fade}
                  transition={{ duration: 0.6, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
                  className="text-[34px] sm:text-[46px] font-medium tracking-[-0.04em] leading-[1.08] text-[#e8e8e5]"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  A quiet space for
                  <br />
                  focused teams.
                </motion.h1>

                <motion.p
                  initial="initial"
                  animate="animate"
                  variants={fade}
                  transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-6 max-w-[310px] text-[14.5px] leading-[1.7] text-[#8a8a84] font-light"
                >
                  Rooms, direct messages, and shared files. Clean architecture designed for calm, continuous work.
                </motion.p>

                <motion.div
                  initial="initial"
                  animate="animate"
                  variants={fade}
                  transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-8 flex items-center gap-6"
                >
                  <Link
                    to="/register"
                    className="group inline-flex items-center gap-1.8 rounded-full border border-white/[0.04] bg-[#e8e8e5] px-5 py-2.5 text-[12.5px] font-medium tracking-[-0.01em] text-[#111110] transition-all duration-300 hover:bg-white hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(141,162,170,0.08)]"
                  >
                    Get started
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </Link>
                  <Link
                    to="/login"
                    className="text-[12.5px] font-normal text-[#6f6f69] transition-all duration-300 hover:text-[#e8e8e5] hover:translate-x-0.5"
                  >
                    Sign in
                  </Link>
                </motion.div>
              </div>

              {/* Product Preview Block */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="relative max-w-[460px] lg:max-w-none mx-auto w-full"
              >
                {/* Immersive radial glow behind the chat mockup */}
                <div className="absolute -inset-14 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.012),transparent_70%)] pointer-events-none select-none" />
                <div className="relative hover:scale-[1.002] transition-transform duration-700 ease-out">
                  <ChatPreview />
                </div>
              </motion.div>

            </div>
          </section>

          {/* ─── Features Section ─── */}
          <section id="features" className="mx-auto max-w-5xl px-6 pt-16 pb-16 border-t border-white/[0.04] relative z-10">
            <div className="grid gap-12 sm:grid-cols-[1.45fr_1fr]">

              {/* Left Main Editorial Feature */}
              <div className="sm:border-r sm:border-white/[0.04] sm:pr-12 flex flex-col justify-between">
                <div>
                  <span className="text-[8.5px] font-mono tracking-[0.18em] text-[#4d4d48] uppercase">01 / ARCHITECTURE</span>
                  <h3
                    className="mt-4 text-[18px] font-medium tracking-[-0.025em] text-[#e8e8e5] leading-snug"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    Conversation stays lightweight.
                  </h3>
                  <p className="mt-4 max-w-[420px] text-[14px] leading-[1.7] text-[#8a8a84] font-light">
                    Channels and direct messages share one unified room system. Switch between group discussion and private 1-to-1 syncs seamlessly, keeping all critical details accessible.
                  </p>
                </div>
                <div className="mt-8 flex items-center gap-2 text-[9.5px] text-[#4d4d48] font-mono tracking-wider uppercase select-none">
                  <span className="h-[5.5px] w-[5.5px] rounded-full bg-[#8da2aa]/60 animate-pulse" />
                  Synced in real-time
                </div>
              </div>

              {/* Right Secondary Features */}
              <div className="space-y-10">
                <div className="group cursor-default">
                  <span className="text-[8.5px] font-mono tracking-[0.18em] text-[#4d4d48] uppercase">02 / PERSISTENCE</span>
                  <h3
                    className="mt-3.5 text-[14.5px] font-medium tracking-[-0.015em] text-[#d4d4d1] transition-colors duration-300 group-hover:text-white"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    Files save natively.
                  </h3>
                  <p className="mt-2 max-w-[320px] text-[13.5px] leading-[1.7] text-[#6f6f69] font-light transition-colors duration-300 group-hover:text-[#8a8a84]">
                    Images, mockups, and spreadsheets upload securely and persist directly inside your conversation feed.
                  </p>
                </div>

                <div className="group cursor-default">
                  <span className="text-[8.5px] font-mono tracking-[0.18em] text-[#4d4d48] uppercase">03 / CONTINUITY</span>
                  <h3
                    className="mt-3.5 text-[14.5px] font-medium tracking-[-0.015em] text-[#d4d4d1] transition-colors duration-300 group-hover:text-white"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    Presence updates quietly.
                  </h3>
                  <p className="mt-2 max-w-[320px] text-[13.5px] leading-[1.7] text-[#6f6f69] font-light transition-colors duration-300 group-hover:text-[#8a8a84]">
                    Real-time presence and smart typing indicators refresh organically without breaking focus.
                  </p>
                </div>
              </div>

            </div>
          </section>

          {/* ─── Details Section ─── */}
          <section id="developers" className="mx-auto max-w-5xl px-6 pt-14 pb-14 border-t border-white/[0.04] relative z-10">
            <div className="grid gap-8 sm:grid-cols-[0.8fr_2.2fr]">
              
              <div>
                <span className="text-[8.5px] font-mono tracking-[0.18em] text-[#4d4d48] uppercase">UTILITY</span>
                <h2
                  className="mt-3.5 text-[17px] font-medium tracking-[-0.025em] leading-snug text-[#e8e8e5]"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Designed for daily use.
                </h2>
              </div>

              <div className="grid gap-10 sm:grid-cols-2">
                <div className="group cursor-default">
                  <h4 className="text-[13.5px] font-medium text-[#c4c4c0] tracking-[-0.01em] transition-colors duration-300 group-hover:text-white">
                    Tactile interactions
                  </h4>
                  <p className="mt-2 max-w-[280px] text-[13px] leading-[1.7] text-[#6f6f69] font-light transition-colors duration-300 group-hover:text-[#8a8a84]">
                    Every hover state, scroll boundary, and panel transition has been calibrated to feel immediate and natural.
                  </p>
                </div>
                
                <div className="group cursor-default">
                  <h4 className="text-[13.5px] font-medium text-[#c4c4c0] tracking-[-0.01em] transition-colors duration-300 group-hover:text-white">
                    Continuous sync
                  </h4>
                  <p className="mt-2 max-w-[280px] text-[13px] leading-[1.7] text-[#6f6f69] font-light transition-colors duration-300 group-hover:text-[#8a8a84]">
                    Typing queues, notifications, and room tallies stay aligned automatically behind a robust websocket network.
                  </p>
                </div>
              </div>

            </div>
          </section>

          {/* ─── CTA Section ─── */}
          <section className="mx-auto max-w-5xl px-6 pt-12 pb-24 relative z-10">
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.03] bg-[#141413]/30 px-8 py-20 sm:px-12 sm:py-24 text-center flex flex-col items-center">
              
              {/* Soft atmospheric gradient falloff */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.015),transparent_60%)] pointer-events-none select-none" />
              
              <h2
                className="text-[22px] sm:text-[28px] font-medium tracking-[-0.03em] leading-[1.2] text-[#e8e8e5]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Start where the conversation matters.
              </h2>
              
              <p className="mt-4 max-w-[400px] text-[14px] sm:text-[14.5px] leading-[1.65] text-[#8a8a84] font-light">
                Rooms, direct messages, and persistent files. Experience a workspace designed specifically for focused teams.
              </p>
              
              <div className="mt-10">
                <Link
                  to="/register"
                  className="group inline-flex items-center gap-2 rounded-full border border-white/[0.04] bg-[#e8e8e5] px-6 py-3 text-[12.5px] font-medium tracking-[-0.01em] text-[#111110] transition-all duration-300 hover:bg-white hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(141,162,170,0.12)]"
                >
                  Open your workspace
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </section>

          {/* ─── Footer ─── */}
          <footer className="mx-auto max-w-5xl px-6 py-10 flex items-center justify-between text-[10px] text-[#4d4d48] border-t border-white/[0.03] relative z-10">
            <span>&copy; {new Date().getFullYear()} Pyro Technologies.</span>
            <span className="font-mono tracking-[0.16em] uppercase text-[9px] text-[#4d4d48]/70 cursor-default select-none">
              Designed for focus
            </span>
          </footer>

        </main>
      </div>
    </PageTransition>
  );
}
