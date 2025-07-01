import { Router } from "express";
import { sendMessage ,getChats} from "../controller/chat.controller.js";
import isAuthenticated from "../middlewares/authMid.js";

const chatRouter = Router();

// chatRouter.use(isAuthenticated);

chatRouter.post("/send/:roomId", sendMessage);

chatRouter.get("/:roomId", getChats);

// chatRouter.delete("/message/:messageId", deleteMessage);

export default chatRouter;
