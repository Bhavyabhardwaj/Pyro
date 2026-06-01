import React, { useEffect } from "react";
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
  // Bind Escape key to dismiss the modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Structured parser to render double newlines as paragraphs and group lines starting with -, * or • into bulleted lists
  const parseSummaryContent = (text: string) => {
    if (!text) return null;
    const lines = text.split("\n");
    const rendered: React.ReactNode[] = [];
    let currentListItems: React.ReactNode[] = [];

    const flushList = (key: number) => {
      if (currentListItems.length > 0) {
        rendered.push(
          <ul key={`list-${key}`} className="my-3 space-y-2 list-disc pl-5 text-zinc-400">
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
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.97 }}
            transition={{ type: "spring", damping: 26, stiffness: 370 }}
            onClick={(event) => event.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden rounded-[1.65rem] border border-white/10 bg-zinc-950/95 p-5 shadow-2xl shadow-black/80 flex flex-col max-h-[80vh] sm:max-h-[75vh]"
          >
            {/* Soft decorative background radial glow for premium AI feel */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full bg-teal-500/6 blur-[70px]" />
            <div className="pointer-events-none absolute -left-20 -bottom-20 h-44 w-44 rounded-full bg-indigo-500/6 blur-[70px]" />

            {/* Header section */}
            <div className="relative flex items-center justify-between border-b border-white/8 pb-3.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-xl border border-teal-500/20 bg-teal-500/5 shadow-[0_0_12px_rgba(20,184,166,0.1)]">
                  <Sparkles className="h-4 w-4 text-teal-400" />
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
                className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-500 transition hover:bg-white/8 hover:text-white"
                aria-label="Close summary modal"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Content area */}
            <div className="relative flex-1 overflow-y-auto pr-1 my-4.5 custom-scrollbar max-h-[45vh]">
              <div className="space-y-1">
                {parseSummaryContent(summary)}
              </div>
            </div>

            {/* Footer / Close Button */}
            <div className="relative pt-3 border-t border-white/8 flex items-center justify-end">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-24 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs font-semibold text-white transition duration-200 hover:bg-white/10 hover:border-white/15 active:scale-98 cursor-pointer select-none"
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
