import { Router } from "express";
import {
  healthCheck,
  registerUser,
  loginUser,
  logoutUser,
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

// Router 4 : Logout user
router.route("/logout").post(verifyJWT, logoutUser);

export default router;
