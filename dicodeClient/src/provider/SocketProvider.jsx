import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    useEffect(() => {


        const newSocket = io('https://dicode.onrender.com', {
            transports: ['websocket'],
            withCredentials: true,
        });

        newSocket.on("connect", () => {
            console.log("Connected to socket server ", newSocket?.id);
        });

        newSocket.on("disconnect", () => {
            console.log("Disconnected from socket server");
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
            console.log(" Socket cleaned up");
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};

export default function useSocket() {
    return useContext(SocketContext);
}
