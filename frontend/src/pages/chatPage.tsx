import { useEffect, useState } from "react";
import { roomService } from "../services/room.service";

interface RoomMember {
    room: {
        id: string;
        name: string;
    };
}

const ChatPage = () => {
    const [rooms, setRooms] = useState<RoomMember[]>([]);
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

    return (
        <div>
            <h1>Chat</h1>
            {rooms.map((roomMember) => (
                <div key={roomMember.room.id}>
                    <h2>
                        {roomMember.room.name}
                    </h2>
                </div>
            ))}
        </div>
    );
};

export default ChatPage;
