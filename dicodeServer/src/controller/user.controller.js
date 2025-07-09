import User from "../models/user.model.js";
import FriendShip from "../models/friendship.model.js";
import apiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import sendVerificationEmail from "../utils/nodeMailer.js";
import { uploadonCloudinary } from "../utils/cloudinary.js";
import bcrypt from "bcrypt"

const registerUser = asyncHandler(async (req, res) => {
    const { name, username, email, password } = req?.body || {};

    if (!name || !username || !password || !email) {
        return res
            .status(400)
            .json(new apiResponse(400, {}, "Please enter all fields"));
    }

    const existingUser = await User.findOne({
        $or: [{ email }, { username }],
    });

    if (existingUser?.email === email) {
        return res
            .status(400)
            .json(new apiResponse(400, {}, "Email is already registered"));
    }

    if (existingUser?.username === username) {
        return res
            .status(400)
            .json(new apiResponse(400, {}, "Username is already registered"));
    }

    const newUser = await User.create({
        name,
        email,
        username,
        password,
    });

    if (!newUser) {
        return res
            .status(400)
            .json(new apiResponse(400, {}, "User registration failed"));
    }

    return res.status(200).json(
        new apiResponse(200, {}, "User registered successfully.")
    );
});

const loginUser = asyncHandler(async (req, res) => {
    const { usernameOrEmail, password } = req?.body || {};

    if (!usernameOrEmail || !password) {
        return res
            .status(400)
            .json(new apiResponse(400, {}, "Email and Password is required"));
    }

    const user = await User.findOne({
        $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
    }).select("+password");

    if (!user) {
        return res
            .status(400)
            .json(new apiResponse(400, {}, "Please Signup first"));
    }

    const isMatch = await user.isCorrectPassword(password);

    if (!isMatch) {
        return res
            .status(400)
            .json(new apiResponse(400, {}, "Invalid Password"));
    }

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    user.accessToken = accessToken;
    await user.save();

    const newUser = await User.findById(user._id).select(
        "-password -refreshToken -accessToken"
    );

    const optionsForAccessToken = {
        maxAge: 1000 * 60 * 60 * 24 * 1,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none"
    };

    const optionsForRefreshToken = {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none"

    };

    return res
        .cookie("accessToken", accessToken, optionsForAccessToken)
        .cookie("refreshToken", refreshToken, optionsForRefreshToken)
        .status(200)
        .json(new apiResponse(200, newUser, "Login successful"));
});

const logoutUser = asyncHandler(async (req, res) => {
    const accessToken = req?.cookies?.accessToken;

    if (!accessToken) {
        return res
            .status(400)
            .json(new apiResponse(400, {}, "Please login first"));
    }

    const decodedToken = await jwt.decode(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET
    );

    if (!decodedToken?.id) {
        return res
            .status(400)
            .json(new apiResponse(400, {}, "Please login first"));
    }

    const user = await User.findById(decodedToken.id);
    if (!user) {
        return res
            .status(400)
            .json(new apiResponse(400, {}, "Please login first"));
    }

    user.refreshToken = undefined;
    user.accessToken = undefined;
    await user.save();

    return res
        .clearCookie("refreshToken")
        .clearCookie("accessToken")
        .json(new apiResponse(200, {}, "Logout successful"));
});

const findFriends = asyncHandler(async (req, res) => {
    const currentUserId = req?.user?._id;
    const { text } = req?.body || {};

    if (!text || text.trim() === "") {
        return res
            .status(200)
            .json(new apiResponse(200, [], "No search text provided"));
    }

    const currentUser = await User.findById(currentUserId).select("friends");

    const pendingRequests = await FriendShip.find({
        $or: [{ from: currentUserId }, { to: currentUserId }],
        status: "pending",
    });

    const pendingIds = new Set();
    pendingRequests.forEach((req) => {
        pendingIds.add(req.from.toString());
        pendingIds.add(req.to.toString());
    });

    const excludedIds = [
        currentUserId,
        ...currentUser.friends.map((id) => id.toString()),
        ...Array.from(pendingIds),
    ];

    const regex = new RegExp(text, "i");

    const users = await User.find({
        _id: { $nin: excludedIds },
        $or: [{ username: regex }, { email: regex }],
    }).select("_id name username email avatar");

    return res.status(200).json(
        new apiResponse(200, users, "Users available to send friend request")
    );
});

const getUserDetail = asyncHandler(async (req, res) => {
    const userId = req?.user?._id;

    if (!userId) {
        return res
            .status(400)
            .json(new apiResponse(400, {}, "User ID is missing"));
    }

    const user = await User.findById(userId)
        .select("-password -refreshToken -accessToken")
        .populate({
            path: "friends",
            select: "-password -refreshToken -accessToken",
        });

    if (!user) {
        return res
            .status(400)
            .json(new apiResponse(400, {}, "Please login first"));
    }

    return res
        .status(200)
        .json(new apiResponse(200, user, "Successfully fetched user"));
});

const changeUserDetails = asyncHandler(async (req, res) => {
    const { name, username, email } = req.body || {};
    if (!name || !username || !email) {
        throw new apiResponse(400, {}, "All fields are required");
    }

    const updates = {};
    if (name && name !== req.user?.name) updates.name = name;
    if (username && username !== req.user?.username) {
        const usernameTaken = await User.findOne({ username });
        if (usernameTaken) {
            return res
                .status(400)
                .json(new apiResponse(400, {}, "Username is already registered"));
        }
        updates.username = username;
    }
    if (email && email !== req.user?.email) {
        const emailTaken = await User.findOne({ email });
        if (emailTaken) {
            return res
                .status(400)
                .json(new apiResponse(400, {}, "Email is already registered"));
        }
        updates.email = email;
    }

    if (!Object.keys(updates)?.length) {
        return res
            .status(200)
            .json(new apiResponse(200, req.user, "No changes to update"));
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        { $set: updates },
        { new: true }
    );
    if (!user) {
        throw new apiResponse(400, {}, "User details update failed");
    }

    return res
        .status(200)
        .json(new apiResponse(200, user, "User details updated successfully"));
});

const uploadAvatar = asyncHandler(async (req, res) => {
    const avatar = req?.file;
    if (!avatar?.path) {
        return res.status(400).json(new apiResponse(400, {}, "No file uploaded"));
    }

    const avatarCloudinary = await uploadonCloudinary(avatar.path);
    const avatarUrl = avatarCloudinary?.url;

    if (avatarUrl) {
        const user = await User.findById(req.user?.id);
        if (user) {
            user.avatar = avatarUrl;
            await user.save();
        }
        return res.status(200).json(
            new apiResponse(200, avatarUrl, "Successfully uploaded")
        );
    }

    return res.status(400).json(new apiResponse(400, {}, "Upload failed"));
});

const sendForgotPasswordOtp = asyncHandler(async (req, res) => {
    const { emailId } = req.body || {};
    if (!emailId) {
        return res.status(400).json(new apiResponse(400, {}, "Email is required"));
    }

    const user = await User.findOne({ email: emailId });
    if (!user) {
        return res.status(404).json(new apiResponse(404, {}, "User not found"));
    }

    const otp = await sendVerificationEmail(emailId);
    console.log(otp);

    const hashedOtp = await bcrypt.hash(otp.toString(), 12);

    const optionsForOtp = {
        maxAge: 1000 * 60 * 5,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none"
    };

    const newToken = jwt.sign(
        { hashedOtp, emailId },
        process.env.OTP_SECRET,
        { expiresIn: "5m" }
    );

    res
        .status(200)
        .cookie("forgotPwdVerify", newToken, optionsForOtp)
        .json(new apiResponse(200, {}, "OTP sent successfully for password reset"));
});

const resetForgotPassword = asyncHandler(async (req, res) => {
    const { otp, newPassword, confirmPassword } = req.body || {};
    const token = req.cookies?.forgotPwdVerify;

    if (!token) {
        return res
            .status(401)
            .json(new apiResponse(401, {}, "Reset session expired. Please verify OTP again."));
    }

    let decoded;
    try {
        decoded = jwt.decode(token, process.env.OTP_SECRET) || {};
    } catch {
        return res
            .status(401)
            .json(new apiResponse(401, {}, "Invalid or expired reset token."));
    }

    const { emailId, hashedOtp } = decoded;
    if (!emailId || !otp || !newPassword || !confirmPassword) {
        return res
            .status(400)
            .json(new apiResponse(400, {}, "All fields are required."));
    }

    const isMatch = await bcrypt.compare(otp.toString(), hashedOtp);
    if (!isMatch) {
        return res.status(400).json(new apiResponse(400, {}, "Incorrect OTP."));
    }

    if (newPassword !== confirmPassword) {
        return res
            .status(400)
            .json(new apiResponse(400, {}, "Passwords do not match."));
    }

    const user = await User.findOne({ email: emailId });
    if (user) {
        user.password = newPassword;
        try {
            await user.save();
        } catch {
            return res
                .status(500)
                .json(new apiResponse(500, {}, "Something went wrong"));
        }
    }

    res
        .clearCookie("forgotPwdVerify")
        .status(200)
        .json(new apiResponse(200, {}, "Password has been reset successfully. You can now login."));
});

const changePassword = asyncHandler(async (req, res) => {
    const { usernameOrEmail, password, newPassword } = req.body || {};
    if (!usernameOrEmail || !password) {
        throw new apiResponse(400, {}, "All fields are required");
    }

    const user = await User.findOne({
        $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
    }).select("+password");
    if (!user) throw new apiResponse(404, {}, "User not found");

    const isMatch = await user.isCorrectPassword(password);
    if (!isMatch) throw new apiResponse(400, {}, "Incorrect password");

    const hashedNew = newPassword ? await bcrypt.hash(newPassword, 10) : null;
    if (!hashedNew) throw new apiResponse(400, {}, "New password is required");

    const updatedData = await User.findByIdAndUpdate(
        user._id,
        { $set: { password: hashedNew } },
        { new: true }
    );

    res
        .status(200)
        .json(new apiResponse(200, updatedData, "Password changed successfully"));
});


export {
    registerUser,
    loginUser,
    logoutUser,
    findFriends,
    getUserDetail,
    changePassword,
    changeUserDetails,
    sendForgotPasswordOtp,
    resetForgotPassword,
    uploadAvatar
};
