import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../lib/axios";
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
import { TypingIndicator } from "../components/chat/TypingIndicator";
import { CommandPalette } from "../components/chat/CommandPalette";
import { useToast } from "../components/ui/Toast";

const ChatPage = () => {
    const { showToast } = useToast();
    const mountRef = useRef(0);
    useEffect(() => {
        mountRef.current += 1;
        console.log(`ChatPage mount #${mountRef.current}`);
        return () => {
            console.log(`ChatPage unmount #${mountRef.current}`);
        };
    }, []);
    const [rooms, setRooms] = useState<RoomMember[]>([]);
    const [discoverRooms, setDiscoverRooms] = useState<Room[]>([]);
    const [roomFilter, setRoomFilter] = useState("");
    const [newRoomName, setNewRoomName] = useState("");
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const [isFetchingOlderMessages, setIsFetchingOlderMessages] = useState(false);
    const [messageInput, setMessageInput] = useState("");
    const [composerAttachments, setComposerAttachments] = useState<AttachmentItem[]>([]);
    const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
    const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
    const [typingUsersByRoom, setTypingUsersByRoom] = useState<Record<string, Set<string>>>({});
    const [userIdToUsernameMap, setUserIdToUsernameMap] = useState<Record<string, string>>({});
    const [isConnected, setIsConnected] = useState(false);
    const [isReconnecting, setIsReconnecting] = useState(false);
    const [lastDisconnectReason, setLastDisconnectReason] = useState<string | null>(null);
    const [lastReadByUser, setLastReadByUser] = useState<Record<string, { messageId: string; createdAt: string }>>({});
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
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const [showNewMessagesBanner, setShowNewMessagesBanner] = useState<boolean>(false);
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const lastRoomIdRef = useRef<string | null>(null);
    const lastMessageIdRef = useRef<string | null>(null);
    const socketRef = useRef<Socket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const selectedRoomIdRef = useRef<string | null>(null);
    const lastMessagesFetchRef = useRef<number | null>(null);
    const lastFetchedRoomIdRef = useRef<string | null>(null);
    const typingStopTimeoutRef = useRef<number | null>(null);
    const typingActiveRef = useRef<Record<string, boolean>>({});
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

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
    };

    const handleAddAttachments = async (files: File[]) => {
        if (!files.length) return;
        
        setUploadProgress(10);
        const uploadedItems: AttachmentItem[] = [];
        
        try {
            const remainingSlots = Math.max(0, 6 - composerAttachments.length);
            const filesToUpload = files.slice(0, remainingSlots);
            
            let completed = 0;
            const total = filesToUpload.length;
            
            for (const file of filesToUpload) {
                const base64 = await fileToBase64(file);
                
                const response = await api.post("/upload", {
                    name: file.name,
                    mime: file.type || "application/octet-stream",
                    base64
                }, {
                    onUploadProgress: (progressEvent) => {
                        const fileProgress = progressEvent.total
                            ? (progressEvent.loaded / progressEvent.total) * 100
                            : 50;
                        
                        const baseProgress = 30 + (completed / total) * 65;
                        const incrementalProgress = (fileProgress / 100) * (65 / total);
                        setUploadProgress(Math.min(95, baseProgress + incrementalProgress));
                    }
                });
                
                if (response.data?.success && response.data?.data) {
                    const uploaded = response.data.data;
                    uploadedItems.push({
                        id: createId(),
                        name: uploaded.name || file.name,
                        size: uploaded.size || file.size,
                        kind: (uploaded.mime || file.type).startsWith("image/") ? "image" : "file",
                        mime: uploaded.mime || file.type || "application/octet-stream",
                        url: uploaded.url,
                    });
                }
                completed += 1;
            }
            
            if (uploadedItems.length > 0) {
                setComposerAttachments((prev) => [...prev, ...uploadedItems]);
            }
        } catch (error) {
            console.error("Error uploading attachments:", error);
        } finally {
            setUploadProgress(null);
        }
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
            if (existingIndex >= 0) {
                // If already exists, clear temporary "sending" state if lingering
                return prev.map((m) =>
                    m.id === normalizedIncoming.id
                        ? { ...m, status: m.status === "sending" ? ("sent" as const) : m.status }
                        : m
                );
            }

            const pendingIndex = prev.findIndex((message) => {
                const isOptimistic = message.status === "sending" || message.isPending;
                if (!isOptimistic) return false;

                const isSameRoom = message.roomId === normalizedIncoming.roomId;
                const isSameAuthor = message.author.id === normalizedIncoming.author.id;
                const isSameContent = message.content === normalizedIncoming.content;

                // Restrict heuristic matching to a 15-second window
                const messageTime = new Date(message.createdAt || "").getTime();
                const incomingTime = new Date(normalizedIncoming.createdAt || "").getTime();
                const isNearTime = Math.abs(messageTime - incomingTime) < 15000;

                return isSameRoom && isSameAuthor && isSameContent && isNearTime;
            });

            if (pendingIndex >= 0) {
                const pending = prev[pendingIndex];
                const merged: ChatMessage = {
                    ...normalizedIncoming,
                    attachments: pending.attachments || normalizedIncoming.attachments,
                    replyTo: pending.replyTo || normalizedIncoming.replyTo,
                    reactions: pending.reactions || normalizedIncoming.reactions,
                    isPending: false,
                    isFailed: false,
                    status: "sent" as const,
                };

                setTimeout(() => {
                    setMessages((curr) =>
                        curr.map((m) =>
                            m.id === normalizedIncoming.id ? { ...m, status: undefined } : m,
                        ),
                    );
                }, 2000);

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

    const roomsRef = useRef(rooms);
    useEffect(() => {
        roomsRef.current = rooms;
    }, [rooms]);

    const messagesRef = useRef<ChatMessage[]>(messages);
    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    const isNearBottomRef = useRef(true);
    const markAsReadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastMarkedMessageIdRef = useRef<Record<string, string>>({});

    // Build userId -> username mapping from messages
    useEffect(() => {
        const mapping: Record<string, string> = {};
        messages.forEach((msg) => {
            if (msg.author.id) {
                mapping[msg.author.id] = msg.author.username;
            }
        });
        setUserIdToUsernameMap(mapping);
    }, [messages]);

    const stopTyping = useCallback((roomId: string, shouldEmit = true) => {
        if (typingStopTimeoutRef.current) {
            window.clearTimeout(typingStopTimeoutRef.current);
            typingStopTimeoutRef.current = null;
        }
        typingActiveRef.current[roomId] = false;
        if (shouldEmit) {
            console.debug("[typing] emit typingStop", { roomId, userId: userRef.current?.id });
            socketRef.current?.emit("typingStop", roomId);
        }
    }, []);

    const getTypingUsernamesForRoom = useCallback(
        (roomId: string | null | undefined) => {
            if (!roomId) return [];
            const typingUserIds = Array.from(typingUsersByRoom[roomId] ?? new Set<string>());
            return typingUserIds
                .filter((typingUserId) => typingUserId !== userRef.current?.id)
                .map((typingUserId) => userIdToUsernameMap[typingUserId] ?? `User ${typingUserId.slice(0, 4)}`)
                .filter(Boolean);
        },
        [typingUsersByRoom, userIdToUsernameMap],
    );

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

    const handleCreateDM = async (targetUserId: string) => {
        try {
            const response = await roomService.createDM(targetUserId);
            if (response.success && response.data) {
                const newDmRoom = response.data;
                setRooms((prevRooms) => {
                    const exists = prevRooms.some((r) => r.room.id === newDmRoom.id);
                    if (exists) return prevRooms;
                    return [...prevRooms, { room: newDmRoom }];
                });
                setSelectedRoom(newDmRoom);
                setRoomFilter("");
            }
        } catch (error) {
            console.error("Error creating DM room:", error);
        }
    };

    const handleJoinRoom = async (roomId: string) => {
        try {
            const joinRes = await roomService.joinRoom(roomId);
            if (joinRes.success) {
                const roomsResponse = await roomService.getRooms();
                setRooms(roomsResponse.data);

                const joinedRoom = roomsResponse.data.find((rm: any) => rm.room.id === roomId)?.room;
                if (joinedRoom) {
                    setSelectedRoom(joinedRoom);
                    if (socketRef.current) {
                        socketRef.current.emit("joinRoom", roomId);
                    }
                }

                const discoverResponse = await roomService.getDiscoverRooms();
                if (discoverResponse.success && discoverResponse.data) {
                    setDiscoverRooms(discoverResponse.data);
                }
            }
        } catch (error) {
            console.error("Error joining room:", error);
        }
    };

    const handleSelectRoom = useCallback((room: Room) => {
        setSelectedRoom(room);
        setMessages([]);
        setNextCursor(null);
        setHasMore(false);
        setIsFetchingOlderMessages(false);
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
            setIsSendingMessage(true);
            try {
                await messageService.editMessage(selectedRoom.id, editingMessage.id, trimmed);
            } catch (error: any) {
                console.error("Error editing message:", error);
                const errMsg = error.response?.data?.message || "Failed to edit message";
                showToast(errMsg, "error");
            } finally {
                setIsSendingMessage(false);
                setEditingMessage(null);
                setMessageInput("");
            }
            return;
        }

        const contentToSend = trimmed || "Shared an attachment";
        const tempId = crypto.randomUUID();
        const localMessage: ChatMessage = {
            id: tempId,
            clientId: tempId,
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
            status: "sending" as const,
            reactions: [],
        };

        setMessages((prev) => [...prev, localMessage]);
        setReplyTo(null);
        setMessageInput("");
        clearAttachments();
        stopTyping(selectedRoom.id, true);

        setIsSendingMessage(true);
        try {
            const response = await messageService.sendMessage(selectedRoom.id, contentToSend, composerAttachments);
            const realMsg = response.data;
            const confirmedMessage = syncAvatar({
                ...realMsg,
                attachments: localMessage.attachments,
                replyTo: localMessage.replyTo,
                reactions: localMessage.reactions,
                isPending: false,
                isFailed: false,
                status: "sent" as const,
            });

            setMessages((prev) => {
                const exists = prev.some((m) => m.id === realMsg.id);
                if (exists) {
                    return prev.map((message) =>
                        message.id === realMsg.id ? { ...message, status: "sent" as const } : message,
                    );
                }
                return prev.map((message) =>
                    message.id === tempId ? confirmedMessage : message,
                );
            });

            setTimeout(() => {
                setMessages((prev) =>
                    prev.map((message) =>
                        message.id === realMsg.id || message.id === tempId
                            ? { ...message, status: undefined }
                            : message,
                    ),
                );
            }, 2000);

        } catch (error) {
            console.error("Error sending message:", error);
            setMessages((prev) =>
                prev.map((message) =>
                    message.id === tempId
                        ? { ...message, isPending: false, isFailed: true, status: "failed" as const }
                        : message,
                ),
            );
            showToast("Failed to send message", "error");
        } finally {
            setIsSendingMessage(false);
        }
    };

    const handleRetryMessage = async (tempId: string) => {
        if (!selectedRoom) return;

        let failedMessage: ChatMessage | undefined;
        setMessages((prev) => {
            failedMessage = prev.find((m) => m.id === tempId);
            if (!failedMessage) return prev;

            return prev.map((m) =>
                m.id === tempId
                    ? { ...m, status: "sending" as const, isPending: true, isFailed: false }
                    : m
            );
        });

        if (!failedMessage) return;

        try {
            const response = await messageService.sendMessage(
                selectedRoom.id,
                failedMessage.content,
                failedMessage.attachments
            );

            const realMsg = response.data;
            const confirmedMessage = syncAvatar({
                ...realMsg,
                attachments: failedMessage.attachments,
                replyTo: failedMessage.replyTo,
                reactions: failedMessage.reactions,
                isPending: false,
                isFailed: false,
                status: "sent" as const,
            });

            setMessages((prev) => {
                const exists = prev.some((m) => m.id === realMsg.id);
                if (exists) {
                    return prev.map((message) =>
                        message.id === realMsg.id ? { ...message, status: "sent" as const } : message,
                    );
                }
                return prev.map((message) =>
                    message.id === tempId ? confirmedMessage : message,
                );
            });

            setTimeout(() => {
                setMessages((prev) =>
                    prev.map((message) =>
                        message.id === realMsg.id || message.id === tempId
                            ? { ...message, status: undefined }
                            : message,
                    ),
                );
            }, 2000);

        } catch (error) {
            console.error("Error retrying message:", error);
            setMessages((prev) =>
                prev.map((message) =>
                    message.id === tempId
                        ? { ...message, isPending: false, isFailed: true, status: "failed" as const }
                        : message,
                ),
            );
            showToast("Failed to send message", "error");
        }
    };

    const resyncLatestMessages = async (roomId: string) => {
        try {
            console.log("[reconnect] Resyncing latest messages for room:", roomId);
            const response = await messageService.getRoomMessages(roomId);
            const messagesList = response.data?.messages || [];
            
            setMessages((prev) => {
                const optimistic = prev.filter((m) => m.status === "sending" || m.status === "failed" || m.isPending);
                const syncedIncoming = messagesList.map((m: any) => syncAvatar({ ...m, reactions: m.reactions || [] }));
                const merged = [...syncedIncoming];
                
                optimistic.forEach((optMsg) => {
                    const duplicate = merged.some(
                        (m) =>
                            m.content === optMsg.content &&
                            m.author.id === optMsg.author.id &&
                            Math.abs(new Date(m.createdAt || "").getTime() - new Date(optMsg.createdAt || "").getTime()) < 15000
                    );
                    if (!duplicate) {
                        merged.push(optMsg);
                    }
                });

                return merged.sort((a, b) => new Date(a.createdAt || "").getTime() - new Date(b.createdAt || "").getTime());
            });
        } catch (error) {
            console.error("Error resyncing messages after reconnect:", error);
        }
    };

    const autoResendFailedMessages = useCallback(async () => {
        const failed = messagesRef.current.filter((m) => m.status === "failed" || m.isFailed);
        if (failed.length === 0) return;
        
        console.log(`[offline queue] Auto-resending ${failed.length} failed messages...`);
        
        for (const failedMsg of failed) {
            await handleRetryMessage(failedMsg.id);
        }
    }, [handleRetryMessage]);

    useEffect(() => {
        const handleBrowserOnline = () => {
            console.log("[network] Browser went online, triggering auto-resend of failed messages");
            autoResendFailedMessages();
        };

        window.addEventListener("online", handleBrowserOnline);
        return () => {
            window.removeEventListener("online", handleBrowserOnline);
        };
    }, [autoResendFailedMessages]);

    const fetchOlderMessages = async () => {
        if (!selectedRoom || isFetchingOlderMessages || !hasMore || !nextCursor) return;
        setIsFetchingOlderMessages(true);
        
        const container = scrollContainerRef.current;
        const previousScrollHeight = container ? container.scrollHeight : 0;
        const previousScrollTop = container ? container.scrollTop : 0;

        try {
            console.debug("[pagination] fetching older messages for cursor", nextCursor);
            const response = await messageService.getRoomMessages(selectedRoom.id, nextCursor);
            const messagesList = response.data?.messages || [];
            
            if (messagesList.length > 0) {
                setMessages((prev) => {
                    const existingIds = new Set(prev.map((m: ChatMessage) => m.id));
                    const filteredNew = messagesList.filter((m: any) => !existingIds.has(m.id));
                    
                    const mappedNew = filteredNew.map((message: any) => syncAvatar({ ...message, reactions: [] }));
                    
                    const merged = [...mappedNew, ...prev];
                    return merged.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                });

                setNextCursor(response.data?.nextCursor ?? null);
                setHasMore(response.data?.hasMore ?? false);
                processReadStates(response.data?.readStates || [], messagesList);

                if (container) {
                    requestAnimationFrame(() => {
                        const newScrollHeight = container.scrollHeight;
                        container.scrollTop = previousScrollTop + (newScrollHeight - previousScrollHeight);
                    });
                }
            } else {
                setHasMore(false);
                setNextCursor(null);
            }
        } catch (error) {
            console.error("Error fetching older messages:", error);
            showToast("Failed to load older messages", "error");
        } finally {
            setIsFetchingOlderMessages(false);
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
                
                const initialUnreads: Record<string, number> = {};
                response.data.forEach((membership: any) => {
                    const r = membership.room;
                    initialUnreads[r.id] = r.unreadCount || 0;
                });
                setUnreadCounts((prev) => {
                    const next = { ...initialUnreads, ...prev };
                    if (selectedRoomIdRef.current) {
                        next[selectedRoomIdRef.current] = 0;
                    }
                    return next;
                });

                if (response.data.length > 0 && selectedRoom?.id !== response.data[0].room.id) {
                    setSelectedRoom(response.data[0].room);
                }
                setRoomsError(null);

                // Fetch discoverable channels
                try {
                    const discoverResponse = await roomService.getDiscoverRooms();
                    if (discoverResponse.success && discoverResponse.data) {
                        setDiscoverRooms(discoverResponse.data);
                    }
                } catch (err) {
                    console.error("Error fetching discoverable rooms:", err);
                }
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
            // throttle repeated calls for the SAME room to prevent spamming
            const now = Date.now();
            if (lastFetchedRoomIdRef.current === selectedRoom.id && (lastMessagesFetchRef.current ?? 0) + 800 > now) {
                console.debug("fetchMessages throttled for room", selectedRoom.id);
                return;
            }
            lastFetchedRoomIdRef.current = selectedRoom.id;
            lastMessagesFetchRef.current = now;
            setIsMessagesLoading(true);
            try {
                const response = await messageService.getRoomMessages(selectedRoom.id);
                const messagesList = response.data?.messages || [];
                console.debug("fetched messages count:", messagesList.length, "payload:", response.data);
                setMessages((prev) => {
                    const mapped = messagesList.map((message: any) => syncAvatar({ ...message, reactions: [] }));
                    if (areMessageListsEqual(prev, mapped)) return prev;
                    return mapped;
                });
                setNextCursor(response.data?.nextCursor ?? null);
                setHasMore(response.data?.hasMore ?? false);
                setUnreadCounts((prev) => ({ ...prev, [selectedRoom.id]: 0 }));
                processReadStates(response.data?.readStates || [], messagesList);
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
            setIsReconnecting(false);
            setLastDisconnectReason(null);
        });

        newSocket.on("connect_error", (err) => {
            console.error("Socket connection error:", err.message);
        });

        newSocket.on("disconnect", (reason) => {
            console.log("Socket disconnected, reason:", reason);
            setIsConnected(false);
            setOnlineUsers(new Set());
            setLastDisconnectReason(reason);
            setIsReconnecting(newSocket.active);
            setTypingUsersByRoom({}); // Stale typing indicator cleanup (Task 6)
        });

        newSocket.io.on("reconnect_attempt", (attempt) => {
            console.log("Socket reconnect attempt #", attempt);
            setIsReconnecting(true);
        });

        newSocket.io.on("reconnect", (attempt) => {
            console.log("Socket reconnected successfully on attempt #", attempt);
            setIsConnected(true);
            setIsReconnecting(false);
            setLastDisconnectReason(null);
            showToast("Reconnected successfully", "success");

            // Restore rooms (Task 4)
            const roomIds = roomsRef.current.map((r) => r.room.id);
            if (roomIds.length > 0) {
                console.log("[reconnect] restoring room subscriptions:", roomIds);
                newSocket.emit("restoreRooms", roomIds);
            }

            // Restore active room join
            if (selectedRoomIdRef.current) {
                console.log("[reconnect] rejoining active room:", selectedRoomIdRef.current);
                newSocket.emit("joinRoom", selectedRoomIdRef.current);
                resyncLatestMessages(selectedRoomIdRef.current);
            }

            // Refresh rooms to get latest unread counts and last messages after offline period
            roomService.getRooms().then((res) => {
                setRooms((prev) => {
                    if (areRoomListsEqual(prev, res.data)) return prev;
                    return res.data;
                });
                const initialUnreads: Record<string, number> = {};
                res.data.forEach((membership: any) => {
                    const r = membership.room;
                    initialUnreads[r.id] = r.unreadCount || 0;
                });
                setUnreadCounts((prev) => {
                    const next = { ...initialUnreads, ...prev };
                    if (selectedRoomIdRef.current) {
                        next[selectedRoomIdRef.current] = 0;
                    }
                    return next;
                });
            }).catch(err => {
                console.error("[reconnect] Failed to refresh rooms:", err);
            });

            autoResendFailedMessages();
        });

        newSocket.io.on("reconnect_error", (err) => {
            console.error("Socket reconnect error:", err.message);
            setIsReconnecting(true);
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
            if (roomId) {
                // Update the lastMessage preview for the room in rooms state immutably to preserve order
                setRooms((prev) =>
                    prev.map((r) => {
                        if (r.room.id !== roomId) return r;
                        return {
                            ...r,
                            room: {
                                ...r.room,
                                lastMessage: {
                                    id: message.id,
                                    content: message.content,
                                    createdAt: message.createdAt || new Date().toISOString(),
                                    author: {
                                        id: message.author.id || "",
                                        username: message.author.username,
                                        avatar: message.author.avatar,
                                    },
                                },
                            },
                        };
                    })
                );
            }

            if (roomId && selectedRoomIdRef.current !== roomId) {
                // Increment unread count locally ONLY if current user is not viewing room AND message author is not current user
                if (message.author.id !== userRef.current?.id) {
                    setUnreadCounts((prev) => ({
                        ...prev,
                        [roomId]: (prev[roomId] || 0) + 1,
                    }));
                }
                return;
            }
            incomingMessagesBufferRef.current.push(message);
            scheduleFlushIncoming();
        });

        newSocket.on("messageRead", (payload: { userId: string; messageId: string }) => {
            console.debug("[socket] messageRead received:", payload);
            if (!payload.userId || !payload.messageId) return;

            const msg = messagesRef.current.find((m) => m.id === payload.messageId);
            const createdAt = msg?.createdAt || new Date().toISOString();

            setLastReadByUser((prev) => ({
                ...prev,
                [payload.userId]: {
                    messageId: payload.messageId,
                    createdAt
                },
            }));
        });

        newSocket.on("roomCreated", (room: Room) => {
            console.log("Socket received roomCreated:", room);
            const isCurrentUserMember = room.roomMembers?.some(m => m.user?.id === userRef.current?.id || m.userId === userRef.current?.id) || false;
            
            if (isCurrentUserMember || room.isDM) {
                setRooms((prev) => {
                    const exists = prev.some((r) => r.room.id === room.id);
                    if (exists) return prev;
                    return [...prev, { room }];
                });
                newSocket.emit("joinRoom", room.id);
            } else {
                setDiscoverRooms((prev) => {
                    const exists = prev.some((r) => r.id === room.id);
                    if (exists) return prev;
                    return [...prev, room];
                });
            }
        });

        newSocket.on("messageUpdated", (updated: ChatMessage) => {
            console.debug("[socket] messageUpdated received:", updated);
            setMessages((prev) =>
                prev.map((m) => {
                    if (m.id !== updated.id) return m;
                    return {
                        ...m,
                        content: updated.content,
                        isEdited: updated.isEdited,
                        isDeleted: updated.isDeleted,
                        attachments: updated.attachments,
                        editedAt: updated.editedAt,
                    };
                })
            );
        });

        newSocket.on("messageDeleted", (deleted: ChatMessage) => {
            console.debug("[socket] messageDeleted received:", deleted);
            setMessages((prev) =>
                prev.map((m) => {
                    if (m.id !== deleted.id) return m;
                    return {
                        ...m,
                        content: deleted.content,
                        isDeleted: true,
                        attachments: [],
                        reactions: [],
                    };
                })
            );
        });

        const handleUserTyping = (payload: { userId?: string; roomId?: string }) => {
            console.debug("[typing] receive userTyping", payload);
            if (!payload.userId || !payload.roomId) return;
            if (payload.roomId !== selectedRoomIdRef.current) return;
            if (payload.userId === userRef.current?.id) return;
            setTypingUsersByRoom((prev) => {
                const current = new Set(prev[payload.roomId!] ?? new Set<string>());
                current.add(payload.userId!);
                return { ...prev, [payload.roomId!]: current };
            });
        };

        const handleUserStopTyping = (payload: { userId?: string; roomId?: string }) => {
            console.debug("[typing] receive userStopTyping", payload);
            if (!payload.userId || !payload.roomId) return;
            setTypingUsersByRoom((prev) => {
                const current = new Set(prev[payload.roomId!] ?? new Set<string>());
                current.delete(payload.userId!);
                if (current.size === 0) {
                    const next = { ...prev };
                    delete next[payload.roomId!];
                    return next;
                }
                return { ...prev, [payload.roomId!]: current };
            });
        };

        newSocket.on("userTyping", handleUserTyping);
        newSocket.on("userStopTyping", handleUserStopTyping);

        return () => {
            console.log("Cleaning up socket");
            if (selectedRoomIdRef.current) {
                stopTyping(selectedRoomIdRef.current, true);
            }
            newSocket.off("messageUpdated");
            newSocket.off("messageDeleted");
            newSocket.off("roomCreated");
            newSocket.off("newMessage");
            newSocket.off("messageRead");
            newSocket.off("onlineUsers");
            newSocket.off("userOnline");
            newSocket.off("userOffline");
            newSocket.off("userTyping", handleUserTyping);
            newSocket.off("userStopTyping", handleUserStopTyping);
            newSocket.io.off("reconnect_attempt");
            newSocket.io.off("reconnect");
            newSocket.io.off("reconnect_error");
            releaseSocket();
            setIsConnected(false);
            socketRef.current = null;
        };
    }, [stopTyping, token]);

    useEffect(() => {
        if (!selectedRoom || !socketRef.current) {
            return;
        }
        const previousRoomId = selectedRoomIdRef.current;
        if (previousRoomId && previousRoomId !== selectedRoom.id) {
            socketRef.current.emit("leaveRoom", previousRoomId);
            stopTyping(previousRoomId, true);
        }
        selectedRoomIdRef.current = selectedRoom.id;
        socketRef.current.emit("joinRoom", selectedRoom.id);
    }, [selectedRoom, stopTyping]);

    const processReadStates = useCallback((readStates: any[], messagesList: any[]) => {
        if (!readStates || !readStates.length) return;
        setLastReadByUser((prev) => {
            const next = { ...prev };
            let changed = false;
            readStates.forEach((state) => {
                if (state.userId && state.lastReadMessageId) {
                    const foundMsg = messagesList.find((m) => m.id === state.lastReadMessageId);
                    const createdAt = foundMsg?.createdAt;
                    
                    const existing = prev[state.userId];
                    const nextCreatedAt = createdAt || (existing?.messageId === state.lastReadMessageId ? existing.createdAt : null) || new Date().toISOString();
                    
                    if (!existing || existing.messageId !== state.lastReadMessageId || existing.createdAt !== nextCreatedAt) {
                        next[state.userId] = {
                            messageId: state.lastReadMessageId,
                            createdAt: nextCreatedAt
                        };
                        changed = true;
                    }
                }
            });
            return changed ? next : prev;
        });
    }, []);

    const triggerMarkAsRead = useCallback(() => {
        const roomId = selectedRoom?.id;
        if (!roomId || !isConnected) return;

        // 1. Browser tab visibility check
        if (document.visibilityState !== "visible") return;

        // 2. Near bottom check
        if (!isNearBottomRef.current) return;

        // 3. Find latest real message
        const latestRealMessage = [...messages]
            .reverse()
            .find((m) => m.id && m.status !== "sending" && m.status !== "failed" && !m.isPending);

        if (!latestRealMessage) return;

        const messageId = latestRealMessage.id;

        // 4. Duplicate/skip check using ref cache
        if (lastMarkedMessageIdRef.current[roomId] === messageId) {
            return;
        }

        // Clear existing debounce timeout
        if (markAsReadTimeoutRef.current) {
            clearTimeout(markAsReadTimeoutRef.current);
        }

        // Set debounce timeout
        markAsReadTimeoutRef.current = setTimeout(async () => {
            // Re-verify all conditions inside timeout
            if (
                selectedRoomIdRef.current !== roomId ||
                !isConnected ||
                document.visibilityState !== "visible" ||
                !isNearBottomRef.current
            ) {
                return;
            }

            // Verify message still exists and is correct
            if (lastMarkedMessageIdRef.current[roomId] === messageId) return;

            try {
                // Instantly update local unread count to 0 for instant premium feel
                setUnreadCounts((prev) => {
                    if (prev[roomId] === 0) return prev;
                    return { ...prev, [roomId]: 0 };
                });

                // Update rooms list to reflect unread count changes locally
                setRooms((prev) =>
                    prev.map((rm) => {
                        if (rm.room.id !== roomId) return rm;
                        return {
                            ...rm,
                            room: { ...rm.room, unreadCount: 0 },
                        };
                    })
                );

                // Cache it before request to avoid race condition/double triggers
                lastMarkedMessageIdRef.current[roomId] = messageId;

                if (user?.id) {
                    const msg = messagesRef.current.find((m) => m.id === messageId);
                    const createdAt = msg?.createdAt || new Date().toISOString();
                    setLastReadByUser((prev) => ({
                        ...prev,
                        [user.id]: { messageId, createdAt },
                    }));
                }

                await messageService.markAsRead(roomId, messageId);
            } catch (error) {
                console.error("[read receipt] Failed to mark room as read:", error);
                // Rollback cache on error so we can retry next time
                if (lastMarkedMessageIdRef.current[roomId] === messageId) {
                    delete lastMarkedMessageIdRef.current[roomId];
                }
            }
        }, 300);
    }, [selectedRoom, isConnected, messages, user]);

    const handleScroll = () => {
        const container = scrollContainerRef.current;
        if (!container) return;

        if (container.scrollTop < 80) {
            fetchOlderMessages();
        }

        const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight <= 100;
        isNearBottomRef.current = isAtBottom;

        if (isAtBottom) {
            setShowNewMessagesBanner(false);
            triggerMarkAsRead();
        }
    };

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;
        if (messages.length === 0) return;
        
        const isRoomSwitch = lastRoomIdRef.current !== selectedRoom?.id;
        lastRoomIdRef.current = selectedRoom?.id ?? null;
        
        if (isRoomSwitch) {
            container.scrollTop = container.scrollHeight;
            setShowNewMessagesBanner(false);
            return;
        }
        
        const lastMessage = messages[messages.length - 1];

        if (lastMessageIdRef.current === lastMessage?.id) {
            return;
        }
        lastMessageIdRef.current = lastMessage?.id ?? null;
        
        const isSelf = lastMessage && (
            (user?.id && lastMessage.author.id === user.id) ||
            (user?.username && lastMessage.author.username === user.username)
        );
        
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight <= 120;
        
        if (isNearBottom || isSelf) {
            setTimeout(() => {
                container.scrollTo({
                    top: container.scrollHeight,
                    behavior: "smooth"
                });
            }, 50);
            setShowNewMessagesBanner(false);
        } else {
            setShowNewMessagesBanner(true);
        }
    }, [messages, selectedRoom, user]);

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

    useEffect(() => {
        isNearBottomRef.current = true;

        if (!selectedRoom) {
            setLastReadByUser({});
            return;
        }

        const initialReadReceipts: Record<string, { messageId: string; createdAt: string }> = {};
        selectedRoom.roomMembers?.forEach((member: any) => {
            const lastRead = member.lastReadMessage;
            if (lastRead?.id && member.user?.id) {
                initialReadReceipts[member.user.id] = {
                    messageId: lastRead.id,
                    createdAt: lastRead.createdAt || new Date(0).toISOString()
                };
            }
        });
        setLastReadByUser(initialReadReceipts);
    }, [selectedRoom]);

    useEffect(() => {
        triggerMarkAsRead();
    }, [messages, selectedRoom, isConnected, triggerMarkAsRead]);

    useEffect(() => {
        console.debug("[read receipt] updated receipts:", lastReadByUser);
    }, [lastReadByUser]);

    const roomIdsStr = rooms.map((r) => r.room.id).join(",");
    useEffect(() => {
        if (!isConnected || !socketRef.current || rooms.length === 0) return;
        const roomIds = rooms.map((r) => r.room.id);
        console.log("[socket] subscribing to all rooms:", roomIds);
        socketRef.current.emit("restoreRooms", roomIds);
    }, [isConnected, roomIdsStr]);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                triggerMarkAsRead();
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("focus", handleVisibilityChange);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("focus", handleVisibilityChange);
        };
    }, [triggerMarkAsRead]);

    const handleComposerChange = (value: string) => {
        setMessageInput(value);
        if (!selectedRoom || !socketRef.current) return;
        const roomId = selectedRoom.id;
        const trimmed = value.trim();

        if (!trimmed) {
            stopTyping(roomId, true);
            return;
        }

        if (!typingActiveRef.current[roomId]) {
            console.debug("[typing] emit typingStart", { roomId, userId: user?.id });
            socketRef.current.emit("typingStart", roomId);
            typingActiveRef.current[roomId] = true;
        }

        if (typingStopTimeoutRef.current) {
            window.clearTimeout(typingStopTimeoutRef.current);
        }
        typingStopTimeoutRef.current = window.setTimeout(() => {
            stopTyping(roomId, true);
        }, 1500);
    };

    const activeTypingUsernames = getTypingUsernamesForRoom(selectedRoom?.id);

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
            <div className="relative h-screen h-[100dvh] overflow-hidden bg-[var(--bg-charcoal)] text-[var(--text-primary)]">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(242,242,239,0.02),transparent_50%)]" />
                <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-[var(--border-muted)]" />
                <div className="relative grid h-full grid-cols-1 gap-0 p-0 md:grid-cols-[290px_minmax(0,1fr)] md:gap-2.5 md:p-2.5 xl:grid-cols-[310px_minmax(0,1fr)]">
                    <div className="hidden min-h-0 md:block">
                            {roomsError && (
                                <div className="mb-2 p-2 text-sm text-red-400">{roomsError}</div>
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
                            onlineUsers={onlineUsers}
                            typingUsersByRoom={typingUsersByRoom}
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
                            onCreateDM={handleCreateDM}
                            discoverRooms={discoverRooms}
                            onJoinRoom={handleJoinRoom}
                        />
                    </div>

                    <main className="flex min-h-0 min-w-0 flex-col overflow-hidden border-[var(--border-muted)] bg-gradient-to-b from-[var(--bg-graphite)] to-[rgba(18,18,17,0.98)] shadow-[0_20px_50px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.015)] md:rounded-[1.25rem] md:border">
                        <ChatHeader
                            room={selectedRoom}
                            isConnected={isConnected}
                            onOpenRooms={() => setIsMobileRoomsOpen(true)}
                            currentUser={user}
                            onlineUsers={onlineUsers}
                        />
                        <AnimatePresence>
                            {!isConnected && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2, ease: "easeInOut" }}
                                    className="flex w-full overflow-hidden items-center justify-center gap-2 border-b border-amber-500/15 bg-[rgba(245,158,11,0.05)] px-4 py-2 text-center text-[11px] font-medium text-amber-200/95 backdrop-blur-xl"
                                >
                                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
                                    <span>
                                        Connection lost. {isReconnecting ? "Reconnecting..." : "Disconnected."}
                                        {lastDisconnectReason && ` [Reason: ${lastDisconnectReason}]`}
                                    </span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <section 
                            ref={scrollContainerRef}
                            onScroll={handleScroll}
                            className="relative min-h-0 flex-1 overflow-y-auto bg-[radial-gradient(circle_at_50%_0%,rgba(242,242,239,0.018),transparent_55%)]"
                        >
                            <div className="pointer-events-none absolute inset-0 opacity-[0.02] bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-size-[56px_56px]" />
                            {selectedRoom ? (
                                <>
                                        {messagesError && (
                                            <div className="p-3 text-sm text-red-400">
                                                {messagesError}
                                            </div>
                                        )}
                                    <MessageList
                                        messages={messages}
                                        isLoading={isMessagesLoading}
                                        isFetchingOlder={isFetchingOlderMessages}
                                        currentUserId={user?.id}
                                        currentUsername={user?.username}
                                        currentUserAvatar={getUserAvatar()}
                                        onlineUsers={onlineUsers}
                                        lastReadByUser={lastReadByUser}
                                        selectedRoom={selectedRoom}
                                        onDelete={async (messageId) => {
                                            if (!selectedRoom) return;
                                            try {
                                                await messageService.deleteMessage(selectedRoom.id, messageId);
                                            } catch (error: any) {
                                                console.error("Error deleting message:", error);
                                                const errMsg = error.response?.data?.message || "Failed to delete message";
                                                showToast(errMsg, "error");
                                            }
                                        }}
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
                                        typingUsers={activeTypingUsernames}
                                        onRetry={handleRetryMessage}
                                    />
                                    <div ref={messagesEndRef} />
                                    {showNewMessagesBanner && (
                                        <div className="sticky bottom-4 left-1/2 -translate-x-1/2 z-30 w-max mx-auto shadow-lg">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const container = scrollContainerRef.current;
                                                    if (container) {
                                                        container.scrollTo({
                                                            top: container.scrollHeight,
                                                            behavior: "smooth"
                                                        });
                                                    }
                                                    setShowNewMessagesBanner(false);
                                                }}
                                                className="flex items-center gap-1.5 rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(22,22,21,0.85)] px-3 py-1.5 text-[10.5px] font-medium text-[var(--accent-teal)] shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-md transition-all duration-200 hover:bg-[rgba(22,22,21,0.95)] hover:scale-103 active:scale-98 cursor-pointer select-none"
                                            >
                                                New messages <span className="text-[11px]">↓</span>
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="relative flex h-full items-center justify-center p-6 text-center">
                                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(242,242,239,0.015),transparent_45%)]" />
                                    <div className="relative max-w-sm">
                                        <div className="mx-auto mb-4.5 flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border-muted)] bg-[var(--bg-charcoal)] shadow-[0_8px_20px_rgba(0,0,0,0.3)]">
                                            <svg viewBox="0 0 24 24" className="h-5 w-5 text-[var(--text-secondary)]" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 0 1-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8Z" />
                                            </svg>
                                        </div>
                                        <h1 className="text-sm font-medium tracking-tight text-[var(--text-primary)]">
                                            Select a conversation
                                        </h1>
                                        <p className="mt-2 text-xs leading-relaxed text-[var(--text-secondary)]">
                                            Choose an active room from the sidebar or create a new space to connect instantly.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </section>
                        <TypingIndicator typingUsernames={activeTypingUsernames} />
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
                            uploadProgress={uploadProgress}
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
                                    onlineUsers={onlineUsers}
                                    typingUsersByRoom={typingUsersByRoom}
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
                                    onCreateDM={handleCreateDM}
                                    discoverRooms={discoverRooms}
                                    onJoinRoom={handleJoinRoom}
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
                    discoverRooms={discoverRooms}
                    onJoinRoom={handleJoinRoom}
                />
            </div>
        </PageTransition>
    );
};

export default ChatPage;
