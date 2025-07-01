import asyncHandler from "../utils/asyncHandler.js";
import apiResponse from "../utils/apiResponse.js";
import FriendShip from "../models/friendship.model.js";
import User from "../models/user.model.js";
import { isValidObjectId } from "mongoose";

export const sendFriendRequest = asyncHandler(async (req, res) => {
  const from = req.user._id;
  const { to } = req.body;

  if (!isValidObjectId(to)) {
    return res.status(400).json(new apiResponse(400, {}, "User is missing"));
  }

  if (from.toString() === to)
    return res.status(400).json(new apiResponse(400, {}, "Cannot send request to yourself"));

  const alreadyFriends = await User.findOne({ _id: from, friends: to });
  if (alreadyFriends)
    return res.status(400).json(new apiResponse(400, {}, "User is already your friend"));

  const existingRequest = await FriendShip.findOne({
    $or: [
      { from, to },
      { from: to, to: from }
    ],
    status: "pending"
  });

  if (existingRequest)
    return res.status(400).json(new apiResponse(400, {}, "Friend request already exists"));

  const request = await FriendShip.create({ from, to });

  return res.status(200).json(new apiResponse(200, request, "Friend request sent"));
});


export const cancelFriendRequest = asyncHandler(async (req, res) => {
  const from = req.user._id;
  const { to } = req.body;

  if (!isValidObjectId(to)) {
    return res.status(400).json(new apiResponse(400, {}, "User is missing"));
  }

  const deleted = await FriendShip.findOneAndDelete({ from, to, status: "pending" });

  if (!deleted)
    return res.status(404).json(new apiResponse(404, {}, "No pending request to cancel"));

  return res.status(200).json(new apiResponse(200, {}, "Friend request cancelled"));
});


export const acceptFriendRequest = asyncHandler(async (req, res) => {
  const to = req.user._id;
  const { from } = req.body;

  if (!isValidObjectId(from)) {
    return res.status(400).json(new apiResponse(400, {}, "User is missing"));
  }


  const request = await FriendShip.findOne({ from, to, status: "pending" });

  if (!request)
    return res.status(404).json(new apiResponse(404, {}, "No pending request to accept"));

  request.status = "accepted";
  await request.save();

  await User.findByIdAndUpdate(from, { $addToSet: { friends: to } });
  await User.findByIdAndUpdate(to, { $addToSet: { friends: from } });

  return res.status(200).json(new apiResponse(200, {}, "Friend request accepted"));
});


export const rejectFriendRequest = asyncHandler(async (req, res) => {
  const to = req.user._id;
  const { from } = req.body;

  const request = await FriendShip.findOne({ from, to, status: "pending" });

  if (!request)
    return res.status(404).json(new apiResponse(404, {}, "No pending request to reject"));

  request.status = "rejected";
  await request.save();

  return res.status(200).json(new apiResponse(200, {}, "Friend request rejected"));
});


export const getPendingRequests = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const requests = await FriendShip.find({ to: userId, status: "pending" })
    .populate("from", "name username email avatar");

  return res.status(200).json(new apiResponse(200, requests, "Pending requests received"));
});


export const getFriendsList = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("friends", "name username email avatar");

  return res.status(200).json(new apiResponse(200, user.friends, "Friends list fetched"));
});



