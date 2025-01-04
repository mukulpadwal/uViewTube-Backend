import { Router } from "express";
import {
  getSubscribedChannels,
  getUserChannelSubscribers,
  toggleSubscription,
} from "../controllers/subscriptions.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/subscribers/:channelId").get(getUserChannelSubscribers);
router.route("/subscribed-to/:subscriberId").get(getSubscribedChannels);

// Secured Routes
router.route("/toggle/:channelId").patch(verifyJWT, toggleSubscription);

export default router;
