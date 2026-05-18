import { useRef, useState } from "react";
import { Camera, LogOut, UserRound } from "lucide-react";
import type { User } from "../../types/api";
import { Avatar } from "./Avatar";

export function ProfileMenu({
  user,
  onLogout,
}: {
  user: User | null;
  onLogout: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="flex w-full items-center gap-3 rounded-[1.35rem] border border-white/8 bg-white/4.5 p-3 text-left shadow-xl shadow-black/20 transition-all hover:border-white/15 hover:bg-white/6.5"
      >
        <div className="relative">
          <Avatar
            name={user?.username || "User"}
            src={user?.avatar}
            showStatus
            isOnline
          />
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-zinc-950/90 text-zinc-300 shadow-lg transition hover:bg-white/10"
            aria-label="Upload avatar"
          >
            <Camera className="h-3 w-3" />
          </button>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white">
            {user?.username || "Pyro user"}
          </p>
          <p className="truncate text-xs text-zinc-500">
            {user?.email || "Signed in"}
          </p>
        </div>
      </button>

      {isOpen && (
        <div className="absolute bottom-[calc(100%+10px)] left-0 right-0 overflow-hidden rounded-2xl border border-white/8 bg-zinc-950/95 p-1 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-white/6 hover:text-white"
          >
            <Camera className="h-4 w-4 text-zinc-500" />
            Choose avatar
          </button>
          <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-500">
            <UserRound className="h-4 w-4" />
            Profile settings
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-200 transition-colors hover:bg-red-500/10"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={() => setIsOpen(false)}
        className="hidden"
      />
    </div>
  );
}
