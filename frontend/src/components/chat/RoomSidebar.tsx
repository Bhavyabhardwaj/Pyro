import {
  Flame,
  MessageSquarePlus,
  MoreHorizontal,
  Trash2,
  X,
  Search,
  UserMinus,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Room, RoomMember, User } from "../../types/api";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { PyroMark } from "../ui/surface";
import { Skeleton } from "../ui/skeleton";
import { ProfileMenu } from "./ProfileMenu";

export function RoomSidebar({
  rooms,
  selectedRoom,
  roomFilter,
  newRoomName,
  isLoading,
  isCreating,
  isCreateOpen,
  createError,
  user,
  unreadCounts,
  onlineUsersCount = 0,
  onRoomFilterChange,
  onNewRoomNameChange,
  onCreateRoom,
  onOpenCreate,
  onCloseCreate,
  onSelectRoom,
  onLeaveRoom,
  onDeleteRoom,
  onAvatarChange,
  onLogout,
}: {
  rooms: RoomMember[];
  selectedRoom: Room | null;
  roomFilter: string;
  newRoomName: string;
  isLoading: boolean;
  isCreating: boolean;
  isCreateOpen: boolean;
  createError?: string | null;
  user: User | null;
  unreadCounts: Record<string, number>;
  onlineUsersCount?: number;
  onRoomFilterChange: (value: string) => void;
  onNewRoomNameChange: (value: string) => void;
  onCreateRoom: () => void;
  onOpenCreate: () => void;
  onCloseCreate: () => void;
  onSelectRoom: (room: Room) => void;
  onLeaveRoom: (roomId: string) => void;
  onDeleteRoom: (roomId: string) => void;
  onAvatarChange: (avatarUrl: string) => void;
  onLogout: () => void;
}) {
  const [menuRoomId, setMenuRoomId] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<{ roomId: string; x: number; y: number } | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const filteredRooms = useMemo(() => {
    if (!roomFilter.trim()) return rooms;
    const lowered = roomFilter.trim().toLowerCase();
    return rooms.filter((roomMember) =>
      roomMember.room.name.toLowerCase().includes(lowered),
    );
  }, [roomFilter, rooms]);

  useEffect(() => {
    if (!menuAnchor) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuRoomId(null);
        setMenuAnchor(null);
      }
    };
    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setMenuRoomId(null);
        setMenuAnchor(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("pointerdown", handlePointerDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [menuAnchor]);

  return (
    <aside className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-none border-white/8 bg-[linear-gradient(180deg,rgba(24,24,27,0.88),rgba(9,9,11,0.92)_48%,rgba(12,12,16,0.95))] shadow-2xl shadow-black/35 md:rounded-3xl md:border xl:rounded-[1.7rem]">
      <div className="pointer-events-none absolute -left-24 top-8 h-44 w-44 rounded-full bg-cyan-300/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 bottom-20 h-56 w-56 rounded-full bg-violet-300/[0.07] blur-3xl" />
      <div className="pointer-events-none absolute inset-x-6 top-24 h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative border-b border-white/8 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <PyroMark />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white">Pyro</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="truncate text-[10px] text-zinc-500">Workspace</span>
                <span className="text-[10px] text-zinc-700">•</span>
                <div className="flex items-center gap-1.5" title={`${onlineUsersCount} user${onlineUsersCount === 1 ? '' : 's'} online`}>
                  <span className="relative flex h-1.5 w-1.5">
                    <AnimatePresence>
                      {onlineUsersCount > 0 && (
                        <motion.span
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.5, opacity: 0 }}
                          className="absolute inline-flex h-full w-full rounded-full bg-[#23a559]"
                        />
                      )}
                    </AnimatePresence>
                    {onlineUsersCount === 0 && <span className="absolute inline-flex h-full w-full rounded-full bg-zinc-600" />}
                  </span>
                  <span className="text-[10px] font-medium text-zinc-400">
                    {onlineUsersCount} online
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative space-y-2.5 border-b border-white/8 p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-700" />
          <Input
            value={roomFilter}
            onChange={(event) => onRoomFilterChange(event.target.value)}
            placeholder="Search rooms"
            className="pl-8 text-sm"
          />
        </div>
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            variant="secondary"
            className="w-full rounded-lg text-sm"
            onClick={onOpenCreate}
            disabled={isCreating}
          >
            <MessageSquarePlus className="h-3.5 w-3.5" />
            {isCreating ? "Creating..." : "New room"}
          </Button>
        </motion.div>
      </div>

      <div className="relative min-h-0 flex-1 overflow-y-auto p-2">
        <div className="mb-2.5 flex items-center justify-between px-2">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-600">
            Rooms
          </span>
          <span className="text-xs text-zinc-700">{filteredRooms.length}</span>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[0, 1, 2, 3].map((item) => (
              <Skeleton key={item} className="h-12" />
            ))}
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-4 text-sm leading-6 text-zinc-500">
            No matches. Create a new room to start a realtime conversation.
          </div>
        ) : (
          <div className="space-y-1">
            {filteredRooms.map((roomMember, index) => {
              const room = roomMember.room;
              const active = selectedRoom?.id === room.id;
              const initial = room.name.slice(0, 1).toUpperCase();
              const unreadCount = unreadCounts[room.id] || 0;

              return (
                <motion.div
                  key={room.id}
                  role="button"
                  tabIndex={0}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{
                    delay: index * 0.025,
                    type: "spring",
                    stiffness: 360,
                    damping: 28,
                  }}
                  onClick={() => {
                    setMenuRoomId(null);
                    onSelectRoom(room);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setMenuRoomId(null);
                      onSelectRoom(room);
                    }
                  }}
                  className={cn(
                    "group relative flex w-full items-center gap-2.5 overflow-hidden rounded-xl px-3 py-2 text-left text-sm transition-all duration-200",
                    active
                      ? "border border-cyan-200/15 bg-white/7 text-white shadow-[0_12px_32px_rgba(0,0,0,0.24)]"
                      : "border border-transparent text-zinc-500 hover:border-white/8 hover:bg-white/3 hover:text-zinc-200",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="active-room-glow"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-[radial-gradient(circle_at_18%_50%,rgba(103,232,249,0.08),transparent_36%)]"
                    />
                  )}
                  {active && (
                    <motion.span
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-cyan-300 origin-center"
                    />
                  )}
                  <span
                    className={cn(
                      "relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-xs font-semibold transition-all duration-200",
                      active
                        ? "border-cyan-200/20 bg-cyan-200/10 text-cyan-100"
                        : "border-white/8 bg-white/3 text-zinc-500 group-hover:text-zinc-300",
                    )}
                  >
                    {active ? <Flame className="h-3.5 w-3.5" /> : initial}
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className={cn("block truncate text-[0.9rem]", active ? "text-white font-medium" : "text-zinc-300")}>
                      {room.name}
                    </span>
                  </div>
                  {unreadCount > 0 && (
                    <motion.span
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className="rounded-full bg-cyan-200/20 px-2 py-0.5 text-[10px] font-semibold text-cyan-100"
                    >
                      {unreadCount}
                    </motion.span>
                  )}
                  <span
                    className={cn(
                      "ml-auto h-1.5 w-1.5 rounded-full transition-all duration-200",
                      active
                        ? "bg-cyan-200 shadow-[0_0_12px_rgba(103,232,249,0.6)]"
                        : "bg-white/8 group-hover:bg-white/20",
                    )}
                  />
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={(event) => {
                      event.stopPropagation();
                      const target = event.currentTarget as HTMLElement;
                      const rect = target.getBoundingClientRect();
                      const menuWidth = 176;
                      const menuHeight = 120;
                      const nextX = Math.min(
                        Math.max(12, rect.right - menuWidth),
                        window.innerWidth - menuWidth - 12,
                      );
                      const nextY = Math.min(
                        rect.bottom + 8,
                        window.innerHeight - menuHeight - 12,
                      );
                      setMenuRoomId((current) => (current === room.id ? null : room.id));
                      setMenuAnchor((current) =>
                        current?.roomId === room.id
                          ? null
                          : { roomId: room.id, x: nextX, y: nextY },
                      );
                    }}
                    className="relative z-10 flex h-6 w-6 items-center justify-center rounded-lg text-zinc-500 opacity-0 transition group-hover:opacity-100 hover:bg-white/10 hover:text-white"
                    aria-label="Room actions"
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </motion.button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <div className="relative border-t border-white/8 p-2.5">
        <ProfileMenu user={user} onLogout={onLogout} onAvatarChange={onAvatarChange} />
      </div>

      <AnimatePresence>
        {isCreateOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex items-center justify-center bg-black/50 p-4"
            onClick={onCloseCreate}
          >
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.97 }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-sm rounded-2xl border border-white/10 bg-zinc-950/95 p-4 shadow-2xl shadow-black/60"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-white">Create room</h3>
                  <p className="mt-0.5 text-xs text-zinc-600">
                    Short, memorable names work best.
                  </p>
                </div>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onCloseCreate}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-white/10 hover:text-white"
                  aria-label="Close"
                >
                  <X className="h-3.5 w-3.5" />
                </motion.button>
              </div>
              <div className="mt-4 space-y-2.5">
                <Input
                  value={newRoomName}
                  onChange={(event) => onNewRoomNameChange(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      onCreateRoom();
                    }
                    if (event.key === "Escape") {
                      onCloseCreate();
                    }
                  }}
                  placeholder="Room name"
                  autoFocus
                />
                {createError && (
                  <p className="text-xs text-red-300">{createError}</p>
                )}
                <div className="flex gap-2 pt-1">
                  <Button
                    variant="secondary"
                    className="flex-1 text-sm"
                    onClick={onCloseCreate}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 text-sm"
                    onClick={onCreateRoom}
                    disabled={isCreating}
                  >
                    {isCreating ? "Creating..." : "Create"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {menuAnchor && menuRoomId &&
        createPortal(
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: -8, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.94 }}
            className="fixed z-50 w-40 rounded-xl border border-white/10 bg-zinc-950/95 p-1.5 shadow-2xl shadow-black/50"
            style={{ left: `${menuAnchor.x}px`, top: `${menuAnchor.y}px` }}
          >
            <motion.button
              type="button"
              whileHover={{ backgroundColor: "rgba(255,255,255,0.08)" }}
              onClick={(event) => {
                event.stopPropagation();
                onLeaveRoom(menuAnchor.roomId);
                setMenuRoomId(null);
                setMenuAnchor(null);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 transition"
            >
              <UserMinus className="h-3 w-3" />
              Leave room
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ backgroundColor: "rgba(239,68,68,0.1)" }}
              onClick={(event) => {
                event.stopPropagation();
                onDeleteRoom(menuAnchor.roomId);
                setMenuRoomId(null);
                setMenuAnchor(null);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-red-300 transition"
            >
              <Trash2 className="h-3 w-3" />
              Delete room
            </motion.button>
          </motion.div>,
          document.body,
        )}
    </aside>
  );
}
