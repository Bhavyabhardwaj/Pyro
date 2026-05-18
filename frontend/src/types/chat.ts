import type { Message } from "./api";

export type AttachmentKind = "image" | "file";

export interface AttachmentItem {
  id: string;
  name: string;
  size: number;
  kind: AttachmentKind;
  mime: string;
  url: string;
}

export interface MessageReaction {
  emoji: string;
  count: number;
  reacted: boolean;
}

export interface ChatMessage extends Message {
  roomId?: string;
  attachments?: AttachmentItem[];
  replyTo?: Pick<Message, "id" | "content" | "author" | "createdAt">;
  editedAt?: string;
  isPending?: boolean;
  isFailed?: boolean;
  clientId?: string;
  reactions?: MessageReaction[];
}
