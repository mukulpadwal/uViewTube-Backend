import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/apiError.js";
import { APIResponse } from "../utils/apiResponse.js";
import { Comment } from "../models/comment.models.js";
import mongoose from "mongoose";

const getVideoComments = asyncHandler(async (req, res) => {
  // We need to get the video id from the params
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!mongoose.Types.ObjectId.isValid(videoId) || !videoId) {
    throw new APIError(400, "Invalid video ID...");
  }

  const aggregate = Comment.aggregate([
    {
      $match: {
        video: mongoose.Types.ObjectId.createFromHexString(videoId.toString()),
      },
    },
  ]);

  const paginatedResult = await Comment.aggregatePaginate(aggregate, {
    page: page,
    limit: limit,
  });

  return res
    .status(200)
    .json(
      new APIResponse(200, paginatedResult, "Comments fetched successfully...")
    );
});

const addComment = asyncHandler(async (req, res) => {
  // Need to get the video on which the comment is being made
  // Need to get the user who is commenting and what is the content of the comment
  const { videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(videoId) || !videoId) {
    throw new APIError(400, "Invalid video ID...");
  }

  const { content } = req.body;

  if (!content.trim()) {
    throw new APIError(400, "Comment is missing...");
  }

  const comment = await Comment.create({
    video: videoId,
    content: content.trim(),
    owner: req?.user?._id,
  });

  if (!comment) {
    throw new APIError(
      500,
      "Something went wrong while adding your comment...,"
    );
  }

  return res
    .status(201)
    .json(new APIResponse(201, comment, "Comment added successfully..."));
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(commentId) || !commentId) {
    throw new APIError(400, "Invalid comment id...");
  }

  const { newContent } = req.body;

  if (!newContent.trim()) {
    throw new APIError(400, "Comment content missing...");
  }

  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content: newContent?.trim(),
      },
    },
    { new: true }
  );

  if (!updatedComment) {
    throw new APIError(404, "No comment found...");
  }

  return res
    .status(201)
    .json(
      new APIResponse(201, updatedComment, "Comment updated successfully...")
    );
});

const deleteComment = asyncHandler(async (req, res) => {
  // To delete we would need the comment Id
  const { commentId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(commentId) || !commentId) {
    throw new APIError(400, "Invalid comment id...");
  }

  const deletedComment = await Comment.findByIdAndDelete(commentId);

  if (!deletedComment) {
    throw new APIError(404, "");
  }

  return res
    .status(200)
    .json(
      new APIResponse(200, deletedComment, "Comment deleted successfully...")
    );
});

export { getVideoComments, addComment, updateComment, deleteComment };
