import { Router } from "express";
import getLiveKitToken from "../controller/livekit.controller.js";
import isAuthenticated from "../middlewares/authMid.js";

const livekitRouter = Router();

// livekitRouter.use(isAuthenticated);

livekitRouter.post("/token/:roomId", getLiveKitToken);

export default livekitRouter;
