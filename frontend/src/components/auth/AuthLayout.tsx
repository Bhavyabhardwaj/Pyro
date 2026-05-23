import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { PageTransition } from "../ui/PageTransition";
import { PyroMark } from "../ui/surface";
import { AuthWorkspacePreview } from "./AuthWorkspacePreview";

export function AuthLayout({
  title,
  subtitle,
  footer,
  children,
}: {
  title: string;
  subtitle: string;
  footer: ReactNode;
  children: ReactNode;
}) {
  return (
    <PageTransition>
      <main className="grid h-screen overflow-hidden bg-[#111110] text-[#f2f2ef] antialiased lg:grid-cols-[1.12fr_0.88fr] select-none selection:bg-white/10 selection:text-white">
        
        {/* Left Section — Brand and Atmospheric Pitch */}
        <section className="relative hidden overflow-hidden border-r border-white/[0.04] lg:block h-full">
          
          {/* Subtle desaturated blue-gray radial highlight matching landing page */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(141,162,170,0.06),transparent_40%),radial-gradient(circle_at_70%_60%,rgba(255,255,255,0.005),transparent_50%),linear-gradient(180deg,rgba(255,255,255,0.012),transparent_45%)] pointer-events-none" />
          
          <div className="relative flex h-full flex-col justify-between p-10">
            
            {/* Logo Brand Lockup */}
            <Link to="/" className="flex items-center gap-2.5 group self-start">
              <PyroMark className="transition-transform duration-500 group-hover:scale-[1.02]" />
              <span 
                className="text-[14.5px] font-semibold tracking-[-0.03em] text-[#e8e8e5] transition-colors duration-300 group-hover:text-white"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Pyro
              </span>
            </Link>

            {/* Content pitch with Satoshi headings & clean styling */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-[450px] w-full mt-4 mb-8"
            >
              <p className="text-[9px] font-mono tracking-[0.12em] text-[#8da2aa] uppercase">
                REAL-TIME COMMUNICATION
              </p>
              
              <h1 
                className="mt-3.5 text-2xl sm:text-[32px] font-medium tracking-[-0.035em] leading-[1.1] text-[#e8e8e5]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Step into the room where work starts moving.
              </h1>

              <p className="mt-3 max-w-[350px] text-[13px] leading-[1.65] text-[#8a8a84] font-light">
                Focused conversations, direct messaging, and shared context.
              </p>

              {/* Workspace Mockup Card */}
              <div className="mt-5.5">
                <AuthWorkspacePreview />
              </div>
            </motion.div>

            {/* Clean bottom brand note */}
            <p className="text-[9px] text-[#4d4d48] font-mono tracking-[0.16em] uppercase select-none opacity-85">
              REAL-TIME COLLABORATION WITHOUT THE NOISE.
            </p>
          </div>
        </section>

        {/* Right Section — Interactive Auth Form Card */}
        <section className="flex items-center justify-center px-4 py-8 sm:px-6 relative z-10 h-full overflow-y-auto">
          
          {/* Subtle background glow for mobile/right side */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.01),transparent_60%)] pointer-events-none select-none lg:hidden" />
          
          <div className="w-full max-w-[390px] py-6">
            
            {/* Mobile Header Logo */}
            <Link to="/" className="mb-6 flex items-center gap-3 lg:hidden group">
              <PyroMark className="transition-transform duration-500 group-hover:scale-[1.02]" />
              <span 
                className="text-[14.5px] font-semibold tracking-[-0.03em] text-[#e8e8e5] transition-colors duration-300 group-hover:text-white"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Pyro
              </span>
            </Link>

            {/* Main Auth Form Container Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-2xl border border-white/[0.015] bg-[#131312]/10 p-5 shadow-[0_15px_50px_rgba(0,0,0,0.25)] backdrop-blur-md sm:p-6.5 relative overflow-hidden"
            >
              {/* Radial backlight highlight inside the form card */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.015),transparent_60%)] pointer-events-none" />
              
              <div className="relative z-10">
                <h1 
                  className="text-lg sm:text-[21px] font-medium tracking-[-0.03em] text-[#e8e8e5]"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {title}
                </h1>
                <p className="mt-2 text-[13px] leading-[1.55] text-[#8a8a84] font-light">
                  {subtitle}
                </p>
              </div>

              <div className="mt-6 relative z-10">{children}</div>
            </motion.div>

            {/* Footer switcher note */}
            <div className="mt-4.5 text-center text-[12.5px] text-[#6f6f69] font-light">
              {footer}
            </div>
          </div>
        </section>

      </main>
    </PageTransition>
  );
}
