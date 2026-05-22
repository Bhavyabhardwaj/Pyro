export interface User {
  id: string;
  username: string;
  email?: string;
  avatar?: string | null;
}

export interface AuthPayload {
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
}

export interface Room {
  id: string;
  name: string;
  isDM?: boolean;
  lastMessage?: {
    id: string;
    content: string;
    createdAt: string;
    author: {
      id: string;
      username: string;
      avatar?: string | null;
    };
  } | null;
  roomMembers?: {
    user: User;
  }[];
}

export interface RoomMember {
  room: Room;
}

export interface Attachment {
  id: string;
  url: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  messageId: string;
  createdAt: string;
}

export interface Message {
  id: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
  roomId?: string;
  author: {
    id?: string;
    username: string;
    avatar?: string | null;
  };
  attachments?: Attachment[];
  // Delivery status flags (frontend-specific for premium feel)
  status?: "sending" | "sent" | "delivered" | "failed";
}

