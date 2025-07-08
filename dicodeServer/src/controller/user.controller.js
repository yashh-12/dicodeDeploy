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

    if (existingUser.email == email) {
        return res
            .status(400)
            .json(new apiResponse(400, {}, "Email is already registered"));
    }

    if (existingUser.username == username) {
        return res
            .status(400)
            .json(new apiResponse(400, {}, "Username is already registered"));
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
    user.accessToken = accessToken;
    await user.save();

    const newUser = await User.findById(user._id).select("-password -refreshToken -accessToken");

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
    user.accessToken = undefined;
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
    const { text } = req.body;

    if (!text || text.trim() === "") {
        return res.status(200).json(new apiResponse(200, [], "No search text provided"));
    }


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

    const regex = new RegExp(text, "i"); // case-insensitive search

    const users = await User.find({
        _id: { $nin: excludedIds },
        $or: [
            { username: regex },
            { email: regex }
        ]
    }).select("_id name username email avatar");

    console.log(users);


    return res.status(200).json(new apiResponse(200, users, "Users available to send friend request"));
});


const getUserDetail = asyncHandler(async (req, res) => {
    const userId = req?.user?._id;

    console.log("userId", userId);


    const user = await User.findById(userId)
        .select("-password -refreshToken -accessToken")
        .populate({
            path: "friends",
            select: "-password -refreshToken -accessToken" 
        });

    if (!user)
        return res.status(400).json(new apiResponse(400, {}, "Please login first"));

    return res.status(200).json(new apiResponse(200, user, "Successfully fetched user"));

})

export {
    registerUser,
    loginUser,
    logoutUser,
    findFriends,
    getUserDetail
}