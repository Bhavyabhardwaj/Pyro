import { useState, useEffect } from "react";
import { Hash, Menu, Wifi, WifiOff, Sparkles, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { Room, User } from "../../types/api";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import { roomService } from "../../services/room.service";
import { useToast } from "../ui/Toast";
import { RoomSummaryModal } from "./RoomSummaryModal";

export function ChatHeader({
  room,
  isConnected,
  onOpenRooms,
  currentUser,
  onlineUsers,
}: {
  room: Room | null;
  isConnected: boolean;
  onOpenRooms: () => void;
  currentUser?: User | null;
  onlineUsers?: Set<string>;
}) {
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryContent, setSummaryContent] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { showToast } = useToast();

  // Close helper to ensure any stale loading state is completely removed
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsSummarizing(false);
  };

  // Close AI dropdown when clicking outside
  useEffect(() => {
    if (!isDropdownOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".ai-dropdown-container")) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("pointerdown", handleOutsideClick);
    return () => document.removeEventListener("pointerdown", handleOutsideClick);
  }, [isDropdownOpen]);

  const handleSummarize = async () => {
    if (!room) return;
    setIsSummarizing(true);
    try {
      const res = await roomService.generateRoomSummary(room.id);
      if (res.success && res.data?.summary) {
        setSummaryContent(res.data.summary);
        setIsModalOpen(true);
      } else {
        showToast(res.message || "Failed to generate room summary.", "error");
      }
    } catch (err: any) {
      console.error("AI Room Summary error:", err);
      const errors = err.response?.data?.errors;
      const errMsg = (errors && errors[0]?.message) || err.response?.data?.message || "Something went wrong while summarizing.";
      showToast(errMsg, "error");
    } finally {
      setIsSummarizing(false);
    }
  };

  const isDM = room?.isDM;
  let displayName = room?.name;
  let isOnline = false;
  let otherUserId = "";

  if (room && isDM && currentUser) {
    const otherMember = room.roomMembers?.find((m) => m.user.id !== currentUser.id);
    if (otherMember) {
      displayName = otherMember.user.username;
      otherUserId = otherMember.user.id;
      isOnline = onlineUsers?.has(otherUserId) ?? false;
    }
  }

  return (
    <header className="relative flex h-16 shrink-0 items-center justify-between border-b border-[var(--border-muted)] bg-[rgba(17,17,16,0.35)] px-4 backdrop-blur-xl sm:px-6">
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      <div className="flex min-w-0 items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenRooms}
          className="md:hidden h-8 w-8 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          aria-label="Open rooms"
        >
          <Menu className="h-4 w-4" />
        </Button>
        <div className="min-w-0">
        <motion.div
          initial={{ opacity: 0, y: -2 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]"
        >
          {room ? (
            <>
              {isDM ? (
                <span className={cn(
                  "relative flex h-2 w-2 shrink-0 rounded-full",
                  isOnline 
                    ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]" 
                    : "bg-neutral-500"
                )} />
              ) : (
                <Hash className="h-3.5 w-3.5 text-[var(--text-muted)]" />
              )}
              <span className="truncate">{displayName}</span>
            </>
          ) : (
            <span>Welcome to Pyro</span>
          )}
        </motion.div>
        {room ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[10px] text-[var(--text-muted)] mt-0.5"
          >
            {isDM ? (isOnline ? "Online" : "Offline") : "Workspace channel"}
          </motion.p>
        ) : (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mt-1 text-[10px] text-[var(--text-muted)]"
          >
            Select a room to start chatting
          </motion.p>
        )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {room && (
          <div className="relative ai-dropdown-container">
            <motion.button
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              disabled={isSummarizing}
              className="flex items-center gap-1 rounded-lg border border-teal-500/25 bg-teal-500/5 px-2.5 py-1 text-[10px] font-semibold text-teal-300 shadow-[0_0_10px_rgba(20,184,166,0.1)] hover:bg-teal-500/10 hover:border-teal-500/40 active:scale-97 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer transition-all duration-200"
              title="Open AI Tools menu"
            >
              {isSummarizing ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin text-teal-400" />
                  <span className="animate-pulse">AI ⌛</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3 w-3 text-teal-400" />
                  <span>AI</span>
                </>
              )}
            </motion.button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.96 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute top-10 right-0 z-40 w-48 rounded-xl border border-white/8 bg-zinc-950/95 p-1.5 shadow-2xl shadow-black/85 backdrop-blur-md flex flex-col select-none"
                >
                  <div className="px-2.5 py-1.5 text-[8.5px] font-semibold text-zinc-500 uppercase tracking-wider border-b border-white/5 mb-1 select-none">
                    AI Features
                  </div>
                  
                  {/* Summarize Room Action */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      handleSummarize();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs text-zinc-300 transition duration-200 hover:bg-white/5 hover:text-white cursor-pointer select-none"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-teal-400 shrink-0" />
                    <span>Summarize Room</span>
                  </button>

                  {/* Suggest Reply (Coming Soon) */}
                  <button
                    type="button"
                    disabled
                    className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs text-zinc-600 select-none cursor-not-allowed"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[11px] shrink-0">💬</span>
                      <span className="truncate">Suggest Reply</span>
                    </div>
                    <span className="text-[7px] px-1 py-0.5 rounded bg-white/2 text-zinc-600 scale-90 shrink-0 font-medium tracking-wide">SOON</span>
                  </button>

                  {/* Meeting Notes (Coming Soon) */}
                  <button
                    type="button"
                    disabled
                    className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs text-zinc-600 select-none cursor-not-allowed"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[11px] shrink-0">📝</span>
                      <span className="truncate">Meeting Notes</span>
                    </div>
                    <span className="text-[7px] px-1 py-0.5 rounded bg-white/2 text-zinc-600 scale-90 shrink-0 font-medium tracking-wide">SOON</span>
                  </button>

                  {/* Ask Pyro AI (Coming Soon) */}
                  <button
                    type="button"
                    disabled
                    className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs text-zinc-600 select-none cursor-not-allowed"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[11px] shrink-0">🔮</span>
                      <span className="truncate">Ask Pyro AI</span>
                    </div>
                    <span className="text-[7px] px-1 py-0.5 rounded bg-white/2 text-zinc-650 scale-90 shrink-0 font-medium tracking-wide">SOON</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="hidden items-center gap-1.5 rounded-lg border border-[var(--border-muted)] bg-[rgba(242,242,239,0.02)] px-2.5 py-1 text-[10px] text-[var(--text-secondary)] sm:flex transition-all duration-200"
        >
          <motion.div
            animate={isConnected ? { opacity: 1 } : { opacity: 0.5 }}
            transition={{ duration: 2, repeat: isConnected ? 0 : Infinity }}
          >
            {isConnected ? (
              <Wifi className="h-3 w-3 text-[var(--accent-teal)]" />
            ) : (
              <WifiOff className="h-3 w-3 text-[var(--text-muted)]" />
            )}
          </motion.div>
          {isConnected ? "Connected" : "Offline"}
        </motion.div>
      </div>

      <RoomSummaryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        summary={summaryContent}
        roomName={displayName || room?.name || ""}
      />
    </header>
  );
}
