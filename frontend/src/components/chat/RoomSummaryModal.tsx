import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";

export function RoomSummaryModal({
  isOpen,
  onClose,
  summary,
  roomName,
}: {
  isOpen: boolean;
  onClose: () => void;
  summary: string;
  roomName: string;
}) {
  // Structured parser to render double newlines as paragraphs and group lines starting with -, * or • into bulleted lists
  const parseSummaryContent = (text: string) => {
    if (!text) return null;
    const lines = text.split("\n");
    const rendered: React.ReactNode[] = [];
    let currentListItems: React.ReactNode[] = [];

    const flushList = (key: number) => {
      if (currentListItems.length > 0) {
        rendered.push(
          <ul key={`list-${key}`} className="my-3.5 space-y-2 list-disc pl-5 text-[var(--text-secondary)]">
            {currentListItems}
          </ul>
        );
        currentListItems = [];
      }
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) {
        flushList(index);
        return;
      }

      // Identify bulleted list items
      if (trimmed.startsWith("-") || trimmed.startsWith("*") || trimmed.startsWith("•")) {
        const itemContent = trimmed.substring(1).trim();
        currentListItems.push(
          <li key={`item-${index}`} className="text-xs sm:text-sm text-zinc-300 leading-relaxed pl-1">
            {itemContent}
          </li>
        );
      } else {
        flushList(index);
        rendered.push(
          <p key={`p-${index}`} className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-3">
            {trimmed}
          </p>
        );
      }
    });

    flushList(lines.length);
    return rendered;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            onClick={(event) => event.stopPropagation()}
            className="relative w-full max-w-lg overflow-hidden rounded-[1.8rem] border border-white/10 bg-zinc-950/95 p-6 shadow-2xl shadow-black/70 flex flex-col max-h-[85vh] sm:max-h-[80vh]"
          >
            {/* Soft decorative background radial glow for premium AI feel */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-teal-500/8 blur-[80px]" />
            <div className="pointer-events-none absolute -left-20 -bottom-20 h-52 w-52 rounded-full bg-indigo-500/8 blur-[80px]" />

            {/* Header section */}
            <div className="relative flex items-center justify-between border-b border-white/8 pb-4">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-teal-500/20 bg-teal-500/5 shadow-[0_0_15px_rgba(20,184,166,0.1)]">
                  <Sparkles className="h-4.5 w-4.5 text-teal-400" />
                </span>
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold tracking-tight text-white truncate">
                    Room Summary
                  </h2>
                  <p className="text-[10px] text-zinc-500 truncate mt-0.5">
                    AI generated recap of #{roomName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 transition hover:bg-white/8 hover:text-white"
                aria-label="Close summary modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content area */}
            <div className="relative flex-1 overflow-y-auto pr-1 my-5 custom-scrollbar max-h-[50vh]">
              <div className="space-y-1">
                {parseSummaryContent(summary)}
              </div>
            </div>

            {/* Footer / Close Button */}
            <div className="relative pt-3 border-t border-white/8 flex items-center justify-end">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-28 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-xs font-semibold text-white transition duration-200 hover:bg-white/10 hover:border-white/15 active:scale-98 cursor-pointer select-none"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
