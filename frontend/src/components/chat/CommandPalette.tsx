import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Hash, Search, X } from "lucide-react";
import type { Room, RoomMember } from "../../types/api";
import { cn } from "../../lib/utils";

export function CommandPalette({
  isOpen,
  rooms,
  selectedRoom,
  onClose,
  onSelectRoom,
}: {
  isOpen: boolean;
  rooms: RoomMember[];
  selectedRoom: Room | null;
  onClose: () => void;
  onSelectRoom: (room: Room) => void;
}) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const results = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return rooms;
    return rooms.filter((item) => item.room.name.toLowerCase().includes(value));
  }, [query, rooms]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((index) => Math.min(index + 1, results.length - 1));
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((index) => Math.max(index - 1, 0));
      }
      if (event.key === "Enter" && results[activeIndex]) {
        onSelectRoom(results[activeIndex].room);
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, isOpen, onClose, onSelectRoom, results]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/55 px-4 pt-[14vh] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.98 }}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-xl overflow-hidden rounded-[1.65rem] border border-white/10 bg-zinc-950/95 shadow-2xl shadow-black/50"
          >
            <div className="flex items-center gap-3 border-b border-white/8 px-4 py-3">
              <Search className="h-4 w-4 text-zinc-500" />
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActiveIndex(0);
                }}
                autoFocus
                placeholder="Switch rooms..."
                className="h-10 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
              />
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 transition hover:bg-white/8 hover:text-white"
                aria-label="Close command palette"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {results.length === 0 ? (
                <div className="px-3 py-8 text-center text-sm text-zinc-500">
                  No rooms found.
                </div>
              ) : (
                results.map((item, index) => {
                  const active = index === activeIndex;
                  const selected = selectedRoom?.id === item.room.id;
                  return (
                    <button
                      key={item.room.id}
                      type="button"
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => {
                        onSelectRoom(item.room);
                        onClose();
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm transition",
                        active ? "bg-white/8 text-white" : "text-zinc-400",
                      )}
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/8 bg-white/4">
                        <Hash className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1 truncate">
                        {item.room.name}
                      </span>
                      {selected && (
                        <span className="text-xs text-cyan-100">Current</span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
