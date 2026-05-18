import { useEffect, useState } from "react";
import { roomService } from "../services/room.service";
import { messageService } from "../services/message.service";

interface RoomMember {
    room: {
        id: string;
        name: string;
    };
}

interface Message {
    id: string;
    content: string;
    author: {
        username: string;
    }
}

const ChatPage = () => {
    const [rooms, setRooms] = useState<RoomMember[]>([]);
    const [roomName, setRoomName] = useState("");
    const [selectedRoom, setSelectedRoom] = useState<{
        id: string;
        name: string;
    } | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageInput, setMessageInput] = useState("");

    const handleCreateRoom = async () => {
        try {
            const response = await roomService.createRoom(roomName);
            setRooms((prevRooms) => [...prevRooms, { room: response.data.data }]);
            setRoomName("");
        } catch (error) {
            console.error("Error creating room:", error);
        }
    };
    const handleSendMessage = async () => {
        if (!selectedRoom || !messageInput.trim()) return;
        try {
            const response = await messageService.sendMessage(selectedRoom.id, messageInput);
            setMessages((prevMessages) => [...prevMessages, response.data]);
            setMessageInput("");
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };
    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const response = await roomService.getRooms();
                setRooms(response.data);
                console.log("Fetched rooms:", response.data);
            } catch (error) {
                console.error("Error fetching rooms:", error);
            }
        };

        fetchRooms();
    }, []);

    useEffect(() => {
        if (!selectedRoom) return;
        const fetchMessages = async () => {
            try {
                const response = await messageService.getRoomMessages(selectedRoom.id);
                setMessages(response.data);
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        };
        fetchMessages();
    }, [selectedRoom]);

    return (
        <div>
            <h1>Chat</h1>
            <div>
                <input
                    type="text"
                    placeholder="Room name"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                />

                <button onClick={handleCreateRoom}>Create Room</button>
            </div>
            {rooms.map((roomMember) => (
                <div
                    key={roomMember.room.id}
                    onClick={() => setSelectedRoom(roomMember.room)}
                >
                    {" "}
                    <h2>{roomMember.room.name}</h2>
                </div>
            ))}
            {selectedRoom && (
                <div>
                    <h2>
                        Active Room:
                        {selectedRoom.name}
                    </h2>
                </div>
            )}
            <div>
                {messages.map((message) => (
                    <div key={message.id}>
                        <strong>
                            {message.author.username}
                        </strong>
                        <p>
                            {message.content}
                        </p>
                    </div>
                ))}
            </div>
            {selectedRoom && (
                <div>
                    <input
                        type="text"
                        placeholder="Type message..."
                        value={messageInput}
                        onChange={(e) =>
                            setMessageInput(
                                e.target.value
                            )
                        }
                    />
                    <button
                        onClick={
                            handleSendMessage
                        }
                    >
                        Send
                    </button>
                </div>
            )}
        </div>
    );
};

export default ChatPage;
