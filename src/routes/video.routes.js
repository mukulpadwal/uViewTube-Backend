import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  deleteVideo,
  getAllVideos,
  getVideoById,
  publishAVideo,
  togglePublishStatus,
  updateThumbnail,
  updateVideo,
} from "../controllers/video.controllers.js";

const router = Router();

// Router 1 : get all videos
router.route("/all").get(getAllVideos);

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

// Route 3 : Get Video by Id
router.route("/get/:videoId").get(getVideoById);

// Route 4 : update video
router
  .route("/update/:videoId")
  .patch(verifyJWT, upload.single("video"), updateVideo);

// Route 5 : delete-video
router.route("/delete/:videoId").delete(verifyJWT, deleteVideo);

// Route 6 : toggle-publish-status
router
  .route("/toggle-publish-status/:videoId")
  .post(verifyJWT, togglePublishStatus);

// Route 7 : update-thumbnail
router
  .route("/update-thumbnail/:videoId")
  .patch(verifyJWT, upload.single("thumbnail"), updateThumbnail);

export default router;
