import conf from "../conf/conf.js";
import { User } from "../models/users.model.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

const verifyJWT = asyncHandler(async (req, res, next) => {
  const accessToken =
    req?.cookies.accessToken ||
    req.headers?.Authorization?.replace("Bearer ", "");

  if (!accessToken) {
    throw new ApiError(401, "Invalid Access Token");
  }

  const decodedTokenInformation = jwt.verify(
    accessToken,
    conf.accessTokenSecret
  );

  const user = await User.findById(decodedTokenInformation._id).select(
    "-password"
  );

  req.user = user;
});

export default verifyJWT;
