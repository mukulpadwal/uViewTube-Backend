import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  deleteImageOnCloudinary,
  deleteVideoOnCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { Video } from "../models/videos.model.js";
import mongoose from "mongoose";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination

  const videos = await Video.aggregate([
    // Pipeline 1 : Let's find all the videos from the particular user
    {
      $match: {
        owner: new mongoose.Types.ObjectId(String(userId)),
      },
    },
    // Pipeline : limit the videos to send
    { $limit: Number(limit) },
  ]);

  console.log(videos);
});

// Controller 2 : Publish a Video
const publishAVideo = asyncHandler(async (req, res) => {
  // Step 1 : Get the fields data from the frontend
  const { title, description } = req.body;

  // 1.1 -> Validate the data
  if (
    [title, description].some((field) => !field || field?.trim().length === 0)
  ) {
    throw new ApiError(400, "All fields required...");
  }

  // Step 2 : Get the files from frontend
  const { video, thumbnail } = req.files;

  // 2.1 -> Validate the video file
  if (!(video || thumbnail)) {
    throw new ApiError(400, "Video and thumbnail files are required...");
  }

  // 2.2 Let's try and upload the images on cloudinary
  const videoCloudLink = await uploadOnCloudinary(req.user.username, video);
  const thumbnailCloudLink = await uploadOnCloudinary(
    req.user.username,
    thumbnail
  );

  if (!(videoCloudLink || thumbnailCloudLink)) {
    throw new ApiError(500, "Error uploading files. Please try again later...");
  }

  const videoDoc = await Video.create({
    videoFile: videoCloudLink.url,
    videoFilePublicId: videoCloudLink.public_id,
    thumbnail: thumbnailCloudLink.url,
    thumbnailPublicId: thumbnailCloudLink.public_id,
    owner: req.user._id,
    title: title,
    description: description,
    duration: videoCloudLink.duration,
    isPublished: true,
  });

  if (videoDoc === null || Object?.keys(videoDoc).length === 0) {
    throw new ApiError(500, "Error while uploading...");
  }

  const data = await Video.findById(videoDoc._id).select(
    "-videoFilePublicId -thumbnailPublicId"
  );

  return res.status(201).json({
    success: true,
    data: data,
    message: "Video pulished successfully...",
  });
});

// Controller 3 : Get Video By Id
const getVideoById = asyncHandler(async (req, res) => {
  // Step 1 : Get the video Id from params
  const { videoId } = req.params;

  // 1.1 -> Check if the id is valid or not
  if (!videoId || !videoId.trim() || !mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId...");
  }

  // Step 2 : Search the video in the database id
  const video = await Video.findById(videoId).select(
    "-videoFilePublicId -thumbnailPublicId"
  );

  // 2.1 -> Throw error if no video found
  if (video === null || Object.keys(video).length === 0) {
    throw new ApiError(400, "No Video Found...");
  }

  return res.status(200).json({
    success: true,
    data: video,
    message: "Video fetched successfully...",
  });
});

// Controller 4 : Updating a video
const updateVideo = asyncHandler(async (req, res) => {
  // Step 1 : Get the videoId from the params and title, description from the body
  const { videoId } = req.params;
  const { title, description } = req.body;
  const video = req.file;

  // 1.1 -> Check if the id is valid or not
  if (!videoId || !videoId.trim() || !mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId...");
  }

  // 1.2 -> validate the data
  if (!title || !description || !title.trim() || !description.trim()) {
    throw new ApiError(400, "title and description are required...");
  }

  // 1.3 -> validate video file
  if (!video) {
    throw new ApiError(400, "Video is required...");
  }

  // Step 2 : Find video from database by Id
  const videoCloudLink = await uploadOnCloudinary(req.user.username, [video]);

  if (!videoCloudLink) {
    throw new ApiError(500, "Error while uploading video...");
  }

  const videoData = await Video.findById(videoId);
  const oldVideoFileId = videoData.videoFilePublicId;
  videoData.videoFile = videoCloudLink.url;
  videoData.videoFilePublicId = videoCloudLink.public_id;
  videoData.title = title;
  videoData.description = description;
  videoData.save({ validateBeforeSave: false });

  if (!videoData) {
    throw new ApiError(500, "Something went wrong...");
  }

  await deleteVideoOnCloudinary(oldVideoFileId);

  return res.status(200).json({
    success: true,
    data: videoData,
    message: "Video updated successfully...",
  });
});

// Controller 5 : Delete a Video
const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId || !videoId.trim() || !mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId...");
  }

  const video = await Video.findByIdAndDelete(videoId);

  if (video === null || Object?.keys(video)?.length === 0) {
    throw new ApiError(500, "Error while deleting video...");
  }

  await deleteVideoOnCloudinary(video?.videoFilePublicId);

  return res.status(200).json({
    success: true,
    data: video,
    message: "Video deleted successfully...",
  });
});

// Controller 6 : Toggle Publish Status Of Video
const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId || !videoId.trim() || !mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId...");
  }

  const video = await Video.findById(videoId);
  video.isPublished = !video.isPublished;
  video.save({ validateBeforeSave: false });

  return res.status(200).json({
    success: true,
    data: video,
    message: "Publish Status toggled successfully...",
  });
});

// Controller 7 : Updating thumbnail
const updateThumbnail = asyncHandler(async (req, res) => {
  // Step 1 : Get the videoId from the params and title, description from the body
  const { videoId } = req.params;
  const thumbnail = req.file;

  // 1.1 -> Check if the id is valid or not
  if (!videoId || !videoId.trim() || !mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId...");
  }

  // 1.2 -> validate thumbnail file
  if (!thumbnail) {
    throw new ApiError(400, "Thumbnail is required...");
  }

  // Step 2 : Find video from database by Id
  const thumbnailCloudLink = await uploadOnCloudinary(req.user.username, [
    thumbnail,
  ]);

  if (!thumbnailCloudLink) {
    throw new ApiError(500, "Error while uploading thumbnail...");
  }

  const videoData = await Video.findById(videoId);
  const oldThumbnailFileId = videoData.thumbnailPublicId;
  videoData.thumbnail = thumbnailCloudLink.url;
  videoData.thumbnailPublicId = thumbnailCloudLink.public_id;
  videoData.save({ validateBeforeSave: false });

  if (!videoData) {
    throw new ApiError(500, "Something went wrong...");
  }

  await deleteImageOnCloudinary(oldThumbnailFileId);

  return res.status(200).json({
    success: true,
    data: videoData,
    message: "Thumbnail updated successfully...",
  });
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
  updateThumbnail,
};
