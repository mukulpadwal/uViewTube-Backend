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

  // await uploadOnCloudinary(username, avatar);
});

export { healthCheck, registerUser };
