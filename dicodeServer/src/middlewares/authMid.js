import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import apiResponse from "../utils/apiResponse.js";

const isAuthenticated = async (req, res, next) => {
  const token = req.cookies?.accessToken;

  if (!token)
    return res.status(401).json(new apiResponse(401, {}, "UnAuthorized"))

  const decodedToken = await jwt.decode(token, process.env.ACCESS_TOKEN_SECRET);

  if (!decodedToken)
    return res.status(401).json(new apiResponse(401, {}, "UnAuthorized"))

  const user = await User.findById(decodedToken?.id);


  if (!user)
    return res.status(401).json(new apiResponse(401, {}, "UnAuthorized"))

  // console.log("accessToken ",user.accessToken,"Token ",token , " ", user.accessToken == token);
  

  if (user.accessToken != token)
    return res.status(401).json(new apiResponse(401, {}, "UnAuthorized"))

  req.user = user;
  next();
};

export default isAuthenticated;
