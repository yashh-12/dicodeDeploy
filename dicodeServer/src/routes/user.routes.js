import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  findFriends,
} from "../controller/user.controller.js";

import isAuthenticated from "../middlewares/authMid.js";

const userRouter = Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/logout", isAuthenticated,logoutUser);
userRouter.get("/find-friends",isAuthenticated, findFriends);

export default userRouter;
