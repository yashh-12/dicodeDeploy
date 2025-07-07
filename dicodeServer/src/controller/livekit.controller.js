import { AccessToken } from "livekit-server-sdk";
import asyncHandler from "../utils/asyncHandler.js";
import apiResponse from "../utils/apiResponse.js";
import Room from "../models/room.model.js";

const getLiveKitToken = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { roomId } = req.params;

  if (!roomId) {
    return res.status(400).json(new apiResponse(400, {}, "Room ID is required"));
  }

  const room = await Room.findById(roomId);
  if (!room) {
    return res.status(404).json(new apiResponse(404, {}, "Room not found"));
  }

  const member = room.members.find((m) => m.user.toString() === userId);
  if (!member) {
    return res.status(403).json(new apiResponse(403, {}, "You are not a member of this room"));
  }

  const isEditor = member.role === "editor";

  const token = await new AccessToken(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
    {
      identity: userId,
      name: req.user.name || "Anonymous",
    }
  );

  await token.addGrant({
    roomJoin: true,
    room: room._id.toString(),
    canPublish: isEditor,
    canSubscribe: true,
    canPublishData: true,
  });

  const jwt = await token.toJwt();

  console.log("Generated LiveKit token:", jwt);

  return res.status(200).json(
    new apiResponse(200, { token: jwt }, "LiveKit token issued")
  );
});

export default getLiveKitToken;
