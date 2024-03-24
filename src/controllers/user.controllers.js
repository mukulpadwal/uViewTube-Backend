import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import { User } from "../models/users.model.js";
import {
  uploadOnCloudinary,
  deleteImageOnCloudinary,
} from "../utils/cloudinary.js";
import generateTokens from "../utils/generateTokens.js";
import constants from "../constants.js";
import jwt from "jsonwebtoken";
import conf from "../conf/conf.js";

// Controller 1 : health-check
const healthCheck = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json({ Success: true, Message: "This route is working correctly..." });
});

// Controller 2 : Register a new user
const registerUser = asyncHandler(async (req, res) => {
  // STEP 1 : Let's take the data from the user
  const { username, email, fullName, password } = req.body;

  // STEP 2 : Let's validate the data
  // 2.1 -> Making sure that any field is not left empty
  if (
    [username, email, fullName, password].some(
      (field) => !field || field?.trim().length === 0
    )
  ) {
    // If here means that any field is missing
    // Throw an error
    throw new ApiError(400, "Please fill all the fields...");
  }

  // 2.2 -> Make sure that no other user have same name or email
  const userPresent = await User.find({
    $or: [{ username }, { email }],
  });

  if (userPresent.length !== 0) {
    // Throw an error
    throw new ApiError(
      400,
      "User with same email or username already exists. Please try again with unique data..."
    );
  }

  // Step 3 : Let's handle files
  const { avatar, coverImage } = req?.files;

  // 3.1 avatar is required
  if (!avatar) {
    throw new ApiError(400, "Avatar is required...");
  }

  // 3.2 Let's try and upload the images on cloudinary
  const avatarCloudLink = await uploadOnCloudinary(username, avatar);
  let coverImageCloudLink;

  if (coverImage) {
    coverImageCloudLink = await uploadOnCloudinary(username, coverImage);
  }

  // 3.3 Check if the avatar is uploaded or not
  if (!avatarCloudLink) {
    throw new ApiError(
      500,
      "Error while uploading avatar. Please try again later..."
    );
  }

  // Step 4 : Let's save the data to the database now
  const user = await User.create({
    username,
    email,
    fullName,
    avatar: avatarCloudLink.url,
    avatarPublicId: avatarCloudLink.public_id,
    coverImage: coverImageCloudLink?.url ?? "",
    coverImagePublicId: coverImageCloudLink?.public_id ?? "",
    password,
  });

  // 4.1 Check if the user is successfully saved or not
  if (Object.keys(user).length === 0) {
    throw new ApiError(
      500,
      "Error while saving data to database. Please try again later..."
    );
  }

  // Filter out data to send
  const createdUser = await User.findById(user?._id).select(
    "-password -refreshToken"
  );

  return res.status(201).json({
    success: true,
    data: createdUser,
    message: "User successfully registered!!",
  });
});

// Controller 3 : Login User
const loginUser = asyncHandler(async (req, res) => {
  // Step 1 : Take the data from the frontend
  const { username, email, password } = req.body;

  // 1.1 We need any one from username or password
  if (!username && !email) {
    throw new ApiError(400, "Please provide either username or email...");
  }

  // 1.1 -> Validate the data
  if (!password) {
    // If here means that any field is missing
    // Throw an error
    throw new ApiError(400, "Please enter password...");
  }

  // Step 2 : Let's check if user exists or not
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (Object.keys(user).length === 0) {
    throw new ApiError(
      400,
      "No user exists with the provided email or username..."
    );
  }

  // 2.1 -> Let's check the password
  const isPasswordCorrect = await user.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Incorrect Password...");
  }

  // Step 3 : Now the credentials are correct let's generate tokens
  const { accessToken, refreshToken } = await generateTokens(user?._id);

  if (!accessToken || !refreshToken) {
    throw new ApiError(
      500,
      "Error generating tokens. Please try again later..."
    );
  }

  // Step 4 : Let's Send the tokens as cookies
  return res
    .status(200)
    .cookie("accessToken", accessToken, constants.COOKIE_OPTIONS)
    .cookie("refreshToken", refreshToken, constants.COOKIE_OPTIONS)
    .json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        avatar: user.avatar,
        coverImage: user.coverImage,
        accessToken: accessToken,
        refreshToken: refreshToken,
      },
      message: "User logged in successfully...",
    });
});

// Controller 4 : Logout User
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req?.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .clearCookie("accessToken", constants.COOKIE_OPTIONS)
    .clearCookie("refreshToken", constants.COOKIE_OPTIONS)
    .json({
      success: true,
      data: {},
      message: "User logged out successfully...",
    });
});

// Controller 5 : Refresh User Tokens
const refreshUserTokens = asyncHandler(async (req, res) => {
  // Step 1 : fetch refresh token from frontend
  const currentRefreshToken =
    req?.cookies?.refreshToken || req?.body?.refreshToken;

  if (!currentRefreshToken) {
    throw new ApiError(401, "No refresh token found...");
  }

  // Step 2 : We need to verify the refresh token in our database and the one we get from user
  const decodedTokenInformation = jwt.verify(
    currentRefreshToken,
    conf.refreshTokenSecret
  );

  const user = await User.findById(decodedTokenInformation?._id);

  if (Object.keys(user).length === 0) {
    throw new ApiError(401, "Invalid User...");
  }

  if (currentRefreshToken !== user?.refreshToken) {
    throw new ApiError(401, "Refresh token Expired...");
  }

  const { accessToken, refreshToken } = await generateTokens(user._id);

  return res
    .status(200)
    .cookie("accessToken", accessToken, constants.COOKIE_OPTIONS)
    .cookie("refreshToken", refreshToken, constants.COOKIE_OPTIONS)
    .json({
      success: true,
      data: {
        refreshToken: refreshToken,
        accessToken: accessToken,
      },
      message: "Tokens refreshed successfully...",
    });
});

// Controller 6 : Get Current User
const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json({
    success: true,
    data: req?.user,
    message: "User details fetched successfully...",
  });
});

// Controller 7 : Change User Password
const changeUserPassword = asyncHandler(async (req, res) => {
  // Step 1 : Take input from user
  const { currentPassword, newPassword, confirmNewPassword } = req.body;

  // 1.1 -> Verify the data
  if (
    [currentPassword, newPassword, confirmNewPassword].some(
      (field) => !field || field.trim().length === 0
    )
  ) {
    throw new ApiError(400, "Please provide all the fields...");
  }

  // Step 2 : Verify the current password with the password in the database
  const user = await User.findById(req?.user._id);
  const isPasswordCorrect = await user.isPasswordCorrect(currentPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Incorrect Password...");
  }

  // 2.1 -> verify the newPasswords match
  if (newPassword !== confirmNewPassword) {
    throw new ApiError(400, "Passwords mismatch...");
  }

  // Step 3 : Update the password in the database
  user.password = newPassword;
  user.save({ validateBeforeSave: false });

  res.status(201).json({
    success: true,
    data: {},
    message: "Password updated successfully...",
  });
});

// Controller 8 : Update User Details
const updateUserDetails = asyncHandler(async (req, res) => {
  // Step 1 : Fetch the data that the user wants to update
  const { email, fullName } = req.body;

  // 1.1 -> Validate the data
  if ([email, fullName].some((field) => !field || field?.trim().length === 0)) {
    throw new ApiError(400, "Please provide data for all the fields...");
  }

  // 1.2 -> Let's verify that a user with same username or email does not exist in the database
  const user = await User.findOne({
    email,
  });

  console.log(user);

  if (user) {
    throw new ApiError(400, "email is already taken...");
  }

  // Step 2 : Update the data in the database
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        email: email,
        fullName: fullName,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  if (Object.keys(updatedUser).length === 0) {
    throw new ApiError(500, "Could not update user details...");
  }

  return res.status(200).json({
    success: true,
    data: updatedUser,
    message: "User details updated successfully...",
  });
});

// Controller 9 : Update User avatar
const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatar = req?.file;

  if (!avatar) {
    throw new ApiError(400, "Avatar is required...");
  }

  const avatarCloudLink = await uploadOnCloudinary(req?.user?.username, [
    avatar,
  ]);

  if (!avatarCloudLink) {
    throw new ApiError(
      500,
      "Error while uploading avatar. Please try again later..."
    );
  }

  // Write helper function to delete the old file from cloudinary
  await deleteImageOnCloudinary(req?.user?.avatarPublicId);

  const user = await User.findByIdAndUpdate(
    req?.user?._id,
    {
      $set: {
        avatar: avatarCloudLink.url,
        avatarPublicId: avatarCloudLink.public_id,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  res.status(200).json({
    success: true,
    data: user,
    message: "Avatar updated successfully...",
  });
});

// Controller 10 : Update User coverImage
const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImage = req?.file;

  if (!coverImage) {
    throw new ApiError(400, "Avatar is required...");
  }

  const coverImageCloudLink = await uploadOnCloudinary(req?.user?.username, [
    coverImage,
  ]);

  if (!coverImage) {
    throw new ApiError(
      500,
      "Error while uploading avatar. Please try again later..."
    );
  }

  // Write helper function to delete the old file from cloudinary
  await deleteImageOnCloudinary(req?.user?.coverImagePublicId);

  const user = await User.findByIdAndUpdate(
    req?.user?._id,
    {
      $set: {
        coverImage: coverImageCloudLink.url,
        coverImagePublicId: coverImageCloudLink.public_id,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  res.status(200).json({
    success: true,
    data: user,
    message: "Cover Image updated successfully...",
  });
});

// Controller 11 : Get User Channel Profile
const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError(400, "username is missing");
  }

  const channel = await User.aggregate([
    // Pipeline 1 : Find the user from the User Model
    {
      $match: {
        username: username,
      },
    },

    // Pipeline 2 : Now that we have user let's calculate the subscribers count of this user
    // How many people has subscribed to username
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },

    // Pipeline 3 : Current User Subscribed Count
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },

    // Pipeline 4 : Add the fields
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },

        subscribedToCount: {
          $size: "$subscribedTo",
        },

        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },

    // Pipeline 5 : Choosing fields to project
    {
      $project: {
        username: 1,
        email: 1,
        fullName: 1,
        avatar: 1,
        coverImage: 1,
        subscribersCount: 1,
        subscribedToCount: 1,
        isSubscribed: 1,
      },
    },
  ]);

  if (channel.length === 0) {
    throw new ApiError(400, "No data found...");
  }

  return res.status(200).json({
    message: true,
    data: channel,
    messahe: "User Channel Profile fetched successfully...",
  });
});

// Controller 12 : Get User Watch History
const getWatchHistory = asyncHandler(async (req, res) => {});

export {
  healthCheck,
  registerUser,
  loginUser,
  logoutUser,
  refreshUserTokens,
  getCurrentUser,
  changeUserPassword,
  updateUserDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
};
