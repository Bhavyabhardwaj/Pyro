import { Hash, Menu, Wifi, WifiOff } from "lucide-react";
import { motion } from "framer-motion";
import type { Room } from "../../types/api";
import { Button } from "../ui/button";

export function ChatHeader({
  room,
  isConnected,
  onOpenRooms,
}: {
  room: Room | null;
  isConnected: boolean;
  onOpenRooms: () => void;
}) {
  return (
    <header className="relative flex h-16 shrink-0 items-center justify-between border-b border-white/8 bg-zinc-950/50 px-4 backdrop-blur-xl sm:px-6">
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="flex min-w-0 items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenRooms}
          className="md:hidden h-8 w-8"
          aria-label="Open rooms"
        >
          <Menu className="h-4 w-4" />
        </Button>
        <div className="min-w-0">
        <motion.div
          initial={{ opacity: 0, y: -2 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm font-semibold text-white"
        >
          {room ? (
            <>
              <Hash className="h-3.5 w-3.5 text-zinc-600" />
              <span className="truncate">{room.name}</span>
            </>
          ) : (
            <span>Welcome to Pyro</span>
          )}
        </motion.div>
        {!room && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mt-1 text-[10px] text-zinc-600"
          >
            Select a room to start chatting
          </motion.p>
        )}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="hidden items-center gap-1.5 rounded-lg border border-white/8 bg-white/4 px-2.5 py-1 text-[10px] text-zinc-500 sm:flex transition-all duration-200"
      >
        <motion.div
          animate={isConnected ? { opacity: 1 } : { opacity: 0.5 }}
          transition={{ duration: 2, repeat: isConnected ? 0 : Infinity }}
        >
          {isConnected ? (
            <Wifi className="h-3 w-3 text-cyan-200" />
          ) : (
            <WifiOff className="h-3 w-3 text-zinc-700" />
          )}
        </motion.div>
        {isConnected ? "Connected" : "Offline"}
      </motion.div>
    </header>
  );
}
