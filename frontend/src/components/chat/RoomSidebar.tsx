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
import { useMemo, useState } from "react";
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
  onRoomFilterChange,
  onNewRoomNameChange,
  onCreateRoom,
  onOpenCreate,
  onCloseCreate,
  onSelectRoom,
  onLeaveRoom,
  onDeleteRoom,
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
  onRoomFilterChange: (value: string) => void;
  onNewRoomNameChange: (value: string) => void;
  onCreateRoom: () => void;
  onOpenCreate: () => void;
  onCloseCreate: () => void;
  onSelectRoom: (room: Room) => void;
  onLeaveRoom: (roomId: string) => void;
  onDeleteRoom: (roomId: string) => void;
  onLogout: () => void;
}) {
  const [menuRoomId, setMenuRoomId] = useState<string | null>(null);
  const filteredRooms = useMemo(() => {
    if (!roomFilter.trim()) return rooms;
    const lowered = roomFilter.trim().toLowerCase();
    return rooms.filter((roomMember) =>
      roomMember.room.name.toLowerCase().includes(lowered),
    );
  }, [roomFilter, rooms]);

  return (
    <aside className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-none border-white/8 bg-[linear-gradient(180deg,rgba(24,24,27,0.88),rgba(9,9,11,0.92)_48%,rgba(12,12,16,0.95))] shadow-2xl shadow-black/35 md:rounded-3xl md:border xl:rounded-[1.7rem]">
      <div className="pointer-events-none absolute -left-24 top-8 h-44 w-44 rounded-full bg-cyan-300/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 bottom-20 h-56 w-56 rounded-full bg-violet-300/[0.07] blur-3xl" />
      <div className="pointer-events-none absolute inset-x-6 top-24 h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative border-b border-white/8 p-4">
        <div className="flex items-center gap-3">
          <PyroMark />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">Pyro</p>
            <p className="truncate text-xs text-zinc-500">Workspace</p>
          </div>
        </div>
      </div>

      <div className="relative space-y-3 border-b border-white/8 p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
          <Input
            value={roomFilter}
            onChange={(event) => onRoomFilterChange(event.target.value)}
            placeholder="Search rooms"
            className="pl-9"
          />
        </div>
        <Button
          variant="secondary"
          className="w-full rounded-2xl"
          onClick={onOpenCreate}
          disabled={isCreating}
        >
          <MessageSquarePlus className="h-4 w-4" />
          {isCreating ? "Creating..." : "New room"}
        </Button>
      </div>

      <div className="relative min-h-0 flex-1 overflow-y-auto p-3">
        <div className="mb-3 flex items-center justify-between px-2">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-600">
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
          <div className="space-y-2">
            {filteredRooms.map((roomMember, index) => {
              const room = roomMember.room;
              const active = selectedRoom?.id === room.id;
              const initial = room.name.slice(0, 1).toUpperCase();
              const unreadCount = unreadCounts[room.id] || 0;

              return (
                <motion.button
                  key={room.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.99 }}
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
                  className={cn(
                    "group relative flex w-full items-center gap-3 overflow-hidden rounded-[1.25rem] px-3 py-3 text-left text-sm transition-all duration-200",
                    active
                      ? "border border-cyan-200/15 bg-white/9 text-white shadow-[0_18px_50px_rgba(0,0,0,0.28)]"
                      : "border border-transparent text-zinc-500 hover:border-white/8 hover:bg-white/4.5 hover:text-zinc-200",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="active-room-glow"
                      className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(103,232,249,0.14),transparent_34%)]"
                    />
                  )}
                  {active && (
                    <span className="absolute left-0 top-1/2 h-7 w-0.5 -translate-y-1/2 rounded-full bg-cyan-200" />
                  )}
                  <span
                    className={cn(
                      "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border text-xs font-semibold",
                      active
                        ? "border-cyan-200/20 bg-cyan-200/10 text-cyan-100"
                        : "border-white/8 bg-white/3.5 text-zinc-500 group-hover:text-zinc-300",
                    )}
                  >
                    {active ? <Flame className="h-4 w-4" /> : initial}
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="block truncate">{room.name}</span>
                  </div>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-cyan-200/20 px-2 py-0.5 text-[11px] font-semibold text-cyan-100">
                      {unreadCount}
                    </span>
                  )}
                  <span
                    className={cn(
                      "ml-auto h-2 w-2 rounded-full transition-all",
                      active
                        ? "bg-cyan-200 shadow-[0_0_14px_rgba(103,232,249,0.62)]"
                        : "bg-white/10 group-hover:bg-white/25",
                    )}
                  />
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setMenuRoomId((current) =>
                        current === room.id ? null : room.id,
                      );
                    }}
                    className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full text-zinc-500 opacity-0 transition group-hover:opacity-100 hover:bg-white/10 hover:text-white"
                    aria-label="Room actions"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>

                  {menuRoomId === room.id && (
                    <div className="absolute right-3 top-12 z-20 w-44 rounded-2xl border border-white/10 bg-zinc-950/95 p-2 shadow-2xl shadow-black/50">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onLeaveRoom(room.id);
                          setMenuRoomId(null);
                        }}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-zinc-300 transition hover:bg-white/10"
                      >
                        <UserMinus className="h-3.5 w-3.5" />
                        Leave room
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onDeleteRoom(room.id);
                          setMenuRoomId(null);
                        }}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-red-200 transition hover:bg-red-500/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete room
                      </button>
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      <div className="relative border-t border-white/8 p-3">
        <ProfileMenu user={user} onLogout={onLogout} />
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
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-sm rounded-[1.6rem] border border-white/10 bg-zinc-950/95 p-5 shadow-2xl shadow-black/60"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-white">Create a room</h3>
                  <p className="mt-1 text-xs text-zinc-500">
                    Keep names short and memorable.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onCloseCreate}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 transition hover:bg-white/10 hover:text-white"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-4 space-y-3">
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
                  <p className="text-xs text-red-200">{createError}</p>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={onCloseCreate}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
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
    </aside>
  );
}
