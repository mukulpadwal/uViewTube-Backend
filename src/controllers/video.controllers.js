import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Video } from "../models/videos.model.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
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

  if (videoDoc === null || Object.keys(videoDoc).length === 0) {
    throw new ApiError(500, "Error while uploading...");
  }

  const data = await Video.findById(videoDoc._id).select(
    "-videoFilePublicId -thumbnailPublicId"
  );

  return res.status(201).json({
    success: true,
    data: data,
    message: "Video pulishesd successfully...",
  });
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
