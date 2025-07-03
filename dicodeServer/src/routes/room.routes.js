import { Router } from "express";
import {
  createRoom,
  deleteRoom,
  joinRoom,
  leaveRoom,
  getAllRooms,
  getRoomDetails
} from "../controller/room.controller.js";

import isAuthenticated from "../middlewares/authMid.js";
import isRoomOwner from "../middlewares/isRoomOwner.js";

const roomRouter = Router();

// roomRouter.use(isAuthenticated);

roomRouter.post("/", createRoom);

roomRouter.get("/", getAllRooms);

roomRouter.get("/room/:roomId", getRoomDetails);

roomRouter.post("/join/:roomId",isRoomOwner, joinRoom);

roomRouter.post("/leave/:roomId", leaveRoom);

roomRouter.delete("/:roomId", isRoomOwner, deleteRoom);



export default roomRouter;
