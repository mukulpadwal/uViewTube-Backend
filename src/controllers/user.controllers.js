import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import { User } from "../models/users.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import generateTokens from "../utils/generateTokens.js";
import constants from "../constants.js";

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
    coverImage: coverImageCloudLink?.url ?? "",
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

export { healthCheck, registerUser, loginUser };
