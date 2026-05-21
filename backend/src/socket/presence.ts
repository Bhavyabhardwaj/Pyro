const onlineUsers = new Map<string, string>();

export const presenceService = {
    addUser: (userId: string, socketId: string) => {
        onlineUsers.set(userId, socketId);
    },
    removeUser: (socketId: string) => {
        for(const [userId, sId] of onlineUsers.entries()) {
            if(sId === socketId) {
                onlineUsers.delete(userId);
                return userId;
            }
        }
        return null;
    },
    isUserOnline: (userId: string) => {
        return onlineUsers.has(userId);
    },
    getOnlineUsers: () => {
        return Array.from(onlineUsers.keys());
    }
}