import { Hash, Menu, Wifi, WifiOff } from "lucide-react";
import { motion } from "framer-motion";
import type { Room, User } from "../../types/api";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

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
    </header>
  );
}
