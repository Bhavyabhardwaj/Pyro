import {
  MessageSquarePlus,
  MoreHorizontal,
  Trash2,
  X,
  Search,
  UserMinus,
  UserPlus,
  Compass
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
import { Avatar } from "./Avatar";
import { authService } from "../../services/auth.service";

// Helper to format timestamps cleanly
const formatMessageTime = (dateStr?: string) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }
  
  const diffTime = Math.abs(now.getTime() - d.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays < 7) {
    return d.toLocaleDateString([], { weekday: "short" });
  }
  
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
};

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
  onlineUsers = new Set<string>(),
  typingUsersByRoom = {},
  discoverRooms = [],
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
  onCreateDM,
  onJoinRoom,
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
  onlineUsers?: Set<string>;
  typingUsersByRoom?: Record<string, Set<string>>;
  discoverRooms?: Room[];
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
  onCreateDM?: (targetUserId: string) => Promise<void>;
  onJoinRoom: (roomId: string) => Promise<void>;
}) {
  const [menuRoomId, setMenuRoomId] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<{ roomId: string; x: number; y: number } | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  
  // DM Modal States
  const [isStartDMOpen, setIsStartDMOpen] = useState(false);
  const [dmSearchQuery, setDmSearchQuery] = useState("");
  const [dmUsers, setDmUsers] = useState<User[]>([]);
  const [isFetchingDmUsers, setIsFetchingDmUsers] = useState(false);
  const [selectedUserIndex, setSelectedUserIndex] = useState(0);
  const dmModalRef = useRef<HTMLDivElement | null>(null);
  const dmSearchInputRef = useRef<HTMLInputElement | null>(null);

  // Browse Channels Modal States
  const [isBrowseModalOpen, setIsBrowseModalOpen] = useState(false);
  const [browseSearchQuery, setBrowseSearchQuery] = useState("");
  const browseModalRef = useRef<HTMLDivElement | null>(null);
  const browseSearchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isBrowseModalOpen) return;
    setBrowseSearchQuery("");
    setTimeout(() => browseSearchInputRef.current?.focus(), 100);
  }, [isBrowseModalOpen]);

  // Fetch workspace users when the DM modal is opened
  useEffect(() => {
    if (!isStartDMOpen) return;
    
    const fetchUsers = async () => {
      setIsFetchingDmUsers(true);
      try {
        const response = await authService.getUsers();
        if (response.success && response.data) {
          // Filter out currently logged in user
          const filtered = response.data.filter((u) => u.id !== user?.id);
          setDmUsers(filtered);
        }
      } catch (error) {
        console.error("Error fetching workspace users for DM:", error);
      } finally {
        setIsFetchingDmUsers(false);
      }
    };
    
    fetchUsers();
    setDmSearchQuery("");
    setSelectedUserIndex(0);
    setTimeout(() => dmSearchInputRef.current?.focus(), 100);
  }, [isStartDMOpen, user]);

  // Build a username map from roomMembers to resolve typing indicators in the sidebar
  const userMap = useMemo(() => {
    const map: Record<string, User> = {};
    rooms.forEach((rm) => {
      rm.room.roomMembers?.forEach((member) => {
        map[member.user.id] = member.user;
      });
    });
    return map;
  }, [rooms]);

  // Filter and split channels and DMs
  const filteredRooms = useMemo(() => {
    if (!roomFilter.trim()) return rooms;
    const lowered = roomFilter.trim().toLowerCase();
    return rooms.filter((roomMember) => {
      const r = roomMember.room;
      if (r.isDM && user) {
        const otherMember = r.roomMembers?.find((m) => m.user.id !== user.id);
        if (otherMember && otherMember.user.username.toLowerCase().includes(lowered)) {
          return true;
        }
      }
      return r.name.toLowerCase().includes(lowered);
    });
  }, [roomFilter, rooms, user]);

  const channels = useMemo(() => {
    return filteredRooms.filter((rm) => !rm.room.isDM);
  }, [filteredRooms]);

  const dms = useMemo(() => {
    return filteredRooms.filter((rm) => rm.room.isDM);
  }, [filteredRooms]);

  // Filtered and sorted users list for starting DMs
  const filteredDmUsers = useMemo(() => {
    const query = dmSearchQuery.trim().toLowerCase();
    let result = dmUsers;
    if (query) {
      result = dmUsers.filter(
        (u) =>
          u.username.toLowerCase().includes(query) ||
          (u.email && u.email.toLowerCase().includes(query))
      );
    }
    // Sort online users first
    return [...result].sort((a, b) => {
      const aOnline = onlineUsers.has(a.id) ? 1 : 0;
      const bOnline = onlineUsers.has(b.id) ? 1 : 0;
      return bOnline - aOnline;
    });
  }, [dmUsers, dmSearchQuery, onlineUsers]);

  const filteredDiscoverRooms = useMemo(() => {
    const query = roomFilter.trim().toLowerCase();
    if (!query) return [];
    return discoverRooms.filter((room) => {
      if (room.isDM) return false;
      const isMember = rooms.some((r) => r.room.id === room.id);
      if (isMember) return false;
      return room.name.toLowerCase().includes(query);
    });
  }, [roomFilter, discoverRooms, rooms]);

  const filteredBrowseRooms = useMemo(() => {
    const query = browseSearchQuery.trim().toLowerCase();
    const publicRooms = discoverRooms.filter((r) => !r.isDM);
    if (!query) return publicRooms;
    return publicRooms.filter((r) => r.name.toLowerCase().includes(query));
  }, [browseSearchQuery, discoverRooms]);

  // Keyboard navigation inside Start DM Modal
  useEffect(() => {
    if (!isStartDMOpen || filteredDmUsers.length === 0) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedUserIndex((prev) => (prev + 1) % filteredDmUsers.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedUserIndex((prev) => (prev - 1 + filteredDmUsers.length) % filteredDmUsers.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        const targetUser = filteredDmUsers[selectedUserIndex];
        if (targetUser && onCreateDM) {
          onCreateDM(targetUser.id);
          setIsStartDMOpen(false);
        }
      } else if (e.key === "Escape") {
        setIsStartDMOpen(false);
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isStartDMOpen, filteredDmUsers, selectedUserIndex, onCreateDM]);

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

  const renderRoomRow = (room: Room, index: number, isDM: boolean) => {
    const active = selectedRoom?.id === room.id;
    const unreadCount = unreadCounts[room.id] || 0;
    const displayUnread = unreadCount > 99 ? "99+" : unreadCount;

    // Resolve details dynamically based on whether it is a DM or Channel
    let displayName = room.name;
    let displayAvatar = room.name;
    let isOnline = false;
    let otherUser: User | undefined;

    if (isDM) {
      const otherMember = room.roomMembers?.find((m) => m.user.id !== user?.id);
      if (otherMember) {
        otherUser = otherMember.user;
        displayName = otherUser.username;
        displayAvatar = otherUser.username;
        isOnline = onlineUsers.has(otherUser.id);
      }
    } else {
      // General channel online rule or index-based fallback for realism
      isOnline = index % 3 === 0;
    }

    // Typing state for this specific room
    const typingIds = Array.from(typingUsersByRoom[room.id] ?? new Set<string>());
    const activeTypers = typingIds.filter((id) => id !== user?.id);
    const isTyping = activeTypers.length > 0;
    const typingText = isTyping
      ? activeTypers.map((id) => userMap[id]?.username || "Someone").join(", ") + " is typing..."
      : "";

    // Parse latest real message
    const lastMsg = room.lastMessage;
    const hasLastMsg = !!lastMsg;
    const lastMsgSender = lastMsg?.author.id === user?.id ? "You" : lastMsg?.author.username;
    
    // Preview Content & time
    const previewText = isTyping
      ? typingText
      : hasLastMsg
      ? `${lastMsgSender}: ${lastMsg.content}`
      : "No messages yet";
    
    const previewTime = lastMsg ? formatMessageTime(lastMsg.createdAt) : "";

    return (
      <motion.div
        key={room.id}
        role="button"
        tabIndex={0}
        initial={{ opacity: 0, y: 3 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: index * 0.015,
          type: "spring",
          stiffness: 400,
          damping: 30,
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
          "group relative flex w-full items-center gap-2.5 rounded-lg p-2 text-left transition-all duration-150 cursor-pointer select-none",
          active
            ? "bg-[rgba(242,242,239,0.055)] text-[var(--text-primary)] shadow-[inset_0_1px_0_rgba(255,255,255,0.02),0_4px_12px_rgba(0,0,0,0.2)]"
            : "text-[var(--text-secondary)] hover:bg-[rgba(242,242,239,0.02)] hover:text-[var(--text-primary)]",
        )}
      >
        {/* Subtle Glow & Active line indicator */}
        {active && (
          <span className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full bg-[var(--accent-teal)] opacity-90 shadow-[0_0_8px_rgba(45,212,191,0.3)]" />
        )}

        {/* LEFT: Avatar & online indicator */}
        <Avatar
          name={displayAvatar}
          size="sm"
          showStatus={true}
          isOnline={isOnline}
          className="shrink-0"
        />

        {/* CENTER: Name & message preview */}
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between">
            <span className={cn(
              "block truncate text-[11.5px] tracking-tight font-medium",
              active ? "text-[var(--text-primary)]" : "text-neutral-300 group-hover:text-[var(--text-primary)]",
              unreadCount > 0 && "font-semibold text-[var(--text-primary)]"
            )}>
              {displayName}
            </span>
            {/* RIGHT: Timestamp */}
            {previewTime && (
              <span className="text-[9.5px] text-[var(--text-muted)] ml-2 shrink-0 font-normal">
                {previewTime}
              </span>
            )}
          </div>
          <p className={cn(
            "truncate text-[10px] mt-0.5 leading-normal pr-3",
            isTyping 
              ? "text-[var(--accent-teal)] font-medium animate-pulse" 
              : unreadCount > 0 
              ? "text-neutral-200 font-semibold" 
              : "text-[var(--text-muted)]"
          )}>
            {previewText}
          </p>
        </div>

        {/* RIGHT Side Badges and Menu Actions */}
        <div className="flex items-center gap-1.5 shrink-0 ml-1.5">
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="rounded-full bg-teal-500/20 px-1.5 py-0.5 text-[8.5px] font-semibold text-[var(--accent-teal)]"
            >
              {displayUnread}
            </motion.span>
          )}

          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(event) => {
              event.stopPropagation();
              const target = event.currentTarget as HTMLElement;
              const rect = target.getBoundingClientRect();
              const menuWidth = 144;
              const menuHeight = 90;
              const nextX = Math.min(
                Math.max(12, rect.right - menuWidth),
                window.innerWidth - menuWidth - 12,
              );
              const nextY = Math.min(
                rect.bottom + 6,
                window.innerHeight - menuHeight - 12,
              );
              setMenuRoomId((current) => (current === room.id ? null : room.id));
              setMenuAnchor((current) =>
                current?.roomId === room.id
                  ? null
                  : { roomId: room.id, x: nextX, y: nextY },
              );
            }}
            className="relative z-10 flex h-5 w-5 items-center justify-center rounded text-[var(--text-muted)] opacity-0 transition duration-150 group-hover:opacity-100 hover:bg-white/5 hover:text-[var(--text-primary)]"
            aria-label="Room actions"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </motion.button>
        </div>
      </motion.div>
    );
  };

  return (
    <aside className="relative flex h-full min-h-0 flex-col overflow-hidden border-[var(--border-muted)] bg-gradient-to-b from-[rgba(22,22,21,0.94)] to-[rgba(16,16,15,0.98)] shadow-[0_20px_50px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.015)] md:rounded-[1.25rem] md:border backdrop-blur-2xl">
      {/* Top Brand Section - Extremely Compact */}
      <div className="relative border-b border-[var(--border-muted)] px-3.5 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PyroMark className="h-7 w-7" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-medium tracking-tight text-[var(--text-primary)]">Pyro</span>
                <span className="text-[10px] text-[var(--text-muted)]">•</span>
                <div className="flex items-center gap-1" title={`${onlineUsersCount} online`}>
                  <span className="relative flex h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]" />
                  <span className="text-[10px] text-[var(--text-secondary)] font-medium">
                    {onlineUsersCount}
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-[var(--text-muted)] leading-none mt-0.5">Workspace Channels</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Action Bar */}
      <div className="relative space-y-2 border-b border-[var(--border-muted)] p-2.5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]" />
          <Input
            value={roomFilter}
            onChange={(event) => onRoomFilterChange(event.target.value)}
            placeholder="Search channels & DMs"
            className="h-8 pl-8 text-xs border-[var(--border-muted)] bg-[var(--bg-charcoal)] placeholder:text-[var(--text-muted)] focus:border-[var(--border-subtle)] focus:ring-0"
          />
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <Button
              variant="secondary"
              className="h-7.5 w-full rounded-lg text-[10.5px] font-normal border border-[var(--border-muted)] bg-[var(--bg-charcoal)] hover:bg-[var(--bg-graphite-light)] text-[var(--text-secondary)] flex items-center justify-center gap-1"
              onClick={onOpenCreate}
              disabled={isCreating}
            >
              <MessageSquarePlus className="h-3 w-3 text-[var(--text-secondary)]" />
              Channel
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <Button
              variant="secondary"
              className="h-7.5 w-full rounded-lg text-[10.5px] font-normal border border-[var(--border-muted)] bg-[var(--bg-charcoal)] hover:bg-[var(--bg-graphite-light)] text-[var(--text-secondary)] flex items-center justify-center gap-1"
              onClick={() => setIsStartDMOpen(true)}
            >
              <UserPlus className="h-3 w-3 text-[var(--text-secondary)]" />
              Direct Message
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Dense Scannable Room list */}
      <div className="relative min-h-0 flex-1 overflow-y-auto timeline-scrollbar p-1.5 space-y-4">
        {isLoading ? (
          <div className="space-y-1.5 p-1">
            {[0, 1, 2, 3, 4].map((item) => (
              <Skeleton key={item} className="h-10 rounded-lg bg-[var(--bg-charcoal)]" />
            ))}
          </div>
        ) : (filteredRooms.length === 0 && filteredDiscoverRooms.length === 0) ? (
          <div className="m-2 rounded-xl border border-dashed border-[var(--border-muted)] p-4 text-center text-xs text-[var(--text-muted)] leading-relaxed bg-[var(--bg-charcoal)] space-y-2.5">
            <div>No matches. Start a channel or DM to begin.</div>
            <Button
              variant="secondary"
              size="sm"
              className="h-7 mx-auto flex items-center gap-1 rounded bg-[var(--bg-graphite)] border border-[var(--border-muted)] hover:bg-[var(--bg-graphite-light)] text-[10px] text-[var(--text-secondary)] hover:text-white"
              onClick={() => setIsBrowseModalOpen(true)}
            >
              <Compass className="h-3 w-3" />
              Browse Public Channels
            </Button>
          </div>
        ) : (
          <>
            {/* CHANNELS SECTION */}
            {(channels.length > 0 || !roomFilter.trim()) && (
              <div>
                <div className="mb-1 flex items-center justify-between px-2 pt-1">
                  <span className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                    Channels
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsBrowseModalOpen(true)}
                    className="flex items-center gap-0.5 text-[9px] font-medium text-[var(--text-secondary)] hover:text-white transition duration-150"
                  >
                    <Compass className="h-2.5 w-2.5" />
                    Browse
                  </button>
                </div>
                <div className="space-y-0.5">
                  {channels.length === 0 ? (
                    <div
                      onClick={() => setIsBrowseModalOpen(true)}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[11px] text-[var(--text-muted)] hover:bg-white/4 cursor-pointer transition"
                    >
                      <Compass className="h-3.5 w-3.5" />
                      <span>Browse public channels...</span>
                    </div>
                  ) : (
                    channels.map((rm, idx) => renderRoomRow(rm.room, idx, false))
                  )}
                </div>
              </div>
            )}

            {/* DIRECT MESSAGES SECTION */}
            {dms.length > 0 && (
              <div>
                <div className="mb-1 flex items-center justify-between px-2 pt-1">
                  <span className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                    Direct Messages
                  </span>
                  <span className="text-[9px] text-[var(--text-muted)]">{dms.length}</span>
                </div>
                <div className="space-y-0.5">
                  {dms.map((rm, idx) => renderRoomRow(rm.room, idx, true))}
                </div>
              </div>
            )}

            {/* DISCOVERABLE CHANNELS SECTION (SEARCH MATCHES) */}
            {filteredDiscoverRooms.length > 0 && (
              <div>
                <div className="mb-1 flex items-center justify-between px-2 pt-1">
                  <span className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                    Public Channels to Join
                  </span>
                  <span className="text-[9px] text-[var(--text-muted)]">{filteredDiscoverRooms.length}</span>
                </div>
                <div className="space-y-0.5">
                  {filteredDiscoverRooms.map((room) => (
                    <motion.div
                      key={room.id}
                      initial={{ opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group flex w-full items-center justify-between gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-[11.5px] font-medium transition duration-150 ease-out hover:bg-white/4 text-[var(--text-secondary)] hover:text-white"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded border border-[var(--border-muted)] bg-[var(--bg-charcoal)] text-[10px] text-[var(--text-muted)]">
                          #
                        </span>
                        <span className="truncate">{room.name}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onJoinRoom(room.id)}
                        className="h-5 px-2 rounded text-[10px] bg-[var(--bg-charcoal)] hover:bg-[var(--bg-graphite-light)] border border-[var(--border-muted)] text-[var(--text-secondary)] hover:text-white opacity-90 group-hover:opacity-100 transition"
                      >
                        Join
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Profile Section */}
      <div className="relative border-t border-[var(--border-muted)] p-2">
        <ProfileMenu user={user} onLogout={onLogout} onAvatarChange={onAvatarChange} />
      </div>

      {/* New Room Modal Dialog with Premium Glassmorphism */}
      <AnimatePresence>
        {isCreateOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3"
            onClick={onCloseCreate}
          >
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-[280px] rounded-xl border border-[var(--border-subtle)] bg-[rgba(22,22,21,0.92)] p-4 shadow-2xl shadow-black/80 backdrop-blur-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-[var(--text-primary)]">New channel</h3>
                  <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">
                    Create a workspace channel.
                  </p>
                </div>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onCloseCreate}
                  className="flex h-6 w-6 items-center justify-center rounded text-[var(--text-muted)] hover:bg-white/5 hover:text-[var(--text-primary)]"
                  aria-label="Close"
                >
                  <X className="h-3 w-3" />
                </motion.button>
              </div>
              <div className="mt-3.5 space-y-2.5">
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
                  placeholder="e.g. general"
                  className="h-8 text-xs bg-[var(--bg-charcoal)] border-[var(--border-muted)] placeholder:text-[var(--text-muted)] focus:border-[var(--border-subtle)]"
                  autoFocus
                />
                {createError && (
                  <p className="text-[10px] text-red-400">{createError}</p>
                )}
                <div className="flex gap-1.5 pt-1">
                  <Button
                    variant="secondary"
                    className="flex-1 h-7.5 text-[11px] font-normal border border-[var(--border-muted)] bg-transparent hover:bg-white/5"
                    onClick={onCloseCreate}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 h-7.5 text-[11px] font-normal bg-[var(--text-primary)] text-black hover:bg-white"
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

      {/* START DIRECT MESSAGE MODAL (Premium Glassmorphism Overlay) */}
      <AnimatePresence>
        {isStartDMOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3"
            onClick={() => setIsStartDMOpen(false)}
          >
            <motion.div
              ref={dmModalRef}
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-[280px] h-[340px] flex flex-col rounded-xl border border-[var(--border-subtle)] bg-[rgba(22,22,21,0.92)] p-4 shadow-2xl shadow-black/80 backdrop-blur-md"
            >
              <div className="flex items-center justify-between shrink-0 mb-3">
                <div>
                  <h3 className="text-xs font-semibold text-[var(--text-primary)]">Direct message</h3>
                  <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">
                    Start a conversation with a teammate.
                  </p>
                </div>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsStartDMOpen(false)}
                  className="flex h-6 w-6 items-center justify-center rounded text-[var(--text-muted)] hover:bg-white/5 hover:text-[var(--text-primary)]"
                  aria-label="Close"
                >
                  <X className="h-3 w-3" />
                </motion.button>
              </div>

              {/* DM Search input */}
              <div className="relative shrink-0 mb-2">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]" />
                <Input
                  ref={dmSearchInputRef}
                  value={dmSearchQuery}
                  onChange={(e) => {
                    setDmSearchQuery(e.target.value);
                    setSelectedUserIndex(0);
                  }}
                  placeholder="Type a username or email..."
                  className="h-8 pl-8 text-xs bg-[var(--bg-charcoal)] border-[var(--border-muted)] placeholder:text-[var(--text-muted)] focus:border-[var(--border-subtle)]"
                />
              </div>

              {/* DM User selector list */}
              <div className="flex-1 min-h-0 overflow-y-auto timeline-scrollbar space-y-0.5">
                {isFetchingDmUsers ? (
                  <div className="space-y-1.5 pt-1">
                    {[0, 1, 2].map((item) => (
                      <Skeleton key={item} className="h-9 rounded-lg bg-[var(--bg-charcoal)]" />
                    ))}
                  </div>
                ) : filteredDmUsers.length === 0 ? (
                  <div className="py-8 text-center text-[10.5px] text-[var(--text-muted)]">
                    No matching users found
                  </div>
                ) : (
                  filteredDmUsers.map((targetUser, idx) => {
                    const isSelected = idx === selectedUserIndex;
                    const isOnline = onlineUsers.has(targetUser.id);
                    return (
                      <div
                        key={targetUser.id}
                        onClick={() => {
                          if (onCreateDM) {
                            onCreateDM(targetUser.id);
                            setIsStartDMOpen(false);
                          }
                        }}
                        onMouseEnter={() => setSelectedUserIndex(idx)}
                        className={cn(
                          "flex items-center gap-2.5 rounded-lg p-2 text-left cursor-pointer transition-all duration-150 select-none",
                          isSelected
                            ? "bg-[rgba(242,242,239,0.055)] text-[var(--text-primary)]"
                            : "text-[var(--text-secondary)] hover:bg-[rgba(242,242,239,0.02)] hover:text-[var(--text-primary)]"
                        )}
                      >
                        <Avatar
                          name={targetUser.username}
                          size="sm"
                          showStatus={true}
                          isOnline={isOnline}
                        />
                        <div className="min-w-0 flex-1">
                          <span className="block truncate text-[11px] font-medium text-[var(--text-primary)]">
                            {targetUser.username}
                          </span>
                          {targetUser.email && (
                            <span className="block truncate text-[9px] text-[var(--text-muted)]">
                              {targetUser.email}
                            </span>
                          )}
                        </div>
                        {isOnline && (
                          <span className="rounded-full bg-emerald-500/20 px-1 py-0.5 text-[8px] font-semibold text-emerald-400">
                            Online
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BROWSE CHANNELS MODAL (Premium Glassmorphism Overlay) */}
      <AnimatePresence>
        {isBrowseModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3"
            onClick={() => setIsBrowseModalOpen(false)}
          >
            <motion.div
              ref={browseModalRef}
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-[290px] h-[360px] flex flex-col rounded-xl border border-[var(--border-subtle)] bg-[rgba(22,22,21,0.92)] p-4 shadow-2xl shadow-black/80 backdrop-blur-md"
            >
              <div className="flex items-center justify-between shrink-0 mb-3">
                <div>
                  <h3 className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1">
                    <Compass className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
                    Browse Channels
                  </h3>
                  <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">
                    Find and join public channels.
                  </p>
                </div>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsBrowseModalOpen(false)}
                  className="flex h-6 w-6 items-center justify-center rounded text-[var(--text-muted)] hover:bg-white/5 hover:text-[var(--text-primary)]"
                  aria-label="Close"
                >
                  <X className="h-3 w-3" />
                </motion.button>
              </div>

              {/* Browse Search input */}
              <div className="relative shrink-0 mb-2">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]" />
                <Input
                  ref={browseSearchInputRef}
                  value={browseSearchQuery}
                  onChange={(e) => setBrowseSearchQuery(e.target.value)}
                  placeholder="Search channels..."
                  className="h-8 pl-8 text-xs bg-[var(--bg-charcoal)] border-[var(--border-muted)] placeholder:text-[var(--text-muted)] focus:border-[var(--border-subtle)]"
                />
              </div>

              {/* Browse Channels selector list */}
              <div className="flex-1 min-h-0 overflow-y-auto timeline-scrollbar space-y-1 p-0.5">
                {filteredBrowseRooms.length === 0 ? (
                  <div className="py-12 text-center text-[10.5px] text-[var(--text-muted)]">
                    No channels found
                  </div>
                ) : (
                  filteredBrowseRooms.map((room) => {
                    const isJoined = rooms.some((rm) => rm.room.id === room.id);
                    return (
                      <div
                        key={room.id}
                        className="flex items-center justify-between gap-3 rounded-lg p-2 transition bg-[rgba(255,255,255,0.015)] border border-white/2"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1 text-[11px] font-medium text-[var(--text-primary)]">
                            <span className="text-[var(--text-muted)]">#</span>
                            <span className="truncate">{room.name}</span>
                          </div>
                          <span className="block text-[8.5px] text-[var(--text-muted)] mt-0.5">
                            {room.roomMembers?.length || 1} teammates
                          </span>
                        </div>
                        {isJoined ? (
                          <span className="text-[9px] font-medium text-[var(--text-muted)] bg-white/5 border border-white/5 px-2 py-0.5 rounded">
                            Joined
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => {
                              onJoinRoom(room.id);
                              setIsBrowseModalOpen(false);
                            }}
                            className="h-5 px-2.5 rounded text-[9.5px] bg-white text-black hover:bg-zinc-200 transition font-normal"
                          >
                            Join
                          </Button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Popover Menu */}
      {menuAnchor && menuRoomId &&
        createPortal(
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="fixed z-50 w-36 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(22,22,21,0.92)] p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.02)] backdrop-blur-2xl"
            style={{ left: `${menuAnchor.x}px`, top: `${menuAnchor.y}px` }}
          >
            <motion.button
              type="button"
              whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.045)", color: "var(--text-primary)" }}
              onClick={(event) => {
                event.stopPropagation();
                onLeaveRoom(menuAnchor.roomId);
                setMenuRoomId(null);
                setMenuAnchor(null);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] font-medium tracking-tight text-[var(--text-secondary)] transition-all duration-150"
            >
              <UserMinus className="h-3.5 w-3.5 text-[var(--text-muted)]" />
              Leave
            </motion.button>
            <div className="my-1 h-px bg-[var(--border-muted)]" />
            <motion.button
              type="button"
              whileHover={{ backgroundColor: "rgba(239, 68, 68, 0.08)", color: "#f87171" }}
              onClick={(event) => {
                event.stopPropagation();
                onDeleteRoom(menuAnchor.roomId);
                setMenuRoomId(null);
                setMenuAnchor(null);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] font-medium tracking-tight text-red-400/90 transition-all duration-150"
            >
              <Trash2 className="h-3.5 w-3.5 text-red-400/70" />
              Delete
            </motion.button>
          </motion.div>,
          document.body,
        )}
    </aside>
  );
}
