const registerUser = async ({ name, username, email, password }) => {
  try {
    const res = await fetch("http://localhost:8059/api/users/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({ name, username, email, password })
    });

    return await res.json();
  } catch (error) {
    console.error("Error registering user:", error);
    return { success: false, error: error.message };
  }
};


const loginUser = async ({ usernameOrEmail, password }) => {
  try {
    const res = await fetch("http://localhost:8059/api/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({ usernameOrEmail, password })
    });

    return await res.json();
  } catch (error) {
    console.error("Error logging in:", error);
    return { success: false, error: error.message };
  }
};



const logoutUser = async () => {
  try {
    const res = await fetch("http://localhost:8059/api/users/logout", {
      method: "POST",
      credentials: "include"
    });

    return await res.json();
  } catch (error) {
    console.error("Error logging out:", error);
    return { success: false, error: error.message };
  }
};

const getUserDetails = async () => {
  try {
    const res = await fetch("http://localhost:8059/api/users/", {
      method: "GET",
      credentials: "include"
    });

    return await res.json();
  } catch (error) {
    console.error("Error finding out user:", error);
    return { success: false, error: error.message };
  }
};


const findFriends = async (text) => {
  try {
    const res = await fetch("http://localhost:8059/api/users/find-friends", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text
      }),
      credentials: "include"
    });

    return await res.json();
  } catch (error) {
    console.error("Error finding friends:", error);
    return { success: false, error: error.message };
  }
};

export {
  registerUser,
  loginUser,
  logoutUser,
  findFriends,
  getUserDetails
};
