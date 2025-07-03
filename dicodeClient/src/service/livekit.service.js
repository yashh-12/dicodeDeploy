const getLiveKitToken = async (roomId) => {
    try {
        const res = await fetch(`http://localhost:8059/api/livekit/token/${roomId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include"
        });

        return await res.json();
    } catch (error) {
        console.error("Error getting LiveKit token:", error);
        return { success: false, error: error.message };
    }
};

export {
    getLiveKitToken
};
