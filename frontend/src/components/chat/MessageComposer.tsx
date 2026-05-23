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
  uploadProgress = null,
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
  uploadProgress?: number | null;
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
      120, // Max height restricted to keep composer slim
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
    window.setTimeout(() => setEmojiPulse(false), 200);
  };

  const isSendDisabled =
    disabled || isSending || (!value.trim() && attachments.length === 0);

  return (
    <div className="border-t border-[var(--border-muted)] bg-[rgba(17,17,16,0.85)] p-2 backdrop-blur-xl md:p-3 select-none">
      <div
        className="relative mx-auto max-w-3xl"
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
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              className="absolute inset-0 z-20 flex items-center justify-center rounded-xl border border-dashed border-[var(--accent-teal)] bg-teal-500/5 backdrop-blur-md"
            >
              <div className="text-center">
                <p className="text-[12px] font-medium text-[var(--accent-teal)]">Drop files here</p>
                <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">
                  Attach images or documents instantly
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Slimmed unified glass composer row */}
        <div
          className={cn(
            "rounded-2xl border border-[var(--border-muted)] bg-[rgba(242,242,239,0.015)] p-1.5 transition-all duration-200 focus-within:border-[rgba(242,242,239,0.12)] focus-within:bg-[rgba(242,242,239,0.025)] focus-within:shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.01)]",
            emojiPulse && "shadow-[0_0_0_1.5px_rgba(45,212,191,0.15)]",
          )}
        >
          <div className="flex items-center gap-1 pl-1">
            {/* LEFT tools */}
            <motion.button
              type="button"
              onClick={() => setIsEmojiOpen((prev) => !prev)}
              disabled={disabled}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--text-muted)] transition duration-200 hover:bg-white/5 hover:text-[var(--text-secondary)]",
                isEmojiOpen && "bg-white/8 text-[var(--text-primary)]",
              )}
              aria-label="Open emoji picker"
            >
              <SmilePlus className="h-4 w-4" />
            </motion.button>
            <motion.button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              disabled={disabled}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--text-muted)] transition duration-200 hover:bg-white/5 hover:text-[var(--text-secondary)]"
              aria-label="Upload image"
            >
              <ImagePlus className="h-4 w-4" />
            </motion.button>
            <motion.button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--text-muted)] transition duration-200 hover:bg-white/5 hover:text-[var(--text-secondary)]"
              aria-label="Attach file"
            >
              <Paperclip className="h-4 w-4" />
            </motion.button>

            {/* Input field (Centering correctly) */}
            <div className="flex-1 min-w-0">
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
                  disabled ? "Select a channel to message" : "Message..."
                }
                className="max-h-24 min-h-[32px] w-full border-transparent bg-transparent px-3 py-1.5 text-[16px] md:text-[12.5px] leading-relaxed placeholder:text-[var(--text-muted)] text-[var(--text-primary)] focus:border-transparent focus:ring-0 resize-none"
              />
            </div>

            {/* Send button (Tactile & Muted Active Highlight) */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.93 }}
              whileHover={{ scale: 1.03 }}
              onClick={onSend}
              disabled={isSendDisabled}
              aria-label="Send message"
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition duration-200",
                isSendDisabled
                  ? "bg-white/2 text-[var(--text-muted)] cursor-not-allowed"
                  : "bg-[var(--text-primary)] text-black hover:bg-white shadow-[0_4px_12px_rgba(0,0,0,0.25)] hover:shadow-[0_0_12px_rgba(255,255,255,0.15)]",
              )}
            >
              {isSending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <SendHorizontal className="h-3.5 w-3.5" />
              )}
            </motion.button>
          </div>

          {/* Emoji Picker Modal */}
          <AnimatePresence>
            {isEmojiOpen && !disabled && (
              <motion.div
                ref={emojiPickerRef}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="mt-2 overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[rgba(22,22,21,0.96)] p-1 shadow-2xl shadow-black/60"
              >
                <EmojiPicker
                  theme={Theme.DARK}
                  onEmojiClick={handleEmojiClick}
                  emojiStyle={EmojiStyle.NATIVE}
                  width="100%"
                  height={220}
                  autoFocusSearch={false}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reply and Edit Toolbar */}
          <AnimatePresence>
            {(replyTo || isEditing) && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className={cn(
                  "mt-2 flex items-center justify-between rounded-lg border px-2 py-1 text-[10.5px] transition-colors",
                  isEditing 
                    ? "border-[rgba(45,212,191,0.25)] bg-teal-500/5 text-[var(--accent-teal)]" 
                    : "border-[var(--border-muted)] bg-white/2 text-[var(--text-secondary)]"
                )}
              >
                <div className="flex min-w-0 items-center gap-1.5">
                  <span className="self-stretch w-[2px] rounded-full bg-[var(--accent-teal)]" />
                  <CornerUpLeft className="h-3 w-3 shrink-0" />
                  {isEditing ? (
                    <span className="truncate">Editing message</span>
                  ) : (
                    <span className="truncate">
                      Replying to <span className="font-medium text-[var(--text-primary)]">{replyTo?.author.username}</span>
                      <span className="text-[var(--text-muted)]"> :</span>
                      <span className="ml-1 text-[var(--text-muted)] italic">{replyTo?.content}</span>
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={isEditing ? onCancelEdit : onClearReply}
                  className="flex h-5 w-5 items-center justify-center rounded-full text-[var(--text-muted)] hover:bg-white/5 hover:text-[var(--text-primary)]"
                  aria-label="Cancel"
                >
                  <X className="h-3 w-3" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Upload Progress Bar */}
          {uploadProgress !== null && uploadProgress > 0 && uploadProgress < 100 && (
            <div className="mt-2.5 px-2">
              <div className="flex items-center justify-between text-[9px] text-[var(--text-muted)] mb-1">
                <span>Uploading files...</span>
                <span className="font-semibold">{Math.round(uploadProgress)}%</span>
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[var(--accent-teal)] to-emerald-400"
                  style={{ width: `${uploadProgress}%` }}
                  layout
                />
              </div>
            </div>
          )}

          {/* Attachments inside composer */}
          {attachments.length > 0 && (
            <div className="mt-2.5 grid gap-2 sm:grid-cols-2 p-1">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="group relative overflow-hidden rounded-lg border border-[var(--border-muted)] bg-[var(--bg-charcoal)]"
                >
                  {attachment.kind === "image" ? (
                    <img
                      src={attachment.url}
                      alt={attachment.name}
                      className="h-24 w-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center gap-2 px-2.5 py-1.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded bg-white/5">
                        <FileText className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[10.5px] text-[var(--text-primary)]">
                          {attachment.name}
                        </p>
                        <p className="text-[9.5px] text-[var(--text-muted)]">
                          {formatFileSize(attachment.size)}
                        </p>
                      </div>
                    </div>
                  )}
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onRemoveAttachment(attachment.id)}
                    className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-[var(--text-secondary)] hover:text-white"
                    aria-label="Remove attachment"
                  >
                    <X className="h-3 w-3" />
                  </motion.button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Hidden system file selectors */}
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
