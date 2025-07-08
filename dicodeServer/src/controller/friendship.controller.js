import asyncHandler from "../utils/asyncHandler.js";
import apiResponse from "../utils/apiResponse.js";
import FriendShip from "../models/friendship.model.js";
import User from "../models/user.model.js";
import { isValidObjectId } from "mongoose";

export const sendFriendRequest = asyncHandler(async (req, res) => {
  const from = req?.user?._id;
  const { to } = req.body || {};

  if (!req.body || !to || !isValidObjectId(to)) {
    return res.status(400).json(new apiResponse(400, {}, "User is missing or invalid"));
  }

  if (from.toString() === to)
    return res.status(400).json(new apiResponse(400, {}, "Cannot send request to yourself"));

  const alreadyFriends = await User.findOne({ _id: from, friends: to });
  if (alreadyFriends)
    return res.status(400).json(new apiResponse(400, {}, "User is already your friend"));

  const existingRequest = await FriendShip.findOne({
    $or: [{ from, to }, { from: to, to: from }],
    status: "pending"
  });

  if (existingRequest)
    return res.status(400).json(new apiResponse(400, {}, "Friend request already exists"));

  const request = await FriendShip.create({ from, to });

  return res.status(200).json(new apiResponse(200, request, "Friend request sent"));
});


export const cancelFriendRequest = asyncHandler(async (req, res) => {
  const from = req?.user?._id;
  const { to } = req.body || {};

  if (!req.body || !to || !isValidObjectId(to)) {
    return res.status(400).json(new apiResponse(400, {}, "User is missing or invalid"));
  }

  const deleted = await FriendShip.findOneAndDelete({ from, to, status: "pending" });

  if (!deleted)
    return res.status(404).json(new apiResponse(404, {}, "No pending request to cancel"));

  return res.status(200).json(new apiResponse(200, {}, "Friend request cancelled"));
});


export const acceptFriendRequest = asyncHandler(async (req, res) => {
  const to = req?.user?._id;
  const { from } = req.body || {};

  if (!req.body || !from || !isValidObjectId(from)) {
    return res.status(400).json(new apiResponse(400, {}, "User is missing or invalid"));
  }

  const request = await FriendShip.findOne({ from, to, status: "pending" });

  if (!request)
    return res.status(404).json(new apiResponse(404, {}, "No pending request to accept"));

  request.status = "accepted";

  try {

    await request.save();

    await User.findByIdAndUpdate(from, { $addToSet: { friends: to } });
    await User.findByIdAndUpdate(to, { $addToSet: { friends: from } });

  } catch (error) {
    return res.status(400).json(new apiResponse(400, {}, "Something went wrong"));

  }
  return res.status(200).json(new apiResponse(200, {}, "Friend request accepted"));
});


export const rejectFriendRequest = asyncHandler(async (req, res) => {
  const to = req?.user?._id;
  const { from } = req.body || {};

  if (!req.body || !from || !isValidObjectId(from)) {
    return res.status(400).json(new apiResponse(400, {}, "User is missing or invalid"));
  }

  const request = await FriendShip.findOne({ from, to, status: "pending" });

  if (!request)
    return res.status(404).json(new apiResponse(404, {}, "No pending request to reject"));

  request.status = "rejected";
  try {

    await request.save();

  } catch (error) {
    return res.status(400).json(new apiResponse(400, {}, "Something went wrong"));

  }
  return res.status(200).json(new apiResponse(200, {}, "Friend request rejected"));
});


export const getPendingRequests = asyncHandler(async (req, res) => {
  const userId = req?.user?._id;

  if (!userId || !isValidObjectId(userId)) {
    return res.status(400).json(new apiResponse(400, {}, "Invalid user ID"));
  }

  const requests = await FriendShip.find({ to: userId, status: "pending" })
    .populate("from", "name username email avatar");

  return res.status(200).json(new apiResponse(200, requests, "Pending requests received"));
});


export const getFriendsList = asyncHandler(async (req, res) => {
  const userId = req?.user?._id;

  if (!userId || !isValidObjectId(userId)) {
    return res.status(400).json(new apiResponse(400, {}, "Invalid user ID"));
  }

  const user = await User.findById(userId).populate("friends", "name username email avatar");

  if (!user) {
    return res.status(404).json(new apiResponse(404, {}, "User not found"));
  }

  return res.status(200).json(new apiResponse(200, user.friends, "Friends list fetched"));
});


export const removeFriend = asyncHandler(async (req, res) => {
  const userId = req?.user?._id;
  const { friendId } = req.body || {};

  if (!req.body || !friendId || !isValidObjectId(friendId)) {
    return res.status(400).json(new apiResponse(400, {}, "Invalid friend ID"));
  }

  const user = await User.findById(userId);
  const friend = await User.findById(friendId);

  if (!user || !friend) {
    return res.status(404).json(new apiResponse(404, {}, "User not found"));
  }

  if (!user.friends.includes(friendId)) {
    return res.status(400).json(new apiResponse(400, {}, "You are not friends with this user"));
  }

  try {
    await User.findByIdAndUpdate(userId, { $pull: { friends: friendId } });
    await User.findByIdAndUpdate(friendId, { $pull: { friends: userId } });

    await FriendShip.findOneAndDelete({
      $or: [
        { from: userId, to: friendId },
        { from: friendId, to: userId }
      ],
      status: "accepted"
    });

  } catch (error) {
    return res.status(400).json(new apiResponse(400, {}, "Something went wrong"));

  }
  return res.status(200).json(new apiResponse(200, {}, "Friend removed successfully"));
});
