import asyncHandler from "../utils/asyncHandler.js";

const healthCheck = asyncHandler(async (req, res) => {
  //TODO: build a healthcheck response that simply returns the OK status as json with a message
  return res.status(200).json({
    success: true,
    data: {},
    message: "routes are working correctly...",
  });
});

export { healthCheck };
