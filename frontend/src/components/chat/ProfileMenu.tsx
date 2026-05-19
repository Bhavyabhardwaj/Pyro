import { useEffect, useRef, useState } from "react";
import { Camera, LogOut, UserRound } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { User } from "../../types/api";
import { Avatar } from "./Avatar";

export function ProfileMenu({
  user,
  onLogout,
  onAvatarChange,
}: {
  user: User | null;
  onLogout: () => void;
  onAvatarChange: (avatarUrl: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  const toggleMenu = () => {
    setIsOpen((value) => !value);
  };

  const withAvatarBust = (value: string) => {
    if (value.startsWith("data:")) {
      return value;
    }
    const stamp = Date.now();
    if (value.includes("?")) {
      return `${value}&v=${stamp}`;
    }
    return `${value}?v=${stamp}`;
  };

  return (
    <div className="relative">
      <motion.div
        role="button"
        tabIndex={0}
        onClick={toggleMenu}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggleMenu();
          }
        }}
        whileHover={{ borderColor: "rgba(255, 255, 255, 0.12)", backgroundColor: "rgba(255, 255, 255, 0.05)" }}
        className="flex w-full items-center gap-2.5 rounded-xl border border-white/8 bg-white/3.5 p-2.5 text-left shadow-lg shadow-black/20 transition-all cursor-pointer"
        aria-expanded={isOpen}
      >
        <div className="relative">
          <Avatar
            name={user?.username || "User"}
            src={user?.avatar}
            showStatus
            isOnline
            size="sm"
          />
          <motion.button
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(event) => {
              event.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-white/10 bg-zinc-950/90 text-zinc-400 shadow-lg transition hover:bg-white/10 hover:text-white"
            aria-label="Upload avatar"
          >
            <Camera className="h-2.5 w-2.5" />
          </motion.button>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-white">
            {user?.username || "Pyro user"}
          </p>
          <p className="truncate text-[10px] text-zinc-600">
            {user?.email || "Signed in"}
          </p>
        </div>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-[calc(100%+8px)] left-0 right-0 overflow-hidden rounded-lg border border-white/8 bg-zinc-950/95 p-1 shadow-2xl shadow-black/40 backdrop-blur-xl"
          >
            <motion.button
              whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-zinc-300 transition-colors"
            >
              <Camera className="h-3.5 w-3.5 text-zinc-600" />
              Change avatar
            </motion.button>
            <div className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-zinc-600">
              <UserRound className="h-3.5 w-3.5" />
              Profile
            </div>
            <motion.button
              whileHover={{ backgroundColor: "rgba(239, 68, 68, 0.08)" }}
              type="button"
              onClick={onLogout}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-red-300 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = () => {
            const result = typeof reader.result === "string" ? reader.result : null;
            if (!result) return;
            if (previewUrlRef.current?.startsWith("blob:")) {
              URL.revokeObjectURL(previewUrlRef.current);
            }
            const busted = withAvatarBust(result);
            previewUrlRef.current = busted;
            onAvatarChange(busted);
            setIsOpen(false);
            event.target.value = "";
          };
          reader.readAsDataURL(file);
        }}
        className="hidden"
      />
    </div>
  );
}
