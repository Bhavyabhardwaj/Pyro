import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { roomService } from "../services/room.service";
import { messageService } from "../services/message.service";
import { authService } from "../services/auth.service";
import { Socket } from "socket.io-client";
import { connectSocket, releaseSocket } from "../lib/socket";
import { useAuth } from "../hooks/useAuth";
import type { Room, RoomMember } from "../types/api";
import type { AttachmentItem, ChatMessage } from "../types/chat";
import { PageTransition } from "../components/ui/PageTransition";
import { RoomSidebar } from "../components/chat/RoomSidebar";
import { ChatHeader } from "../components/chat/ChatHeader";
import { MessageList } from "../components/chat/MessageList";
import { MessageComposer } from "../components/chat/MessageComposer";
import { CommandPalette } from "../components/chat/CommandPalette";

const ChatPage = () => {
    const mountRef = useRef(0);
    useEffect(() => {
        mountRef.current += 1;
        console.log(`ChatPage mount #${mountRef.current}`);
        return () => {
            console.log(`ChatPage unmount #${mountRef.current}`);
        };
    }, []);
    const [rooms, setRooms] = useState<RoomMember[]>([]);
    const [roomFilter, setRoomFilter] = useState("");
    const [newRoomName, setNewRoomName] = useState("");
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [messageInput, setMessageInput] = useState("");
    const [composerAttachments, setComposerAttachments] = useState<AttachmentItem[]>([]);
    const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
    const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
    const [typingUsers, setTypingUsers] = useState<string[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isCommandOpen, setIsCommandOpen] = useState(false);
    const [isMobileRoomsOpen, setIsMobileRoomsOpen] = useState(false);
    const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
    const [isRoomsLoading, setIsRoomsLoading] = useState(true);
    const [isMessagesLoading, setIsMessagesLoading] = useState(false);
    const [roomsError, setRoomsError] = useState<string | null>(null);
    const [messagesError, setMessagesError] = useState<string | null>(null);
    const [isCreatingRoom, setIsCreatingRoom] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);
    const [isSendingMessage, setIsSendingMessage] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
    const socketRef = useRef<Socket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const selectedRoomIdRef = useRef<string | null>(null);
    const lastMessagesFetchRef = useRef<number | null>(null);
    const typingStopTimeoutRef = useRef<number | null>(null);
    const attachmentUrlsRef = useRef<Set<string>>(new Set());

    const { token, user, logout, updateUser } = useAuth();
    const navigate = useNavigate();

    const createId = () =>
        typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const getUserAvatar = useCallback(() => {
        if (user?.avatar) return user.avatar;
        try {
            const stored = localStorage.getItem("user");
            if (!stored) return undefined;
            const parsed = JSON.parse(stored) as { avatar?: string | null };
            return parsed?.avatar ?? undefined;
        } catch {
            return undefined;
        }
    }, [user]);

    const areSetsEqual = (a: Set<string>, b: Set<string>) => {
        if (a.size !== b.size) return false;
        for (const v of a) if (!b.has(v)) return false;
        return true;
    };

    const areRoomListsEqual = (a: RoomMember[], b: RoomMember[]) => {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
            if (a[i].room.id !== b[i].room.id) return false;
        }
        return true;
    };

    const areMessageListsEqual = (a: ChatMessage[], b: ChatMessage[]) => {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
            if (a[i].id !== b[i].id) return false;
        }
        return true;
    };

    const clearAttachments = useCallback(() => {
        setComposerAttachments((prev) => {
            prev.forEach((attachment) => {
                URL.revokeObjectURL(attachment.url);
                attachmentUrlsRef.current.delete(attachment.url);
            });
            return [];
        });
    }, []);

    const handleAddAttachments = (files: File[]) => {
        if (!files.length) return;
        setComposerAttachments((prev) => {
            const next = [...prev];
            const remainingSlots = Math.max(0, 6 - next.length);
            files.slice(0, remainingSlots).forEach((file) => {
                const url = URL.createObjectURL(file);
                attachmentUrlsRef.current.add(url);
                next.push({
                    id: createId(),
                    name: file.name,
                    size: file.size,
                    kind: file.type.startsWith("image/") ? "image" : "file",
                    mime: file.type || "application/octet-stream",
                    url,
                });
            });
            return next;
        });
    };

    const handleRemoveAttachment = (attachmentId: string) => {
        setComposerAttachments((prev) => {
            const next = prev.filter((attachment) => attachment.id !== attachmentId);
            const removed = prev.find((attachment) => attachment.id === attachmentId);
            if (removed) {
                URL.revokeObjectURL(removed.url);
                attachmentUrlsRef.current.delete(removed.url);
            }
            return next;
        });
    };

    const syncAvatar = useCallback((message: ChatMessage) => {
        const avatar = getUserAvatar();
        if (!avatar || (!user?.id && !user?.username)) return message;
        const matchesId = user?.id && message.author.id === user.id;
        const matchesName = user?.username && message.author.username === user.username;
        const nextMessage = matchesId || matchesName
            ? { ...message, author: { ...message.author, avatar } }
            : message;
        if (!nextMessage.replyTo) return nextMessage;
        const replyMatchesId = user?.id && nextMessage.replyTo.author.id === user.id;
        const replyMatchesName =
            user?.username && nextMessage.replyTo.author.username === user.username;
        if (!replyMatchesId && !replyMatchesName) return nextMessage;
        return {
            ...nextMessage,
            replyTo: {
                ...nextMessage.replyTo,
                author: { ...nextMessage.replyTo.author, avatar },
            },
        };
    }, [getUserAvatar, user]);

    const applyAvatarOverride = useCallback((message: ChatMessage, avatarUrl: string) => {
        if (!user?.id && !user?.username) return message;
        const matchesId = user?.id && message.author.id === user.id;
        const matchesName = user?.username && message.author.username === user.username;
        if (!matchesId && !matchesName) return message;

        const nextMessage = {
            ...message,
            author: { ...message.author, avatar: avatarUrl },
        };

        if (!nextMessage.replyTo) return nextMessage;
        const replyMatchesId = user?.id && nextMessage.replyTo.author.id === user.id;
        const replyMatchesName =
            user?.username && nextMessage.replyTo.author.username === user.username;
        if (!replyMatchesId && !replyMatchesName) return nextMessage;

        return {
            ...nextMessage,
            replyTo: {
                ...nextMessage.replyTo,
                author: { ...nextMessage.replyTo.author, avatar: avatarUrl },
            },
        };
    }, [user]);

    const mergeIncomingMessage = useCallback((incoming: ChatMessage) => {
        console.debug("mergeIncomingMessage called for", incoming.id);
        const normalizedIncoming = syncAvatar(incoming);
        setMessages((prev) => {
            const existingIndex = prev.findIndex((message) => message.id === normalizedIncoming.id);
            if (existingIndex >= 0) return prev;

            const pendingIndex = prev.findIndex(
                (message) =>
                    message.isPending &&
                    message.roomId === normalizedIncoming.roomId &&
                    message.author.id === normalizedIncoming.author.id &&
                    message.content === normalizedIncoming.content,
            );

            if (pendingIndex >= 0) {
                const pending = prev[pendingIndex];
                const merged: ChatMessage = {
                    ...normalizedIncoming,
                    attachments: pending.attachments,
                    replyTo: pending.replyTo,
                    reactions: pending.reactions,
                    isPending: false,
                    isFailed: false,
                };
                return [
                    ...prev.slice(0, pendingIndex),
                    merged,
                    ...prev.slice(pendingIndex + 1),
                ];
            }

            return [...prev, normalizedIncoming];
        });
    }, [syncAvatar]);

    const mergeIncomingMessageRef = useRef(mergeIncomingMessage);
    useEffect(() => {
        mergeIncomingMessageRef.current = mergeIncomingMessage;
    }, [mergeIncomingMessage]);

    // Buffer incoming messages to avoid many rapid state updates
    const incomingMessagesBufferRef = useRef<ChatMessage[]>([]);
    const incomingMessagesTimerRef = useRef<number | null>(null);
    const scheduleFlushIncoming = () => {
        if (incomingMessagesTimerRef.current) return;
        incomingMessagesTimerRef.current = window.setTimeout(() => {
            const toFlush = incomingMessagesBufferRef.current.splice(0);
            incomingMessagesTimerRef.current = null;
            if (!toFlush.length) return;
            toFlush.forEach((msg) => mergeIncomingMessageRef.current(msg));
        }, 50);
    };

    // Buffer presence updates for a short time to debounce noisy events
    const presenceBufferRef = useRef<Set<string> | null>(null);
    const presenceTimerRef = useRef<number | null>(null);
    const scheduleFlushPresence = () => {
        if (presenceTimerRef.current) return;
        presenceTimerRef.current = window.setTimeout(() => {
            presenceTimerRef.current = null;
            if (!presenceBufferRef.current) return;
            const incoming = presenceBufferRef.current;
            presenceBufferRef.current = null;
            setOnlineUsers((prev) => {
                if (areSetsEqual(prev, incoming)) return prev;
                return incoming;
            });
        }, 200);
    };

    const userRef = useRef(user);
    useEffect(() => {
        userRef.current = user;
    }, [user]);

    const handleCreateRoom = async () => {
        if (!token) {
            setCreateError("Please sign in to create a room.");
            navigate("/login");
            return;
        }
        const trimmed = newRoomName.trim();
        if (!trimmed) {
            setCreateError("Room name is required.");
            return;
        }
        if (trimmed.length < 3) {
            setCreateError("Use at least 3 characters.");
            return;
        }

        setCreateError(null);
        setIsCreatingRoom(true);
        try {
            const response = await roomService.createRoom(trimmed);
            setRooms((prevRooms) => [...prevRooms, { room: response.data }]);
            setSelectedRoom(response.data);
            setNewRoomName("");
            setRoomFilter("");
            setIsCreateOpen(false);
        } catch (error) {
            console.error("Error creating room:", error);
            setCreateError("Unable to create room. Try again.");
        } finally {
            setIsCreatingRoom(false);
        }
    };

    const handleSelectRoom = useCallback((room: Room) => {
        setSelectedRoom(room);
        setUnreadCounts((prev) => ({ ...prev, [room.id]: 0 }));
        setReplyTo(null);
        setEditingMessage(null);
        setMessageInput("");
        clearAttachments();
        setIsMobileRoomsOpen(false);
    }, [clearAttachments]);

    const handleAvatarChange = async (avatarUrl: string) => {
        if (!user) return;
        updateUser({ avatar: avatarUrl });
        setMessages((prev) => prev.map((message) => applyAvatarOverride(message, avatarUrl)));

        try {
            const response = await authService.updateAvatar({ avatar: avatarUrl });
            updateUser(response.data.user);
            const nextAvatar = response.data.user.avatar ?? avatarUrl;
            setMessages((prev) => prev.map((message) => applyAvatarOverride(message, nextAvatar)));
        } catch (error) {
            console.error("Error updating avatar:", error);
        }
    };

    const handleLeaveRoom = (roomId: string) => {
        setRooms((prev) => {
            const next = prev.filter((room) => room.room.id !== roomId);
            if (selectedRoom?.id === roomId) {
                setSelectedRoom(next[0]?.room ?? null);
            }
            return next;
        });
        setUnreadCounts((prev) => {
            const next = { ...prev };
            delete next[roomId];
            return next;
        });
        socketRef.current?.emit("leaveRoom", roomId);
    };

    const handleDeleteRoom = (roomId: string) => {
        setRooms((prev) => {
            const next = prev.filter((room) => room.room.id !== roomId);
            if (selectedRoom?.id === roomId) {
                setSelectedRoom(next[0]?.room ?? null);
            }
            return next;
        });
        setUnreadCounts((prev) => {
            const next = { ...prev };
            delete next[roomId];
            return next;
        });
        socketRef.current?.emit("leaveRoom", roomId);
    };

    const handleSendMessage = async () => {
        if (!selectedRoom) return;

        const trimmed = messageInput.trim();
        if (!trimmed && composerAttachments.length === 0) return;

        if (editingMessage) {
            if (!trimmed) return;
            setMessages((prev) =>
                prev.map((message) =>
                    message.id === editingMessage.id
                        ? {
                              ...message,
                              content: trimmed,
                              editedAt: new Date().toISOString(),
                          }
                        : message,
                ),
            );
            setEditingMessage(null);
            setMessageInput("");
            return;
        }

        const contentToSend = trimmed || "Shared an attachment";
        const localMessage: ChatMessage = {
            id: createId(),
            clientId: createId(),
            content: contentToSend,
            createdAt: new Date().toISOString(),
            roomId: selectedRoom.id,
            author: {
                id: user?.id,
                username: user?.username || "You",
                avatar: getUserAvatar(),
            },
            attachments: composerAttachments,
            replyTo: replyTo
                ? {
                      id: replyTo.id,
                      content: replyTo.content,
                      author: replyTo.author,
                      createdAt: replyTo.createdAt,
                  }
                : undefined,
            isPending: true,
            reactions: [],
        };

        setMessages((prev) => [...prev, localMessage]);
        setReplyTo(null);
        setMessageInput("");
        clearAttachments();

        setIsSendingMessage(true);
        try {
            const response = await messageService.sendMessage(selectedRoom.id, contentToSend);
            const confirmedMessage = syncAvatar({
                ...response.data,
                attachments: localMessage.attachments,
                replyTo: localMessage.replyTo,
                reactions: localMessage.reactions,
                isPending: false,
                isFailed: false,
            });
            setMessages((prev) =>
                prev.map((message) =>
                    message.id === localMessage.id ? confirmedMessage : message,
                ),
            );
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages((prev) =>
                prev.map((message) =>
                    message.id === localMessage.id
                        ? { ...message, isPending: false, isFailed: true }
                        : message,
                ),
            );
        } finally {
            setIsSendingMessage(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        const fetchRooms = async () => {
            try {
                const response = await roomService.getRooms();
                console.debug("fetched rooms count:", response.data.length, "payload:", response.data);
                setRooms((prev) => {
                    if (areRoomListsEqual(prev, response.data)) return prev;
                    return response.data;
                });
                if (response.data.length > 0 && selectedRoom?.id !== response.data[0].room.id) {
                    setSelectedRoom(response.data[0].room);
                }
                setRoomsError(null);
            } catch (error) {
                console.error("Error fetching rooms:", error);
                const status = (error as any)?.response?.status;
                const data = (error as any)?.response?.data;
                setRoomsError(`Failed to load rooms: ${status ?? "unknown"} ${data?.message ?? ""}`);
            } finally {
                setIsRoomsLoading(false);
            }
        };

        fetchRooms();
    }, [navigate, token]);

    useEffect(() => {
        if (!token) return;

        const refreshUserData = async () => {
            try {
                const response = await authService.getMe();
                if (response.data?.user) {
                    updateUser(response.data.user);
                }
            } catch (error) {
                console.error("Error refreshing user data:", error);
            }
        };

        refreshUserData();
    }, [token, updateUser]);

    useEffect(() => {
        if (!selectedRoom) return;
        const fetchMessages = async () => {
            console.debug("fetchMessages invoked for room", selectedRoom.id);
            // throttle repeated calls
            const now = Date.now();
            if ((lastMessagesFetchRef.current ?? 0) + 800 > now) {
                console.debug("fetchMessages throttled for room", selectedRoom.id);
                return;
            }
            lastMessagesFetchRef.current = now;
            setIsMessagesLoading(true);
            try {
                const response = await messageService.getRoomMessages(selectedRoom.id);
                console.debug("fetched messages count:", response.data.length, "payload:", response.data);
                setMessages((prev) => {
                    const mapped = response.data.map((message) => syncAvatar({ ...message, reactions: [] }));
                    if (areMessageListsEqual(prev, mapped)) return prev;
                    return mapped;
                });
                setUnreadCounts((prev) => ({ ...prev, [selectedRoom.id]: 0 }));
                setMessagesError(null);
            } catch (error) {
                console.error("Error fetching messages:", error);
                const status = (error as any)?.response?.status;
                const data = (error as any)?.response?.data;
                setMessagesError(`Failed to load messages: ${status ?? "unknown"} ${data?.message ?? ""}`);
            } finally {
                setIsMessagesLoading(false);
            }
        };
        fetchMessages();
    }, [selectedRoom, syncAvatar]);

    useEffect(() => {
        if (!token) {
            return;
        }

        if (socketRef.current) {
            console.log("Socket already initialized, skipping");
            return;
        }

        console.log("Initializing socket");
        const newSocket = connectSocket(token);
        socketRef.current = newSocket;

        newSocket.on("connect", () => {
            console.log("Socket connected:", newSocket.id);
            setIsConnected(true);
        });

        newSocket.on("disconnect", () => {
            setIsConnected(false);
            setOnlineUsers(new Set());
        });

        newSocket.on("onlineUsers", (userIds: string[]) => {
            const incoming = new Set(userIds);
            presenceBufferRef.current = incoming;
            scheduleFlushPresence();
        });

        newSocket.on("userOnline", (userId: string) => {
            setOnlineUsers((prev) => {
                if (prev.has(userId)) return prev;
                const next = new Set(prev);
                next.add(userId);
                return next;
            });
        });

        newSocket.on("userOffline", (userId: string) => {
            setOnlineUsers((prev) => {
                if (!prev.has(userId)) return prev;
                const next = new Set(prev);
                next.delete(userId);
                return next;
            });
        });

        newSocket.on("newMessage", (message: ChatMessage) => {
            const roomId = message.roomId;
            if (roomId && selectedRoomIdRef.current !== roomId) {
                setUnreadCounts((prev) => ({
                    ...prev,
                    [roomId]: (prev[roomId] || 0) + 1,
                }));
                return;
            }
            incomingMessagesBufferRef.current.push(message);
            scheduleFlushIncoming();
        });

        const handleTyping = (payload: {
            roomId?: string;
            username?: string;
            user?: { username?: string };
            isTyping?: boolean;
        }) => {
            const username = payload.username || payload.user?.username;
            if (!username || username === userRef.current?.username) return;
            if (payload.roomId && payload.roomId !== selectedRoomIdRef.current) return;
            setTypingUsers((prev) => {
                if (payload.isTyping === false) {
                    return prev.filter((value) => value !== username);
                }
                return prev.includes(username) ? prev : [...prev, username];
            });
        };

        const handleTypingStop = (payload: {
            roomId?: string;
            username?: string;
            user?: { username?: string };
        }) => {
            const username = payload.username || payload.user?.username;
            if (!username) return;
            setTypingUsers((prev) => prev.filter((value) => value !== username));
        };

        newSocket.on("typing", handleTyping);
        newSocket.on("userTyping", handleTyping);
        newSocket.on("typingStart", handleTyping);
        newSocket.on("typingStop", handleTypingStop);

        return () => {
            console.log("Cleaning up socket");
            newSocket.off("newMessage");
            newSocket.off("onlineUsers");
            newSocket.off("userOnline");
            newSocket.off("userOffline");
            newSocket.off("typing", handleTyping);
            newSocket.off("userTyping", handleTyping);
            newSocket.off("typingStart", handleTyping);
            newSocket.off("typingStop", handleTypingStop);
            releaseSocket();
            setIsConnected(false);
            socketRef.current = null;
        };
    }, [token]);

    useEffect(() => {
        if (!selectedRoom || !socketRef.current) {
            return;
        }
        const previousRoomId = selectedRoomIdRef.current;
        if (previousRoomId && previousRoomId !== selectedRoom.id) {
            socketRef.current.emit("leaveRoom", previousRoomId);
        }
        selectedRoomIdRef.current = selectedRoom.id;
        socketRef.current.emit("joinRoom", selectedRoom.id);
    }, [selectedRoom]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, selectedRoom]);

    useEffect(() => {
        console.debug("messages changed, count:", messages.length);
    }, [messages.length]);

    useEffect(() => {
        console.debug("rooms changed, count:", rooms.length);
    }, [rooms.length]);

    useEffect(() => {
        console.debug("selectedRoom changed:", selectedRoom?.id ?? null);
    }, [selectedRoom?.id]);

    useEffect(() => {
        console.debug("onlineUsers changed, count:", onlineUsers.size);
    }, [onlineUsers]);

    const handleComposerChange = (value: string) => {
        setMessageInput(value);
        if (!selectedRoom || !socketRef.current || !user?.username) return;
        socketRef.current.emit("typingStart", {
            roomId: selectedRoom.id,
            user: { username: user.username },
        });
        if (typingStopTimeoutRef.current) {
            window.clearTimeout(typingStopTimeoutRef.current);
        }
        typingStopTimeoutRef.current = window.setTimeout(() => {
            socketRef.current?.emit("typingStop", {
                roomId: selectedRoom.id,
                user: { username: user.username },
            });
        }, 900);
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
                event.preventDefault();
                setIsCommandOpen(true);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    useEffect(() => {
        const urls = attachmentUrlsRef.current;
        return () => {
            urls.forEach((url) => URL.revokeObjectURL(url));
            urls.clear();
        };
    }, []);

    return (
        <PageTransition>
            <div className="relative h-screen overflow-hidden bg-zinc-950 text-zinc-100">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(103,232,249,0.045),transparent_28%),radial-gradient(circle_at_82%_0%,rgba(168,85,247,0.04),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.035),transparent_26%)]" />
                <div className="pointer-events-none absolute inset-x-10 top-8 h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />
                <div className="relative grid h-full grid-cols-1 gap-0 p-0 md:grid-cols-[280px_minmax(0,1fr)] md:gap-3 md:p-3 xl:grid-cols-[304px_minmax(0,1fr)]">
                    <div className="hidden min-h-0 md:block">
                            {roomsError && (
                                <div className="mb-2 p-2 text-sm text-red-300">{roomsError}</div>
                            )}
                        <RoomSidebar
                            rooms={rooms}
                            selectedRoom={selectedRoom}
                            roomFilter={roomFilter}
                            newRoomName={newRoomName}
                            isLoading={isRoomsLoading}
                            isCreating={isCreatingRoom}
                            isCreateOpen={isCreateOpen}
                            createError={createError}
                            user={user}
                            unreadCounts={unreadCounts}
                            onlineUsersCount={onlineUsers.size}
                            onRoomFilterChange={setRoomFilter}
                            onNewRoomNameChange={setNewRoomName}
                            onCreateRoom={handleCreateRoom}
                            onOpenCreate={() => {
                                setCreateError(null);
                                setIsCreateOpen(true);
                            }}
                            onCloseCreate={() => {
                                setCreateError(null);
                                setIsCreateOpen(false);
                            }}
                            onSelectRoom={handleSelectRoom}
                            onLeaveRoom={handleLeaveRoom}
                            onDeleteRoom={handleDeleteRoom}
                            onAvatarChange={handleAvatarChange}
                            onLogout={handleLogout}
                        />
                    </div>

                    <main className="flex min-h-0 min-w-0 flex-col overflow-hidden border-white/8 bg-[linear-gradient(180deg,rgba(24,24,27,0.72),rgba(9,9,11,0.9)_42%,rgba(9,9,11,0.96))] shadow-2xl shadow-black/35 md:rounded-3xl md:border xl:rounded-[1.7rem]">
                        <ChatHeader
                            room={selectedRoom}
                            isConnected={isConnected}
                            onOpenRooms={() => setIsMobileRoomsOpen(true)}
                        />
                        <section className="relative min-h-0 flex-1 overflow-y-auto bg-[radial-gradient(circle_at_50%_0%,rgba(103,232,249,0.025),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.012),transparent_24%)]">
                            <div className="pointer-events-none absolute inset-0 opacity-[0.055] bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-size-[56px_56px]" />
                            {selectedRoom ? (
                                <>
                                        {messagesError && (
                                            <div className="p-3 text-sm text-red-300">
                                                {messagesError}
                                            </div>
                                        )}
                                    <MessageList
                                        messages={messages}
                                        isLoading={isMessagesLoading}
                                        currentUserId={user?.id}
                                        currentUsername={user?.username}
                                        currentUserAvatar={getUserAvatar()}
                                        onlineUsers={onlineUsers}
                                        onDelete={(messageId) =>
                                            setMessages((prev) =>
                                                prev.filter((message) => message.id !== messageId),
                                            )
                                        }
                                        onEdit={(message) => {
                                            setEditingMessage(message);
                                            setReplyTo(null);
                                            setMessageInput(message.content);
                                        }}
                                        onReply={(message) => setReplyTo(message)}
                                        onToggleReaction={(messageId, emoji) => {
                                            setMessages((prev) =>
                                                prev.map((message) => {
                                                    if (message.id !== messageId) return message;
                                                    const reactions = message.reactions ?? [];
                                                    const existing = reactions.find(
                                                        (reaction) => reaction.emoji === emoji,
                                                    );
                                                    if (!existing) {
                                                        return {
                                                            ...message,
                                                            reactions: [
                                                                ...reactions,
                                                                {
                                                                    emoji,
                                                                    count: 1,
                                                                    reacted: true,
                                                                },
                                                            ],
                                                        };
                                                    }
                                                    const nextCount = existing.reacted
                                                        ? existing.count - 1
                                                        : existing.count + 1;
                                                    const updated = reactions
                                                        .map((reaction) =>
                                                            reaction.emoji === emoji
                                                                ? {
                                                                      ...reaction,
                                                                      count: Math.max(0, nextCount),
                                                                      reacted: !reaction.reacted,
                                                                  }
                                                                : reaction,
                                                        )
                                                        .filter((reaction) => reaction.count > 0);
                                                    return {
                                                        ...message,
                                                        reactions: updated,
                                                    };
                                                }),
                                            );
                                        }}
                                        typingUsers={typingUsers}
                                    />
                                    <div ref={messagesEndRef} />
                                </>
                            ) : (
                                <div className="flex h-full items-center justify-center p-6 text-center">
                                    <div className="max-w-sm">
                                        <h1 className="text-2xl font-semibold tracking-tight text-white">
                                            Choose a room
                                        </h1>
                                        <p className="mt-3 text-sm leading-6 text-zinc-500">
                                            Select an existing room or create a new one to begin realtime messaging.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </section>
                        <MessageComposer
                            value={messageInput}
                            disabled={!selectedRoom}
                            isSending={isSendingMessage}
                            attachments={composerAttachments}
                            replyTo={replyTo}
                            isEditing={Boolean(editingMessage)}
                            onChange={handleComposerChange}
                            onSend={handleSendMessage}
                            onAddAttachments={handleAddAttachments}
                            onRemoveAttachment={handleRemoveAttachment}
                            onClearReply={() => setReplyTo(null)}
                            onCancelEdit={() => {
                                setEditingMessage(null);
                                setMessageInput("");
                            }}
                        />
                    </main>
                </div>
                <AnimatePresence>
                    {isMobileRoomsOpen && (
                        <motion.div
                            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileRoomsOpen(false)}
                        >
                            <motion.div
                                className="h-full w-[min(86vw,340px)] p-2"
                                initial={{ x: "-100%" }}
                                animate={{ x: 0 }}
                                exit={{ x: "-100%" }}
                                transition={{ type: "spring", stiffness: 360, damping: 34 }}
                                onClick={(event) => event.stopPropagation()}
                            >
                                <RoomSidebar
                                    rooms={rooms}
                                    selectedRoom={selectedRoom}
                                    roomFilter={roomFilter}
                                    newRoomName={newRoomName}
                                    isLoading={isRoomsLoading}
                                    isCreating={isCreatingRoom}
                                    isCreateOpen={isCreateOpen}
                                    createError={createError}
                                    user={user}
                                    unreadCounts={unreadCounts}
                                    onlineUsersCount={onlineUsers.size}
                                    onRoomFilterChange={setRoomFilter}
                                    onNewRoomNameChange={setNewRoomName}
                                    onCreateRoom={handleCreateRoom}
                                    onOpenCreate={() => {
                                        setCreateError(null);
                                        setIsCreateOpen(true);
                                    }}
                                    onCloseCreate={() => {
                                        setCreateError(null);
                                        setIsCreateOpen(false);
                                    }}
                                    onSelectRoom={handleSelectRoom}
                                    onLeaveRoom={handleLeaveRoom}
                                    onDeleteRoom={handleDeleteRoom}
                                    onAvatarChange={handleAvatarChange}
                                    onLogout={handleLogout}
                                />
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <CommandPalette
                    isOpen={isCommandOpen}
                    rooms={rooms}
                    selectedRoom={selectedRoom}
                    onClose={() => setIsCommandOpen(false)}
                    onSelectRoom={handleSelectRoom}
                />
            </div>
        </PageTransition>
    );
};

export default ChatPage;
