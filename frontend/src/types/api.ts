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
}

export interface RoomMember {
  room: Room;
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
}
