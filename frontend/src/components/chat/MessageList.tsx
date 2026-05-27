import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  Copy,
  CornerUpLeft,
  FileText,
  MessageSquareText,
  Pencil,
  SmilePlus,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import EmojiPicker, {
  EmojiStyle,
  Theme,
  type EmojiClickData,
} from "emoji-picker-react";
import type { ChatMessage } from "../../types/chat";
import type { Room } from "../../types/api";
import { Skeleton } from "../ui/skeleton";
import { Avatar } from "./Avatar";
import { cn } from "../../lib/utils";

function formatTime(value?: string) {
  if (!value) return "now";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "now";
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatFileSize(bytes: number) {
  if (!Number.isFinite(bytes)) return "";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let index = 0;
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024;
    index += 1;
  }
  return `${size.toFixed(size >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

const EDIT_WINDOW_MS = 1000 * 60 * 15;

function isEditWindowOpen(createdAt?: string) {
  if (!createdAt) return false;
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return false;
  return Date.now() - created.getTime() <= EDIT_WINDOW_MS;
}

export function MessageList({
  messages,
  isLoading,
  currentUserId,
  currentUsername,
  currentUserAvatar,
  onDelete,
  onEdit,
  onReply,
  onToggleReaction,
  typingUsers: _typingUsers,
  onlineUsers = new Set(),
  isFetchingOlder = false,
  onRetry,
  lastReadByUser = {},
  selectedRoom,
}: {
  messages: ChatMessage[];
  isLoading: boolean;
  currentUserId?: string;
  currentUsername?: string;
  currentUserAvatar?: string;
  onlineUsers?: Set<string>;
  onDelete: (messageId: string) => void;
  onEdit: (message: ChatMessage) => void;
  onReply: (message: ChatMessage) => void;
  onToggleReaction: (messageId: string, emoji: string) => void;
  typingUsers?: string[];
  isFetchingOlder?: boolean;
  onRetry?: (tempId: string) => void;
  lastReadByUser?: Record<string, { messageId: string; createdAt: string }>;
  selectedRoom?: Room | null;
}) {
  const [reactionPickerId, setReactionPickerId] = useState<string | null>(null);
  const reactionPickerRef = useRef<HTMLDivElement | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{
    src: string;
    name: string;
  } | null>(null);
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const isSameAuthor = (a?: ChatMessage, b?: ChatMessage) => {
    if (!a || !b) return false;
    if (a.author.id && b.author.id) return a.author.id === b.author.id;
    return a.author.username === b.author.username;
  };

  const lastSelfIndex = messages.reduce((lastIndex, message, index) => {
    const isSelf = Boolean(
      (currentUserId && message.author.id === currentUserId) ||
        (currentUsername && message.author.username === currentUsername),
    );
    if (isSelf && !message.isPending && !message.isFailed) return index;
    return lastIndex;
  }, -1);

  useEffect(() => {
    if (!reactionPickerId) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setReactionPickerId(null);
      }
    };
    const handlePointerDown = (event: PointerEvent) => {
      if (!reactionPickerRef.current) return;
      if (!reactionPickerRef.current.contains(event.target as Node)) {
        setReactionPickerId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("pointerdown", handlePointerDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [reactionPickerId]);

  const handleReactionClick = (messageId: string, emojiData: EmojiClickData) => {
    onToggleReaction(messageId, emojiData.emoji);
    setReactionPickerId(null);
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 p-5">
        {[0, 1, 2].map((item) => (
          <motion.div
            key={item}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: item * 0.08 }}
            className="flex gap-3"
          >
            <Skeleton className="h-8 w-8 rounded-full bg-[var(--bg-graphite-light)]" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-24 rounded bg-[var(--bg-graphite-light)]" />
              <Skeleton className="h-10 max-w-lg rounded-lg bg-[var(--bg-graphite-light)]" />
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="relative flex h-full items-center justify-center p-6 text-center select-none">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(242,242,239,0.015),transparent_45%)]" />
        <div className="relative max-w-sm">
          <div className="mx-auto mb-4.5 flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border-muted)] bg-[var(--bg-charcoal)] shadow-[0_8px_20px_rgba(0,0,0,0.35)]">
            <MessageSquareText className="h-5.5 w-5.5 text-[var(--text-secondary)]" />
          </div>
          <h2 className="text-sm font-medium tracking-tight text-[var(--text-primary)]">
            Start the conversation
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-[var(--text-secondary)]">
            Say hello to break the ice. Every great conversation in this channel starts with a single message.
          </p>
          <div className="mt-5.5 flex flex-wrap items-center justify-center gap-1.5">
            <span className="rounded-md border border-[var(--border-muted)] bg-white/2 px-2.5 py-0.5 text-[10px] text-[var(--text-secondary)]">
              Realtime synced
            </span>
            <span className="rounded-md border border-[var(--border-muted)] bg-white/2 px-2.5 py-0.5 text-[10px] text-[var(--text-secondary)]">
              Glass composer
            </span>
            <span className="rounded-md border border-[var(--border-muted)] bg-white/2 px-2.5 py-0.5 text-[10px] text-[var(--text-secondary)]">
              Subtle motion
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative mx-auto max-w-3xl space-y-0 px-4 py-4 md:px-6"
      onClick={() => setActiveMessageId(null)}
    >
      {activeMessageId && (
        <div 
          className="fixed inset-0 z-30 bg-black/15 backdrop-blur-[0.5px] md:hidden"
          onClick={(e) => {
            e.stopPropagation();
            setActiveMessageId(null);
          }}
        />
      )}
      <AnimatePresence>
        {isFetchingOlder && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex justify-center py-2"
          >
            <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)] select-none">
              <svg className="animate-spin h-3.5 w-3.5 text-[var(--text-muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Loading history...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="relative space-y-0.5">
        {messages.map((message, index) => {
          const previous = messages[index - 1];
          const sameAuthor = isSameAuthor(previous, message);
          const previousAt = previous?.createdAt ? new Date(previous.createdAt) : null;
          const currentAt = message.createdAt ? new Date(message.createdAt) : null;
          const withinWindow =
            previousAt && currentAt
              ? currentAt.getTime() - previousAt.getTime() < 1000 * 60 * 5
              : false;
          const grouped = sameAuthor && withinWindow;
          const isCurrentUser = Boolean(
            (currentUserId && message.author.id === currentUserId) ||
              (currentUsername && message.author.username === currentUsername),
          );
          const canEdit = Boolean(isCurrentUser && isEditWindowOpen(message.createdAt));
          const editExpired = Boolean(isCurrentUser && !canEdit);

          // Derived receipt state for the last outgoing message in the timeline
          const isLastOutgoing = index === lastSelfIndex && isCurrentUser;
          let receiptStatus: "sending" | "failed" | "seen" | "delivered" | null = null;
          let seenCount = 0;

          if (isLastOutgoing) {
            if (message.isPending || message.status === "sending") {
              receiptStatus = "sending";
            } else if (message.isFailed || message.status === "failed") {
              receiptStatus = "failed";
            } else {
              if (message.createdAt) {
                const msgTime = new Date(message.createdAt).getTime();
                Object.entries(lastReadByUser).forEach(([uid, state]) => {
                  if (uid !== currentUserId && state.createdAt) {
                    const readTime = new Date(state.createdAt).getTime();
                    if (readTime >= msgTime) {
                      seenCount++;
                    }
                  }
                });
              }
              receiptStatus = seenCount > 0 ? "seen" : "delivered";
            }
          }

          return (
            <motion.div
              key={`${message.id}-${index}`}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className={cn(
                "group relative grid w-full grid-cols-[32px_minmax(0,1fr)] items-start gap-2.5 rounded-xl px-2 transition-all duration-150 hover:bg-[rgba(242,242,239,0.012)]",
                grouped ? "mt-0.5 py-0.5 animate-none" : "mt-4 py-1",
                activeMessageId === message.id && "bg-[rgba(242,242,239,0.02)]"
              )}
              onClick={(e) => {
                e.stopPropagation();
                setActiveMessageId((prev) => (prev === message.id ? null : message.id));
              }}
            >
              {/* LEFT Side: Avatar columns */}
              <div className="flex h-6 w-8 items-start justify-start select-none">
                {grouped ? (
                  // compact timestamp on hover for grouped consecutive messages
                  <span className="opacity-0 group-hover:opacity-100 text-[8.5px] font-normal text-[var(--text-muted)] mt-1.5 transition-opacity duration-100 leading-none">
                    {formatTime(message.createdAt)}
                  </span>
                ) : (
                  <Avatar
                    name={message.author.username}
                    src={isCurrentUser ? currentUserAvatar ?? message.author.avatar : message.author.avatar}
                    size="sm"
                    showStatus={true}
                    isOnline={isCurrentUser ? true : (message.author.id ? onlineUsers.has(message.author.id) : false)}
                  />
                )}
              </div>

              {/* RIGHT Side: Username, bubble, contents */}
              <div className="min-w-0 flex flex-col items-start w-full">
                {/* Header (Username & time) - rendered only once per group */}
                {!grouped && (
                  <div className="flex items-baseline gap-2 px-0.5 pb-0.5">
                    <span className="text-[12px] font-medium text-[var(--text-primary)]">
                      {message.author.username}
                    </span>
                    {isCurrentUser && (
                      <span className="rounded bg-teal-500/10 px-1 py-0.2 text-[8px] uppercase font-semibold text-[var(--accent-teal)] tracking-wide">
                        You
                      </span>
                    )}
                    <span className="text-[9.5px] text-[var(--text-muted)] font-normal">
                      {formatTime(message.createdAt)}
                    </span>
                    {(message.editedAt || message.isEdited) && (
                      <span className="text-[9px] text-[var(--text-muted)] font-normal">
                        (edited)
                      </span>
                    )}
                  </div>
                )}

                {/* Unified bubble row container */}
                <div className="relative group/bubble flex items-center w-full">
                  {/* Bubble wrapper */}
                  <div
                    className={cn(
                      "relative inline-flex max-w-[76%] flex-col rounded-2xl border px-3.5 py-2 transition-all duration-200 text-[var(--text-primary)] shadow-[inset_0_1px_0_rgba(255,255,255,0.015),0_4px_16px_rgba(0,0,0,0.2)] backdrop-blur-md",
                      isCurrentUser
                        ? "bg-[rgba(242,242,239,0.065)] border-[rgba(255,255,255,0.085)] ml-2.5" // Outgoing offset & warmer graphite tone
                        : "bg-[rgba(242,242,239,0.028)] border-[var(--border-muted)]"       // Incoming
                    )}
                  >
                    {/* Reply Indicator Preview inside bubble */}
                    {message.replyTo && (
                      <div className="mb-1.5 rounded border border-[var(--border-muted)] bg-white/2 px-2 py-1 text-[10.5px] text-[var(--text-secondary)] transition hover:bg-white/4">
                        <div className="flex items-center gap-1.5">
                          <span className="self-stretch w-[2px] rounded-full bg-[var(--accent-teal)]" />
                          <div className="min-w-0">
                            <p className="truncate text-[9.5px] font-semibold text-[var(--text-primary)]">
                              {message.replyTo.author.username}
                            </p>
                            <p className="truncate text-[9.5px] text-[var(--text-secondary)] mt-0.5">
                              {message.replyTo.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Message content */}
                    {message.content && (
                      <p className={cn(
                        "whitespace-pre-wrap text-[12.5px] leading-relaxed font-normal",
                        message.isDeleted 
                          ? "text-[var(--text-muted)] italic font-light select-none" 
                          : "text-neutral-200"
                      )}>
                        {message.content}
                      </p>
                    )}



                    {/* Attachments rendering */}
                    {!message.isDeleted && message.attachments && message.attachments.length > 0 && (
                      <div className="mt-2 grid gap-1.5 max-w-sm">
                        {message.attachments.map((attachment) => {
                          const name = (attachment as any).fileName || (attachment as any).name || "File";
                          const size = (attachment as any).fileSize !== undefined ? (attachment as any).fileSize : ((attachment as any).size !== undefined ? (attachment as any).size : 0);
                          const url = attachment.url;
                          const mime = (attachment as any).mimeType || (attachment as any).mime || "";
                          const isImage = mime.startsWith("image/") || (attachment as any).kind === "image" || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name || url);

                          return (
                            <div
                              key={attachment.id}
                              className="group/attachment relative overflow-hidden rounded-lg border border-[var(--border-muted)] bg-[var(--bg-charcoal)] transition duration-150"
                            >
                              {isImage ? (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setLightboxImage({
                                      src: url,
                                      name: name,
                                    });
                                  }}
                                  className="relative block w-full focus:outline-none"
                                >
                                  <img
                                    src={url}
                                    alt={name}
                                    className="h-28 w-full object-cover transition-opacity duration-150 hover:opacity-90"
                                  />
                                </button>
                              ) : (
                                <div className="flex items-center gap-2.5 px-2.5 py-1.5">
                                  <div className="flex h-7 w-7 items-center justify-center rounded bg-white/5">
                                    <FileText className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-[10.5px] text-[var(--text-primary)]">
                                      {name}
                                    </p>
                                    <p className="text-[9.5px] text-[var(--text-muted)]">
                                      {formatFileSize(size)}
                                    </p>
                                  </div>
                                  <a
                                    href={url}
                                    download={name}
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="rounded border border-[var(--border-muted)] px-2 py-0.5 text-[9px] text-[var(--text-secondary)] transition hover:border-[var(--border-subtle)] hover:bg-white/5 hover:text-[var(--text-primary)]"
                                  >
                                    Download
                                  </a>
                                </div>
                              )}
                              {message.isPending && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-[9.5px] text-[var(--text-secondary)]">
                                  Sending...
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Slack/Discord style glass emoji reactions */}
                    {!message.isDeleted && message.reactions && message.reactions.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {message.reactions.map((reaction) => (
                          <button
                            key={reaction.emoji}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleReaction(message.id, reaction.emoji);
                            }}
                            className={cn(
                              "group/reaction inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9.5px] transition-all duration-150 hover:scale-103",
                              reaction.reacted
                                ? "bg-[var(--accent-teal-muted)] border border-[rgba(45,212,191,0.25)] text-[var(--accent-teal)]"
                                : "bg-[rgba(242,242,239,0.03)] border border-[var(--border-muted)] text-[var(--text-secondary)] hover:border-[var(--border-subtle)] hover:bg-white/5"
                            )}
                          >
                            <span className="text-[10px]">{reaction.emoji}</span>
                            <span className="font-medium text-[9px]">{reaction.count}</span>
                          </button>
                        ))}
                      </div>
                    )}


                  </div>
                  {/* Hover toolbar (Compact floating action bar on right side of message cell) */}
                  {!message.isDeleted && !message.status && (
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      className={cn(
                        "pointer-events-none opacity-0 transition-all duration-200",
                        // Desktop styling (hover/click popup on right side)
                        "md:absolute md:-top-4 md:right-3 md:flex md:-translate-y-1 md:items-center md:gap-0.5 md:rounded-lg md:border md:border-[rgba(255,255,255,0.08)] md:bg-[rgba(22,22,21,0.92)] md:px-1 md:py-0.5 md:text-[10px] md:text-[var(--text-secondary)] md:shadow-[0_8px_24px_rgba(0,0,0,0.45)] md:backdrop-blur-xl md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-hover:pointer-events-auto",
                        // Mobile styling (bottom floating action dock)
                        "fixed bottom-24 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 rounded-xl border border-white/10 bg-[rgba(17,17,16,0.98)] px-3 py-2 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-2xl scale-95",
                        activeMessageId === message.id && "opacity-100 scale-100 pointer-events-auto md:translate-y-0 md:left-auto md:translate-x-0 md:bottom-auto md:top-0 md:right-3 md:absolute md:flex"
                      )}
                    >
                      <div className="pointer-events-auto flex items-center gap-1 select-none md:gap-0.5">
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onReply(message)}
                          className="flex h-8 w-8 md:h-5 md:w-5 items-center justify-center rounded-lg md:rounded transition hover:bg-white/5 hover:text-[var(--text-primary)]"
                          title="Reply"
                        >
                          <CornerUpLeft className="h-4.5 w-4.5 md:h-3 md:w-3" />
                        </motion.button>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setReactionPickerId(message.id)}
                          className="flex h-8 w-8 md:h-5 md:w-5 items-center justify-center rounded-lg md:rounded transition hover:bg-white/5 hover:text-[var(--text-primary)]"
                          title="React"
                        >
                          <SmilePlus className="h-4.5 w-4.5 md:h-3 md:w-3" />
                        </motion.button>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => navigator.clipboard?.writeText(message.content)}
                          className="flex h-8 w-8 md:h-5 md:w-5 items-center justify-center rounded-lg md:rounded transition hover:bg-white/5 hover:text-[var(--text-primary)]"
                          title="Copy text"
                        >
                          <Copy className="h-4.5 w-4.5 md:h-3 md:w-3" />
                        </motion.button>
                        {isCurrentUser && (
                          <>
                            <motion.button
                              type="button"
                              whileHover={canEdit ? { scale: 1.05 } : undefined}
                              whileTap={canEdit ? { scale: 0.95 } : undefined}
                              onClick={() => { if (canEdit) onEdit(message); }}
                              className={cn(
                                "flex h-8 w-8 md:h-5 md:w-5 items-center justify-center rounded-lg md:rounded transition",
                                canEdit ? "hover:bg-white/5 hover:text-[var(--text-primary)]" : "cursor-not-allowed opacity-30"
                              )}
                              title={editExpired ? "Editing window expired" : "Edit"}
                            >
                              <Pencil className="h-4.5 w-4.5 md:h-3 md:w-3" />
                            </motion.button>
                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => onDelete(message.id)}
                              className="flex h-8 w-8 md:h-5 md:w-5 items-center justify-center rounded-lg md:rounded text-red-400 transition hover:bg-red-500/10"
                              title="Delete"
                            >
                              <Trash2 className="h-4.5 w-4.5 md:h-3 md:w-3" />
                            </motion.button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Reaction Popover container (Inline expansion) */}
                {reactionPickerId === message.id && (
                  <>
                    <div 
                      className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] md:hidden"
                      onClick={() => setReactionPickerId(null)}
                    />
                    <motion.div
                      ref={reactionPickerRef}
                      initial={isMobile ? { y: "100%" } : { opacity: 0, y: 4 }}
                      animate={isMobile ? { y: 0 } : { opacity: 1, y: 0 }}
                      exit={isMobile ? { y: "100%" } : { opacity: 0, y: 4 }}
                      transition={{ type: "spring", damping: 25, stiffness: 250 }}
                      className={cn(
                        "z-50 overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.55)]",
                        // Mobile: slide-up bottom drawer
                        "fixed bottom-0 left-0 right-0 rounded-t-2xl border-t border-[rgba(255,255,255,0.08)] bg-[rgba(17,17,16,0.98)] p-3 backdrop-blur-2xl md:relative md:bottom-auto md:left-auto md:right-auto md:mt-2 md:rounded-xl md:border md:border-[rgba(255,255,255,0.08)] md:bg-[rgba(22,22,21,0.92)] md:p-2 md:backdrop-blur-none"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2 md:hidden">
                        <span className="text-xs font-semibold text-[var(--text-primary)]">Add Reaction</span>
                        <button 
                          type="button" 
                          onClick={() => setReactionPickerId(null)}
                          className="text-[var(--text-muted)] hover:text-white"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <EmojiPicker
                        theme={Theme.DARK}
                        onEmojiClick={(emojiData) =>
                          handleReactionClick(message.id, emojiData)
                        }
                        emojiStyle={EmojiStyle.NATIVE}
                        width="100%"
                        height={isMobile ? 320 : 240}
                        autoFocusSearch={false}
                      />
                      <button
                        type="button"
                        onClick={() => setReactionPickerId(null)}
                        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-[var(--border-muted)] py-2 text-xs font-medium text-[var(--text-secondary)] transition hover:bg-white/5 hover:text-[var(--text-primary)] md:mt-2 md:py-1 md:text-[10px]"
                      >
                        <Check className="h-4 w-4 md:h-3 md:w-3" />
                        Done
                      </button>
                    </motion.div>
                  </>
                )}

                {/* Receipt label row rendered beneath the bubble */}
                {isLastOutgoing && receiptStatus && (
                  <div className="mt-1 px-3.5 ml-2.5 text-[9.5px] text-[var(--text-muted)] font-normal select-none flex items-center gap-1">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={receiptStatus}
                        initial={{ opacity: 0, y: 1 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -1 }}
                        transition={{ duration: 0.15 }}
                        className="flex items-center gap-1.5"
                      >
                        {receiptStatus === "sending" && (
                          <span className="flex items-center gap-1.5 text-neutral-400/50">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neutral-400" />
                            <span className="font-light">Sending...</span>
                          </span>
                        )}
                        {receiptStatus === "failed" && (
                          <span className="flex items-center gap-1.5 text-red-400/70 font-medium">
                            <span>⚠️ Failed to send</span>
                            {onRetry && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRetry(message.id);
                                }}
                                className="px-1.5 py-0.5 rounded bg-red-950/40 border border-red-500/20 hover:bg-red-900/30 active:scale-95 transition-all text-red-300 font-medium text-[9px]"
                              >
                                Retry
                              </button>
                            )}
                          </span>
                        )}
                        {receiptStatus === "delivered" && (
                          <span className="text-neutral-500 font-light flex items-center gap-0.5" title="Sent to server">
                            Delivered <span className="text-[10px] leading-none">✓✓</span>
                          </span>
                        )}
                        {receiptStatus === "seen" && (
                          <span className="text-[var(--accent-teal)] font-medium flex items-center gap-0.5">
                            {selectedRoom?.isDM ? "Seen" : `Seen by ${seenCount}`} <span className="text-[10px] leading-none">✓✓</span>
                          </span>
                        )}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Lightbox Modal for Attachment Images */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm"
            onClick={() => setLightboxImage(null)}
          >
            <motion.img
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              src={lightboxImage.src}
              alt={lightboxImage.name}
              className="max-h-[85vh] w-auto max-w-[90vw] rounded-xl object-contain shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
