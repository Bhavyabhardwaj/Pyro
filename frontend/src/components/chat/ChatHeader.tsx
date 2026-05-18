import { Hash } from "lucide-react";
import type { Room } from "../../types/api";

export function ChatHeader({ room }: { room: Room | null }) {
  return (
    <header className="relative flex h-[72px] shrink-0 items-center justify-between border-b border-white/[0.08] bg-zinc-950/70 px-4 backdrop-blur-2xl sm:px-7">
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-base font-semibold text-white">
          {room ? (
            <>
              <Hash className="h-4 w-4 text-zinc-500" />
              <span className="truncate">{room.name}</span>
            </>
          ) : (
            <span>Welcome to Pyro</span>
          )}
        </div>
        {!room && (
          <p className="mt-1.5 text-xs text-zinc-500">
            Select a room to start chatting
          </p>
        )}
      </div>
    </header>
  );
}
