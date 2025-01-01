import { asyncHandler } from "../utils/asyncHandler.js";
import { APIResponse } from "../utils/apiResponse.js";
import { APIError } from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import { OPTIONS } from "../constants.js";
import mongoose from "mongoose";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error(
      "Something went wrong while generating the tokens for the user."
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // Get all the required fields from the req object
  const { username, fullname, email, password } = req.body;
  const { avatar, coverImage } = req.files;

  // Start Validating the fields
  if (
    [username, fullname, email, password].some(
      (field) => field?.trim() === "" || field === undefined
    )
  ) {
    return res
      .status(400)
      .json(
        new APIResponse(
          400,
          {},
          "Kindly provide data in all the required fields..."
        )
      );
  }

  // Check if any user with the given username or email already exists in the DB
  const existingUser = await User.find({
    $or: [{ username }, { email }],
  });

  if (existingUser.length !== 0) {
    return res
      .status(400)
      .json(
        new APIResponse(
          400,
          {},
          "A user with the username or email already exists. Kindly try with some other username or email..."
        )
      );
  }

  // Now its time to upload the files to cloudinary
  let uploadedAvatar = undefined;
  let uploadedCoverImage = undefined;

  try {
    // First lets check the avatar
    if (avatar && avatar.length !== 0) {
      const avatarLocalPath = avatar?.[0]?.path;

      if (avatarLocalPath) {
        uploadedAvatar = await uploadToCloudinary(avatarLocalPath);
      }
    } else {
      throw new APIError(400, "Avatar file is required...");
    }

    if (!uploadedAvatar) {
      throw new APIError(
        500,
        "Something went wrong while uploading your avatar image to cloudinary"
      );
    }

    // Now lets check for coverImage

    if (coverImage && coverImage.length !== 0) {
      const coverImageLocalPath = coverImage?.[0]?.path;

      if (coverImageLocalPath) {
        uploadedCoverImage = await uploadToCloudinary(coverImageLocalPath);
      }
    }
  } catch (error) {
    console.log("Error while uploading images to cloudinary");
  }

  // Now that the validation is done and dusted lets create a new user

  try {
    const createdUser = await User.create({
      fullname,
      email,
      username,
      password,
      avatar: uploadedAvatar?.url,
      avatarPublicID: uploadedAvatar?.public_id,
      coverImage: uploadedCoverImage?.url || "",
      coverImagePublicID: uploadedCoverImage?.public_id || "",
    });

    const user = await User.findById(createdUser._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      await deleteFromCloudinary(uploadedAvatar.public_id);
      if (uploadedCoverImage?.url) {
        await deleteFromCloudinary(uploadedCoverImage.public_id);
      }
      return res
        .status(500)
        .json(
          new APIResponse(
            500,
            user,
            "Something went wrong at our side while registering the user..."
          )
        );
    }

    return res
      .status(201)
      .json(new APIResponse(201, user, "User registered successfully..."));
  } catch (error) {
    await deleteFromCloudinary(uploadedAvatar.public_id);
    if (uploadedCoverImage?.url) {
      await deleteFromCloudinary(uploadedCoverImage.public_id);
    }
    return res
      .status(500)
      .json(
        new APIError(
          500,
          "Something went wrong at our side while registering the user. All files were deleted from our server..."
        )
      );
  }
});

const loginUser = asyncHandler(async (req, res) => {
  // First thing is to get the credentials from the frontend
  const { username, password } = req.body;

  // Validate if proper data is sent front the frontend side
  if (
    [username, password].some(
      (field) => field?.trim() === "" || field === undefined
    )
  ) {
    return res
      .status(400)
      .json(
        new APIResponse(400, {}, "Please provide all the required fields...")
      );
  }

  // Let's find the user with the passed username
  const user = await User.findOne({ username });

  if (!user) {
    return res
      .status(400)
      .json(
        new APIResponse(400, {}, "No user with the given username exists...")
      );
  }

  // Now that we have found the user we need to check the password
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    return res
      .status(400)
      .json(new APIResponse(400, {}, "Invalid Password..."));
  }

  // Now that we have validated the things its time to generate the tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .cookie("AccessToken", accessToken, OPTIONS)
    .cookie("RefreshToken", refreshToken, OPTIONS)
    .json(
      new APIResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully..."
      )
    );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  // First thing is to get the refresh token from the frontend
  // It can come through cookies, body, header based on the device type
  const refreshToken =
    req?.cookies?.RefreshToken ||
    req?.header("Authorization")?.replace("Bearer ", "") ||
    req?.body;

  if (!refreshToken) {
    return res
      .status(401)
      .json(new APIResponse(401, {}, "Invalid Refresh Token"));
  }

  try {
    const decodedRefreshToken = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedRefreshToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      return res
        .status(401)
        .json(new APIResponse(401, {}, "Invalid Refresh Token"));
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshTokens(user?._id);

    return res
      .status(200)
      .cookie("AccessToken", accessToken, OPTIONS)
      .cookie("RefreshToken", newRefreshToken, OPTIONS)
      .json(
        new APIResponse(
          200,
          { accessToken, newRefreshToken },
          "Tokens refreshed successfully..."
        )
      );
  } catch (error) {
    return res
      .status(500)
      .json(
        new APIResponse(
          500,
          {},
          "Something went wrong while refreshing the tokens..."
        )
      );
  }
});

const logoutUser = asyncHandler(async (req, res) => {
  // Simple thing we want to do is to clear the cookies of the user from the backend

  const user = await User.findByIdAndUpdate(
    req?.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .clearCookie("AccessToken", OPTIONS)
    .clearCookie("RefreshToken", OPTIONS)
    .json(new APIResponse(200, {}, "User logged out successfully..."));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  // Get old and new password from the client side
  const { oldPassword, newPassword } = req.body;

  if (
    [oldPassword, newPassword].some(
      (field) => field?.trim() === "" || field === undefined
    )
  ) {
    throw new APIError(400, "Data in one of the field is missing...");
  }

  // Now that we have the data we need to confirm if the oldPassword is correct or not
  const user = await User.findById(req?.user?._id);

  const isPasswordValid = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordValid) {
    throw new APIError(400, "Invalid old password...");
  }

  // Now that we have verified the old password its time to save the new one to the database
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(201)
    .json(new APIResponse(201, {}, "Password updated successfully..."));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(
      new APIResponse(
        200,
        req?.user,
        "Current user information fetched successfully..."
      )
    );
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  // Decide what all fields we need to update in our database
  const { fullname, username } = req.body;

  if (
    [fullname, username].some(
      (field) => field?.trim() === "" || field === undefined
    )
  ) {
    throw new APIError(400, "Data in one of the field is missing...");
  }

  // Check if the user with same username already exits or not
  const existingUser = await User.findOne({ username });

  console.log(existingUser);

  if (existingUser) {
    throw new APIError(400, "This username is already in use...");
  }

  const user = await User.findByIdAndUpdate(
    req?.user?._id,
    {
      $set: {
        fullname,
        username,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(201)
    .json(new APIResponse(201, user, "User details updated successfully..."));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req?.file?.path;

  if (!avatarLocalPath) {
    throw new APIError(400, "Avatar file is missing...");
  }

  const avatar = await uploadToCloudinary(avatarLocalPath);

  if (!avatar?.url) {
    throw new APIError(500, "Something went wrong while uploading avatar...");
  }

  await deleteFromCloudinary(req.user.avatarPublicID);

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        avatar: avatar?.url,
        avatarPublicID: avatar?.public_id,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(201)
    .json(new APIResponse(201, user, "Avatar updated successfully..."));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req?.file?.path;

  if (!coverImageLocalPath) {
    throw new APIError(400, "Avatar file is missing...");
  }

  const coverImage = await uploadToCloudinary(coverImageLocalPath);

  if (!coverImage?.url) {
    throw new APIError(500, "Something went wrong while uploading avatar...");
  }

  await deleteFromCloudinary(req.user.coverImagePublicID);

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        coverImage: coverImage?.url,
        coverImagePublicID: coverImage?.public_id,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(201)
    .json(new APIResponse(201, user, "Cover Image updated successfully..."));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  // We need to get the username from url params
  const { username } = req.params;

  if (!username?.trim()) {
    throw new APIError(400, "Invalid Request...");
  }

  // Here we will use aggregation pipelines
  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "mySubscribersList",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "mySubscriptionList",
      },
    },
    {
      $addFields: {
        mySubscribersCount: {
          $size: "$mySubscribersList",
        },
        channelsSubscribedToCount: {
          $size: "$mySubscriptionList",
        },
        isSubscribed: {
          $cond: {
            if: {
              $in: [req?.user?._id, "$mySubscribersList.subscriber"],
            },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        password: 0,
        refreshToken: 0,
      },
    },
  ]);

  if (channel.length === 0) {
    throw new APIError(404, "Channel not found");
  }

  return res
    .status(200)
    .json(
      new APIResponse(200, channel, "Channel profile fetched successfully...")
    );
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: mongoose.Types.ObjectId.createFromHexString(req?.user?._id.toString()),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    username: 1,
                    fullname: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);

  if (user.length === 0) {
    throw new APIError(404, "User not found...");
  }

  return res
    .status(200)
    .json(
      new APIResponse(
        200,
        user?.[0]?.watchHistory,
        "Watch history fetched successfully"
      )
    );
});

export {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
};
