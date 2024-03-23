import { Router } from "express";
import {
  healthCheck,
  registerUser,
  loginUser,
  logoutUser,
  refreshUserTokens,
} from "../controllers/user.controllers.js";
import { uploadImage } from "../middlewares/multer.middleware.js";
import verifyJWT from "../middlewares/auth.middleware.js";

const router = Router();

// Route 1 : health-check
// DESC : checks the working of route
router.route("/health-check").get(healthCheck);

// Route 2 : register-user
router.route("/register-user").post(
  uploadImage.fields([
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

// Route 6 : get-user 
// router.route("/get-user").get(verifyJWT, getCurrentUser);

export default router;
