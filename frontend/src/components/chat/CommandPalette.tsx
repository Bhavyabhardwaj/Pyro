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
  discoverRooms = [],
  onJoinRoom,
}: {
  isOpen: boolean;
  rooms: RoomMember[];
  selectedRoom: Room | null;
  onClose: () => void;
  onSelectRoom: (room: Room) => void;
  discoverRooms?: Room[];
  onJoinRoom: (roomId: string) => Promise<void>;
}) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const results = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return rooms;
    return rooms.filter((item) => item.room.name.toLowerCase().includes(value));
  }, [query, rooms]);

  const discoverResults = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return [];
    return discoverRooms.filter((room) => {
      if (room.isDM) return false;
      const isMember = rooms.some((rm) => rm.room.id === room.id);
      if (isMember) return false;
      return room.name.toLowerCase().includes(value);
    });
  }, [query, discoverRooms, rooms]);

  const mergedResults = useMemo(() => {
    const joined = results.map(item => ({ ...item.room, isJoined: true }));
    const discover = discoverResults.map(room => ({ ...room, isJoined: false }));
    return [...joined, ...discover];
  }, [results, discoverResults]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((index) => Math.min(index + 1, mergedResults.length - 1));
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((index) => Math.max(index - 1, 0));
      }
      if (event.key === "Enter" && mergedResults[activeIndex]) {
        const item = mergedResults[activeIndex];
        if (item.isJoined) {
          onSelectRoom(item);
        } else {
          onJoinRoom(item.id);
        }
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, isOpen, onClose, onSelectRoom, onJoinRoom, mergedResults]);

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
              {mergedResults.length === 0 ? (
                <div className="px-3 py-8 text-center text-sm text-zinc-500">
                  No rooms found.
                </div>
              ) : (
                mergedResults.map((room, index) => {
                  const active = index === activeIndex;
                  const selected = selectedRoom?.id === room.id;
                  return (
                    <button
                      key={room.id}
                      type="button"
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => {
                        if (room.isJoined) {
                          onSelectRoom(room);
                        } else {
                          onJoinRoom(room.id);
                        }
                        onClose();
                      }}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-3 text-left text-sm transition group",
                        active ? "bg-white/8 text-white" : "text-zinc-400",
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/8 bg-white/4">
                          <Hash className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1 truncate">
                          {room.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {selected && (
                          <span className="text-xs text-cyan-100">Current</span>
                        )}
                        {!room.isJoined && (
                          <span className="text-[10px] px-2 py-0.5 rounded border border-white/8 bg-white/4 text-zinc-400 group-hover:text-white transition">
                            + Join
                          </span>
                        )}
                      </div>
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
