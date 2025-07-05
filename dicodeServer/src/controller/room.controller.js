import Room from "../models/room.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import apiResponse from "../utils/apiResponse.js";

const createRoom = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { name } = req.body;

    if (!name) {
        return res
            .status(400)
            .json(new apiResponse(400, {}, "Room name is required"));
    }

    // Create the room
    const newRoom = await Room.create({
        name,
        creator: userId,
        members: [{ user: userId, role: "editor" }],
    });

    // Populate creator with full details
    const populatedRoom = await Room.findById(newRoom._id)
        .populate("creator", "username email avatar")
        .populate("members.user", "username")
        .select("name creator");

    return res.status(201).json(
        new apiResponse(201, populatedRoom, "Room created")
    );
});

const deleteRoom = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { roomId } = req.params;

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json(new apiResponse(404, {}, "Room not found"));
    if (room.creator.toString() !== userId)
        return res.status(403).json(new apiResponse(403, {}, "Only creator can delete room"));

    await Room.findByIdAndDelete(roomId);
    return res.status(200).json(new apiResponse(200, {}, "Room deleted"));
});

const joinRoom = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { roomId } = req.params;

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json(new apiResponse(404, {}, "Room not found"));

    const isMember = room.members.some(m => m.user.toString() === userId);
    if (!isMember) {
        room.members.push({ user: userId, role: "viewer" });
        await room.save();
    }

    return res.status(200).json(new apiResponse(200, { roomId: room._id }, "Joined room"));
});

const leaveRoom = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { roomId } = req.params;

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json(new apiResponse(404, {}, "Room not found"));

    if (room.creator.toString() == userId) {
        return res.status(400).json(new apiResponse(400, {}, "You can't leave room"));
    }

    const index = room.members.findIndex(m => m.user.toString() === userId);
    if (index === -1)
        return res.status(400).json(new apiResponse(400, {}, "You're not a member"));

    room.members.splice(index, 1);
    await room.save();

    return res.status(200).json(new apiResponse(200, {}, "Left room"));
});

const getAllRooms = asyncHandler(async (req, res) => {

    const userId = req.user.id;

    const rooms = await Room.find({ "members.user": userId })
        .populate("creator", "username")
        .select("name creator");

    return res.status(200).json(new apiResponse(200, rooms, "Rooms fetched"));
});

const getRoomDetails = asyncHandler(async (req, res) => {
    const { roomId } = req.params;

    if (!roomId) {
        return res
            .status(400)
            .json(new apiResponse(400, {}, "Room ID required"));
    }

    const room = await Room.findById(roomId)
        .populate("creator", "username name email avatar _id")
        .populate("members.user", "username name email avatar _id");

    if (!room) {
        return res
            .status(404)
            .json(new apiResponse(404, {}, "Room not found"));
    }

    return res
        .status(200)
        .json(new apiResponse(200, room, "Room details fetched"));
});
export {
    createRoom,
    deleteRoom,
    joinRoom,
    getAllRooms,
    leaveRoom,
    getRoomDetails
}