import Room from "../models/room.model.js";
import apiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const isRoomOwner = asyncHandler(async (req, res, next) => {
    const { roomId } = req.params;

    const room = await Room.findById(roomId);

    if (!room)
        return res.status(400).json(new apiResponse(400, {}, "No room exists"));

    if (room.creator.toString() === req.user._id.toString()) {
        return next();
    }

    return res.status(403).json(new apiResponse(403, {}, "You are not authorized"));
});

export default isRoomOwner;
