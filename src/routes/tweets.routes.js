import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {
  createTweet,
  deleteTweet,
  getUserTweets,
  updateTweet,
} from "../controllers/tweets.controllers.js";

const router = Router();

// Protected Routes
router.route("/create").post(verifyJWT, createTweet);
router.route("/").get(verifyJWT, getUserTweets);
router.route("/update/:tweetId").patch(verifyJWT, updateTweet);
router.route("/delete/:tweetId").delete(verifyJWT, deleteTweet);

export default router;
