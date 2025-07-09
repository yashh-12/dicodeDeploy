const createRoom = async (name) => {
    try {
        const res = await fetch("http://localhost:8059/api/rooms/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ name })
        });

        return await res.json();
    } catch (error) {
        console.error("Error creating room:", error);
        return { success: false, error: error.message };
    }
};


const getAllRooms = async () => {
    try {
        const res = await fetch("http://localhost:8059/api/rooms/", {
            method: "GET",
            credentials: "include"
        });        
        return await res.json();
    } catch (error) {
        console.error("Error fetching rooms:", error);
        return { success: false, error: error.message };
    }
};

const getRoomDetails = async (roomId) => {
    try {
        const res = await fetch(`http://localhost:8059/api/rooms/room/${roomId}`, {
            method: "GET",
            credentials: "include"
        });        
        return await res.json();
    } catch (error) {
        console.error("Error fetching rooms:", error);
        return { success: false, error: error.message };
    }
};


const joinRoom = async (roomId) => {
    try {
        const res = await fetch(`http://localhost:8059/api/rooms/join/${roomId}`, {
            method: "POST",
            credentials: "include"
        });

        return await res.json();
    } catch (error) {
        console.error("Error joining room:", error);
        return { success: false, error: error.message };
    }
};


const leaveRoom = async (roomId) => {
    try {
        const res = await fetch(`http://localhost:8059/api/rooms/leave/${roomId}`, {
            method: "POST",
            credentials: "include"
        });

        return await res.json();
    } catch (error) {
        console.error("Error leaving room:", error);
        return { success: false, error: error.message };
    }
};


const deleteRoom = async (roomId) => {
    try {
        const res = await fetch(`http://localhost:8059/api/rooms/${roomId}`, {
            method: "DELETE",
            credentials: "include"
        });

        return await res.json();
    } catch (error) {
        console.error("Error deleting room:", error);
        return { success: false, error: error.message };
    }
};

export {
    createRoom,
    getAllRooms,
    joinRoom,
    leaveRoom,
    deleteRoom,
    getRoomDetails
};
