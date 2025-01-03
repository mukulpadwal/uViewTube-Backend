import mongoose from "mongoose";
import { Like } from "../models/like.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/apiError.js";
import { APIResponse } from "../utils/apiResponse.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(videoId) || !videoId) {
    throw new APIError(400, "Invalid video id...");
  }

  // If the user has liked a video then delete it
  let likedVideo = await Like.findOneAndDelete({ video: videoId });

  if (!likedVideo) {
    likedVideo = await Like.create({
      video: videoId,
      likedBy: req.user.id,
    });
  }

  return res
    .status(201)
    .json(
      new APIResponse(201, likedVideo, "Video like toggled successfully...")
    );
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(commentId) || !commentId) {
    throw new APIError(400, "Invalid comment id...");
  }

  // If the user has liked a video then delete it
  let likedComment = await Like.findOneAndDelete({ comment: commentId });

  if (!likedComment) {
    likedComment = await Like.create({
      comment: commentId,
      likedBy: req.user.id,
    });
  }

  return res
    .status(201)
    .json(
      new APIResponse(201, likedComment, "Comment like toggled successfully...")
    );
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(tweetId) || !tweetId) {
    throw new APIError(400, "Invalid tweet id...");
  }

  // If the user has liked a video then delete it
  let likedTweet = await Like.findOneAndDelete({ tweet: tweetId });

  if (!likedTweet) {
    likedTweet = await Like.create({
      tweet: tweetId,
      likedBy: req.user.id,
    });
  }

  return res
    .status(201)
    .json(
      new APIResponse(201, likedTweet, "Tweet like toggled successfully...")
    );
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const likedVideos = await Like.aggregate([
    {
      $match: {
        likedBy: mongoose.Types.ObjectId.createFromHexString(
          req.user.id.toString()
        ),
        video: {
          $exists: true,
        },
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new APIResponse(
        200,
        likedVideos,
        "All liked videos fetched successfully..."
      )
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
