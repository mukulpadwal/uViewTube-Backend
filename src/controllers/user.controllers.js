import asyncHandler from "../util/asyncHandler.js";
import ApiError from "../util/apiError.js";
import { User } from "../models/users.model.js";
import { uploadOnCloudinary } from "../util/cloudinary.js";

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

export { healthCheck, registerUser };
