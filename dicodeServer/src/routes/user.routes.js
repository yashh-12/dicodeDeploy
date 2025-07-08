import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  findFriends,
  getUserDetail,
  uploadAvatar,
  resetForgotPassword,
  changePassword,
  changeUserDetails,
  sendForgotPasswordOtp
} from "../controller/user.controller.js";
import { upload } from "../middlewares/multer.js";

import isAuthenticated from "../middlewares/authMid.js";

const userRouter = Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/logout", isAuthenticated, logoutUser);
userRouter.post("/find-friends", isAuthenticated, findFriends);
userRouter.get("/", isAuthenticated, getUserDetail);
userRouter.route("/uploadAvatar").post(isAuthenticated, upload.single("avatar"), uploadAvatar);
userRouter.route("/sendOtpFgPwd").post(sendForgotPasswordOtp);
userRouter.route("/verifyotppwd/:emailId").post(resetForgotPassword);
userRouter.route("/changePassword").post(isAuthenticated, changePassword);
userRouter.route("/changeUserDetails").post(isAuthenticated, changeUserDetails);

export default userRouter;
