import { APIError, APIResponse, asyncHandler } from "../utils/index.js";
import { Tweet } from "../models/tweet.models.js";
import mongoose from "mongoose";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const { content } = req.body;

  if (!content.trim()) {
    throw new APIError(400, "Kindly provide content for the tweet...");
  }

  const tweet = await Tweet.create({
    content,
    owner: req.user._id,
  });

  if (!tweet) {
    throw new APIError(
      500,
      "Something went wrong while creating your tweet..."
    );
  }

  return res
    .status(201)
    .json(new APIResponse(201, tweet, "Tweet created successfully..."));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const tweets = await Tweet.find({
    owner: req?.user?._id,
  });

  return res
    .status(200)
    .json(new APIResponse(200, tweets, "Tweets fetched successfully..."));
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const { tweetId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(tweetId) || !tweetId) {
    throw new APIError(400, "Invalid tweet id...");
  }

  const { newContent } = req.body;

  if (!newContent.trim()) {
    throw new APIError(400, "Kindly provide content...");
  }

  const updatedTweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      $set: {
        content: newContent,
      },
    },
    {
      new: true,
    }
  );

  if (!updatedTweet) {
    throw new APIError(500, "Could not update your tweet...");
  }

  return res
    .status(201)
    .json(new APIResponse(201, updatedTweet, "Tweet updated successfully..."));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(tweetId) || !tweetId) {
    throw new APIError(400, "Invalid tweet id...");
  }

  const deletedTweet = await Tweet.findByIdAndDelete(tweetId);

  if (!deleteTweet) {
    throw new APIError(500, "Could not delete your tweet...");
  }

  return res
    .status(200)
    .json(new APIResponse(200, deletedTweet, "Tweet deleted successfully..."));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
