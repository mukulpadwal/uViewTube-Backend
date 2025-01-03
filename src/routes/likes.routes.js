import { Router } from "express";
import {
  getLikedVideos,
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
} from "../controllers/likes.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

// Protected Routes
router.route("/").get(verifyJWT, getLikedVideos);
router.route("/toggle/video/:videoId").patch(verifyJWT, toggleVideoLike);
router.route("/toggle/comment/:commentId").patch(verifyJWT, toggleCommentLike);
router.route("/toggle/tweet/:tweetId").patch(verifyJWT, toggleTweetLike);

export default router;
