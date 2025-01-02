import { Router } from "express";
import {
  deleteVideo,
  getAllVideos,
  getVideoById,
  publishAVideo,
  togglePublishStatus,
  updateThumbnail,
  updateVideo,
  updateVideoDetails,
} from "../controllers/videos.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/").get(getAllVideos);
router.route("/:videoId").get(getVideoById);

// Secured Routes
router.route("/upload").post(
    verifyJWT,
    upload.fields([
        {
            name: "videoFile",
            maxCount: 1,
        },
        {
            name: "videoThumbnail",
            maxCount: 1,
        },
    ]),
    publishAVideo
);
router.route("/delete/:videoId").delete(verifyJWT, deleteVideo);
router.route("/toggle/:videoId").patch(verifyJWT, togglePublishStatus);
router.route("/update/:videoId").patch(verifyJWT, updateVideoDetails);
router
  .route("/update-video/:videoId")
  .patch(verifyJWT, upload.single("videoFile"), updateVideo);
router
  .route("/update-thumbnail/:videoId")
  .patch(verifyJWT, upload.single("videoThumbnail"), updateThumbnail);

export default router;
