import mongoose from "mongoose";
import { User } from "../models/user.models.js";
import { Video } from "../models/video.models.js";
import { APIResponse, asyncHandler } from "../utils/index.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

  const channelStatistics = await User.aggregate([
    {
      $match: {
        _id: mongoose.Types.ObjectId.createFromHexString(
          req?.user?._id.toString()
        ),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "_id",
        foreignField: "owner",
        as: "allVideos",
        pipeline: [
          {
            $lookup: {
              from: "likes",
              localField: "_id",
              foreignField: "video",
              as: "likes",
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $addFields: {
        totalVideoViews: {
          $reduce: {
            input: { $ifNull: ["$allVideos", []] },
            initialValue: 0,
            in: {
              $add: [
                "$$value",
                {
                  $sum: ["$$this.views"],
                },
              ],
            },
          },
        },
        totalLikes: {
          $reduce: {
            input: { $ifNull: ["$allVideos", []] },
            initialValue: 0,
            in: {
              $add: [
                "$$value",
                {
                  $size: ["$$this.likes"],
                },
              ],
            },
          },
        },
        totalVideos: {
          $size: "$allVideos",
        },
        totalSubscribers: {
          $size: "$subscribers",
        },
      },
    },
    {
      $project: {
        allVideos: 0,
        subscribers: 0,
        watchHistory: 0,
        password: 0,
        refreshToken: 0,
        avatarPublicID: 0,
        coverImagePublicID: 0,
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new APIResponse(
        200,
        channelStatistics,
        "Channel stats fetched successfully..."
      )
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel

  // We would need the channelId that is users id in this case

  // From Video Model we would need all videos uploaded on that particular channel

  const videos = await Video.find({
    owner: req?.user?.id,
  });

  return res
    .status(200)
    .json(
      new APIResponse(200, videos, "Channel videos fetched successfully...")
    );
});

export { getChannelStats, getChannelVideos };
