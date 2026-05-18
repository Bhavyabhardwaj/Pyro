import { motion } from "framer-motion";
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
import { useState } from "react";
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

export function MessageList({
  messages,
  isLoading,
  currentUserId,
  onDelete,
  onEdit,
  onReply,
  onToggleReaction,
  typingUsers,
}: {
  messages: ChatMessage[];
  isLoading: boolean;
  currentUserId?: string;
  onDelete: (messageId: string) => void;
  onEdit: (message: ChatMessage) => void;
  onReply: (message: ChatMessage) => void;
  onToggleReaction: (messageId: string, emoji: string) => void;
  typingUsers?: string[];
}) {
  const [reactionPickerId, setReactionPickerId] = useState<string | null>(null);
  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-5 p-4 sm:p-8">
        {[0, 1, 2].map((item) => (
          <div key={item} className="flex gap-3">
            <Skeleton className="h-9 w-9 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-16 max-w-xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="relative flex h-full items-center justify-center p-6">
        <div className="absolute h-64 w-64 rounded-full bg-cyan-300/6 blur-3xl pulse-soft" />
        <div className="absolute h-40 w-40 rounded-full bg-purple-400/10 blur-3xl float-slow" />
        <div className="relative max-w-sm text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/6 shadow-2xl shadow-black/30">
            <MessageSquareText className="h-6 w-6 text-zinc-400" />
          </div>
          <h2 className="mt-5 text-xl font-semibold tracking-tight text-white">
            Start the conversation
          </h2>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Drop a greeting, share a file, or send a quick reaction to get
            things going.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-zinc-500">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              Attachments ready
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              Emoji reactions
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-4xl space-y-1 px-4 py-7 sm:px-7 sm:py-9">
      {messages.map((message, index) => {
        const previous = messages[index - 1];
        const sameAuthor = previous?.author.username === message.author.username;
        const previousAt = previous?.createdAt ? new Date(previous.createdAt) : null;
        const currentAt = message.createdAt ? new Date(message.createdAt) : null;
        const withinWindow =
          previousAt && currentAt
            ? currentAt.getTime() - previousAt.getTime() < 1000 * 60 * 5
            : false;
        const grouped = sameAuthor && withinWindow;
        const isCurrentUser = currentUserId && message.author.id === currentUserId;

        return (
          <motion.div
            key={`${message.id}-${index}`}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "group relative flex gap-3 rounded-[1.35rem] px-2 py-1.5 transition-all duration-200 hover:bg-white/[0.028]",
              grouped ? "mt-0.5" : "mt-5",
            )}
          >
            {grouped ? (
              <div className="w-9 shrink-0 text-right text-[10px] text-zinc-700 opacity-0 transition-opacity group-hover:opacity-100">
                {formatTime(message.createdAt)}
              </div>
            ) : (
              <Avatar
                name={message.author.username}
                src={message.author.avatar}
                className="mt-1"
              />
            )}
            <div className="min-w-0 max-w-3xl">
              {!grouped && (
                <div className="flex flex-wrap items-baseline gap-2 px-1">
                  <span className="text-[0.92rem] font-medium text-white">
                    {message.author.username}
                  </span>
                  {isCurrentUser && (
                    <span className="rounded-full border border-cyan-200/20 bg-cyan-200/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-cyan-100">
                      You
                    </span>
                  )}
                  <span className="text-xs text-zinc-600">
                    {formatTime(message.createdAt)}
                  </span>
                  {message.editedAt && (
                    <span className="text-[10px] text-zinc-600">
                      edited
                    </span>
                  )}
                </div>
              )}
              <div
                className={cn(
                  "relative",
                  grouped
                    ? "px-4 py-1.5"
                    : "mt-1 rounded-[1.35rem] rounded-tl-md border border-white/8.5 bg-[linear-gradient(180deg,rgba(255,255,255,0.065),rgba(255,255,255,0.04))] px-4 py-3 shadow-[0_12px_34px_rgba(0,0,0,0.18)]",
                )}
              >
                <div className="absolute right-2 top-2 flex translate-y-2 items-center gap-1 rounded-full border border-white/10 bg-zinc-950/80 px-2 py-1 text-[11px] text-zinc-400 opacity-0 shadow-xl transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => onReply(message)}
                    className="flex h-6 w-6 items-center justify-center rounded-full transition hover:bg-white/10"
                    aria-label="Reply"
                  >
                    <CornerUpLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setReactionPickerId(message.id)}
                    className="flex h-6 w-6 items-center justify-center rounded-full transition hover:bg-white/10"
                    aria-label="React"
                  >
                    <SmilePlus className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(message.content);
                    }}
                    className="flex h-6 w-6 items-center justify-center rounded-full transition hover:bg-white/10"
                    aria-label="Copy"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  {isCurrentUser && (
                    <>
                      <button
                        type="button"
                        onClick={() => onEdit(message)}
                        className="flex h-6 w-6 items-center justify-center rounded-full transition hover:bg-white/10"
                        aria-label="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(message.id)}
                        className="flex h-6 w-6 items-center justify-center rounded-full text-red-200 transition hover:bg-red-500/10"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                </div>

                {message.replyTo && (
                  <div className="mb-2 rounded-xl border border-white/10 bg-white/3 px-3 py-2 text-xs text-zinc-400">
                    Replying to {message.replyTo.author.username}: {message.replyTo.content}
                  </div>
                )}

                {message.content && (
                  <p
                    className={cn(
                      "text-sm leading-6",
                      grouped ? "text-zinc-400" : "text-zinc-200",
                    )}
                  >
                    {message.content}
                  </p>
                )}

                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {message.attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="overflow-hidden rounded-2xl border border-white/10 bg-white/3"
                      >
                        {attachment.kind === "image" ? (
                          <img
                            src={attachment.url}
                            alt={attachment.name}
                            className="h-40 w-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center gap-3 px-4 py-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                              <FileText className="h-4 w-4 text-zinc-300" />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm text-white">
                                {attachment.name}
                              </p>
                              <p className="text-xs text-zinc-500">
                                {formatFileSize(attachment.size)}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {message.reactions && message.reactions.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {message.reactions.map((reaction) => (
                      <button
                        key={reaction.emoji}
                        type="button"
                        onClick={() => onToggleReaction(message.id, reaction.emoji)}
                        className={cn(
                          "flex items-center gap-1 rounded-full border px-2 py-1 text-xs transition",
                          reaction.reacted
                            ? "border-cyan-200/40 bg-cyan-200/10 text-cyan-100"
                            : "border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10",
                        )}
                      >
                        <span>{reaction.emoji}</span>
                        <span>{reaction.count}</span>
                      </button>
                    ))}
                  </div>
                )}

                {message.isPending && (
                  <div className="mt-2 flex items-center gap-2 text-[11px] text-zinc-500">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-200/60" />
                    Sending...
                  </div>
                )}
                {message.isFailed && (
                  <div className="mt-2 flex items-center gap-2 text-[11px] text-red-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                    Failed to send
                  </div>
                )}

                {reactionPickerId === message.id && (
                  <div className="mt-3 flex flex-wrap gap-1 rounded-2xl border border-white/10 bg-zinc-950/90 px-2 py-2 text-lg">
                    {["44d", "525", "60d", "44f", "622"].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          onToggleReaction(message.id, emoji);
                          setReactionPickerId(null);
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-xl transition hover:bg-white/10"
                      >
                        {emoji}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setReactionPickerId(null)}
                      className="ml-auto flex h-8 w-8 items-center justify-center rounded-xl text-zinc-500 hover:bg-white/10"
                      aria-label="Close reactions"
                    >
                      <Check className="h-4 w-4" />
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
      {typingUsers && typingUsers.length > 0 && (
        <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/5">
            ...
          </span>
          <span>{typingUsers.join(", ")} typing...</span>
        </div>
      )}
    </div>
  );
}
