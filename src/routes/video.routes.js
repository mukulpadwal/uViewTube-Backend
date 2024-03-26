import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  getAllVideos,
  publishAVideo,
  updateVideo,
} from "../controllers/video.controllers.js";

const router = Router();

// router.route("/get-all-videos");

// Router 2 : publish video
router.route("/publish").post(
  verifyJWT,
  upload.fields([
    {
      name: "video",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  publishAVideo
);

export default router;
