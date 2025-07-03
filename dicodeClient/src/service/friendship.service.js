const sendFriendRequest = async (to) => {
  try {
    const res = await fetch("http://localhost:8059/api/friends/request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({ to })
    });
    return await res.json();
  } catch (err) {
    console.error("Error sending friend request:", err);
    return { success: false, error: err.message };
  }
};


const cancelFriendRequest = async (to) => {
  try {
    const res = await fetch("http://localhost:8059/api/friends/request", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({ to })
    });
    return await res.json();
  } catch (err) {
    console.error("Error canceling friend request:", err);
    return { success: false, error: err.message };
  }
};


const acceptFriendRequest = async (from) => {
  try {
    const res = await fetch("http://localhost:8059/api/friends/accept", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({ from })
    });
    return await res.json();
  } catch (err) {
    console.error("Error accepting friend request:", err);
    return { success: false, error: err.message };
  }
};


const rejectFriendRequest = async (from) => {
  try {
    const res = await fetch("http://localhost:8059/api/friends/reject", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({ from })
    });
    return await res.json();
  } catch (err) {
    console.error("Error rejecting friend request:", err);
    return { success: false, error: err.message };
  }
};


const getPendingRequests = async () => {
  try {
    const res = await fetch("http://localhost:8059/api/friends/pending", {
      method: "GET",
      credentials: "include"
    });
    return await res.json();
  } catch (err) {
    console.error("Error fetching pending requests:", err);
    return { success: false, error: err.message };
  }
};


const getFriendsList = async () => {
  try {
    const res = await fetch("http://localhost:8059/api/friends/list", {
      method: "GET",
      credentials: "include"
    });
    return await res.json();
  } catch (err) {
    console.error("Error fetching friend list:", err);
    return { success: false, error: err.message };
  }
};

export {
  sendFriendRequest,
  cancelFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getPendingRequests,
  getFriendsList
};
