import mongoose from "mongoose";
import { Video } from "../models/video.models.js";
import {
  APIError,
  asyncHandler,
  APIResponse,
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../utils/index.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  if (!userId || !mongoose.Types.ObjectId.isValid(userId.toString())) {
    throw new APIError(400, "Invalid User ID");
  }

  const matchOptions = {
    owner: mongoose.Types.ObjectId.createFromHexString(userId.toString()),
  };

  if (!userId) {
    throw new APIError(404, "Invalid user id not found...");
  }

  const aggregate = Video.aggregate([
    { $match: matchOptions },
    {
      $sort: {
        [sortBy]: sortType === "asc" ? 1 : -1,
      },
    },
  ]);

  const fetchedVideos = await Video.aggregatePaginate(aggregate, {
    limit,
    page,
  });

  return res
    .status(200)
    .json(
      new APIResponse(200, fetchedVideos, "Videos fetched successfully...")
    );
});

const publishAVideo = asyncHandler(async (req, res) => {
  // Get all the necessary data and files from the frontend
  const { title, description } = req.body;
  const { videoFile, videoThumbnail } = req.files;

  // Validate the data
  if (
    [title, description].some(
      (field) => field?.trim() === "" || field === undefined
    )
  ) {
    throw new APIError(400, "Data in one of the required fields is missing...");
  }

  // Validate the files now
  if (!videoFile || !videoThumbnail) {
    throw new APIError(400, "One of the required files is missing...");
  }

  let videoFileLocalPath = videoFile?.[0]?.path;
  let videoThumbnailLocalPath = videoThumbnail?.[0]?.path;

  if (!videoFileLocalPath || !videoThumbnailLocalPath) {
    throw new APIError(400, "Files not found...");
  }

  try {
    const uploadedVideo = await uploadToCloudinary(videoFileLocalPath);

    const uploadedThumbnail = await uploadToCloudinary(videoThumbnailLocalPath);

    if (!uploadedVideo?.url || !uploadedThumbnail?.url) {
      throw new APIError(400, "Could not upload your video...");
    }

    const video = await Video.create({
      videoFile: uploadedVideo?.url,
      videoFilePublicId: uploadedVideo?.public_id,
      thumbnail: uploadedThumbnail?.url,
      thumbnailPublicId: uploadedThumbnail?.public_id,
      title: title.trim(),
      description: description.trim(),
      owner: mongoose.Types.ObjectId.createFromHexString(
        req?.user?._id?.toString()
      ),
      duration: uploadedVideo?.duration,
    });

    if (!video) {
      throw new APIError(400, "Could not upload your video...");
    }

    return res
      .status(201)
      .json(new APIResponse(201, video, "Video uploaded successfully..."));
  } catch (error) {
    throw new APIError(500, error);
  }
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new APIError(400, "Video Id is required...");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new APIError(404, "No video found...");
  }

  return res
    .status(200)
    .json(new APIResponse(200, video, "Video fetched successfully..."));
});

const updateVideoDetails = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const { title, description } = req.body;

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title,
        description,
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(201)
    .json(
      new APIResponse(
        201,
        updatedVideo,
        "Video details updated successfully..."
      )
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new APIError(400, "Video Id is required...");
  }

  const video = await Video.findByIdAndDelete(videoId);

  if (!video) {
    throw new APIError(400, "Could not delete video...");
  }

  try {
    await deleteFromCloudinary(video?.videoFilePublicId, "video");
    await deleteFromCloudinary(video?.thumbnailPublicId, "image");

    return res
      .status(200)
      .json(new APIResponse(200, {}, "Video deleted successfully..."));
  } catch (error) {
    throw new APIError(500, error);
  }
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new APIError(400, "Invalid video id...");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new APIError(404, "No Video found...");
  }

  const publishStatus = video?.isPublished;
  video.isPublished = !publishStatus;

  await video.save({ validateBeforSave: false });

  return res
    .status(201)
    .json(
      new APIResponse(201, {}, "Video publish status toggled successfully...")
    );
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new APIError(400, "Video Id is required...");
  }

  let video = await Video.findById(videoId);

  if (!video) {
    throw new APIError(404, "No video found...");
  }

  const videoFileLocalPath = req?.file?.path;

  if (!videoFileLocalPath) {
    throw new APIError(400, "No video file found...");
  }

  try {
    const uploadedVideo = await uploadToCloudinary(videoFileLocalPath);

    if (!uploadedVideo?.url) {
      throw new APIError(400, "Could not update video...");
    }

    await deleteFromCloudinary(video?.videoFilePublicId, "video");

    const updatedVideo = await Video.findByIdAndUpdate(
      videoId,
      {
        $set: {
          videoFile: uploadedVideo?.url,
          videoFilePublicId: uploadedVideo?.public_id,
          duration: uploadedVideo?.duration,
        },
      },
      {
        new: true,
      }
    );

    return res
      .status(201)
      .json(
        new APIResponse(201, updatedVideo, "Video updated successfully...")
      );
  } catch (error) {
    throw new APIError(500, error);
  }
});

const updateThumbnail = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new APIError(400, "Video Id is required...");
  }

  let video = await Video.findById(videoId);

  if (!video) {
    throw new APIError(404, "No video found...");
  }

  const videoThumbnailFileLocalPath = req?.file?.path;

  if (!videoThumbnailFileLocalPath) {
    throw new APIError(400, "No video file found...");
  }

  try {
    const uploadedThumbnail = await uploadToCloudinary(
      videoThumbnailFileLocalPath
    );

    if (!uploadedThumbnail?.url) {
      throw new APIError(400, "Could not update thumbnail...");
    }

    await deleteFromCloudinary(video?.thumbnailPublicId, "image");

    const updatedThumbnail = await Video.findByIdAndUpdate(
      videoId,
      {
        $set: {
          thumbnail: uploadedThumbnail?.url,
          thumbnailPublicId: uploadedThumbnail?.public_id,
        },
      },
      {
        new: true,
      }
    );

    return res
      .status(201)
      .json(
        new APIResponse(
          201,
          updatedThumbnail,
          "Thumbnail updated successfully..."
        )
      );
  } catch (error) {
    throw new APIError(500, error);
  }
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideoDetails,
  deleteVideo,
  togglePublishStatus,
  updateVideo,
  updateThumbnail,
};
