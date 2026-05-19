import { AnimatePresence, motion } from "framer-motion";
import {
  CornerUpLeft,
  FileText,
  ImagePlus,
  Loader2,
  Paperclip,
  SendHorizontal,
  SmilePlus,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import EmojiPicker, {
  EmojiStyle,
  Theme,
  type EmojiClickData,
} from "emoji-picker-react";
import { cn } from "../../lib/utils";
import type { AttachmentItem } from "../../types/chat";
import { Textarea } from "../ui/textarea";

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
  const emojiPickerRef = useRef<HTMLDivElement | null>(null);
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [emojiPulse, setEmojiPulse] = useState(false);

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "0px";
    textareaRef.current.style.height = `${Math.min(
      textareaRef.current.scrollHeight,
      180,
    )}px`;
  }, [value]);

  useEffect(() => {
    if (!isEmojiOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsEmojiOpen(false);
      }
    };
    const handlePointerDown = (event: PointerEvent) => {
      if (!emojiPickerRef.current) return;
      if (!emojiPickerRef.current.contains(event.target as Node)) {
        setIsEmojiOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("pointerdown", handlePointerDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isEmojiOpen]);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onChange(`${value}${emojiData.emoji}`);
    setIsEmojiOpen(false);
    setEmojiPulse(true);
    window.setTimeout(() => setEmojiPulse(false), 250);
  };

  const isSendDisabled =
    disabled || isSending || (!value.trim() && attachments.length === 0);

  return (
    <div className="border-t border-white/8 bg-zinc-950/95 p-2.5 backdrop-blur-xl sm:p-3">
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

        <div
          className={cn(
            "rounded-[1.25rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-1.5 shadow-[0_16px_36px_rgba(0,0,0,0.28)] transition-all duration-200 focus-within:border-cyan-200/20 focus-within:bg-[linear-gradient(180deg,rgba(255,255,255,0.085),rgba(255,255,255,0.03))] focus-within:shadow-[0_18px_45px_rgba(8,145,178,0.15)]",
            emojiPulse && "shadow-[0_0_0_1.5px_rgba(34,211,238,0.1)]",
          )}
        >
          <div className="flex flex-wrap items-center gap-1">
            <motion.button
              type="button"
              onClick={() => setIsEmojiOpen((prev) => !prev)}
              disabled={disabled}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-all duration-150 hover:bg-white/8 hover:text-zinc-200",
                isEmojiOpen && "bg-white/10 text-cyan-100",
              )}
              aria-label="Open emoji picker"
            >
              <SmilePlus className="h-3.5 w-3.5" />
            </motion.button>
            <motion.button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              disabled={disabled}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-all duration-150 hover:bg-white/8 hover:text-zinc-200"
              aria-label="Upload image"
            >
              <ImagePlus className="h-3.5 w-3.5" />
            </motion.button>
            <motion.button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-all duration-150 hover:bg-white/8 hover:text-zinc-200"
              aria-label="Attach file"
            >
              <Paperclip className="h-3.5 w-3.5" />
            </motion.button>
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
                className="max-h-28 border-transparent bg-transparent px-1 py-1.5 text-[0.94rem] leading-[1.4] placeholder:text-zinc-700 placeholder:transition-colors transition-colors duration-150 focus:border-transparent focus:ring-0 focus:placeholder:text-zinc-600"
              />
            </div>
            <motion.button
              type="button"
              whileTap={{ scale: 0.90 }}
              whileHover={{ scale: 1.05 }}
              onClick={onSend}
              disabled={isSendDisabled}
              aria-label="Send message"
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg text-white transition-all duration-150",
                isSendDisabled
                  ? "bg-white/8 text-zinc-600 cursor-not-allowed"
                  : "bg-[linear-gradient(135deg,#22d3ee,#a855f7)] shadow-[0_12px_28px_rgba(56,189,248,0.24)] hover:shadow-[0_16px_36px_rgba(56,189,248,0.32)]",
              )}
            >
              {isSending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <SendHorizontal className="h-3.5 w-3.5" />
              )}
            </motion.button>
          </div>

          <AnimatePresence>
            {isEmojiOpen && !disabled && (
              <motion.div
                ref={emojiPickerRef}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="mt-2.5 overflow-hidden rounded-xl border border-white/10 bg-zinc-950/90 p-1.5 shadow-2xl shadow-black/40"
              >
                <EmojiPicker
                  theme={Theme.DARK}
                  onEmojiClick={handleEmojiClick}
                  emojiStyle={EmojiStyle.NATIVE}
                  width="100%"
                  height={320}
                  autoFocusSearch
                />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {(replyTo || isEditing) && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className={cn(
                  "mt-2.5 flex items-center justify-between rounded-xl border border-white/8 bg-white/3 px-2.5 py-2 text-xs transition hover:bg-white/5",
                  isEditing ? "border-cyan-200/20 text-cyan-100" : "text-zinc-400",
                )}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span className="self-stretch w-0.5 rounded-full bg-cyan-200/40" />
                  <CornerUpLeft className="h-3 w-3 flex-shrink-0" />
                  {isEditing ? (
                    <span className="truncate text-[11px]">Editing message</span>
                  ) : (
                    <span className="truncate text-[11px]">
                      <span className="font-semibold text-white">
                        {replyTo?.author.username}
                      </span>
                      <span className="text-zinc-600"> :</span>
                      <span className="ml-1 text-zinc-500">{replyTo?.content}</span>
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
            <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/3 transition-all duration-150 hover:border-white/15"
                >
                  {attachment.kind === "image" ? (
                    <img
                      src={attachment.url}
                      alt={attachment.name}
                      className="h-28 w-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-2.5">
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
                    </div>
                  )}
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onRemoveAttachment(attachment.id)}
                    className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-950/70 text-zinc-400 opacity-0 transition group-hover:opacity-100"
                    aria-label="Remove attachment"
                  >
                    <X className="h-3 w-3" />
                  </motion.button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-zinc-700">
            <span>Enter to send</span>
            <span className="text-zinc-800">•</span>
            <span>Shift+Enter for new line</span>
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
