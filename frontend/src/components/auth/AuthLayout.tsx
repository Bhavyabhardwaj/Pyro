import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Activity, LockKeyhole, MessageCircle } from "lucide-react";
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
      <main className="grid min-h-screen bg-zinc-950 text-zinc-100 lg:grid-cols-[1.08fr_0.92fr]">
        <section className="relative hidden overflow-hidden border-r border-white/[0.08] lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,211,238,0.16),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.05),transparent_40%)]" />
          <div className="relative flex h-full flex-col justify-between p-10">
            <Link to="/" className="flex items-center gap-3">
              <PyroMark />
              <span className="font-semibold text-white">Pyro</span>
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-xl"
            >
              <p className="text-sm font-medium text-cyan-200">
                Realtime communication
              </p>
              <h1 className="mt-4 text-5xl font-semibold tracking-tight text-white">
                Step into the room where work starts moving.
              </h1>
              <div className="mt-7 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                {[
                  [MessageCircle, "Room-based conversations"],
                  [Activity, "Live Socket.IO updates"],
                  [LockKeyhole, "JWT protected workspace"],
                ].map(([Icon, label]) => (
                  <div
                    key={label as string}
                    className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4 text-sm text-zinc-300"
                  >
                    <Icon className="h-4 w-4 text-zinc-400" />
                    {label as string}
                  </div>
                ))}
              </div>
              <AuthWorkspacePreview />
            </motion.div>

            <p className="text-xs text-zinc-600">
              Realtime collaboration without the noise.
            </p>
          </div>
        </section>

        <section className="flex items-center justify-center px-4 py-10 sm:px-6">
          <div className="w-full max-w-md">
            <Link to="/" className="mb-10 flex items-center gap-3 lg:hidden">
              <PyroMark />
              <span className="font-semibold text-white">Pyro</span>
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="rounded-3xl border border-white/[0.08] bg-white/[0.04] p-6 shadow-2xl shadow-black/30 sm:p-8"
            >
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-white">
                  {title}
                </h1>
                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  {subtitle}
                </p>
              </div>

              <div className="mt-8">{children}</div>
            </motion.div>

            <div className="mt-6 text-center text-sm text-zinc-500">
              {footer}
            </div>
          </div>
        </section>
      </main>
    </PageTransition>
  );
}
