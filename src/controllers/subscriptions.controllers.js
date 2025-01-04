import mongoose from "mongoose";
import { Subscription } from "../models/subscription.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/apiError.js";
import { APIResponse } from "../utils/apiResponse.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(channelId) || !channelId) {
    throw new APIError(400, "Invalid channel id...");
  }

  let subscriptionDetails = null;

  subscriptionDetails = await Subscription.findOneAndDelete({
    $and: [
      {
        subscriber: req?.user?._id,
      },
      { channel: channelId },
    ],
  });

  if (!subscriptionDetails) {
    subscriptionDetails = await Subscription.create({
      subscriber: req?.user?._id,
      channel: channelId,
    });
  }

  return res
    .status(201)
    .json(
      new APIResponse(
        201,
        subscriptionDetails,
        "Subscription status toggled successfully..."
      )
    );
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(channelId) || !channelId) {
    throw new APIError(400, "Invalid channel id...");
  }

  const subscribers = await Subscription.aggregate([
    {
      $match: {
        channel: mongoose.Types.ObjectId.createFromHexString(
          channelId.toString()
        ),
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new APIResponse(
        200,
        { subscribers, count: subscribers.length },
        "Subscribers fetched successfully..."
      )
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(subscriberId) || !subscriberId) {
    throw new APIError(400, "Invalid subscriber id...");
  }

  const subscribedTo = await Subscription.aggregate([
    {
      $match: {
        subscriber: mongoose.Types.ObjectId.createFromHexString(
          subscriberId.toString()
        ),
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new APIResponse(
        200,
        { subscribedTo, count: subscribedTo.length },
        "Subscriber To Channels fetched successfully..."
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
