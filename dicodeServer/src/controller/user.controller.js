import User from "../models/user.model.js";
import FriendShip from "../models/friendship.model.js";
import apiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"

const registerUser = asyncHandler(async (req, res) => {
    const { name, username, email, password } = req.body;

    if (!name || !username || !password || !email) {
        return res
            .status(400)
            .json(new apiResponse(400, {}, "Please enter all fields"));
    }

    const existingUser = await User.findOne({
        $or: [{ email }, { username }],
    });

    if (existingUser) {
        return res
            .status(400)
            .json(new apiResponse(400, {}, "Email or username already registered"));
    }


    const newUser = await User.create({
        name,
        email,
        username,
        password: password,
    });


    if (!newUser) {
        return res
            .status(400)
            .json(new apiResponse(400, {}, "User registration failed"));
    }

    return res
        .status(200)
        .json(new apiResponse(
            200,
            {},
            "User registered successfully."
        ));
});

const loginUser = asyncHandler(async (req, res) => {
    const { usernameOrEmail, password } = req.body;

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
    await user.save();

    const newUser = await User.findById(user._id).select("-password -refreshToken -otp");

    const optionsForAccessToken = {
        maxAge: 1000 * 60 * 60 * 24 * 1,
        httpOnly: true,
        secure: process.env.NODE_ENV == "production",
    };

    const optionsForRefreshToken = {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
        secure: process.env.NODE_ENV == "production",
    };

    return res
        .cookie("accessToken", accessToken, optionsForAccessToken)
        .cookie("refreshToken", refreshToken, optionsForRefreshToken)
        .status(200)
        .json(new apiResponse(200, newUser, "Login successful"));
});

const logoutUser = asyncHandler(async (req, res) => {
    const accessToken = req.cookies?.accessToken;
    if (!accessToken)
        return res.status(400).json(new apiResponse(400, {}, "Please login first"));
    const decodedToken = await jwt.decode(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET
    );
    if (!decodedToken)
        return res.status(400).json(new apiResponse(400, {}, "Please login first"));

    const user = await User.findById(decodedToken.id);
    if (!user)
        return res.status(400).json(new apiResponse(400, {}, "Please login first"));

    user.refreshToken = undefined;
    await user.save();

    return res
        .clearCookie("refreshToken")
        .clearCookie("accessToken")
        .json(new apiResponse(200, {}, "Logout successful"));
});

// const getAllUsers = asyncHandler(async (req, res) => {
//     const users = await User.find({}).select("-refreshToken -password");
//     res.status(200).json(new apiResponse(200, users, "All users fetched successfully"))
// })


const findFriends = asyncHandler(async (req, res) => {
    const currentUserId = req.user._id;

    const currentUser = await User.findById(currentUserId).select("friends");

    const pendingRequests = await FriendShip.find({
        $or: [{ from: currentUserId }, { to: currentUserId }],
        status: "pending"
    });

    const pendingIds = new Set();
    pendingRequests.forEach(req => {
        pendingIds.add(req.from.toString());
        pendingIds.add(req.to.toString());
    });

    const excludedIds = [
        currentUserId,
        ...currentUser.friends.map(id => id.toString()),
        ...Array.from(pendingIds)
    ];

    const users = await User.find({
        _id: { $nin: excludedIds }
    }).select("_id name username email avatar");

    return res.status(200).json(new apiResponse(200, users, "Users available to send friend request"));
});


export {
    registerUser,
    loginUser,
    logoutUser,
    findFriends
}