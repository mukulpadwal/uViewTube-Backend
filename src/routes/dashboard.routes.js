import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {
  getChannelStats,
  getChannelVideos,
} from "../controllers/dashboard.controllers.js";

const router = Router();

// Protected routes
router.route("/videos").get(verifyJWT, getChannelVideos);
router.route("/stats").get(verifyJWT, getChannelStats);

export default router;
