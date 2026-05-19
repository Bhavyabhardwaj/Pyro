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
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import EmojiPicker, {
  EmojiStyle,
  Theme,
  type EmojiClickData,
} from "emoji-picker-react";
import type { ChatMessage } from "../../types/chat";
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

function formatDate(value?: string) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
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
  typingUsers,
}: {
  messages: ChatMessage[];
  isLoading: boolean;
  currentUserId?: string;
  currentUsername?: string;
  currentUserAvatar?: string;
  onDelete: (messageId: string) => void;
  onEdit: (message: ChatMessage) => void;
  onReply: (message: ChatMessage) => void;
  onToggleReaction: (messageId: string, emoji: string) => void;
  typingUsers?: string[];
}) {
  const [reactionPickerId, setReactionPickerId] = useState<string | null>(null);
  const reactionPickerRef = useRef<HTMLDivElement | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{
    src: string;
    name: string;
  } | null>(null);

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
      <div className="mx-auto max-w-4xl space-y-4 p-4 sm:p-8">
        {[0, 1, 2].map((item) => (
          <motion.div
            key={item}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: item * 0.1 }}
            className="flex gap-3"
          >
            <Skeleton className="h-9 w-9 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32 rounded-lg" />
              <Skeleton className="h-16 max-w-xl rounded-[0.95rem]" />
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="relative flex h-full items-center justify-center p-6">
        <div className="absolute h-56 w-56 rounded-full bg-cyan-300/6 blur-3xl" />
        <div className="absolute -bottom-12 -left-24 h-48 w-48 rounded-full bg-violet-400/5 blur-3xl" />
        <div className="relative max-w-lg text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-[0_16px_40px_rgba(0,0,0,0.3)]">
            <MessageSquareText className="h-5.5 w-5.5 text-zinc-400" />
          </div>
          <h2 className="mt-4 text-lg font-semibold tracking-tight text-white">
            Start the conversation
          </h2>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Say hello to break the ice. Every great conversation starts with a single message.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-600">
              Share updates
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-600">
              Make decisions
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-600">
              Collaborate
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-4xl space-y-0 px-4 py-4 sm:px-6 sm:py-6">
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-cyan-300/[0.012] to-transparent" />
      <div className="relative space-y-0">
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
        const showDelivered =
          isCurrentUser &&
          index === lastSelfIndex &&
          !message.isPending &&
          !message.isFailed;

        return (
          <motion.div
            key={`${message.id}-${index}`}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "group relative grid w-full grid-cols-[36px_minmax(0,1fr)] items-start gap-2.5 rounded-[0.95rem] px-1.5 py-0.5 transition-all duration-200 hover:bg-white/[0.012]",
              grouped ? "mt-0" : "mt-1.5",
            )}
          >
            <div className="flex h-9 w-9 items-start justify-end">
              {grouped ? null : (
                <Avatar
                  name={message.author.username}
                  src={isCurrentUser ? currentUserAvatar ?? message.author.avatar : message.author.avatar}
                  className="mt-0.5"
                />
              )}
            </div>
            <div className="min-w-0">
              {!grouped && (
                <div className="flex flex-wrap items-baseline gap-2 px-1">
                  <span className="text-[0.92rem] font-semibold text-white">
                    {message.author.username}
                  </span>
                  {isCurrentUser && (
                    <span className="rounded-full border border-cyan-200/20 bg-cyan-200/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.22em] text-cyan-100">
                      You
                    </span>
                  )}
                  <span className="text-xs text-zinc-600">{formatTime(message.createdAt)}</span>
                  {message.editedAt && (
                    <motion.span
                      initial={{ opacity: 0, y: -2 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[10px] text-zinc-600"
                    >
                      edited
                    </motion.span>
                  )}
                </div>
              )}
              <div
                className={cn(
                  "relative inline-flex w-fit max-w-[640px] flex-col transition-shadow duration-200 group-hover:shadow-[0_10px_22px_rgba(0,0,0,0.22)]",
                  grouped
                    ? "rounded-[0.85rem] px-3 py-0.5 text-zinc-400"
                    : "mt-1 rounded-[0.95rem] rounded-tl-sm border border-white/8.5 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.028))] px-3.5 py-2 shadow-[0_7px_18px_rgba(0,0,0,0.18)] text-zinc-200",
                )}
              >
                <div className="pointer-events-none absolute -top-8 right-0 flex -translate-y-2 items-center gap-0.5 rounded-lg border border-white/10 bg-zinc-950/70 px-1 py-1 text-[10px] text-zinc-400 opacity-0 shadow-[0_4px_12px_rgba(0,0,0,0.28)] backdrop-blur-sm transition-all duration-200 group-hover:-translate-y-2.5 group-hover:opacity-100">
                  <div className="pointer-events-auto flex items-center gap-0.5">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onReply(message)}
                    className="flex h-6 w-6 items-center justify-center rounded-md transition-all duration-150 hover:bg-white/10"
                    aria-label="Reply"
                  >
                    <CornerUpLeft className="h-3 w-3" />
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setReactionPickerId(message.id)}
                    className="flex h-6 w-6 items-center justify-center rounded-md transition-all duration-150 hover:bg-white/10"
                    aria-label="React"
                  >
                    <SmilePlus className="h-3 w-3" />
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      navigator.clipboard?.writeText(message.content);
                    }}
                    className="flex h-6 w-6 items-center justify-center rounded-md transition-all duration-150 hover:bg-white/10"
                    aria-label="Copy"
                  >
                    <Copy className="h-3 w-3" />
                  </motion.button>
                  {isCurrentUser && (
                    <>
                      <motion.button
                        type="button"
                        whileHover={canEdit ? { scale: 1.1 } : undefined}
                        whileTap={canEdit ? { scale: 0.9 } : undefined}
                        onClick={() => {
                          if (canEdit) onEdit(message);
                        }}
                        className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-md transition-all duration-150",
                          canEdit ? "hover:bg-white/10" : "cursor-not-allowed opacity-40",
                        )}
                        aria-label="Edit"
                        title={editExpired ? "Editing window expired" : "Edit"}
                      >
                        <Pencil className="h-3 w-3" />
                      </motion.button>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onDelete(message.id)}
                        className="flex h-6 w-6 items-center justify-center rounded-md text-red-300 transition-all duration-150 hover:bg-red-500/10"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-3 w-3" />
                      </motion.button>
                    </>
                  )}
                  </div>
                </div>

                {message.replyTo && (
                  <div className="mb-2 rounded-xl border border-white/10 bg-white/4 px-3 py-2 text-xs text-zinc-300 transition hover:bg-white/6">
                    <div className="flex items-center gap-2">
                      <span className="self-stretch w-0.5 rounded-full bg-cyan-300/50" />
                      <div className="min-w-0">
                        <p className="truncate text-[11px] font-semibold text-white">
                          {message.replyTo.author.username}
                        </p>
                        <p className="truncate text-[11px] text-zinc-500">
                          {message.replyTo.content}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {message.content && (
                  <p
                    className={cn(
                      "whitespace-pre-wrap text-sm leading-[1.5]",
                      grouped ? "text-zinc-400" : "text-zinc-200",
                    )}
                  >
                    {message.content}
                  </p>
                )}

                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
                    {message.attachments.map((attachment) => (
                      <motion.div
                        key={attachment.id}
                        whileHover={{ y: -1 }}
                        className="group/attachment relative overflow-hidden rounded-lg border border-white/10 bg-white/3 transition-all duration-200 hover:border-white/15"
                      >
                        {attachment.kind === "image" ? (
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.01 }}
                            onClick={() =>
                              setLightboxImage({
                                src: attachment.url,
                                name: attachment.name,
                              })
                            }
                            className="relative block w-full"
                          >
                            <img
                              src={attachment.url}
                              alt={attachment.name}
                              className="h-36 w-full object-cover transition-all duration-200"
                            />
                          </motion.button>
                        ) : (
                          <motion.div
                            whileHover={{ backgroundColor: "rgba(255,255,255,0.04)" }}
                            className="flex items-center gap-2.5 px-3 py-2.5 transition-colors duration-150"
                          >
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/8">
                              <FileText className="h-3.5 w-3.5 text-zinc-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs text-white">
                                {attachment.name}
                              </p>
                              <p className="text-[10px] text-zinc-600">
                                {formatFileSize(attachment.size)}
                              </p>
                            </div>
                            <motion.a
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.97 }}
                              href={attachment.url}
                              download={attachment.name}
                              className="rounded-lg border border-white/10 px-1.5 py-0.5 text-[9px] text-zinc-400 transition-all duration-150 hover:border-white/20 hover:bg-white/8 hover:text-white"
                            >
                              Download
                            </motion.a>
                          </motion.div>
                        )}
                        {message.isPending && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 flex items-center justify-center bg-black/40 text-[10px] text-zinc-300"
                          >
                            Uploading...
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}

                {message.reactions && message.reactions.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {message.reactions.map((reaction) => (
                      <button
                        key={reaction.emoji}
                        type="button"
                        onClick={() => onToggleReaction(message.id, reaction.emoji)}
                        className={cn(
                          "group/reaction inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] shadow-[0_4px_10px_rgba(0,0,0,0.2)] backdrop-blur-md transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[0_6px_14px_rgba(0,0,0,0.28)]",
                          reaction.reacted
                            ? "border-cyan-200/35 bg-cyan-200/10 text-cyan-100"
                            : "border-white/10 bg-white/4 text-zinc-400 hover:border-white/15 hover:bg-white/7",
                        )}
                      >
                        <span className="text-[12px]">{reaction.emoji}</span>
                        <motion.span
                          key={`${reaction.emoji}-${reaction.count}`}
                          initial={{ opacity: 0, y: -2 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="min-w-[10px] text-[10px] font-semibold"
                        >
                          {reaction.count}
                        </motion.span>
                      </button>
                    ))}
                  </div>
                )}

                {message.isPending && (
                  <motion.div
                    initial={{ opacity: 0, y: 2 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 flex items-center gap-1 text-[9px] text-zinc-700 group-hover:hidden"
                  >
                    <span className="h-1 w-1 animate-pulse rounded-full bg-cyan-300/40" />
                  </motion.div>
                )}
                {message.isFailed && (
                  <div className="mt-2 flex items-center gap-2 text-[11px] text-red-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                    Failed to send
                  </div>
                )}
                {showDelivered && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-1 flex items-center gap-1.5 text-[10px] text-zinc-700 opacity-0 transition-opacity duration-150 group-hover:opacity-60"
                  >
                    <Check className="h-2.5 w-2.5" />
                  </motion.div>
                )}

                {reactionPickerId === message.id && (
                  <div
                    ref={reactionPickerRef}
                    className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/90 p-2 shadow-2xl shadow-black/40"
                  >
                    <EmojiPicker
                      theme={Theme.DARK}
                      onEmojiClick={(emojiData) =>
                        handleReactionClick(message.id, emojiData)
                      }
                      emojiStyle={EmojiStyle.NATIVE}
                      width="100%"
                      height={280}
                      autoFocusSearch
                    />
                    <button
                      type="button"
                      onClick={() => setReactionPickerId(null)}
                      className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 py-2 text-[11px] text-zinc-400 transition hover:bg-white/10"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Close
                    </button>
                  </div>
                )}
              </div>
              {!grouped && (
                <div className="mt-1 text-[10px] text-zinc-700">
                  {formatDate(message.createdAt)}
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
      </div>
      {typingUsers && typingUsers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex items-center gap-2 text-xs text-zinc-500"
        >
          <span className="flex h-6 w-8 items-center justify-center gap-1 rounded-full bg-white/5">
            {[0, 1, 2].map((dot) => (
              <motion.span
                key={dot}
                className="h-1 w-1 rounded-full bg-zinc-400"
                animate={{ y: [0, -3, 0], opacity: [0.45, 1, 0.45] }}
                transition={{
                  duration: 0.9,
                  repeat: Infinity,
                  delay: dot * 0.12,
                }}
              />
            ))}
          </span>
          <span>{typingUsers.join(", ")} typing</span>
        </motion.div>
      )}

      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
            onClick={() => setLightboxImage(null)}
          >
            <motion.img
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              src={lightboxImage.src}
              alt={lightboxImage.name}
              className="max-h-[80vh] w-auto max-w-[90vw] rounded-2xl object-contain shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
