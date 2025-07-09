const registerUser = async ({ name, username, email, password }) => {
  try {
    const res = await fetch("https://dicodedeploy.onrender.com/api/users/register", {
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
    const res = await fetch("https://dicodedeploy.onrender.com/api/users/login", {
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
    const res = await fetch("https://dicodedeploy.onrender.com/api/users/logout", {
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
    const res = await fetch("https://dicodedeploy.onrender.com/api/users/", {
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
    const res = await fetch("https://dicodedeploy.onrender.com/api/users/find-friends", {
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

const changePassword = async (usernameOrEmail, password, newPassword) => {
  try {
    const res = await fetch("https://dicodedeploy.onrender.com/api/users/changePassword", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        usernameOrEmail,
        password,
        newPassword
      }),
      credentials: "include",
    })
    return res.json()
  } catch (error) {
    console.log(error);

  }

}

const changeUserDetails = async (name, username, email) => {
  try {
    const res = await fetch("https://dicodedeploy.onrender.com/api/users/changeUserDetails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        username,
        email

      }),
      credentials: "include",
    })
    return res.json()
  } catch (error) {
    console.log(error.message);

  }

}

const uploadAvatar = async (avatar) => {
  try {
    const formData = new FormData();
    formData.append("avatar", avatar);

    const res = await fetch("https://dicodedeploy.onrender.com/api/users/uploadAvatar", {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    return await res.json();
  } catch (error) {
    console.error("Upload error:", error.message);
    return { success: false, message: error.message };
  }
};

const verifyOtpPassword = async (otp, emailId, newPassword, confirmPassword) => {
  try {
    const res = await fetch(`https://dicodedeploy.onrender.com/api/users/verifyotppwd/${emailId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        otp,
        newPassword,
        confirmPassword
      }),
    })
    return res.json()
  } catch (error) {
    console.log(error);

  }

}

const sendOtpForfgtPwd = async (emailId) => {
  try {
    const res = await fetch(`https://dicodedeploy.onrender.com/api/users/sendOtpFgPwd`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        emailId
      })
    })
    return res.json()
  } catch (error) {
    console.log(error?.message);
  }
}

export {
  registerUser,
  loginUser,
  logoutUser,
  findFriends,
  getUserDetails,
  changePassword,
  changeUserDetails,
  uploadAvatar,
  verifyOtpPassword,
  sendOtpForfgtPwd
};
