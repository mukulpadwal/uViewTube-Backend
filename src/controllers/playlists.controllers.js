import mongoose from "mongoose";
import { Playlist } from "../models/playlist.models.js";
import { APIError, APIResponse, asyncHandler } from "../utils/index.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (
    [name, description].some(
      (field) => field.trim() === "" || field === undefined
    )
  ) {
    throw new APIError("Data in one of the required fields is missing...");
  }

  const playlist = await Playlist.create({
    name,
    description,
    owner: req?.user?._id,
  });

  if (!playlist) {
    throw new APIError(500, "Something went wrong while creating playlist...");
  }

  return res
    .status(201)
    .json(new APIResponse(201, playlist, "Playlist created successfully..."));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId) || !userId) {
    throw new APIError(400, "Invalid user id...");
  }

  const playlists = await Playlist.find({
    owner: userId,
  });

  return res
    .status(200)
    .json(new APIResponse(200, playlists, "Playlists fetched successfully..."));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(playlistId) || !playlistId) {
    throw new APIError(400, "Invalid playlist id...");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new APIError(404, "No playlist found...");
  }

  return res
    .status(200)
    .json(new APIResponse(200, playlist, "Playlist fetched successfully..."));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(playlistId) || !playlistId) {
    throw new APIError(400, "Invalid playlist id...");
  }

  if (!mongoose.Types.ObjectId.isValid(videoId) || !videoId) {
    throw new APIError(400, "Invalid video id...");
  }

  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $push: {
        videos: videoId,
      },
    },
    {
      new: true,
    }
  );

  if (!playlist) {
    throw new APIError(
      500,
      "Something went wrong while adding video to playlist..."
    );
  }

  return res
    .status(201)
    .json(new APIResponse(201, playlist, "Video added successfully..."));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(playlistId) || !playlistId) {
    throw new APIError(400, "Invalid playlist id...");
  }

  if (!mongoose.Types.ObjectId.isValid(videoId) || !videoId) {
    throw new APIError(400, "Invalid video id...");
  }

  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: {
        videos: videoId,
      },
    },
    {
      new: true,
    }
  );

  if (!playlist) {
    throw new APIError(
      500,
      "Something went wrong while removing video from playlist..."
    );
  }

  return res
    .status(201)
    .json(new APIResponse(201, playlist, "Video removed successfully..."));
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(playlistId) || !playlistId) {
    throw new APIError(400, "Invalid playlist id...");
  }

  const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);

  if (!deletePlaylist) {
    throw new APIError(
      500,
      "Something went wrong while deleting the playlist..."
    );
  }

  return res
    .status(200)
    .json(
      new APIResponse(200, deletedPlaylist, "Playlist deleted successfully...")
    );
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  if (!mongoose.Types.ObjectId.isValid(playlistId) || !playlistId) {
    throw new APIError(400, "Invalid playlist id...");
  }

  if (
    [name, description].some(
      (field) => field.trim() === "" || field === undefined
    )
  ) {
    throw new APIError("Data in one of the required fields is missing...");
  }

  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        name,
        description,
      },
    },
    { new: true }
  );

  if (!playlist) {
    throw new APIResponse(500, "Could not update playlist...");
  }

  return res
    .status(201)
    .json(new APIResponse(201, playlist, "Playlist update successfully..."));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
