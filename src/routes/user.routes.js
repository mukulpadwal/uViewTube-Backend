import { Router } from "express";
import {
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
} from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import verifyJWT from "../middlewares/auth.middleware.js";

const router = Router();

// Route 1 : health-check
// DESC : checks the working of route
router.route("/health-check").get(healthCheck);

// Route 2 : register-user
router.route("/register-user").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);

// Route 3 : login user
router.route("/login").post(loginUser);

// Route 4 : Logout user
router.route("/logout").post(verifyJWT, logoutUser);

// Route 5 : refresh-tokens
router.route("/refresh-tokens").get(refreshUserTokens);

// Route 6 : current-user
router.route("/current-user").get(verifyJWT, getCurrentUser);

// Route 7 : change-password
router.route("/change-password").post(verifyJWT, changeUserPassword);

// Route 8 : update-user-details
router.route("/update-user-details").patch(verifyJWT, updateUserDetails);

// Route 9 : update-user-avatar
router
  .route("/update-user-avatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);

// Route 10 : update-user-coverimage
router
  .route("/update-user-coverimage")
  .patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);

// Router 11 : get-channel-profile
router.route("/get-channel-profile/:username").get(verifyJWT, getUserChannelProfile);

// Router 12 : get-watch-history
router.route("/get-watch-history").get(verifyJWT, getWatchHistory);

export default router;
