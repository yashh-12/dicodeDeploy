import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import apiResponse from "../utils/apiResponse.js";

const isAuthenticated = async (req, res, next) => {
  try {
    const token = req?.cookies?.accessToken;
    
    if (!token)
      return res.status(401).json(new apiResponse(401, {}, "UnAuthorized"));

    const decodedToken = jwt.decode(token, process.env.ACCESS_TOKEN_SECRET);
    if (!decodedToken || !decodedToken?.id)
      return res.status(401).json(new apiResponse(401, {}, "UnAuthorized"));

    const user = await User.findById(decodedToken.id);
    if (!user)
      return res.status(401).json(new apiResponse(401, {}, "UnAuthorized"));

    if (user?.accessToken !== token)
      return res.status(401).json(new apiResponse(401, {}, "UnAuthorized"));

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    return res.status(500).json(new apiResponse(500, {}, "Authentication failed"));
  }
};

export default isAuthenticated;
