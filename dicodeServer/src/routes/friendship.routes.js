import { Router } from "express";
import {
  sendFriendRequest,
  cancelFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getPendingRequests,
  getFriendsList,
  removeFriend
} from "../controller/friendship.controller.js";

import isAuthenticated from "../middlewares/authMid.js";

const friendshipRouter = Router();

// friendshipRouter.use(isAuthenticated);

friendshipRouter.post("/request", sendFriendRequest);

friendshipRouter.delete("/request", cancelFriendRequest);

friendshipRouter.post("/accept", acceptFriendRequest);

friendshipRouter.post("/reject", rejectFriendRequest);

friendshipRouter.get("/pending", getPendingRequests);

friendshipRouter.post("/remove", removeFriend);

friendshipRouter.get("/list", getFriendsList);

export default friendshipRouter;
