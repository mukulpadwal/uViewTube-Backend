import { User } from "../models/users.model.js";

async function generateTokens(userId) {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    await User.findByIdAndUpdate(
      userId,
      {
        refreshToken,
      },
      { new: true }
    );

    return { accessToken, refreshToken };
  } catch (error) {
    console.log(`Error while generating tokens : ERROR : ${error.message}`);
    process.exit(1);
  }
}

export default generateTokens;
