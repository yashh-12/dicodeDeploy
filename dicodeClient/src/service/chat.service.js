const sendMessage = async (roomId, content) => {
  try {
    const res = await fetch(`https://dicode.onrender.com/api/chats/send/${roomId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({ content })
    });

    return await res.json();
  } catch (error) {
    console.error("Error sending message:", error);
    return { success: false, error: error.message };
  }
};


const getChats = async (roomId) => {
  try {
    const res = await fetch(`https://dicode.onrender.com/api/chats/${roomId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include"
    });

    return await res.json();
  } catch (error) {
    console.error("Error fetching chats:", error);
    return { success: false, error: error.message };
  }
};

export {
  sendMessage,
  getChats
};
