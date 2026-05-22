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
        whileHover={{ borderColor: "rgba(242, 242, 239, 0.12)", backgroundColor: "rgba(242, 242, 239, 0.04)" }}
        className="flex w-full items-center gap-2.5 rounded-xl border border-[var(--border-muted)] bg-[rgba(242,242,239,0.02)] p-2.5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.01),0_8px_24px_rgba(0,0,0,0.25)] transition-all cursor-pointer select-none"
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
            className="absolute -bottom-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full border border-[var(--border-muted)] bg-neutral-900 text-[var(--text-muted)] shadow-md transition hover:bg-neutral-800 hover:text-[var(--text-secondary)]"
            aria-label="Upload avatar"
          >
            <Camera className="h-2.5 w-2.5" />
          </motion.button>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-medium tracking-tight text-[var(--text-primary)]">
            {user?.username || "Pyro user"}
          </p>
          <p className="truncate text-[9.5px] text-[var(--text-muted)] font-normal leading-none mt-0.5">
            {user?.email || "Signed in"}
          </p>
        </div>
      </motion.div>
 
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute bottom-[calc(100%+6px)] left-0 right-0 overflow-hidden rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(22,22,21,0.92)] p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.02)] backdrop-blur-2xl"
          >
            <motion.button
              whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.045)", color: "var(--text-primary)" }}
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] font-medium tracking-tight text-[var(--text-secondary)] transition-all duration-150"
            >
              <Camera className="h-3.5 w-3.5 text-[var(--text-muted)]" />
              Change avatar
            </motion.button>
            <div className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] font-medium tracking-tight text-[var(--text-muted)] select-none">
              <UserRound className="h-3.5 w-3.5 text-[var(--text-muted)]" />
              Profile
            </div>
            <div className="my-1 h-px bg-[var(--border-muted)]" />
            <motion.button
              whileHover={{ backgroundColor: "rgba(239, 68, 68, 0.08)", color: "#f87171" }}
              type="button"
              onClick={onLogout}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] font-medium tracking-tight text-red-400/90 transition-all duration-150"
            >
              <LogOut className="h-3.5 w-3.5 text-red-400/70" />
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
