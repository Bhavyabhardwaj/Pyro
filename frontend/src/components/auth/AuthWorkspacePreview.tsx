import { motion } from "framer-motion";
import { Hash, SendHorizontal } from "lucide-react";

const previewMessages = [
  {
    name: "Mira Sen",
    initials: "MS",
    avatarBg: "bg-[#1f1f1e] text-[#a8a8a2] border border-white/[0.04]",
    text: "Welcome flow looks completely ready."
  },
  {
    name: "Aarav Patel",
    initials: "AP",
    avatarBg: "bg-[#272725] text-[#d4d4d1] border border-white/[0.04]",
    text: "Real-time room syncing is stable."
  }
];

export function AuthWorkspacePreview() {
  return (
    <div className="relative mt-5.5 min-h-[220px] overflow-hidden rounded-2xl border border-white/[0.02] bg-[#141413]/30 p-3.5 shadow-lg shadow-black/30 hover:border-white/[0.04] transition-all duration-500 group/preview cursor-default">
      
      {/* Soft atmospheric highlights matching landing page radials */}
      <motion.div
        className="absolute -right-16 top-4 h-48 w-48 rounded-full bg-[#8da2aa]/3 blur-3xl group-hover/preview:bg-[#8da2aa]/5 transition-all duration-700 pointer-events-none"
        animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.05, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-4 top-4 h-28 w-28 rounded-full bg-white/[0.005] blur-2xl pointer-events-none"
        animate={{ x: [0, 8, 0], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Onboarding Channel Mockup Block */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative rounded-xl border border-white/[0.02] bg-[#111110]/85 p-3.5 shadow-[0_10px_35px_rgba(0,0,0,0.3)] transition-all duration-300 group-hover/preview:border-white/[0.035]"
      >
        <div className="flex items-center justify-between border-b border-white/[0.02] pb-2.5 select-none">
          <div>
            <div className="flex items-center gap-1.5 text-[9.5px] font-medium text-[#e8e8e5]">
              <Hash className="h-2.5 w-2.5 text-[#6f6f69]" />
              onboarding
            </div>
          </div>
          {/* Brighter elite mist-blue accent for the live badge */}
          <div className="flex items-center gap-1 text-[8px] font-medium text-[#e8e8e5] bg-white/[0.03] border border-white/[0.05] px-2 py-0.5 rounded-full select-none">
            <span className="h-[4px] w-[4px] rounded-full bg-[#aed5e2] animate-pulse" />
            live
          </div>
        </div>

        {/* Message Stream with grouped feeling */}
        <div className="mt-3 space-y-2.5">
          {previewMessages.map((msg, index) => (
            <motion.div
              key={msg.name}
              initial={{ opacity: 0, x: index % 2 === 0 ? -4 : 4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex gap-2.5 group/msg"
            >
              <div className={`mt-0.5 flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-md text-[7.5px] font-medium ${msg.avatarBg} transition duration-300 group-hover/msg:brightness-105`}>
                {msg.initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[9px] font-medium text-[#e8e8e5]">{msg.name}</div>
                <div className="mt-0.5 rounded-lg rounded-tl-sm border border-white/[0.015] bg-white/[0.01] px-2.5 py-1.5 text-[9.5px] leading-[1.5] text-[#c4c4c0] transition duration-300 group-hover/preview:text-[#e8e8e5]">
                  {msg.text}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Composer Input Bar Mockup */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: [0, -1, 0] }}
        transition={{
          opacity: { delay: 0.4 },
          y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
        }}
        className="absolute bottom-3 left-3.5 right-3.5 flex items-center gap-3 rounded-lg border border-white/[0.025] bg-[#131312] px-3.5 py-1.8 text-[9px] text-[#5a5a55] select-none"
      >
        Message #onboarding...
        <SendHorizontal className="ml-auto h-2.8 w-2.8 text-[#5a5a55]" />
      </motion.div>
    </div>
  );
}
