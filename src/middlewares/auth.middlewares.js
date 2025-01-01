import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const accessToken =
      req?.cookies?.AccessToken ||
      req?.header("Authorization")?.replace("Bearer ", "") ||
      req.body;

    if (!accessToken) {
      throw new APIError(401, "Invalid Access Token...");
    }

    const decodedAccessToken = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    );

    const user = await User.findById(decodedAccessToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new APIError(401, "Invalid Access Token...");
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("Something went wrong while verifying JWT tokens.");
    throw new APIError(500, "Something went wrong while verifying JWT tokens.");
  }
});
