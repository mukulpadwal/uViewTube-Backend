import { APIResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const healthCheck = asyncHandler(async (req, res, next) => {
  return res
    .status(200)
    .json(new APIResponse(200, {}, "Health Check Passed..."));
});

export { healthCheck };
