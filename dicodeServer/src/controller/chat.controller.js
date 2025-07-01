import Chat from "../models/chat.model.js";
import Room from "../models/room.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import apiResponse from "../utils/apiResponse.js";

const sendMessage = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { roomId } = req.params;
  const { content } = req.body;

  if (!content)
    return res.status(400).json(new apiResponse(400, {}, "Message content is required"));

  const room = await Room.findById(roomId);
  if (!room)
    return res.status(404).json(new apiResponse(404, {}, "Room not found"));

  const isMember = room.members.some(m => m.user.toString() === userId);
  if (!isMember)
    return res.status(403).json(new apiResponse(403, {}, "Not a member of this room"));

  const message = await Chat.create({
    room: roomId,
    sender: userId,
    content,
  });

  return res.status(201).json(new apiResponse(201, message, "Message sent"));
});

const getChats = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { roomId } = req.params;

  const room = await Room.findById(roomId);
  if (!room)
    return res.status(404).json(new apiResponse(404, {}, "Room not found"));

  const isMember = room.members.some(m => m.user.toString() === userId);
  if (!isMember)
    return res.status(403).json(new apiResponse(403, {}, "Not a member of this room"));

  const chats = await Chat.find({ room: roomId })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate("sender", "username avatar");

  return res.status(200).json(new apiResponse(200, chats, "Fetched last 10 messages"));
});

export{
    sendMessage,
    getChats
}
