import { AnimatePresence, motion } from "framer-motion";
import {
  CornerUpLeft,
  FileText,
  ImagePlus,
  Paperclip,
  SendHorizontal,
  SmilePlus,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import type { AttachmentItem } from "../../types/chat";
import { Textarea } from "../ui/textarea";

const emojiList = [
  "44b",
  "604",
  "60e",
  "525",
  "60d",
  "64c",
  "389",
  "602",
  "44d",
  "972",
  "60a",
  "680",
  "9e1",
  "44f",
  "60c",
  "31f",
];

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

export function MessageComposer({
  value,
  disabled,
  isSending,
  attachments,
  replyTo,
  isEditing,
  onChange,
  onSend,
  onAddAttachments,
  onRemoveAttachment,
  onClearReply,
  onCancelEdit,
}: {
  value: string;
  disabled: boolean;
  isSending: boolean;
  attachments: AttachmentItem[];
  replyTo?: {
    id: string;
    content: string;
    author: { username: string };
  } | null;
  isEditing?: boolean;
  onChange: (value: string) => void;
  onSend: () => void;
  onAddAttachments: (files: File[]) => void;
  onRemoveAttachment: (attachmentId: string) => void;
  onClearReply: () => void;
  onCancelEdit: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "0px";
    textareaRef.current.style.height = `${Math.min(
      textareaRef.current.scrollHeight,
      180,
    )}px`;
  }, [value]);

  const isSendDisabled =
    disabled || isSending || (!value.trim() && attachments.length === 0);

  return (
    <div className="border-t border-white/8 bg-zinc-950/92 p-3 backdrop-blur-xl sm:p-5">
      <div
        className="relative mx-auto max-w-4xl"
        onDragEnter={(event) => {
          if (event.dataTransfer?.types?.includes("Files")) {
            setIsDragging(true);
          }
        }}
        onDragOver={(event) => {
          if (event.dataTransfer?.types?.includes("Files")) {
            event.preventDefault();
          }
        }}
        onDragLeave={(event) => {
          if ((event.currentTarget as HTMLElement).contains(event.relatedTarget as Node)) {
            return;
          }
          setIsDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          if (event.dataTransfer?.files?.length) {
            onAddAttachments(Array.from(event.dataTransfer.files));
          }
        }}
      >
        <AnimatePresence>
          {isDragging && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="absolute inset-0 z-20 flex items-center justify-center rounded-[1.8rem] border border-dashed border-cyan-300/40 bg-cyan-500/10 backdrop-blur"
            >
              <div className="text-center">
                <p className="text-sm font-medium text-cyan-100">Drop files to attach</p>
                <p className="mt-1 text-xs text-cyan-200/70">
                  Images and documents are ready to send
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="rounded-[1.8rem] border border-white/9 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.035))] p-3 shadow-[0_24px_70px_rgba(0,0,0,0.34)] transition-all focus-within:border-cyan-200/30 focus-within:shadow-[0_24px_80px_rgba(8,145,178,0.18)]">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEmojiOpen((prev) => !prev)}
              disabled={disabled}
              className="flex h-10 w-10 items-center justify-center rounded-2xl text-zinc-500 transition-all hover:bg-white/6 hover:text-zinc-200"
              aria-label="Open emoji picker"
            >
              <SmilePlus className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              disabled={disabled}
              className="flex h-10 w-10 items-center justify-center rounded-2xl text-zinc-500 transition-all hover:bg-white/6 hover:text-zinc-200"
              aria-label="Upload image"
            >
              <ImagePlus className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="flex h-10 w-10 items-center justify-center rounded-2xl text-zinc-500 transition-all hover:bg-white/6 hover:text-zinc-200"
              aria-label="Attach file"
            >
              <Paperclip className="h-4 w-4" />
            </button>
            <div className="flex-1">
              <Textarea
                ref={textareaRef}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                onKeyDown={(event) => {
                  const key = event.key.toLowerCase();
                  if ((event.metaKey || event.ctrlKey) && key === "e") {
                    event.preventDefault();
                    setIsEmojiOpen((prev) => !prev);
                    return;
                  }
                  if ((event.metaKey || event.ctrlKey) && key === "u") {
                    event.preventDefault();
                    fileInputRef.current?.click();
                    return;
                  }
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    if (!isSendDisabled) onSend();
                  }
                }}
                disabled={disabled}
                rows={1}
                placeholder={
                  disabled ? "Select a room to message" : "Write a message..."
                }
                className="max-h-44 border-transparent bg-transparent px-1 py-2 text-[0.95rem] leading-relaxed focus:border-transparent focus:ring-0"
              />
            </div>
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              onClick={onSend}
              disabled={isSendDisabled}
              aria-label="Send message"
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-2xl text-white transition-all",
                isSendDisabled
                  ? "bg-white/10 text-zinc-500"
                  : "bg-[linear-gradient(135deg,#22d3ee,#a855f7)] shadow-[0_16px_40px_rgba(56,189,248,0.28)]",
              )}
            >
              <SendHorizontal className="h-4 w-4" />
            </motion.button>
          </div>

          <AnimatePresence>
            {isEmojiOpen && !disabled && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="mt-3 grid grid-cols-8 gap-2 rounded-2xl border border-white/10 bg-zinc-950/90 p-3 text-xl shadow-2xl shadow-black/40"
              >
                {emojiList.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => onChange(`${value}${emoji}`)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl transition hover:bg-white/10"
                    aria-label={`Insert ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {(replyTo || isEditing) && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mt-3 flex items-center justify-between rounded-2xl border border-white/10 bg-white/4 px-3 py-2 text-xs text-zinc-400"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <CornerUpLeft className="h-3.5 w-3.5" />
                  {isEditing ? (
                    <span className="truncate">
                      Editing message
                    </span>
                  ) : (
                    <span className="truncate">
                      Replying to {replyTo?.author.username}: {replyTo?.content}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={isEditing ? onCancelEdit : onClearReply}
                  className="flex h-6 w-6 items-center justify-center rounded-full text-zinc-500 transition hover:bg-white/10 hover:text-white"
                  aria-label="Cancel"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {attachments.length > 0 && (
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/4"
                >
                  {attachment.kind === "image" ? (
                    <img
                      src={attachment.url}
                      alt={attachment.name}
                      className="h-32 w-full object-cover"
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
                  <button
                    type="button"
                    onClick={() => onRemoveAttachment(attachment.id)}
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-zinc-950/70 text-zinc-300 opacity-0 transition group-hover:opacity-100"
                    aria-label="Remove attachment"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-zinc-500">
            <span>Enter to send - Shift+Enter for new line</span>
            <span className="text-zinc-700">Ctrl+E emoji</span>
            <span className="text-zinc-700">Ctrl+U upload</span>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={(event) => {
          if (!event.target.files?.length) return;
          onAddAttachments(Array.from(event.target.files));
          event.target.value = "";
        }}
        className="hidden"
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(event) => {
          if (!event.target.files?.length) return;
          onAddAttachments(Array.from(event.target.files));
          event.target.value = "";
        }}
        className="hidden"
      />
    </div>
  );
}
